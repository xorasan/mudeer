// put global functions here that are only available to server
var parsestring = function (v, m) { // forces v to be a string, maximum
	if (typeof v == 'string') {}
	else if (typeof v == 'number') v = String(v);
	else v = '';
	if (isnum(m)) v = v.substr(0, m);
	return v;
},
get_time_now = function () {
	return new Date().getTime();
};