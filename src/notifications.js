;(function(){
	
	var module_name = 'notifications', module_title = 'Notifications', module_icon = 'iconnotifications';
	
	function update_sidebar( count ) {
		if (get_global_object().Sidebar) { Sidebar.set({
			uid: module_name,
			title: module_title,
			icon: module_icon,
			count: 0,
		}); }
	}
	Hooks.set('ready', function () {
		update_sidebar();
	});
	
})();