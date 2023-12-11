// include after webapp, pager, ...
#sidebarui
	background		@secondaryd
	border			0
	border-right	1px solid @tertiaryd
	border-bottom	1px solid @tertiaryd
	min-width		260px
	min-height		calc(100vh - 70px)
	top				0
	left			0
	border-radius	0 0 20px 0
	display			none
//	flex-direction	column-reverse
	overflow		hidden

.fill_available
	width			100%

.sidebar_item
	background		@primaryl
.sidebar_item:hover
	background		@secondaryl


if min-width = 1024px
	#sidebarui
//		display		inline-flex
		display		inline-block
	#tallheaderui
		padding-left	260px
		padding-right	90px
	body
		max-width		750px
		margin-left		max(260px, 25%)
		margin-right	max(90px, 25%)
	#pagermowjoodah
		max-width		650px
		justify-content	left
