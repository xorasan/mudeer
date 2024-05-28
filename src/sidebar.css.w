// include after webapp, pager, ...
#sidebarui
	background		@secondaryd
	border			0
	border-right	1px solid @tertiaryd
	border-bottom	1px solid @tertiaryd
	width			260px
//	min-height		calc(100vh - 70px)
	top				0
	left			0
	bottom			70px
	border-radius	0 0 10px 0
	display			none
	flex-direction	column-reverse
	overflow		auto

.fill_available
	width			100%

.sidebar_item
	padding-left	10px
	padding-top		10px
	padding-bottom	10px
	background		@primaryl
	align-items		center
.sidebar_item:hover
	background		@secondaryl
[data-selected].sidebar_item
	color			@textl
	background		@tertiaryl
	border-right	4px solid @accentd
[data-focussed] [data-selected].sidebar_item
	color			@textl
	background		@accentd
.sidebar_item .icon
	padding-right	5px


if min-width = 1024px
	#sidebarui
		display		inline-flex
//		display		inline-block
	#tallheaderui
		padding-left	260px
		padding-right	90px
	body
		max-width		720px
		margin-left		max(260px, 25%)
		margin-right	max(90px, 25%)
	#pagermowjoodah
		max-width		650px
		justify-content	left
