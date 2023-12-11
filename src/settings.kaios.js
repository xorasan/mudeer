Hooks.set('ready', function () {
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
		container: Settings.get_dom_keys().ad,
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
Hooks.set('viewready', function (args) {
	if (args.name == 'settings') {
		if (PRODUCTION && 'getKaiAd' in window)
		softkeys.set('0', function () {
			if (currentad) currentad.call && currentad.call('click');
		}, translate('openad'), false);
	}
});
