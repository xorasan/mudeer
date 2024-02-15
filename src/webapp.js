var Webapp, webapp, appname = 'APPNAME' || '',
	// to avoid missing module errors
	Offline = Offline || 0,
	pager = pager || 0,
	Pager = Pager || 0,
	checkbox = checkbox || 0,
	preferences = preferences || 0,
	translate = translate || 0,
	// deprecate rakkazawwal
	rakkazawwal, focus_first_element, focusprev, focusnext, navigables, is_navigable,
	LAYERTOPMOST = 3000;
;(function(){
	var doc = document, bod = doc.body, wakelockstatus, isalbixraaj;
	
	navigables = ['input', 'textarea', 'button', 'a', 'select'];
	is_navigable = function (e) {
		return navigables.includes(e.tagName.toLowerCase()) || e.contentEditable == 'true';
	};
	focus_first_element = rakkazawwal = function (e, scroll) {
		if (e) {
			// TODO 
			var s = e.querySelector('input, textarea, button, a, select, [contenteditable]');
			
			if (s) {
				s.focus();
				if (scroll) webapp.scrollto(s);
				return s;
			}
		}
	};
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
			} else if ( element.dataset.focus == 'list' ) {
				LV = element.listobject;
				if (LV.length()) {
					webapp.blur();
					element.focus();
					LV.last();
					LV.rakkaz(1, 1);
					out = element;
					break;
				}
			} else if ( element.dataset.focus && element.lastElementChild ) {
				out = focusprev(element.lastElementChild, 1, ++num);
				break;
			}
			else if ( is_navigable( element ) ) {
				element.focus();
//				webapp.scrollto(element);
				out = element;
				break;
			}
			if (thisone) thisone = 0; // after first run, go to the next element
		}
		if ( out ) {}
		else if ( element.dataset.focus == 1 ) {
			return focusprev( element.parentElement, 0, ++num );
		}
		else if ( element.parentElement.dataset.focus ) {
			return focusprev( element.parentElement, 0, ++num );
		} else {
			/* BUG
			 * come up with a solution for this
			 * */
//			if (!out) webapp.scrolltotop();
		}

		// BUG when landing on this element using keyup arrowup, this function gets triggered
		// EXPECTATION this should only get triggered if this element is already focussed ig
		// NAMING is horrible here, it really should be after_focus_prev or something
		if (markooz() === element) {
			element.onprev && element.onprev(element);
		}

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
			} else if ( element.dataset.focus == 'list' ) {
				LV = element.listobject;
				if (LV.length()) {
					webapp.blur();
					element.focus();
					LV.first();
					LV.rakkaz(1, 1);
					out = element;
					break;
				}
			} else if ( element.dataset.focus && element.firstElementChild ) {
				out = focusnext(element.firstElementChild, 1, ++num);
				break;
			}
			else if ( is_navigable( element ) ) {
				element.focus();
//				webapp.scrollto(element);
				out = element;
				break;
			}
			if (thisone) thisone = 0; // after first run, go to the next element
		}
		if ( out ) {}
		else if ( element.dataset.focus == 1 ) {
			return focusnext( element.parentElement, 0, ++num );
		}
		else if ( element.parentElement.dataset.focus ) {
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

	var viewsindex = {}, header_keys,
		getform = function (element) {
			if (!(element instanceof HTMLElement)) return;

			var payload = {};
			var otherviews = element.querySelectorAll('[data-id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {
					
					if (otherviews[i].getvalue)
						payload[ otherviews[i].dataset.id ] = otherviews[i].getvalue();
					else
						payload[ otherviews[i].dataset.id ] = otherviews[i].value;
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
			var otherviews = element.querySelectorAll('[data-id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {

					keys[ otherviews[i].dataset.id ] = otherviews[i];

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
					id: button.dataset.form,
				};
			}
			Hooks.run('domformdata', {
				form: element,
				button: button,
				payload: payload,
				keys: keys,
			});
		},
		setupforms = function () {
			var sendbuttons	= doc.querySelectorAll('.form .send');
			for (var i in sendbuttons) {
				if ( sendbuttons.hasOwnProperty(i) ) {
					sendbuttons[i].onclick = function () {
						sendform( doc.querySelector( '#'+this.dataset.form ), this );
					};
				}
			}
			var counts	= doc.querySelectorAll('.form label.count');
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
	Webapp = webapp = {
		visible: 1,
		isdimmed: 0,
		/* an array of features that can be check like
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
				Webapp.header( translate && translate('unsupported') );
				return 0;
			} else {
				Webapp.header();
				return 1;
			}
		},
		blur: function () {
			var ae = markooz();
			ae && ae.blur();
			blur();
			return ae;
		},
		header: function (text, align, original_keys) {
			// if text is [text] assumes i18n; unless it has at least two elements
			
			var header_icon, header_title = text, header_subtitle = '';
			if (isarr(text) && text.length >= 2) {
				header_title	= text[0];
				header_subtitle	= text[1];
				header_icon		= text[2];
			}
			
			var keys = original_keys || header_keys;
			var title = keys.title;
			var subtitle = keys.subtitle;
			var header = keys.header;
			var icon = keys.icon;
			
			if (align == 1) header.dataset.align = '1';
			else if (align == 2) header.dataset.align = '2';
			else delete header.dataset.align;

//			if (backstack.darajah <= 1) {
				if (text) {
//					if (pager && pager.mowjood(backstack.states.view)) {
//						// defer header to pager
//						pager.matn(backstack.states.view, text);
//						return;
//					}
					if (header_title instanceof Array && header_title[0]) {
						title.dataset.i18n = header_title[0];
					} else {
						delete title.dataset.i18n,
						innertext(title, header_title || '');
					}
					if (header_subtitle instanceof Array && header_subtitle[0]) {
						subtitle.dataset.i18n = header_subtitle[0];
					} else {
						delete subtitle.dataset.i18n,
						innertext(subtitle, header_subtitle || '');
					}
					header.hidden = 0;
				} else {
					delete title.dataset.i18n;
					title.innerText = '';
					header.hidden = 1;
				}
				
				if (isstr(header_icon) && header_icon.length) {
					if (header_icon.startsWith('/')) {
						innerhtml(icon, '<img src="'+header_icon+'" />');
					} else {
						var e = icons.querySelector('#'+header_icon);
						if (e) {
							innerhtml(icon, '<svg viewBox="0 0 48 48">'+e.cloneNode(1).innerHTML+'</svg>');
						}
					}
				} else {
					innerhtml(icon, '');
				}
				
				if (!original_keys) this.header(text, align, tall_header_keys);
//			} else if (backstack.darajah === 2) {
//				sheet.header(text);
//			}
			translate.update();
			
			document.title = title.innerText + ( subtitle.innerText ? (' - ' + subtitle.innerText) : '' );
		},
		sahhar: function (what) { // keep awake wakelock TODO convert to english
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
			zindex && (dimmer.style.zIndex = zindex);

			dimmer.hidden = zindex ? 0 : 1;
			webapp.isdimmed = zindex ? 1 : 0;

			if (text)
				dimmertext.hidden = 0,
				dimmertext.dataset.i18n = text;
			else
				dimmertext.hidden = 1,
				delete dimmertext.dataset.i18n,
				innerhtml(dimmertext, '');
			
			doc.scrollingElement.style.overflow = zindex ? 'hidden' : '';
			translate.update(dimmer);
		},
		statusbarpadding: function (yes) { // TODO deprecate
			if (yes) {
				statusbarpadding.hidden	= 0;
				statusbarshadow.hidden	= 0;
			} else {
				statusbarpadding.hidden	= 1;
				statusbarshadow.hidden	= 1;
			}
		},
		status_bar_padding: function (yes) {
			this.statusbarpadding(yes);
		},
		transparency: function (yes) {
			yes = yes === undefined ? preferences && preferences.get(23, 1) : yes;
			if (yes/* || Navigator.largeTextEnabled*/) {
				doc.body.dataset.transparency = 1;
			} else {
				delete doc.body.dataset.transparency;
			}
		},
		textsize: function (yes) {
			yes = yes === undefined ? preferences && preferences.get(9, 1) : yes;
			if (yes/* || Navigator.largeTextEnabled*/) {
				doc.body.dataset.largetext = 1;
			} else {
				delete doc.body.dataset.largetext;
			}
		},
		bixraaj: function (isal) { // on exit, ask or no
			if (isal) isalbixraaj = 1;
			else isalbixraaj = 0;
		},
		exit: function () {
			if (isalbixraaj) {
				if ( confirm(xlate('sure')) ) close();
			} else close();
		},
		icons: function () {
			var elements = doc.body.querySelectorAll('[data-icon]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.icon ) {
					var e = icons.querySelector('#'+elements[i].dataset.icon);
					if (e)
						elements[i].innerHTML	= '<svg viewBox="0 0 48 48">'+e.cloneNode(1).innerHTML+'</svg>';
//					elements[i].innerHTML	= '<svg><use xlink:href=\'#'
//											+ elements[i].dataset.icon
//											+ '\'></use></svg>';
				}
			}
		},
		uponresize: function () {
			$.taxeer('webappresize', function () {
				if (innerwidth() <= 320) {
					setdata(bod, 'aqil', 1);
				} else {
					popdata(bod, 'aqil');
				}
				if (innerwidth() > 320 && innerwidth() <= 640) {
					setdata(bod, 'qaleel', 1);
				} else {
					popdata(bod, 'qaleel');
				}
				if (innerwidth() > 320) {
					setdata(bod, 'qaleelah', 1);
				} else {
					popdata(bod, 'qaleelah');
				}
				if (innerwidth() > 640 && innerwidth() <= 800) {
					setdata(bod, 'wast', 1);
				} else {
					popdata(bod, 'wast');
				}
				if (innerwidth() > 640) {
					setdata(bod, 'wastah', 1);
				} else {
					popdata(bod, 'wastah');
				}
			}, 100);

			if (innerheight() <= 480) doc.body.dataset.keyboardopen = 1;
			else delete doc.body.dataset.keyboardopen;
			
			$.taxeer('webapp-on-scroll', function () {
				on_scroll();
			});
		},
	};

	Webapp.get_tall_screen_height = function () {
		return tallscreenpadding.offsetHeight;
	};
	Webapp.get_header_height = function () {
		return headerui.offsetHeight;
	};
	var previous_tall_height;
	function on_scroll() {
		var height = tallscreenpadding.offsetHeight * .75;
		var percent = doc.scrollingElement.scrollTop / height;

		if (previous_tall_height != innerheight()) {
			if (innerheight() < 600)
				percent = 1;
			else
				percent = 0;
		}

		previous_tall_height = innerheight();
		
		if (percent > 1 || Webapp.is_minimal()) {
			percent = 1;
			ixtaf(tallheaderui);
		} else {
			izhar(tallheaderui);
		}
		var header_pct = percent * .8;
		if (header_pct >= .8) header_pct = 1;
		headerui.style.opacity = header_pct;

		var tall_pct = (1 - percent) * .8;
		if (tall_pct >= .8) tall_pct = 1;
		tallheaderui.style.opacity = tall_pct;
		tallheaderui.style.paddingTop = (12 * (1 - percent))+'vh';
	}
	Webapp.on_scroll = on_scroll;
	Webapp.header_sticky = function (yes) {
		if (yes) setdata(headerui, 'sticky', 1);
		else popdata(headerui, 'sticky');
	};

	var home_views = ['main'];
	Webapp.get_home_views = function () {
		return home_views.concat([]);
	};
	Webapp.add_home_view = function (name) {
		if (isarr(name)) {
			name.forEach(function (o) {
				Webapp.add_home_view(o)
			});
		} else if (!home_views.includes(name)) {
			home_views.push(name);
		}
	};
	Webapp.remove_home_view = function (name) {
		home_views.splice( home_views.indexOf(name), 1 );
	};
	Webapp.is_home_view = function (name) {
		return Webapp.get_home_views().includes(name);
	};
	Webapp.is_at_home = function () {
		return backstack.darajah === 0 && view.is_active( home_views );
	};

	Webapp.ask_on_exit = webapp.bixraaj;

	var status_dom_keys;
	Webapp.itlaa3 = function (text, time) {
		status_dom_keys = status_dom_keys || Templates.keys(webapp_status_ui);
		// TODO add .title support
		var element = status_dom_keys.text;
		if (text) {
			if (text instanceof Array) {
				element.dataset.i18n = text[0];
				translate.update(itlaa3);
			} else {
				delete element.dataset.i18n,
				element.innerText = text;
			}
			webapp_status_ui.hidden = 0;

			if (innerwidth() > 1024) webapp_status_ui.style.right = '-20px';
			else webapp_status_ui.style.right = '';

			$.taxeer('webapp_status_animation', function () {
				webapp_status_ui.style.right = '';
			}, 100);
			$.taxeer('webapp_status', function () {
				if (innerwidth() > 1024) webapp_status_ui.style.right = '-20px';
				$.taxeer('webapp_status_final', function () {
					webapp.itlaa3();
				}, 100);
			}, time||3000);
		} else {
			delete element.dataset.i18n,
			element.innerText = '',
			webapp_status_ui.hidden = 1;
		}
	};
	Webapp.status = webapp.itlaa3;
	// TODO notify


	// hint for modules to minimize screen space usage
	// TODO report percentage when toggling for animation
	var minimal_views = [];
	Webapp.apply_minimal_view = function () {
		if (Webapp.is_minimal()) {
			setdata(bod, 'minimal', 1);
		} else {
			popdata(bod, 'minimal', 1);
		}
	};
	Webapp.get_minimal_views = function () {
		return minimal_views.concat([]);
	};
	Webapp.add_minimal_view = function (name) {
		if (isarr(name)) {
			name.forEach(function (o) {
				Webapp.add_minimal_view(o)
			});
		} else if (!minimal_views.includes(name)) {
			minimal_views.push(name);
		}
		Webapp.apply_minimal_view();
		on_scroll();
	};
	Webapp.remove_minimal_view = function (name) {
		minimal_views.splice( minimal_views.indexOf(name), 1 );
		Webapp.apply_minimal_view();
		on_scroll();
	};
	Webapp.is_minimal = function () {
		return view.is_active( minimal_views );
	};
	
	// DOM Viewport settings #viewportsettings
	// width=device-width,interactive-widget=resizes-content,user-scalable=no,initial-scale=1
	var viewport_config = {};
	function update_viewport() {
		var str = [];
		str.push( 'width='+(viewport_config.width || 'device-width') );
		str.push( 'interactive-widget='+(viewport_config.resize_rule || 'resizes-content') );
		str.push( 'user-scalable='+(viewport_config.scalable || 'no') );
		str.push( 'initial-scale='+(viewport_config.scale || '1') );
		if (viewport_config.fit)
			str.push( 'viewport-fit='+(viewport_config.fit || 'contain') );
		viewportsettings.content = str.join(',');
	}
	Webapp.viewport_width		= function (v) { viewport_config.width			= v; update_viewport(); };
	Webapp.viewport_height		= function (v) { viewport_config.height			= v; update_viewport(); };
	Webapp.viewport_resize_rule	= function (v) { viewport_config.resize_rule	= v; update_viewport(); };
	Webapp.viewport_scalable	= function (v) { viewport_config.scalable		= v; update_viewport(); };
	Webapp.viewport_scale		= function (v) { viewport_config.scale			= v; update_viewport(); };
	Webapp.viewport_fit			= function (v) { viewport_config.fit			= v; update_viewport(); };

	Hooks.set('restore', function (args) {
		$.taxeer('webapp-on-scroll', function () {
			on_scroll();
		});
	});
	Hooks.set('viewready', function (args) {
		Webapp.apply_minimal_view();
		$.taxeer('webapp-on-scroll', function () {
			on_scroll();
		});
	});

	// prevent default behavior from changing page on dropped file
	listener('dragover', function (e) {
		//$.log('dragover');
		setdata(bod, 'tahweem', 1);
		preventdefault(e);
		return false;
	});
	listener('dragleave', function (e) {
		//$.log('dragleave');
//		popdata(bod, 'tahweem');
		$.taxeer('dragleave', function () {
			popdata(bod, 'tahweem');
		}, 3000);
		preventdefault(e);
		return false;
	});
	// NOTE: ondrop events WILL NOT WORK if you do not "preventDefault" in the ondragover event!
	listener('drop', function (e) {
		popdata(bod, 'tahweem');
		preventdefault(e);
		
		var f = e.dataTransfer.files;
		if (f && f.length) {
			Hooks.run('huboot', f);
		}
		Hooks.run('dropped', e.dataTransfer);

		return false;
	});

	listener('resize', function () {
		Webapp.uponresize();
	});
	listener('contextmenu', function (e) {
		var yes = Hooks.rununtilconsumed('contextmenu', e);
		if (yes && e) preventdefault(e);
	});
	listener('scroll', function (e) {
		Hooks.run('scroll', doc.scrollingElement.scrollTop);
		on_scroll();
	});
	listener('scrollend', function (e) {
		Hooks.run('scrollend', doc.scrollingElement.scrollTop);
		return;
		var offset_height = tallscreenpadding.offsetHeight;
		var height = offset_height * .75;
		var percent = doc.scrollingElement.scrollTop / height;
		if (percent >= 0.4 && percent < 1.6) {
			doc.scrollingElement.scrollTop = 1 * offset_height;
		} else if (percent > 0.1 && percent < 0.4) {
			doc.scrollingElement.scrollTop = 0;
		}
	});
	listener('keyup', function (e) {
		Hooks.rununtilconsumed('keyup', e);
	});
	listener('keydown', function (e) {
		Hooks.rununtilconsumed('keydown', e);
	});
	listener('load', function (e) {
		header_keys = templates.keys(headerui);
		tall_header_keys = templates.keys(tallheaderui);

		Webapp.header( xlate(appname) );
//		Webapp.status( xlate('loading') );

		xlate.update();
		time && time.start();

		webapp.icons();
		webapp.uponresize();
		view.fahras();
		setupforms();
		
		doc.title = 'APPNAME';

		// if Offline is loaded, defer 'ready' to it
		if (Offline && Offline.init) {
			Offline.init(function () {
				Hooks.run('ready', 1);
				Backstack.main(2);
				loadingbox.hidden = 1;
			});
		}
		else {
			Hooks.run('ready', 1);
			$.taxeer('loadingbox', function () {
				loadingbox.hidden = 1;
			});
			Backstack.main(2);
		}

		$.taxeer('webapp-on-scroll', function () {
			on_scroll();
		}, 10);

		doc.addEventListener('visibilitychange', function () {
			if (doc.visibilityState === 'visible') {
				webapp.visible = 1;
				Hooks.run('visible');
			} else {
				webapp.visible = 0;
				Hooks.run('hidden');
			}
		});
		
		Hooks.run('visible');
	});
	
})();













