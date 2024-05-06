//icons hourglassempty
var Sheet, sheet,
	sheet_ready	= 'sheet-ready',
	sheet_done	= 'sheet-done',
	sheet_cancel= 'sheet-cancel',
	sheet_anyway= 'sheet-anyway'
	;
;(function(){
	var index = {}, header, container, active_sheet_name, active_sheet_uid, active_args, active_keys, new_list,
		active_data, before_okay, debug_sheet,
		ae, murakkaz;

	Sheet = sheet = {
		okay: 0,
		cancel: 0,
		onshow: 0,
		zaahir: function (name) { // currently active sheet TODO deprecate
			return active_sheet_name === name;
		},
		is_active: function (name) {
			return active_sheet_name === name;
		},
		get_active: function () {
			return active_sheet_name;
		},
		get_active_uid: function () {
			return active_sheet_uid;
		},
		get_active_title: function () {
			return header.innerText;
		},
		set_data: function (o) {
			active_data = o;
		},
		get_data: function () {
			return active_data;
		},
		get_title: function () {
			return header.innerText;
		},
		set_title: function (text) {
			return this.header(text);
		},
		bardaa: function (v) {
			if (!container.firstElementChild) return;
			var children = Object.values(container.firstElementChild.children);
			if (v) {
				children.forEach(function (item) {
					if (getdata(item, 'focus') === 'list') {
						var l = item.listobject;
						if (l.murakkaz) {
							murakkaz = l;
							l.rakkaz();
						}
					}
				});
				setdata(container, 'bardaa', 1);
				softkeys.set(K.sl, function (e) {
					webapp.itlaa3('pleasewait');
				}, 0, 'iconhourglassempty');
				ae = webapp.blur();
			}
			else {
				softkeys.set(K.sl, function (e) {
					sheet.okay();
				}, 0, 'icondone');
				popdata(container, 'bardaa');
				if (ae) ae.focus();
				if (murakkaz) murakkaz.rakkaz(1);
			}
		},
		header: function (text) {
			if (text) {
				if (isarr(text)) {
					header.dataset.i18n = text[0];
				} else {
					header.innerText = text;
				}
				header.hidden = 0;
			} else {
				delete headerui.dataset.i18n;
				header.innerText = '';
				header.hidden = 1;
			}
		},
		hide: function () {
			if (debug_sheet) $.log.w( 'Sheet hide' );
			sheetui.hidden = 1;
			sheet.okay = 0;
			sheet.cancel = 0;
			active_sheet_name	=
			active_sheet_uid	=
			active_args			=
			active_keys			=
			new_list			=
			before_okay			= undefined;
		},
		set_before_okay: function (cb) {
			before_okay = cb;
		},
		show: function (args) {
			ae = murakkaz = 0;
			container.innerHTML = '';
			sheetui.hidden = 0;
			
			if (typeof args === 'string')
				args = {
					name: args,
				};
			
			active_args = args;
			this.set_data();
			
			var name		= args.name		||	args.n,
				title		= args.title	||	args.t	||	'',
				uid			= args.uid		||	args.u,
				minqabl		= args.minqabl	||	args.before_okay	||	args.b,
				callback	= args.callback	||	args.c,
				oncancel	= args.oncancel	||	args.x,
				ayyihaal	= args.ayyihaal	||	args.a,
				init		= args.init		||	args.i,
				keys;
			
			name = name || 'list_sheet';
			new_list; // passed as 3rd arg to hooks
			
			args.n = args.name = name;
			args.u = args.uid = uid;
			
			header.innerText = title;
			
			sheet.onshow && sheet.onshow(name);
			
			var ui = index[name];
			if (ui) {
				active_sheet_name = name;
				active_sheet_uid = uid;

				var node = ui.cloneNode(true);
				if (node) {
					delete node.dataset.sheet;
					node.dataset.visiblesheet = 1;
					node.hidden = 0;
					container.appendChild(node);
					sheetui.focus();
					
					translate && translate.update( sheetui );
					Hooks.rununtilconsumed('widgets', sheetui);
					
					active_keys = keys = templates.keys(container);

					if (name == 'list_sheet') {
						new_list = list( keys.list ).listitem( 'list_sheet_item' ).idprefix( 'list_sheet_item' );
						new_list.after_set = function (o, c, k) {
							if (o.count) izhar(k.count_tag); else ixtaf(k.count_tag);
						};
						init && init( keys, uid, args, new_list );

						var original_callback = callback;
						callback = function () {
							if (isfun(original_callback)) original_callback(new_list);
						};
					} else {
						// optimally, your module should reconstruct a sheet using the entire Backstack state
						init && init( keys, uid, args );
					}
					
					// TODO transition modules to use this method to (re)construct sheets
					Hooks.run(sheet_ready, args, keys, new_list);

					Hooks.rununtilconsumed('widgets', sheetui);
				}
			}
			
//			if (callback)
			var original_okay = function () {
				callback && callback( args || keys );
				ayyihaal && ayyihaal( args || keys );
				// TODO transition modules to use this method to (re)construct sheets
				Hooks.run(sheet_done, args, keys, new_list);
				Hooks.run(sheet_anyway, args, keys, new_list);

				Webapp.blur();
				Hooks.run('back');
			};
			Sheet.okay = function () {
				if (isfun(before_okay)) {
					Sheet.bardaa(1);
					minqabl(args || keys, function (args) {
						original_okay(args || keys);
					});
				} else {
					original_okay();
				}
			};
//			else
//			Sheet.okay = 0;
			
			Sheet.bardaa();
			if (isfun(minqabl)) {
				Sheet.okay = function (args) {
					Sheet.bardaa(1);
					minqabl(args || keys, function (args) {
						original_okay(args || keys);
					});
				};
			}

			Sheet.cancel = function () {
				oncancel && oncancel( args || keys );
				ayyihaal && ayyihaal( args || keys );
				// TODO transition modules to use this method to (re)construct sheets
				Hooks.run(sheet_cancel, args, keys, new_list);
				Hooks.run(sheet_anyway, args, keys, new_list);

				Webapp.blur();
				Hooks.run('back');
			};
		},
		get: function (name) {
			if (!name) return container.firstElementChild;
			else return index[name];
		},
		index: function (parent) {
			var elements = (parent||document.body).querySelectorAll('[data-sheet]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.sheet ) {
					elements[i].hidden = 1;
					index[ elements[i].dataset.sheet ] = elements[i];
				}
			}
			return index;
		},
	};
	Hooks.set('ready', function () {
		Sheet.index();
		var mfateeh = templates.keys(sheetui);
		header = mfateeh.header;
		container = mfateeh.container;
	});
	Hooks.set('backstacksheet', function (args) {
		Webapp.dimmer(400);
		Softkeys.clear();
		if (args.callback || args.c) {
			Softkeys.set(K.sl, function () {
				Sheet.okay && Sheet.okay();
			}, 0, 'icondone');
		}
		Softkeys.set(K.sr, function () {
			Sheet.cancel && Sheet.cancel();
		}, 0, 'iconarrowback');
		Sheet.show(args);
//		Softkeys.showhints();
	});
	Hooks.set('backstack-crumbs', function (crumbs) {
		if (!crumbs.is_sheet) {
			if (!isundef(active_sheet_uid)) { // a sheet was active previously
				// we dont trigger the Sheet.cancel function because it's deprecated
				Hooks.run(sheet_cancel, active_args, active_keys, new_list);
				Hooks.run(sheet_anyway, active_args, active_keys, new_list);
			}
			Sheet.hide(); // clear active sheet name and uid + okay/cancel funcs
			Webapp.blur();
		}
	});

})();

// TODO deprecate this, if name is omitted, Sheet.show now has the same behavior
function open_list_sheet(args, init, callback) { // string, fn( list ), fn( )
	var name, uid;
	if (typeof args === 'string')
		args = {
			name: args,
		};
	var new_list;
	Backstack.sheet({
		n: 'list_sheet', // TODO make this default if no n, add searchbox
		t: name,
		u: args.u || args.uid,
		i: function (k) {
			new_list = list( k.list ).listitem( 'list_sheet_item' ).idprefix( 'list_sheet_item' );
			new_list.after_set = function (o, c, k) {
				if (o.count) izhar(k.count_tag); else ixtaf(k.count_tag);
			};
			if (isfun(init)) init(new_list);
		},
		c: function () {
			if (isfun(callback)) callback(new_list);
		}
	});
}

