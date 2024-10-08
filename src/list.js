/* lists have an adapter $.array, it contains the objects present in the dom list
 * 
 * the adapter set/pop functions can be overriden to provide your own logic
 * 
 * the dom list set/pop functions also mutate the adapter
 * */
var List, list, debug_list;
;(function(){
	'use strict';

	var direction = function () { return document.body.dir; };

	var proto = {
		_muntahaabox: 0,
		_muntahaa: -1,
		murakkaz: 0,
		adapter: 0,
		/* EXPLAIN TODO
		 * my hunch is that this is to change idb prop names to dom prop names
		 * but im not sure, prolly also used to remap prop names
		 * */
		beforeset: 0,
		before_set: 0,
		beforepop: 0,
		uponpastend: function () {
			var yes = focusnext(this.element);
			if (yes && yes.listobject) Softkeys.list.basic(yes.listobject);
			return yes;
		},
		uponpaststart: function () {
			var yes = focusprev(this.element);
			if (yes && yes.listobject) Softkeys.list.basic(yes.listobject);
			return yes;
		},
		// TODO
		uponend: 0, // when reached list end, do what? return 1 to avoid default
		uponstart: 0,
		bintixaab: 0, // upon selection change [TODO deprecate this]
		uponintaxab: 0, // same as bintixaab [TODO deprecate this]
		on_selection: 0, // 2023 NEW
		uponnavi: 0, // ( type )
		_scroll_on_focus: 1,
		scroll_on_focus: function (yes) {
			this._scroll_on_focus = yes;
			return this;
		},
		moveup: function (uid, fake) {
			if (!fake && this.reverse) return this.movedown(uid, 1);

			uid = uid || (this.axavmuntaxab()||{}).uid;
			var clone = this.get( this.id2num(uid) );
			if (clone) {
				var prev = clone.previousElementSibling;
				if (prev) {
					var prevuid = prev.dataset.uid;
					var obj = this.adapter.get(uid);
					var prevobj = this.adapter.get(prevuid);
					if (obj && prevobj) {
						this.adapter.eawwad(prevuid, uid);
						this.keys.items.insertBefore(clone, prev);
						if (this.gridnum > 1) this.left();
						else this.up();
					}
				}
			}
		},
		movedown: function (uid, fake) {
			if (!fake && this.reverse) return this.moveup(uid, 1);

			uid = uid || (this.axavmuntaxab()||{}).uid;
			var clone = this.get( this.id2num(uid) );
			if (clone) {
				var next = clone.nextElementSibling;
				if (next) {
					var nextuid = next.dataset.uid;
					var obj = this.adapter.get(uid);
					var nextobj = this.adapter.get(nextuid);
					if (obj && nextobj) {
						this.adapter.eawwad(nextuid, uid);
						this.keys.items.insertBefore(next, clone);
						if (this.gridnum > 1) this.right();
						else this.down();
					}
				}
			}
		},
		ixtaf: function () {
			this.element.hidden = 1;
			this.element.parentElement.hidden = 1;
		},
		izhar: function () {
			this.element.hidden = 0;
			this.element.parentElement.hidden = 0;
		},
		// triggers on_focus
		uponrakkaz: function (v, active) { // active = visible & view is active
			if (v && active) Softkeys.list.basic(this);
		},
		rakkaz: function (v, active) { // deprecated, use set_focus
			var o = this.get_item_object();
			var prevent_focus = 0;
			if (o) prevent_focus = o._prevent_focus;
			if (this._prevent_focus || prevent_focus) return;

			var yes;
			this.focussed = this.murakkaz = !!v;
			if (v && !this.element.dataset.focussed) this.element.dataset.focussed = 1, yes = 1;
			else if (!v && this.element.dataset.focussed) delete this.element.dataset.focussed, yes = 1;
			(yes || active) && this.uponrakkaz && this.uponrakkaz(v, active);
			
			Hooks.run( this.hook_prefix+'-on-focus', { has_focus: this.focussed, list: this });
		},
		/* TODO
		 * improve this navigation to account for mufarraqaat
		 * detect if the next item is a mufarraq, skip it.
		 * */
		first: function (select, fake) {
			if (!fake && this.reverse) return this.last(select, 1);

//			$.log( 'first', this.idprefix_raw, select );
			this.selected = select === undefined ? -1 : select;
			var item = this.get(++this.selected);
			while (item) {
				if (item.dataset.listitem) {
					item = 0;
				} else {
					item = this.get(++this.selected)
				}
			}
			this.intaxabscroll( this.intaxabsaamitan() );
			return this;
		},
		last: function (select, fake) {
			if (!fake && this.reverse) return this.first(select, 1);

//			$.log( 'last', this.idprefix_raw );
			this.selected = this.length();
			var item = this.get(--this.selected);
			while (item) {
				if (item.dataset.listitem) {
					item = 0;
				} else {
					item = this.get(--this.selected)
				}
			}
			this.intaxabscroll( this.intaxabsaamitan() );
			return this;
		},
		message: function (msg) {
			if (msg) {
				this.keys.message.dataset.i18n = msg;
				this.keys.message.parentElement.hidden = 0;
				this.keys.items.hidden = 1;
			} else {
				delete this.keys.message.dataset.i18n;
				this.keys.message.innerText = '';
				this.keys.message.parentElement.hidden = 1;
				this.keys.items.hidden = 0;
			}
			translate.update();
		},
		left: function (e, fake) {
			if (!fake && this.reverse) return this.right(e, 1);
			if (!fake && direction() === 'rtl') return this.right(e, 1);

			var delta = this.gridnum ? 1 : 10;
			this.selected -= delta;
			var item = this.get(this.selected);
			while (item) {
				if (item.dataset.listitem) {
					item = 0;
				} else {
					item = this.get(++this.selected);
				}
			}
			if (this.selected < 0)
				this.first();
			else {
				this.intaxabscroll( this.intaxabsaamitan() );
			}
			return this;
		},
		up: function (e, fake) {
			if (!fake && this.reverse) return this.down(e, 1);
			
			if (e) preventdefault(e);
			
			this.selectedold = this.selected;
			var delta = this.gridnum ? this.gridnum : 1;
			this.selected -= delta;
			var item = this.get(this.selected);
			while (item) {
				if (item.dataset.listitem) {
					item = 0;
				} else {
					item = this.get(--this.selected)
				}
			}
			if (this.selected < 0) {
				var yes;
				if (this.reverse) {
					if (this.uponpastend)
						yes = this.uponpastend(this.selectedold);
				} else {
					if (this.uponpaststart)
						yes = this.uponpaststart(this.selectedold);
				}

				if (yes) {
					this.selected = 0;
//					this.intaxabscroll(
						this.intaxabsaamitan()
//					);
				}
				else this.last();
			} else {
//				this.intaxabscroll(
					this.intaxabsaamitan()
//				);
			}
			item = this.get(this.selected);
			if (item && !this.element.dataset.freeflow) { // TODO only scroll if too close to edge
				this.scroll_up_if_needed();
			}
			return this;
		},
		calc_selection: function () {
			var i = 0;
			var selected_item = this.keys.items.querySelector('[data-selected]');
			if (selected_item) {
				while ( (selected_item = selected_item.previousElementSibling) != null ) ++i;
				this.selected = i;
			}
			return this;
		},
		length: function () {
			if (isfun(this.uponlength)) // custom length algo
				return this.uponlength();
			return this.keys.items.children.length;
		},
		down: function (e, fake) {
			// TODO skip hidden elements
			if (!fake && this.reverse) return this.up(e, 1);

			if (e) preventdefault(e);
			
			this.selectedold = this.selected;
			var delta = this.gridnum ? this.gridnum : 1;
			this.selected += delta;
			var item = this.get(this.selected);
			while (item) {
				if (item.dataset.listitem) {
					item = 0;
				} else {
					item = this.get(++this.selected)
				}
			}
			if (this.selected > this.length()-1) {
				this.selected = this.length()-1;
				var yes;
				if (this.reverse) {
					if (this.uponpaststart)
						yes = this.uponpaststart(this.selectedold);
				} else {
					if (this.uponpastend)
						yes = this.uponpastend(this.selectedold);
				}

				if (yes) {
					this.selected = this.length()-1;
//					this.intaxabscroll(
						this.intaxabsaamitan()
//					);
				}
				else this.first(this.gridnum ? this.selected - this.length()-1 : -1);
			} else {
//				this.intaxabscroll(
					this.intaxabsaamitan()
//				);
			}
			item = this.get(this.selected);
			if (item && !this.element.dataset.freeflow) {
				this.scroll_down_if_needed();
			}
			return this;
		},
		right: function (e, fake) { // fake prevents max stack errs
			if (!fake && this.reverse) return this.left(e, 1);
			if (!fake && direction() === 'rtl') return this.left(e, 1);

			var delta = this.gridnum ? 1 : 10;
			this.selected += delta;
			var item = this.get(this.selected);
			while (item) {
				if (item.dataset.listitem) {
					item = 0;
				} else {
					item = this.get(++this.selected);
				}
			}
			if (this.selected > this.length()-1)
				this.last();
			else {
				this.intaxabscroll( this.intaxabsaamitan() );
			}
			return this;
		},
		baidaa: function (id, multiple) { // with multiple it also toggles, depr, use highlight instead
			id = id === undefined ? this.selected : id;
			var items = this.keys.items.children, item;
			for (var i in items) {
				if (items.hasOwnProperty(i)) {
					item = items[i];
					if (i == id) {
						if (multiple) {
							if (item.dataset.baidaa) delete item.dataset.baidaa;
						} else item.dataset.baidaa = 1;
					}
					else if (!multiple)
						delete item.dataset.baidaa;
				}
			}
			return item;
		},
		/* id can be a number or string id
		 * */
		select: function (id, noscroll, silent, nofocus) {
//			$.log( 'select', this.idprefix_raw, id, noscroll, silent, nofocus );
			id = id === undefined ? this.selected : id;
			var selected = this.intaxabsaamitan(id);
			if (!noscroll) this.intaxabscroll(selected);
			
			if (selected && !nofocus) {
				markooz() && markooz().blur();
				selected.focus();
				this.rakkaz(1, 1);
			}

			this.selected = id;

			// TODO this doesn't work, prolly delete it
			if (this.uponselect && !silent) {
				selected = this.get(this.selected);
				if (selected) {
					selected = this.adapter.get( selected.dataset.uid );
					if (selected) this.uponselect(selected);
				}
			}
			
			return this;
		},
		select_by_uid: function (id, noscroll, silent, nofocus) {
			return this.select(this.id2num(id), noscroll, silent, nofocus);
		},
		intaxabscroll: function (selected) { // select_scroll TODO rename
			if (!this._scroll_on_focus) return;

			if (isundef(selected)) {
				selected = this.get( this.selected );
			}
			if (this.filmakaan) {
				if (selected) {
					scrollintoview(selected);
				}
			} else {
				if (this.selected === 0) {
					if (!this.reverse) {
						Webapp.scrollto(); // scroll to top
					}
				}
				else if (selected) {
					Webapp.scrollto(selected);
				}
			}
		},
		intaxabsaamitan: function (id) { // select silently
//			$.log.e( 'intaxabsaamitan', this.idprefix_raw, id );

			id = id === undefined ? this.selected : id;
			var items = this.keys.items.children, item, selected;
			for (var i in items) {
				if (items.hasOwnProperty(i)) {
					item = items[i];
					if (i == id)
						item.dataset.selected = 1, selected = item;
					else
						delete item.dataset.selected;
				}
			}

			if (isfun(this.on_selection) && selected) {
				var a = this.adapter.get( selected.dataset.uid );
				if (a) this.on_selection(a);
			}

			return selected;
		},
		deselect: function () {
//			$.log( 'deselect', this.idprefix_raw );
			var old = this.selected;
			this.selected = -1;
			this.intaxabsaamitan();
			this.selected = old;
			this.rakkaz();
			if (isfun(this.on_deselection)) {
				this.on_deselection();
			}
			return this;
		},
		/* TODO
		 * add a sticky mufarraq compensation function
		 * this func should add a px comp
		 * use case to add another sticky heading on top of this list
		 * */
		mufarraq: function (pixels) {
		},
		eawwad: function (o, uid) { // replace with o at num
			var oldclone = this.get( this.id2num(uid) );
			if (oldclone) {
				var newclone = this.set(o);
				replacewith(oldclone, newclone);
				this.adapter.eawwad(uid, o.uid)
				this.adapter.pop(uid);
			}
		},
		set: function (o, id) { // deprecate the second argument
			// supports .ruid -> .uid conversion
			/* IMPORTANT
			 * id would actually change the html#id
			 * so avoid it unless you know what you're doing
			 * */
			if (id) $.log.w('List.set, stop using id, use o.uid instead');
			o = o || {};

			var clone, LV = this, listitem = o._listitem || LV._listitem,
				parent = LV.keys.items,
				available_height = innerheight() - LV.element.offsetTop,
				actual_height = parent.offsetHeight;

			if (isnum(LV._muntahaa) && LV._muntahaa > -1 && LV.length() >= LV._muntahaa)
				return; // muntahaa limit hit

			// id -> o.uid -> LV.length
			if (id === undefined)
				if (o.uid === undefined) {
					var newuid = LV.length();
					LV.adapter.each(function (c, e) {
						if (newuid <= c.uid) newuid = c.uid+1;
					});
					o.uid = id = newuid;
				}
				else id = o.uid;

			if (LV.idprefix_raw && o.uid !== undefined)
				o.id_dom = LV.idprefix_raw + o.uid;

			if (o.uid) {
				clone = elementbyid( o.id_dom || o.uid );
			}
			if (LV.idprefix_raw && o.ruid) {
				clone = elementbyid( LV.idprefix_raw + o.ruid );
				if (clone) {
					clone.id = o.id_dom;
					setdata(clone, 'uid', o.uid)
				}
			}
			
			if (LV.beforeset) o = LV.beforeset(o, o.uid, listitem); // TODO deprecate
			if (LV.before_set) o = LV.before_set(o, o.uid, listitem); // new & approved
			
			if (o.ruid) {
				LV.adapter.pop(o.ruid);
				delete o.ruid;
			}
			LV.adapter.set(o.uid, o);

			if (LV._recycle) return; // defer rendering to scroll events

//			$.log(actual_height, available_height);
//			if (actual_height > available_height) {
//				// setup prepad and postpad
////				LV.keys.postpad.style.height = LV.length() * 32;
//				return false;
//			}

			if (!clone) {
				/*
				 * this is to avoid modifying provided o object
				 * it sets dataset on clone
				 * */
				var o2 = Object.assign({
					id: o.id_dom, // sets the #id of an element
					data: {
						uid: o.uid,
					},
				}, o);
				
				clone = templates.get(listitem, parent, o.before || o.awwal, o.id_dom || o.uid)(o2);
				clone.dataset.listitem = 1;
				
				// 1 = topmost heading, 2 = subheading, hints for .sticky
				if (o.mufarraq) clone.dataset.mufarraq = o.mufarraq;
			}
			else {
				var selected = clone.dataset.selected;
				var baidaa = clone.dataset.baidaa;
				
				templates.set( clone, o, listitem );
				
				if (o.before) { // this allows resorting
					parent.insertBefore(clone, o.before);
				}
				
				if (selected) clone.dataset.selected = 1;
				if (baidaa) clone.dataset.baidaa = 1;
			}

			delete o.before;
			delete o.awwal;


			if (clone) {
				if (o.mu3allaq) setdata(clone, 'mu3allaq', 1);
				else popdata(clone, 'mu3allaq');
				
				clone.onclick = function (e) {
					var item = LV.adapter.get( o.uid );
					if (item) {
						LV.uponclick &&
						LV.uponclick( item, e, LV.id2num(o.uid) );
					}
				};
			}
			
//			if (clone) {
//				if (o.baidaa) clone.dataset.baidaa = 1;
//				else delete clone.dataset.baidaa;
//			}

			LV._katabmowdoo3();

			let keys = Templates.keys(clone);
			LV.afterset  && LV.afterset ( o, clone, keys, listitem ); // TODO deprecate
			LV.ba3dihi   && LV.ba3dihi  ( o, clone, keys, listitem ); // TODO deprecate
			LV.after_set && LV.after_set( o, clone, keys, listitem );
			LV.uponadaaf && LV.uponadaaf( LV.length() ); // TODO deprecate
			Hooks.run( LV.hook_prefix+'-on-changes', { type: 'set', object: o, clone, keys } );

			return clone;
		},
		namoovaj: function (eansarism) { // deprecated
			this._listitem = eansarism || 'listitem';
			return this;
		},
		listitem: function (elementname) { // namoovaj alternative
			return this.namoovaj(elementname);
		},
		axavmfateeh: function (uid) { // TODO deprecate
			var clone = this.get( this.id2num(uid) );
			if (clone) {
				return templates.mfateeh(clone);
			}
		},
		get_item_keys: function (uid) { // NEW
			return this.axavmfateeh(uid);
		},
		axavmuntaxab: function (uid) { // get [selected] item's adapter object
			return this.axadmuntaxab(uid);
		},
		axadmuntaxab: function (uid) {
			uid = this.num2id( uid || this.selected || 0 );
			if (!isundef(uid)) {
				return this.adapter.get( uid );
			}
			return false;
		},
		axav: function () {
			return this.axad();
		},
		axad: function () { // get baidaa item's adapter object
			var items = this.keys.items.children, item, baidaa;
			for (var i in items) {
				if (items.hasOwnProperty(i)) {
					item = items[i];
					if (item.dataset.baidaa) {
						baidaa = item.dataset.uid;
						break;
					}
				}
			}

			if (!isundef(baidaa)) {
				return this.adapter.get( baidaa );
			}
			return false;
		},
		get_item_object: function (num) {
			return this.adapter.get( this.num2id( isundef(num) ? this.selected : num ) );
		},
		get_item_object_by_uid: function (uid) {
			return this.adapter.get( uid );
		},
		get_item_element: function (num) {
			return this.get( isundef(num) ? this.selected : num );
		},
		get_item_element_by_uid: function (uid) {
			return this.get( this.id2num(uid) );
		},
		get: function (id) {
			return this.keys.items.children[id];
		},
		pop: function (id) { // deprecated, use remove_by_uid
			var element, LV = this, uid;
			if (isundef(id)) {
				element = LV.get(LV.selected);
			} else {
				if (LV.idprefix_raw) id = LV.idprefix_raw + id;

				element = elementbyid(id);
			}

			if (element) {
				uid = element.dataset.uid;
				
				let prev_selected = parseint( LV.id2num( uid ) );
				
				let object = LV.adapter.get( uid );
				LV.adapter.pop( uid );

				element.remove();
				
				if (LV.selected) {
					if (LV.selected == LV.length()) // if selected item was the last one
					    LV.selected = LV.length()-1;
					else if (LV.selected == prev_selected) // if deleted item was selected
					    LV.selected = LV.selected-1;
				}

				LV.select_silently();

				LV._katabmowdoo3();
				LV.uponhavaf && LV.uponhavaf( LV.length() );
				
				let keys = Templates.keys( element );
				Hooks.run( LV.hook_prefix+'-on-changes', { type: 'remove', object, clone: element, keys } );
			}
		},
		remove_by_uid: function (uid) { // pop
			return this.pop(uid);
		},
		popall: function () {
			let LV = this;
			this.adapter.each(function ({ uid }) {
				LV.pop( uid );
			});
			innertext(this.keys.items, '');
			innertext(this._muntahaabox, '');
			this._katabmowdoo3();
		},
		remove_all: function () { // popall
			return this.popall();
		},
		press: function (key, force, type) {
			var element = this.get(this.selected);
			if (element) {
				var item = this.adapter.get( element.dataset.uid );
				// EXPLAIN focussed here is key in preventing cross-view key presses
				// list should have a parent view connected to filter out irrelevant events when hidden
				// if a list has no parent views defined, let onpress get triggered
				if (item && (this.visible || force || !this.parent_views.length)) {
					this.onpress && this.onpress( item, key, this.selected );
					this.on_press && this.on_press( item, key, this.selected );

					for (var opl in this.on_press_listeners) {
						this.on_press_listeners[opl]( item, key, this.selected );
					}
				}
			}
			
			return this;
		},
		num2id: function (id) {
			var clone = this.get(id || this.selected);
			if (clone) return clone.dataset.uid;
			return false;
		},
		id2num: function (uid) { // return id of item that has this uid
			var cn = this.keys.items.children;
			for (var i in cn) {
				if (cn.hasOwnProperty(i)) {
					if (cn[i].dataset.uid == uid) return i;
				}
			}
			return false;
		},
		grid: function (num) {
			this.gridnum = num;
			if (num) this.element.dataset.grid = num;
			else delete this.element.dataset.grid;
			return this;
		},
		zumrah: function (zumraat) {
			this.element.className = 'list '+zumraat;
			return this;
		},
		freeflow: function (v) {
			if (v) this.grid(), this.element.dataset.freeflow = 1;
			else delete this.element.dataset.freeflow;
			return this;
		},
		hidetext: function (num) {
			if (num) this.element.dataset.hidetext = num;
			else delete this.element.dataset.hidetext;
			return this;
		},
		muntahaa: function (max, muntahaabox) { // maximum
			this._muntahaa = max || -1;
			this._muntahaabox = this.keys.miqyaas || this._muntahaabox;
			if (this._muntahaabox && max > -1) this.keys.miqyaas.hidden = 0;
			return this;
		},
		_katabmowdoo3: function () {
			var LV = this, len = LV.length();
			if (isnum(LV._muntahaa) && LV._muntahaa > -1) {
				innertext(LV._muntahaabox, len+' / '+ LV._muntahaa);
			}
			if (!this._mowdoo3) {
				if (!this.keys.raees.hidden) this.keys.raees.hidden = 1;
			} else {
				var new_value = len ? 0 : 1;
				if (this.keys.raees.hidden !== !!new_value) this.keys.raees.hidden = new_value;
			}
		},
		mowdoo3: function (m, i18n) { // deprecated -> title
			this._mowdoo3 = m || 0;
			if (i18n)
				attribute(this.keys.mowdoo3list, 'data-i18n', m),
				xlate.update(this.element);
			else if (m)
				innertext(this.keys.mowdoo3list, m);
			this._katabmowdoo3();
			return this;
		},
		title: function (m, i18n) { // only visible when length > 0
			return this.mowdoo3(m, i18n);
		},
		set_scrolling_element: function () {
			
		},
		idprefix: function (id) {
			this.idprefix_raw = id;
			return this;
		},
		bahac: function (bahacbox) {
			var LV = this;
			/* EXPLAIN
			 * connects this list to bahacbox, bahacbox.onchange is listened on
			 * with a $.taxeer
			 * list.uponpaststart is also connected to bahacbox.focus
			 * bahacbox.onpastend is prolly auto handled by softkeys
			 * */
			if (bahacbox instanceof HTMLInputElement) {
				LV.uponpaststart = function () {
					bahacbox.focus();
					return 1;
				};
				bahacbox.oninput = function () {
					$.taxeer('listbahac', function () {
						LV.uponbahac && LV.uponbahac( bahacbox.value.trim() )
					}, 250);
				};
				bahacbox.onfocus = function () {
					LV.rakkaz();
				};
			}
			return LV;
		},
	};

	// only scroll if too close to edge
	proto.scroll_up_if_needed = function ( item ) {
		item = item || this.get( this.selected );
		if (this.reverse) { // down
			let [ x, y ] = get_bounds( item );
			if ( y > innerheight()-200 ) {
				scroll_by(0, item.offsetHeight);
			}
		} else { // up
			let [ x, y ] = get_bounds( item );
			if ( y < 200 ) {
				scroll_by(0, -item.offsetHeight);
			}
		}
	};
	proto.scroll_down_if_needed = function ( item ) {
		item = item || this.get( this.selected );
		if (this.reverse) { // up
			let [ x, y ] = get_bounds( item );
			if ( y < 200 ) {
				scroll_by(0, -item.offsetHeight);
			}
		} else { // down
			let [ x, y ] = get_bounds( item );
			if ( y > innerheight()-200 ) {
				scroll_by(0, item.offsetHeight);
			}
		}
	};

	proto.is_uid_selected = function (uid) {
		return parseint( this.id2num( uid ) ) == this.selected;
	};
	proto.select_next_visible = function (uid) {
		// selects the closest prev element silently, useful for removals and hides
		let prev_selected = parseint( this.id2num( uid ) );
		let LV = this;
		for (let i = prev_selected+1; i < this.length(); i++) {
			let ns = this.get(i);
			if (ns && !ns.hidden) {
				LV.selected = i;
				break;
			}
		}
		LV.select_silently();
	};

	proto.hide_item = function (uid) {
		let element = this.get_item_element_by_uid(uid);
		if (element) {
			let is_selected = this.is_uid_selected(uid);
			ixtaf(element);
			if (is_selected) {
				this.select_next_visible(uid);
			}
		}
	};
	proto.show_item = function (uid) {
		let element = this.get_item_element_by_uid(uid);
		if (element) {
			izhar(element);
		}
	};

	proto.move_up = proto.moveup;
	proto.move_down = proto.movedown;
	
	proto.set_reversed = function (yes) {
		this.reverse = yes ? 1 : 0;
	};
	proto.id_prefix = proto.idprefix;
	proto.list_item = proto.listitem;
	proto.template = proto.list_item;
	proto.set_focus = proto.rakkaz;
	proto.set_visibility = function (yes) {
		var proto = this;
		// TODO listen for changes on the visible data attribute and reflect them here
		proto.visible = !!yes;
		if (yes)
			setdata(proto.element, 'visible', 1);
		else
			popdata(proto.element, 'visible');
	};
	proto.highlight = proto.baidaa;
	proto.select_silently = proto.intaxabsaamitan;
	proto.select_silently_by_uid = function (id) {
		proto.select_silently(this.id2num(id));
	};
	proto.prevent_focus = function (yes) {
		this._prevent_focus = yes;
		return this;
	};

	proto.listen_on_press = function (callback, name) {
		var count = Object.keys( this.on_press_listeners ).length;
		this.on_press_listeners[ name || count ] = callback;
	};

	proto.get_parent_views = function () {
		var proto = this;
		return proto.parent_views.concat([]);
	};
	proto.add_parent_view = function (name) {
		var proto = this;
		if (isarr(name)) {
			name.forEach(function (o) {
				proto.add_parent_view(o)
			});
		} else if (!proto.parent_views.includes(name)) {
			proto.parent_views.push(name);
		}
		return proto;
	};
	proto.remove_parent_view = function (name) {
		var proto = this;
		proto.parent_views.splice( proto.parent_views.indexOf(name), 1 );
	};
	proto.is_parent_view = function (name) {
		var proto = this;
		return proto.get_parent_views().includes(name);
	};
	
	Hooks.set(['view-ready', 'restore'], function () {
		var lists = document.body.querySelectorAll('[data-list]');
		if (debug_list)	$.log.w( 'List', View.get(), 'ready' );
		lists.forEach(function (l) {
			if ( isundef( getdata(l, 'template') ) ) {
				var LV = l.parentElement.listobject;
				if (LV && LV.idprefix_raw) { // only unique lists should be targeted
					var visible = LV.is_parent_view( View.get() );

					LV.set_visibility( visible );

					if (visible) {
						if (debug_list)	$.log.w( 'List', LV.idprefix_raw, 'visible' );
						// TODO only gain focus if it was previously focussed
					} else {
						if (debug_list)	$.log.w( 'List', LV.idprefix_raw, 'hidden' );
//						controls_list.set_focus(); // lose focus
					}
				}
			}
		});
	});
	
	// TODO FIX memory leak, watch list elements being removed and auto call destroy for old modules
	// like sheets, ...
	let all_lists = {};
	
	List = list = function (element) { // TODO deprecate list
		if (isundef(element)) throw new Error('List needs an element');
	
		let LV = Object.create(proto);

		all_lists[ element ] = LV;
		
		let all_hooks = [];
		function set_hook(...args) {
			let hook = Hooks.set.apply(Hooks, args);
			all_hooks.push( hook );
			return hook;
		}
		
		LV.destroy = async function () {
			// TODO cancel all pending operations 
			// 		cancel fetches
			// 		cancel animations
			// 		delete all data

			// unhook all
			all_hooks.forEach(function (hook) {
				hook.remove();
			});

			delete all_lists[ element ];

			if (this.element) {
				if (this.element.parentElement) {
					popdata(this.element.parentElement, 'focus');
				}
				this.element.remove();
				delete this.element;
			}
		};
		LV.restore_selection = function () { // make [data-selected] element .selected
			let selected_element = LV.keys.items.querySelector('[data-selected]');
			if (selected_element) {
				let order = [ ...LV.keys.items.children ].indexOf( selected_element );
				if ( order > -1 ) {
					LV.selected = order;
				}
			}
		};
		
		let hook_prefix = LV.hook_prefix = [ 'list', Time.now() * Math.random(), Time.now() * Math.random() ].join('-');

		LV.on_changes = function (callback) { return set_hook(hook_prefix+'-on-changes', callback); };
		LV.on_focus = function (callback) { return set_hook(hook_prefix+'-on-focus', callback); };

		LV.on_press_listeners = {};
		LV.parent_views = [];

		setdata(element, 'focus', 'list'); // hint to Softkeys that this can be .focus()'d

		element.listobject = LV;
		LV.filmakaan = element.dataset.filmakaan;
		LV.element = templates.get( 'list', element )();
		LV.listitem();
		LV.adapter = $.array();
		LV.keys = templates.keys( LV.element );
		LV.selected = 0;
		LV.muntahaa();
		LV.title();
		/* IMPORTANT EXPLAIN
		 * this is for use cases with a single list that is focussed by default
		 * for multiple lists in a focus group, chain .rakkaz() to unset this
		 * before setting uponrakkaz
		 * */
//		LV.rakkaz(1);
		
		// mouse
		// TODO check instances of onclick and migrate to uponclick
		LV.uponclick = function (i, e, uid) {
			/* call these before triggering press events in case press handler
			 * calls pop or set and that changes this.selected
			 * */
			LV.beforepress && LV.beforepress(i, e, uid);
			let old_selection = LV.selected; // to allow select then press logic TODO allow press on select with holds
			LV.selected = parseint(uid); // this needs to be before select_silently so that events get the right uid
			LV.select_silently( uid ); // select without trig event, this does trigger on_selection
			let yes = old_selection == uid && LV.element.dataset.focussed == 1;
			LV.rakkaz(1, 1);
			
			if (yes) LV.press(K.en, 0, 'click');
		};
//		LV.element.onwheel = function (e) {
//			$.log( e );
//			preventdefault(e);
//			if (e.deltaY < -10)
//				LV.down(e);
//			else if (e.deltaY > 10)
//				LV.up(e);
//		};
		
		return LV;
	};
})();


