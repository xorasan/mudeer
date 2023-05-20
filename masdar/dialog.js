//+ okay cancel onshow hide show
var dialog;
;(function(){

	dialog = {
		okay: 0,
		cancel: 0,
		onshow: 0,
		hide: function () {
			XPO.dialogui.hidden = 1;
			dialog.okay = 0;
			dialog.cancel = 0;
		},
		show: function (args) {
			args = args || {};
			
			// blur in case any prev input is focused, to allow esc
			markooz() && markooz().blur();
			
			XPO.dialogui.hidden = 0;
			var k			= templates.keys(XPO.dialogui)	,
				max			= args.XPO.max		||	args.x	,
				callback	= args.XPO.callback	||	args.c	,
				message		= args.XPO.message	||	args.m	,
				answer		= args.XPO.answer	||	args.a	,
				question	= args.XPO.question	||	args.q	;
			
			dialog.onshow && dialog.onshow(name);
			
			dialog.okay = function () {
				var answer = k.XPO.input.value;
				if (max) answer = answer.slice(0, max);
				callback && callback(answer);
				document.activeElement && document.activeElement.blur();
				Hooks.run('XPO.back');
			};
			dialog.cancel = function () {
				document.activeElement && document.activeElement.blur();
				Hooks.run('XPO.back');
			};
			
			k.XPO.input.value = answer || '';
			
			attribute(k.XPO.input, 'max', max || 0);

			if (question) {
				k.XPO.input.hidden = 0;
				k.XPO.input.focus();
			} else {
				k.XPO.input.hidden = 1;
			}
			innertext(k.XPO.message, '');
			k.XPO.message.dataset.XPO.i18n = message || '';
			
			translate.update(XPO.dialogui);
		},
	};

})();