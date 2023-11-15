#sheetui
	position		fixed
	bottom			0
	right			0
	left			0
	max-height		100vh
	overflow-x		auto
	background		@primary
	z-index			500
	border-radius	10px 10px 0 0
#sheetui .header
	position	sticky
	left		0
	right		0
	top			0
	z-index		200
#sheetui .container
//	padding		6px 0 48px 0
	padding		0 0 30px 0
#sheetui [data-bardaa].container
	opacity				.4
	pointer-events		none
	user-select			none
#sheetui [data-visiblesheet]
	padding-bottom	48px
#sheetui [data-visiblesheet] .heading
	font-size		125%
	font-weight		bold
	margin-bottom	5px
if min-width = 640px
	#sheetui
		max-width	640px
		margin		0 auto !important
		box-shadow	0 0 20px 5px @tertiaryd
