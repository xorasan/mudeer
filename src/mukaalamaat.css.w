.mukaalamahitem .shakl .asmaa
	width			100%
	font-size		60%
	position		absolute
	bottom			0
	text-align		center
	text-shadow		1px 1px 4px @primary
//	font-weight		normal
.mukaalamahitem
	min-height		60px
	border-bottom	1px solid @secondary
.mukaalamahitem[data-selected]
	background		@secondaryl
	border-color	@accent
.mukaalamahitem .a3daa
	margin			0 auto
	margin-top		3px
.mukaalamahitem .shakl
	width			60px
	height			60px
	margin			0 -30px -5px 0
	display			inline-block
[data-animations] .mukaalamahitem .shakl
	transition		margin-right .2s
if min-width = 600px
	.mukaalamahitem .shakl
		margin-right	-5px
.mukaalamahitem .icon svg
	width			16px
.mukaalamahitem .hayy
	background		@red
	border			1px solid @primary
	top				3px
	left			3px
	width			12px
	height			12px
	border-radius	5px
.mukaalamahitem
	padding			0

[dir=rtl] .mukaalamahitem .details
	left				0
	right				64px
.mukaalamahitem .soorah, .a3daaitem .soorah
	width				60px
	height				60px
	border-radius		50%
	margin				4px 0 0 4px
	background-color	@secondaryt
	overflow			hidden
.a3daaitem
	min-height			40px
.a3daaitem .soorah
	width				32px
	height				32px
	overflow			hidden
.muddahitem
	min-height			32px
	word-break			break-word
	margin				2px
.muddahitem[data-selected]
	border-color		@accent
.muddahitem .box
	padding				6px 14px
	background			@primaryl
	display				inline-flex
	border				1px solid @secondary
	max-width			80%
	border-radius		0 15px 15px 0
	border-left			0 !important
