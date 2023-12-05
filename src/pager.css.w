#pagerui
	border-bottom		1px solid @tertiaryd
//	box-shadow			0 -20px 20px 5px @secondary
	z-index				80
#pagermowjoodah
	overflow-x			auto
	top					0
	width				100%
	z-index				200
	background			@primary
	justify-content		center
[data-transparency] #pagermowjoodah
	background			@primaryt
if min-width = 640px
	#pagermowjoodah
		max-width				640px
if min-width = 800px
	#pagermowjoodah
		max-width			700px
if min-width = 1024px
	#pagermowjoodah
		max-width			840px
#pagermowjoodah .pagerzir
//	border-right		1px solid @tertiary
	padding				2px 4px
	cursor				pointer
	position			relative
	user-select			none
#pagermowjoodah .pagerzir[selected]
	border-radius		6px
	background			@accent
	color				@primary
#pagermowjoodah .pagerzir[selected] svg
	fill				@primary
#pagermowjoodah .pagerzir span
	position			absolute
	top					2px
	right				2px
	padding				0 5px
	background			@red
	border-radius		50%
	color				#fff
	border				1px solid @redl
	font-weight			bold
	font-size			80%
#pagermowjoodah .pagerzir label
	cursor				inherit
	font-family			monospace
	text-align			center
	display				block
	color				@textd
#pagermowjoodah .pagerzir[selected] label
	color				@primary
#pagermowjoodah .pagerzir .icon
	width				fit-content
	margin				0 auto
#pagermowjoodah .pagerzir .icon svg
	width				36px
	height				36px
if min-width = 480px
	#pagermowjoodah .pagerzir .icon svg
		width				48px
if min-width = 640px
	#pagermowjoodah .pagerzir .icon svg
		width				64px



