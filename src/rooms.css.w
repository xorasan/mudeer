.roomitem .shape .names
	width			100%
	font-size		60%
	position		absolute
	bottom			0
	text-align		center
	text-shadow		1px 1px 4px @primary
//	font-weight		normal
.roomitem
	min-height		60px
	border-radius	12px
.roomitem:hover
	background		@secondaryxd
.roomitem[data-selected]
	background		@secondaryl
	border-color	@accent
.roomitem .members
	margin			0 auto
	margin-top		3px
.roomitem .shape
	width			60px
	height			60px
	margin			0 -30px -5px 0
	display			inline-block
[data-animations] .roomitem .shape
	transition		margin-right .2s
if min-width = 600px
	.roomitem .shape
		margin-right	-5px
.roomitem .icon svg
	width			16px
.roomitem .hayy
	background		@red
	border			1px solid @primary
	top				3px
	left			3px
	width			12px
	height			12px
	border-radius	5px
.roomitem
	padding			0 0 3px 0

[dir=rtl] .roomitem .details
	left				0
	right				64px
.roomitem .photo, .members_item .photo
	width				60px
	height				60px
	border-radius		8px
	margin				4px 0 0 4px
	background-color	@secondaryt
	overflow			hidden
.roomitem .photo
	top					5px
	left				2px
	z-index				50
	padding-top			12px
	text-align			center
	font-size			140%
	min-width			60px
.members_item
	min-height			40px
.members_item .photo
	width				32px
	height				32px
	overflow			hidden
.durationitem
	min-height			32px
	word-break			break-word
	margin				2px
.durationitem[data-selected]
	border-color		@accent
.durationitem .box
	padding				6px 14px
	background			@primaryl
	display				inline-flex
	border				1px solid @secondary
	max-width			80%
	border-radius		0 15px 15px 0
	border-left			0 !important
