//+ taxeer taxeercancel
// thu 01 oct 2020 you can recall the same taxeer by calling the first arg
;(function (){
	/*
	 * takes a function with a unique name, if a function with this name is
	 * provided again, it delays the exec of that function by a few ms
	 * 
	 * calling without fn will just clear the timeout on that id
	 * */
	var taxeeraat = {};
	$.taxeercancel = function (id) {
		clearTimeout(taxeeraat[id]);
	};
	$.taxeer = function (id, fn, customdelay, nofurtherdelay) {
		customdelay = customdelay || 300;

		// continue exec without adding to its delay
		if ( nofurtherdelay && taxeeraat[id] ) return;
		
		if ( taxeeraat[id] ) {
			clearTimeout( taxeeraat[id] );
			taxeeraat[id] = undefined;
		}
		
		if ( typeof fn === 'function' ) {
			taxeeraat[id] = setTimeout( function () {
				fn(function () {
					$.taxeer(id, fn, customdelay, nofurtherdelay);
				});
				
				// cleanup to trigger garbage collection, save memory :)
				taxeeraat[id] = undefined;
			}, customdelay );
		}
	};

})();
