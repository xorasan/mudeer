#listui
	[template=list] .list [list]
		[id=raees] .a3laa .flex .vertical .vcenter .pad .padv .gapb .bold .small .centertext
			.mowdoo3list [id=mowdoo3list] .grow
			.miqyaas [id=miqyaas] @hidden
		.message @hidden
			span [id=message]
		.start_pin .pin [id=start_pin] @hidden
			.origin
				.text 'start_pin'
		.items [id=items]
		.end_pin .pin [id=end_pin] @hidden
			.origin
				.text 'end_pin'
	[template=listitem] .item
		.flex
			img [id=image] @hidden
			.grow .text
				.title			[id=title] [dir]
//				.title			[id=titlei18n] [dir]
				.title	.hide	[id=titlehide] [dir]
//				.title			[id=titlehtml] [dir]
				.title			[id=titledays] [dir] [by=age]
				.title			[id=titletime] [dir] [by=time]
				.title			[id=titlehours] [dir] [by=hourly]
				.subtitle .hide [id=subtitle] [dir]
				.body	.hide	[id=body] [dir]
//				.body	.hide	[id=bodyi18n] [dir]
//				.body	.hide	[id=bodyhtml] [dir]
				.body			[id=bodyshowhtml] [dir]
				.body			[id=bodyshow] [dir]
				.days			[id=days] [by=age]
				.time	.hide	[id=time]
				.time			[id=timeshow]
			.icon [id=icon] @hidden
			.min .center
				.uid .hide	[id=uid]
	[template=listsep] .sep
	[template=list_item] .soft_item
		[id=icon] .icon
		[id=title] .title
		[id=subtitle] .subtitle
