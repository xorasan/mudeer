//! reset.server
// fri 10 feb 17
// mon 11 jun 18 added map-uids, events reg'd last get called last
// 25 jul 2020 .set made id optional
// 09 aug 2020 Hooks made global
// 28 sep 2020 .set hook can be an array, reg multiple hooks with the same func
// glatteis hooks
// an EventEmmiter like api
// register cross module and cross app hooks
// jan 2024 Hooks.set_first these hooks get executed before normal hooks
// 23 jan 2024 run* now supports 1+ arguments

var Hooks, hooks;
;(function (){
	'use strict';

	var getargs = function (start_at, oldargs) {
		var args = [];
		for (var i = start_at || 0; i < oldargs.length; ++i) {
			args.push( oldargs[i] );
		}
		return args;
	};

	Hooks = {
		_registry_first: {},
		_registry: {},
		
		// map ids to uids
		_map: {},
		_uid: 0,
		// set multiple handlers on a hook id
		// if id is a fn, then assign it to fn and then gen rand id
		set: function (hook, id, fn, priority) {
			if (hook instanceof Array) {
				hook.forEach(function (item) {
					Hooks.set(item, id, fn, priority);
				});
				return;
			}
			
			var registry = Hooks._registry;
			if (priority) registry = Hooks._registry_first;
				
			if (typeof id === 'function')
				fn = id, id = new Date().getTime();
				
			if (typeof fn === 'function') {
				// check if there's a hook by that name
				if (registry[hook] === undefined) {
					registry[hook] = [];
				}
				
				++Hooks._uid;
				
				// register using uid
				registry[hook][Hooks._uid] = fn;
				
				// map uid under id
				Hooks._map[hook+'_'+id] = Hooks._uid;
				return true;
			}
			return false;
		},
		set_first: function (hook, id, fn) {
			return this.set(hook, id, fn, 1);
		},
		// run all handlers listening on this id and pass it this extras object
		// add a try/catch clause to both run* fn's; make contigencies
		run: function (hook, extras) {
			var args = getargs(1, arguments);

			var handlers_first = Hooks._registry_first[hook];
			var handlers = Hooks._registry[hook];
			if (handlers_first instanceof Array || handlers instanceof Array) {
				handlers = ( handlers_first || [] ).concat( handlers || [] );
				for (var i in handlers) {
					if (typeof handlers[i] === 'function') {
						handlers[i].apply(handlers[i], args);
					}
				}
				return true;
			}
			return false;
		},
		// runs handlers until one of them returns anything that evals to true
		// useful for cascading events like taps
		// returns false if no handler returned true-like value
		rununtilconsumed: function (hook, extras) { // use .until instead if u want a promise
			var args = getargs(1, arguments);
			
			var handlers_first = Hooks._registry_first[hook];
			var handlers = Hooks._registry[hook];
			if (handlers_first instanceof Array || handlers instanceof Array) {
				handlers = ( handlers_first || [] ).concat( handlers || [] );
				for (var i in handlers) {
					if (typeof handlers[i] === 'function') {
						var returnedvalue = handlers[i].apply(handlers[i], args);
						if (returnedvalue) {
							return returnedvalue;
						}
					}
				}
			}
			return false;
		},
		until: async function (hook, extras) { // uses promises
			var args = getargs(1, arguments);
			
			var handlers_first = Hooks._registry_first[hook];
			var handlers = Hooks._registry[hook];
			if (handlers_first instanceof Array || handlers instanceof Array) {
				handlers = ( handlers_first || [] ).concat( handlers || [] );
				for (var i in handlers) {
					if (typeof handlers[i] === 'function') {
						var returnedvalue = await handlers[i].apply(handlers[i], args);
						if (returnedvalue) {
							return returnedvalue;
						}
					}
				}
			}
			return false;
		},
		pop: function (hook, id) {
			if (Hooks._registry_first[hook]) {
				// get its uid from map using hook+id, access using uid
				delete Hooks._registry_first[hook][ Hooks._map[hook+'_'+id] ];
				return true;
			}
			if (Hooks._registry[hook]) {
				// get its uid from map using hook+id, access using uid
				delete Hooks._registry[hook][ Hooks._map[hook+'_'+id] ];
				return true;
			}
			return false;
		},
		// new hook, creates an empty array for now
		// TODO add options like what kinda handlers to allow/disallow
		// 		max handlers, delete if too many, tagging to group similar hooks together etc
		hook: function (hook) {
			Hooks._registry_first[hook] = [];
			Hooks._registry[hook] = [];
		},
		// remove a hook and all its listeners
		unhook: function (hook) {
			delete Hooks._registry_first[hook];
			delete Hooks._registry[hook];
		}
	};
	
	module.exports = Hooks;
	hooks = Hooks;
})();