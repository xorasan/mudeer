//+ monthnames update replacewithuid _replacements formatdate _calcs _uid relativetime
//+ monthname fuzzytime _minutes _seconds _ampm _hours12 _hours _dayname _shortyear
//+ _monthname _month _day _year realdatereplace traversebydays
//+ year month day hour minute second milli now zero
var time;
;(function(){
	var val = {}, timeout, started,
		monthnames	= ('january february march april may june july '
					+ 'august september october november december').split(' '),
		weekdays = 'sunday monday tuesday wednesday thursday friday saturday'.split(' ');
	
	time = function (parent) {
		var items	= (parent||document).querySelectorAll('[data-XPO.time]'),
			is24	= preferences.get(24, 1);

		for (var i in items) {
			if (items.hasOwnProperty(i)) {
				var e = items[i];
				if (e) {
					var dataset = e.dataset;
					var datetime = dataset.XPO.time;
					var by = dataset.XPO.by;
					
					datetime = parseInt(datetime);

					if (e.dataset.XPO.deadline) {
						if (time.now() < datetime)
							delete e.dataset.XPO.past, e.dataset.XPO.future = 1;
						else
							delete e.dataset.XPO.future, e.dataset.XPO.past = 1;
					} else
						delete e.dataset.XPO.future, delete e.dataset.XPO.past;

					if (by) {
						time.relativetime(0, items[i]);
					}
					else if (datetime !== '') {
						
						if (datetime !== 'false') {
							e.setAttribute('title',
								time.formatdate(
									new Date(datetime),
									'Do MMM YYYY, ' + (is24 ? 'HH:mm' : 'hh:mma')
								)
							);
						}
						e.innerHTML = time.relativetime(datetime, 0, e.dataset);
						
					}
				}
			}
		}

	};

	time.monthname = function (value) { //starts at zero
		return monthnames[value];
	};
	time.miqdaar = function (delta, secondary) { // to mins, hrs, days, etc
		var fuzzy = '',
			minute = 60,
			hour = minute * 60,
			day = hour * 24,
			week = day * 7,
			month = day * 30,
			year = month * 12;
		if (delta < minute) {
			fuzzy = delta + ' ' + xlate('XPO.secondsago');
		}
		else if (delta < 2 * minute) {
			fuzzy = parsefloat(delta / minute, 1) + xlate('XPO.minute');
		}
		else if (delta < hour) {
			fuzzy = parsefloat(delta / minute, 1) + xlate('XPO.minutesago');
		}
		else if (Math.floor(delta / hour) == 1) {
			fuzzy = 1 + xlate('XPO.hourago');
			var mins = Math.floor( (delta % hour) / minute );
			if (mins) fuzzy += ' ' + parsefloat(mins, 1) + xlate('XPO.minutesago');
		}
		else if (delta < day) {
			fuzzy = Math.floor(delta / hour) + ' ' + xlate('XPO.hoursago');
			var mins = Math.floor( (delta % hour) / minute );
			if (mins) fuzzy += ' ' + mins + xlate('XPO.minutesago');
		}
		else if (delta >= day && delta < month) {
			var days = Math.floor(delta / day);
			fuzzy = days === 1 ? 1 + xlate('XPO.dayago') : days + xlate('XPO.daysago');
			var hours = Math.floor( (delta % day) / hour );
			if (hours)
				fuzzy += ' ' + (hours === 1 ?
								hours + xlate('XPO.hourago')
								: hours + xlate('XPO.hoursago'));
		}
		else if (delta > month && delta < year) {
			var months = Math.floor(delta / month);
			fuzzy = months === 1 ? months + xlate('XPO.monthago')
					: months + xlate('XPO.monthsago');
			var days = Math.floor( (delta % month) / day );
			if (days) fuzzy += ' ' + (days === 1 ? days + xlate('XPO.dayago')
									: days + xlate('XPO.daysago'));
		}
		else if (delta > year) {
			var years = Math.floor(delta / year);
			fuzzy = years === 1 ? years + xlate('XPO.yearago')
					: years + xlate('XPO.yearsago');
			var months = Math.floor( (delta % year) / month );
			if (months) fuzzy += ' ' + (months === 1 ? months + xlate('XPO.monthago')
					: months + xlate('XPO.monthsago'));
		}
		return fuzzy;
	};
	time.days = function (days) {
		days = new Date().getTime() - new Date(days).getTime();
		days = days / time.day;
		return days;
	};

	time.fuzzytime = function (date, muxtasar) {
		date = date || +new Date;
		var delta = Math.round( (+new Date - date) / 1000),
			future;

		if (delta < 0) {
			future = 1;
			delta *= -1;
		}

		var minute = 60,
			hour = minute * 60,
			day = hour * 24,
			week = day * 7,
			month = day * 30,
			year = month * 12;

		var fuzzy;

		if (!future && delta < 15) {
			if (muxtasar)
			fuzzy = delta + translate('XPO.sseconds');
			else
			fuzzy = translate('XPO.justnow');
		}
		else if (delta < minute) {
			if (muxtasar)
			fuzzy = delta + translate('XPO.sseconds');
			else
			fuzzy = delta + ' ' + translate('XPO.secondsago');
		}
		else if (delta < 2 * minute) {
			if (muxtasar)
			fuzzy = 1 + translate('XPO.sminutes');
			else
			fuzzy = translate('XPO.aminuteago');
		}
		else if (delta < hour) {
			if (muxtasar)
			fuzzy = Math.floor(delta / minute) + translate('XPO.sminutes');
			else
			fuzzy = Math.floor(delta / minute) + ' ' + translate('XPO.minutesago');
		}
		else if (Math.floor(delta / hour) == 1) {
			fuzzy = 1 + translate('XPO.hourago');
			var mins = Math.floor( (delta % hour) / minute );
			if (mins) {
				if (muxtasar)
				fuzzy = ' ' + mins + translate('XPO.sminutes');
				else
				fuzzy += ' ' + mins + translate('XPO.minutesago');
			}
		}
		else if (delta < day) {
			fuzzy = Math.floor(delta / hour) + translate('XPO.hoursago');
			var mins = Math.floor( (delta % hour) / minute );
			if (mins) fuzzy += ' ' + mins + translate('XPO.minutesago');
		}
		else if (delta >= day && delta < month) {
			var days = Math.floor(delta / day);
			fuzzy = days === 1 ? 1 + translate('XPO.dayago') : days + translate('XPO.daysago');
			var hours = Math.floor( (delta % day) / hour );
			if (hours)
				fuzzy += ' ' + (hours === 1 ?
								hours + translate('XPO.hourago')
								: hours + translate('XPO.hoursago'));
		}
		else if (delta > month && delta < year) {
			var months = Math.floor(delta / month);
			fuzzy = months === 1 ? months + translate('XPO.monthago')
					: months + translate('XPO.monthsago');
			var days = Math.floor( (delta % month) / day );
			if (days) fuzzy += ' ' + (days === 1 ? days + translate('XPO.dayago')
									: days + translate('XPO.daysago'));
		}
		else if (delta > year) {
			var years = Math.floor(delta / year);
			fuzzy = years === 1 ? years + translate('XPO.yearago')
					: years + translate('XPO.yearsago');
			var months = Math.floor( (delta % year) / month );
			if (months) fuzzy += ' ' + (months === 1 ? months + translate('XPO.monthago')
					: months + translate('XPO.monthsago'));
		}
		
		if (future) fuzzy = translate('XPO.infuture') +' '+ fuzzy;
		
		return translate.a3daad(fuzzy);
	};
	time.relativetime = function (datetime, e, dataset) {
		if (datetime === 'false') return translate('XPO.alongtime');

		var today			= time.striptime().getTime(),
			yesterday		= time.traversebydays(today, -1),
			tomorrow		= time.traversebydays(today, 1),
			text			= '',
			is24			= preferences.get(24, 1);

		if (e) {
			dataset = e.dataset;

			var datetime		= parseInt(dataset.XPO.time),
				minus			= dataset.XPO.minus,
				by				= dataset.XPO.by;

			delete dataset.XPO.i18n;

			if (minus !== undefined) datetime = time.now() - datetime;
			
			if (by === 'XPO.age') {
				innerhtml(e, time.fuzzytime(datetime));
			} else
			if (by === 'XPO.days') {
				var days = time.days(datetime);
				if (days < 0.1) days = days.toFixed(2);
				else if (days < 1)  days = days.toFixed(1);
				else days = Math.floor(days);
				innerhtml(e, days + ' ' + translate('daysago'));
			} else
			if (by === 'XPO.hourly') {
				innerhtml(e, time.formatdate( new Date(datetime), (is24 ? 'HH:mm' : 'hh:mma') ));
			} else
			if (by === 'XPO.yearly') {
				innerhtml(e, time.formatdate( new Date(datetime), 'YYYY' ));
			} else
			if (by === 'XPO.monthly') {
				innerhtml(e, time.formatdate( new Date(datetime), 'MMMM YYYY' ));
			} else
			if (by === 'XPO.daily') {
				innerhtml(e, time.formatdate( new Date(datetime), 'Do MMMM YYYY' ));
			} else
			if (by === 'XPO.minute') {
				innerhtml(e, time.formatdate( new Date(datetime), is24 ? 'HH:mm' : 'hh:mma' ));
			} else {
				if (datetime === today)
					dataset.XPO.i18n = 'XPO.today';
				else if (datetime === yesterday)
					dataset.XPO.i18n = 'XPO.yesterday';
				else if (datetime === tomorrow)
					dataset.XPO.i18n = 'XPO.tomorrow';
				else 
					innerhtml(e, time.formatdate( new Date(datetime), 'Do MMM YYYY' ));
			}
		} else {
			var at = translate('XPO.@');
			var c = translate('XPO.,'); // unicode commas

			var months	= ( ( time.now() - datetime ) / time.month	);
			var days	= ( ( time.now() - datetime ) / time.day	);
			
			if (days <= 1) {
				if (dataset && dataset.XPO.muxtasar == '3')
					text += time.fuzzytime( datetime, 1 );
				else if (dataset && dataset.XPO.muxtasar == '2')
					text += time.fuzzytime( datetime );
				else {
					if (dataset && !dataset.XPO.muxtasar)
						text += time.fuzzytime( datetime ) + ' '+at+' ';
					text += time.formatdate( new Date(datetime), (is24 ? 'HH:mm' : 'hh:mma') );
				}
			} else if (days > 1 && days <= 4) {
				text = time.formatdate( new Date(datetime), 'dddd'+c+' '+(is24 ? 'HH:mm' : 'hh:mma') );
			} else if (months < 2) {
				text = time.formatdate( new Date(datetime), 'Do MMM'+c+' '+(is24 ? 'HH:mm' : 'hh:mma') );
			} else {
				text = time.formatdate( new Date(datetime), 'Do MMM YYYY'+c+' '+(is24 ? 'HH:mm' : 'hh:mma') );
			}
			
			if (e) innerhtml(e, text);
		}
		
		return text;
	};
	time._calcs = {};
	time._replacements = [];
	time._uid = 0;

	time.now = function () { return new Date().getTime(); };
	time.zero = function (s) { return s < 10 ? '0'+s : s };

	time.year	= 31557600000	;
	time.month	= 2629800000	;
	time.day	= 87660000		;
	time.hour	= 3652500		;
	time.minute	= 60875			;
	time.second	= 1000			;
	time.milli	= 1				;

	time.striptime = function (_time) {
		var parsed = new Date(_time||new Date().getTime());
		
		parsed = (parsed.getDate()) + ' ' + monthnames[parsed.getMonth()] + ' ' + parsed.getFullYear() + ' GMT';
		parsed = new Date(parsed);
		if (parsed.toString() === 'Invalid Date') parsed = false;
		
		return parsed;
	};

	/*
	 * both int values
	 * */
	time.traversebydays = function (intdate, num) {
		intdate = new Date( intdate );
		intdate.setDate( intdate.getDate() + num );
		
		return intdate.getTime();
	};

	time.realdatereplace = function (s) {

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
		
	};
	time.replacewithuid = function () {
		time._replacements[time._uid] = time.realdatereplace(arguments[0]);
		++time._uid;
		return '%{'+time._uid+'}';
	};
	time.formatdate = function (date, format) {
		format = format || 'MM/DD/YYYY h:mma';
		
		time._uid = 0;
		time._replacements = [];
		
		val._year		= date.getFullYear()+''					,
		val._shortyear	= parseInt(val._year.substr(-2))		,
		val._month		= date.getMonth()+1						,
		val._monthname	= monthnames[val._month-1]		,
		val._day		= date.getDate()						,
		val._dayname	= weekdays[date.getDay()]		,

		val._hours		= date.getHours()						,
		val._hours12 	= val._hours % 12						,
		val._hours12	= val._hours12 < 1 ? 12 : val._hours12	, // the hour '0' should be '12'

		val._minutes	= date.getMinutes()						,
		val._seconds	= date.getSeconds()						,
		val._ampm		= val._hours >= 12 ? translate('XPO.pm') : translate('XPO.am')		;
		
		
		// get translated month name
		val._monthname = translate(val._monthname);
		val._dayname = translate(val._dayname);
		
		val._o			= translate('XPO.th');
		if (val._day === 1 || val._day === 21 || val._day === 31) val._o = translate('XPO.st');
		if (val._day === 2 || val._day === 22) val._o = translate('XPO.nd');
		if (val._day === 3 || val._day === 23) val._o = translate('XPO.rd');


		var datetimestring = format;
			datetimestring = datetimestring
				.replace(/YYYY/g, time.replacewithuid)
				.replace(/YY/g	, time.replacewithuid)
				.replace(/Y/g	, time.replacewithuid)
				.replace(/HH/g	, time.replacewithuid)
				.replace(/H/g	, time.replacewithuid)
				.replace(/hh/g	, time.replacewithuid)
				.replace(/h/g	, time.replacewithuid)
				.replace(/mm/g	, time.replacewithuid)
				.replace(/m/g	, time.replacewithuid)
				.replace(/ss/g	, time.replacewithuid)
				.replace(/s/g	, time.replacewithuid)
				.replace(/a/g	, time.replacewithuid)
				.replace(/MMMM/g, time.replacewithuid)
				.replace(/MMM/g	, time.replacewithuid)
				.replace(/MM/g	, time.replacewithuid)
				.replace(/M/g	, time.replacewithuid)
				.replace(/dddd/g, time.replacewithuid)
				.replace(/ddd/g	, time.replacewithuid)
				.replace(/DD/g	, time.replacewithuid)
				.replace(/Do/g	, time.replacewithuid)
				.replace(/D/g	, time.replacewithuid)
				;

		var matches;
		datetimestring = datetimestring.replace(/\%\{(\d)*\}/gm, function () {
			return time._replacements[ arguments[1]-1 ];
		});

		return  datetimestring;
	};

	time.start = function (parent) {
		started = 1;
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			time(parent);
			if (started) time.start();
		}, 10*1000);
	};
	time.stop = function () {
		clearTimeout(timeout);
		started = 0;
	};
	Hooks.set('XPO.visible', function () {
		time.start();
	});
	Hooks.set('XPO.hidden', function () {
		time.stop();
	});

	Hooks.set('XPO.widgets', function (parent) {
		if (parent) time(parent);
	});

	Hooks.set('XPO.ready', function () {
//		settings && settings.adaaf('XPO.is24', function () {
//			TODO
//		});
	});
})();