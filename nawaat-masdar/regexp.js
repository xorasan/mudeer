//+ re regex
$.re = function (string, automaton, flags) { // automaton, flags
	var object = (new RegExp(automaton||'', flags||'')).exec(string||'') || {};
	
	object.re = function (automaton, flags) {
		return $.re(object[0]||'', automaton, flags);
	};
	
	return object;
};
//$.regex = require('xregexp');
//$.regex.install('astral');
$.regex = $.re;