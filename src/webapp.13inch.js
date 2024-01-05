;(function(){
//	var x = 0, y = 0;
	dimmer.onclick = function () {
		if (dimmertext.innerText == '') {
			Backstack.back();
		}
	};
	/*
	 * this messes up the nishaat pins list so it needs improvement
	 * */
	/*listener('mousewheel', function (e) {
		e.preventDefault();
		if (e.wheelDeltaX >= 1 || e.wheelDeltaX <= -1
		||	e.wheelDeltaY >= 1 || e.wheelDeltaY <= -1) {
			helpers.delayedexec('XPO.mousewheel', function () {
				x = 0, y = 0;
			}, 400);
			
			x += e.wheelDeltaX; y += e.wheelDeltaY;

			var xx = x/60, yy = y/60;

			if (xx > 1 || xx < -1) x = 0;
			if (yy > 1 || yy < -1) y = 0;

			Hooks.rununtilconsumed('XPO.mousewheel', {
				type: 'XPO.mousewheel',
				x: xx,
				y: yy,
				preventDefault: function () {
					e.preventDefault();
				},
			});
		}
	}, {passive: false});*/
})();