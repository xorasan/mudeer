[view=accounts]
	[id=list]
[template=account_item] .listitem .relative
	[id=name]
	[id=displayname] .big
	.flex
		b 'created'
		[id=created] .dim
	.flex
		b 'updated'
		[id=updated] .dim
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