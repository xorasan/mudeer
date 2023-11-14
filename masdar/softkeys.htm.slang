#softkeysui @dir(ltr)
	#skhelp [i18n=skhelp]
	#skhints	.row2
	#skdots
		.center .pad .padv .dim '#'
		.center .icon [icon=iconmorevert]
	#skmain		.row1
	button [template=skbutton]
		.icon [id=icon]
		span .flex .tooltip
			label [id=name] @hidden
			.key .pad .tag .dim [id=key] @hidden
		span [id=label] @hidden