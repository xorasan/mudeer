//+ izhar
var aqrabaa;
;(function(){
	'use strict';
	
	var favlist, oldresults;
	
	aqrabaa = {
		izhar: function (obj) {
			if (obj)
			Hooks.run('sheet', {
				n: 'XPO.aqrabaa',
				t: obj.XPO.displayname,
				c: function (k) {
					$.log( k );
				},
				i: function (k) {
					innertext(k.XPO.displayname, obj.XPO.displayname);
					innertext(k.XPO.age, obj.XPO.age);
					innertext(k.XPO.username, obj.XPO.username);
				},
			});
		},
		iftah: function (item, key, uid) { // open aqrabaa
			item && Hooks.run('XPO.sheet', {
				n: 'XPO.qurb',
				t: item.XPO.displayname,
				i: function (k) {
					k.XPO.note.focus();
				},
				c: function (k) {
					
				},
			});
		},
		fahras: function (results) {
			results = results || oldresults || [];
			
			favlist.popall();
			favlist.message(results.length ? undefined : translate('XPO.noaqrabaa') );
			
			results.forEach(function (item, i) {
				favlist.set(item, i);
			});
			
			if (backstack.states.view === 'XPO.aqrabaa') {
				webapp.header( results.length ? (results.length+' '+translate('XPO.aqrabaa'))
								: translate('XPO.noaqrabaa') );
				favlist.select();
			}
			
			oldresults = results;
		},
	};
	
	Hooks.set('XPO.ready', function () {
		var mfateeh = view.mfateeh('XPO.aqrabaa');

		favlist = list( mfateeh.XPO.list ).idprefix('XPO.fav')
					.listitem('XPO.profileitem').grid(3);
		
		favlist.beforeset = function (item, id) {
			return item;
		};
		favlist.onpress = function (item, key, uid) {
			aqrabaa.iftah(item, key, uid);
		};
	});
	Hooks.set('XPO.viewready', function (args) {
		if (args.XPO.name == 'XPO.aqrabaa') {
			webapp.header( xlate('XPO.aqrabaa') );

			aqrabaa.fahras(dummyprofiles);

			softkeys.list.basic(favlist);
		}
	});
	
})();
