//+ index before mfateeh
/*
 * props ending in $h use innerhtml
 * 			...	   $t use [i18n]
 * */
var templates, namaavij;
;(function(){
	var index = {};
	templates = {
		mfateeh: function (element) {
			return templates.keys(element);
		},
		keys: function (element) {
			if (!(element instanceof HTMLElement)) return;
			var keys = {};
			var otherviews = element.querySelectorAll('[data-XPO.id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {
					if (otherviews[i].dataset)
						keys[ otherviews[i].dataset.XPO.id ] = otherviews[i];
				}
			}
			return keys;
		},
		set: function (clone, o, template) {
			var keys = templates.keys(clone);
			o = o || {};
			if (o.hidden) clone.hidden = 1;
			if (o.id) clone.id = o.id;
			if (o.classes) clone.className = o.classes;

			if (o.status == 1) clone.dataset.XPO.selected = 1, clone.disabled = 0;
			else if (o.status == 2) clone.disabled = 1, delete clone.dataset.XPO.selected;
			else clone.disabled = 0, delete clone.dataset.XPO.selected;

			if (o.XPO.data)
			for (var i in o.XPO.data) {
				if (o.XPO.data[i] !== undefined)
					clone.dataset[i] = o.XPO.data[i];
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
					if (keys[i].dataset.XPO.i18n) {
						innertext(keys[i], '');
						delete keys[i].dataset.XPO.i18n;
					}
				}

				if ( !isundef(o[i]) || !isundef(o[i+'$h']) || !isundef(o[i+'$t']) ) {
					if (o[i] == 'XPO.ixtaf') {
						keys[i].hidden = 1;
					} else
					if (o[i] == 'XPO.izhar') {
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
								keys[i].src = 'file://'+o[i];
							keys[i].hidden = 0;
						} else {
							keys[i].hidden = 1;
						}
					} else
					if ( ['XPO.titlehours', 'XPO.titledays', 'XPO.titletime',
							'XPO.time', 'XPO.timeshow', 'XPO.days', 'XPO.waqt']
						.includes(i) ) { // dataset.XPO.time...
						if (o[i] !== undefined) {
							keys[i].dataset.XPO.time = o[i];
						}
						// is this a deadline
						if (o.XPO.deadline)
							keys[i].dataset.XPO.deadline = 1;
						else
							delete keys[i].dataset.XPO.deadline;
					} else // improve how this is handled
					if (['XPO.titlei18n', 'XPO.bodyi18n'].includes(i)) {
						if (o[i]) {
							keys[i].hidden = 0;
							keys[i].dataset.XPO.i18n = o[i];
						} else {
							keys[i].hidden = 1;
							delete keys[i].dataset.XPO.i18n;
							keys[i].innerHTML = '';
						}
					} else // improve how this is handled
					if (['XPO.titlehtml', 'XPO.bodyhtml', 'XPO.bodyshowhtml']
						.includes(i)) { // raw HTML mode
						if (o[i]) {
							keys[i].hidden = 0;
							keys[i].innerHTML = o[i];
						} else {
							keys[i].hidden = 1;
							keys[i].innerHTML = '';
						}
					} else
					if (['XPO.icon', 'XPO.eqonah'].includes(i)) { // create SVG inside
						if (typeof o[i] === 'string' && o[i].length) {
							keys[i].hidden = 0;
							var e = XPO.eqonaat.querySelector('#'+o[i]);
							if (e)
								keys[i].innerHTML	= '<svg viewBox="0 0 48 48">'+e.cloneNode(1).innerHTML+'</svg>';
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
							keys[i].dataset.XPO.i18n = trjm;
						} else {
							innertext(keys[i], o[i]);
						}
					}
				}
			}

			Hooks.rununtilconsumed('XPO.templateset', [clone, o, keys, template]);
			
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
			if (!(element instanceof HTMLElement)) return false;
			
			var clone, template;
			if (id) {
				clone = document.getElementById(id);
				// if clone is found then insert it in place
				if (clone) before = clone.nextElementSibling;
			}

			if (!clone)
				clone = element.cloneNode(true),
				template = clone.dataset.XPO.template,
				delete clone.dataset.XPO.template,
				clone.hidden = 0;

			if (parent) {
				if (before instanceof HTMLElement) {
					parent.insertBefore(clone, before);
				} else if (before) {
					parent.insertBefore(clone, parent.firstElementChild);
				} else
					parent.appendChild(clone);
				
				Hooks.rununtilconsumed('XPO.widgets', parent);

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
			template = clone.dataset.XPO.template,
			delete clone.dataset.XPO.template,
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
			var elements = (parent||document.body).querySelectorAll('[data-XPO.template]');
			for (var i in elements) {
				if ( elements.hasOwnProperty(i) && elements[i].dataset.XPO.template ) {
					elements[i].hidden = 1;
					index[ elements[i].dataset.XPO.template ] = elements[i];
				}
			}
			return index;
		},
	};
	templates.index();
	namaavij = templates;
	namaavij.axav = namaavij.get;
})();