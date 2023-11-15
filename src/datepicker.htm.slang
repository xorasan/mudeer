.datepicker #datepickerui @hidden
	label	[i18n=date]
	button	[id=year]
	.flex [focus=1]
		button	[id=month]	.grow
		button	[id=day]	.min
	label	[i18n=time]
	.flex [focus=1]
		button	[id=hour]
		button	[id=minute]
		button	[id=second]
	button	[id=today]		[i18n=dptoday]
