//+ jama3 mowjood muntaxab intaxab matn yameen shimaal ixtafasmaa izharasmaa
//+ ixtaf izhar
var pager;
;(function(){
	var cn = XPO.pagermowjoodah.childNodes, zaahir = 1,
		pagerasmaa = 1, settingsuid, saveto = 17;
	
	var resize = function () {
		setcss(XPO.pagerui, 'height', XPO.pagermowjoodah.offsetHeight+'px');
	};
	
	pager = {
		ixtaf: function () {
			XPO.pagerui.hidden = 1;
			delete document.body.dataset.XPO.pager;
			zaahir = 0;
		},
		izhar: function () {
			XPO.pagerui.hidden = 0;
			document.body.dataset.XPO.pager = pagerasmaa ? 2 : 1;
			zaahir = 1;
		},
		ixtafasmaa: function () {
			for (var i = 0; i < cn.length; ++i) {
				var keys = templates.keys(cn[i]);
				keys.XPO.name.hidden = 1;
			}
			if (zaahir) document.body.dataset.XPO.pager = 1;
			else delete document.body.dataset.XPO.pager;
			resize();
		},
		izharasmaa: function () {
			for (var i = 0; i < cn.length; ++i) {
				var keys = templates.keys(cn[i]);
				keys.XPO.name.hidden = 0;
			}
			if (zaahir) document.body.dataset.XPO.pager = 2;
			else delete document.body.dataset.XPO.pager;
			resize();
		},
		mowjood: function (ism) {
			for (var i = 0; i < cn.length; ++i) {
				if (cn[i].dataset.XPO.ism == ism)
					return cn[i];
			}
			return false;
		},
		matn: function (ism, matn) {
			var o = pager.mowjood(ism);
			if (o) {
				var keys = templates.keys(o);
				if (matn !== undefined) keys.XPO.label.hidden = 0;
				else keys.XPO.label.hidden = 1;
				innertext(keys.XPO.label, matn);
			}
		},
		intaxab: function (ism, ishtaghal) {
			for (var i = 0; i < cn.length; ++i) {
				if (cn[i].dataset.XPO.ism == ism) {
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
				if (sibl) pager.intaxab(sibl.dataset.XPO.ism, 1);
				// else if firstsibling()
			}
		},
		shimaal: function () {
			var m = pager.muntaxab();
			if (m && zaahir && backstack.darajah <= 1) {
				var sibl = prevsibling(m);
				if (sibl) pager.intaxab(sibl.dataset.XPO.ism, 1);
				// else if lastsibling()
			}
		},
		safaa: function () {
			innertext(XPO.pagermowjoodah, '');
		},
		jama3: function (ism, eqonah, ismzaahiri) {
			var clone = pager.mowjood(ism);
			if (clone) {
				templates.set(clone, {
					XPO.name: ismzaahiri || ism,
					XPO.icon: eqonah,
				}, 'XPO.pagerzir');
			} else {
				clone = templates.get('XPO.pagerzir', XPO.pagermowjoodah)({
					XPO.name: ismzaahiri || ism,
					XPO.icon: eqonah,
				});
			}
			var keys = templates.keys(clone);
			keys.XPO.name.hidden = !pagerasmaa;
			clone.dataset.XPO.ism = ism;
			clone.dataset.XPO.ismzaahiri = ismzaahiri || ism;
			clone.onclick = function () {
				if (ism == 'XPO.main') {
					if (backstack.darajah > 0) backstack.back(); else backstack.main();
				} else {
					Hooks.run('XPO.view', ism);
				}
			};
			
			resize();
		},
	};
	Hooks.set('XPO.backstackview', function (args) {
		if (pager.mowjood(backstack.states.view)) {
			pager.intaxab(backstack.states.view);
		}
	});
	Hooks.set('XPO.restore', function (darajah) {
		if (darajah === 0 && backstack.states.main) {
			pager.intaxab('XPO.main');
		}
	});
	Hooks.set('XPO.softkey', function (args) {
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
	Hooks.set('XPO.ready', function (darajah) {
		if (preferences) pagerasmaa = preferences.get(saveto, 1) || pagerasmaa;
		
		settingsuid = settings.adaaf('XPO.pagerasmaa', function () {
			pagerasmaa = preferences.get(saveto, 1);
			if (pagerasmaa) pager.izharasmaa(); else pager.ixtafasmaa();
			return [pagerasmaa ? 'XPO.on' : 'XPO.off' ];
		}, function () {
			preferences.set(saveto, preferences.get(saveto, 1) ? 0 : 1);
		});

		pager.izhar();
//		pager.jama3('XPO.main');
//		pager.intaxab('XPO.main');
	});
})();