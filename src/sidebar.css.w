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
	overflow		visible

.fill_available
	width			100%

.sidebar_item
	padding-left	10px
	padding-top		10px
	padding-bottom	10px
	background		@primaryl
	align-items		center
	border-top		1px solid @secondaryd
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
.sidebar_item .count
	background		@secondaryl
	border			1px solid @textxd
	color			@textd
	padding			3px
	font-weight		bold
	right			-5px
	position		absolute
	z-index			20
	border-radius	10px
.sidebar_item:hover .count
	background		@tertiaryl
	border			1px solid @textd
	color			@textl
	


if min-width = 860px
	#sidebarui
		display			inline-flex
//		display			inline-block
	#tallheaderui
		padding-left	260px
		padding-right	90px
	body
		max-width		720px
		margin-left		max(136px, 10%)
		margin-right	max( 90px, 10%)
	#pagermowjoodah
		max-width		650px
		justify-content	left
if min-width = 1024px
	body
		max-width		720px
		margin-left		max(260px, 25%)
		margin-right	max(90px, 25%)
if max-width = 1024px
	#sidebarui
		width			64px
	.sidebar_item .title, .sidebar_item .subtitle
		display			none