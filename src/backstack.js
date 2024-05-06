/* @TODO
 * add .back_twice_to_exit, which adds having to press back/esc twice to exit with delay
 * also make the exit button red when in delay
 * is_darajah is_level or is_stage or is_state
 * */
var Backstack, backstack;
;(function(){
	var s,
	storage = {
		3	:	{}, // searches, dialogs, menus
		2	:	{}, // settings, ...
		1	:	{}, // lists, editors, renderuis, ...
		0	:	{}, // main, ...
	},
	do_level = function () {
		var level = 0;
		if (s.dialog) level = 3;
		else if (s.sheet) level = 2;
		else if (s.view) {
			var view_name = s.view.name;
			var view_uid = s.view.uid;

			if (Webapp.is_home_view(view_name) && !view_uid) {
				level = 0;
			} else {
				level = 1;
			}
		}
		else level = 0;
		Backstack.darajah = level;
		return level;
	},
	savefocus = function () { // save focus on each level, restore automatically
		backstack.set('backstackfocus', document.activeElement);
	},
	restorefocus = function () {
		var active = backstack.get('backstackfocus');
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
	Backstack = backstack = {
		storage,
		darajah: 0,
		states: {
			dialog	:	0, // searches, dialogs, menus
			sheet	:	0, // settings, ...
			view	:	0, // lists, editors, renderuis, ...
			main	:	0, // main, ...
		},
		do_level,
		set: function (key, value) {
			storage[backstack.darajah][key] = value;
		},
		get: function (key) {
			if (key)	return storage[backstack.darajah][key]	;
			else		return storage[backstack.darajah]		;
		},
		dialog: function (args, backing) {
			savefocus();
			s.dialog = args || 1;
			do_level();
			storage[backstack.darajah] = {};
			Hooks.rununtilconsumed('backstackdialog', args);

			if (!backing) Hooks.run('backstack-dialog', args);

			Hooks.run('backstack', backstack.darajah);
		},
		sheet: function (args, backing) {
			savefocus();
			s.sheet = args || 1;
			do_level();
			storage[backstack.darajah] = {};
			Hooks.rununtilconsumed('backstacksheet', args);

			if (!backing) Hooks.run('backstack-sheet', args);

			Hooks.run('backstack', backstack.darajah);
		},
		view: function (args, backing) {
			if (args == 'main') {
				s.view = 0;
				this.main(args);
				return;
			}
			
			savefocus();
			s.view = args;
			do_level();
			storage[backstack.darajah] = {};
			Hooks.rununtilconsumed('backstackview', args);

			if (!backing) Hooks.run('backstack-view', args);

			Hooks.run('backstack', backstack.darajah);
		},
		main: function (args) { // 1 = active, 2 = Webapp startup
			savefocus();
			s.main = args || 1;
			do_level();
			storage[backstack.darajah] = {};
			// this has to trigger before the next two to maintain titles in the backstack
			Hooks.run('backstack-main', s.main);

			Hooks.rununtilconsumed('backstackmain', args);
			Hooks.run('backstack', backstack.darajah);
		},
		is_main_in_startup: function () {
			return s.main === 2 ? 1 : 0;
		},
		close_all: function () { // this should return the states to main
			if (s.dialog)
				s.dialog	= 0, do_level(),				Hooks.run('closeall', 3);

			if (s.sheet)
				s.sheet		= 0, do_level(),				Hooks.run('closeall', 2);

			if (s.view)
				s.view		= 0, s.main = 1, do_level(),	Hooks.run('closeall', 1);
		},
		back: function () {
			// if any dialog is open, close them first, then sheets, then mains
			if (s.dialog)
				s.dialog	= 0, do_level(),				Hooks.run('closeall', 3);
			else if (s.sheet)
				s.sheet		= 0, do_level(),				Hooks.run('closeall', 2);
			else if (s.view)
				s.view		= 0, s.main = 1, do_level(),	Hooks.run('closeall', 1);
			else
				s.main		= 0, do_level(),				Hooks.run('closeall', 0);

			// then see what is left open and refire its event with stored args
			Hooks.run('restore', Backstack.darajah);
			Hooks.run('backstack', Backstack.darajah);

			restorefocus();
		},
	};
	
	Hooks.set('back', function () {
		Backstack.back();
	});
	Hooks.set('dialog', function (args) {
		Backstack.dialog(args);
	});
	Hooks.set('sheet', function (args) {
		Backstack.sheet(args);
	});
	Hooks.set('view', function (args) {
		Backstack.view(args);
	});
	Hooks.set('main', function (args) {
		Backstack.main(args);
	});

	// used internally
	s = Backstack.states;
})();
