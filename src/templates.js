//+ index before mfateeh
/*
 * props ending in $h use innerhtml
 * 			...	   $t use [i18n]
 * */
var Templates, templates, namaavij;
;(function(){
	var index = {};
	Templates = templates = {
		mfateeh: function (element) {
			return templates.keys(element);
		},
		keys: function (element) {
			if (!(element instanceof HTMLElement)) return;
			var keys = {};
			var otherviews = element.querySelectorAll('[data-id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {
					if (otherviews[i].dataset)
						keys[ otherviews[i].dataset.id ] = otherviews[i];
				}
			}
			return keys;
		},
		// matches properties in an object despite $suffixes, returns value
		has_property: function (o, prop) {
			for (var i in o) {
				var name = i.split('$')[0];
				if (name == prop)
					return o[i];
			}
			return false;
		},
		set: function (clone, o, template) {
			var keys = templates.keys(clone);
			o = o || {};
			if (o.hidden) clone.hidden = 1;
			if (o.id) clone.id = o.id;
			if (o.classes) clone.className = o.classes;

			if (o.status == 1) clone.dataset.selected = 1, clone.disabled = 0;
			else if (o.status == 2) clone.disabled = 1, delete clone.dataset.selected;
			else clone.disabled = 0, delete clone.dataset.selected;

			if (o.data)
			for (var i in o.data) {
				if (o.data[i] !== undefined)
					clone.dataset[i] = o.data[i];
				else
					delete clone.dataset[i];
			}

			if (o.onclick) clone.onclick = o.onclick;
			for (var i in keys) {
				/* TODO document why this is so
				 * this doesn't let you specify i18n in templates :(
				 * cleanup previous mess from i18n
				 * */
				if (isundef(o[i+'$t'])) {
					if (keys[i].dataset.i18n) {
						innertext(keys[i], '');
						delete keys[i].dataset.i18n;
					}
				}
				
				var is_icon = !isundef( o[i+'$icon'] );
				var is_image = !isundef( o[i+'$image'] );
				
				var has_time = i+'$time';
				if (!isundef( o[has_time] )) {
					if (isundef( o[has_time] )) {
						popdata(keys[i], 'time');
						innertext(keys[i], '');
					} else
						setdata(keys[i], 'time', o[has_time]);
				}

				if ( !isundef(o[i]) || !isundef(o[i+'$h']) || !isundef(o[i+'$t']) || is_icon || is_image ) {
					if (o[i] == 'ixtaf') {
						keys[i].hidden = 1;
					} else
					if (o[i] == 'izhar') {
						keys[i].hidden = 0;
					} else
					if (keys[i] instanceof HTMLInputElement) {
						keys[i].value = o[i];
					} else
					if (keys[i] instanceof HTMLImageElement) {
						if (typeof o[i] === 'string' && o[i].length) {
							if (o[i].startsWith('app://'))
								keys[i].src = o[i];
							else
								keys[i].src = o[i];
							keys[i].hidden = 0;
						} else {
							keys[i].hidden = 1;
						}
					} else
					if ( ['titlehours', 'titledays', 'titletime',
							'time', 'timeshow', 'days', 'waqt']
						.includes(i) ) { // dataset.time...
						if (o[i] !== undefined) {
							keys[i].dataset.time = o[i];
						}
						// is this a deadline
						if (o.deadline)
							keys[i].dataset.deadline = 1;
						else
							delete keys[i].dataset.deadline;
					} else // improve how this is handled
					if (['titlei18n', 'bodyi18n'].includes(i)) {
						if (o[i]) {
							keys[i].hidden = 0;
							keys[i].dataset.i18n = o[i];
						} else {
							keys[i].hidden = 1;
							delete keys[i].dataset.i18n;
							keys[i].innerHTML = '';
						}
					} else // improve how this is handled
					if (['titlehtml', 'bodyhtml', 'bodyshowhtml']
						.includes(i)) { // raw HTML mode
						if (o[i]) {
							keys[i].hidden = 0;
							keys[i].innerHTML = o[i];
						} else {
							keys[i].hidden = 1;
							keys[i].innerHTML = '';
						}
					} else
					if (['icon', 'eqonah'].includes(i) || is_icon || is_image) { // create SVG inside or img if src = /...
						var icon_src = o[i];
						if (is_icon || is_image) {
							icon_src = o[i+'$icon'] || o[i+'$image'];
						}
						if (isstr(icon_src) && icon_src.length) {
							keys[i].hidden = 0;
							if (icon_src.startsWith('/') || is_image) {
								innerhtml(keys[i], '<img src="'+icon_src+'" />');
							} else {
								var e = icons.querySelector('#'+icon_src);
								if (e)
									keys[i].innerHTML	= '<svg viewBox="0 0 48 48">'+e.cloneNode(1).innerHTML+'</svg>';
							}
//							keys[i].innerHTML = '<svg><use xlink:href=\'#'+o[i]+'\'></use></svg>';
						} else {
							keys[i].hidden = 1;
							keys[i].innerHTML = '';
						}
					} else {
						if (keys[i].hidden) keys[i].hidden = 0;
						var html = o[i+'$h'], trjm = o[i+'$t'];

						if (!isundef(html)) {
							innerhtml(keys[i], html);
						} else if (!isundef(trjm)) {
							keys[i].dataset.i18n = trjm;
						} else {
							innertext(keys[i], o[i]);
						}
					}
				}
			}

			Hooks.rununtilconsumed('templateset', [clone, o, keys, template]);
			
			// TODO these need to be moved back to their own mods under a hook
			translate && translate.update(clone.parentElement);
			time && time(clone.parentElement);
			datepicker && datepicker.fahras(clone.parentElement);
			return clone;
		},
		/*
		 * you can pass either an element or a name that's already indexed
		 * 
		 * if only element is specified, then its clone is returned
		 * 
		 * if parent is also specified then it inserts the clone under parent
		 * and returns a function that accepts {options} to setup the clone
		 * 
		 * before can be a child under parent to insert before, else appends
		 * 
		 * id can be used to reuse old elements
		 * */
		get: function (element, parent, before, id) {
			if (isstr(element)) element = index[element];
			if (!(element instanceof HTMLElement)) {
				$.log.e( 'templates.get element not found', arguments );
				return false;
			}
			
			var clone, template;
			if (id) {
				clone = document.getElementById(id);
				// if clone is found then insert it in place
				if (clone) before = clone.nextElementSibling;
			}

			if (!clone)
				clone = element.cloneNode(true),
				template = clone.dataset.template,
				delete clone.dataset.template,
				clone.hidden = 0;

			if (parent) {
				if (before instanceof HTMLElement) {
					parent.insertBefore(clone, before);
				} else if (before) {
					parent.insertBefore(clone, parent.firstElementChild);
				} else
					parent.appendChild(clone);
				
				Hooks.rununtilconsumed('widgets', parent);

				return function (o) {
					return templates.set(clone, o, template);
				};
			}
			
			return clone;
		},
		/* replace element with a template
		 * 
		 */
		replace_with: function (element, replacement) {
			if (isstr(replacement)) replacement = index[ replacement ];

			if (!(element instanceof HTMLElement)) return false;
			if (!(replacement instanceof HTMLElement)) return false;

			var clone, template;

			clone = replacement.cloneNode(true),
			template = clone.dataset.template,
			delete clone.dataset.template,
			clone.hidden = 0;

			element.replaceWith(clone);

			return function (o) {
				return templates.set(clone, o, template);
			};
		},
		/*
		 * indexes any htm elements marked with [template=<name>]
		 * */
		index: function (parent) {
			var elements = (parent||document.body).querySelectorAll('[data-template]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.template ) {
					elements[i].hidden = 1;
					index[ elements[i].dataset.template ] = elements[i];
				}
			}
			return index;
		},
	};
	templates.index();
	namaavij = templates;
	namaavij.axav = namaavij.get;
})();