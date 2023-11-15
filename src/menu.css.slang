#homeui .dashitem
	position		relative
#homeui .dashitem .round
	display			block
	margin			0 auto
#homeui .body
	padding			6px 10px
#homeui .container
	background		transparent
	box-shadow		none
#homeui .headerphoto
	opacity			0.7
#homeui .headerphoto, #homeui .headertint
	height			100%
#homeui .headertint
	background		@primaryt
#homeui .mainicon
	margin			20px calc(50% - 64px)
	margin-bottom	0
	width			128px
	height			128px
	filter			drop-shadow(0 0 5px @primary)
#homeui .headline.title, #homeui .headline.sub, #homeui .dash .intro
	padding			0
	text-align		center
#homeui .headline.title
	font-size		200%
	margin			5px 0 0 0
#homeui .headline.sub
	margin			0 0 20px 0
	font-size		125%
#homeui .dashitem .headline.sub
	margin			20px 0 20px 0
#homeui .headline
	font-size		125%
	position		relative
	top				0
#homeui .dashitem .list .items
	min-height		5vh
#homeui .dashitem .link
	padding			0
	width			100%
	font-size		100%
#homeui .dashitem .item
	background		@primaryt
#homeui .short .item
	min-height		80px
#homeui .dashitem .item .controls
	display			none
#homeui .dashitem .item .detail
	display			none
#homeui .dashitem .item[data-XPO.hasphoto] .view
	background-image	linear-gradient(transparent -100%, @primary 120%)
	padding-top			20px
#homeui .list .item .details
	padding			0
#menuuitoggle
	display			none
	position		fixed !important
	z-index			980
	right			-10px
	bottom			420px
	margin			0
	border-radius	20px 0 0 20px
[data-XPO.idle] #menuuitoggle
	opacity			0.5
.toolbar
	display			flex
	position		fixed
	z-index			300
	overflow		visible
	bottom			0
	left			0
	right			0
	height			48px
	background		@primary
.toolbar .group
	display			flex
	flex-grow		1

if min-width = 920px
	:fullscreen .toolbar
		bottom			0
		left			initial
		height			initial
		background		transparent !important
	:fullscreen .toolbar, :fullscreen .toolbar .group
		flex-direction	column-reverse
		align-items		flex-end
		width			64px
	:fullscreen .toolbar .group
		display			block
	:fullscreen .toolbar button
		display			inline-block
		border-radius	20px 0 0 20px
		margin			4px 0 0 0
		width			64px
		background		@primary

[data-XPO.transparency] .toolbar
	background		@primaryt
[dir=rtl] .toolbar
	flex-direction	row-reverse
[dir=rtl] .toolbar #btnback
	transform		rotate(180deg) translateY(5px)
[dir=rtl] .langdir svg
	transform		rotate(180deg)
.toolbar button
	height			inherit
	background		transparent
	color			@text
	border			1px solid transparent
	flex-grow		1
.toolbar button:focus, .toolbar button:hover
	border-color	transparent
.toolbar button svg, .toolbar button .icon
	width			38px
	height			38px
.toolbar button .bubble
	border-radius	50%
	position		absolute
	font-size		70%
	font-weight		bold
	right			50%
	top				5px
	display			inline-block
	width			16px
	height			16px
	background		@accent
	box-shadow		0 0 30px 5px @accentl
[data-XPO.animate] .toolbar button .bubble
	animation		blip 6s infinite
.toolbar button .label
	display			none
	font-size		70%
	width			100%
	position		absolute
	bottom			0
	left			0
	background		@primaryt
if min-width = 1025px
	.toolbar button svg
		display			inline-block
	.toolbar button .label
		display			inline-block
.toolbar button:after
	content				''
	position			absolute
	display				block
	top					0
	bottom				0
	left				0
	right				0
	z-index				300
	border-radius		20px
	box-shadow			0 -5px 2px 0 transparent
	pointer-events		none
.toolbar button:active:after
	box-shadow			0 -14px 0 0 @accentl
:fullscreen .toolbar button:active:after
	box-shadow			0 0 0 14px @accentl
[data-XPO.animate] .toolbar button:after
	transition			box-shadow 0.2s cubic-bezier(0, 1.07, 1, 1)

#menuui
	position		fixed
	display			none
	flex-direction	column-reverse
	z-index			990
	max-height		95%
	right			10px
	bottom			10px
	width			320px
	overflow		hidden
	overflow-y		auto
	border-radius	5px
	border			1px solid @tertiary
	background		@primary
[data-XPO.transparency] #menuui
	background		@primaryt

#menuui .heading
	background		@primaryt

.sidebar.nosections .grid
	display			flex !important

.sidebar .list .items
	min-height		0vh
.sidebar .grid
	display			flex
	flex-direction	column-reverse

.sidebar button
	display					block
	min-height				50px
	border-color			transparent
	background				transparent
	text-align				start
	padding					0 20px
	border-left				1px solid transparent
	grid-template-columns	repeat(2, 1fr)
.sidebar button svg
	width			38px
	height			38px
	vertical-align	middle
.sidebar button span
	text-transform	initial
	vertical-align	middle
	padding			0 5px
.sidebar button:hover
	border-left		1px solid
.sidebar button:active
	background		@secondaryd
	
.toolbar .inline
	display			inline-flex
	position		relative
	height			100%
	flex-grow		6
#fldsearch
	flex-grow		6
	display			inline-block
	background		@primary
	color			@text
	border			1px solid @secondary
	border-radius	25px
	margin			2px 0
	padding			0 55px 0 15px
	font-family		inherit
	font-size		120%
[dir=rtl] #fldsearch
	padding			0 15px 0 55px
[data-XPO.transparency] #fldsearch
	background		@primaryt
#fldsearch:focus
	border-color	@accent
	background		@primaryl
	color			@textl
#fldclose
	position		absolute
	right			-2px
	transform		scale(0.8)
	border-radius	25px
[dir=rtl] #fldclose
	left			0
.toolbar .searchbar
	position		relative
	display			inline-flex
	flex-grow		2

if max-width = 959px
	.toolbar .searchbar
		display			none
	.toolbar .searchbar[data-XPO.show]
		display			inline-flex
if min-width = 960px
	:fullscreen .toolbar .searchbar
		display			none
	:fullscreen .toolbar .searchbar[data-XPO.show]
		display			inline-flex
	#btnsearch, #btnhome
		display			none
	:fullscreen #btnsearch
		display			inline-block
	#menuui
		display			flex
		max-height		unset
		bottom			0
		top				0
		z-index			970
		right			0
		border			0 !important
		border-left		1px solid @tertiary !important
		border-radius	0
	[data-XPO.hidemenu] #menuui
		display			none
	.toolbar
		right			320px
	#menuuitoggle
		display			inline-block
	[data-XPO.hidemenu] .toolbar
		right			0
	body
		padding-right	320px !important
	body[data-XPO.hidemenu]
		padding-right	0 !important
if max-width = 919px
	#menuuitoggle
		display			inline-block
		right			-10px
		border-radius	20px 0 0 20px
	[data-XPO.showmenu] #menuui
		display			flex
		z-index			1000
if max-width = 1024px
	#btnhome
		display			none
//	#btnmessages, #btnpages, #btnblog, #btnhome
//		display			none
#btnmessages, #btnpages, #btnblog
	display			none
