[view=sessions]
	[id=list]
[view=signin]
	[id=aqdaam] .sessions_steps .narrowline .pad
		.sessions_step
			[i18n=username] .bold .dim
			input [id=username] .centertext [i18n=username] @min(3) @max(24)
			[id=aliasstatus] .small .dim
			br
			[i18n=password] .bold .dim
			input [id=password] .centertext [i18n=password] @min(8) @max(2048) @type(password) @autocomplete(current-password) .monospace
			[id=passstatus] .small .dim
		.sessions_step
			input [id=hash] @hidden
			[i18n=captcha] .bold .dim
			[id=captcha]
			input [id=answer] .centertext [i18n=answer]
			[id=answerstatus] .small .dim
[view=signup]
	[id=aqdaam] .sessions_steps .narrowline .pad
		.sessions_step
			[i18n=username] .bold .dim
			br
			input [id=username] .centertext [i18n=username] @min(3) @max(24)
			[id=aliasstatus] .small .dim
			br
			[i18n=usernametip] .small .dim
		.sessions_step
			[i18n=usernamedetails] .small .dim
			[id=usernamerefined] .dim .big .bold
			br
			[i18n=password] .bold .dim
			br
			input [id=password] .centertext [i18n=password] @min(8) @max(2048) @type(password) @autocomplete(new-password) .monospace
			[id=passstatus] .small .dim
			br
			[i18n=passwordtip] .small .dim
		.sessions_step
			input [id=hash] @hidden
			[i18n=captcha] .bold .dim
			br
			[id=captcha]
			input [id=answer] .centertext [i18n=answer]
			[id=answerstatus] .small .dim