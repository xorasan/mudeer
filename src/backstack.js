/* @TODO
 * add .back_twice_to_exit, which adds having to press back/esc twice to exit with taxeer
 * also make the exit button red when in delay
 * is_darajah is_level or is_stage or is_state
 * */
var backstack;
;(function(){
	var s,
	storage = {
		3	:	{}, // searches, dialogs, menus
		2	:	{}, // settings, ...
		1	:	{}, // lists, editors, renderuis, ...
		0	:	{}, // main, ...
	},
	l = function () {
		var darajah = 0;
		if (s.dialog) darajah = 3;
		else if (s.sheet) darajah = 2;
		else if (s.view) darajah = 1;
		else darajah = 0;
		backstack.darajah = darajah;
		return darajah;
	},
	savefocus = function () { // save focus on each darajah, restore automatically
		backstack.set('XPO.backstackfocus', document.activeElement);
	},
	restorefocus = function () {
		var active = backstack.get('XPO.backstackfocus');
		active && active.focus && active.focus();
	};

	/*
	 * this is the mudeer standalone platform
	 * there's no browser history stack or back+forward buttons to worry about
	 * so we can take full control
	 * no need to make it compatible with almudeer since that's for PWAs
	 * here we have way more freedom so let's capitalize on it
	 * 
	 * this basically replaces the browser backstack
	 * 
	 * the backstack event is fired on all changes
	 * */
	backstack = {
		darajah: 0,
		states: {
			dialog	:	0, // searches, dialogs, menus
			sheet	:	0, // settings, ...
			view	:	0, // lists, editors, renderuis, ...
			main	:	0, // main, ...
		},
		set: function (key, value) {
			storage[backstack.darajah][key] = value;
		},
		get: function (key) {
			if (key)	return storage[backstack.darajah][key]	;
			else		return storage[backstack.darajah]		;
		},
		dialog: function (args) {
			savefocus();
			s.dialog = args || 1;
			l();
			storage[backstack.darajah] = {};
			Hooks.rununtilconsumed('XPO.backstackdialog', args);
			Hooks.run('XPO.backstack', backstack.darajah);
		},
		sheet: function (args) {
			savefocus();
			s.sheet = args || 1;
			l();
			storage[backstack.darajah] = {};
			Hooks.rununtilconsumed('XPO.backstacksheet', args);
			Hooks.run('XPO.backstack', backstack.darajah);
		},
		view: function (args) {
			savefocus();
			s.view = args;
			l();
			storage[backstack.darajah] = {};
			Hooks.rununtilconsumed('XPO.backstackview', args);
			Hooks.run('XPO.backstack', backstack.darajah);
		},
		main: function (args) {
			savefocus();
			s.main = args || 1;
			l();
			storage[backstack.darajah] = {};
			Hooks.rununtilconsumed('XPO.backstackmain', args);
			Hooks.run('XPO.backstack', backstack.darajah);
		},
		back: function () {
			/*
			 * if any dialog is open, close them first, then sheets, then mains
			 * */
			if (s.dialog)
				s.dialog	= 0, l(), Hooks.run('XPO.closeall', 3);
			else if (s.sheet)
				s.sheet		= 0, l(), Hooks.run('XPO.closeall', 2);
			else if (s.view)
				s.view = 0, s.main = 1, l(), Hooks.run('XPO.closeall', 1);
			else
				s.main		= 0, l(), Hooks.run('XPO.closeall', 0);
			
			/*
			 * then see what is left open and refire its event with stored args
			 * */
			Hooks.run('XPO.restore', backstack.darajah);
			Hooks.run('XPO.backstack', backstack.darajah);
			
			restorefocus();
		},
	};
	
	Hooks.set('XPO.back', function () {
		backstack.back();
	});
	Hooks.set('XPO.dialog', function (args) {
		backstack.dialog(args);
	});
	Hooks.set('XPO.sheet', function (args) {
		backstack.sheet(args);
	});
	Hooks.set('XPO.view', function (args) {
		backstack.view(args);
	});
	Hooks.set('XPO.main', function (args) {
		backstack.main(args);
	});

	// used internally
	s = backstack.states;
})();
