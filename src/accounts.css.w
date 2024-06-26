.profileitem
	border				2px solid @secondary
[data-baidaa].profileitem .inta
	display				inline-block !important
[data-focussed] [data-selected].profileitem
	border-style		solid
	border-color		@accent
[data-selected].profileitem
	border-style		dashed
	border-color		@accent
.profileitem .details
	background			linear-gradient(transparent 0%, @primary 100%)
	position			absolute
	bottom				0
	left				0
	right				0
.profileitem .photo
	width				100%
	height				100px
	background-color	@secondaryd
.item .qrcode
	padding				10px
.item .qrcode img
	border-radius		8px
	border				10px solid #fff
.account_sheet .age
	font-size			220%
	font-weight			100
.account_sheet .gender
	position			absolute
	top					57px
	right				6px
	z-index				220
	font-weight			bold
	text-transform		uppercase
.account_sheet .bio
	padding-top			20px
	color				@text
.account_sheet .photo
	width				100%
	height				480px
	z-index				100
	background-position	50% 0%
	background-size		auto 100%
	background-color	@secondaryd
	background-repeat	no-repeat
[data-animate] .account_sheet .photo
	transition			transform 0.2s ease-in
.account_sheet .extendedinfo
	position			absolute
	z-index				120
	top					70vh
	color				@textl
	width				calc(100% - 30px)
	padding				15px 15px 150px 15px
	background			linear-gradient(@primaryt 0%, @primary 100%)
.account_sheet .item .title
	font-size			125%
	letter-spacing		-0.5px
	margin-top			10px
	font-weight			bold
.account_sheet .heading
	margin				0 -15px

.account_item .photo svg
	width		64px
	height		64px
.account_item .owner svg
	width		16px
	height		16px
.account_item .name
.account_item .displayname
.account_item .created
.account_item .updated
	

if min-width = 640px
	.account_sheet .extendedinfo
		border-top-right-radius	15px
		border-top-left-radius	15px
		width			570px
	.account_sheet .title
		font-size		150%

#profilephotosui .item .details
	width					100%
#profilephotosui .item .image
	background-position		50% 0%
	background-size			auto 100%
	background-color		@secondaryd
	background-repeat		no-repeat
	width					260px
	height					180px

.flexible
	display					flex
	padding					3px 0
.flexible .item
	display					inline-block
	margin					0 3px

.freecolumns
	display					grid
	grid-template-columns	repeat(2, 1fr)
	grid-gap				12px
	padding					3px 0
.freecolumns .item
	display					inline-block
.freecolumns .item .subheading, .flexible .item .subheading
	text-transform			lowercase
.freecolumns .item .info, .flexible .item .info
	font-weight				bold