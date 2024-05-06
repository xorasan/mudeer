#messagesui
	flex-direction		column-reverse
//	min-height			86vh
.messages .preview, .messages .preview2
	border				0
	width				auto
	height				auto
.full_message p
	margin				10px 0
.messages .preview
	max-width			100%
	max-height			50vh
.messages .preview2
	width				65vw
	height				140px
	background-size		contain
	background-position	center
	background-repeat	no-repeat
	border-radius		0 9px 9px 0
if min-width = 800px
	.messages .preview2
		width				30vw
[data-selected].messageitem .preview2
	border-radius		0 9px 0 0
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
	z-index				10
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
	position		relative
#messagesui .sawt[data-playing]
	padding-top		34px
#messagesui .sawt .irtiqaa
	display			none
#messagesui [data-playing] .irtiqaa
	position		absolute
	height			30px
	width			30px
	transition		left .2s linear
	background		@accentl
	border			3px @accentd
	bottom			15px
	left			0
	border-radius	100%
[data-taxeer].katabmessage
	border-style	dashed
.katabmessage
	z-index			70
//	border-color	@textxd
	border			1px solid @tertiary
//	border-right	0
//	border-left		0
	border-bottom	0
	border-radius	5px
//	padding-bottom	38px
	background		@primary
	box-shadow		0 0 15px 0 @secondaryd
	bottom			68px
.messagebox
	padding			5px
	border-bottom	0
	line-height		1.1
	min-height		30px
	max-height		25vh
	text-align		justify
if max-width = 720px
	.messagebox
		padding			5px 50px 5px 0
	.full_message
		padding			0 50px 0 0

[data-mahvoof].messageitem .text
	font-style		italic
	color			@tertiary
	border-color	@secondaryxd
messageitem .name
	display			none
[data-hasphoto].messageitem .name
	display			block
[data-hasphoto].messageitem .text
	margin-top		5px
[data-margin].messageitem
	margin-top		24px
.messageitem
	border-radius		0 10px 10px 0
	background-color	@primary
	word-break			break-word
.messageitem h1, .messageitem h2, .full_message h1, .full_message h2
	font-size			unset
.messageitem .text h1
	border-bottom		1px dashed @secondaryd
	margin-bottom		12px
[data-hasphoto].messageitem .text
	border-radius	10px 10px 10px 0
.messageitem
	padding			0
	padding-left	58px
	padding-right	10vw
	border-bottom	0 !important
.messageitem:hover
	background-color	@secondaryxd !important
[data-playing].messageitem .text
	border-left		6px solid @accent
[data-selected].messageitem
	background		transparent !important
[data-focussed].list [data-selected].messageitem .tag
	border-color	@textxd
	color			@textl
	box-shadow		0 0 25px 0 @secondary
	z-index			1
[data-mu3allaq].messageitem .tag
	opacity			.5
[data-kind="2"].messageitem .msg_info
	padding				5px
.messageitem .photo, #messagesui .photo
	width				52px
	height				52px
	background			@secondaryt
	overflow			hidden
	border-radius		5px
.messageitem .photo
	top					5px
	left				2px
	z-index				50
	text-align			center
.messageitem .photo .short_name
	width				100%
	text-align			center
	align-self			center
	line-height			.8
