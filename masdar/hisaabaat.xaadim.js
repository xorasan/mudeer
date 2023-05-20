var hisaabaat;
;(function(){
	'use strict';
	
	hisaabaat = {
	};
})();
shabakah.waaqat('XPO.hisaabaat', 'XPO.qareeb', function (jawaab) {
	$.log( 'XPO.hisaabaat', 'XPO.qareeb', jawaab.qadr );
	jawaab.qadr[0].havaf = 1;
	jawaab.waaqat(jawaab.qadr)
		  .intahaa();
});
