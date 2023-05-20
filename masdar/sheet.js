//+ okay cancel onshow hide show index header zaahir
var sheet;
;(function(){
	var index = {}, header, container, zaahirname, ae, murakkaz;

	sheet = {
		okay: 0,
		cancel: 0,
		onshow: 0,
		zaahir: function (name) { // currently active sheet
			return zaahirname === name;
		},
		bardaa: function (v) {
			if (!container.firstElementChild) return;
			var children = Object.values(container.firstElementChild.children);
			if (v) {
				children.forEach(function (item) {
					if (getdata(item, 'XPO.focus') === 'XPO.list') {
						var l = item.listobject;
						if (l.murakkaz) {
							murakkaz = l;
							l.rakkaz();
						}
					}
				});
				setdata(container, 'XPO.bardaa', 1);
				softkeys.set(K.sl, function (e) {
					webapp.itlaa3('XPO.pleasewait');
				}, 0, 'XPO.iconhourglassempty');
				ae = webapp.blur();
			}
			else {
				softkeys.set(K.sl, function (e) {
					sheet.okay();
				}, 0, 'XPO.icondone');
				popdata(container, 'XPO.bardaa');
				if (ae) ae.focus();
				if (murakkaz) murakkaz.rakkaz(1);
			}
		},
		header: function (text) {
			if (text) {
				if (text instanceof Array) {
					header.dataset.XPO.i18n = text[0];
				} else {
					header.innerText = text;
				}
				header.hidden = 0;
			} else
				delete XPO.headerui.dataset.XPO.i18n,
				header.innerText = '',
				header.hidden = 1;
		},
		hide: function () {
			XPO.sheetui.hidden = 1;
			sheet.okay = 0;
			sheet.cancel = 0;
			zaahirname = 0;
		},
		show: function (args) {
			ae = murakkaz = 0;
			container.innerHTML = '';
			XPO.sheetui.hidden = 0;
			
			if (typeof args === 'string')
				args = {
					XPO.name: args,
				};
			
			var name		= args.XPO.name		||	args.n,
				title		= args.XPO.title	||	args.t	||	'',
				minqabl		= args.XPO.minqabl	||	args.b,
				callback	= args.XPO.callback	||	args.c,
				oncancel	= args.XPO.oncancel	||	args.x,
				ayyihaal	= args.XPO.ayyihaal||	args.a,
				init		= args.XPO.init		||	args.i,
				keys;
			
			header.innerText = title;
			
			sheet.onshow && sheet.onshow(name);
			
			var ui = index[name];
			if (ui) {
				zaahirname = name;

				var node = ui.cloneNode(true);
				if (node) {
					delete node.dataset.XPO.sheet;
					node.dataset.XPO.visiblesheet = 1;
					node.hidden = 0;
					container.appendChild(node);
					XPO.sheetui.focus();
					
					translate && translate.update( XPO.sheetui );
					Hooks.rununtilconsumed('XPO.widgets', XPO.sheetui);
					
					keys = templates.keys(container);
					
					init && init( keys );

					Hooks.rununtilconsumed('XPO.widgets', XPO.sheetui);
				}
			}
			
			if (callback)
			sheet.okay = function (args) {
				callback && callback( args || keys );
				ayyihaal && ayyihaal( args || keys );
				webapp.blur();
				Hooks.run('XPO.back');
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
				Hooks.run('XPO.back');
			};
		},
		get: function (name) {
			if (!name) return container.firstElementChild;
			else return index[name];
		},
		index: function (parent) {
			var elements = (parent||document.body).querySelectorAll('[data-XPO.sheet]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.XPO.sheet ) {
					elements[i].hidden = 1;
					index[ elements[i].dataset.XPO.sheet ] = elements[i];
				}
			}
			return index;
		},
	};
	Hooks.set('XPO.ready', function () {
		sheet.index();
		var mfateeh = templates.keys(XPO.sheetui);
		header = mfateeh.XPO.header;
		container = mfateeh.XPO.container;
	});

})();