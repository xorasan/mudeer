//+ okay cancel onshow hide show
var dialog;
;(function(){

	dialog = {
		okay: 0,
		cancel: 0,
		onshow: 0,
		hide: function () {
			dialogui.hidden = 1;
			dialog.okay = 0;
			dialog.cancel = 0;
		},
		show: function (args) {
			args = args || {};
			
			// blur in case any prev input is focused, to allow esc
			markooz() && markooz().blur();
			
			dialogui.hidden = 0;
			var k			= templates.keys(dialogui)	,
				max			= args.max		||	args.x	,
				callback	= args.callback	||	args.c	,
				message		= args.message	||	args.m	,
				answer		= args.answer	||	args.a	,
				question	= args.question	||	args.q	,
				multiline	= args.multiline,
				input_element;
			
			// clear previous data
			k.input.value = '';
			k.textarea.value = '';

			if (multiline) {
				ixtaf(k.input);
				izhar(k.textarea);
				input_element = k.textarea;
			} else {
				ixtaf(k.textarea);
				izhar(k.input);
				input_element = k.input;
			}
			
			dialog.onshow && dialog.onshow(name);
			
			dialog.okay = function () {
				var answer = input_element.value;
				if (max) answer = answer.slice(0, max);
				callback && callback(answer);
				document.activeElement && document.activeElement.blur();
				Hooks.run('back');
			};
			dialog.cancel = function () {
				document.activeElement && document.activeElement.blur();
				Hooks.run('back');
			};
			
			input_element.value = answer || '';
			
			attribute(input_element, 'max', max || 0);

			if (question) {
				input_element.hidden = 0;
				input_element.focus();
			} else {
				input_element.hidden = 1;
			}
			innertext(k.message, '');
			k.message.dataset.i18n = message || '';
			
			translate.update(dialogui);
		},
	};

})();