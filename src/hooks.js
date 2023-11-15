//+ _registry _map _uid hook unhook run rununtilconsumed hooks
// fri 10 feb 17
// mon 11 jun 18 added map-uids, events reg'd last get called last
// 25 jul 2020 .set made id optional
// 09 aug 2020 Hooks made global
// 28 sep 2020 .set hook can be an array, reg multiple hooks with the same func
// glatteis hooks
// an EventEmmiter like api
// register cross module and cross app hooks

var Hooks, hooks;
;(function (){
	'use strict';
	Hooks = {
		_registry: {},
		
		// map ids to uids
		_map: {},
		_uid: 0,
		// set multiple handlers on a hook id
		// if id is a fn, then assign it to fn and then gen rand id
		set: function (hook, id, fn) {
			if (hook instanceof Array) {
				hook.forEach(function (item) {
					Hooks.set(item, id, fn);
				});
				return;
			}
				
			if (typeof id === 'function')
				fn = id, id = new Date().getTime();
				
			if (typeof fn === 'function') {
				// check if there's a hook by that name
				if (Hooks._registry[hook] === undefined) {
					Hooks._registry[hook] = [];
				}
				
				++Hooks._uid;
				
				// register using uid
				Hooks._registry[hook][Hooks._uid] = fn;
				
				// map uid under id
				Hooks._map[hook+'_'+id] = Hooks._uid;
				return true;
			}
			return false;
		},
		// run all handlers listening on this id and pass it this extras object
		// add a try/catch clause to both run* fn's; make contigencies
		run: function (hook, extras) {
			var handlers = Hooks._registry[hook];
			if (handlers instanceof Array) {
				for (var i in handlers) {
					if (typeof handlers[i] === 'function') {
						handlers[i](extras);
					}
				}
				return true;
			}
			return false;
		},
		// runs handlers until one of them returns anything that evals to true
		// useful for cascading events like taps
		// returns false if no handler returned true-like value
		rununtilconsumed: function (hook, extras) {
			var handlers = Hooks._registry[hook];
			if (handlers instanceof Array) {
				for (var i in handlers) {
					if (typeof handlers[i] === 'function') {
						var returnedvalue = handlers[i](extras);
						if (returnedvalue) {
							return returnedvalue;
						}
					}
				}
			}
			return false;
		},
		pop: function (hook, id) {
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
			Hooks._registry[hook] = [];
		},
		// remove a hook and all its listeners
		unhook: function (hook) {
			delete Hooks._registry[hook];
		}
	};
	
	module.exports = Hooks;
	hooks = Hooks;
})();