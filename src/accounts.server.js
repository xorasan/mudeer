var Accounts;
;(function(){
	'use strict';
	
	Accounts = {
	};
})();
Network.get('accounts', 'all', function (response) {
	MongoDB.query(Config.database.name, tbl_hsbt, {}, function (result) {
		var refined = [];
		result.rows.forEach(function (o, i) {
			refined.push({
				uid: o.uid,
				name: o.name,
				displayname: o.displayname,
				created: o.created,
				updated: o.updated,
				status: o.status,
			});
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
