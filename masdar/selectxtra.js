;(function () {
	'use strict';
	
	selectxtra = {
		/* TODO
		 * move other widgets' expansions in here
		 * */
		setheading: function (type, element, value) {
			if (type === 'XPO.autolabel') {
				var div = document.createElement('div'),
					span = document.createElement('span');
				
				if (element instanceof HTMLSelectElement || element instanceof HTMLDivElement) {
//					div.className = 'XPO.autolabel XPO.smaller '+autolabel.className;
					div.className = 'XPO.autolabel '+element.className;
				} else {
					div.className = 'XPO.autolabel '+element.className;
				}

				delete element.dataset.XPO.autolabel;
				span.className = 'XPO.label';
				span.dataset.XPO.i18n = element.dataset.XPO.i18n;
				element.placeholder = '';
				delete element.dataset.XPO.i18n;
				var uid = element.dataset.XPO.id+'XPO.autolabel';
				element.parentElement.replaceChild(div, element);
				div.insertBefore(span, div.firstChild);
				if (element.hidden)
					div.hidden = 1, element.hidden = 0;
				span.onclick = function () {
					element.focus();
				};
				div.dataset.XPO.id = uid;
				return div;
			}
			
			return element;
		},
		/*
		 * also handles
		 * 	auto labels
		 * 	auto heights:	text-areas that change heights as you type
		 * 	auto options:	extended checkboxes
		 * */
		setupwidgets: function (parent) {
			var selectfn = function (e) {
				if (e.type == 'keydown') {
					if (!['enter', ' '].includes( e.key.toLowerCase() ))
						return;
				}
				
				if (!e.altKey) // allow back next navi events
					e.preventDefault();
				
				var bigtitle;
				if (e && e.target && e.target.previousElementSibling)
					bigtitle = e.target.previousElementSibling.dataset.XPO.i18n;
				
				if (bigtitle)
					XPO.selectplustitle.dataset.XPO.i18n = bigtitle;
				else
					delete XPO.selectplustitle.dataset.XPO.i18n,
					XPO.selectplustitle.innerText = '';

				helpers.updatei18n(XPO.container);
				var parentselect = this;
				XPO.selectplus.innerText = '';
				showall(XPO.selectplustitle, XPO.selectplus, XPO.dimmerscreen);
				backstack.pushstate(0, 1);
				for (var i in parentselect.children) {
					if (parentselect.children.hasOwnProperty(i)) {
						var option = parentselect.children[i];
						var selected = option.selected || option.value === parentselect.value;
						var clone = dom.getclone(tmpl.XPO.button, XPO.selectplus, {
							title: option.innerText,
							XPO.i18n: option.XPO.i18n,
							XPO.selected: selected,
							value: option.value,
							rect: 1,
							ontap: function () {
								parentselect.value = this.value;
								hideall(XPO.selectplus, XPO.selectplustitle, XPO.dimmerscreen);
								backstack.back();
								parentselect.onchanges && parentselect.onchanges();
							},
						});
						if (selected)
							clone.scrollIntoView();
					}
				}
				// this block only works here, after the options are populated
				/*var xy = helpers.getposition(parentselect);
				XPO.selectplus.style.top = xy[1]+'px';
				XPO.selectplus.style.maxWidth = '';
				if ( document.body.dir === 'ltr' ) {
					XPO.selectplus.style.right = '';
					XPO.selectplus.style.left = xy[0]+'px';
					XPO.selectplus.style.maxWidth = window.innerWidth-5-xy[0]+'px';
				} else {
					// this needs options to be populated first
					var right = xy[0]-XPO.selectplus.clientWidth;
					if (right < 5) right = 5;
					var width = window.innerWidth-5-(XPO.selectplus.offsetLeft)
					if (width < 280) width = 280;
					if (width > window.innerWidth) width = window.innerWidth-5;
					XPO.selectplus.style.right = right+'px';
					XPO.selectplus.style.left = '';
					XPO.selectplus.style.maxWidth = width+'px';
				}*/
			};
			var selects = parent.querySelectorAll('select');
			for (var i in selects) {
				if ( selects.hasOwnProperty(i) ) {
					var selectsi = selects[i];
					selectsi.onmousedown = selectsi.onkeydown = selectfn;
				}
			}
			var autolabels = parent.querySelectorAll('[data-XPO.autolabel]');
			autolabels.forEach(function (autolabel) {
				var div = selectxtra.setheading('XPO.autolabel', autolabel);
				div.insertBefore(autolabel, null);
			});

			var autoheights = parent.querySelectorAll('[data-XPO.autoheight]');
			autoheights.forEach(function (autoheight) {
				autoheight.XPO.autoheight = function () {
					this.style.height = '';
					if (this.scrollHeight > 30)
						this.style.height = this.scrollHeight+'px';
				};
				autoheight.onkeyup = autoheight.XPO.autoheight;
			});

			var autooptions = parent.querySelectorAll('[data-XPO.autooption]');
			autooptions.forEach(function (autooption) {
				var buttons = autooption.querySelectorAll('button');
				buttons.forEach(function (button) {
					button.onclick = function () {
						autooption.value = this.value;
						buttons.forEach(function (button) {
							delete button.dataset.XPO.selected;
						});
						button.dataset.XPO.selected = 1;
					};
				});
				autooption.setvalue = function (value) {
					autooption.value = value;
					buttons.forEach(function (button) {
						if (button.value == value)
							button.dataset.XPO.selected = 1;
						else
							delete button.dataset.XPO.selected;
					});
				};
			});
		},
	};
	/* REMEMBER
	 * this is called for all select elements in #container
	 * this is why each widget lives in its own module
	 * */
	Hooks.set('XPO.domsetup', 'XPO.selectxtra', function (id) {
		selectxtra.setupwidgets(XPO.container);
	});
	Hooks.set('XPO.domsetupwidgets', 'XPO.selectxtra', function (parent) {
		selectxtra.setupwidgets(parent);
	});
})();