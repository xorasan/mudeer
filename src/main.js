;window.onload = function(e){
	'use strict';
	var sw					= false,
//		newworkerloaded		= false,
		controllerchanged	= false,
		offlinemode			= 0;

	var buildnum = localStorage.getItem('#');
	if ( parseInt(buildnum) != BUILDNUMBER ) {
//		preferences.popall();
		preferences.pop(3);
		preferences.pop('@');
		preferences.pop('e$');
		// lists cache, since these store XPO kinda values
		preferences.pop(4);
		preferences.pop(6);
		preferences.pop(70); // billing
	}
	localStorage.setItem('#', BUILDNUMBER);
	
	$.log.s( BUILDNUMBER );
	
	if (offlinemode) {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').then(function(reg) {
				sw = reg;
				
				setInterval(function () {
					sw.update();
				}, 60 * 60 * 1000);
				
				sw.addEventListener('updatefound', function () {
					var newworker = reg.installing;
					dom.setloading( 'XPO.newversionfound', 0, 1 );

					if (newworker)
						newworker.addEventListener('statechange', function () {
							if (newworker.state === 'redundant')
								dom.setloading('XPO.appinstallfailed');
						});
				});
			});
			
			navigator.serviceWorker.onmessage = function (e) {
				if (e.data > BUILDNUMBER) {
					if (controllerchanged)
						dom.setloading('XPO.appinstalledoffline');
					else
						dom.setloading();
				}
			};

			navigator.serviceWorker.addEventListener('controllerchange', function () {
				controllerchanged = true;
			});
		} else {
			/*
			 * if iOS detected, tell the user about that
			 * recommend another OS.
			 * 
			 * show a link to m.xorasan.org/pages/unsupportedbrowser
			 * this is site for unsupported browsers, it's completely static
			 * 
			 * say Browser Ver+ on <OS>
			 * 
			 * 'try \nChrome 65+ on Android\nFirefox 48+ on Android'
			 * */
			dom.setloading('XPO.unsupportedbrowser', 0, 0);
			return;
		}
	}

	var appinstalled = function (e) {
		if (e && e.outcome === 'accepted') {
			XPO.installapp.lastElementChild.hidden = 1;
			XPO.installapp.lastElementChild.innerText = helpers.translate('XPO.installedapp');
		} else
			XPO.installapp.hidden = 1;
	};
	
	window.onappinstalled = appinstalled;

	window.onbeforeinstallprompt = function (e) {
		XPO.installapp.hidden = 0;
		XPO.installapp.lastElementChild.onclick = function () {
			e.prompt();
		};
		XPO.topofthepage.scrollIntoView();
		e.userChoice.then(appinstalled);
	};

	window.addEventListener('DOMContentLoaded', function () {
		var params = new URLSearchParams(location.search);
		XPO.shareui.innerText =		'\n\ntitle\n\n'	+	params.get('title')
								+	'\n\ntext:\n\n'	+	params.get('text')
								+	'\n\nurl:\n\n'	+	params.get('url');
	});

	Hooks.set('XPO.appneedsreload', 'XPO.main', function () {
		if (sw) {
			dom.setloading( 'XPO.newversionfound', 0, 1 );
			sw.update();
		} else
			dom.setloading( 'XPO.appneedsreload' );
	});

	dom.init();
	editor.init();
	appui.init();
	helpers.init();
	mediaio.init();

	Hooks.run('XPO.mainonload', null);

	if (window.matchMedia('(display-mode: standalone)').matches
	// for iOS
	||	navigator.standalone) {
		Hooks.run('XPO.mainstandalone', null);
	}
};
