//+ popall change
var Preferences, preferences;
;(function(){
	'use strict';
	/* LEGEND preferences local storage
	 * @		last sync time
	 * @0		offline since
	 * 1		key
	 * 2		uid (account)
	 * 3		ruid
	 * 4		list views cache
	 * 5		is menu hidden, 1 yes
	 * 6		initial sync done?
	 * 7		softkeys help
	 * 8		sound off
	 * 9		largetext
	 * 10		default perms for different account types
	 * 11		permissions of current account
	 * 12		temp unit C F K
	 * 13		meanings
	 * 15		animations off
	 * 16		softkeystouch dpad
	 * 17		pagerasmaa
	 * 18		webapptouchdir
	 * 19		theme
	 * 20		username
	 * 21		display name
	 * 22		account type
	 * 23		transparency
	 * 24		24 hour
	 * 25		lang
	 * 26		calendar type hijri gregorian
	 * 27		digit comma separation
	 * 30		app uid
	 * 40		app title
	 * 50		app address
	 * 60		app phone
	 * 70		billing on Central
	 * 80		default currency
	 * 81		latitude
	 * 82		longitude
	 * 90		sign in required
	 * 91		location required
	 * 100		remember viewed articles
	 * 110		frequency of used dashboard items
	 * 120		home view
	 * 130		units (SI, imperial)
	 * 140		font
	 * 150		global newform toggle
	 * 160		features
	 * 170		conf
	 * 1100		umoor what tag(s) to show?
	 * */
	Preferences = preferences = {
		popall: function () {
			return localStorage.clear();
		},
		set: function (name, value) {
			return localStorage.setItem(name, value);
		},
		get: function (name, json) {
			if (json) {
				try {
					return JSON.parse( localStorage.getItem(name) );
				} catch (ignore) {
//					$.log.s( 'error parse json' );
				}
				return {};
			} else
				return localStorage.getItem(name);
		},
		pop: function (name) {
			return localStorage.removeItem(name);
		},
		/*
		 * for json data, fetches stored data, parses as json, gives you a nice
		 * object to work with in a callback, you make the changes and just
		 * return the result, it saves the object back
		 * */
		change: function (name, callback) {
			if (typeof callback === 'function') {
				var data;
				try {
					data = preferences.get(name);
					data = JSON.parse( data );
				} catch (ignore) {
//					$.log.s( 'error parse json' );
				}
				
				if (!(data instanceof Object))
					data = {};
				
				data = callback(data);
				
				preferences.set(name, JSON.stringify( data ) );
			}
		},
	};

	var buildnum = preferences.get('#', 1);
	if ( buildnum != BUILDNUMBER ) {
		preferences.pop(3); // ruid
		preferences.pop('@'); // last sync time
		// lists cache, since these store XPO kinda values
		preferences.pop(4); // list view cache
		preferences.pop(6); // initial sync done
	}
	preferences.set('#', BUILDNUMBER);
	
	Hooks.set('XPO.ready', function () {
		if ( buildnum != BUILDNUMBER ) {
			// transmit old buildnum app wide after 2 seconds
			$.taxeer('XPO.seeghahjadeedah', function () {
				Hooks.run('XPO.seeghahjadeedah', buildnum);
			}, 2000);
		}
	});

	$.log.s( BUILDNUMBER );
})();
