[view=qareeb]
	[id=haajaat]
	[id=list]
[sheet=qareeb]
	[id=majjaani]
	[id=mshtryaat]
	[id=muyassar]
[sheet=haajah]
	[id=shakl]
	[id=milk]
	[id=wazaaif]
[template=qareebtag] .qareebtag .inlineflex
	.vertical .grow .small .dim .tag .pad .inline
		[id=mowdoo3]		.big .narrowletters
//		[id=tafseel]		.dim
[template=haajahitem] .listitem .flex
	.grow .pad .vcenter
		[id=mowdoo3]		.big .inline .bold .upper .narrowletters
		[id=tafseel]		.small .inline .tag .gap .pad .padv 
	[id=faasilahp] .flex .padv .center
		.icon [icon=iconnearme]
		[id=faasilah]		.bold .pad
[template=qareebitem] .qareebitem .relative
	.flex
		.center
			[id=soorah] .soorah
	.flex .pad .details .padt .dim
		.flex .vertical .grow .start
			[id=displayname]	.small .ellipsis
		.flex .vertical .shrink .end
			[id=distance]		.small .bold
			[i18n=you]			.inta .small .bold @hidden(1)
[template=faasilahitem] .faasilahitem .listitem .flex
	.grow .pad .vcenter .flex
		[id=mowdoo3]		.big .inline .bold .upper
		[id=qeemah] 		.small .inline .flex .gap .pad .padv
			[id=vahabp] .flex .center
				.vahab
				[id=vahab]			.bold .pad
			[id=fiddahp] .flex .center
				.fiddah
				[id=fiddah]			.bold .pad
	[id=faasilahp] .flex .padv .center
		.icon [icon=iconnearme]
		[id=faasilah]		.bold .pad
	.tawassa3 .ixtaf .pad .padv
		[id=madad] .small .bold
