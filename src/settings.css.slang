.settingsitem
	padding			9px 0
	border			1px solid transparent !important
	border-radius	8px
.settingsitem[data-selected]
	border			1px solid @accent !important
if min-width = 540px
	.settingsitem .icon svg
		width		48px
		height		48px