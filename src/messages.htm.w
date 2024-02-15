[view=messages] #messagesui .flex .messages
	[id=list]
	[id=baaq] .relative .flex .vertical .baaq .sticky @hidden
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
			input @type(file) @hidden [id=upload_photo]
		[id=text] [focus=1]
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
	[id=photo] .photo .absolute .bold .upper
//	[id=hafr] .hafr .vcenterkids .absolute .right .bottom
	.flex .start .vertical .shrink
		[id=name] .name .dim .small .pad .padt
		.tag .pad .padv .text .narrowline
			span [id=text] .vcenter
			canvas [id=hafr] .hafr .vcenter @height(24px) @hidden @width(1px)
	.flex .small .dim .vend
		.icon [icon=icondeleteforever] [id=removestr] .inlineonly
		[id=removetime] [muxtasar=3] .inlineonly .vcenter
		[id=waqtqabl] .dim .narrowline .time .ixtaf .pad .padv
