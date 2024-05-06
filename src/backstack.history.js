/* @TODO
 * this sub-module is supposed to connect backstack with the history api
 * it should do so transparently since mudeer already has a backstack logic
 * 
 * it can be as simple as root / view / sheet / dialog
 * basically four levels
 * 
 * any app that needs to run on platforms with a back button that needs the
 * history api (like android) should include this sub-module
 * */

;(function(){
	'use strict';
	var uuid = 0, debug_backstack_history = 0;
	
	/* NOTE
	 * clear the history stack requires boilerplate code
	 * basically whenever you call history.back, you shouldn't call it again
	 * until you receive a popstate event from the browser, it is that ugly
	 * */
	// NEW LOGIC

	history.scrollRestoration = 'manual';

	var chronicle = [];
	Backstack.entries = function () { // get a copy of the chronicle entries
		return [].concat(chronicle);
	};
	Backstack.entries_length = function () {
		return chronicle.length;
	};
	// override the original .back function
	var original_back_function = Backstack.back;
	Backstack.back = function () {
		if (chronicle.length || history.state) {
			if (debug_backstack_history) $.log.w( 'history.back()' );
			history.back();
		}
		else {
			if (debug_backstack_history) $.log.w( 'original_back_function()' );
			original_back_function();
		}
	};

	// /Philosophy/Backstack.md
	function get_last_entry() {
		 return chronicle[ chronicle.length-2 ];
	}
	function get_current_entry() {
		 return chronicle[ chronicle.length-1 ];
//		 return { state: history.state, link: location.pathname };
	}

	function parse_link(link) {
		if (!isundef(link)) link = location.pathname;
		
		var is_main = link == '/', is_view, view_uid, is_sheet, sheet_uid, is_dialog, dialog_uid;
		var crumbs = link.split('/'), last_crumb = '';
		crumbs.forEach(function (crumb, i) {
			if (crumb.startsWith('-')) is_sheet = crumb.slice(1);
			else if (crumb.startsWith('?')) is_dialog = crumb.slice(1);
			else {
				if (last_crumb.startsWith('-')) {
					if (isundef(sheet_uid)) {
						sheet_uid = crumb;
					}
				} else if (last_crumb.startsWith('?')) {
					if (isundef(dialog_uid)) {
						dialog_uid = crumb;
					}
				} else if (i == 1) {
					is_view = crumb;
				} else if (i == 2 && isundef(view_uid)) {
					view_uid = crumb;
				}
			}
			
			last_crumb = crumb;
		});
		return { is_main, is_view, view_uid, is_sheet, sheet_uid, is_dialog, dialog_uid };
	}
	Backstack.parse = parse_link;
	function restore_crumbs(crumbs) {
		// your module should use this to maintain state silently
		// like triggering Sheet.cancel or Dialog.cancel helps dependent modules to cleanup temporary objects
		Hooks.run('backstack-crumbs', crumbs);
		
		// set these first to have the correct level beforehand
		if (crumbs.is_view) {
			// CHECK should view be 1 here?
		} else if (crumbs.is_main) {

		}
		if (!crumbs.is_sheet) {
			Backstack.states.sheet = 0;
		}
		if (!crumbs.is_dialog) {
			Backstack.states.dialog = 0;
		}

		if (crumbs.is_view) {
			Backstack.view({
				name: crumbs.is_view,
				uid: crumbs.view_uid,
			}, 1);
		} else if (crumbs.is_main) {
			if (!Backstack.is_main_in_startup()) {
				original_back_function();
			}

			Backstack.states.view = 0;
			Backstack.states.main = 1;
		}

		if (crumbs.is_sheet) {
			Backstack.sheet({
				name: crumbs.is_sheet,
				uid: crumbs.sheet_uid,
			}, 1);
		}

		if (crumbs.is_dialog) {
			Backstack.dialog({
				name: crumbs.is_dialog,
				uid: crumbs.dialog_uid,
			}, 1);
		}
	}

	var save_scroll_position = 0;
	Backstack.scroll_positions = {};
	Backstack.get_scroll_position = function () {
		return Backstack.scroll_positions[ chronicle.length ];
	};
	Backstack.save_scroll_position = function () { if (save_scroll_position) {
		var scroller = scrollingelement();
		if (scroller) {
			var old_object = history.state || {};
			old_object = Object.assign(old_object, { scroll_position: scroller.scrollTop });
			if (debug_backstack_history) $.log.w( 'Backstack save_scroll_position', scroller.scrollTop );
			history.replaceState(old_object, document.title);
		}
	} };
	Backstack.restore_scroll_position = function (o) {
		if (history.state) {
			o = o || {};
			var position = history.state.scroll_position;
			if (!isnum(position)) {
				position = o.bottom ? scrollingelement().scrollHeight : undefined;
			}
			if (debug_backstack_history) $.log.w( 'Backstack restore_scroll_position', o, position );
			if (isnum(position)) {
				scroll_to(0, position);
			}
		}
	};
	Backstack.disable_scroll_position = function () {
		if (debug_backstack_history) $.log.w( 'Backstack disable_scroll_position' );
		save_scroll_position = 0;
	};
	Backstack.enable_scroll_position = function () {
		if (debug_backstack_history) $.log.w( 'Backstack enable_scroll_position' );
		save_scroll_position = 1;
	};
	Hooks.set('backstack', function () {
		Backstack.disable_scroll_position();
	});
	Hooks.set('view-loaded', function () {
		Backstack.enable_scroll_position();
	});
	
	var ignore_once; // for popstate, useful for reconstructing previous entries or reloading the current one
	listener('scroll', function (event) { $.taxeer('backstack-save-scroll', function () {
		Backstack.save_scroll_position();
	}, 50); }, { passive: 1 });
	listener('popstate', function (event) {
		// retrieve all states from the link

		var crumbs = parse_link( location.pathname );
		
		if (debug_backstack_history) $.log.w( 'Backstack popstate', location.pathname, crumbs );
		if (chronicle.length) {
			var item = chronicle.pop();
			if (item) {
				var position = Backstack.get_scroll_position();
				if (isnum(position)) {
//					scrollTo({ left: 0, top: position, behavior: 'instant' });
				}
			}
		}
		
		if (ignore_once) {
			if (debug_backstack_history) $.log.w( 'Backstack ignoring once' );
			ignore_once = 0;
			return;
		}

		// TODO detect if it's a back or forward event
		if (event.state) {
			if (event.state.uuid > uuid) { // $.log( 'popstate forward' );
			} else { // $.log( 'popstate back' );
			}
		} else { // $.log( 'popstate back' );
		}
		var state = (event.state||{});
		uuid = state.uuid||uuid;

		restore_crumbs(crumbs);
	});
	// allows various simple and predictable use cases
	// push state should generate the link and state for the entire view>sheet>dialog stack
	// prefix "-" always opens a sheet
	// prefix "?" always opens a dialog
	// these prefixes are not allowed for other names
	// "-lounge" "-call" "-rooms" would just open a sheet
	// 		 main		view		view-uid	sheet			dialog					extra-uid
	// link: /			/call		/lounge		/-call-members	/?add-call-member		/<uid>
	// link: /			/rooms		/lounge		/-room-members	/?delete-room-member	/<uid>
	// link: /			/rooms					/-add-member							/<uid>
	// link: /			/accounts	/account-uid/-edit-account
	// for old code
	// link: /			/rooms		/lounge		/-missing-name	/?missing-id
	// TODO require sheets and dialogs to provide regenerable UIDs
	function push_state() {
		if (debug_backstack_history) $.log.w( 'Backstack push_state' );
		var states = Backstack.states;
		var link = '/';
		var state = {
			uuid: ++uuid,
		};
		if (states.view) { // rooms
			var view_name = View.get();
			var view_uid = View.get_uid();
			// if it's a home view and no uid is present, then stay at root
			if (Webapp.is_home_view(view_name) && !view_uid) {

			} else {
				state.view = view_name;
				link += view_name+'/';
				if (view_uid) { // room-uid
					state.view_uid = view_uid;
					link += view_uid+'/';
				}
			}
		}
		if (states.sheet) { // (create) room
			var sheet_name = '-'+(Sheet.get_active() || 'missing-name');
			state.sheet = sheet_name;
			link += sheet_name+'/';
			var sheet_uid = Sheet.get_active_uid();
			if (sheet_uid) { // room-uid
				state.sheet_uid = sheet_uid;
				link += sheet_uid+'/';
			}
		}
		if (states.dialog) { // delete room?
			var dialog_name = '?'+(Dialog.get_name() || 'missing-name');
			state.dialog = dialog_name;
			link += dialog_name+'/';
			var dialog_uid = Dialog.get_uid();
			if (dialog_uid) { // room-uid
				state.dialog_uid = dialog_uid;
				link += dialog_uid+'/';
			}
		}

		// check if the current entry is the same as the one being pushed, if so, restore it silently
		var current_entry = get_current_entry();
		if (current_entry && current_entry.link && current_entry.link == link || location.pathname == link) {
			if (debug_backstack_history) $.log.w( 'Backstack staying at current entry silenty' );
			return;
		}

		chronicle.push({ state, link });
		history.pushState( state, '', link );
	}
	
	// backstack-* hooks are refined and validate calls
	Hooks.set('backstack-dialog', function (args) {
		if (debug_backstack_history) $.log.w( 'Backstack Dialog', args );
		push_state();
	});
	Hooks.set('backstack-sheet', function (args) {
		if (debug_backstack_history) $.log.w( 'Backstack Sheet', args );
		push_state();
	});
	Hooks.set('backstack-view', function (args) {
		if (debug_backstack_history) $.log.w( 'Backstack View', args );
		push_state();
	});
	Hooks.set('backstack-main', function (args) {
		if (debug_backstack_history) $.log.w( 'Backstack Main', Backstack.is_main_in_startup() ? 'Startup' : '' );
		if (Backstack.is_main_in_startup()) {
			// ignore, dont push
		} else {
			push_state();
		}
	});
	Hooks.set('ready', function () {
		if (debug_backstack_history) $.log.w( 'Backstack History Ready' );
		$.taxeer('backstack-history-ready', function () {
			var crumbs = parse_link( location.pathname );
			restore_crumbs(crumbs);
			Backstack.states.main = 1; // Testing
		}, 100);
	});
	
})();
