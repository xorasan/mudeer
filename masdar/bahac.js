//+ fahras an3ash kitabat
/* TODO
 * search should also report where in the results the pressedon result is
 * this way, only that one can be updated
 * also provide a way to update that very result by using the reported index uid
 * */
var bahaclist, bahac;
;(function(){
	var keys, kitabat = 0, oldresults,
	nazzaf = function (string) {
		return (string||'').toLowerCase();
	};
	
	bahac = {
		kitabat: function (v) { // no edit button
			kitabat = v;
		},
		an3ash: function (select) { // refresh
			if (backstack.states.view === 'XPO.bahac') {
				$.taxeer('XPO.bahac', function () {
					var value = nazzaf(keys.XPO.searchbox.value);
					if (value.length === 0)
						bahac.fahras([]);
					else Hooks.run( 'XPO.bahac', value );
				}, 350);
				if (select)
					bahaclist.select();
			}
		},
		fahras: function (results) {
			results = results || oldresults || [];
			
			bahaclist.popall();
			bahaclist.message(results.length ? undefined : translate('XPO.nosearchresults') );
			
			results.forEach(function (item, i) {
				bahaclist.set(item);
			});
			
			if (backstack.states.view === 'XPO.bahac') {
				webapp.header( results.length ? (results.length+' '+translate('XPO.results'))
								: translate('XPO.search') );
				bahaclist.select();
			}
			
			oldresults = results;
		},
	};

	Hooks.set('XPO.ready', function () {
		keys = view.mfateeh('XPO.bahac');
		keys.XPO.searchbox.oninput = function () {
			bahac.an3ash();
		};

		bahaclist = list( keys.XPO.list ).idprefix('XPO.bahac');
		
		bahaclist.uponpastend = bahaclist.uponpaststart = function () {
			keys.XPO.searchbox.focus();
			return 1;
		};
		bahaclist.beforeset = function (item, id) {
			return item;
		};
		bahaclist.onpress = function (item, key, uid) {
			Hooks.run('XPO.bahaconpress', [item, key, uid]);
		};
	});
	Hooks.set('XPO.viewready', function (args) {
		switch (args.XPO.name) {
			case 'XPO.main':
				softkeys.set('*', function () {
					Hooks.run('XPO.view', 'XPO.bahac');
					return 1;
				}, '*', 'XPO.iconsearch');
				break;
			case 'XPO.bahac':
				webapp.header( translate('XPO.search') );
				
//				keys.XPO.searchbox.value = '';
				if (!oldresults || (oldresults && oldresults.length === 0))
					keys.XPO.searchbox.focus();
//				bahaclist.selected = -1;
				bahac.fahras();
				
				softkeys.list.basic(bahaclist);

				softkeys.set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], function (k) {
					bahaclist.press(k);
				});

				if (kitabat)
					softkeys.set(K.sl, function () {
						bahaclist.press(K.sl);
					}, 0, 'XPO.iconedit');

				softkeys.set('*', function () {
					bahaclist.selected = -1;
					bahaclist.select();
					keys.XPO.searchbox.focus();
					return 1;
				}, '*', 'XPO.iconsearch');
				break;
		}
	});
})();