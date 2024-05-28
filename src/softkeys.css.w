#softkeysui
	position		fixed
	bottom			0
	right			0
	left			0
	z-index			1000
	padding			0 1px 1px 1px
	background		linear-gradient(0deg, @primary 5%, @primaryt 15%, transparent)
#softkeysui[data-hidden]
	background		linear-gradient(0deg, @primaryt 0%, transparent)
//	opacity			0.85
#softkeys_backstack
	right			16px
	bottom			66px
#softkeys_backstack .dot
	width			6px
	height			6px
	border-radius	8px
	display			inline-block
	border			1px solid @primaryt
	background		@secondary
#skhelp
	margin-bottom	5px
	font-size		125%
#softkeysui button
	line-height		1
	letter-spacing	-1px
	border-radius	4px
	border			0
	background		@primaryt
	color			@textl
	height			26px
	overflow		hidden
#softkeysui button span
	vertical-align	middle
	font-size		110%
#softkeysui button.star span
	font-size		150%
#softkeysui button.hash span
	font-size		125%
#softkeysui button .icon
	display			inline-block
[data-animations] #softkeysui button .icon
	position		relative
	transition		.2s right ease-out
	right			0
#softkeysui button svg
	height			25px
	width			25px

#softkeysui button label
	height			inherit
	margin			0 3px 0 0
	font-size		120%
	border			1px solid @secondaryd
	border-radius	5px
	padding			0 5px
	white-space		nowrap
#softkeysui .row1
	min-height		26px
#softkeysui .row1 button
	padding			0 5px
	display			block
	border-top		1px solid @secondaryd
#softkeysui .row1 button:hover
	box-shadow		0 0 25px 2px @secondary
#softkeysui .row1 button:focus
	box-shadow		0 0 25px 2px @accentd

#softkeysui .row2 button
	padding			0 5px 0 0
	margin-right	1px
	font-size		100%
	margin-bottom	0
	border-right	1px solid @secondaryd
#softkeysui .row2 button:hover
	box-shadow		-20px 0 15px 0px @secondary inset
#softkeysui .row2 button:focus
	box-shadow		-20px 0 15px 0px @accentd inset

#softkeysui .left, #softkeysui .right
	position		absolute
	bottom			0
	font-size		110%
#softkeysui .left
	border-radius	0 8px 0 0
	border-right	1px solid @secondaryd
	text-align		left
	left			0
	text-align		end
#softkeysui .center
	border-radius	8px 8px 0 0
	border-right	1px solid @secondaryd
	border-left		1px solid @secondaryd
	font-size		120%
	text-align		center
	margin			0 auto
#softkeysui .right
	border-radius	8px 0 0 0
	border-left		1px solid @secondaryd
	text-align		right
	right			0
	text-align		start

input[data-over], textarea[data-over], input[data-under], textarea[data-under]
	border-color	@red

if min-width = 320px
	#softkeysui .left
		display			flex !important
		flex-direction	row-reverse
		align-items		center
	#softkeysui .right
		display			flex !important
		flex-direction	row
		align-items		center
	#softkeysui .row2 button:hover .tooltip, #softkeysui .row2 [data-hawm="1"] .tooltip
		display			flex
//	#softkeysui[data-shown] .row2 button .tooltip
//		display			flex
//	#softkeysui[data-shown] .row2 button .tooltip label
//		display			none
	#softkeysui .row2 button:hover .tooltip label
		display			flex
	#softkeysui .row2 button
		padding			0 4px
	#softkeysui .row2 button .tooltip
		display			none
		position		absolute
		right			70px
		align-items		center
		top				0
		font-weight		normal
		border			1px solid @secondaryd
		background		@primaryl
		font-size		100%
		width			max-content
		padding			8px
		border-radius	8px
		pointer-events	none
	#softkeysui button .key
		margin			2px
		padding			2px
		background		@secondaryd
	#softkeysui button label
		border			0 !important
		height			auto
	#softkeysui .row1 button .tooltip
		font-size		90%
		flex-direction	column

if min-width = 1200px
	#softkeysui .row2 button .tooltip
		display			inline-block
		right			64px
		top				3px
	#softkeysui .row2 button:not(:hover) .tooltip
		top				9px
	#softkeysui button:not(:hover) .key
		display			none

if min-width = 1400px
	#softkeysui .row2 button
		padding			0 14px 0 54px
	#softkeysui .row2 button .tooltip
		right			84px

