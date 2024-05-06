[view=accounts]
	[id=list]
[sheet=setup-account] .pad
	form
		input [id=uid] @hidden
		label [i18n=name]
		input [i18n=name] .pad [id=name] @min(3) @max(64) @autocomplete(false)
		.small .dim
			'Name is case insensitive, only alphanumeric characters allowed, '
			'It is used to sign in to this app'
		br
		label [i18n=displayname]
		input [i18n=displayname] .pad [id=displayname] @max(64) @autocomplete(false)
		.small .dim 'This can be a legal name or a psuedonym'
		br
		label [i18n=password]
		input [i18n=password] .pad [id=password] @min(8) @max(2048) @autocomplete(false)
		.small .dim
			'Leave it empty to keep previous password, '
			'changing it will log this account out of all previous sessions'
		br
		.flex [focus=1] .vcenterkids .gapt
			[id=owner] [i18n=owner] [checkbox]
			.dim .pad 'This grants full access, be careful'
[template=account_item] .relative .soft_item .flex .account_item .profile_photo
	[id=photo] .flex .photo .bold .upper .narrowletters
		[id=short_name] .short_name
	.flex .vertical .grow .pad .vcenter
		.flex .vcenterkids
			[id=displayname] .medium .narrowline .narrowletters .padr
			[id=owner_icon] .icon
		.flex .vcenterkids
			[id=name_str] .small
			[id=created] .small .dim .pad .created
		.flex .vcenterkids
			[id=message] .small .dim .padr .grow .message_str
			[id=updated] .small .extradim .pad .end .updated
[template=profileitem] .profileitem .relative
	canvas [id=photo] .photo
	.flex .pad .details .dim
		.flex .vertical .grow .start
			[id=displayname]	.small
		.flex .vertical .shrink .end
			[id=distance]		.small .bold
			[i18n=you]			.inta .small .bold @hidden(1)
//			[id=age]
//			[id=username]		.small