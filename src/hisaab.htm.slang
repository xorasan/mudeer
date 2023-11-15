[view=hisaab]
	[id=list]
[template=hisaabshakl] .hisaabshakl .pad .relative
	[id=soorah] .soorah
	.tafseel .flex .vertical .grow .pad .absolute
		[id=tafseel]		.dim
		[id=madad]			.small .bold .ixtaf .center
[template=hisaabkatab] .hisaabkatab .listitem .flex .pad
	.vertical .grow
		[id=mowdoo3]		.big .narrowletters
		[id=tafseel]		.dim
	.shrink
		[id=hifz]			.small .dim .tag .gapv .pad .inline
	.tawassa3 .ixtaf .pad .padv
		[id=madad] .small .bold
[sheet=hisaabshakl] .hisaabshakl .relative
	[id=soorah] .soorah
	[id=muntaxab]
//	input [id=bahac] .pad .padv .gapv [i18n=bahac]
	.fakepadding
	.floating .absolute
		[id=mshtryaat]
		[id=majjaani]
		[id=muyassar]
[sheet=hisaabmilk]
	[id=muntaxab]
	input [id=bahac] .pad .padv .gapv [i18n=bahac]
	[id=mshtryaat]
	[id=majjaani]
	[id=muyassar]
[sheet=hisaab] .hisaab
	.details
		[id=soorah] .soorah
		.flex
			.flex .vertical .grow .pad
				[id=displayname] .displayname .bold
				[id=username] .username
			[id=age] .age .shrink .pad
	[id=milk] .noselect
	[id=wazaaif] .noselect
