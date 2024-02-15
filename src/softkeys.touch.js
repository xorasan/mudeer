//+ touchdpad
;(function(){
	var saveto = 16, settingsuid, locked = 0,
		edgestart = 0, // -1 left, 0 center, 1 right
		edgeend = 0, lastitem, lamsahbar,
		softkeystouchdpad = 1; // 1 hor, 2 vert
	Hooks.set('ready', function () {
		if (preferences) softkeystouchdpad = preferences.get(saveto, 1) || 1;
		softkeys.touchdpad = softkeystouchdpad;
		
		settingsuid = settings.adaaf('softkeystouchdpad', function () {
			softkeystouchdpad = preferences.get(saveto, 1);
			softkeys.touchdpad = softkeystouchdpad;
			return [softkeystouchdpad ? 'on' : 'off' ];
		}, function () {
			preferences.set(saveto, preferences.get(saveto, 1) ? 0 : 1);
		});
	});
	Hooks.set('navigationstart', function (args) {
		locked = 0; // free direction lock
		if (args[0] > innerwidth(-60)) edgestart = 1;
		else if (args[0] < 60) edgestart = -1;
		else edgestart = 0;
	});
	Hooks.set('navigation', function (args) {
		if (!locked || locked === 2) {
			if (args[0] > 0) { // right
				if (softkeystouchdpad && !edgestart) softkeys.press(K.rt);
				locked = 2;
			}
			if (args[0] < 0) { // left
				if (softkeystouchdpad && !edgestart) softkeys.press(K.lf);
				locked = 2;
			}
		}
		
		if (!locked || locked === 1) {
			if (args[1] > 0) { // down
				if (softkeystouchdpad && !edgestart) softkeys.press(K.dn);
				locked = 1;
			}
			if (args[1] < 0) { // up
				if (softkeystouchdpad && !edgestart) softkeys.press(K.up);
				locked = 1;
			}
		}
	});
	var doclick = function (path) {
		if (path)
		for (var i = 0; i < path.length; ++i) {
			if (path[i].onclick) {
				path[i].onclick();
				path[i].blur();
				break;
			}
			if (path[i] instanceof HTMLButtonElement) {
				path[i].click();
				path[i].blur();
				break;
			}
		}
	};
	Hooks.set('navigationend', function (args) {
		if (!softkeystouchdpad) {
			// logic handled in navigation above
			if (args[3] < 0) {
				pager && pager.yameen();
			}
			if (args[3] > 0) {
				pager && pager.shimaal();
			}
		} else
		if (pager && edgestart) { // started on an edge
			edgeend = 0;
			if (args[0] > innerwidth(-60)) edgeend = 1;
			else if (args[0] < 60) edgeend = -1;
			else edgeend = 0;
			
			if (edgestart !== edgeend) { // ended on a diff edge
				if (edgestart === 1) pager.yameen(); // right
				else if (edgestart === -1) pager.shimaal(); // left
			}
		}
	});
	Hooks.set('navigationpress', function (args) {
		var isbutton = 0;
		if (isarr(args[2]))
		args[2].forEach(function (item) {
			if (item instanceof HTMLButtonElement
			||	item instanceof HTMLInputElement
			||	item instanceof HTMLTextAreaElement
			) {
				isbutton = 1;
				item.focus();
				if (lastitem) {
					popdata(lastitem, 'lamsah');
					lastitem = 0;
				}
				setdata(item, 'lamsah', 1);
				lastitem = item;
				$.taxeer('sklamsah', function () {
					if (lastitem) {
						popdata(lastitem, 'lamsah');
						lastitem = 0;
					}
				}, 300);
			}
		});
		if (args[1] > innerheight(-60)) {
			if (softkeystouchdpad) doclick(args[2]);
		} else
		if (iswithinelement(args, skhints) || isbutton) {
			if (softkeystouchdpad) doclick(args[2]);
//			Softkeys.showhints();
		}
		else if (softkeystouchdpad) {
			if (!skhints.hidden) Softkeys.showhints();
			Softkeys.press(K.en);
		}
	});
	Hooks.set('navigationlongpress', function (args) {
		Softkeys.showhints();
	});

	/* TAJREEBI lamsah bar yameen
	 * when touch inside the bar, pop it in
	 * whatever button is under the pointer, make its label appear next to it
	 * */
	
	var lamsahbarimtahan = function () {
		
	};
	
	listener(skhints, ['touchstart'/*, 'mousedown'*/], function (e) {
		preventdefault(e);
		// when scrolled, raycast is off by scroll height
		lamsahbar = [e.touches[0].pageX, e.touches[0].pageY-scrollingelement().scrollTop];
	});
	listener(skhints, ['touchmove'/*, 'mousemove'*/], function (e) {
		if (lamsahbar) {
			lamsahbar = [e.touches[0].pageX, e.touches[0].pageY-scrollingelement().scrollTop];
			var ch = skhints.children, el,
				path;
			if (e.type == 'touchmove') {
				path = raycast(lamsahbar[0], lamsahbar[1]);
			}
			for (var i in ch) {
				if ( ch.hasOwnProperty(i) ) {
					for (j in path) {
						if (path[j] == ch[i]) el = ch[i];
					}
				}
			}
			if (el) {
				for (var i in ch) {
					if ( ch.hasOwnProperty(i) ) {
						if (path[j] != el) popdata(ch[i], 'hawm');
					}
				}
				setdata(el, 'hawm', 1);
//				Softkeys.showhints();
			}
			setdata(skhints, 'held', 1);
		}
	});
	listener(skhints, ['touchend', 'touchcancel'/*, 'mouseup', 'mouseleave'*/], function (e) {
		var ch = skhints.children, path;
		if (e.type == 'touchend' && lamsahbar) {
			path = raycast(lamsahbar[0], lamsahbar[1]);
		}
		for (var i in ch) {
			if ( ch.hasOwnProperty(i) ) {
				for (j in path) {
					if (path[j] == ch[i]) {
						if (ch[i] && e.type == 'touchend') {
							ch[i].click();
						}
					}
				}
			}
		}
		for (var i in ch) {
			if ( ch.hasOwnProperty(i) ) {
				popdata(ch[i], 'hawm');
			}
		}
		popdata(skhints, 'held');
		lamsahbar = 0;
	});
	
	/*Hooks.set('templateset', function (args) {
		var c = args[0], // clone
			o = args[1],
			k = args[2],
			t = args[3];
		
		if (t === 'skbutton') {
			listener(c, ['touchmove', 'mouseenter'], function () {
				if (lamsahbar) {
					lamsahbar = c;
					$.log(c.id);
					
					setdata(c, 'hawm', 1);
				}
			});
		}
	});*/


})();