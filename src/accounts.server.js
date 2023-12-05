var accounts;
;(function(){
	'use strict';
	
	accounts = {
	};
})();
Network.sync('accounts', 'nearby', function (response) {
	$.log( 'accounts', 'nearby', response.value );
	response.value[0].remove = 1;
	response.sync(response.value)
		  .finish();
});
