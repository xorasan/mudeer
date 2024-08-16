// put global functions here available to both server and client
get_global_object = function () { // to check module prop in window.* or global.*
	return window || {}; // window is the global object on server side
},
generate_alias = function (o, l) { // this replaces helpers.alias database.alias wuqu3aat.alias
	// this generates url friendly links for titles of say blog posts ...
	o = o || '';
	if (o.length === 0) return '';
	
	l = l || 255;
	
	o = o.substr(0, l)
		.replace(/\%/g,						' pct'			)
		.replace(/\@/g,						' at '			)
		.replace(/\&/g,						' and '			)
		.replace(/[$-\-/:-?\{\}-~!"^`\[\]@#]/g,	'-'				) // symbols
		.replace(/[^.\d\wa-zA-Z0-9ا-ےÄäÜüÖößЀ-ҁҊ-ӿÇçĞğŞşIıÜüﻙ]+/g,	'-'	) // most alphanums
		.replace(/\s[\s]+/g,					'-'				)
		.replace(/[\s]+/g,						'-'				)
		.replace(/^[\-]+/g,					''				)
		.replace(/[\-]+$/g,					''				)
		.replace(/\-\-/g,						'-'				)
		.replace(/\.\-/g,						'.'				)
		.replace(/\-\./g,						'.'				)
		.replace(/^\./g,						''				)
		.replace(/\.$/g,						''				)
		.trim()
		.toLowerCase();
	
	return o;
},
stringify = JSON.stringify,
parsejson = function (o) {
	return JSON.parse(o);
},
mubaaraat = function (str, re) {
	return (str.match(re)||[])[0];
},
tabdeel = function (str, arr) {
	if (isstr(str) && isarr(arr)) {
		for (var i = 0; i < arr.length; i += 2) {
			str = str.replace(arr[i], arr[i+1]);
		}
	}
	return str;
},
deepcopy = function (v) {
	// TODO deep copy obj recursively
},
isundef = function (v) {
	return v === undefined;
},
isstr = function (v) {
	return typeof v == 'string';
},
isfinite = function (v) {
	return Number.isFinite(v);
},
isnan = function (v) {
	return Number.isNaN(v);
},
isnum = function (v) {
	return typeof v == 'number' && !isnan(v) && isfinite(v);
},
isfun = function (v) {
	return typeof v == 'function';
},
isarr = function (v) {
	return Array.isArray(v);
},
areobjectsequal = function (a, b) { // only compares primitives bw 2 objs
	var same = 1;
	if (a && b && Object.keys(a).length === Object.keys(b).length)
	for (var i in a) {
		if (a[i] !== b[i]) {
			same = 0;
			break;
		}
	}
	else same = 0;
	return same;
},
zero = function (num) {
	return num < 10 ? '0'+num : num;
},
push_if_unique = function (arr, v) {
	if (!arr.includes( v ))
		arr.push( v );
},
collapsearray = function (arr) {
	var arr2 = [];
	arr.forEach(function (e) {
		if (!isundef(e)) arr2.push(e);
	});
	return arr2;
},
array2string = function (arr) { // [ 1, 2 ] -> " 1 2"
	return ' '+arr.join(' ');
},
intersect = function (arr, superset) { // [ num, num, ... ]
	var arr2 = [];
	arr.forEach(function (item) {
		if (!isundef(superset[ item ])) arr2.push(item);
	});
	return arr2;
},
shallowcopy = function (v) { // return a copy of array of objs or just one obj
	// returns numbers and strings as is
	if (isnum(v) || isstr(v)) {
		return v;
	} else
	if (v instanceof Array) {
		var v2 = [];
		v.forEach(function (item) {
			v2.push( Object.assign({}, item) );
		});
		return v2;
	}
	else {
		return Object.assign({}, v);
	}
},
parseint = function (v, r) {
	return parseInt(v, r);
},
parsefloat = function (v, n) {
	if (n) v = parseFloat(v).toFixed(n);
	return parseFloat(v);
},
parsestring = function (v, m) { // forces v to be a string, maximum
	if (isstr(v)) {}
	else if (isnum(v)) v = String(v);
	else if (v && v.toString) v = v.toString();
	else v = '';
	if (isnum(m)) v = v.substr(0, m);
	return v;
},
is_truthy = function (v) { return [true , 'true' , '1', 1, 'y', 'yes'].includes(v) || !!v; },
is_falsy  = function (v) { return [false, 'false', '0', 0, 'n', 'no' ].includes(v) || !v; },
to_bool = function (v) { return is_truthy(v) ? true : false; },
to_bool_num = function (v) { return is_truthy(v) ? 1 : 0; },
to_str_or_num = function (v) {
	if (isundef(v)) return;
	else if (isnum(v) || isstr(v)) return v;
	else return parsestring(v);
},
to_num = function (v) { // forces v to be an integer or float or undefined
	if (isundef(v)) return;
	else if (isnum(v) || isstr(v)) {
		v = Number(v);
		if (isnan(v)) return;
		return v;
	}
	return;
},
to_arr_or_undef = function (v) { // forces v to be an arr (even an empty one) or undefined
	if (isundef(v)) return;
	else if (!isarr(v)) return [];
	return v;
},
intify = function (arr) {
	for (var i = 0; i < arr.length; ++i) {
		arr[i] = parseint(arr[i]);
	}
	return arr;
},
tolower = function (s) {
	return (s||'').toLowerCase();
},
toupper = function (s) {
	return (s||'').toUpperCase();
};

