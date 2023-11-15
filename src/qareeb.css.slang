[data-rakkaz] [data-selected].haajahitem
	border-style		solid
	border-color		@accent
[data-selected].haajahitem
	border-style		dashed
	border-color		@accent
.qareebitem
	border				2px solid @secondary
	background			@secondaryd
[data-baidaa].qareebitem .inta
	display				inline-block !important
[data-rakkaz] [data-selected].qareebitem
	border-style		solid
	border-color		@accent
[data-selected].qareebitem
	border-style		dashed
	border-color		@accent
.qareebitem .ellipsis
	max-width			125px
.qareebitem .details
	background			linear-gradient(transparent 0%, @primary 100%)
	position			absolute
	bottom				0
	left				0
	right				0
.qareebitem .shakl
	display				flex
	align-items			center
	margin				0 auto
.faasilahitem .tawassa3
	margin-right		90px
.qareebtag
	margin				0 2px 2px 0
if min-width = 640px
	.qareebitem .shakl
		width			210px
