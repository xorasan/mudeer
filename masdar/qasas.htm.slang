[view=qasas]
	[id=list]
[sheet=qissah]
	input [i18n=mowdoo3] .pad [id=mowdoo3] @max(64)
	[id=xulwah] .padb
	[id=muyassar] .padb
	input [i18n=adaafa3daa] .pad [id=bahaca3daa]
	[id=a3daa]
[template=muddahitem] .muddahitem .listitem .relative .flex .tag
	.flex .grow .pad .vcenter
		[id=mowdoo3]		.inline .bold .upper .grow
		[id=qeemah] 		.small .inline .flex .gap
			[id=vahabp] .flex .center
				.vahab
				[id=vahab]			.bold .pad
			[id=fiddahp] .flex .center
				.fiddah
				[id=fiddah]			.bold .pad
	[id=tawassa3] .tawassa3 .ixtaf .pad .padv .small .bold .baidaa
		[id=madad]
		[id=tafseelp]
			[id=tafseel]
[template=qissahitem] .qissahitem .relative .flex .vertical .listitem
//	[id=hayynishaan] .hayy .absolute
	.flex .start .vertical .grow .pad .center
		[id=mowdoo3] .medium .narrowline .narrowletters .padt
		[id=message] .small .dim
	.flex
		.flex .start .vertical .absolute .pad .left .bottom .padb
			[id=xulwaheqonah] .center .shrink .pad .extradim
				.icon [icon=iconlock]
				.small [i18n=najwaa]
			[id=tahmeel] .center .shrink .pad .extradim .small
				.icon [icon=iconfiledownload]
				[id=hajm]
		.flex .end .vertical .absolute .right .bottom .padb
			[id=waqtqabl] .small .dim .narrowline .pad [muxtasar=1]
			[id=muddahstrp] .flex .shrink .pad .dim .vcenter .vcenterkids .vend
				.icon [icon=icontimelapse]
				.small [id=muddahstr]
	[id=ashkaal] .a3daa .pad
[template=a3daaitem] .a3daaitem .flex .listitem .vcenter
	[id=soorah] .soorah .vcenter
	.flex .vertical .pad .vcenter
		[id=mowdoo3] .bold .narrowline .narrowletters .padt
		[id=waqtqabl] .small .dim .narrowline
	[id=waqfstr] .small .tag .gap .pad .padv .vcenter
