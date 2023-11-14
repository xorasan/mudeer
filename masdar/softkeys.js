//+ showhints press update saveto onnext onprev hfiz fasax nsee talaf actualpress
//+ uponenter uponshiftenter autoheight baidaa
/* TODO
* add .alias to support linking secondary keysets to a shortcut entry
* .row1 should be animated
* move notifications above the back button on desktop
  and they should have title desc icon
  actions can be merged into the softkeys!!
*/
/* FEATURES
<element>.on_focus_prev() triggered when K.up is pressed on an element
<element>.on_focus_next() triggered when K.dn is pressed on an element
all keyups are pd'd, fig out logic for keydowns in .press
modifiers now do work! 13 sep 2023

*/
var softkeys, K, P;
;(function(){
	K = { // key code names
		mt:	'microphonetoggle',
		sr:	'softright',
		sl:	'softleft',
		en:	'enter',
		pu:	'pageup',
		pd:	'pagedown',
		up:	'arrowup',
		dn:	'arrowdown',
		rt:	'arrowright',
		lf:	'arrowleft',
		cl:	'call',
		bs:	'backspace',
	},
	P = {
		empty: {},
		sheet: {},
		dialog: {},
		list: {},
	};

	var global_keys = ['f1', 'f2', 'f5', 'escape', K.sl, K.sr];

	var hfizM = {}, M = {}, // mapped keys
	current,
	inlongpress, lastkey, lastkeytime, repeatmode,
	index = {},
	// loop up into parents as long as each parent has [focus=1] until [removable=1]
	removableparent = function (element) {
		var parent = element.parentElement;
		if (parent.dataset.XPO.focus) {
			if (parent.dataset.XPO.removable)
				return parent;
			else // check parent's parent
				return removableparent(parent);
		}
	},
	updatekey = function (uid) {
		var parent, o = {}, classes = '', args = M[uid];
		
		if (!args) return;
		
		if (args.length === 1 || args.hidden || args.h) o.hidden = 1;
		
		var callback = args[0] || args.callback;
		var k = args.key || uid;
		
		if (callback) o.onclick = function (e) {
			var key = e ? e.key : undefined;
			callback(key, e);
		};
		
		o.XPO.name = args.name || args.n || '';
		o.XPO.label = args[1] || args.label || args.l || '';
		o.XPO.icon = args[2] || args.icon || args.i;
		o.XPO.status = args[3] || args.status || args.s;
		if (o.XPO.icon === false) {
			o.XPO.name = k;
		}
		
		if (!isarr(args)) { // only .add API
			o.XPO.key =   (args.ctrl ? 'ctrl ' : '')
						+ (args.alt ? 'alt ' : '')
						+ (args.shift ? 'shift ' : '')
						+ (args.key || uid)
						;
		}

		if ( k == K.sl	) classes = 'XPO.left'	;
		if ( k == K.en	) classes = 'XPO.center';
		if ( k == K.sr	) classes = 'XPO.right'	;
		if ( k == '*'	) classes = 'XPO.star'	;
		if ( k == '#'	) classes = 'XPO.hash'	;

		if ([K.sr, K.sl, K.en].includes(k)) {
			parent = XPO.skmain;
		} else {
			parent = XPO.skhints;
		}
		o.id = 'XPO.sk'+k;
		o.classes = classes;

		index[k] = templates.get('XPO.skbutton', parent, 0, o.id)(o);
		
		XPO.skdots.hidden = totalvisible() ? 0 : 1;

		resize();
	},
	adaaf = function (name, callback, label, icon, status) {
		var action = [];
		M[name] = M[name] || action;
		action[0] = callback === undefined ? M[name][0] : callback;
		action[1] = label === undefined ? M[name][1] : label;
		action[2] = icon === undefined ? M[name][2] : icon;
		action[3] = status === undefined ? M[name][3] : status;
		M[name] = action;
	},
	talaf = function (name) {
		M[name] = undefined;
	};
	totalvisible = function () {
		var total = 0;
		for (var i in XPO.skhints.childNodes) {
			if (XPO.skhints.childNodes.hasOwnProperty(i))
				if (!XPO.skhints.childNodes[i].hidden) total++;
		}
		return total;
	};
	
	/*
	 * putting these inside a function keeps them unique
	 * */
	P.empty = function () {
		M[K.sr] = [function () {
			Hooks.run('XPO.back');
			return 1;
		}, 0, 'XPO.iconclose'];
		M[K.bs] = [function () {
			Hooks.run('XPO.minimize');
		}];
		M['#'] = [function () {
			softkeys.showhints();
			return 1;
		}/*, '#', 'XPO.iconhelp'*/];
		softkeys.update();
	},
	
	softkeys = {
		P: P,
		K: K,
		saveto: 7,
		/* clear previous map explicitly, .map doesn't clear it by default
		 * */
		clear: function () {
			M = {};
			softkeys.update();
			backstack.set('XPO.softkeys', M);
			return softkeys;
		},
		havaf: function (name) {
			return softkeys.talaf(name);
		},
		baidaa: function (name, yes) { if (M[name]) {
			M[name][3] = yes ? 1 : undefined;
			softkeys.update();
		} },
		talaf: function (name) { // TODO deprecate, NEW remove
			if (name) {
				if (name instanceof Array) {
					name.forEach(function (n) {
						talaf(n);
					});
				} else {
					talaf(name);
				}
				softkeys.update();
				backstack.set('XPO.softkeys', M);
			}
			return softkeys;
		},
		update: function () {
			XPO.skhints.innerHTML = '';
			XPO.skmain.innerHTML = '';
			// update labels, icons etc
			if (M) for (var k in M) updatekey(k);
		},
		showhints: function () {
			delete XPO.softkeysui.dataset.XPO.hidden;
			setdata(XPO.softkeysui, 'XPO.shown', 1);
			if (!XPO.skhelp.hidden) {
				XPO.skhelp.hidden = 1;
				preferences.set(7, 1);
			}
//			XPO.skhints.hidden = 0;
			$.taxeer('XPO.softkeyshints', function () {
				popdata(XPO.softkeysui, 'XPO.shown');
				XPO.softkeysui.dataset.XPO.hidden = 1;
//				XPO.skhints.hidden = 1;
			}, 2500);
		},
		/* remember one or more actions which you can recall later
		 * you can also forget stored actions
		 * */
		hfiz: function (name) { // remember
			if (name) {
				if (name instanceof Array) {
					name.forEach(function (n) {
						softkeys.hfiz(n);
					});
				} else {
					hfizM[name] = M[name];
				}
			}
			return softkeys;
		},
		fasax: function () { // recall
			for (var i in hfizM) {
				M[i] = hfizM[i];
			}
			softkeys.update();
			return softkeys;
		},
		nsee: function () { // forget
			hfizM = {};
			return softkeys;
		},
		/*
		 * update a single key definition in M
		 * status 0normal 1selected 2disabled
		 * */
		set: function (name, callback, label, icon, status) { // TODO deprecate for add
			if (name) {
				if (isarr(name)) {
					name.forEach(function (n, i) {
						var labeli = label;
						if (isarr(label)) labeli = label[i];
						var iconi = icon;
						if (isarr(icon)) iconi = icon[i];
						if (i)
						adaaf(n, callback, name[0], iconi, status);
						else
						adaaf(n, callback);
					});
				} else {
					adaaf(name, callback, label, icon, status);
				}
				softkeys.update(name);
				backstack.set('XPO.softkeys', M);
			}
			return this;
		},
		add: function (o) { // use this instead of .set
			/* key uid is based on mods + keyname
			properties
			uid generated, you can later use it to remove keys
			n name
			h hidden
			i icon
			l label
			s status
			k key
			c cb callback
			*/
			o.callback = o.callback || o.c || o.cb;
			o.key = tolower(o.key || o.k);

			if ( isfun(o.callback) && isstr(o.key) ) {
				o.uid = (o.ctrl  ? 1 : 0) +'-'+
						(o.alt   ? 1 : 0) +'-'+
						(o.shift ? 1 : 0) +'-'+
						o.key;
				M[ o.uid ] = o;
				
				updatekey(o.uid);
				backstack.set('XPO.softkeys', M);
			}
			return this;
		},
		remove: function (uid) { // use this instead of .talaf
			this.talaf(uid);
		},
		/*
		 * preset		P.<name>
		 * callbacks	{enter: callback}
		 * */
		map: function (preset, callbacks) {
			M = Object.assign({}, M, preset);
			// also create keys if callbacks for them are provided
			if (M && callbacks) {
				for (var i in callbacks) {
					M[i] = M[i] || [];
					M[i][0] = callbacks[i];
				}
			}
			softkeys.update();
			
			// save this in the current darajah of backstack
			backstack.set('XPO.softkeys', M);
		},
		actualpress: function (k, e, longpress) {
			var pd = function () { e && e.preventDefault() };

			k = k.toLowerCase();

			if (k == 'sl') k = K.sl, pd();
			if (k == 'up') k = K.up, pd();
			if (k == 'sr') k = K.sr, pd();

			if (k == 'lf') k = K.lf, pd();
			if (k == 'en') k = K.en, pd();
			if (k == 'rt') k = K.rt, pd();

			if (k == 'cl') k = K.cl, pd();
			if (k == 'dn') k = K.dn, pd();
			if (k == 'bs') k = K.bs, pd();

			if (M && M[k] && typeof M[k][0] == 'function')
				M[k][0](k, e, e && e.type, longpress) && pd(); // prevent default if true is returned
		},
		press: function (k, e, longpress) {
			var caught, pd = function () { preventdefault(e); };
			
			kraw = k;
			k = k.toLowerCase();

			// for compat on desktop
			if (e && e.type && e.type == 'XPO.mousewheel') {
				if (e.y <= -1) k = K.up;
				if (e.y >=  1) k = K.dn;
			}
			if (k == 'f1') k = K.sl, pd();
			if (k == 'f2') k = K.sr, pd();
			if (k == 'f5' ||
					(e && e.ctrlKey && ['r', 'ر'].includes(k))
				) {
				history.go();
			}

			if ('escape' == k && !document.fullscreenElement)
				k = K.sr, pd();

			// disable google assistant
			if (k == K.mt) pd();

			var editmode = 0, a = document.activeElement, dir;
			
			// direction dependent keys
			var left_key = K.lf,
				right_key = K.rt;
			
			// TODO what's the point of this block
			if ((a instanceof HTMLTextAreaElement) || a.contentEditable == 'true') {
				if (e && e.altKey || [K.sl, K.sr].includes(k)) {
				} else {
					// BUG FIX this prevents softkey hook trigger, improve logic here
//					caught = 1;
				}
			}

			if ((a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement || a.contentEditable == 'true')
			&& a.type != 'range') {
				editmode = 1;
				if (a.contentEditable == 'true') {
					dir = translate.direction(a.innerText);
				} else {
					dir = translate.direction(a.value);
				}
				
				a.dir = dir === 1 ? 'rtl' : 'ltr';
			}
			
			if (a instanceof HTMLButtonElement) {
				if (a.dataset.XPO.remover && k == K.en) {
					var parent = removableparent(a);
					
					// first try focusing prev, if not found, focus next
					if (!focusprev(parent))
						caught = focusnext(parent);

					if (parent) parent.remove();
					
					pd();
				}
				// MERGE ?
				if ( isfun(a.on_focus_prev) && (k == K.up || k == left_key) ) {
					caught = 1;
					pd();
					a.on_focus_prev();
					return;
				}
				if ( isfun(a.on_focus_next) && (k == K.dn || k == right_key) ) {
					caught = 1;
					pd();
					a.on_focus_next();
					return;
				}
			}

			var length = 0, selectionStart = 0;

			/* TODO test left/right keys on buttons and single line inputs
			 * always allow using up/down keys to move between fields
			 * left/right should detect language direction
			 * */
			if (editmode) {
				if (a.contentEditable == 'true') {
					length = a.textContent.length;
					selectionStart = getSelection().baseOffset;
				} else {
					length = a.value.length;
					selectionStart = a.selectionStart;
				}

				var atend	= (length === selectionStart),
					atstart	= (0 === selectionStart);
				
				// TODO no modifiers helper function
				if ( atstart && (k == K.up || (k == left_key && dir !== 1) ) && !e.altKey && !e.ctrlKey && !e.shiftKey ) { // MERGE ?
					if ( isfun(a.on_focus_prev) ) { caught = 1; pd(); a.on_focus_prev(); return; }

					caught = focusprev(a), pd();
				}
				if ( atend   && (k == K.dn || (k == right_key && dir !== 1) ) && !e.altKey && !e.ctrlKey && !e.shiftKey ) { // MERGE ?
					if ( isfun(a.on_focus_next) ) { caught = 1; pd(); a.on_focus_next(); return; }

					caught = focusnext(a), pd();
				}
				else
				if (k == K.en &&  e.shiftKey && a.uponshiftenter) a.uponshiftenter(atstart, atend), pd();
				else if (k == K.en && !e.shiftKey && a.uponenter     ) a.uponenter     (atstart, atend), pd();
			}
			else if (a) {
				if ( is_navigable( a )
					|| a.parentElement.dataset.XPO.focus ) {
					if (k == K.up || k == left_key) caught = focusprev(a), pd();
					if (k == K.dn || k == right_key) caught = focusnext(a), pd();
					if (k == K.en && a.onclick) a.onclick(), pd();
				}
			}
			
			/* if text field isn't empty, disable arrow key handling
			 * K.bs is managed by KaiOS
			 * */
			if (editmode && !length) {
				if (k == K.bs) {
					if (a.dataset.XPO.removable)
						caught = focusprev(a), a.remove(), pd();
					else
						/*Hooks.run('XPO.back'), webapp.blur(), */pd();
				}
			}
			
			caught = caught || Hooks.rununtilconsumed('XPO.softkey', [k, e || {}, e && e.type, longpress]);
			if (caught) return;

			var mmm = M[kraw] || M[k];

			/* if defined key has ctrl yes; then just in that case let it through
			*/
			var let_through, callback = mmm ? mmm[0] : 0;

			var event = e || {};
			var uid = (event.ctrlKey?1:0) +'-'+ (event.altKey?1:0) +'-'+ (event.shiftKey?1:0) +'-'+ k;
			if (M[uid]) {
				mmm = M[uid];
				callback = mmm.callback;
				let_through = 1;
			}

			if ( (!editmode || e.altKey || let_through || global_keys.includes(k)) && mmm && isfun(callback)
			) {
				caught = callback(k, e, e && e.type, longpress);
				if ( caught ) pd(); // prevent default if true is returned
			} else {
				/*if (k == K.dn) {
					webapp.scrollx(40);
					pd();
				}
				if (k == K.up) {
					webapp.scrollx(-40);
					pd();
				}
				if (k == K.rt) {
					webapp.scrolltobottom();
					pd();
				}
				if (k == K.lf) {
					webapp.scrolltotop();
					pd();
				}*/
			}

			if (isundef(caught) || caught == 1) { // true|1|undef = yes; 0|false = no
				var softkey_element = elementbyid( 'XPO.sk'+k );
				if (softkey_element) {
					setdata(softkey_element, 'XPO.hawm', 1);
					$.taxeer('XPO.sk'+k, function () {
						popdata(softkey_element, 'XPO.hawm');
					}, 400);
				}
			}
		},
	};
	
	softkeys.showhints();
	softkeys.M = function () {
		return M;
	};
	
	var autoheight = function (a) {
		if (a instanceof HTMLTextAreaElement) {
			setcss(a, 'height', 0);
			if (a.scrollHeight > a.offsetHeight)
				setcss(a, 'height', a.scrollHeight+3+'px');
		}
	};
	softkeys.autoheight = autoheight;
	// TODO make repeat logic here
	var resize = function () {
		var w = innerwidth(), sl = index[K.sl], sr = index[K.sr];
		if (w > 720) {
			var ww = ((innerwidth()-590)/2);
			if (sl) setcss(sl, 'width', ww+'px');
			if (sr) setcss(sr, 'width', ww+'px');
		} else {
			if (sl) setcss(sl, 'width');
			if (sr) setcss(sr, 'width');
		}
	};
	listener('resize', function () {
		$.taxeer('XPO.resizesoftkeys', function () { resize(); }, 100);
	});
	resize();
	Hooks.set('XPO.contextmenu', function (e) {
		var a = document.activeElement;
		// BUG idk why but this can't detect .altKey
		if (a && (a instanceof HTMLInputElement
		|| a.contentEditable == 'true'
		||	a instanceof HTMLTextAreaElement) && a.type != 'range') {
			softkeys.showhints();
		} else {
			softkeys.showhints();
			return 1;
		}
	});
	Hooks.set('XPO.ready', function () {
		XPO.skhints.onclick =
		XPO.skdots.onclick = function () {
			softkeys.showhints();
		};
	});
	Hooks.set('XPO.mousewheel', function (e) {
		e && softkeys.press('', e, e.type);
	});
	Hooks.set('XPO.keyup', function (e) {
////		$.log( 'keyup', lastkey, e.key.toLowerCase() );
//
//		if (repeatmode) {
//		} else
//		if (inlongpress === e.key.toLowerCase()) {
////			$.log( 'long press' );
//			e && softkeys.press(e.key, e, e.type, inlongpress);
//		} else if (lastkey) {
////			$.log( 'short press' );
//			$.taxeer('XPO.keyup', function () {
//				e && softkeys.press(e.key, e, e.type, 0);
//			}, 40);
//		}
//		$.taxeercancel('XPO.keydownlongpress');
//		inlongpress = 0;
//		lastkey = 0;
//		repeatmode = 0;
		var a = document.activeElement;
		if ((a instanceof HTMLInputElement
		||	a instanceof HTMLTextAreaElement) && a.type != 'range') {
			var len = a.value.trim().length, yes;
			if (len) {
				var min = parseint(getattribute(a, 'min') || 0);
				var max = parseint(getattribute(a, 'max') || 0);
				if (min && len < min) a.dataset.XPO.under = 1, yes = 1;
				else delete a.dataset.XPO.under;
				if (max && len > max) a.dataset.XPO.over = 1, yes = 2;
				else delete a.dataset.XPO.over;
			} else {
				delete a.dataset.XPO.under;
				delete a.dataset.XPO.over;
			}
			
			$.taxeer('XPO.softkeysminmax', function () {
				if (yes === 1) webapp.taht3nsar('-'+(min-len));
				else if (yes === 2) webapp.taht3nsar(len+' / '+max+' +'+(len-max));
				else webapp.taht3nsar(len);
			}, 50);
			
			$.taxeer('XPO.softkeysautoheight', function () {
				autoheight(a);
			}, 100);
		} else {
		}
		Hooks.rununtilconsumed('XPO.softkey', [e.key.toLowerCase(), e || {}, e && e.type, 0]);
		preventdefault(e);
	});
	Hooks.set('XPO.keydown', function (e) {
//		$.log( 'keydown', e.key, time.now() - lastkeytime );
		if (time.now() - lastkeytime > 60 || lastkeytime === undefined || !PRODUCTION) {
			// hook.softkey also first inside .press
			e && softkeys.press(e.key, e, e.type, 0);
			
			lastkeytime = time.now();
		} else {
			preventdefault(e);
		}
//
//		if (time.now() - lastkeytime < 300) {
//			repeatmode = 1;
//		}
//		inlongpress = 0;
//		lastkey = e.key.toLowerCase();
//
//		if (repeatmode) {
//			e && softkeys.press(e.key, e, e.type, 0);
//		} else {
//			$.taxeer('XPO.keydown', function () {
//				lastkey = 0;
////				$.log( 'expired' );
//			}, 200);
//			$.taxeer('XPO.keydownlongpress', function () {
////				$.log( 'long press active' );
//				inlongpress = e.key.toLowerCase();
//			}, 400);
//		}
//		e && e.preventDefault();
	});
	Hooks.set('XPO.templateset', function (args) {
		var c = args[0],
			o = args[1],
			k = args[2],
			t = args[3];
		
		if (t === 'XPO.skbutton') {
			if (k.XPO.icon && !o.XPO.icon)
				k.XPO.icon.remove();
			
			if (!o.XPO.label && !o.XPO.icon)
				c.hidden = 1;
//			return 1; // to let sk.touch run
		}
	});
	Hooks.set('XPO.restore', function (args) {
		var oldM = backstack.get('XPO.softkeys');
		if (oldM) {
			M = Object.assign({}, oldM);
			softkeys.update();
		}
	});

	if (preferences.get(softkeys.saveto, 1)) XPO.skhelp.hidden = 1;
})();