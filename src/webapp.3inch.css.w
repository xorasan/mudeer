[data-largetext]
	font-size		120%
[data-largetext] button svg
	width			26px
	height			26px
.form button
	display			block
	margin			0 auto
button svg
	width			22px
	height			22px
.header
	padding			5px
	background		@primary
	color			@accent
	font-weight		bold
	letter-spacing	-1px
	font-size		125%
	z-index			75
[data-transparency] .header
//	background		linear-gradient(150deg, @accent -90%, transparent 200%)
//	background		@accentdt
//	background		@primaryt
input, textarea
	font-size		125%
input.bare
	font-size			150%
	border-bottom-width	1px
#webapp_status_ui, #taht3nsar
	z-index			3000
	overflow		visible
#webapp_status_ui
	top				unset
	left			unset
	right			0
	bottom			90px
	max-height		64px
	max-width		600px
	letter-spacing	-1px
	transition		right .1s ease-in
#webapp_status_ui .text
	padding			6px 10px
	box-shadow		0 0 10px 0 @tertiary
	border			1px solid @tertiaryl
	border-radius	6px
	border-right	0 !important
	border-radius	10px 0 0 10px
	text-align		start
#taht3nsar .text
	padding			5px
	border-radius	5px
	border			1px solid @tertiaryd
#webapp_status_ui .text, #taht3nsar .text
	background		@secondaryd
	text-align		center
//	margin			0 auto
[data-transparency] #webapp_status_ui .text, [data-transparency] #taht3nsar .text
	background		@primaryt
	border-color	@secondaryt
