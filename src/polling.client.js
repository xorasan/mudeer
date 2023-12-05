/* 
 * adds a debug option in settings that shows a sheet listing users currently listening on
 * the broadcast channel
 * */
var Polling;
;(function(){
	'use strict';
	var connections_list;
	
	Hooks.set('ready', function () {
		Settings.adaaf('Polling Connections', 0, function () {
			open_list_sheet('Polling Connections', function (l) {
				connections_list = l;
				Network.get('polling', 'connections', 1);
			});
		}, 'iconsettings');
	});
	
	Network.response.get('polling', 'connections', function (response) {
		if (connections_list && response && response.names) {
			connections_list.title(response.names.length+' active connections');
			response.names.forEach(function (o) {
				connections_list.set({
					title: o
				});
			});
		}
	});
})();