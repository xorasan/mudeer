//+ okay cancel onshow hide show index header zaahir
var sheet;
;(function(){
	var index = {}, header, container, active_sheet_name, ae, murakkaz;

	sheet = {
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
		get_active_title: function () {
			return header.innerText;
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
				if (text instanceof Array) {
					header.dataset.i18n = text[0];
				} else {
					header.innerText = text;
				}
				header.hidden = 0;
			} else
				delete headerui.dataset.i18n,
				header.innerText = '',
				header.hidden = 1;
		},
		hide: function () {
			sheetui.hidden = 1;
			sheet.okay = 0;
			sheet.cancel = 0;
			active_sheet_name = 0;
		},
		show: function (args) {
			ae = murakkaz = 0;
			container.innerHTML = '';
			sheetui.hidden = 0;
			
			if (typeof args === 'string')
				args = {
					name: args,
				};
			
			var name		= args.name		||	args.n,
				title		= args.title	||	args.t	||	'',
				minqabl		= args.minqabl	||	args.b,
				callback	= args.callback	||	args.c,
				oncancel	= args.oncancel	||	args.x,
				ayyihaal	= args.ayyihaal||	args.a,
				init		= args.init		||	args.i,
				keys;
			
			header.innerText = title;
			
			sheet.onshow && sheet.onshow(name);
			
			var ui = index[name];
			if (ui) {
				active_sheet_name = name;

				var node = ui.cloneNode(true);
				if (node) {
					delete node.dataset.sheet;
					node.dataset.visiblesheet = 1;
					node.hidden = 0;
					container.appendChild(node);
					sheetui.focus();
					
					translate && translate.update( sheetui );
					Hooks.rununtilconsumed('widgets', sheetui);
					
					keys = templates.keys(container);
					
					init && init( keys );

					Hooks.rununtilconsumed('widgets', sheetui);
				}
			}
			
			if (callback)
			sheet.okay = function (args) {
				callback && callback( args || keys );
				ayyihaal && ayyihaal( args || keys );
				webapp.blur();
				Hooks.run('back');
			};
			else
			sheet.okay = 0;
			
			sheet.bardaa();
			if (isfun(minqabl)) {
				var oldokay = sheet.okay;
				sheet.okay = function (args) {
					sheet.bardaa(1);
					minqabl(args || keys, function (args) {
						oldokay(args || keys);
					});
				};
			}

			sheet.cancel = function (args) {
				oncancel && oncancel( args || keys );
				ayyihaal && ayyihaal( args || keys );
				webapp.blur();
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
		sheet.index();
		var mfateeh = templates.keys(sheetui);
		header = mfateeh.header;
		container = mfateeh.container;
	});

})();

function open_list_sheet(name, init, callback) { // string, fn( list ), fn( )
	var new_list;
	backstack.sheet({
		n: 'list_sheet', // TODO make this default if no n, add searchbox
		t: name,
		i: function (k) {
			new_list = list( k.list ).listitem( 'list_sheet_item' ).idprefix( 'list_sheet_item' );
			if (isfun(init)) init(new_list);
		},
		c: function () {
			if (isfun(callback)) callback(new_list);
		}
	});
}
