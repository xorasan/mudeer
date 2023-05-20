//+ adaaf jaddad axad
var settings, currentad;
;(function(){
	// TODO move this to settingslist.adapter
	var settingsitems = [
		// uid, getvalue, onpress
		/*['XPO.quality', 0, function () {
			Hooks.run('XPO.sheet', {
				XPO.name: 'XPO.quality',
				XPO.title: translate('XPO.quality'),
			});
		}],*/
		['XPO.reportbug', 0, function () {
			activity.abrad(myemail+'?subject='+appname+' bug '+BUILDNUMBER);
		}],
		['XPO.requestfeat', 0, function () {
			activity.abrad(myemail+'?subject='+appname+' request '+BUILDNUMBER);
		}],
		['XPO.timeformat', function () {
			var is24 = preferences.get(24, 1);
			return [is24 ? 'XPO.hours24' : 'XPO.hours12'];
		}, function () {
			var is24 = preferences.get(24, 1);
			if (is24) preferences.set(24, 0);
			else preferences.set(24, 1);
		}],
		['XPO.calendar', function () {
			var isgregorian = preferences.get(26, 1);
			return [isgregorian ? 'XPO.gregorian' : 'XPO.hijri'];
		}, function () {
			var isgregorian = preferences.get(26, 1);
			if (isgregorian) preferences.set(26, 0);
			else preferences.set(26, 1);
		}],
		['XPO.transparency', function () {
			var isit = preferences.get(23, 1);
			webapp.transparency();
			return [isit ? 'XPO.on' : 'XPO.off'];
		}, function () {
			var isit = preferences.get(23, 1);
			if (isit) { preferences.set(23, 0); }
			else { preferences.set(23, 1); }
		}],
		['XPO.largetext', function () {
			var largetext = preferences.get(9, 1);
			webapp.textsize();
			return [largetext ? 'XPO.on' : 'XPO.off'];
		}, function () {
			preferences.set(9, preferences.get(9, 1) ? 0 : 1);
		}]
	], settingslist, myemail = 'hxorasani@gmail.com', keys;
	
	settings = {
		adaaf: function (name, getvalue, onpress) { // add
			settingsitems.push([name, getvalue, onpress]);
			settings.jaddad(settingsitems.length-1);
			return settingsitems.length-1;
		},
		axad: function (uid) { // get
			return settingsitems[uid];
		},
		jaddad: function (uid) { // update
			var item = settings.axad(uid);
			if (item) {
				var body = typeof item[1] === 'function' ? item[1]() : undefined;
				var obj = {
					uid: uid,
				};
				obj.XPO.index = uid;
				obj.XPO.titlei18n = item[0];
				
				if (body instanceof Array)
					obj.XPO.bodyi18n = body[0];
				else
					obj.XPO.body = body;
					
				if (settingslist) {
					settingslist.set(obj);
					
					if (backstack.states.view === 'XPO.settings')
						settingslist.select();
				}
			}
		},
	};

	Hooks.set('XPO.ready', function () {
		keys = view.mfateeh('XPO.settings');

		settingslist = list( keys.XPO.list ).idprefix('XPO.settings');
		
		settingslist.beforeset = function (item, id) {
			return item;
		};
		settingsitems.forEach(function (item, i) {
			settings.jaddad(i);
		});
		settingslist.onpress = function (item, key, uid) {
			if (item) {
				settings.axad(item.XPO.index)[2]();
				settings.jaddad(item.XPO.index);
			}
		};

		if (PRODUCTION && 'getKaiAd' in window)
		getKaiAd({
			publisher: '7e2cfabf-ef5c-46eb-8e57-c20f3d6a1171',
			//slot: 'about-app', // optional
			
			test: PRODUCTION ? 0 : 1,
			
			timeout: 60*1000,
			
			h: 48,
			w: 240,
			// Max supported size is 240x264

			// container is required for responsive ads
			container: keys.XPO.ad,
			onerror: function (e) { $.log.e(e); },
			onready: function (ad) {
				currentad = ad;

				// Ad is ready to be displayed
				// calling 'display' will display the ad
				ad.call('display', {
					// In KaiOS the app developer is responsible
					// for user navigation, and can provide
					// navigational className and/or a tabindex
					//tabindex: 0,

					// if the application is using
					// a classname to navigate
					// this classname will be applied
					// to the container
					//navClass: 'items',

					// display style will be applied
					// to the container block or inline-block
					//display: 'block',
				});
			}
		});
	});
	Hooks.set('XPO.viewready', function (args) {
		switch (args.XPO.name) {
			case 'XPO.main':
				softkeys.set('9', function () {
					Hooks.run('XPO.view', 'XPO.settings');
				}, '9', 'XPO.iconsettings');
				break;
			case 'XPO.settings':
				webapp.header( ['XPO.settings'] );
				softkeys.list.basic(settingslist);
				softkeys.set(K.en, function () {
					settingslist.press(K.en);
				});
				softkeys.set(K.bs, function () {
					backstack.back();
				});

				if (PRODUCTION && 'getKaiAd' in window)
				softkeys.set('0', function () {
					if (currentad) currentad.call && currentad.call('click');
				}, translate('XPO.openad'), false);

				/* TEST
				 * this can be automated by giving a function to view.?set?
				 * 
				 * view should autocall this function on restore
				 * it can find functions by looping
				 * */
				// restore scroll position
				settingslist.select();
				break;
		}
	});
})();