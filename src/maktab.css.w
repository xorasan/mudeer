.ma3loomaat
	top				35px
	background		@primary
	z-index			100
	border-bottom	2px solid @tertiary
.fakehide
	width			1px
	height			1px
	opacity			0
.katabmaktab
	z-index			20
	border			1px solid @tertiary
	border-bottom	0
	border-radius	5px
	margin			0 5px
	background		@primary
	box-shadow		0 0 25px 20px @secondaryd
	bottom			38px
.maktabbox
	padding			5px 0
	border-bottom	0
	line-height		1.1
	height			30px
	font-size		250%

//[data-tvfs] .padding
.padding
	height			200px
.tarjamah
	display			none
[data-tvfs] .tarjamah
	display			block
.maktab
	font-size		130%
	width			100%
//[data-tvfs] .maktab
[data-sinf="1"] .tag
//	box-shadow		0 4px 6px -1px green inset
	background		linear-gradient(green 2px, transparent 4px), #00800022
[data-sinf="2"] .tag
//	box-shadow		0 4px 6px -3px yellow inset
	background		linear-gradient(yellow 2px, transparent 4px), #ffff0022
[data-sinf="3"] .tag
//	box-shadow		0 4px 6px -3px red inset
	background		linear-gradient(red 2px, transparent 4px), #ff000022
[data-sinf="4"] .tag
//	box-shadow		0 4px 6px -2px orange inset
	background		linear-gradient(orange 2px, transparent 4px), #ffa50022
[data-sinf="5"] .tag
//	box-shadow		0 4px 6px -2px purple inset
	background		linear-gradient(purple 2px, transparent 4px), #80008022
[data-sinf="7"] .tag
//	box-shadow		0 4px 6px -2px cyan inset
	background		linear-gradient(cyan 2px, transparent 4px), #00ffff22
[data-sinf="8"] .tag
//	box-shadow		0 4px 6px -2px pink inset
	background		linear-gradient(pink 2px, transparent 4px), #ffc0cb22

.maktabitem .matn
	line-height		1
	letter-spacing	-1px
	min-height		34px
	min-width		1px
	text-align		center
.maktabitem, .linebreak
	padding			0
	border-bottom	0 !important
[data-selected].maktabitem, [data-selected].linebreak
	background		transparent !important
[data-daxeem].maktabitem
	font-weight		bold
.maktabitem .tag
	padding-left	4px
	padding-right	4px
	border-radius	0
	border-width	0
	border-left		1px solid @primaryl
[data-selected].maktabitem .tag
	border-color	@textxd
	color			@textl
	z-index			1
.masdar [data-selected].maktabitem .tag
	box-shadow		0 0 25px 10px @secondary

.list .linebreak
	display				block !important
.list .linebreak hr
	border				1px dashed @tertiaryl
.list [data-selected].linebreak hr
	border-color		@text

.maktabitem
	vertical-align		top
