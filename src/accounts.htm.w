[view=accounts]
	[id=list]
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