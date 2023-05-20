//+ jaddad okay cancel onshow show hide fahras
var datepicker;
;(function(){
	var fahras = {}, keys, edittime;

	datepicker = {
		okay: 0,
		cancel: 0,
		onshow: 0,
		jaddad: function (edittime) {
			edittime = edittime || new Date();
			
			keys.XPO.year.innerText		=	edittime.getFullYear()	;
		
			keys.XPO.month.dataset.XPO.i18n = time.monthname( edittime.getMonth() );
			
			keys.XPO.day.innerText		=	time.zero(edittime.getDate()		);

			var is24	=	preferences.get(24, 1)	,
				hours	=	edittime.getHours();
			if (!is24) {
				if (hours >= 12) {
					hours = time.zero(hours === 12 ? 12 : hours - 12) + translate('XPO.pm');
				} else {
					hours = time.zero(hours === 0 ? 12 : hours) + translate('XPO.am');
				}
			} else {
				hours = time.zero( hours ); 
			}
			
			keys.XPO.hour.innerText		=	hours;

			keys.XPO.minute.innerText	=	time.zero(edittime.getMinutes()	);
			keys.XPO.second.innerText	=	time.zero(edittime.getSeconds()	);

			translate.update(XPO.datepickerui);
		},
		hide: function () {
			XPO.datepickerui.hidden = 1;
		},
		show: function (element) {
			XPO.datepickerui.hidden = 0;
			
			datepicker.onshow && datepicker.onshow(element);
			
			edittime = new Date( parseInt(element.dataset.XPO.time) );
			
			keys.XPO.year.focus();
			
			datepicker.jaddad(edittime);
			
			datepicker.okay = function () {
				webapp.blur();
				element.dataset.XPO.time = edittime.getTime();
				time();
				Hooks.run('XPO.back');
			};

			datepicker.cancel = function () {
				webapp.blur();
				Hooks.run('XPO.back');
			};

			softkeys.set(K.rt, function (k, e) {
				var a = document.activeElement;
				
				if (a) {
					a = a.dataset.XPO.id;
					if (a == 'XPO.year') edittime.setFullYear( edittime.getFullYear()+1 );
					if (a == 'XPO.month') edittime.setMonth( edittime.getMonth()+1 );
					if (a == 'XPO.day') edittime.setDate( edittime.getDate()+1 );
					
					if (a == 'XPO.hour') edittime.setHours( edittime.getHours()+1 );
					if (a == 'XPO.minute') edittime.setMinutes( edittime.getMinutes()+1 );
					if (a == 'XPO.second') edittime.setSeconds( edittime.getSeconds()+1 );
					
					datepicker.jaddad(edittime);
				}
				e && e.preventDefault();
			});
			softkeys.set(K.lf, function (k, e) {
				var a = document.activeElement;
				
				if (a) {
					a = a.dataset.XPO.id;
					if (a == 'XPO.year') edittime.setFullYear( edittime.getFullYear()-1 );
					if (a == 'XPO.month') edittime.setMonth( edittime.getMonth()-1 );
					if (a == 'XPO.day') edittime.setDate( edittime.getDate()-1 );
					
					if (a == 'XPO.hour') edittime.setHours( edittime.getHours()-1 );
					if (a == 'XPO.minute') edittime.setMinutes( edittime.getMinutes()-1 );
					if (a == 'XPO.second') edittime.setSeconds( edittime.getSeconds()-1 );
					
					datepicker.jaddad(edittime);
				}
				e && e.preventDefault();
			});
		},
		fahras: function (parent) {
			var elements = (parent||document.body).querySelectorAll('[data-XPO.datepicker]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.XPO.datepicker !== undefined ) {
					elements[i].dataset.XPO.time = elements[i].dataset.XPO.time || time.now();
					elements[i].onclick = function () {
						Hooks.run('XPO.dialog', this);
					};
				}
			}
			return fahras;
		},
	};

	Hooks.set('XPO.ready', function () {
		keys = templates.keys(XPO.datepickerui);
		keys.XPO.today.onclick = function () {
			edittime.setTime( time.now() );
			datepicker.jaddad();
		};
		datepicker.fahras();
	});

	Hooks.set('XPO.widgets', function (parent) {
		if (parent) datepicker.fahras(parent);
	});

})();