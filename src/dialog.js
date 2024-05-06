// TODO make dialogs recovering using uids and asking the requesting module to regenerate it on popstate
var Dialog, dialog,
	dialog_ready	= 'dialog-ready',
	dialog_done		= 'dialog-done',
	dialog_cancel	= 'dialog-cancel',
	dialog_anyway	= 'dialog-anyway';
;(function(){
	var current_name, current_uid;
	
	Dialog = dialog = {
		okay: 0,
		cancel: 0,
		onshow: 0,
		hide: function () {
			dialogui.hidden = 1;
			dialog.okay = 0;
			dialog.cancel = 0;
			current_name = undefined;
			current_uid = undefined;
		},
		get_name: function () {
			return current_name;
		},
		get_uid: function () {
			return current_uid;
		},
		set_message: function (m) {
			var k = templates.keys(dialogui);

			innertext(k.message, '');

			if (isarr(m)) {
				setdata(k.message, 'i18n', message || '');
				translate.update(dialogui);
			} else {
				innertext(k.message, m);
			}
		},
		show: function (args) {
			args = args || {};
			
			// blur in case any prev input is focused, to allow esc
			markooz() && markooz().blur();
			
			dialogui.hidden = 0;
			var k			= templates.keys(dialogui)	,
				name		= args.name		||	args.n	,
				uid			= args.uid		||	args.u	,
				max			= args.max		||	args.x	,
				callback	= args.callback	||	args.c	,
				message		= args.message	||	args.m	,
				answer		= args.answer	||	args.a	,
				question	= args.question	||	args.q	,
				multiline	= args.multiline,
				input_element;
			
			current_name = args.n = args.name = name;
			current_uid = args.u = args.uid = uid;
			
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
			
			Dialog.onshow && Dialog.onshow(name);

			// TODO transition modules to use this method to (re)construct dialogs
			Hooks.run(dialog_ready, args, k);
			
			Dialog.okay = function () {
				var answer = input_element.value;
				if (max) answer = answer.slice(0, max);
				callback && callback(answer);
				document.activeElement && document.activeElement.blur();

				Hooks.run(dialog_done, args, k, answer);
				Hooks.run(dialog_anyway, args, k, answer);

				Hooks.run('back');
			};
			Dialog.cancel = function () {
				document.activeElement && document.activeElement.blur();

				Hooks.run(dialog_cancel, args, k);
				Hooks.run(dialog_anyway, args, k);

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

			this.set_message( message );
		},
	};
	Hooks.set('backstackdialog', function (args) {
		var date = 0;
		if (datepicker && args instanceof HTMLElement) date = 1;

		Webapp.dimmer(600);
		Softkeys.clear();
		Softkeys.add({ k: K.sl,
			i: 'icondone',
			c: function () {
				if (date) datepicker.okay && datepicker.okay(args);
				else Dialog.okay && Dialog.okay();
			}
		});
		Softkeys.add({ k: K.sr,
			i: 'iconclose',
			c: function () {
				if (date) datepicker.cancel && datepicker.cancel();
				else Dialog.cancel && Dialog.cancel();
			}
		});

		if (date) datepicker.show(args);
		else Dialog.show(args);
	});
	Hooks.set('backstack-crumbs', function (crumbs) {
		if (!crumbs.is_dialog) {
			if (!isundef(current_uid)) { // a dialog was active previously
				// we dont trigger the Dialog.cancel function because it's deprecated
				Hooks.run('dialog-cancel', current_name, current_uid);
				Hooks.run('dialog-anyway', current_name, current_uid);
			}
			Dialog.hide(); // clear active dialog name and uid + okay/cancel funcs
		}
	});

})();