+css
+include locality.css.slang
+include helpful.css.slang
+include umoor.css.slang
+include qamoos.css.slang
+include controls.css.slang
//+include attendance.css.slang
+include profile.css.slang
+include shortcuts.css.slang
+include nasheet.css.slang
+include permissions.css.slang
+include reset.css.slang
+include menu.css.slang
+include sheet.css.slang
+include settings.css.slang
+include render.css.slang
+include editor.css.slang
+include billing.css.slang
+include admin.css.slang
+include dialog.css.slang
+include tabs.css.slang
+include lists.css.slang
+include headings.css.slang
//+include idscanner.css.slang
+include print.css.slang

@font-face
	font-family		'kmr'
	src				url('/kmr.otf')

html, body
	background-color	@primary
	color				@text
	font-family			-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif
	font-size			100%
	padding				0 0 60px 0
	margin				0
	overscroll-behavior	contain
//body[data-XPO.font] [dir=rtl]
//	font-family		kmr !important
//	font-size		90%
//	letter-spacing	-1px
//	line-height		2.3
body[data-XPO.font] [dir=rtl]
	font-family		"Noto Naskh Arabic" !important
	font-size		130%
body[data-XPO.font] [dir=ltr]
	font-family		-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif

if max-width = 600px
	html, body
		height			100%

.view
	min-height		80%

[data-XPO.largetext]
	font-size		120%

[data-XPO.keyboardopen] .hideonkeyboard
	display			none
[data-XPO.keyboardopen] .downonkeyboard
	bottom			-48px

if min-width = 920px
	.hideondesktop
		display			none !important

.actionbar
	position				relative
	z-index					250
	display					grid
	height					80px
	align-items				center
	line-height				1
	grid-template-columns	0fr 3fr 1.5fr
	margin					15px
	border-radius			5px
if min-width = 600px
	.actionbar
		margin					15px auto
.repeatx
	background-image		linear-gradient(88deg, @textd -90%, @primary 50%, @textd 170%)
	background-size			40% 100%
	background-repeat		repeat-x
[data-XPO.transparency] .repeatx
	background-image		linear-gradient(88deg, @textd -90%, @primaryt 50%, @textd 170%)
.repeaty
	background-image		linear-gradient(2deg, @textd -90%, @primary 50%, @textd 170%)
	background-size			100% 55%
	background-repeat		repeat-y
[data-XPO.transparency] .repeaty
	background-image		linear-gradient(2deg, @textd -90%, @primaryt 50%, @textd 170%)
.actionbar .details
	color			@text
.actionbar .action
	text-transform	uppercase
	font-weight		bold
	font-size		80%
	letter-spacing	-1px
	background		@accentt
	height			80px
	color			@text
	border			0
	border-radius	0 5px 5px 0
.actionbar .action:active
	color			@accent
	background		@primary
.actionbar .name
	font-weight		bold
	text-transform	uppercase
.actionbar .info
	font-size		80%
	font-style		italic
.actionbar .icon
	margin			0 8px
	width			64px
	height			64px
#loading .logo
	width			120px
	height			120px

.kindadim
	color			@textd
.dimmed, [disabled]
	opacity			0.3
	pointer-events	none

#notifybar, #quicktip
	font-size		90%
#notifybar
	top				0
	right			0
	left			0
	padding			3px 0
	text-align		center
	margin			0 auto
	color			@text
	background		@primary
	border-top		4px solid @yellow
	z-index			960
[data-XPO.transparency] #notifybar
	background		@primaryt
#quicktip
	position		fixed
	top				10px
	left			10px
	pointer-events	none
	opacity			0
	padding			6px
	font-weight		bold
	color			@primary
	background		@accent
	transform		translateY(-60px)
	border			2px solid @accentd
	border-radius	3px
	z-index			9000
[data-XPO.animate] #quicktip
	transition		transform 0.2s ease-in, opacity 0.2s ease-in
if min-width = 480px
	#notifybar
		padding			3px 6px
	#notifybar, #quicktip
		max-width		60%

#dimmerscreen
	position		fixed
	z-index			990
	top				0
	right			0
	left			0
	bottom			0
	background		@primaryt
// compensates for mediaui, sheets ...
[data-XPO.immersive] #dimmerscreen
	z-index			1300
[data-XPO.animate] #dimmerscreen
	transition		opacity 0.2s ease-in

[data-XPO.immersive] #mediaui
	position		fixed
	top				0
	right			0
	left			0
	bottom			0
	z-index			1200
	overflow		hidden
	overflow-y		auto
	background		@primary
[data-XPO.immersive] #mediaui .controls.bottom
	bottom			0
	left			0
	right			0
[data-XPO.immersive] #mediauisink
	padding-bottom	40px

#btnprofile .name
	position			absolute
	bottom				-2px
	left				0
	right				0
	z-index				20
	text-shadow			0 0 2px @primary
	font-size			80%
	text-transform		lowercase
	overflow			hidden
#btnprofile .photo
	position			absolute
	z-index				10
	background-position	50%
	background-size		100%
	background-color	@textd
	background-repeat	no-repeat
	border-radius		5px
	width				36px
	height				36px
	display				inline-block

#spinner
	position			fixed
	top					45%
	right				45%
	z-index				940
#spinner, .spinner
	width				64px
	height				64px
.spinner
	position			sticky
	top					160px
	margin				0 auto
	z-index				220
#spinner div, .spinner div
	position			absolute
	border				2px solid @accentl
	background			@accentd
	opacity				0
	border-radius		50%
	animation			lds-ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite
#spinner div:nth-child(2), .spinner div:nth-child(2)
	animation-delay		-1.5s

#container
	padding-bottom	60px
	display			block
	height			inherit
	
.expandable
	display			inline-block
	text-transform	uppercase
	user-select		none
	padding			4px 10px 0 0
[dir=rtl] .expandable
	padding			4px 0 0 10px
.expandable .fold svg
	fill			@textd
	width			24px
	height			24px

.heading
	display			block
	position		sticky
	top				0px
	color			@accent
	text-transform	uppercase
	font-weight		bold
	padding			10px
	user-select		none
	z-index			50
	transition		color 0.2s ease-in

.list
	position		relative
.list .noitems
	display			grid
	height			20vh
	align-items		center
	text-align		center
.list .noitems .message
	font-size		150%
#loading
	position		fixed
	top				0
	bottom			0
	right			0
	left			0
	z-index			3000
	color			#ccc
	color			@textd
	background		#000
	background		@primary
	grid-template-rows	1fr 1fr 0fr 0fr 1fr
#loadingmsg
	font-size		150%
#loading .subtext
	font-size		120%
#appreload
	margin			0 auto

.filler, .filler10, .filler20, .filler25, .filler30, .filler50, .filler75, .filler90, .filler100, #loading
	color				@textd
	display				grid
	text-align			center
	align-items			center
.filler
	height			300px
.filler10
	height			10vh
.filler20
	height			20vh
.filler25
	height			25vh
.filler30
	height			30vh
.filler50
	height			50vh
.filler75
	height			75vh
.filler90
	height			90vh
.filler100
	height			100vh

.captcha
	width			100%
	text-align		center
.captcha svg path
	fill			@text
	margin			5px auto

.scrollable
	overflow		auto
.horizontal
	display					block
	overflow-x				auto
	white-space				nowrap
.end
	float			right
[dir=rtl] .end
	float			left

.pad
	padding			4px 20px
.portrait .pad.bleed
	padding			4px 30px
if max-width = 600px
	.portrait .pad.bleed
		padding		4px 0

.bold
	font-weight		bold

