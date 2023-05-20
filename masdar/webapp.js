//+ textsize dimmer runview view views icons exit visible lavaazim header
//+ isdimmed statusbarpadding sahhar nawwam
var webapp, appname = 'APPNAME' || '',
	// to avoid missing module errors
	maxzan = maxzan || 0,
	pager = pager || 0,
	checkbox = checkbox || 0,
	preferences = preferences || 0,
	translate = translate || 0,
	rakkazawwal, focusprev, focusnext, navigables,
	LAYERTOPMOST = 3000;
;(function(){
	var doc = document, bod = doc.body, wakelockstatus, isalbixraaj;
	
	navigables = ['input', 'textarea', 'button', 'a', 'select'];
	rakkazawwal = function (e) {
		if (e) {
			var s = e.querySelector('input')
				|| e.querySelector('textarea')
				|| e.querySelector('button')
				|| e.querySelector('a')
				|| e.querySelector('select');
			
			if (s) {
				s.focus();
				webapp.scrollto(s);
				return s;
			}
		}
	},
	/* FOCUS how this works
	 * for elements inside other formating elements, set data-focus on each parent
	 * this hints to this algo to go up a parent
	 * */
	focusprev = function (element, thisone, num) {
		var orig = element, out, LV;
		num = num || 0; if (num > 100) return;
		// loop till last sibling and find smth that can be focused
		while ( element.previousElementSibling && num < 100 ) {
			++num;
			element = thisone ? element : element.previousElementSibling;
			if (isixtaf(element)) {
				// ignore all hidden elements
			} else if ( element.dataset.XPO.focus == 'XPO.list' ) {
				LV = element.listobject;
				if (LV.length()) {
					webapp.blur();
					element.focus();
					LV.last();
					LV.rakkaz(1, 1);
					out = element;
					break;
				}
			} else if ( element.dataset.XPO.focus && element.lastElementChild ) {
				out = focusprev(element.lastElementChild, 1, ++num);
				break;
			}
			else if ( navigables.includes( element.tagName.toLowerCase() ) ) {
				element.focus();
				webapp.scrollto(element);
				out = element;
				break;
			}
			if (thisone) thisone = 0; // after first run, go to the next element
		}
		if ( out ) {}
		else if ( element.dataset.XPO.focus == 1 ) {
			return focusprev( element.parentElement, 0, ++num );
		}
		else if ( element.parentElement.dataset.XPO.focus ) {
			return focusprev( element.parentElement, 0, ++num );
		} else {
			/* BUG
			 * come up with a solution for this
			 * */
//			if (!out) webapp.scrolltotop();
		}
		element.onprev && element.onprev(element);
		if (out) {
			if (orig && orig.listobject) {
				orig.listobject.deselect();
			} /*else LV && LV.selected++;*/ // to avoid a +1 jump
//			$.log( 'focusprev', out );
			return out;
		}
	};
	focusnext = function (element, thisone, num) {
		var orig = element, out, LV;
		num = num || 0; if (num > 100) return;
		// loop till first sibling and find smth that can be focused
		while ( element.nextElementSibling && num < 100 ) {
			++num;
			element = thisone ? element : element.nextElementSibling;
			if (isixtaf(element)) {
				// ignore all hidden elements
			} else if ( element.dataset.XPO.focus == 'XPO.list' ) {
				LV = element.listobject;
				if (LV.length()) {
					webapp.blur();
					element.focus();
					LV.first();
					LV.rakkaz(1, 1);
					out = element;
					break;
				}
			} else if ( element.dataset.XPO.focus && element.firstElementChild ) {
				out = focusnext(element.firstElementChild, 1, ++num);
				break;
			}
			else if ( navigables.includes( element.tagName.toLowerCase() ) ) {
				element.focus();
				webapp.scrollto(element);
				out = element;
				break;
			}
			if (thisone) thisone = 0; // after first run, go to the next element
		}
		if ( out ) {}
		else if ( element.dataset.XPO.focus == 1 ) {
			return focusnext( element.parentElement, 0, ++num );
		}
		else if ( element.parentElement.dataset.XPO.focus ) {
			return focusnext( element.parentElement, 0, ++num );
		}
		/* BUG CASE
		 * changed this to orig because i wasn't able to override this inside
		 * a listitem with an input element, on pressing down it kept replacing
		 * element with the nextsibling (see above while loop) :(
		 * more testing needed
		 * */
		orig.onnext && orig.onnext(orig);
//		element.onnext && element.onnext(element);
		if (out) {
			if (orig && orig.listobject) {
				orig.listobject.deselect();
			} /*else LV && LV.selected--;*/ // to avoid a +1 jump
//			$.log.e( 'focusnext', out );
			return out;
		}
	};

	var viewsindex = {},
		getform = function (element) {
			if (!(element instanceof HTMLElement)) return;

			var payload = {};
			var otherviews = element.querySelectorAll('[data-XPO.id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {
					
					if (otherviews[i].getvalue)
						payload[ otherviews[i].dataset.XPO.id ] = otherviews[i].getvalue();
					else
						payload[ otherviews[i].dataset.XPO.id ] = otherviews[i].value;
					// this code tries to reset the form somewhat
/*
					if (otherviews[i] instanceof HTMLSelectElement) {
						otherviews[i].value = 0;
					} 
					else if ( ['text', 'textarea'].includes(otherviews[i].type) ) {
						otherviews[i].value = '';
					}
					else {
						
					}
*/
				}
			}
			return payload;
		},
		getformkeys = function (element) {
			if (!(element instanceof HTMLElement)) return;
			
			var keys = {};
			var otherviews = element.querySelectorAll('[data-XPO.id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {

					keys[ otherviews[i].dataset.XPO.id ] = otherviews[i];

				}
			}
			return keys;
		},
		/*
		 * this version lets you setup custom callbacks for forms
		 * each call sends you three things
		 * cb(formelement, pressedbutton, payload)
		 * */
		sendform = function (element, button) {
//			$.log.s( 'dom.sendform' );
			
			var payload, keys;
			if (element) {
				payload = getform(element);
				keys = getformkeys(element);
			} else {
				element = {
					id: button.dataset.XPO.form,
				};
			}
			Hooks.run('XPO.domformdata', {
				form: element,
				button: button,
				payload: payload,
				keys: keys,
			});
		},
		setupforms = function () {
			var sendbuttons	= document.querySelectorAll('.XPO.form .XPO.send');
			for (var i in sendbuttons) {
				if ( sendbuttons.hasOwnProperty(i) ) {
					sendbuttons[i].onclick = function () {
						sendform( document.querySelector( '#'+this.dataset.XPO.form ), this );
					};
				}
			}
			var counts	= document.querySelectorAll('.XPO.form label.XPO.count');
			for (var i in counts) {
				var countlabel = counts[i];
				if ( counts.hasOwnProperty(i) ) {
					var field = countlabel.parentNode.nextElementSibling;
					field.oninput = function () {
						this.previousElementSibling.lastElementChild.innerText = (this.value || '').length;
					};
					field.oninput();
				}
			}
		};

	/*
	 * webapp features like 3inch handles linked-modules functionality example:
	 * when backstack reports darajah, 3inch updates softkeys
	 * */
	webapp = {
		visible: 1,
		isdimmed: 0,
		/*
		 * an array of features that can be check like
		 * 'feature'	in window OR
		 * 				in Navigator OR
		 * 				in navigator
		 * even if a singe one fails, an error is shown
		 * */
		lavaazim: function (inwindow) {
			inwindow = inwindow || [];
			var err;
			for (var i in inwindow) {
				var feature = inwindow[i];
				if (	feature in window
					||	feature in navigator
					||	feature in Navigator ) {
				} else {
					err = 1;
					break;
				}
			}
			if (err) {
				webapp.header( translate && translate('XPO.unsupported') );
				return 0;
			} else {
				webapp.header();
				return 1;
			}
		},
		blur: function () {
			var ae = markooz();
			ae && ae.blur();
			blur();
			return ae;
		},
		header: function (text, align) {
			if (align == 1) XPO.headerui.dataset.align = '1';
			else if (align == 2) XPO.headerui.dataset.align = '2';
			else delete XPO.headerui.dataset.align;

			if (backstack.darajah <= 1) {
				if (text) {
//					if (pager && pager.mowjood(backstack.states.view)) {
//						// defer header to pager
//						pager.matn(backstack.states.view, text);
//						return;
//					}
					if (text instanceof Array) {
						XPO.headerui.dataset.XPO.i18n = text[0];
					} else {
						delete XPO.headerui.dataset.XPO.i18n,
						XPO.headerui.innerText = text;
					}
					XPO.headerui.hidden = 0;
				} else
					delete XPO.headerui.dataset.XPO.i18n,
					XPO.headerui.innerText = '',
					XPO.headerui.hidden = 1;
			} else if (backstack.darajah === 2) {
				sheet.header(text);
			}
			translate.update();
		},
		sahhar: function (what) { // keep awake wakelock
			if (navigator && navigator.requestWakeLock) {
				webapp.nawwam();
				wakelockstatus = navigator.requestWakeLock(what||'screen');
			}
		},
		nawwam: function () { // let sleep, put to sleep, clear wakelock
			// BUG unlock doesn't work
			if (wakelockstatus && wakelockstatus.unlock) {
				try { wakelockstatus.unlock(); } catch (e) { $.log( e ); }
				wakelockstatus = 0;
			}
		},
		scrollx: function (v) {
			var se = scrollingelement();
			se.scrollTop += v;
		},
		scrolly: function (v) {
			var se = scrollingelement();
			se.scrollLeft += v;
		},
		dimmer: function (zindex, text) {
			zindex && (XPO.dimmer.style.zIndex = zindex);

			XPO.dimmer.hidden = zindex ? 0 : 1;
			webapp.isdimmed = zindex ? 1 : 0;

			if (text)
				XPO.dimmertext.hidden = 0,
				XPO.dimmertext.dataset.XPO.i18n = text;
			else
				XPO.dimmertext.hidden = 1,
				delete XPO.dimmertext.dataset.XPO.i18n,
				innerhtml(XPO.dimmertext, '');
			
			document.scrollingElement.style.overflow = zindex ? 'hidden' : '';
			translate.update(XPO.dimmer);
		},
		statusbarpadding: function (yes) {
			if (yes) {
				XPO.statusbarpadding.hidden	= 0;
				XPO.statusbarshadow.hidden	= 0;
			} else {
				XPO.statusbarpadding.hidden	= 1;
				XPO.statusbarshadow.hidden	= 1;
			}
		},
		transparency: function (yes) {
			yes = yes === undefined ? preferences && preferences.get(23, 1) : yes;
			if (yes/* || Navigator.largeTextEnabled*/) {
				document.body.dataset.XPO.transparency = 1;
			} else {
				delete document.body.dataset.XPO.transparency;
			}
		},
		textsize: function (yes) {
			yes = yes === undefined ? preferences && preferences.get(9, 1) : yes;
			if (yes/* || Navigator.largeTextEnabled*/) {
				document.body.dataset.XPO.largetext = 1;
			} else {
				delete document.body.dataset.XPO.largetext;
			}
		},
		bixraaj: function (isal) { // on exit, ask or no
			if (isal) isalbixraaj = 1;
			else isalbixraaj = 0;
		},
		exit: function () {
			if (isalbixraaj) {
				if ( confirm(xlate('XPO.sure')) ) close();
			} else close();
		},
		icons: function () {
			var elements = document.body.querySelectorAll('[data-XPO.icon]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.XPO.icon ) {
					var e = XPO.eqonaat.querySelector('#'+elements[i].dataset.XPO.icon);
					if (e)
						elements[i].innerHTML	= '<svg viewBox="0 0 48 48">'+e.cloneNode(1).innerHTML+'</svg>';
//					elements[i].innerHTML	= '<svg><use xlink:href=\'#'
//											+ elements[i].dataset.XPO.icon
//											+ '\'></use></svg>';
				}
			}
		},
		uponresize: function () {
			$.taxeer('XPO.taHjeem', function () {
				if (innerwidth() <= 320) {
					setdata(bod, 'XPO.aqil', 1);
				} else {
					popdata(bod, 'XPO.aqil');
				}
				if (innerwidth() > 320 && innerwidth() <= 640) {
					setdata(bod, 'XPO.qaleel', 1);
				} else {
					popdata(bod, 'XPO.qaleel');
				}
				if (innerwidth() > 320) {
					setdata(bod, 'XPO.qaleelah', 1);
				} else {
					popdata(bod, 'XPO.qaleelah');
				}
				if (innerwidth() > 640 && innerwidth() <= 800) {
					setdata(bod, 'XPO.wast', 1);
				} else {
					popdata(bod, 'XPO.wast');
				}
				if (innerwidth() > 640) {
					setdata(bod, 'XPO.wastah', 1);
				} else {
					popdata(bod, 'XPO.wastah');
				}
				if (innerwidth() >= 1024) {
					setdata(bod, 'XPO.tvfs', 1);
				} else {
					popdata(bod, 'XPO.tvfs');
				}
			}, 100);

			if (innerheight() <= 480) document.body.dataset.XPO.keyboardopen = 1;
			else delete document.body.dataset.XPO.keyboardopen;
		},
	};

	// prevent default behavior from changing page on dropped file
	listener('dragover', function (e) {
		$.log('dragover');
		setdata(bod, 'XPO.tahweem', 1);
		preventdefault(e);
		return false;
	});
	listener('dragleave', function (e) {
		$.log('dragleave');
//		popdata(bod, 'XPO.tahweem');
		$.taxeer('XPO.dragleave', function () {
			popdata(bod, 'XPO.tahweem');
		}, 3000);
		preventdefault(e);
		return false;
	});
	// NOTE: ondrop events WILL NOT WORK if you do not "preventDefault" in the ondragover event!
	listener('drop', function (e) {
		popdata(bod, 'XPO.tahweem');
		preventdefault(e);
		
		var f = e.dataTransfer.files;
		if (f && f.length) Hooks.run('XPO.huboot', f);

		return false;
	});

	listener('resize', function () {
		webapp.uponresize();
	});
	listener('contextmenu', function (e) {
		var yes = Hooks.rununtilconsumed('XPO.contextmenu', e);
		if (yes && e) preventdefault(e);
	});
	listener('scroll', function (e) {
		Hooks.run('XPO.scroll', document.scrollingElement.scrollTop);
	});
	listener('keyup', function (e) {
		Hooks.rununtilconsumed('XPO.keyup', e);
	});
	listener('keydown', function (e) {
		Hooks.rununtilconsumed('XPO.keydown', e);
	});
	listener('load', function (e) {
		webapp.header( xlate(appname) );
//		webapp.itlaa3( xlate('XPO.loading') );

		xlate.update();
		time && time.start();

		webapp.icons();
		webapp.uponresize();
		view.fahras();
		setupforms();

		// if maxzan is loaded, defer 'ready' to it
		if (maxzan && maxzan.badaa) {
			maxzan.badaa(function () {
				Hooks.run('XPO.ready', 1);
				backstack.main();
				XPO.loadingbox.hidden = 1;
			});
		}
		else {
			Hooks.run('XPO.ready', 1);
			$.taxeer('XPO.loadingbox', function () {
				XPO.loadingbox.hidden = 1;
			});
			backstack.main();
		}

		document.addEventListener('visibilitychange', function () {
			if (document.visibilityState === 'visible') {
				webapp.visible = 1;
				Hooks.run('XPO.visible');
			} else {
				webapp.visible = 0;
				Hooks.run('XPO.hidden');
			}
		});
		
		Hooks.run('XPO.visible');
	});
	
})();