if min-width = 321px
	#softkeysui button
		line-height		1
		letter-spacing	-1px
		border-radius	0
		border			0
		background		@primary
		color			@textl
		overflow		hidden
		min-height		34px
	#softkeysui .row1 button
		height			64px
		background		@primaryt
	#softkeysui button:active, #softkeysui button[data-lamsah]
		background		@secondary
		box-shadow		0 0 30px 6px @tertiaryd
	#softkeysui button svg
		height			34px
		width			34px
//#softkeysui .row1
//	display			flex
//	flex-direction	row-reverse
//	width			240px
//	position		fixed
//	right			0
//	bottom			0
//#softkeysui .row1 button
//	position		relative
	#softkeysui .row2, #skdots
		box-shadow		0 0 10px 0 @tertiary
		display			flex
		flex-direction	column-reverse
		position		fixed
		bottom			90px
		right			0
	#skdots
		display			none
		z-index			100
		min-height		120px
		min-width		32px
		background		@primaryt
		border			1px solid @tertiary
		border-right	0
		border-radius	10px 0 0 10px
#softkeysui[data-hidden] #skdots
	display			flex
	right			-2px
#softkeysui[data-hidden] .row2
	display			none
//	right			-34px
//#softkeysui .left
//	border-radius	8px 8px 0 0
//	border-left		1px solid @secondaryd
[data-align=left] #softkeysui .row1
	flex-direction	row
[data-align=left] #softkeysui .row1, [data-align=left] #softkeysui .row2
	right			initial
	left			0
//[data-keyboardopen] #softkeysui button
//	opacity			0.7
if min-width = 321px
	#skdots
		display			none !important
	#softkeysui .row2 [data-hawm="1"] span
		position		absolute
		top				6px
		right			95px
		background		@secondary
		padding			2px
		border-radius	6px
		border			1px solid @tertiary
	#skhelp
		display			none
	#softkeysui .row2
		display			flex !important
		background		@primary
		border-top		1px solid @tertiary
		border-left		1px solid @tertiary
		border-bottom	1px solid @tertiary
		border-right	0
		border-radius	10px 0 0 10px
	#softkeysui .row2 button
		padding			0 4px
		position		relative
		overflow		visible
		border-radius	10px 0 0 10px
	#softkeysui .row2 [data-hawm="1"] .icon
		right			45px
		position		relative
	#softkeysui[data-hidden] .row2
		right			-16px
		border-color	transparent
