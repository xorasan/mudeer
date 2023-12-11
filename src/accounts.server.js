var Accounts;
;(function(){
	'use strict';
	
	Accounts = {
	};
})();
Network.get('accounts', 'all', function (response) {
	MongoDB.query(Config.database.name, tbl_hsbt, {}, function (result) {
		response.get(result.rows)
				.finish();
	});
});
Network.sync('accounts', 'nearby', function (response) {
	$.log( 'accounts', 'nearby', response.value );
	response.value[0].remove = 1;
	response.sync(response.value)
		  .finish();
});
