:hover, :focus, :active
	outline			none
::-moz-focus-inner
	border			0
*
	box-sizing		border-box
small, big
	font-weight		normal
small, .small
	font-size		80%
.medium
	font-size		120%
big, .big
	font-size		160%
.bigger
	font-size		220%
.biggest
	font-size		300%
.huge
	font-size		400%
html, body
	font-size		100%
	padding			0 0 20px 0
	margin			0
	color			@text
//	overflow-x		hidden		this messes with sticky positioning
	overscroll-behavior		none
	width			100%
body
	background-color		@primary
body[data-transparency]
	background-color		@primaryt
	background-attachment	fixed !important
html, body, svg text
	font-family		sans-serif
img
	border				none
ul
	padding				0px
	margin				0px
	text-decoration		none
li
	margin-bottom		5px
ul li
	list-style			none
	vertical-align		middle
hr
	border				0
	border-top			2px dashed @secondary
	margin				2px 0
p, h1, h2, h3, h4, h5, h6
	margin				4px 0
p
	padding				0 3px
//[dir=rtl] .ltr svg
//	transform			rotate(-180deg)
[hidden]
	display				none !important
s
	text-decoration-color		@text
a
	vertical-align		middle
	text-decoration		underline @accent
a:active
	color				@tertiary
	text-decoration		underline @accentd
button
	display				inline-block
	background			@primary
	border				2px solid @secondary
	color				inherit
	font-family			inherit
	font-size			inherit
	user-select			none
	vertical-align		middle
//button:hover
//	border-color		@tertiary
//	box-shadow			0 0 0 1px @textl inset
button:active
	border-color		@accentl
	color				@accent
	fill				@accent
	box-shadow			0 0 0 0 @textl
button:active svg
	fill				@accent
button:active span
	color				@accent
button:focus
	border-color		@accentl
button:disabled
	opacity				0.5
button svg
	fill				@textl
	pointer-events		none
	vertical-align		middle
button[data-selected]
	background			@accent !important
button[data-selected] svg
	fill				@primary !important
label
	font-size		90%
	font-weight		bold
	padding			0 2px
input, textarea, select
	background-color	transparent
	border				0
	border-radius		0
	border-bottom		2px solid @secondary
	color				@textd
	font-family			inherit
	font-size			inherit
	font-weight			inherit
	width				100%
	margin				0
	padding				1px 2px
	display				block
	resize				none
input:active, input:focus
	color				@textl
	border-color		@accent
input[data-error]
	border-color		@red
select
	display				inline-block
	min-width			120px
	width				inherit
	min-height			40px
	-webkit-appearance	none
	-moz-appearance		none
	border				1px solid @tertiaryd
	border-radius		3px
	padding				0 10px
select, select:focus
	background-image			linear-gradient(45deg, transparent 40%, @text 50%), linear-gradient(135deg, @text 50%, transparent 60%)
	background-position			calc(100% - 10px) calc(1em + 2px), calc(100% - 5px) calc(1em + 2px)
	background-size				5px 5px, 5px 5px, 1px
	background-repeat			no-repeat
[dir=rtl] select
	background-position			calc(5px) calc(1em + 2px), calc(10px) calc(1em + 2px)
	padding						0 10px 0 0
option
	background	@primary
	color		@text
#icons
	display		none
