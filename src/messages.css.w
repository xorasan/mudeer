#messagesui
	flex-direction		column-reverse
	min-height			86vh
.messages .preview, .messages .preview2
	border				0
	width				auto
	height				auto
.messages .preview
	max-width			100%
	max-height			50vh
.messages .preview2
	max-width			280px
	max-height			280px
#messagesui .taxeer
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
.baaq .members .shape
	width			48px
	height			48px
.messageitem .hafr
	display			inline
	height			24px
	left			103px
#messagesui .sawt
	font-family		monospace
#messagesui .irtiqaa
	display			block
	height			4px
	background		linear-gradient(270deg, @accent, @primary 20px)
	border-bottom	2px solid @accentd
	transition		width .3s
	width			0%
	border-radius	5px
[data-taxeer].katabmessage
	border-style	dashed
.katabmessage
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
.messagebox
	padding			5px 0
	border-bottom	0
	line-height		1.1
	min-height		30px

[data-mahvoof].messageitem .text
	font-style		italic
	color			@tertiary
[data-hasphoto].messageitem .text
	margin-top		5px
[data-margin].messageitem
	margin-top		24px
.messageitem .text
	border-radius	0 10px 10px 0
[data-hasphoto].messageitem .text
	border-radius	10px 10px 10px 0
.messageitem
	padding			0
	padding-left	53px
	border-bottom	0 !important
[data-la3ib].messageitem .text
	border-left		6px solid @accent
[data-selected].messageitem
	background		transparent !important
[data-rakkaz].list [data-selected].messageitem .tag
	border-color	@textxd
	color			@textl
	box-shadow		0 0 35px 10px @secondary
	z-index			1
[data-mu3allaq].messageitem .tag
	opacity			.5
.messageitem .photo, #messagesui .photo
	width				48px
	height				48px
	background			@secondaryt
	overflow			hidden
	border-radius		5px
.messageitem .photo
	top					5px
	left				2px
	z-index				50