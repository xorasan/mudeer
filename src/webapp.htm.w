#statusbarpadding
#statusbarshadow
#tallscreenpadding
.tahweem .absolute .top .bottom .left .right .noselect
#tafawwaq .sticky
#loadingbox .fixed .flex .big .bold
	.center
		[i18n=loading]
#dimmer .fixed @hidden
	#dimmertext
// TODO support for ROOT for /
img #eqonahui .fixed .top .right .z200 @src(JAZAR/e.png)
#tallheaderui .fixed .z100 .left .right .headerui
	[id=header] .big .centertext [dir=1] @hidden
		[id=icon] .giant .icon
		[id=title] .big .bold
		[id=subtitle] .dim
#headerui .relative .headerui
	[id=header] [dir=1] @hidden
		.flex .padv
			.vcenter .pad
				[id=icon] .icon
			.vcenter .pad
				[id=title] .bold
				[id=subtitle] .dim
#webapp_status_ui .fixed @hidden .flex
	.title [id=title]
	.text [id=text]
#taht3nsar .fixed @hidden .flex
	.text
button [template=checkbox] .checkbox .flex .row
	.center
		.icon [id=icon]
		label [id=label]