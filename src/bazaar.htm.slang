[template=bazaarsep] .bazaarsep .listitem .flex
	.gap .pad .padv
		[id=miqyaas] .shrink
	[id=mowdoo3] .big .pad .grow .narrowletters
[template=bazaaritem] .bazaaritem .listitem .inlineflex .tag .gap
	.flex
		canvas [id=soorah] .soorah
	.grow .pad .vertical .flex .vcenter
		[id=mowdoo3]		.inline
	[id=qeemah] .flex
		[id=vahabp] .flex .center
			.vahab
			[id=vahab]			.bold .pad
		[id=fiddahp] .flex .center
			.fiddah
			[id=fiddah]			.bold .pad
	.tawassa3 .ixtaf .pad .padv .absolute
		[id=madad] .small .bold
		[id=tafseel] .small .dim
	[id=premium] .premium .absolute @hidden
		div
[template=bazaarnaqd] .bazaaritem .listitem .flex .naqd .sticky
	.grow .pad .vcenter
		[id=mowdoo3]		.big .inline .bold .upper
		[id=tafseel]		.small .inline .tag .gap .pad .padv 
	[id=qeemah] .flex .padv
		[id=vahabp] .flex .center
			.vahab
			[id=vahab]			.bold .pad
		[id=fiddahp] .flex .center
			.fiddah
			[id=fiddah]			.bold .pad
[template=bazaarishtaraa] .bazaaritem .listitem .flex .naqd .sticky
	.grow .pad .gap .flex .vertical .bold .upper
		[id=mowdoo3]		.big .inline
		[id=tafseel]		.small .inline .padb
	[id=qeemah] .flex .padv
		[id=vahabp] .flex .center
			.vahab
			[id=vahab]			.bold .pad
		[id=fiddahp] .flex .center
			.fiddah
			[id=fiddah]			.bold .pad
[sheet=naqdgetmore]
	.flex .pad .padv
		.center
			.vahab .gap
			.inline .bold '1'
			.inline [i18n=musaawi] .gap
			.fiddah .gap
			.inline .bold '100'
	[id=list]
	.flex .pad .padv
		.center [focus=1]
			button .xaas [id=ishtaraa] [i18n=ishtaraa] @disabled(1) [focus=1]
[sheet=bazaarshakl]
	textarea [id=muntaxab]
	[id=list]
