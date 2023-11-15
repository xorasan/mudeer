/*
 * when a touchscreen is detected, this adds an option to settings that allows
 * switching between dpad and touch navigation
 * 
 * with dpad navigation, touch also emulates a dpad
 * */
//+ touchdir
;(function(){
	var x = 0, y = 0, curx = 0, cury = 0, horizontal = 0, vertical = 0,
		size = 20, sizew = 15, caught = 0, start = 0;

	var saveto = 18, settingsuid, webapptouchdir = 0;
	Hooks.set('XPO.ready', function () {
		/*if (preferences) webapptouchdir = preferences.get(saveto, 1) || 1;
		webapp.touchdir = webapptouchdir;
		
		settingsuid = settings.adaaf('XPO.webapptouchdir', function () {
			webapptouchdir = preferences.get(saveto, 1);
			webapp.touchdir = webapptouchdir;
			if (!webapptouchdir) delete document.body.dataset.XPO.align;
			return [webapptouchdir ? 'XPO.on' : 'XPO.off' ];
		}, function () {
			preferences.set(saveto, preferences.get(saveto, 1) ? 0 : 1);
		});*/
	});

	Hooks.set('XPO.keyup', function (e) {
		var k = e.key.toLowerCase();
		if (k === 'r' && e.ctrlKey)
			location.reload(), preventdefault(e);
		if (['escape', 'f11'].includes(k) && document.fullscreenElement)
			document.exitFullscreen(), preventdefault(e);
		else if (k === 'f11')
			document.firstElementChild.requestFullscreen(), preventdefault(e);
	});

	listener('touchstart', function (e) {
		if (softkeys.touchdpad) preventdefault(e);

		// TODO on more than one touches cancel all actions
		x = e.touches[0].clientX;
		y = e.touches[0].clientY;
		caught = 0;
		start = e.timeStamp;

		if (webapptouchdir) {
			if ( x / innerwidth() < 0.5 ) {
				document.body.dataset.XPO.align = 'XPO.left';
			} else {
				delete document.body.dataset.XPO.align;
			}
		}
		
		Hooks.run('XPO.navigationstart', [x, y]);
	}, { passive: false });
	listener('touchmove', function (e) {
		curx = e.touches[0].clientX,
		cury = e.touches[0].clientY,
		horizontal = curx - x,
		vertical = cury - y;

		if (horizontal < -sizew || horizontal > sizew) {
			if (horizontal > sizew)
				horizontal = 1;
			else if (horizontal < -sizew)
				horizontal = -1;
			
			if (horizontal !== 0)
				x = curx;
		} else horizontal = 0;

		if (vertical < -size || vertical > size) {
			if (vertical > size)
				vertical = 1;
			else if (vertical < -size)
				vertical = -1;
			
			if (vertical !== 0)
				y = cury;
		} else vertical = 0;
		
		if (horizontal !== 0 || vertical !== 0)
			caught = 1,
			Hooks.run('XPO.navigation', [horizontal, vertical]);
	});
	listener('touchend', function (e) {
		if (!caught) {
			if ( e.timeStamp - start > 250 ) // held for 250ms or more
				Hooks.run('XPO.navigationlongpress', [x, y, e.path, horizontal, vertical]);
			else
				Hooks.run('XPO.navigationpress', [x, y, e.path, horizontal, vertical]);
		} else
			Hooks.run('XPO.navigationend', [x, y, e.path, horizontal, vertical]);
	});
})();