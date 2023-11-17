[view=rasaail] #rasaailui .flex .rasaail
	[id=list]
	[id=baaq] .relative .flex .vertical .baaq .sticky
		.flex .pad .vcenterkids .small
			[id=soorah] .soorah .start .shrink
			.flex .vertical .narrowline .pad
				[id=mowdoo3] .bold
				[id=xulwaheqonah] .flex .dim
					.icon [icon=iconlock]
					[i18n=najwaa]
	.katabrisaalah .form [focus=1] [id=katabrisaalah] .fixed .left .right .small
		[id=sawt] .sawt
			canvas [id=hafr] @height(48px) @width(120px)
			[id=irtiqaa] .irtiqaa
			[id=awqaat]
			[id=haalah]
		[id=photo] .centertext @hidden
			img [id=preview] .preview
			[id=tafseel] .small
			input @type(file) @hidden [id=rafa3soorah]
		[id=matn] [focus=1]
			[id=taxeer] .taxeer .absolute .pad .padv @hidden
			textarea [id=risaalahbox] .risaalahbox @max(480)
[sheet=risaalahsoorah] .rasaail .centertext
	img [id=preview] .preview
[sheet=risaalah]
	[id=list]
	.katabrisaalah .form [focus=1] [id=katabrisaalah]
		textarea [id=risaalahbox] .risaalahbox @max(480)
[template=risaalahitem] .risaalahitem .listitem .flex
	[id=padder] .padt
	[id=soorah] .soorah .absolute
//	[id=hafr] .hafr .vcenterkids .absolute .right .bottom
	.flex .start .vertical .shrink
		.tag .pad .padv .matn .narrowline
			span [id=matn] .vcenter
			canvas [id=hafr] .hafr .vcenter @height(24px) @hidden @width(1px)
		[id=waqtqabl] .small .narrowline .ixtaf .tawassa3 .pad .padv .tag
	.small .dim .vcenter
		.icon [icon=icondeleteforever] [id=havafstr] .inlineonly
		[id=havafwaqt] [muxtasar=3] .inlineonly .vcenter
