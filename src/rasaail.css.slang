#rasaailui
	flex-direction		column-reverse
	min-height			86vh
.rasaail .preview, .rasaail .preview2
	border				0
	width				auto
	height				auto
.rasaail .preview
	max-width			100%
	max-height			50vh
.rasaail .preview2
	max-width			280px
	max-height			280px
#rasaailui .taxeer
	background			@primaryt
	border-radius		5px
	top					-33px
	right				30px
	border				2px solid @secondary
.baaq
	background			@primary
	box-shadow			0 10px 10px -8px @secondary
	display				block
	width				100%
	z-index				100
	top					40px
	margin-block-end	auto
.baaq .a3daa .shakl
	width			48px
	height			48px
.risaalahitem .hafr
	display			inline
	height			24px
	left			103px
#rasaailui .sawt
	font-family		monospace
#rasaailui .irtiqaa
	display			block
	height			4px
	background		linear-gradient(270deg, @accent, @primary 20px)
	border-bottom	2px solid @accentd
	transition		width .3s
	width			0%
	border-radius	5px
[data-taxeer].katabrisaalah
	border-style	dashed
.katabrisaalah
	z-index			20
//	border-color	@textxd
	border			1px solid @tertiary
//	border-right	0
//	border-left		0
	border-bottom	0
	border-radius	5px
//	padding-bottom	38px
	background		@primary
	box-shadow		0 0 25px 20px @secondaryd
	bottom			68px
.risaalahbox
	padding			5px 0
	border-bottom	0
	line-height		1.1
	min-height		30px

[data-mahvoof].risaalahitem .matn
	font-style		italic
	color			@tertiary
[data-hassoorah].risaalahitem .matn
	margin-top		5px
[data-margin].risaalahitem
	margin-top		24px
.risaalahitem .matn
	border-radius	0 10px 10px 0
[data-hassoorah].risaalahitem .matn
	border-radius	10px 10px 10px 0
.risaalahitem
	padding			0
	padding-left	53px
	border-bottom	0 !important
[data-la3ib].risaalahitem .matn
	border-left		6px solid @accent
[data-selected].risaalahitem
	background		transparent !important
[data-rakkaz].list [data-selected].risaalahitem .tag
	border-color	@textxd
	color			@textl
	box-shadow		0 0 35px 10px @secondary
	z-index			1
[data-mu3allaq].risaalahitem .tag
	opacity			.5
.risaalahitem .soorah, #rasaailui .soorah
	width				48px
	height				48px
	background			@secondaryt
	overflow			hidden
	border-radius		5px
.risaalahitem .soorah
	top					5px
	left				2px
	z-index				50