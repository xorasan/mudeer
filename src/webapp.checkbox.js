//+ jaddad fahras setvalue
var checkbox;
;(function(){
	checkbox = {
		jaddad: function (clone) {
			if (clone.dataset.XPO.checked === '1')
				clone.dataset.XPO.checked = '0',
				clone.value = 0;
			else
				clone.dataset.XPO.checked = '1',
				clone.value = 1;

			templates.set(clone, {
				XPO.icon: clone.dataset.XPO.checked === '1' ?
							'XPO.iconcheckbox' : 'XPO.iconcheckboxoutlineblank'
			});
		},
		fahras: function (parent) {
			/*
			 * indexing in the whole document is buggy because it'll replace
			 * elements in templates and that makes the onclick functions not work
			 * */
			if (!parent) return;

			var elements = parent.querySelectorAll('[data-XPO.checkbox]');
			for (var i in elements) {
				var element = elements[i];
				if ( hasownprop(elements, i) &&
					element.dataset.XPO.checkbox !== undefined ) {
					var clone = templates.get('XPO.checkbox');
					
					clone.dataset.XPO.id = element.dataset.XPO.id;
					clone.dataset.XPO.checked = element.dataset.XPO.checked !== undefined ? 0 : 1;
					
					var mfateeh = templates.keys(clone);
					mfateeh.XPO.label.dataset.XPO.i18n = element.dataset.XPO.i18n;
					
					element.replaceWith( clone );
					
					checkbox.jaddad(clone);

					clone.onclick = function () {
						checkbox.jaddad(clone);
					};

					clone.setvalue = function (value) {
						clone.dataset.XPO.checked = value ? 0 : 1;
						checkbox.jaddad(clone);
					};
				}
			}
		},
	};

	Hooks.set('XPO.widgets', function (parent) {
		if (parent) checkbox.fahras(parent);
	});

})();