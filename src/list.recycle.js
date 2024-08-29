Recycler = {}, debug_recycler = 0;
;(function(){
	var module_name = 'recycler', module_title = 'Recycler', listitem = 'recycler_item';
	
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

	Recycler = function ( list, name, need = 'default', size = 20 ) {
		let recycler = { list, name, need, size, start: 0, end: size, enabled: 1, reverse: 0, uid: recycler_uid++ };
		
		recycler.start_hidden = recycler.start;
		recycler.end_hidden   = recycler.end  ;
		
		all_recyclers[recycler.uid] = recycler; // deleted on destroy
		
		let all_hooks = [];
		function set_hook() {
			let hook = Hooks.set.apply(Hooks, arguments);
			all_hooks.push( hook );
			return hook;
		}
		
		recycler.destroy = async function () {
			// TODO cancel all pending operations 
			// 		cancel fetches
			// 		cancel animations
			// 		delete all data

			// unhook all
			all_hooks.forEach(function (hook) {
				hook.remove();
			});

			list.remove_all();
			delete all_recyclers[recycler.uid];
		};

		let hook_prefix = [module_name, name, need].join('-'),
			// old range that was last reported out
			old_range = {};
		recycler.on_press = function (callback) { return set_hook(hook_prefix+'-on-press', callback); };
		recycler.on_range = function (callback) { return set_hook(hook_prefix+'-on-range', callback); };
		function run_on_range () {
			let start_hidden = 0, end_hidden = 0, new_range = {};
			let elements = recycler.get_elements();
			if (elements.length) {
				recycler.start_hidden = start_hidden = parseint( getdata( elements[ 0 ] , 'o' ) );
				recycler.end_hidden   = end_hidden   = parseint( getdata( elements[ elements.length-1 ] , 'o' ) );
				
				new_range = {
					start: recycler.start,
					end: recycler.end,
					start_hidden,
					end_hidden,
				};
			}

			$.delay( hook_prefix+'-on-range', function () {
				// if the range has changed
				if ( !are_objects_equal( old_range, new_range ) ) {
					old_range = {
						start: recycler.start,
						end: recycler.end,
						start_hidden,
						end_hidden,
					};
					Hooks.run( hook_prefix+'-on-range', old_range );
				}
			}, 2000);
		}
		
		let cache_enabled, phrases = {
			next: 'Next',
			prev: 'Previous',
		};
		let active = 1, removal_in_progress;
		list.listen_on_press(async function ( o, k, i ) {
			if (k == 'enter') {
				if (o.uid == 'prev') {
					await recycler.prev();
					list.select_by_uid( 'prev' );
				} else
				if (o.uid == 'next') {
					await recycler.next();
					list.select_by_uid( 'next' );
				} else {
					Hooks.run( hook_prefix+'-on-press', o, k, i );
				}
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

		recycler.is_internal = function ({ uid } = {}) {
			if (['prev', 'next'].includes(uid)) {
				return 1;
			}
		};
		recycler.get_selection = function () {
			let selection = [];
			let object = list.get_item_object();
			if (!recycler.is_internal(object)) {
				selection.push( object );
			}
			return selection;
		};
		
		// TODO prev & next after success should check again if they're still visible & loaded_items < count
		let prev_busy, next_busy, prev_timeout, next_timeout;
		recycler.prev = async function () { if (recycler.enabled && !prev_busy && !removal_in_progress) {
			if (debug_recycler) $.log.w( 'recycler.prev', name, need );
			if (await all_items_loaded()) { return; }

			prev_busy = 1;

			let closest = list.keys.items.childNodes[1];
			let order = getdata(closest, 'o'), start, end;
			if (order) {
				order = parseint( order );
				start = order - recycler.size;
				end   = order;
				if (start < 0) start = 0;

				// extend the hidden range
				// items will get filtered out after this limit
				recycler.start_hidden = start - recycler.size;
				if (recycler.start_hidden < 0) recycler.start_hidden = 0;
			}

			if (order == 0) {
				clearTimeout( prev_timeout );
				list.set({ uid: 'prev', title: phrases.prev+' (Start)' });
			}

			if (start !== end && order !== 0) {
				list.set({ uid: 'prev', title: phrases.prev+' (Loading '+start+' - '+end+'...)' });
				
				let items = await recycler.get( start, end );

				let height = await recycler.insert({ start, end, items, before: closest });
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

				// BUG FIX temporary, to avoid infinite loop when client count doesn't match server count
//				await recycler.count();
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
				end   = order + recycler.size;
				if (end > recycler.total_items) {
					end = recycler.total_items;
				}

				// extend the hidden range
				// items will get filtered out after this limit
				recycler.end_hidden = end + recycler.size;
				if (recycler.end_hidden > recycler.total_items) recycler.end_hidden = recycler.total_items;
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

				var height = await recycler.insert({ start, end, items });
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

				// BUG FIX temporary, to avoid infinite loop when client count doesn't match server count
//				await recycler.count();
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

		let observer = new IntersectionObserver(on_intersection, { // define an observer instance
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

		function blip_item ( element ) {
			setcss(element, 'background-color', Themes.get('secondary'));
			setcss(element, 'transition', 'background-color .25s ease-in');
			setTimeout(function () {
				setcss(element, 'background-color', Themes.get('primary'));
				setTimeout(function () {
					// TODO clear_css(element, ...props)
					setcss(element, 'background-color', '');
					setcss(element, 'transition', '');
				}, 300);
			}, 300);
		}

		// these are useful if *_hidden have not been fig'd out yet, will become useless if they can be guaranteed
		recycler.get_either_start = () => {
			if (isnum(recycler.start_hidden))
				return recycler.start_hidden;
			else
				return recycler.start;
		};
		recycler.get_either_end = () => {
			if (isnum(recycler.end_hidden))
				return recycler.end_hidden;
			else
				return recycler.end;
		};

		recycler.get_first_element = () => {
			let first_element = recycler.list.keys.items.children[1];
			let uid = getdata( first_element, 'uid' );
			if ( !recycler.is_internal( uid ) ) {
				return first_element;
			}
		};
		recycler.find_closest = (target) => {
			let children = list.keys.items.children;
			let rankings = [], result = {};
			if ( children.length > 2 ) {
				for ( let child of children ) {
					let uid = getdata( child, 'uid' ), order;
					if ( uid == 'prev' ) { // assign it the smallest order - 1
						// this should also output next if it gets matched, since the target is using .before
						order = getdata( children[ 0 ], 'o' );
						if (!isundef( order )) {
							order = parseint( order ) - 1;
						}
					} else if ( uid == 'next' ) { // order of element before next + 1
						order = getdata( children[ children.length - 2 ], 'o' );
						if (!isundef( order )) {
							order = parseint( order ) + 1;
						}
					} else {
						order = getdata( child, 'o' );
					}

					if (!isundef( order )) {
						order = parseint( order );
						rankings.push({
							element: child,
							distance: Math.abs(order - target.order),
							order,
							uid,
						});
					}
				}

				rankings.sort(function (a, b) {
					return a.distance - b.distance;
				});
				
				result = rankings[0];
				
				let old_element = list.get_item_element_by_uid( target.uid );
				if (old_element) {
					let old_order = getdata( old_element, 'o' );
					// exclude self, if new order is >= old element's order, then we need to insert after
					if (result.order >= old_order && result.uid !== target.uid) {
						result.after = 1;
					}
					
					let either_start = recycler.get_either_start();
					
					// preserve starting edge
					if (old_order == either_start && target.order > either_start) {
						// the element that takes its place should have the order set to start_hidden
						result.enforce_start_hidden = 1;
					}
				}
				if (result.after) {
					let next_sib = nextsibling( result.element );
					if (next_sib) {
						result.element = next_sib;
					}
				}
			} else {
				result = { element: children[ children.length - 1 ], distance: 0 };
			}
			return result;
		};

		recycler.insert = async function ({ start, end, items, before }) {
			if (debug_recycler) $.log.w( 'recycler.insert', 'start', start, 'end', end, 'length', items.length, before );
			let height = 0;
			
			// if the first element element is being swapped, the incoming element's order should be set to zero
			// TODO fig out where to add this clause most effectively
			let enforce_start_hidden;

			// don't insert edge items if .start != 0 & .end != .total_count, this will keep scrolling flowing
			items = items.filter(function (o) {
				if (isnum(o.order)) {
					let filter_out;
					if (o.order < recycler.get_either_start()) {
						if (debug_recycler) $.log.w( o.uid, 'filtered out before start')
						filter_out = 1;
					}
					if (o.order > recycler.get_either_end()) {
						if (debug_recycler) $.log.w( o.uid, 'filtered out after end')
						filter_out = 1;
					}
					
					if (filter_out) {
						let old_element = list.get_item_element_by_uid( o.uid );
						if (old_element) {
							list.remove_by_uid( o.uid );
						}
						return 0;
					}
				}
				
				return 1;
			});
			
			if (recycler.total_items)
			items.forEach(function (o, i) {
				if (!isundef(o.order)) { // then insert it next to the nearest matching order index number
					let closest = recycler.find_closest(o);
					if (closest) {
						if (closest.enforce_start_hidden)
							enforce_start_hidden = closest.enforce_start_hidden;

						let { element } = closest;
						
						let object = list.get_item_object_by_uid( getdata( element, 'uid' ) );
						if (object.uid == 'next') name = 'next';
						else name = object.name;
						if (debug_recycler) $.log( 'will insert', o.order, o.name, 'before', object.order, name );
						o.before = element;
					}
				}
			});

			items.forEach(function (o, i) {
				o.before = /*before || */o.before || list.get_item_element_by_uid('next');
				let was_present = list.get_item_element_by_uid(o.uid);
				
				let old_object = list.get_item_object_by_uid(o.uid);
				let is_object_updated;
				if (old_object) {
					is_object_updated = o.updated > old_object.updated;
				}
				
				list.set( o ); // this one re-orders it
				var element = list.get_item_element_by_uid(o.uid);

				setdata(element, 'o', start+i);

				observer.observe( element );

				if (!was_present) {
					height += element.offsetHeight;
					// FAILED tried animating height but it triggers next, prev
				}
				if (is_object_updated || !was_present) {
					// TODO expose an option
					blip_item( element );
				}
			});
			if (items.length) {
				if (debug_recycler) $.log.w('recycler', name, 'inserted', items.length, 'with height', height );
				list.calc_selection();

				if (enforce_start_hidden) {
					let first_element = recycler.get_first_element();
					if (first_element) {
						setdata( first_element, 'o', recycler.get_either_start() );
					}
				}
				
				recycler.reorder();
				
				// also accounts for small num of items, on addition, keeps loaded in check
				recycler.apply_count();
				
				await Hooks.until('recycler-insert-done', { name, need });
			}
			return height;
		};
		recycler.cleanup = async function () { // remove out of scope items
			// each added element is actively observed for visibility
			// two edges are determined between visible and invisible items
			// items past this edge + threshold are removed
			
			$.delay('recycler-cleanup', async function () { if (active) {
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
					let prev_sib_count = 0, prev_sib = prevsibling(prev_edge);
					while (prev_sib) {
						let prev_sib_uid = getdata(prev_sib, 'uid');
						
						if (['next', 'prev'].includes(prev_sib_uid)) {
							break;
						}
						let sib = prevsibling(prev_sib);
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
						let next_sib_uid = getdata(next_sib, 'uid');
						
						if (['next', 'prev'].includes(next_sib_uid)) {
							break;
						}
						let sib = nextsibling(next_sib);
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
				
				run_on_range();
				recycler.remember_range();
			} },
			100,
			list.length() > (recycler.size*4) // force cleanup if too many items loaded
			);
		};
		recycler.reorder = function ({ start } = {}) {
			if (debug_recycler) {
				$.log.w( module_title, 'reorder start', recycler.start );
			}
			let elements = recycler.get_elements();
			if (elements.length) {
				let order = !isundef(start) ? start : getdata(elements[0], 'o');
				elements.forEach(function (element) {
					setdata(element, 'o', order);

					let uid = getdata(element, 'uid');
					let object = list.get_item_object_by_uid( uid );
					if (object) {
						object.order = order;
						list.set( object ); // this one can show the new order
					}
					order++;
				});
			}
		};
		recycler.render = async function () {
			if (debug_recycler) $.log.w( 'recycler.render' );
			if (await all_items_loaded()) { return; }
			
			var count = await recycler.count();

			var start = recycler.start,
				end   = recycler.end,
				items = await recycler.get( start, end );

			var height = await recycler.insert({ start, end, items });
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
			run_on_range();
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

		let adapter;
		recycler.get_adapter = function () {
			return adapter;
		};
		recycler.connect_adapter = function (a) {
			adapter = a;
		};
		recycler.disconnect_adapter = function () {
			adapter = 0;
		};

		recycler.cached_ranges = [];
		recycler.set_cache = function (yes) {
			cache_enabled = yes ? 1 : 0;
		};
		recycler.set = async function ( items ) { // fig out where to put these items
			if (debug_recycler) $.log.w( 'recycler.set' );
			if (!isarr(items)) items = [ items ];
			
			var height = await recycler.insert({ start: recycler.get_either_start(), end: items.length, items });
			if (height && recycler.enabled) {
				scroll_by(0, height);
			}
		};
		recycler.get = async function ( start = 0, end = recycler.size ) {
			if (debug_recycler) $.log.w( 'recycler.get', start, end );
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
					if (adapter && adapter.get) {
						range = await adapter.get(payload);
					} else {
						range = await Network.fetch(recycler.name, 'range', payload);
					}
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
		recycler.apply_count = function ({ loaded } = {}) {
			if (!isnum(loaded)) {
				var elements = recycler.get_elements();
				loaded = elements.length;
			}
			list.title( recycler.total_items+' items ('+loaded+' loaded)' );
		};
		recycler.set_count = async function (count) {
			recycler.total_items = count;
			recycler.apply_count();
		};
		recycler.count = async function () {
			var resolve;
			var promise = new Promise(function (r) {
				resolve = r;
			});
			var count = 0, payload = {};
			var allow = await recycler.aggregate_intercepts('count', payload);
			if (allow !== 0) {
				if (adapter && adapter.count) {
					count = await adapter.count(payload);
				} else {
					count = await Network.fetch(recycler.name, 'count', payload);
				}
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
			let resolve, order;
			let get_element_index = function (element) {
				if (element) {
					let children = Array.from(element.parentNode.children);
					return children.indexOf(element);
				}
			};
			let is_first_element;
			let promise = new Promise(function (r) {
				resolve = function () {
					if (!isundef(order)) {
						recycler.reorder({ start: parseint( order ) });
					} else {
						recycler.reorder();
					}
					if (is_first_element) {
						// list has logic to move selection to the prev element
						// we override it in case it's our 'prev' btn
						list.down();
					}
					return r.apply(r, arguments);
				};
			});
			let element = list.get_item_element_by_uid(uid);
			if (element) {
				// if the first element is being removed, we pass its order to the next element
				if (get_element_index(element) == 1) { // 0 is the next/prev button
					is_first_element = 1;
					order = getdata(element, 'o');
				}
				
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
							recycler.apply_count();
							resolve();
						}, 500);
					}, 50);
				}
			} else {
				resolve();
			}
			return promise;
		};
		recycler.remove = async function (uid_or_uids, only_remove) {
			if (!isarr(uid_or_uids)) {
				uid_or_uids = [ uid_or_uids ];
			}
			for await (let uid of uid_or_uids) {
				if (!isundef(uid))
					await recycler.remove_by_uid(uid, only_remove);
			}
		};
		recycler.remove_all = async function ({ keep_range } = {}) {
			removal_in_progress = 1;
			recycler.cached_ranges = [];
			var elements = recycler.get_elements();
			for (var element of elements) {
				var uid = getdata(element, 'uid');
				if (keep_range) {
					list.remove_by_uid(uid);
				} else {
					await recycler.remove_by_uid( uid, 1 );
				}
			}
			removal_in_progress = 0;

			if (!keep_range) {
				await recycler.reset_range();
			}
			
			recycler.apply_count({ loaded: 0 });
			
			return 1;
		};

		let intercepts = {}, intercept_uid = 0;
		recycler.add_intercept = function (uid, callback) {
			if (isfun(uid)) {
				callback = uid;
				uid = intercept_uid++;
			}
			intercepts[ uid ] = callback;
		};
		recycler.remove_intercept = function (uid) {
			delete intercepts[ uid ];
		};
		recycler.aggregate_intercepts = async function (need, payload) { // called before fetch request
			payload = payload || {};
			let allow = 1;
			for (let i in intercepts) {
				let intercept = intercepts[i];
				if (isfun(intercept)) {
					allow = await intercept({ need, payload });
				}
			}
			return allow;
		};

		let postcepts = {}, postcept_uid = 0;
		recycler.add_postcept = function (uid, callback) {
			if (isfun(uid)) {
				callback = uid;
				uid = postcept_uid++;
			}
			postcepts[ uid ] = callback;
		};
		recycler.remove_postcept = function (uid) {
			delete postcepts[ uid ];
		};
		recycler.aggregate_postcepts = async function (need, payload, result) { // called after fetch response
			let allow = 1;
			for (let i in postcepts) {
				var postcept = postcepts[i];
				if (isfun(postcept)) {
					allow = await postcept({ need, payload, result });
				}
			}
			return allow;
		};

		recycler.on_enabled = function (callback) { return set_hook(hook_prefix+'-on-enabled', callback); };
		function run_on_enabled () { $.delay( hook_prefix+'-on-enabled', function () {
			Hooks.run( hook_prefix+'-on-enabled', {
				enabled: recycler.enabled,
			} );
		}, 200); }
		recycler.disable = function () { if (this.enabled) {
			if (debug_recycler) $.log.w(module_title, 'disable', name);
			this.enabled = 0;
			run_on_enabled();
		} };
		recycler.enable = function () { if (!this.enabled) {
			if (debug_recycler) $.log.w(module_title, 'enable', name);
			this.enabled = 1;
			run_on_enabled();
		} };

		recycler.reset_range = async function () {
			recycler.start = 0;
			recycler.end = recycler.size;
			await recycler.remember_range();
			
			run_on_range();
		};
		recycler.remember_range = async function () {
			// TODO add an luid key for like liud: room
			// TODO make into promise
//			Offline.add(module_name, 'ranges', {
//				uid  : name+need     ,
//				start: recycler.start,
//				end  : recycler.end  ,
//			});
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
				
				run_on_range();
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



