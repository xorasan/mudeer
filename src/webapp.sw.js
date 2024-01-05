var should_show_install, install_softkey;
;(function(){
	var channel = new BroadcastChannel('_');
	
	channel.addEventListener('message', function (e) {
		Hooks.run('message', e.data); // message
	});
	
	Webapp.sw = {
		registered: 0,
		post_message: function (message) { // post message
			channel.postMessage(message);
		},
	};

	var before_install;
	// INSTALL
	install_softkey = { n: 'Install',
		k: 'l',
		alt: 1,
		i: 'iconappinstall',
		c: function (k, e) {
			if (before_install) before_install.prompt();
			e && e.preventDefault();
		}
	};
	var appinstalled = function (e) {
		if (e && e.outcome === 'accepted') {
			Webapp.status( ['installedapp'] );
		}
		if (install_softkey.uid)
			Softkeys.remove( install_softkey.uid );
	};
	window.onappinstalled = appinstalled;
	window.onbeforeinstallprompt = function (e) {
		should_show_install = 1;
		before_install = e;
		Softkeys.add(install_softkey);
		before_install.userChoice.then(appinstalled);
	};

	Hooks.set('viewready', function () {
		if (backstack.darajah == 0 && should_show_install) {
			Softkeys.add(install_softkey);
		}
	});
	Hooks.set('ready', function (arg_one) {
		var sw					= false,
//			newworkerloaded		= false,
			controllerchanged	= false,
			offlinemode			= 1;
		
		if (offlinemode) {
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/_.js').then(function(reg) {
					sw = reg;
					Webapp.sw.registered = reg;
					
					setInterval(function () {
						sw.update();
					}, 60 * 60 * 1000);
					
					sw.addEventListener('updatefound', function () {
						var newworker = reg.installing;
						Webapp.status( ['newversionfound'] );

						if (newworker)
							newworker.addEventListener('statechange', function () {
								if (newworker.state === 'redundant')
									Webapp.status( ['appcachefailed'] );
							});
					});
				});
				
				navigator.serviceWorker.onmessage = function (e) {
					if (e.data > BUILDNUMBER) {
						if (controllerchanged) Webapp.status( ['appcachedoffline'] );
//						else Webapp.status.setloading();
					}
				};

				navigator.serviceWorker.addEventListener('controllerchange', function () {
					controllerchanged = true;
				});
			} else {
				Webapp.status( ['swunsupported'] );
				return;
			}
		}

		// TODO proper share handling, move to webapp.share
		window.addEventListener('DOMContentLoaded', function () {
			var params = new URLSearchParams(location.search);
			shareui.innerText =		'\n\ntitle\n\n'	+	params.get('title')
									+	'\n\ntext:\n\n'	+	params.get('text')
									+	'\n\nurl:\n\n'	+	params.get('url');
		});
		Hooks.set('appneedsreload', function () {
			if (sw) {
				Webapp.status( ['newversionfound'] );
				sw.update();
			} else
				Webapp.status( ['appneedsreload'] );
		});

		// STANDALONE
		if (window.matchMedia('(display-mode: standalone)').matches
		// for iOS
		||	navigator.standalone) {
			// TODO this should be displayed somewhere
			Hooks.run('standalone', null);
		}
	});
})();

