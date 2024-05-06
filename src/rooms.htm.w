[view=rooms]
	[id=list]
[sheet=setup-room] .pad
	form
		input [id=uid] @hidden
		label [i18n=name]
		input [i18n=name] .pad [id=name] @max(64)
		label [i18n=link]
		input [i18n=link] .pad [id=link] @max(64) @autocomplete(false)
//		label [i18n=members]
//		input [i18n=search] .pad [id=search_members] @max(32)
//	[id=members]
[template=roomitem] .roomitem .soft_item .relative .flex .profile_photo
	[id=photo] .flex .photo .bold .upper .narrowletters
		[id=short_name] .short_name
	.flex .vertical .grow .pad .vcenter
		.flex .vcenterkids .padt
			[id=name] .medium .narrowline .narrowletters
			[id=info] .small .dim .pad .grow
		.flex .vcenterkids
			[id=count_box] .inlineflex .vcenterkids
				.icon [icon=iconmessage]
				[id=count] .small .dim .pad
			[id=call_box] .inlineflex .vcenterkids
				.icon [icon=iconcall]
				[id=connected] .small .dim .pad
			[id=link_str] .small
			[id=created] .small .dim .pad .created
		.flex .vcenterkids
			[id=message] .small .dim .padr .grow .message_str
			[id=updated] .small .extradim .pad .end .updated
[template=members_item] .members_item .flex .listitem .vcenter
	[id=photo] .photo .vcenter
	.flex .vertical .pad .vcenter
		[id=name] .bold .narrowline .narrowletters .padt
		[id=updated] .small .dim .narrowline
	[id=role_str] .small .tag .gap .pad .padv .vcenter
