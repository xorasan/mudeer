var Accounts;
;(function(){
'use strict';
var module_name = 'accounts';
Accounts = {
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
	export_account: function ({ uid, ruid, name, displayname, status, created, updated }) {
		var account = { uid, ruid, name, displayname, status, created, updated };
		return account;
	},
};
Network.get(module_name, async function (response) {
	if (!response.account) { response.finish(); return; } // not signed in

	try {
		if (response.value && response.value.filter) {
			try {
				var accounts = await Accounts.query( response.value.filter );
				accounts.forEach(function (o, i) {
					accounts[i] = Accounts.export_account(o);
				});
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
Network.get('accounts', 'all', function (response) {
	MongoDB.query(Config.database.name, tbl_hsbt, {}, function (result) {
		var refined = [];
		result.rows.forEach(function (o, i) {
			refined.push( Accounts.export_account(o) );
		});
		response.get(refined)
				.finish();
	});
});
Network.sync('accounts', 'nearby', function (response) {
	$.log( 'accounts', 'nearby', response.value );
	response.value[0].remove = 1;
	response.sync(response.value)
		  .finish();
});

})();
