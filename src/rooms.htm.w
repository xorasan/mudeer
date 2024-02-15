[view=rooms]
	[id=list]
[sheet=setup-room] .pad
	input [id=uid] @hidden
	label [i18n=name]
	input [i18n=name] .pad [id=name] @max(64)
	label [i18n=link]
	input [i18n=link] .pad [id=link] @max(64)
	label [i18n=members]
	input [i18n=search] .pad [id=search_members] @max(32)
	[id=members]
[template=roomitem] .roomitem .relative .flex
	[id=photo] .photo .bold .upper .narrowletters
	.flex .vertical .grow .pad .vcenter
		[id=name] .medium .narrowline .narrowletters .padt
		.flex
			[id=message] .small
			[id=updated] .small .dim .pad
		.flex .vcenterkids
			[id=count_box] .inlineflex .vcenterkids
				.icon [icon=iconmessage]
				[id=count] .small .dim .pad
			[id=call_box] .inlineflex .vcenterkids
				.icon [icon=iconcall]
				[id=connected] .small .dim .pad
[template=members_item] .members_item .flex .listitem .vcenter
	[id=photo] .photo .vcenter
	.flex .vertical .pad .vcenter
		[id=name] .bold .narrowline .narrowletters .padt
		[id=updated] .small .dim .narrowline
	[id=role_str] .small .tag .gap .pad .padv .vcenter
