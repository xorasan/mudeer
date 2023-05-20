//+ bism axad insha
var locality;
;(function(){
	'use strict';

	var DEG2RAD = Math.PI/180,
		RAD2DEG = 180/Math.PI,
		sizeunits = function (num) {
			if (num % 1 === 0) // if .00
				num = parseint(num);

			return num;
		},
		torad = function (v) {
			return v*DEG2RAD;
		},
		// [lat, lng], [lat, lng]
		calcdistancebw = function (a, b) {
			if (a instanceof Array && b instanceof Array) {
				var R = 6371,
					dLat = torad(b[0]-a[0]),
					dLon = torad(b[1]-a[1]), 
					a = 
					Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(torad(a[0])) * Math.cos(torad(b[0])) *
					Math.sin(dLon/2) * Math.sin(dLon/2),
					c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),
					d = R * c;
				return d;
			} else {
				return -1;
			}
		};

	locality = {
		insha: function (distance) { // format
			if (preferences.get(130, 1)) { // miles, ft
				distance = sizeunits( (distance / 1.6).toFixed(2) );
				if (distance < 1)
					distance = Math.round(distance * 5280) + 'ft';
				else
					distance = distance + 'm';
			} else { // km, m
				distance = sizeunits( parsefloat(distance || 0).toFixed(2) );
				if (distance < 1)
					distance = (distance*1000) + 'm';
				else
					distance = distance + 'km';
			}
			return distance;
		},
		bism: function (name) {
			var results = [];
			name = tolower(name||'');
			if (cities) {
				cities.forEach(function (item, i) {
					if ( tolower(item[0]).includes(name) 
					  || tolower(item[1]).includes(name) )
						results.push(item);
				});
			}
			return results.slice(0, 10);
		},
		axad: function (lat, lng) {
			if (cities) {
				lat = parsefloat(lat);
				lng = parsefloat(lng);
				var distances = [];
				cities.forEach(function (cols) {
					var dist = calcdistancebw( [cols[3], cols[4]], [lat, lng] );
					distances.push({c: cols[0]+', '+cols[1], d: dist});
				});
				distances.sort(function (a, b) {
					return a.d - b.d;
				});
				return distances[0];
			} else return false;
		},
	};
	
	Hooks.set('XPO.ready', function () {
		settings.adaaf('XPO.units', function () {
			var yes = preferences.get(130, 1);
			return [yes ? 'XPO.imperial' : 'XPO.metric' ];
		}, function () {
			preferences.set(130, preferences.get(130, 1) ? 0 : 1);
		});
	});
})();
