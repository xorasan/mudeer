;(function(){

	function children_count() {
		var c = main_list.keys.items.childElementCount;
		if (isnan(c)) c = 0;
		return c;
	}
	function on_scroll() {
		// determine the rendered dimensions of the list element
		var el = main_list.element;
		var bb = el.getBoundingClientRect();
		var y = bb.y;
		var bottom = bb.bottom;
		var available_height = 0;
		if (y <= 0 && bottom < innerheight()) {
			available_height = bottom;
		} else {
			available_height = innerheight() - (y > 0 ? y : 0);
		}
		
		var visible_items = Math.floor(available_height / 64);
		var scroll_y = (y <= 0 ? -y : 0);
		var items_before = Math.floor(scroll_y / 64);
		if (isnan(items_before)) items_before = 0;

		$.log(
			'y:', scroll_y, 'available_height:', available_height,
			'visible_items:', visible_items, 'items_before:', items_before, 'padding_top', scroll_y % 64
		);

		var diff = visible_items - children_count();
		if (diff > 0) { // add more
			// find out items that are offscreen
			
			
			for (var i = 0; i < Math.abs(diff); ++i) {
				// TODO before dom set hook
				var clone = templates.get(main_list._listitem, main_list.keys.items, false, time.now())();
				// TODO after dom set hook
			}
		}
		if (diff < 0) { // remove
			for (var i = 1; i < Math.abs(diff); ++i) {
				// TODO before dom removal hook
//				main_list.keys.items.children[i].remove();
				// TODO after dom removal hook
			}
		}

		for (var i = 0; i < visible_items; ++i) {
			var clone = main_list.keys.items.children[i];
			if (i < items_before) {
				clone.remove();
			}
		}
		
		if (visible_items) {
			var padding_top = items_before * 64;
			var clone = main_list.keys.items.children[0];
			if (clone)
				clone.style.paddingTop = padding_top+'px';
		}
		
		// TODO which items stay the same
		for (var i = 0; i < visible_items; ++i) {
			var uid = parseint(items_before + i);
			var clone = main_list.keys.items.children[i];
			var obj = main_list.adapter.get(uid);
			if (clone) {
				templates.set(clone, obj, main_list._listitem);
				setdata(clone, 'uid', uid);
			}
		}
		// determine the potential scroll height
//		main_list.adapter.length;
	}

	if (window.List) {
		List.recycle = function (yes) {
			this._recycle = yes;
			if (yes) { // add to scroll listener
				
			} else {
				
			}
			return this;
		};
	}
//	main_list.element.style.height = (main_list.adapter.length * 64)+'px';
//	main_list.adapter.each(function (o, i) {
//		o.dom_top = parseint( i ) * 64;
//	});
//	on_scroll();

//	Hooks.set('scroll', on_scroll);

})();