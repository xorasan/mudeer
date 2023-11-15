+htm

body

	+include templates.htm.slang

	div .shortcuthint
		span .ctrlhint		'ctrl&nbsp;'
		span .shifthint		'shift&nbsp;'
		span .althint		'alt&nbsp;'
		
	div #mapsui @hidden

	div #tourcircle @hidden
	div #tourscreen @hidden
		div #tourcontent
		button #tournext .round
			svg
				use @xlink:href(#XPO.iconcardnext)
		button #tourback .round
			svg
				use @xlink:href(#XPO.iconcardback)

	div #container .immersive
		div #topmostofthepage

		div .filler30 #globalfiller [XPO.i18n=XPO.spaceleftblank] @hidden
		
		div #topofthepage

		div .Osetsite
			div #globalheader .form .portrait .actionbar .repeaty .noprint @hidden
				img .icon @src(/icon.png)
				div .details
					div .name #globalname
					div .info #globalinfo [XPO.i18n=XPO.getappinfo]
//				button .hide
//					svg
//						use @xlink:href(#XPO.iconclose)
				button .action .send [XPO.form=XPO.globalheader] [XPO.id=XPO.action]
					svg
						use @xlink:href(#XPO.iconapps)
					div [XPO.i18n=XPO.createapp]

		div #notifybar @hidden
			span .text
			span .date

// TODO make bigrid an optional variable
		div #selectplustitle @hidden
		div #selectplus @hidden .bigrid

		div #quicktip @hidden
			div

		div #installapp .portrait .actionbar .repeaty @hidden .noprint
			img .icon @src(/icon.png)
			div .details
				div .name [XPO.i18n=XPO.installapp]
				div .info [XPO.i18n=XPO.installapphint]
			button .action
				svg
					use @xlink:href(#XPO.iconadd)

		+include editors.htm.slang
		div #adminuis
			+include admin.htm.slang
		+include profiles.htm.slang
		+include invoice.htm.slang
		+include profile.htm.slang
		+include class.htm.slang
		+include subject.htm.slang
		+include config.htm.slang

		+include settings.htm.slang
		+include sessions.htm.slang

		+include editorui.htm.slang
		+include messages.htm.slang

		+include qrvalidation.htm.slang

		div #shareui @hidden .pad .portrait .view

		+include nasheet.htm.slang

		div #homeui @hidden .view .homeui .renderui .form
			div .noprint
				div .headerphoto	[XPO.id=XPO.headerphoto]
				div .headertint		[XPO.id=XPO.headertint]
			div .twocolumns .nosections
				div .container .dash
					img .mainicon @src(/icon.png)
					div .headline	.title	[XPO.id=XPO.sitename]
					div .headline	.sub	[XPO.id=XPO.headline]
					div .center [XPO.id=XPO.sectbuttons]
						button .square .send [XPO.id=XPO.gotocontactus] [XPO.form=XPO.homeui]
							svg
								use @xlink:href(#XPO.iconmessages)
							span [XPO.i18n=XPO.contactus]
						button .square .send [XPO.id=XPO.gotodashboard] [XPO.form=XPO.homeui]
							svg
								use @xlink:href(#XPO.icondashboard)
							span [XPO.i18n=XPO.dashboard]
						button .square .send [XPO.id=XPO.gotohome] [XPO.form=XPO.homeui] .ltr
							svg
								use @xlink:href(#XPO.iconnext)
							span [XPO.i18n=XPO.readmore]
					div .body				[XPO.id=XPO.intro]
					div .dashitem [XPO.id=XPO.sectdashboard]
						div [XPO.id=XPO.dashboard] .tiled .tricolumn
					+include spinner.htm.slang
					div .listitem
						div .body				[XPO.id=XPO.body]
						br
				div .container
					div .dashitem [XPO.id=XPO.sectpages] .short
						div .headline	.sub	[XPO.i18n=XPO.pages]
						button .round .send [XPO.id=XPO.gotopages] [XPO.form=XPO.homeui]
							svg
								use @xlink:href(#XPO.iconpages)
						div [XPO.id=XPO.pages] .tricolumn
					div .dashitem [XPO.id=XPO.sectblog] .short
						div .headline	.sub	[XPO.i18n=XPO.blog]
						button .round .send [XPO.id=XPO.gotoblog] [XPO.form=XPO.homeui]
							svg
								use @xlink:href(#XPO.iconblog)
						div [XPO.id=XPO.blog] .tricolumn

		div #renderui @hidden .view .renderui .form
			+include spinner.htm.slang
			div .listitem
				div .noprint
					div .headerphoto	[XPO.id=XPO.headerphoto]
					div .headertint		[XPO.id=XPO.headertint]
				div .twocolumns
					div [XPO.id=XPO.localizable] .container
						div .onlyinprint
							img .siteicon [XPO.id=XPO.siteicon] @src(/icon.png)
							span .sitename [XPO.id=XPO.sitename]
							span .siteaddress [XPO.id=XPO.siteaddress]
						h1 .headline	.title	[XPO.id=XPO.headline]
						div .badges
							div .datetime	.badge	[XPO.id=XPO.datetimep]
								svg
									use @xlink:href(#XPO.iconattendance)
								span [XPO.i18n=XPO.updated]
								span ' '
								span	[XPO.id=XPO.datetime]	[XPO.datetime]
							div .created	.badge
								svg
									use @xlink:href(#XPO.iconattendance)
								span [XPO.i18n=XPO.published]
								span ' '
								span	[XPO.id=XPO.created]	[XPO.datetime]
							div .details	.badge
								svg
									use @xlink:href(#XPO.iconpending)
								span [XPO.id=XPO.details]
							div .hits		.badge
								svg
									use @xlink:href(#XPO.iconpreview)
								span [XPO.id=XPO.hits]
							div 			.badge [XPO.id=XPO.commentcountp]
								svg
									use @xlink:href(#XPO.iconmessages)
								span [XPO.id=XPO.commentcount]
							div 			.badge [XPO.id=XPO.ownerp]
								svg
									use @xlink:href(#XPO.iconprofile)
								span [XPO.id=XPO.owner]
							div 			.badge [XPO.id=XPO.statusp]
								div .status [XPO.id=XPO.status]
						div .body				[XPO.id=XPO.body]
					div .comments .list .onecolumn .container .noprint .embedded #commentsui
						div [XPO.id=XPO.author]
							div .headline .title	[XPO.id=XPO.contributers]	[XPO.i18n=XPO.contributers]
							div .authorbio
								div .profilephoto	[XPO.id=XPO.authorphoto]
								span
									a	.name		[XPO.id=XPO.authorname]
									div .bio		[XPO.id=XPO.authorbio]
						div [XPO.id=XPO.tagsp]
							div .headline	.title	[XPO.i18n=XPO.tags]
							div .tags				[XPO.id=XPO.tags]
						div [XPO.id=XPO.relatedp]
							div .headline	.title	[XPO.i18n=XPO.related]
							div .grid #relatedlinks
						div [XPO.id=XPO.commentsp]
							div .headline	.title	[XPO.id=XPO.comments] [XPO.i18n=XPO.comments]
							div [XPO.id=XPO.commentasp]
								textarea .newcomment [XPO.id=XPO.newcomment]	[XPO.i18n=XPO.new]	[XPO.autolabel]
								button .mini .send .ltr	[XPO.id=XPO.postcomment] [XPO.form=XPO.renderui]
									svg
										use @xlink:href(#XPO.iconsend)
									span [XPO.i18n=XPO.postcomment]
								div .badge
									svg
										use @xlink:href(#XPO.iconprofile)
									span [XPO.id=XPO.commentas]
							div [XPO.id=XPO.commentslist] .nosections
				textarea #renderuilink .onepixel @hidden
				div .list
					div .controls .bottom	[XPO.id=XPO.controls]
						button .round .send .ltr	[XPO.id=XPO.play]		[XPO.form=XPO.renderui]
							svg
								use @xlink:href(#XPO.iconplay)
						button .round .send	.newbtn	 [XPO.id=XPO.fullscreen]	[XPO.form=XPO.renderui]
							svg
								use @xlink:href(#XPO.iconfullscreen)
						button .round .send	.newbtn [XPO.id=XPO.fullscreenoff]	[XPO.form=XPO.renderui] @hidden
							svg
								use @xlink:href(#XPO.iconfullscreenoff)
						div
							button	.round	[XPO.id=XPO.edit]
								span .shortcut .alt 'e'
								svg
									use @xlink:href(#XPO.iconedit)
						button	.round			[XPO.id=XPO.share]		@hidden
							svg
								use @xlink:href(#XPO.iconshare)
						button	.round	.send	[XPO.id=XPO.copylink]	[XPO.form=XPO.renderui]
							svg
								use @xlink:href(#XPO.iconlink)
						button	.round	.send	[XPO.id=XPO.print]		[XPO.form=XPO.renderui]
							svg
								use @xlink:href(#XPO.iconprint)
						select		.language		[XPO.id=XPO.language]	[XPO.i18n=XPO.language]
							option @value(en)	[XPO.i18n=XPO.english]			@selected
							option @value(ur)	[XPO.i18n=XPO.urdu]
							option @value(ar)	[XPO.i18n=XPO.arabic]
							option @value(tr)	[XPO.i18n=XPO.turkish]
						select		.sidebyside		[XPO.id=XPO.sidebyside]	[XPO.i18n=XPO.sidebyside]
							option @value(0)	[XPO.i18n=XPO.none]				@selected
							option @value(en)	[XPO.i18n=XPO.english]
							option @value(ur)	[XPO.i18n=XPO.urdu]
							option @value(ar)	[XPO.i18n=XPO.arabic]
							option @value(tr)	[XPO.i18n=XPO.turkish]

		div #notfound @hidden .view
			div .list
				div .noitems
					div .message
						p [XPO.i18n=XPO.notfound]

		div #pressback @hidden .view
			div .list
				div .noitems
					div .message
						p [XPO.i18n=XPO.pressback]

		div #comingsoon @hidden .view
			div .list
				div .noitems
					div .message
						p [XPO.i18n=XPO.comingsoon]
	
		div #mediaui @hidden .view
			div #mediauisink
		
		div .filler20 .hideondesktop [XPO.i18n=XPO.spaceleftblank]

	div #dialogui @hidden .popup
		div .title [XPO.i18n=XPO.deleteconfirmtitle]
		div .body [XPO.i18n=XPO.deleteconfirmdetail]
		div .controls
			button #dialoguino	.negative [XPO.i18n=XPO.no]
			button #dialoguiyes	.positive [XPO.i18n=XPO.yes]

	div #datepickerui @hidden .popup
		div	.heading 	[XPO.i18n=XPO.year]		[XPO.id=XPO.yearlabel]
		div	.year								[XPO.id=XPO.year]
		div	.heading 	[XPO.i18n=XPO.month]	[XPO.id=XPO.monthlabel]
		div	.month								[XPO.id=XPO.month]
		div	.heading 	[XPO.i18n=XPO.day]		[XPO.id=XPO.daylabel]
		div	.day								[XPO.id=XPO.day]
		div	.heading 	[XPO.i18n=XPO.hours]	[XPO.id=XPO.hourslabel]
		div	.hours								[XPO.id=XPO.hours]
		div	.heading 	[XPO.i18n=XPO.minutes]	[XPO.id=XPO.minuteslabel]
		div	.minutes							[XPO.id=XPO.minutes]
		div		[XPO.id=XPO.controls] .inline
			button	[XPO.id=XPO.notset]		[XPO.i18n=XPO.notset]		.rect
			button	[XPO.id=XPO.yesterday]	[XPO.i18n=XPO.yesterday]	.rect
			button	[XPO.id=XPO.today]		[XPO.i18n=XPO.today]		.rect
			button	[XPO.id=XPO.tomorrow]	[XPO.i18n=XPO.tomorrow]		.rect
		button	[XPO.id=XPO.okay]		[XPO.i18n=XPO.okay]			.rect .end

	div #dimmerscreen @hidden
	
	div #loading
		span
		span
			img @src(/icon.png) .logo
		span #loadingmsg 'Loading...'
		span #loadingsubmsg .subtext
		button #appreload .round
			svg
				use @xlink:href(#XPO.iconreload)
		

	div #spinner @hidden
		div
		div
	
	div #menuui .sidebar
	button .round #menuuitoggle .noprint
		svg
			use @xlink:href(#XPO.iconmenu)	[XPO.id=XPO.icon]
	
	div #notifui @hidden .onecolumn .popup .nosections
		div #notifuisink

	div .toolbar .downonkeyboard #appcontrolsui
		div .group [XPO.id=XPO.screen] .form
			button .round .send	 [XPO.id=XPO.fullscreen]	[XPO.form=XPO.nasheet]
				svg
					use @xlink:href(#XPO.iconfullscreen)
			button .round .send [XPO.id=XPO.fullscreenoff]	[XPO.form=XPO.nasheet] @hidden
				svg
					use @xlink:href(#XPO.iconfullscreenoff)
		div .group [XPO.id=XPO.nasheet] @hidden .form
			button	.round	.send	[XPO.id=XPO.play]		[XPO.form=XPO.nasheet]
				svg
					use @xlink:href(#XPO.iconplay)
			button	.round	.send	[XPO.id=XPO.pause]		[XPO.form=XPO.nasheet]
				svg
					use @xlink:href(#XPO.iconpause)
			button	.round	.send	[XPO.id=XPO.prev]		[XPO.form=XPO.nasheet]
				svg
					use @xlink:href(#XPO.iconcardback)
			button	.round	.send	[XPO.id=XPO.next]		[XPO.form=XPO.nasheet]
				svg
					use @xlink:href(#XPO.iconcardnext)
		div .group [XPO.id=XPO.navigation] @hidden
			button #btnsettings
				span .shortcut .ctrl [XPO.i18n=XPO.Sctrli]
				svg
					use @xlink:href(#XPO.iconsettings)
			div .searchbar #fldsearchp
				input #fldsearch [XPO.i18n=XPO.search]
				button #fldclose
					svg
						use @xlink:href(#XPO.iconclose)
			button #btnreload
				span .shortcut .ctrl [XPO.i18n=XPO.Sctrlr]
				svg
					use @xlink:href(#XPO.iconreload)
				span .caption [XPO.i18n=XPO.reload]
			button #btnsearch
				span .shortcut .ctrl [XPO.i18n=XPO.Sctrle]
				svg
					use @xlink:href(#XPO.iconsearch)
				span .caption [XPO.i18n=XPO.search]
			button #btnnotif
				span .shortcut .ctrl [XPO.i18n=XPO.Sctrlm]
				span .bubble @hidden
				svg
					use @xlink:href(#XPO.iconnotif)
			button #btnpages
				svg
					use @xlink:href(#XPO.iconpages)
			button #btnblog
				svg
					use @xlink:href(#XPO.iconblog)
			button #btnprofile
				span .photo		[XPO.id=XPO.photo]	@hidden
				svg				[XPO.id=XPO.icon]
					use @xlink:href(#XPO.iconprofile)
				span .name		[XPO.id=XPO.name]	@hidden
		div .group [XPO.id=XPO.main]
			button #btnback
				svg
					use @xlink:href(#XPO.iconback)
			button #btnhome
				svg
					use @xlink:href(#XPO.icondashboard)
			button #btnmenu
				span .shortcut .alt [XPO.i18n=XPO.Salthome]
				img .icon @src(/icon.png)
