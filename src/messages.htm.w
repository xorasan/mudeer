[view=messages] #messagesui .flex .messages
	[id=list]
	[id=baaq] .relative .flex .vertical .baaq .sticky
		.flex .pad .vcenterkids .small
			[id=photo] .photo .start .shrink
			.flex .vertical .narrowline .pad
				[id=title] .bold
				[id=xulwaheqonah] .flex .dim
					.icon [icon=iconlock]
					[i18n=najwaa]
	.katabmessage .form [focus=1] [id=katabmessage] .fixed .left .right .small
		[id=sawt] .sawt
			canvas [id=hafr] @height(48px) @width(120px)
			[id=irtiqaa] .irtiqaa
			[id=awqaat]
			[id=haalah]
		[id=photo] .centertext @hidden
			img [id=preview] .preview
			[id=tafseel] .small
			input @type(file) @hidden [id=rafa3photo]
		[id=matn] [focus=1]
			[id=taxeer] .taxeer .absolute .pad .padv @hidden
			textarea [id=messagebox] .messagebox @max(480)
[sheet=messagephoto] .messages .centertext
	img [id=preview] .preview
[sheet=message]
	[id=list]
	.katabmessage .form [focus=1] [id=katabmessage]
		textarea [id=messagebox] .messagebox @max(480)
[template=messageitem] .messageitem .listitem .flex
	[id=padder] .padt
	[id=photo] .photo .absolute
//	[id=hafr] .hafr .vcenterkids .absolute .right .bottom
	.flex .start .vertical .shrink
		.tag .pad .padv .matn .narrowline
			span [id=matn] .vcenter
			canvas [id=hafr] .hafr .vcenter @height(24px) @hidden @width(1px)
		[id=waqtqabl] .small .narrowline .ixtaf .tawassa3 .pad .padv .tag
	.small .dim .vcenter
		.icon [icon=icondeleteforever] [id=havafstr] .inlineonly
		[id=havafwaqt] [muxtasar=3] .inlineonly .vcenter
