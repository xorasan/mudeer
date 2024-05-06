//icons checkbox checkboxoutlineblank
var Checkbox;
;(function(){
	var checked_str = 'checked'
	Checkbox = {
		update: function (clone) {
			if (getdata(clone, checked_str) === '1') {
				setdata(clone, checked_str, 0);
				clone.value = 0;
			} else {
				setdata(clone, checked_str, 1);
				clone.value = 1;
			}
			Templates.set(clone, {
				icon$icon: getdata(clone, checked_str) === '1' ?
							'iconcheckbox' : 'iconcheckboxoutlineblank'
			});
		},
		index: function (parent) {
			/*
			 * indexing in the whole document is buggy because it'll replace
			 * elements in templates and that makes the onclick functions not work
			 * */
			if (!parent) return;

			var elements = parent.querySelectorAll('[data-checkbox]');
			for (var i in elements) {
				var element = elements[i];
				if ( hasownprop(elements, i) && element.dataset.checkbox !== undefined ) {
					var clone = Templates.get('checkbox');
					
					clone.dataset.id = element.dataset.id;
					setdata( clone, checked_str, element.dataset.checked !== undefined ? 0 : 1 );
					
					var mfateeh = Templates.keys(clone);
					setdata( mfateeh.label, 'i18n', getdata(element, 'i18n') );
					
					element.replaceWith( clone );
					
					Checkbox.update(clone);

					clone.onclick = function () {
						Checkbox.update(clone);
					};

					clone.setvalue =
					clone.set_value = function (value) {
						clone.dataset.checked = value ? 0 : 1;
						Checkbox.update(clone);
					};
					clone.set_label = function (value) {
						innertext(mfateeh.label, value);
					};
				}
			}
		},
	};

	Hooks.set('widgets', function (parent) {
		if (parent) Checkbox.index(parent);
	});

})();