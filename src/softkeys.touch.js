//+ touchdpad
;(function(){
	var saveto = 16, settingsuid, locked = 0,
		edgestart = 0, // -1 left, 0 center, 1 right
		edgeend = 0, lastitem, lamsahbar,
		softkeystouchdpad = 1; // 1 hor, 2 vert
	Hooks.set('XPO.ready', function () {
		if (preferences) softkeystouchdpad = preferences.get(saveto, 1) || 1;
		softkeys.touchdpad = softkeystouchdpad;
		
		settingsuid = settings.adaaf('XPO.softkeystouchdpad', function () {
			softkeystouchdpad = preferences.get(saveto, 1);
			softkeys.touchdpad = softkeystouchdpad;
			return [softkeystouchdpad ? 'XPO.on' : 'XPO.off' ];
		}, function () {
			preferences.set(saveto, preferences.get(saveto, 1) ? 0 : 1);
		});
	});
	Hooks.set('XPO.navigationstart', function (args) {
		locked = 0; // free direction lock
		if (args[0] > innerwidth(-60)) edgestart = 1;
		else if (args[0] < 60) edgestart = -1;
		else edgestart = 0;
	});
	Hooks.set('XPO.navigation', function (args) {
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
	Hooks.set('XPO.navigationend', function (args) {
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
	Hooks.set('XPO.navigationpress', function (args) {
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
					popdata(lastitem, 'XPO.lamsah');
					lastitem = 0;
				}
				setdata(item, 'XPO.lamsah', 1);
				lastitem = item;
				$.taxeer('XPO.sklamsah', function () {
					if (lastitem) {
						popdata(lastitem, 'XPO.lamsah');
						lastitem = 0;
					}
				}, 300);
			}
		});
		if (args[1] > innerheight(-60)) {
			if (softkeystouchdpad) doclick(args[2]);
		} else
		if (iswithinelement(args, XPO.skhints) || isbutton) {
			if (softkeystouchdpad) doclick(args[2]);
			softkeys.showhints();
		}
		else if (softkeystouchdpad) {
			if (!XPO.skhints.hidden) softkeys.showhints();
			softkeys.press(K.en);
		}
	});
	Hooks.set('XPO.navigationlongpress', function (args) {
		softkeys.showhints();
	});

	/* TAJREEBI lamsah bar yameen
	 * when touch inside the bar, pop it in
	 * whatever button is under the pointer, make its label appear next to it
	 * */
	
	var lamsahbarimtahan = function () {
		
	};
	
	listener(XPO.skhints, ['touchstart'/*, 'mousedown'*/], function (e) {
		preventdefault(e);
		// when scrolled, raycast is off by scroll height
		lamsahbar = [e.touches[0].pageX, e.touches[0].pageY-scrollingelement().scrollTop];
	});
	listener(XPO.skhints, ['touchmove'/*, 'mousemove'*/], function (e) {
		if (lamsahbar) {
			lamsahbar = [e.touches[0].pageX, e.touches[0].pageY-scrollingelement().scrollTop];
			var ch = XPO.skhints.children, el,
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
						if (path[j] != el) popdata(ch[i], 'XPO.hawm');
					}
				}
				setdata(el, 'XPO.hawm', 1);
				softkeys.showhints();
			}
		}
	});
	listener(XPO.skhints, ['touchend', 'touchcancel'/*, 'mouseup', 'mouseleave'*/], function (e) {
		var ch = XPO.skhints.children, path;
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
				popdata(ch[i], 'XPO.hawm');
			}
		}
		lamsahbar = 0;
	});
	
	/*Hooks.set('XPO.templateset', function (args) {
		var c = args[0], // clone
			o = args[1],
			k = args[2],
			t = args[3];
		
		if (t === 'XPO.skbutton') {
			listener(c, ['touchmove', 'mouseenter'], function () {
				if (lamsahbar) {
					lamsahbar = c;
					$.log(c.id);
					
					setdata(c, 'XPO.hawm', 1);
				}
			});
		}
	});*/


})();