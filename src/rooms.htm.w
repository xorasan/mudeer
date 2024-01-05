[view=rooms]
	[id=list]
[sheet=room] .pad
	label [i18n=title]
	input [i18n=title] .pad [id=title] @max(64)
	label [i18n=link]
	input [i18n=link] .pad [id=link] @max(64)
	label [i18n=members]
	input [i18n=search] .pad [id=search_members] @max(32)
	[id=members]
[template=roomitem] .roomitem .relative .flex
	[id=photo] .photo
	.flex .vertical .grow .pad .vcenter
		[id=title] .medium .narrowline .narrowletters .padt
		[id=message] .small .dim
	.flex .vertical .pad .vcenter
		[id=waqtqabl] .small .dim [muxtasar=1]
[template=members_item] .members_item .flex .listitem .vcenter
	[id=photo] .photo .vcenter
	.flex .vertical .pad .vcenter
		[id=title] .bold .narrowline .narrowletters .padt
		[id=waqtqabl] .small .dim .narrowline
	[id=role_str] .small .tag .gap .pad .padv .vcenter
