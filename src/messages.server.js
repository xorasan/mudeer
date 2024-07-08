var Messages, messages,
	tbl_rsl = 'messages',
	musicmetadata = require('./deps/music-metadata');
//	codecparser = require('./deps/codec-parser').default;

;(function(){
'use strict';
var module_name = 'messages';
Messages = messages = {
	get_audio_duration: async function (data) {
		var resolve;
		var promise = new Promise(function (r) {
			resolve = r;
		});
		musicmetadata.parseBuffer(data, 0, {
			duration: true,
		}).then(function (d) {
			var duration = d.format.duration; // x.x secs
			resolve(duration);
		});
		return promise;
	},
	text2seconds: function (text) { // secs
		var c = text.length;
		return Math.ceil( c / 6 ) || 1;
	},
};
Network.intercept(module_name, async function (response) { // DISABLED
	if (response.account && 1 == 0) { // DISABLED
		var out = [], limit = 100;

		// TODO limit to messages user has access to
//		MongoDB.query(Config.database.name, tbl_mklmt, {
//			members: new RegExp(' '+response.account.uid+':'),
//		}, function (mklmt) {
//			if (mklmt.rows.length) {
//				var mstr = [];
//				mklmt.rows.forEach(function (m) {
//					mstr.push(m.uid);
//				});
				await MongoDB.query(Config.database.name, 'pops', {
					ltable: module_name,
//					$sort: { _id: -1 },
//					$limit: 20, 
					// TODO save and get using room uid as well :)
					$or: [ { updated: { $gte: response.time || 0 } }, { created: { $gte: response.time || 0 } } ]
				}, function (pops) {
					pops.rows.forEach(function ({ luid }) {
						out.push({ uid: luid, remove: -1 }); // purged completely
					});
				});
				await MongoDB.query(Config.database.name, tbl_rsl, {
//					room: { $in: mstr },
					$or: [ { updated: { $gte: response.time || 0 } }, { created: { $gte: response.time || 0 } } ]
				}, function ({ rows }) {
					rows.forEach(function (o, i) {
						var x = {};
						x.uid			= o.uid;
						x.room			= o.room;
						x.owner			= o.owner;
						x.kind			= o.kind || 0;
						if ([1, 2].includes(x.kind)) x.address = o.text;
						else x.text = o.text;
						x.remove		= o.remove;
						x.condition		= o.condition;
						x.created		= o.created;
						x.updated		= o.updated;
						out.push( x );
					});
				});

				if (out.length) response.sync(out).consumed();
				else response.finish();
//			} else response.finish();
//		});
	} else response.finish();
});
Network.get(module_name, function (response) {
	if (response.account && response.value && response.value.filter) {
		var arr = [],
			limit = 100;

		var filter = response.value.filter;
		var refined_filter = {};
		if (filter.uid) refined_filter.uid = filter.uid;
		if (filter.room) refined_filter.room = filter.room;

		MongoDB.query(Config.database.name, tbl_rsl, refined_filter, function (outcome) {
			outcome.rows.forEach(function (o, i) {
				var x = {};
				x.uid			= o.uid;
				x.room			= o.room;
				x.owner			= o.owner;
				x.kind			= o.kind || 0;
				if ([1, 2].includes(x.kind)) x.address = o.text;
				else x.text = o.text;
				x.remove		= o.remove;
				x.condition		= o.condition;
				x.created		= o.created;
				x.updated		= o.updated;
				arr.push( x );
			});
			response.get(arr).consumed();
		});
	} else response.finish();
});


})();






