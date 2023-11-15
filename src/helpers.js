var helpers;
;(function(){
	'use strict';
	var val = {};
			
	helpers = {
		/*
		 * detect language direction, 0-ltr, 1-rtl, 2-mixed
		 * */
		detectdirection: function (text) {
			text = text || '';
			var ltr = text.match(/[a-zA-Z]+/),
				rtl = text.match(/[ا-ي]+/);
			
			if (ltr)
				return 0;
			if (rtl)
				return 1;
			
			return 2;
		},
		getrawitem: function (url, cb) {
			var img = new Image();

			img.onload = function () {
				cb(img.width, img.height);
			};

			img.src = url;
		},
		/*
		 * if no x, just return current x
		 * if height less than 
		 * */ 
		smartscroll: function (x) {
			var fec = document.firstElementChild;
			if (x === undefined)
				return fec.scrollTop;
			else {
				if (!allowscroll) return;
				var pct = x/fec.scrollHeight;
//				$.log.s( 'smartscroll', x, pct );
				if (window.innerHeight >= 640) {
					if (pct > 60)
						fec.scrollTop = x+160;
					if (pct < 40)
						fec.scrollTop = x-160;
				}
			}
		},
		enc:	encodeURIComponent,
		dec:	decodeURIComponent,
		encp:	encodeURI,
		decp:	decodeURI,
		getperm: function (perm) {
			// return a promise
			return navigator.permissions.query({
			  name: perm
			});
//			.then(function (permissionStatus) {
			  // Will be 'granted', 'denied' or 'prompt':
//			  console.log(permissionStatus.state);

//			  permissionStatus.onchange = () => {
//				console.log(permissionStatus.state);
//			  };
//			});
		},
		/*
		 * for checking account perms just like on the server
		 * */
		hasperm: function (perm) {
			if ((preferences.get(11) || '').split(' ').includes( perm ))
				return true;
			return false;
		},
		/*
		 * assumes num is bytes
		 * converts to biggers units when needed
		 * always returns strings
		 * */
		sizeunits: function (num) {
			if (typeof num === 'number') {
				if (num >= (1024 * 1024 * 1024 * 1024))
					return (num / (1024 * 1024 * 1024 * 1024)).toFixed(1) + 'TB'; 

				if (num >= (1024 * 1024 * 1024))
					return (num / (1024 * 1024 * 1024)).toFixed(1) + 'GB'; 

				if (num >= (1024 * 1024))
					return (num / (1024 * 1024)).toFixed(1) + 'MB'; 

				if (num >= 1024)
					return (num / 1024).toFixed() + 'KB'; 
			}

			return '0';
		},
		/*
		 * to help display countdowns
		 * precise up to days
		 * accepts values in seconds
		 * */
		timeunits: function (num) {
			if (typeof num === 'number') {
				if (num < 0)
					num = -num;
				
				if (num >= (60 * 60 * 24))
					return (num / (60 * 60 * 24)).toFixed(2) + 'd'; 
				else if (num >= (60 * 60))
					return (num / (60 * 60)).toFixed(2) + 'h'; 
				else if (num >= (60))
					return (num / 60).toFixed(0) + 'm ' + (num % 60).toFixed(0) + 's'; 
				else
					return (num).toFixed(0) + 's'; 
			}

			return '0';
		},
		/*
		 * checks if childarray is in parentarray
		 * */
		isarrayinarray: function (childarray, parentarray) {
			var yes;
			
			childarray = childarray.join(' ');
			parentarray.forEach(function (item) {
				if (item instanceof Array)
//					$.log.s( item.join(' '), childarray );

				if ( item instanceof Array && item.join(' ') === childarray )
					yes = true;
			});
			
			return yes || false;
		},
		/*
		 * return true if no modifier keys are held down
		 * */
		nomods: function (e) {
			if (!e.ctrlKey && !e.altKey && !e.shiftKey)
				return true;

			return false;
		},
		/*
		 * if is at this uri (pathname), return bool
		 * uses startswith unless full is true
		 * */
		isat: function (uri, full) {
			if (full)
				return location.pathname === uri;
			else
				return location.pathname.startsWith( uri );
		},
		/*
		 * takes a function with a unique name, if a function with this name is
		 * provided again, it delays the exec of that function by a few ms
		 * 
		 * calling without fn will just clear the timeout on that id
		 * */
		delayedexecfns: {},
		delayedexec: function (id, fn, customdelay, nofurtherdelay) {
			customdelay = customdelay || 0.1 * 1000;

			// continue exec without delaying it further
			if ( nofurtherdelay && helpers.delayedexecfns[id] )
				return;
			
			if ( helpers.delayedexecfns[id] ) {
				clearTimeout( helpers.delayedexecfns[id] );
				helpers.delayedexecfns[id] = undefined;
			}
			
			if ( typeof fn === 'function' ) {
				helpers.delayedexecfns[id] = setTimeout( function () {
					fn();
					
					// cleanup to trigger garbage collection, save memory :)
					helpers.delayedexecfns[id] = undefined;
				}, customdelay );
			}
		},
		wordspermins: function (wordcount) {
			if (wordcount < 1)
				return '0 ' + xlate('XPO.minute');
				
			var mins = ( wordcount / 150 ).toFixed(1);
			if (mins > 1)
				return  mins + ' ' + xlate('XPO.minutes');
			else
				return  mins + ' ' + xlate('XPO.minute');
		},
		alias: function (string, length, dont_lower, dont_dash) {
			string = string || '';
			length = length || 255;
			var dash = '-';
			if (string.length === 0) return '';
			if (!dont_lower) string = tolower(string);
			if (dont_dash) dash = ' ';
			return string.substr(0, length)
						 .replace(/\%/g,						' pct'			)
						 .replace(/\@/g,						' at '			)
						 .replace(/\&/g,						' and '			)
						 .replace(/[$-\-/:-?\{\}-~!"^_`\[\]@#]/g,	dash		) // symbols
						 .replace(/[^.\d\wa-zA-Z0-9ا-ےÄäÜüÖößЀ-ҁҊ-ӿÇçĞğŞşIıÜüﻙ]+/g,		dash	) // most alphanums
						 .replace(/\s[\s]+/g,					dash			)
						 .replace(/[\s]+/g,						dash			)
						 .replace(/^[\-]+/g,					''				)
						 .replace(/[\-]+$/g,					''				)
						 .replace(/\-\-/g,						dash			)
						 .replace(/\.\-/g,						'.'				)
						 .replace(/\-\./g,						'.'				)
						 .replace(/^\./g,						''				)
						 .replace(/\.$/g,						''				)
						 .trim();
		},
		// TODO improve this
		countwords: function (text) {
			text = text || '';
			text = text.replace(/\n\n/g, ' ');
			text = text.split(' ');
			var count = 0;
			text.forEach(function (word) {
				if (word.length > 3 && word.length < 35) {
//					loggy += ' '+word;
					++count;
				}
			});
//			$.log.s( loggy );
			return count;
		},
		year	: 31557600000			,
		month	: 2629800000			,
		day		: 87660000				,
		hour	: 3652500				,
		minute	: 60875					,
		second	: 1000					,
		milli	: 1						,
		striptime: function (time) {
			var parsed = new Date(time||new Date().getTime());
			
			parsed = (parsed.getDate()) + ' ' + helpers.monthnames[parsed.getMonth()] + ' ' + parsed.getFullYear() + ' GMT';
			parsed = new Date(parsed);
			if (parsed.toString() === 'Invalid Date') parsed = false;
			
			return parsed;
		},
		stripday: function (time) {
			var parsed = new Date(time||new Date().getTime());
			
			parsed = helpers.monthnames[parsed.getMonth()] + ' ' + parsed.getFullYear() + ' GMT';
			parsed = new Date(parsed);
			if (parsed.toString() === 'Invalid Date') parsed = false;
			
			return parsed;
		},
		stripmonth: function (time) {
			var parsed = new Date(time||new Date().getTime());
			
			parsed = parsed.getFullYear() + ' GMT';
			parsed = new Date(parsed);
			if (parsed.toString() === 'Invalid Date') parsed = false;
			
			return parsed;
		},
		/*
		 * both int values
		 * */
		traversebydays: function (intdate, num) {
//			$.log.s( 'traversebydays', intdate, num );
			
			intdate = new Date( intdate );
			intdate.setDate( intdate.getDate() + num );
			
			return intdate.getTime();
		},
		traversebymonths: function (intdate, num) {
//			$.log.s( 'traversebymonths', intdate, num );
			
			intdate = new Date( intdate );
			intdate.setMonth( intdate.getMonth() + num );
			
			return intdate.getTime();
		},
		traversebyyears: function (intdate, num) {
//			$.log.s( 'traversebyyears', intdate, num );
			
			intdate = new Date( intdate );
			intdate.setFullYear( intdate.getFullYear() + num );
			
			return intdate.getTime();
		},
		toymd: function (intdate) {
			intdate = parseInt(intdate);
			
			var day = new Date(intdate);
			
			var month = helpers.monthnames[ day.getMonth() ] || ''.substr(0, 3);
			
			var ymd = day.getFullYear()+'-'+month+'-'+day.getDate();

			return ymd;
		},
		// month starts at 1-jan, 2-feb, day:0 means last day of last month
		daysin	: function (month, year) {
			return new Date(year, parseInt(month)+1, 0).getDate();
		},
		copy: function (e) {
			e.select();
			try {
				var successful = document.execCommand('copy');
//				var msg = successful ? 'successful' : 'unsuccessful';
			} catch (err) {
				$.log.s('copy-error');
			}
		},
		now		: function () { return new Date().getTime(); },
		changelanguage: function (language) {
			i18n.XPO.language = language || 'en';
			if (['ur', 'ar'].includes(i18n.XPO.language)) {
				document.body.dir = 'rtl';
			} else {
				document.body.dir = 'ltr';
			}
			
			appui.applyi18n();
			dom.applyi18n();

			// maybe a better way to handle this, laterrr
			XPO.settingsuilanguage.value = language;
			
			helpers.updatedates();
			helpers.updatei18n();
		},
		translate: function (alias, raw) {
			var str = '';
			var language = i18n.XPO.language || 'en';
			if (language && i18n[language]) {
				if (i18n[language][alias]) 
					str = i18n[language][alias];
			}
			
			if (str === '') {
				if (i18n['en'][alias]) 
					str = i18n['en'][alias];
			}
			
			if (raw && str === '') return false;
			
			if (str === '') str = alias || '';
			return '' + str + '';
		},
		/*test: function () {
			var a = [];
			a.push (
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 1 ) ), // a sec
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 30 ) ), // 30 sec
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 ) ), // a min
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 2 ) ), // 2 min
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 5 ) ), // 5 min
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 ) ), // an hour
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 2 ) ), // 2 hours
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 5) ), // 5 hours
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 12) ), // 12 hours
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 ) ), // a day
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 2) ), // 2 days
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 5) ), // 5 days
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 8) ), // 8 days
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 15) ), // 15 days
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30) ), // a month
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30 * 2) ), // 2 months
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30 * 5) ), // 5 months
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30 * 8) ), // 8 months
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30 * 12) ), // a year
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30 * 12 * 2) ), // 2 years
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30 * 12 * 3) ), // 3 years
				'\n', helpers.relativetime( new Date().getTime() - ( 1000 * 60 * 60 * 24 * 30 * 12 * 5) ) // 5 years
			);
			
			console.log( a.join('') );
		},*/
		relativetime: function (datetime, e) {
			if (datetime === 'false') return helpers.translate('XPO.alongtime');

			var today			= helpers.striptime().getTime(),
				yesterday		= helpers.traversebydays(today, -1),
				tomorrow		= helpers.traversebydays(today, 1),
				text			= '',
				is24			= preferences.get('24', 1);

			if (e) {
				var dataset			= e.dataset,
					relativedays	= dataset.XPO.relativedays,
					by				= dataset.XPO.by;

				delete dataset.XPO.i18n;

				relativedays = parseInt(relativedays);
				if (by === 'XPO.yearly') {
					e.innerHTML = helpers.formatdate( new Date(relativedays), 'YYYY' );
				} else if (by === 'XPO.monthly') {
					e.innerHTML = helpers.formatdate( new Date(relativedays), 'MMMM YYYY' );
				} else if (by === 'XPO.daily') {
					/* TODO urgent
					 * implement this:
					 * today @ 05:00
					 * tomorrow @ 05:00
					 * yesterday @ 05:00
					 * 25th Oct (if current year)
					 * 25th Oct 2019
					 * */
					e.innerHTML = helpers.formatdate( new Date(relativedays), 'Do MMMM YYYY' );
				} else if (by === 'XPO.minute') {
					e.innerHTML = helpers.formatdate( new Date(relativedays), is24 ? 'HH:mm' : 'hh:mma' );
				} else {
					if (relativedays === today)
						dataset.XPO.i18n = 'XPO.today';
					else if (relativedays === yesterday)
						dataset.XPO.i18n = 'XPO.yesterday';
					else if (relativedays === tomorrow)
						dataset.XPO.i18n = 'XPO.tomorrow';
					else 
						e.innerHTML = helpers.formatdate( new Date(relativedays), 'Do MMM YYYY' );
				}
			} else {
				var at = helpers.translate('XPO.@');
				var c = helpers.translate('XPO.,'); // unicode commas

				var months	= ( ( helpers.now() - datetime ) / helpers.month	);
				var days	= ( ( helpers.now() - datetime ) / helpers.day		);
				
				if (days <= 1) {
					text = helpers.fuzzytime( datetime ) + ' '+at+' ' + helpers.formatdate( new Date(datetime), (is24 ? 'HH:mm' : 'hh:mma') );
				} else if (days > 1 && days <= 4) {
					text = helpers.formatdate( new Date(datetime), 'dddd'+c+' '+(is24 ? 'HH:mm' : 'hh:mma') );
				} else if (months < 2) {
					text = helpers.formatdate( new Date(datetime), 'Do MMM'+c+' '+(is24 ? 'HH:mm' : 'hh:mma') );
				} else {
					text = helpers.formatdate( new Date(datetime), 'Do MMM YYYY'+c+' '+(is24 ? 'HH:mm' : 'hh:mma') );
				}
				
				if (e) e.innerHTML = text;
			}
			
			return text;
		},
		_calcs: {},
		_replacements: [],
		_uid: 0,
		realdatereplace: function (s) {

			if (	s	===	('YYYY')	)	{ return val._year															}
			if (	s	===	('YY')		)	{ return val._shortyear < 10 ? '0'+val._shortyear : val._shortyear			}
			if (	s	===	('Y')		)	{ return val._shortyear														}
			if (	s	===	('HH')		)	{ return val._hours < 10 ? '0'+val._hours : val._hours						}
			if (	s	===	('H')		)	{ return val._hours															}
			if (	s	===	('hh')		)	{ return val._hours12 < 10 ? '0'+val._hours12 : val._hours12				}
			if (	s	===	('h')		)	{ return val._hours12														}
			if (	s	===	('mm')		)	{ return val._minutes < 10 ? '0'+val._minutes : val._minutes				}
			if (	s	===	('m')		)	{ return val._minutes														}
			if (	s	===	('ss')		)	{ return val._seconds < 10 ? '0'+val._seconds : val._seconds				}
			if (	s	===	('s')		)	{ return val._seconds														}
			if (	s	===	('a')		)	{ return val._ampm															}
			if (	s	===	('MMMM')	)	{ return val._monthname														}
			if (	s	===	('MMM')		)	{ return (val._monthname||'').substr(0, 3)									}
			if (	s	===	('MM')		)	{ return val._month < 10 ? '0'+val._month : val._month						}
			if (	s	===	('M')		)	{ return val._month															}
			if (	s	===	('dddd')	)	{ return val._dayname														}
			if (	s	===	('ddd')		)	{ return (val._dayname||'').substr(0, 3)									}
			if (	s	===	('DD')		)	{ return val._day < 10 ? '0'+val._day : val._day							}
			if (	s	===	('Do')		)	{ return val._day+val._o													}
			if (	s	===	('D')		)	{ return val._day															}
			
		},
		replacewithuid: function () {
			helpers._replacements[helpers._uid] = helpers.realdatereplace(arguments[0]);
			++helpers._uid;
			return '%{'+helpers._uid+'}';
		},
		monthnames: 'january february march april may june july august september october november december'.split(' '),
		weekdays: 'sunday monday tuesday wednesday thursday friday saturday'.split(' '),
		formatdate: function (date, format) {
			format = format || 'MM/DD/YYYY h:mma';
			
			helpers._uid = 0;
			helpers._replacements = [];
			
			val._year		= date.getFullYear()+''					,
			val._shortyear	= parseInt(val._year.substr(-2))		,
			val._month		= date.getMonth()+1						,
			val._monthname	= helpers.monthnames[val._month-1]		,
			val._day		= date.getDate()						,
			val._dayname	= helpers.weekdays[date.getDay()]		,

			val._hours		= date.getHours()						,
			val._hours12 	= val._hours % 12						,
			val._hours12	= val._hours12 < 1 ? 12 : val._hours12	, // the hour '0' should be '12'

			val._minutes	= date.getMinutes()						,
			val._seconds	= date.getSeconds()						,
			val._ampm		= val._hours >= 12 ? helpers.translate('XPO.pm') : helpers.translate('XPO.am')		;
			
			
			// get translated month name
			val._monthname = helpers.translate(val._monthname);
			val._dayname = helpers.translate(val._dayname);
			
			val._o			= helpers.translate('XPO.th');
			if (val._day === 1 || val._day === 21 || val._day === 31) val._o = helpers.translate('XPO.st');
			if (val._day === 2 || val._day === 22) val._o = helpers.translate('XPO.nd');
			if (val._day === 3 || val._day === 23) val._o = helpers.translate('XPO.rd');


			var datetimestring = format;
				datetimestring = datetimestring
					.replace(/YYYY/g, helpers.replacewithuid)
					.replace(/YY/g	, helpers.replacewithuid)
					.replace(/Y/g	, helpers.replacewithuid)
					.replace(/HH/g	, helpers.replacewithuid)
					.replace(/H/g	, helpers.replacewithuid)
					.replace(/hh/g	, helpers.replacewithuid)
					.replace(/h/g	, helpers.replacewithuid)
					.replace(/mm/g	, helpers.replacewithuid)
					.replace(/m/g	, helpers.replacewithuid)
					.replace(/ss/g	, helpers.replacewithuid)
					.replace(/s/g	, helpers.replacewithuid)
					.replace(/a/g	, helpers.replacewithuid)
					.replace(/MMMM/g, helpers.replacewithuid)
					.replace(/MMM/g	, helpers.replacewithuid)
					.replace(/MM/g	, helpers.replacewithuid)
					.replace(/M/g	, helpers.replacewithuid)
					.replace(/dddd/g, helpers.replacewithuid)
					.replace(/ddd/g	, helpers.replacewithuid)
					.replace(/DD/g	, helpers.replacewithuid)
					.replace(/Do/g	, helpers.replacewithuid)
					.replace(/D/g	, helpers.replacewithuid)
					;

			var matches;
			datetimestring = datetimestring.replace(/\%\{(\d)*\}/gm, function () {
				return helpers._replacements[ arguments[1]-1 ];
			});

			return  datetimestring;
		},
		updatei18n: function (parent) {
//			$.log.s( 'updatei18n' );

			var items = (parent||document).querySelectorAll('[data-XPO.i18n]');
			for (var i in items) {
				if (items.hasOwnProperty(i)) {
					var e = items[i];
					if (e) {
						var dataset = e.dataset;
						var i18n = dataset.XPO.i18n;
						
						if (i18n !== '') {
							
							var translation = helpers.translate(i18n);
							
							if (e instanceof HTMLInputElement
							||	e instanceof HTMLSelectElement
							||	e instanceof HTMLTextAreaElement) {
								e.placeholder = translation;
							} else {
								e.innerText = translation;
							}
							
						}
					}
				}
			}

		},
		updatedates: function (parent) {
//			$.log.s( 'updatedates' );

			var items = (parent||document).querySelectorAll('[data-XPO.datetime]'),
				is24		=	preferences.get('24', 1);

			for (var i in items) {
				if (items.hasOwnProperty(i)) {
					var e = items[i];
					if (e) {
						var dataset = e.dataset;
						var datetime = dataset.XPO.datetime;
						
						if (datetime !== '') {
							
							if (datetime !== 'false') {
								datetime = parseInt(datetime);
								e.setAttribute('title', helpers.formatdate( new Date(datetime), 'Do MMM YYYY, ' + (is24 ? 'HH:mm' : 'hh:mma') ) );
							}
							e.innerHTML = helpers.relativetime(datetime);
							
						}
					}
				}
			}

			var items = (parent||document).querySelectorAll('[data-XPO.relativedays]');
			for (var i in items) {
				if (items.hasOwnProperty(i))
					helpers.relativetime(0, items[i]);
			}

		},
		fuzzytime: function (date) {
			date = date || +new Date;
			var delta = Math.round( (+new Date - date) / 1000);

			var minute = 60,
				hour = minute * 60,
				day = hour * 24,
				week = day * 7,
				month = day * 30,
				year = month * 12;

			var fuzzy;

			if (delta < 30) {
				fuzzy = helpers.translate('XPO.justnow');
			} else if (delta < minute) {
				fuzzy = delta + ' ' + helpers.translate('XPO.secondsago');
			} else if (delta < 2 * minute) {
				fuzzy = helpers.translate('XPO.aminuteago');
			} else if (delta < hour) {
				fuzzy = Math.floor(delta / minute) + ' ' + helpers.translate('XPO.minutesago');
			} else if (Math.floor(delta / hour) == 1) {
				fuzzy = helpers.translate('XPO.anhourago');
			} else if (delta < day) {
				fuzzy = Math.floor(delta / hour) + ' ' + helpers.translate('XPO.hoursago');
			} else if (delta < day * 2) {
				fuzzy = helpers.translate('XPO.yesterday');
			} else if (delta >= day * 2 && delta < month) {
				fuzzy = Math.floor(delta / day) + ' ' + helpers.translate('XPO.daysago');
			} else if (delta == month) {
				fuzzy = helpers.translate('XPO.lastmonth');
			} else if (delta > month && delta < year) {
				fuzzy = Math.floor(delta / month) + ' ' + helpers.translate('XPO.monthsago');
			} else if (delta == year) {
				fuzzy = helpers.translate('XPO.lastyear');
			} else if (delta > year) {
				fuzzy = Math.floor(delta / year) + ' ' + helpers.translate('XPO.yearsago');
			}
			
			return fuzzy;

		},
		init: function () {
			setInterval(function () {
				helpers.updatedates();
			}, 30000);
		}
	}

})();