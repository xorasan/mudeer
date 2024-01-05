function url_content_to_data_uri(url){
	return  fetch(url)
			.then( response => response.blob() )
			.then( blob => new Promise( callback =>{
				let reader = new FileReader() ;
				reader.onload = function(){ callback(this.result) } ;
				reader.readAsDataURL(blob) ;
			}) ) ;
}
;(function(){

	var notify_softkey = { n: 'Enable Notifications',
		k: 'n',
		first: 1, // TODO
		alt: 1,
		ctrl: 1,
		i: 'iconnotifications',
		c: function (k, e) {
			Webapp.notify({
				tag: 'test',
				title: 'Test Notification',
				body: 'If you can see this, then notifications work!',
				badge: '/e.png',
				icon: '/e.png',
				renotify: 1,
				requireInteraction: 1,
			});
			e && e.preventDefault();
		}
	};

	listener('notificationclick', function (e) {
		$.log( e );
	});
	
	function send_notification(options) {
		var notification = new Notification(options.title, options);
		$.log( notification );
	};

	Webapp.notify = function (options) { // adds uid to options unless specified
		if (!('Notification' in window)) {
			// Check if the browser supports notifications
			Webapp.status( 'This browser does not support notifications' );
		} else if (Notification.permission == 'granted') {
			// Check whether notification permissions have already been granted;
			// if so, create a notification
			send_notification( options );
		} else if (Notification.permission != 'denied') {
			// We need to ask the user for permission
			Notification.requestPermission().then((permission) => {
				// If the user accepts, let's create a notification
				if (permission == 'granted') {
					send_notification( options );
				}
			});
		}
	};
	Hooks.set('viewready', function () {
		if (backstack.darajah == 0) {
			softkeys.add(notify_softkey);
		}
	});
})();