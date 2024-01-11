/* lists have an adapter $.array, it contains the objects present in the dom list
 * 
 * the adapter set/pop functions can be overriden to provide your own logic
 * 
 * the dom list set/pop functions also mutate the adapter
 * */
var List, list;
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
		moveup: function (uid) {
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
		movedown: function (uid) {
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
		uponrakkaz: function (v, active) { // active = visible & view is active
			if (v && active) Softkeys.list.basic(this);
		},
		rakkaz: function (v, active) { // deprecated, use set_focus
			if (this._prevent_focus) return;

			var yes;
			this.murakkaz = !!v;
			if (v && !this.element.dataset.focussed) this.element.dataset.focussed = 1, yes = 1;
			else if (!v && this.element.dataset.focussed) delete this.element.dataset.focussed, yes = 1;
			(yes || active) && this.uponrakkaz && this.uponrakkaz(v, active);
		},
		/* TODO
		 * improve this navigation to account for mufarraqaat
		 * detect if the next item is a mufarraq, skip it.
		 * */
		first: function (select) {
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
		last: function () {
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
		up: function (e) {
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
				if (this.uponpaststart)
					yes = this.uponpaststart(this.selectedold);

				if (yes) {
					this.selected = 0;
					this.intaxabscroll( this.intaxabsaamitan() );
				}
				else this.last();
			} else {
				this.intaxabscroll( this.intaxabsaamitan() );
			}
			return this;
		},
		length: function () {
			if (isfun(this.uponlength)) // custom length algo
				return this.uponlength();
			return this.keys.items.children.length;
		},
		down: function (e) {
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
				if (this.uponpastend)
					yes = this.uponpastend(this.selectedold);

				if (yes) {
					this.selected = this.length()-1;
					this.intaxabscroll( this.intaxabsaamitan() );
				}
				else this.first(this.gridnum ? this.selected - this.length()-1 : -1);
			} else {
				this.intaxabscroll( this.intaxabsaamitan() );
			}
			return this;
		},
		right: function (e, fake) {
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
				if (selected) scrollintoview(selected);
			} else {
				if (this.selected === 0) webapp.scrollto();
				else if (selected) webapp.scrollto(selected);
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
			/* IMPORTANT
			 * id would actually change the html#id
			 * so avoid it unless you know what you're doing
			 * */
			if (id) $.log('List.set, stop using id, use o.uid instead');
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
			
			if (LV.beforeset) o = LV.beforeset(o, o.uid); // TODO deprecate
			if (LV.before_set) o = LV.before_set(o, o.uid); // new & approved
			
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
				delete o.before;
				delete o.awwal;
				clone.dataset.listitem = 1;
				
				// 1 = topmost heading, 2 = subheading, hints for .sticky
				if (o.mufarraq) clone.dataset.mufarraq = o.mufarraq;
			}
			else {
				var selected = clone.dataset.selected;
				var baidaa = clone.dataset.baidaa;
				
				templates.set( clone, o, listitem );
				
				if (selected) clone.dataset.selected = 1;
				if (baidaa) clone.dataset.baidaa = 1;
			}

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

			LV.afterset && LV.afterset( o, clone, templates.keys(clone) ); // TODO deprecate
			LV.ba3dihi && LV.ba3dihi( o, clone, templates.keys(clone) ); // TODO deprecate
			LV.after_set && LV.after_set( o, clone, templates.keys(clone) );
			LV.uponadaaf && LV.uponadaaf( LV.length() );

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
		get_item_element: function (uid) {
			return this.get( isundef(uid) ? this.selected : uid );
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
				LV.adapter.pop( uid );

				element.remove();
				
				if (LV.selected) {
					if (LV.selected == LV.length())
					    LV.selected = LV.length()-1;
					else
					    LV.selected = LV.selected-1;
				}

				LV.intaxabsaamitan();

				LV._katabmowdoo3();
				LV.uponhavaf && LV.uponhavaf( LV.length() );
			}
		},
		remove_by_uid: function (uid) { // pop
			return this.pop(uid);
		},
		popall: function () {
			this.adapter = $.array();
			innertext(this.keys.items, '');
			innertext(this._muntahaabox, '');
			this._katabmowdoo3();
		},
		remove_all: function () { // popall
			return this.popall();
		},
		press: function (key, force) {
			var element = this.get(this.selected);
			if (element) {
				var item = this.adapter.get( element.dataset.uid );
				if (item) {
					(this.element.dataset.focussed || force) &&
					this.onpress && this.onpress( item, key, this.selected );
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
			this.keys.raees.hidden = len ? 0 : 1;
			if (!this._mowdoo3) this.keys.raees.hidden = 1;
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
		destroy: function () {
			
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
	
	proto.set_focus = proto.rakkaz;
	proto.highlight = proto.baidaa;
	proto.prevent_focus = function (yes) {
		this._prevent_focus = yes;
		return this;
	};
	
	List = list = function (element) { // TODO deprecate list
		var LV = Object.create(proto);
		element.dataset.focus = 'list';
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
			LV.intaxabsaamitan( uid ); // select without trig event
			var yes = LV.selected == uid && LV.element.dataset.focussed == 1;
			LV.selected = uid;
			LV.rakkaz(1, 1);
			
			if (yes) LV.press(K.en);
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


