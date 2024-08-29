.tahweem
	display			none
	z-index			99999
	background		@accentt
	pointer-events	none
[data-tahweem] .tahweem
	display			inline-block
#eqonahui
	display			none
	width			64px
	height			64px
	border			0
	margin			8px
#loadingbox
	top				0
	bottom			0
	right			0
	left			0
	background		#000
	color			#fff
	z-index			99999
.above
	z-index			100
	background		@primaryt
.z500
	z-index			500
.z400
	z-index			400
.z300
	z-index			300
.z200
	z-index			200
.z100
	z-index			100
[data-minimal] #tallheaderui
	display			none
[data-minimal] #tallscreenpadding
	display			none
[data-minimal] #headerui
body[data-minimal]
	padding-top		0
	padding-bottom	0
#tallheaderui
	pointer-events	none
	top				0
	padding-top		12vh
[data-sticky].headerui
	z-index			100
	background		@primaryt
	position		sticky
	top				0
	backdrop-filter	blur(8px)
#headerui [data-align="1"]
	text-align		center
#headerui [data-align="2"]
	text-align		end
#icons
	height			0
	width			100%
#statusbarshadow
	z-index			999999
	position		fixed
	top				0
	left			0
	right			0
	height			60px
	pointer-events	none
	background		linear-gradient(#000 -40%, transparent)
#statusbarpadding
	height			25px
if min-height = 600px
	#tallscreenpadding
		height			42vh
.fixed
	position		fixed
.absolute
	position		absolute
.relative
	position		relative
.sticky
	position		sticky
.top
	top				0
.right
	right			0
.left
	left			0
.bottom
	bottom			0

.justifycenter
	justify-content	center
.vcenter
	vertical-align	middle
	align-self		center
.vcenterkids
	align-items		center
.upper
	text-transform	uppercase
.smallcaps
	font-variant	small-caps
.spaces
	white-space		pre
.ellipsis
	text-overflow	ellipsis
//	width			110px
	white-space		pre
	overflow		hidden
.allcaps
	text-transform	capitalize
.lower
	text-transform	lowercase
.monospace
	font-family		monospace
.centertext
	text-align		center
.justifytext
	text-align		justify
.start
	text-align		start
	align-self		flex-start
.end
	text-align		end
	align-self		end
.vend
	align-self		flex-end
.noselect
	user-select		none

.inlineonly
	display			inline
.inline
	display			inline-block
	vertical-align	middle
.displayblock
	display			block
.narrowline
	line-height		1
.narrowletters
	letter-spacing	-1px
.narrowerletters
	letter-spacing	-1.5px
.light
	font-weight		100
.semibold
	font-weight		600
.bold
	font-weight		bold

.pad, .form
	padding-left	5px
	padding-right	5px
.padv
	padding-top		5px
	padding-bottom	5px
.padt
	padding-top		5px
.padb
	padding-bottom	5px
.padr
	padding-right	5px
.padl
	padding-left	5px
.gap
	margin-left		5px
	margin-right	5px
.gapv
	margin-top		5px
	margin-bottom	5px
.gapt
	margin-top		5px
.gapb
	margin-bottom	5px

.tag
	border-radius		5px
	border				1px solid @secondaryd

.r90
	transform		rotate(90deg)
.r180
	transform		rotate(180deg)
.r270
	transform		rotate(270deg)

.grid
	display			grid
	grid-template-columns repeat(3, 1fr)
.grid.two
	grid-template-columns repeat(2, 1fr)

.flex
	display			flex
.inlineflex
	display			inline-flex
.flex.row, .inlineflex.row
	flex-direction	row
.flex .min, .flex .less, .flex .grow, .flex .more
	width			auto !important
.flex .min, .inlineflex .min
	flex-grow		0
.flex .less, .inlineflex .less
	flex-grow		1
.flex .grow, .inlineflex .grow
	flex-grow		2
.flex .more, .inlineflex .more
	flex-grow		3
.icon svg, .icon img
	width			24px
	height			24px
	fill			@textl
	pointer-events	none
	vertical-align	middle
.giant.icon svg, .giant .icon svg, .giant.icon img, .giant .icon img
	width			128px
	height			128px
.huge.icon svg, .huge .icon svg, .huge.icon img, .huge .icon img
	width			96px
	height			96px
.large.icon svg, .large .icon svg, .large.icon img, .large .icon img
	width			64px
	height			64px
.medium.icon svg, .medium .icon svg, .medium.icon img, .medium .icon img
	width			48px
	height			48px
.small.icon svg, .small .icon svg, .small.icon img, .small .icon img
	width			12px
	height			12px
.flex .vertical, .inlineflex .vertical, .flex.vertical, .inlineflex.vertical
	flex-direction	column
.flex .center
	display			flex
.flex .inlineflex.center
	display			inline-flex
.flex .center, .inlineflex .center
	align-items		center
	margin			0 auto
.flex .mh25, .inlineflex .mh25
	min-height		25vh
.flex .mh50, .inlineflex .mh50
	min-height		50vh
.flex .mh75, .inlineflex .mh75
	min-height		75vh
.flex .mh100, .inlineflex .mh100
	min-height		100vh

.accent
	color			@accent
.accent svg
	fill			@accent
.red
	color			@redl
.redbg
	background		@redd
.dim, .dimx
	opacity			0.7
.extradim, .extradimx
	opacity			0.5
[data-selected] .dimx, [data-selected] .extradimx
	opacity			1

button.xaas
	margin				6px auto
	display				block
	border-radius		14px
	padding				5px 30px
	font-weight			bold
	font-size			150%
	letter-spacing		-2px
	text-transform		uppercase
	background			@secondaryd
	border				4px solid @secondaryl
button.xaas:focus
	background			@accentl
	border-color		@accent
	color				@primary
button.xaas:active
	background			@accent
	border-color		@accentd

#dimmer
	display			flex
	right			0
	left			0
	top				0
	bottom			0
	background		@primaryt
	align-items		center
#dimmertext
	text-align		center
	max-width		80%
	margin			0 auto
	font-size		180%
	padding			5px 15px
	color			@textd
	letter-spacing	-1px
	border-radius	5px
	border			1px solid @tertiary
	background		@secondaryd

kf fadein
	0%
		transform		scale(0.9)
		opacity			0
	100%
		transform		scale(1)
		opacity			1
