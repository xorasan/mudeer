[template=maktab]
	textarea [id=copier] .fakehide
	.flex [id=taraf]
		[sidebar=1] .maktab
			.flex .padv .ma3loomaat .sticky
				[id=haalah] .pad
				[id=lughaat] .dim .pad '...'
			[id=list] .masdar
			.padding .block
		.tarjamah [fullscreen=1] .maktab [id=scroller]
			.flex .padv .top .sticky .above
				[id=lughah] .bold .pad
				[id=waqtsabaq] .pad
				[id=madad] .flex
			[id=tarjamah]
			.padding .block
	.katabmaktab .form [id=katabsutoor] .fixed .left .right .small
		[id=taxeer] .taxeer .absolute .pad .padv @hidden
		textarea [id=maktabbox] .maktabbox @max(480)
[template=linebreak] .linebreak .listitem
	hr
[template=maktabitem] .maktabitem .listitem
	.tag
		[id=lafz] .padt .matn
		[id=ma3ni] .matn
[sheet=lughah]
	[id=list]