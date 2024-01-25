#softkeysui @dir(ltr)
	#skhelp [i18n=skhelp]
	#skhints	.row2
	#skdots
		.center .pad .padv .dim '#'
		.center .icon [icon=iconmorevert]
	#skmain		.row1
	#softkeys_backstack .fixed
		span .dot
		span .dot
		span .dot
		span .dot
	button [template=skbutton]
		.icon [id=icon]
		span .inline .tooltip
			label [id=name] @hidden
			.key .pad .tag .dim .smallcaps [id=key] @hidden
		span [id=label] @hidden