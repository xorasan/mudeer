//+ jama3 mowjood muntaxab intaxab matn yameen shimaal ixtafasmaa izharasmaa
//+ ixtaf izhar
var pager;
;(function(){
	var cn = pagermowjoodah.childNodes, zaahir = 1,
		pagerasmaa = 1, settingsuid, saveto = 17;
	
	var resize = function () {
		setcss(pagerui, 'height', pagermowjoodah.offsetHeight+'px');
	};
	
	pager = {
		ixtaf: function () {
			pagerui.hidden = 1;
			delete document.body.dataset.pager;
			zaahir = 0;
		},
		izhar: function () {
			pagerui.hidden = 0;
			document.body.dataset.pager = pagerasmaa ? 2 : 1;
			zaahir = 1;
		},
		ixtafasmaa: function () {
			for (var i = 0; i < cn.length; ++i) {
				var keys = templates.keys(cn[i]);
				keys.name.hidden = 1;
			}
			if (zaahir) document.body.dataset.pager = 1;
			else delete document.body.dataset.pager;
			resize();
		},
		izharasmaa: function () {
			for (var i = 0; i < cn.length; ++i) {
				var keys = templates.keys(cn[i]);
				keys.name.hidden = 0;
			}
			if (zaahir) document.body.dataset.pager = 2;
			else delete document.body.dataset.pager;
			resize();
		},
		mowjood: function (ism) {
			for (var i = 0; i < cn.length; ++i) {
				if (cn[i].dataset.ism == ism)
					return cn[i];
			}
			return false;
		},
		matn: function (ism, matn) {
			var o = pager.mowjood(ism);
			if (o) {
				var keys = templates.keys(o);
				if (matn !== undefined) keys.label.hidden = 0;
				else keys.label.hidden = 1;
				innertext(keys.label, matn);
			}
		},
		intaxab: function (ism, ishtaghal) {
			for (var i = 0; i < cn.length; ++i) {
				if (cn[i].dataset.ism == ism) {
					attribute(cn[i], 'selected', 1);
					if (ishtaghal) cn[i].click(), scrollintoview(cn[i]);
				} else {
					attribute(cn[i], 'selected', 0);
				}
			}
		},
		muntaxab: function () { // selected
			for (var i = 0; i < cn.length; ++i) {
				if (getattribute(cn[i], 'selected')) return cn[i];
			}
			return false;
		},
		yameen: function () {
			var m = pager.muntaxab();
			if (m && zaahir && backstack.darajah <= 1) {
				var sibl = nextsibling(m);
				if (sibl) pager.intaxab(sibl.dataset.ism, 1);
				// else if firstsibling()
			}
		},
		shimaal: function () {
			var m = pager.muntaxab();
			if (m && zaahir && backstack.darajah <= 1) {
				var sibl = prevsibling(m);
				if (sibl) pager.intaxab(sibl.dataset.ism, 1);
				// else if lastsibling()
			}
		},
		safaa: function () {
			innertext(pagermowjoodah, '');
		},
		jama3: function (ism, eqonah, ismzaahiri) {
			var clone = pager.mowjood(ism);
			if (clone) {
				templates.set(clone, {
					name: ismzaahiri || ism,
					icon: eqonah,
				}, 'pagerzir');
			} else {
				clone = templates.get('pagerzir', pagermowjoodah)({
					name: ismzaahiri || ism,
					icon: eqonah,
				});
			}
			var keys = templates.keys(clone);
			keys.name.hidden = !pagerasmaa;
			clone.dataset.ism = ism;
			clone.dataset.ismzaahiri = ismzaahiri || ism;
			clone.onclick = function () {
				if (ism == 'main') {
					if (backstack.darajah > 0) backstack.back(); else backstack.main();
				} else {
					Hooks.run('view', ism);
				}
			};
			
			resize();
		},
	};
	Hooks.set('backstackview', function (args) {
		if (pager.mowjood(backstack.states.view)) {
			pager.intaxab(backstack.states.view);
		}
	});
	Hooks.set('restore', function (darajah) {
		if (darajah === 0 && backstack.states.main) {
			pager.intaxab('main');
		}
	});
	Hooks.set('softkey', function (args) {
		var a = args[0], e = args[1];
		var yes;
		if (e.ctrlKey) {
			if (a == K.pd) yes = 1;
			if (a == K.pu) yes = 1;
		}
		if (e.ctrlKey && e.type == 'keyup') {
			if (a == K.pd) pager.yameen(), yes = 1;
			if (a == K.pu) pager.shimaal(), yes = 1;
		}
		if (yes) return 1;
	});
	Hooks.set('ready', function (darajah) {
		if (preferences) pagerasmaa = preferences.get(saveto, 1) || pagerasmaa;
		
		settingsuid = settings.adaaf('pagerasmaa', function () {
			pagerasmaa = preferences.get(saveto, 1);
			if (pagerasmaa) pager.izharasmaa(); else pager.ixtafasmaa();
			return [pagerasmaa ? 'on' : 'off' ];
		}, function () {
			preferences.set(saveto, preferences.get(saveto, 1) ? 0 : 1);
		}, 'icontab');

		pager.izhar();
//		pager.jama3('main');
//		pager.intaxab('main');
	});
})();