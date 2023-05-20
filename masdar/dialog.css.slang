#dialogui
	position	fixed
	bottom		0
	right		0
	left		0
	max-height	80vh
	overflow-x	auto
	background	@primary
	z-index		700
	padding		6px 6px 48px 6px
if min-width = 640px
	#dialogui
		max-width	640px
		margin		0 auto !important
		box-shadow	0 0 20px 5px @tertiaryd
