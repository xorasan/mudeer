.list
	user-select		none

.list > .pin
	position		sticky
	background		@secondary
	border			1px solid @tertiary
	margin			0 40px 0 auto
	width			min-content
	padding			38px
	border-radius	100%
	border-bottom-left-radius	0
.list > .pin .origin
	position		absolute

.list > .start_pin
	top				90px
	transform		rotate(135deg)
.list > .start_pin > .origin
	transform		rotate(-135deg)
	left			0
	right			17px
.list > .start_pin > .text
	text-align		center

.list > .end_pin
	transform		rotate(-45deg)
	bottom			90px
.list > .end_pin > .origin
	transform		rotate(45deg)
	left			-17px
	right			0
.list > .end_pin .text
	text-align		center

.list > .message
	display			flex
	align-items		center
	min-height		50vh
.list > .message span
	font-size		150%
	text-align		center
	width			100%
.list .a3laa
	background		@secondaryt
//	background		linear-gradient(45deg, @secondaryt 10%, transparent 50%)
	color			@textd
	text-shadow		0px 1px @secondary
	backdrop-filter	blur(8px)
	border-radius	6px
[dir=rtl] .list .a3laa
	background		linear-gradient(45deg, transparent 50%, @secondaryt 90%)
[data-freeflow].list .item, [data-freeflow].list .listitem
	display			inline-block
[data-freeflow].list .item.inlineflex, [data-freeflow].list .listitem.inlineflex
	display			inline-flex
[data-grid].list .items
	display			grid
	grid-template-columns	repeat(2, 1fr)
[data-grid="3"].list .items
	grid-template-columns	repeat(3, 1fr)
[data-grid="4"].list .items
	grid-template-columns	repeat(4, 1fr)
[data-grid="5"].list .items
	grid-template-columns	repeat(5, 1fr)
.list .item
	padding			0 6px
	cursor			pointer
.list .item, .list .listitem
	position		relative
	border-bottom	1px solid @secondary
.list .item:hover, .list .listitem:hover
	background		@secondaryd
[data-transparency] .list .item, [data-transparency] .list .listitem
	border-bottom	1px solid transparent
.list .item[data-baidaa] .baidaa, .list .listitem[data-baidaa] .baidaa
	opacity			0
	user-select		none
.list .item[data-baidaa], .list .listitem[data-baidaa]
	box-shadow		0 0 5px 2px @accentl, 0 0 5px 2px @accentd inset
	border-color	@accentd
	font-weight		bold
.list .item[data-selected], .list .listitem[data-selected]
	border-color	@textxd
[data-focussed].list .item[data-selected], [data-focussed].list .listitem[data-selected]
	background		linear-gradient(45deg, @primaryl -110%, @secondaryd 220%)
	border-color	@accent
[dir=rtl] .list .item[data-selected], [dir=rtl] .list .listitem[data-selected]
	background		linear-gradient(45deg, @tertiary -200%, @secondary 110%)
[data-transparency] .list .item[data-selected], [data-transparency] .list .listitem[data-selected]
	background		linear-gradient(45deg, @secondary 0%, transparent 220%)
//	color			@text
	border-bottom	1px solid @accent
[dir=rtl][data-transparency] .list .item[data-selected], [dir=rtl][data-transparency] .list .listitem[data-selected]
	background		linear-gradient(45deg, transparent -220%, @secondary 110%)

.list .item .title
	font-size		125%
	white-space		nowrap
	letter-spacing	-1px
//.list .item[data-selected] .title

.list .body
	color			@textd
.list .item[data-selected] .body
	font-size		125%
//	color			@primaryl
	line-height		1.1
//[data-transparency] .list .item[data-selected] .body
//	color			@textd

[data-grid][data-hidetext].list .items .text
	display			none

.list img
	height			48px
	width			auto
.small .list img
	height			24px
[data-largetext] .small .list img
	height			36px
[data-grid="2"].list .items img
	height			54px
[data-grid="3"].list .items img
	height			50px
[data-grid="4"].list .items img
	height			48px
[data-grid="5"].list .items img
	height			40px
.list .item .icon
	position		absolute
	top				3px
	right			3px
	bottom			0
	padding-left	40px
	background		linear-gradient(200deg, @primary, transparent)
.list .item[data-selected] .icon
	background		linear-gradient(200deg, @accent, transparent)

.list .days
	color			@textd
.list .item[data-selected] .days
	color			@primaryl
	font-weight		bold

[data-selected] [data-past]
	color			@redd !important
[data-past]
	color			@redl !important
	font-weight		bold

//[data-focussed].list .item[data-selected] svg, [data-focussed].list .listitem[data-selected] svg
//	fill			@primaryl

.list .hide, .list .ixtaf
	display			none
[data-focussed].list [data-selected] .hide, [data-focussed].list [data-selected] .ixtaf
	display			block
[data-focussed].list [data-selected] .inline.hide, [data-focussed].list [data-selected] .inline.ixtaf
	display			inline-block
[data-focussed].list [data-selected] .flex.hide, [data-focussed].list [data-selected] .flex.ixtaf
	display			flex
[data-focussed].list [data-selected] .inlineflex.hide, [data-focussed].list [data-selected] .inlineflex.ixtaf
	display			inline-flex

.list [data-mufarraq]
	position		sticky
	z-index			100
	grid-column-start	1
	background		@primary
	height			35px
	white-space		nowrap
	overflow		hidden
[data-transparency] .list [data-mufarraq]
	background		@primaryt

.list [data-mufarraq="1"]
	top				0
.list [data-mufarraq="2"]
	top				35px
[data-pager="1"] .list [data-mufarraq="1"]
	top				40px
[data-pager="1"] .list [data-mufarraq="2"]
	top				75px
[data-pager="2"] .list [data-mufarraq="1"]
	top				53px
[data-pager="2"] .list [data-mufarraq="2"]
	top				88px
[data-grid="2"].list [data-mufarraq]
	grid-column-end		3
[data-grid="3"].list [data-mufarraq]
	grid-column-end		4
[data-grid="4"].list [data-mufarraq]
	grid-column-end		5
[data-grid="5"].list [data-mufarraq]
	grid-column-end		6

.list .item .tawassa3, .list .listitem .tawassa3
	position			absolute
	overflow			visible
	bottom				100%
	margin-left			10px
	right				12px
	z-index				200
	color				@textl
	background			@tertiaryt
	border-radius		5px
	box-shadow			0 0 12px 0px @primaryl
	pointer-events		none
	transition			opacity .2s ease-in

.soft_item
	border-radius	12px
	padding			12px

if max-width = 720px
	.soft_item
		padding-right	46px
	[data-grid] .soft_item
		padding-right	unset

.soft_item:hover
	background		@secondaryxd
.soft_item[data-selected]
	background		@secondaryd
.list[data-focussed] .soft_item[data-selected]
	background		@secondaryl
	box-shadow		0 0 0 2px @secondaryd inset
	border-color	@accent



