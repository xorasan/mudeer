var Recycler, debug_recycler = 0;
;(function(){
	var Sidebar = get_global_object().Sidebar, module_name = 'recycler', module_title = 'Recycler',
		listitem = 'recycler_item';
	
	Offline.create(module_name, 0, {
		mfateeh: ['order'],
		keyvalue: 1,
	});
	Offline.create(module_name, 'counts', {
		keyvalue: 1,
	});
	Offline.create(module_name, 'ranges', {
		keyvalue: 1,
	});
	
	var all_recyclers = {}, recycler_uid = 0;

	Recycler = function (list, name, need = 'default', size = 20) {
		var recycler = { list, name, need, size, start: 0, end: size, enabled: 1, reverse: 0, uid: recycler_uid++ };
		all_recyclers[recycler.uid] = recycler; // TODO delete on destroy
		
		// TODO add a Network response on count per module if name need is there with a condition to filter the
		// response using a custom callback
		
		var cache_enabled, phrases = {
			next: 'Next',
			prev: 'Previous',
		};
		var active = 1, removal_in_progress;
		list.listen_on_press(async function ( o, k ) {
			if (o.uid == 'prev') {
				await recycler.prev();
				list.select_by_uid( 'prev' );
			}
			if (o.uid == 'next') {
				await recycler.next();
				list.select_by_uid( 'next' );
			}
		});
		recycler.set_reversed = function (yes) {
			recycler.reverse = yes ? 1 : 0;
			list.set_reversed(recycler.reverse);
			setcss(list.keys.items, 'display', recycler.reverse ? 'flex' : '');
			setcss(list.keys.items, 'flex-direction', recycler.reverse ? 'column-reverse' : '');
		};

		recycler.views = []; // views where this recycler should remain enabled
		recycler.add_view = function (view) {
			if (!recycler.views.includes(view)) recycler.views.push(view);
		};
		recycler.remove_view = function (view) {
			var index = recycler.views.indexOf(view);
			if (index > -1) recycler.views.splice(index, 1);
		};

		async function all_items_loaded() {
			var elements = recycler.get_elements();
			if (elements.length >= recycler.total_items) {
				return 1;
			}
			return 0;
		}

		var prev_busy, next_busy, prev_timeout, next_timeout;
		recycler.prev = async function () { if (recycler.enabled && !prev_busy && !removal_in_progress) {
			if (debug_recycler) $.log.w( 'recycler.prev', name, need );
			if (await all_items_loaded()) { return; }

			prev_busy = 1;

			var closest = list.keys.items.childNodes[1];
			var order = getdata(closest, 'o'), start, end;
			if (order) {
				order = parseint( order );
				start = order-size;
				end   = order;
				if (start < 0) start = 0;
			}

			if (order == 0) {
				clearTimeout( prev_timeout );
				list.set({ uid: 'prev', title: phrases.prev+' (Start)' });
			}

			if (start !== end && order !== 0) {
				list.set({ uid: 'prev', title: phrases.prev+' (Loading '+start+' - '+end+'...)' });
				
				var items = await recycler.get( start, end );

				var height = await recycler.insert( start, end, items, closest );
				if (recycler.reverse) {
					scroll_by(0, -height);
					if (debug_recycler) $.log.w( 'prev scrolled by', -height );
				} else {
					scroll_by(0, height);
					if (debug_recycler) $.log.w( 'prev scrolled by', height );
				}

				list.set({ uid: 'prev', title: phrases.prev+' (Loaded Range '+start+' - '+end+')' });
				clearTimeout( prev_timeout );
				prev_timeout = setTimeout(function () {
					list.set({ uid: 'prev', title: phrases.prev+( order == 0 ? ' (Start)' : '' ) });
				}, 2000);
			}
			prev_busy = 0;
		} };
		recycler.next = async function () { if (recycler.enabled && !next_busy && !removal_in_progress) {
			if (debug_recycler) $.log.w( 'recycler.next', name, need );
			next_busy = 1;

			var closest = list.keys.items.children[ list.keys.items.childNodes.length-2 ];
			var next_element = list.get_item_element_by_uid('next'), next_visible;
			var order = getdata(closest, 'o'), start, end;
			if (order) {
				order = parseint( order );
				start = order;
				end   = order+size;
				if (end > recycler.total_items) {
					end = recycler.total_items;
				}
			}

			if (order == recycler.total_items-1) {
				clearTimeout( next_timeout );
				list.set({ uid: 'next', title: phrases.next+' (End)' });
			}

			if (start != end && order != recycler.total_items-1) {
				list.set({ uid: 'next', title: phrases.next+' (Loading '+start+' - '+end+'...)' });

				var items = [];
				try {
					items = await recycler.get( start, end );
				} catch (e) {
					$.log.w( 'next error', e );
				}

				var height = await recycler.insert( start, end, items );
				next_visible = getdata(next_element, 'v') == '1';

				list.set({ uid: 'next', title: phrases.next+' (Loaded Range '+start+' - '+end+')' });
				clearTimeout( next_timeout );
				next_timeout = setTimeout(function () {
					list.set({ uid: 'next', title: phrases.next });
					next_visible = getdata(next_element, 'v') == '1';
					if (next_visible && order < recycler.total_items-1) {
						if (recycler.reverse) {
							scroll_by(0, height);
							if (debug_recycler) $.log.w( 'next scrolled by', height );
						} else {
							recycler.next();
						}
					}
				}, 10);
			}
			next_busy = 0;
		} };

		setcss(list.keys.raees, 'position', 'sticky');
		setcss(list.keys.raees, 'z-index', '100');
		
		// TODO add custom bubble elements for '3 new items' 'scroll to top'
		// optionally allow these as Hooks.until to be used with Softkeys
		
		list.set({ uid: 'prev',
			title: phrases.prev,
			before: list.get_item_element(0),
			_listitem: listitem,
		});
		list.set({ uid: 'next',
			title: phrases.next,
			before: list.get_item_element( list.length() ),
			_listitem: listitem,
		});
		
		function update_next_button() {
			list.set({ uid: 'next', title: phrases.next });
		}
		function update_prev_button() {
			list.set({ uid: 'prev', title: phrases.prev });
		}

		recycler.set_phrase = async function (name, translation) {
			phrases[name] = translation;
			if (name == 'next') update_next_button();
			if (name == 'prev') update_prev_button();
		};

		var observer = new IntersectionObserver(on_intersection, { // define an observer instance
			root: null,   // default is the viewport
			threshold: 1 // percentage of target's visible area. Triggers "onIntersection"
		});
		recycler.observer = observer;
		function on_intersection(entries, opts) { if (recycler.enabled) { // callback is called on intersection change
			entries.forEach(function (entry) {
				var uid = getdata(entry.target, 'uid');

				setdata(entry.target, 'v', entry.isIntersecting ? 1 : 0); // visible

				if (entry.isIntersecting) {
					if (uid == 'prev') recycler.prev();
					else if (uid == 'next') recycler.next();
				}
				
				active = list.keys.items.offsetHeight && list.keys.items.offsetWidth;

				if (!['prev', 'next'].includes(uid) && active) {
					recycler.cleanup();
				}
			});
		} };
		observer.observe( list.get_item_element_by_uid('prev') );
		observer.observe( list.get_item_element_by_uid('next') );

		recycler.insert = async function (start, end, items, before) {
			var height = 0;
			items.forEach(function (o, i) {
				o.before = before || o.before || list.get_item_element_by_uid('next');
				var was_present = list.get_item_element_by_uid(o.uid);
				list.set( o );
				var element = list.get_item_element_by_uid(o.uid);

				setdata(element, 'o', start+i);
				observer.observe( element );

				if (!was_present) {
					height += element.offsetHeight;
					// FAILED tried animating height but it triggers next, prev
					setcss(element, 'background-color', Themes.get('secondary'));
					setcss(element, 'transition', 'background-color .5s ease-in');
					setTimeout(function () {
						setcss(element, 'background-color', Themes.get('primary'));
						setTimeout(function () {
							// TODO clear_css(element, ...props)
							setcss(element, 'background-color', '');
							setcss(element, 'transition', '');
						}, 500);
					}, 500);
				}
			});
			if (items.length) {
				if (debug_recycler) $.log.w('recycler', name, 'inserted', items.length, 'with height', height );
				list.calc_selection();
				
				await Hooks.until('recycler-insert-done', { name, need });
			}
			return height;
		};
		recycler.cleanup = async function () { // remove out of scope items
			// each added element is actively observed for visibility
			// two edges is determined between visible and invisible items
			// items past this edge + threshold are removed
			
			$.taxeer('recycler-cleanup', async function () { if (active) {
				setcss(list.keys.raees, 'top', (Webapp.get_header_height()-1)+'px');

				var was_length = list.length();
				var next_edge, prev_edge, prev_element;
				for (var i in list.keys.items.childNodes) { if ( hasownprop(list.keys.items.childNodes, i) ) {
					var element = list.keys.items.childNodes[i];
					var uid = getdata(element, 'uid');
					if (!['next', 'prev'].includes(uid)) {
						var visible = getdata(element, 'v');
						if (!prev_edge && visible == '1') {
							prev_edge = element;
						}
						if (prev_edge && !next_edge && visible == '0') {
							next_edge = prev_element;
						}
						prev_element = element;
					}
				} }
				if (prev_edge) {
					recycler.start = parseint( getdata(prev_edge, 'o') );
					recycler.prev_edge = getdata(prev_edge, 'uid');
					var prev_sib_count = 0, prev_sib = prevsibling(prev_edge);
					while (prev_sib) {
						var prev_sib_uid = getdata(prev_sib, 'uid');
						
						if (['next', 'prev'].includes(prev_sib_uid)) {
							break;
						}
						var sib = prevsibling(prev_sib);
						if (prev_sib_count >= recycler.size) {
							list.remove_by_uid( prev_sib_uid );
						}
						prev_sib = sib;
						prev_sib_count++;
					}
				}
				if (next_edge) {
					recycler.end = parseint( getdata(next_edge, 'o') );
					recycler.next_edge = getdata(next_edge, 'uid');
					var next_sib_count = 0, next_sib = nextsibling(next_edge);
					while (next_sib) {
						var next_sib_uid = getdata(next_sib, 'uid');
						
						if (['next', 'prev'].includes(next_sib_uid)) {
							break;
						}
						var sib = nextsibling(next_sib);
						if (next_sib_count >= recycler.size) {
							list.remove_by_uid( next_sib_uid );
						}
						next_sib = sib;
						next_sib_count++;
					}
				}
				if (debug_recycler && was_length !== list.length()) {
					$.log.w( module_title, 'cleanup', name, 'trimmed from', was_length, 'to', list.length() );
				}
				var elements = recycler.get_elements();
				list.title( recycler.total_items+' items ('+elements.length+' loaded)' );
				list.calc_selection();
				recycler.remember_range();
			} },
			100,
			list.length() > (recycler.size*4) // force cleanup if too many items loaded
			);
		};
		recycler.reorder = function () {
			var order = recycler.start;
			var elements = recycler.get_elements();
			elements.forEach(function (element) {
				setdata(element, 'o', order++);
			});
		};
		recycler.render = async function () {
			if (await all_items_loaded()) { return; }
			
			var count = await recycler.count();

			var start = recycler.start,
				end   = recycler.end,
				items = await recycler.get( start, end );

			var height = await recycler.insert( start, end, items );
			if (recycler.reverse && start == 0) {
				if (debug_recycler) $.log.w( module_title, name, 'render scroll_by', height );
				scroll_by(0, height);
			}
			
			// check if next or prev are still visible
			var prev = list.get_item_element_by_uid('prev');
			if (prev) {
				if (getdata(prev, 'v') == '1') {
					await recycler.prev();
				}
			}
			var next = list.get_item_element_by_uid('next');
			if (next) {
				if (getdata(next, 'v') == '1') {
					await recycler.next();
				}
			}
		};

		recycler.jump_to_start = function () {
			recycler.start = 0;
			recycler.end = recycler.size;
			recycler.render();
		};
		recycler.jump_to_end = function () {
			
		};

		recycler.compare = async function (item) {
		};
		recycler.sort = function (items) { // calc where an item belongs, returns a before context uid
			// the default logic is to use .created if present
			// compare the current item with all listed item and see where it fits
//			var time = item.created || Time.now();
//			$.log( 'sort: time', Time.format(time) );
//			var before, biggest_time = 0;

//			if (!isundef(item.created)) {
				var new_items = [], sorted_items = [];
				items.forEach(function (o, i) {
					new_items.push(o.uid);
				});
				var objects = recycler.get_objects();
				// filter out new items from the old objects
				objects = objects.filter(function (o) {
					return !new_items.includes(o.uid);
				});
				// add new items
				objects = objects.concat(items);
				objects.sort(function (a, b) {
					if (!isundef(a.created) && !isundef(b.created))
						return a.created - b.created;
					else
						return 0;
				});
				var prev_object;
				objects.forEach(function (o, i) {
					if (new_items.includes(o.uid)) {
						if (prev_object) {
							o.before = list.get_item_element_by_uid( prev_object.uid );
						}
						sorted_items.push(o);
					}
					prev_object = o;
//					o = list.adapter.get( getdata(o, 'uid') );
//					if ( !['next', 'prev'].includes( o.uid ) && !isundef(o.created) ) {
//						var other_time = o.created;
//						$.log('biggest_time', Time.format(biggest_time), 'other_time', Time.format(other_time));
//						if (time > biggest_time && other_time > biggest_time) {
//							before = o.uid;
//							biggest_time = other_time;
//						}
//					}
				});
//			}
//			return before;
			return sorted_items;
		};

		recycler.cached_ranges = [];
		recycler.set_cache = function (yes) {
			cache_enabled = yes ? 1 : 0;
		};
		recycler.set = async function ( items ) { // fig out where to put these items
			// use the compare function to determine which direction the item should go
			// TODO try inserting these items one by one
			items = recycler.sort(items);
			// don't insert edge items if .start != 0 & .end != .total_count, this will keep scrolling flowing
			items = items.filter(function (o) {
				if (recycler.get_objects().length == 0) { // it no items exist, always allow insertion
					return 1;
				}
				if (o.before) {
					var closest = list.keys.items.childNodes[1];
					if (closest) {
						if (closest.isEqualNode(o.before)) { // will get inserted at the start
							var order = parseint( getdata(o.before, 'o') );
							if (order != 0) {
								$.log.w( module_title, o.uid, 'was filtered out near the start' );
								return 0;
							}
						}
					}
				}
				if (!o.before) { // will get inserted at the end
					var closest = list.keys.items.children[ list.keys.items.childNodes.length-2 ];
					var order = parseint( getdata(closest, 'o') );
					if (order != recycler.total_items-1) {
						$.log.w( module_title, o.uid, 'was filtered out near the end' );
						return 0;
					}
				}
				return 1;
			});
			
			var height = await recycler.insert(0, items.length, items);
			if (height && recycler.enabled) {
				scroll_by(0, height);
			}
			recycler.reorder();
		};
		recycler.get = async function ( start = 0, end = recycler.size ) {
			var resolve;
			var promise = new Promise(function (r) {
				resolve = r;
			});
			var range = [], num_of_cached = 0;
			if (cache_enabled && this.cached_ranges) {
				for (var i = start; i < end; ++i) {
					if (this.cached_ranges[i]) {
						range.push( this.cached_ranges[i] );
						range[range.length-1].message = 'cached';
						num_of_cached++;
					} else if (this.cached_ranges[i] === false) {
						num_of_cached++;
					}
				}
			}
			
//			$.log( start, end, end-start, num_of_cached );
			
			var allow = 1, payload = { start, end };
			
			if (end-start > num_of_cached) {
				allow = await recycler.aggregate_intercepts('range', payload);
				if (allow !== 0) {
					range = await Network.fetch(recycler.name, 'range', payload);
					range = range || [];
				}
			}
			if (cache_enabled && this.cached_ranges && isarr(range)) {
				var index = 0;
				for (var i = start; i < end; ++i) {
					this.cached_ranges[i] = range[index] || false;
					index++;
				}
			}
			
			allow = await recycler.aggregate_postcepts('range', payload, range);
			if (allow !== 0) {
				setTimeout(function () { // FIX this prolly fixes the next scroll glitch
					resolve( range );
				}, 50);
			}
			return promise;
		};

		recycler.total_items = 0;
		recycler.set_count = async function (count) {
			recycler.total_items = count;
			var elements = recycler.get_elements();
			list.title( recycler.total_items+' items ('+elements.length+' loaded)' );
		};
		recycler.count = async function () {
			var resolve;
			var promise = new Promise(function (r) {
				resolve = r;
			});
			var count = 0, payload = {};
			var allow = await recycler.aggregate_intercepts('count', payload);
			if (allow !== 0) {
				count = await Network.fetch(recycler.name, 'count', payload);
				count = count || 0;
			}

			allow = await recycler.aggregate_postcepts('range', payload, count);
			if (allow !== 0) {
				await recycler.set_count( count );

				setTimeout(function () {
					resolve( count );
				}, 50);
			}
			return promise;
		};

		recycler.get_elements = function () {
			var elements = [], nodes = list.keys.items.children;
			for (var i in nodes) { if (hasownprop(nodes, i)) {
				var element = nodes[i];
				var uid = getdata(element, 'uid');
				if (!['next', 'prev'].includes(uid)) {
					elements.push(element);
				}
			} }
			return elements;
		};
		recycler.get_objects = function () {
			var objects = [];
			list.adapter.each(function (o) {
				if (!['next', 'prev'].includes( o.uid )) {
					objects.push(o);
				}
			});
			return objects;
		};
		recycler.remove_by_uid = async function (uid, only_remove) {
			var resolve;
			var promise = new Promise(function (r) {
				resolve = r;
			});
			var element = list.get_item_element_by_uid(uid);
			if (element) {
				if (only_remove) {
					list.remove_by_uid(uid);
					resolve();
				} else {
					setcss(element, 'overflow', 'hidden');
					setcss(element, 'min-height', '0px');
					setcss(element, 'height', element.offsetHeight+'px');
					setcss(element, 'transition', 'height .5s ease-in');
					setTimeout(function () {
						setcss(element, 'height', '0px');
						setTimeout(function () {
							list.remove_by_uid(uid);
							recycler.reorder();
							resolve();
						}, 500);
					}, 50);
				}
			} else {
				resolve();
			}
			return promise;
		};
		recycler.remove_all = async function () {
			removal_in_progress = 1;
			recycler.cached_ranges = [];
			var elements = recycler.get_elements();
			for (var element of elements) {
				var uid = getdata(element, 'uid');
				await recycler.remove_by_uid( uid, 1 );
			}
			removal_in_progress = 0;
			await recycler.reset_range();
			return 1;
		};

		var intercepts = {}, intercept_uid = 0;
		recycler.add_intercept = function (need, callback) {
			if (isfun(need)) {
				callback = need;
				need = intercept_uid++;
			}
			intercepts[ need ] = callback;
		};
		recycler.remove_intercept = function (need) {
			delete intercepts[ need ];
		};
		recycler.aggregate_intercepts = async function (need, payload) { // called before fetch request
			payload = payload || {};
			var allow = 1;
			for (var i in intercepts) {
				var intercept = intercepts[i];
				if (isfun(intercept)) {
					allow = await intercept(need, payload);
				}
			}
			return allow;
		};

		var postcepts = {}, postcept_uid = 0;
		recycler.add_postcept = function (need, callback) {
			if (isfun(need)) {
				callback = need;
				need = postcept_uid++;
			}
			postcepts[ need ] = callback;
		};
		recycler.remove_postcept = function (need) {
			delete postcepts[ need ];
		};
		recycler.aggregate_postcepts = async function (need, payload, result) { // called after fetch response
			var allow = 1;
			for (var i in postcepts) {
				var postcept = postcepts[i];
				if (isfun(postcept)) {
					allow = await postcept(need, payload, result);
				}
			}
			return allow;
		};

		recycler.disable = function () { if (this.enabled) {
			if (debug_recycler) $.log.w(module_title, 'disable', name);
			this.enabled = 0;
		} };
		recycler.enable = function () { if (!this.enabled) {
			if (debug_recycler) $.log.w(module_title, 'enable', name);
			this.enabled = 1;
		} };

		recycler.reset_range = async function () {
			recycler.start = 0;
			recycler.end = recycler.size;
//			await recycler.remember_range();
		};
		recycler.remember_range = async function () {
			// TODO add an luid key for like liud: room
			// TODO make into promise
			Offline.add(module_name, 'ranges', {
				uid  : name+need     ,
				start: recycler.start,
				end  : recycler.end  ,
			});
		};
		recycler.restore_range = async function () {
			var arr = await Offline.get_offline(module_name, 'ranges', { filter: { uid: name+need } } );
			if (arr.length) {
				var item = arr[0];
				recycler.start = parseint( item.start );
				recycler.end   = parseint( item.end   );
				if (recycler.reverse && recycler.start == 0) {
					scroll_by(0, list.keys.items.offsetHeight);
				}
			}
		};
//		(async function () {
//			await recycler.restore_range();
//		})();

		return recycler;
	};
	
	Hooks.set('ready', async function () {
		Sidebar.set( { uid: module_name, title: module_title, icon: 'iconmenu', hidden: 1 } );
		var dom_keys = View.dom_keys( module_name );
		var recycler_list = List( dom_keys.list ).idprefix( module_name ).listitem(listitem);
		recycler_list.before_set = function (o) {
			o.updated$time = o.updated || 0;
			return o;
		};
		
		var demo_recycler = Recycler( recycler_list, module_name );
		demo_recycler.set_reversed( 1 );
		
		// TODO track all recyclers in demo_recycler
	});
	
	Hooks.set('view-ready', function () { if (View.is_active( module_name )) {
		Sidebar.choose(module_name);
		Webapp.header([module_title, 0, 'iconmenu']);
	} });
	Hooks.set('view-before-init', async function (o) {
		for (var i in all_recyclers) {
			var recycler = all_recyclers[i];
			if (!recycler.views.includes(o.name)) {
				recycler.disable();
			}
		}
	});
	Hooks.set('view-loaded', async function (o) {
		var bottom = 0;
		for (var i in all_recyclers) {
			var recycler = all_recyclers[i];
			if (recycler.views.includes(o.name)) {
				if (recycler.reverse) bottom = 1;
				recycler.enable();
			} else {
				recycler.disable();
			}
		}
		Backstack.restore_scroll_position({ bottom });
		Backstack.save_scroll_position();
	});

})();



