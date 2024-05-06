var Accounts;
;(function(){
'use strict';
var module_name = 'accounts', debug_accounts = 0;

Accounts = {
	username_exists: async function (name, uid) { // provide a uid to exclude self
		if (!isstr(name)) { $.log.e(' Accounts username_exists expects name as string '); return; }
		var filter = { name };
		if (uid) { filter.uid = { $ne: uid }; }
		var { rows } = await MongoDB.query(Config.database.name, module_name, filter);
		return (rows && rows.length === 1);
	},
	query: async function (filter) { // by uid or @name or filter, autodetects
		var on_resolve, on_error, refined_filter = {};

		if (isstr(filter.uid)) {
			var uid = filter.uid;
			if (uid.startsWith('@')) {
				refined_filter.name = uid.slice(1);
			} else {
				refined_filter.uid = uid;
			}
		} else if (isstr(filter.name)) {
			refined_filter.name = filter.name;
		} else if (isstr(filter.uids)) {
			refined_filter.uid = { $in: filter.uids };
		}

		MongoDB.query(Config.database.name, module_name, refined_filter, function (outcome) {
			on_resolve( outcome.rows );
		});
		
		return new Promise(function (resolve, error) {
			on_resolve = resolve;
			on_error = error;
		});
	},
	validate_account: async function ({ uid, ruid, name, password, displayname, remove, owner, status, created, updated }) {
		owner = to_bool_num(owner);

		if (isstr(name)) {
			name = name.slice(0, 64);
		} else {
			name = '';
		}
		// uniqueness
		name = generate_alias(name);
		if (name.length) {
			if ( await Accounts.username_exists(name, uid) ) {
				name = name+'-'+MongoDB.uid();
				// TODO deliver error back to client
			}
		}
		
		if (isstr(displayname)) {
			displayname = displayname.slice(0, 64);
		} else {
			displayname = '';
		}

		var account = { uid, ruid, name, displayname, remove, owner, status, created, updated };

		// password
		if (isstr(password) && password.length) {
			var hashed = await Sessions.hash_password( password );
			account.hash = hashed.hash;
			account.salt = hashed.salt;
			if (debug_accounts) $.log('new password for ', o.name, password, hashed);
		}

		return account;
	},
	export_account: function ({ uid, ruid, name, displayname, hash, salt, owner, remove, status, created, updated }, response) {
		owner = to_bool_num(owner);
		remove = to_num(remove);
		
		var account = { uid, ruid, name, displayname, remove, owner, status, created, updated };

		// TODO create in Access has_access for server
		if (response && response.account && response.account.owner) { // sensitive info
			if (!hash || !salt) account.no_password = 1;
		}

		return account;
	},
};
Network.intercept(module_name, async function (response) {
	// only on broadcast channel when signed in after first sync
	if (response.account && response.broadcast && response.time) {
		var yes, out = [], time = response.time;

		var pops = await MongoDB.query(Config.database.name, 'pops', {
			ltable: module_name,
			$or: [ { updated: { $gte: time || 0 } }, { created: { $gte: time || 0 } } ]
		});

		pops.rows.forEach(function ({ luid }) {
			out.push({ uid: luid, remove: -1 }); // purged completely
		});

		var outcome = await MongoDB.query(Config.database.name, module_name, {
			$or: [ { updated: { $gte: time || 0 } }, { created: { $gte: time || 0 } } ]
			// TODO limit
		});
		
		var out_messages = [];
		
		for await (var o of outcome.rows) {
			out.push( Accounts.export_account(o) );
		}

		if (out.length) {
			response.sync(out);
			yes = 1;
		}
		if (yes) {
			response.consumed();
		} else
			response.finish();

	} else response.finish();
});
Network.get(module_name, async function (response) {
	if (!response.account) { response.finish(); return; } // not signed in

	try {
		if (response.value && response.value.filter && response.value.filter.uid) {
			try {
				var filter = response.value.filter;
				var uid = response.value.filter.uid;
				var accounts = await Accounts.query( filter );
				accounts.forEach(function (o, i) {
					accounts[i] = Accounts.export_account(o, response);
				});
				if (accounts.length == 0) {
					accounts = [
						{ uid, remove: -1 } // hint purged
					];
				}
				response.get( accounts );
			} catch (e) {
				$.log.e( e );
				response.get( false );
			}
		} else {
			response.get( false );
		}
		
		response.finish();
	} catch (e) {
		response.get(false)
				.finish();
	}
});
Network.sync(module_name, async function (response) {
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!response.account.owner) { response.finish(); return; } // not an owner
	if (!value) { response.finish(); return; } // received nothing
	
	if (isarr(value)) {
		var arr = [], pops = [], out = [], log_out_uids = [];
		for await (var o of value) {
			if (o.remove)
				pops.push( o.uid );
			else {
				o = await Accounts.validate_account(o);
				arr.push( o );
				if (o.hash) log_out_uids.push( o.uid );
			}
		}

		var removed = await MongoDB.pop( Config.database.name, module_name, pops );

		for await (const uid of removed.uids) {
			if (!log_out_uids.includes(uid)) log_out_uids.push( uid );
			out.push({ uid, remove: -1 }); // -1 truly purged, signal client to remove
		}

		var added = await MongoDB.set( Config.database.name, module_name, arr );

		for await (var o of added.rows) {
			var full = await MongoDB.get( Config.database.name, module_name, { uid: o.uid } );
			if (full) Object.assign(o, full);
			out.push( Accounts.export_account(o, response) );
		}
		
		// end sessions for accounts whose passwords were changed
		for await (var uid of log_out_uids) {
			var removed_count = await Sessions.remove_all_for_account(uid);
			if (removed_count) $.log( 'removed', removed_count, 'sessions for ', uid );
		}

		if (out.length) {
			Polling.finish(); // end all polls
			response.sync(out);
		}

		response.finish();

	} else response.finish();
});

Network.get(module_name, 'range', async function (response) {
	var value = response.value, start = 0, end = 25, outcome, out = [];
	if (value) {
		start = value.start;
		end = value.end;
		if (end > start) {
			outcome = await MongoDB.query(Config.database.name, module_name, {
				$sort: { created: -1 },
				$skip: start,
				$limit: end-start,
			});
		}
		if (outcome) {
			outcome.rows.forEach(function (o) {
				out.push(Accounts.export_account(o, response));
			});
		}
	}
	response.get(out).finish();
});
Network.get(module_name, 'count', async function (response) {
	var outcome = await MongoDB.count(Config.database.name, module_name);
	response.get(outcome.count).finish();
});


})();
