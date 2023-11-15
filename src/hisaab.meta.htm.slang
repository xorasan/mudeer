input	@type(hidden)	[XPO.id=XPO.type]
input	@type(hidden)	[XPO.id=XPO.archived]
div  .pad
	span .inline
		div		[XPO.datepicker] 		[XPO.i18n=XPO.admitted]		[XPO.id=XPO.joined]		[XPO.autolabel]
	span .inline
		div		[XPO.datepicker]		[XPO.i18n=XPO.birthday]		[XPO.id=XPO.age]		[XPO.autolabel]

div .pad
	span .inline
		select		[XPO.id=XPO.gender]			[XPO.i18n=XPO.gender]	[XPO.autolabel]
			option	@value(0)	[XPO.i18n=XPO.unspecified]
			option	@value(1)	[XPO.i18n=XPO.male]
			option	@value(2)	[XPO.i18n=XPO.female]
//			option	@value(3)	[XPO.i18n=XPO.intersex]
	span .inline
		select		[XPO.id=XPO.relationship]	[XPO.i18n=XPO.relationship]	[XPO.autolabel]
			option	@value(0)	[XPO.i18n=XPO.unspecified]
			option	@value(1)	[XPO.i18n=XPO.single]
//			option	@value(2)	[XPO.i18n=XPO.dating]
			option	@value(3)	[XPO.i18n=XPO.engaged]
			option	@value(4)	[XPO.i18n=XPO.married]

div .pad
	input		.nid		.inline			[XPO.id=XPO.nid]		[XPO.i18n=XPO.nid]			[XPO.autolabel]

div .pad
	input @type(phone) 	.inline 		[XPO.id=XPO.phone]		[XPO.i18n=XPO.phone]		[XPO.autolabel]
	div			[XPO.checkbox]			[XPO.id=XPO.viasms]		'XPO.viasms'

span .pad .bigrid
	div			[XPO.checkbox]		'XPO.resetpass'			[XPO.id=XPO.resetpass]
	div			[XPO.checkbox]		'XPO.nologin'			[XPO.id=XPO.status]		[XPO.checked=1]
