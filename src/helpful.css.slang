.helpfultip
	position				relative
	display					grid
	grid-template-columns	1fr 0fr
	margin					6px 18px 6px 0
	color					@text
	border					1px solid @yellow
	border-radius			5px
	line-height				1
	background				@primary
.pad .helpfultip
	margin					6px 0
.helpfultip[data-XPO.collapsed="1"]
	border-radius			0
	border					0
	border-top				1px solid @secondary

.helpfultip .content
	align-self				center
	padding					10px
	text-align				center
	font-size				90%
	height					auto
	opacity					1
.helpfultip[data-XPO.collapsed="1"] .content
	height					0
	opacity					0
	pointer-events			none
	padding					0

.helpfultip button
	position				absolute
	right					-10px
	border-width			1px
	border-radius			0% 100% 100% 100%
	transform				rotate(-45deg)
	width					36px
	height					36px
	border-color			@yellow
	background				@primary
	opacity					1
	z-index					400
[data-XPO.animate] .helpfultip button, [data-XPO.animate] .helpfultip .content
	transition-duration		0.2s
	transition-property		opacity, top, bottom, height
.helpfultip button:hover
	border-color			@yellow
.helpfultip button:active
	box-shadow				0 0 0 2px @yellow inset
	background				@primary

.helpfultip .hide
	bottom					-18px
.helpfultip[data-XPO.collapsed="1"] .hide
	bottom					0
	pointer-events			none
	opacity					0

.helpfultip .show
	pointer-events			none
	opacity					0
	top						0
.helpfultip[data-XPO.collapsed="1"] .show
	pointer-events			initial
	top						-18px
	opacity					1

.helpfultip button svg
	fill					@yellow
	transform				rotate(45deg)
	width					20px
	height					20px
.helpfultip button:active svg
	fill					@yellow
