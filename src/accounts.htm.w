[view=accounts]
	[id=list]
[template=account_item] .listitem .relative .flex .account_item
	[id=icon] .icon [icon=iconperson]
	.column .pad .grow
		[id=displayname] .displayname .padt
		.flex .dim
			'@' .dim
			[id=name] .name
	.column .pad
		.created .flex .dim
			b 'Created: ' .pad .dim
			[id=created]
		.updated .flex .dim
			b 'Updated: ' .pad .dim
			[id=updated]
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