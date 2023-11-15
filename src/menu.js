;(function(){
	'use strict';
	var tileslist = [],
		lvblog, lvpages;
	
	var updatedashboard = function (list) {
		list = list || LV.dashboard;
		// recheck
		var rc = function (id) {
			if (id && !list.adapter.get(id)) return 0;
			if (list == LV.dashboard && dom.mainview == 'XPO.homeui') return 0;
			if (list == LV.home && dom.mainview == 'XPO.adminui') return 0;
			return 1;
		};
		
		if (appui.signedin) {
			helpers.delayedexec('XPO.getdashboard', function () {
				if (list.adapter.get('people'))
					LV.people.getall({}, function (ignore, options) {
						rc('people') && list.set(
							{ XPO.uid: 'people',		XPO.section: 'profiles',	XPO.count: options.count	}
						);
					});
				if (list.adapter.get('posts'))
					LV.posts.getall({}, function (ignore, options) {
						rc('posts') && list.set(
							{ XPO.uid: 'posts',		XPO.section: 'profiles',	XPO.count: options.count	}
						);
					});
				if (list.adapter.get('apps'))
					LV.apps.getall({}, function (ignore, options) {
						rc('apps') && list.set(
							{ XPO.uid: 'apps',			XPO.section: 'app',	XPO.count: options.count	}
						);
					});
				if (list.adapter.get('languages'))
					LV.languages.getall({}, function (ignore, options) {
						rc('languages') && list.set(
							{ XPO.uid: 'languages',		XPO.section: 'administration',	XPO.count: options.count	}
						);
					});
				/*if (list.adapter.get('translations'))
					LV.translations.getall({}, function (ignore, options) {
						rc('translations') && list.set(
							{ XPO.uid: 'translations',		XPO.section: 'administration',	XPO.count: options.count	}
						);
					});*/
				//-admin
				if (list.adapter.get('profilephotos'))
				if (helpers.hasperm( 'XPO.Psetprofilephotoothers' )) {
					almudeer.profilephotoslistview.getall(false, function (ignore, options) {
						rc('profilephotos') && list.set(
							{ XPO.uid: 'profilephotos',	XPO.i18n: 'XPO.profilephotos',	XPO.section: 'administration',	XPO.icon: '#XPO.iconphoto',
							  XPO.count: options.count,	XPO.dot: options.count }
						);
					});
				}
				if (list.adapter.get('media'))
					LV.media.getall({}, function (ignore, options) {
						rc('media') && list.set(
							{ XPO.uid: 'media',			XPO.section: 'administration',	XPO.count: options.count	}
						);
					});

				if (list.adapter.get('pages'))
					LV.pages.getall({}, function (ignore, options) {
						rc('pages') && list.set(
							{ XPO.uid: 'pages',			XPO.section: 'content',	XPO.count: options.count	}
						);
					});
				if (list.adapter.get('blog'))
					LV.articles.getall({}, function (ignore, options) {
						rc('blog') && list.set(
							{ XPO.uid: 'blog',			XPO.section: 'content',	XPO.count: options.count	}
						);
					});
				if (list.adapter.get('contactus'))
					LV.contactus.getall({}, function (items, options) {
						var count = 0;
						if (helpers.hasperm( 'XPO.Psetconfig' ))
							items.each(function (item) {
								if (item.XPO.status === 0) ++count;
							});
						rc('contactus') && list.set(
							{ XPO.uid: 'contactus', XPO.section: 'content', XPO.count: count, XPO.dot: count }
						);
					});
			}, 250);
		}
	};

	var tileclicked = function (tile) {
		if (!['home'].includes(tile.XPO.uid)) {
			var remembered = preferences.get(110, 1) || {};
			if (!remembered[tile.XPO.uid]) remembered[tile.XPO.uid] = 0;
			++remembered[tile.XPO.uid];
			preferences.set(110, JSON.stringify(remembered));
		}
	};

	menu = {
		mainview: function (crumbs) {
			var homeview = preferences.get(120, 1);
			if ([null, -1].includes(homeview))
				homeview = config(120);

			if (homeview == 1)
				crumbs[0] = 'dashboard';
			if (homeview == 2)
				crumbs[0] = 'pages',
				crumbs[1] = 'home';
			if (homeview == 3)
				crumbs[0] = 'blog';
			if (homeview == 4)
				crumbs[0] = 'pages';
			if (homeview == 5)
				crumbs[0] = 'messages';
			if (homeview == 6)
				crumbs[0] = 'apps';
			if (homeview == 7)
				crumbs[0] = 'nearby';
			if (homeview == 8)
				crumbs[0] = 'qamoos';
			if (homeview == 9)
				crumbs[0] = 'umoor';
			if (homeview == 2100)
				crumbs[0] = 'shop';
			
			return crumbs;
		},
		setlist: function () {
			var keys = dom.getformkeys( XPO.homeui );
			var sitename = preferences.get('40');
			if (sitename) keys.XPO.sitename.innerText = sitename;

			LV.home.clear();
			var newtiles = $.array(),
				ordered = [],
				byuid = $.array();

			tileslist.forEach(function (tile) {
				if (!['home'].includes(tile.XPO.uid)) {
					tile.XPO.section = undefined;
					byuid.set(tile.XPO.uid, tile);
				}
			});
			var remembered = preferences.get(110, 1) || {};
			for (var i in remembered) {
				ordered.push([remembered[i], i]);
			}
			ordered = ordered.sort(function (a, b) {
				return b[0]-a[0];
			});
			ordered.slice(0, 9).forEach(function (order) {
				var item = byuid.get( order[1] );
				if (item) {
					item.XPO.order = order[0];
					newtiles.set(item.XPO.uid, item);
				}
			});
			LV.home.setall( newtiles, false );
			LV.pages.get('home', function (list, res) {
				helpers.XPO.nishaaturi = '/&home';

				var deflang = preferences.get(25);

				var title = localize(res.XPO.title || '');
				title = title.sections[deflang] || title.tosource(1) || '';

				keys.XPO.headline.innerText = title;

				var localized = localize(res.XPO.content || '');
				var sourcemd = localized.sections[deflang] || localized.tosource(1) || '';
				sourcemd = sourcemd.trim();

				var intro = markdown.getintro(sourcemd, 0, 'XPO.paragraph');
				keys.XPO.intro.innerHTML = markdown.render( intro );
				
				var photo = markdown.getintro(sourcemd, 0, 'XPO.photo');
				if (photo)
					keys.XPO.headerphoto.style.backgroundImage = 'url('+photo+')';
				else
					keys.XPO.headerphoto.style.backgroundImage = '';
				
				var parts = markdown.toparts(sourcemd), firstfew = [];
				parts.toNative().reverse().forEach(function (part) {
					if (['XPO.paragraph'].includes(part.XPO.type))
						firstfew.push(part);
				});
				sourcemd = markdown.tosource(firstfew.slice(0, 4));
				
				keys.XPO.body.innerHTML = markdown.render( sourcemd, 1, 1 );
				
				keys.XPO.body.querySelectorAll('.XPO.link').forEach(function (link) {
					if ( link.href.startsWith( location.origin ) )
						link.onclick = function (e) {
							if (!e.ctrlKey) {
								appui.get(this.href);
								e.preventDefault();
							}
						};
				});
			});
			offline.getall(LV.pages.store, 0, function (objects) {
				keys.XPO.sectpages.hidden = 1;
				lvpages.clear();
				if (objects.length) {
					var pages = [];
					objects.each(function (obj) {
						if (obj.XPO.status === 2)
							pages.push(obj);
					});
					lvpages.setall($.array(pages));
					if (pages.length) keys.XPO.sectpages.hidden = 0;
				}
			});
			offline.getall(LV.articles.store, 0, function (objects) {
				keys.XPO.sectblog.hidden = 1;
				lvblog.clear();
				if (objects.length) {
					var blog = [];
					objects.each(function (obj) {
						if (obj.XPO.status === 2)
							blog.push(obj);
					});
					lvblog.setall($.array(blog));
					if (blog.length) keys.XPO.sectblog.hidden = 0;
				}
			});

		},
		setclone: function (o) {
			var keys = o._keys,
				type = o.type,
				clone = o.dom,
				rawitem = o.rawitem,
				list = o.list;

			if ( 'XPO.tile' === type ) {
				if (keys.title && rawitem.XPO.i18n)
					keys.title.dataset.XPO.i18n = rawitem.XPO.i18n;
				
				if (rawitem.XPO.dot)
					keys.XPO.dot.hidden = 0;
				else
					keys.XPO.dot.hidden = 1;

				if (rawitem.XPO.icon) {
					keys.XPO.iconparent.hidden = 0;
					keys.XPO.icon.setAttribute('xlink:href', rawitem.XPO.icon);
				}
				
				if (rawitem.XPO.icon === 0)
					keys.XPO.iconparent.hidden = 1;

				if (rawitem.XPO.count) {
					keys.XPO.count.innerText = rawitem.XPO.count;
				}

//				keys.XPO.status.innerText = '';

				keys.XPO.next.onclick = function (e) {
					if (rawitem.XPO.uid === 'logout') {
						dom.setdialog({
							title: helpers.translate('XPO.logout'),
							body: helpers.translate('XPO.confirmdetail'),
							uri: rawitem.XPO.uid,
						}, function () {
							appui.logout();
						});
					} else {
						list.rememberitem(rawitem.XPO.uid);
						tileclicked(rawitem);
						
						var geturi = rawitem.XPO.uid+'/';
						
						if (rawitem.XPO.alias) {
							var crumbs = appui.crumbify();
							if (crumbs.length == 1)
								geturi = crumbs[0] +'/'+ rawitem.XPO.alias;
							if (crumbs.length == 2)
								geturi = crumbs[0] +'/'+ crumbs[1] +'/'+ rawitem.XPO.alias;
						}
						
						if (rawitem.XPO.section === 'XPO.more') {
							geturi = rawitem.XPO.alias;
						}
						
						if (rawitem.XPO.uid === 'home')
							geturi = 'pages/home';
						
						if (document.body.dataset.XPO.animate) {
							var width = this.offsetWidth	/ 2,
								height = this.offsetHeight	/ 2,
								h = 'XPO.end', v = 'XPO.bottom';
							
							if (e.offsetX > width-15 && e.offsetX < width+15) h = '';
							else if (e.offsetX < width) h = 'XPO.start';
							
							if (e.offsetY > height-15 && e.offsetY < height+15) v = '';
							if (e.offsetY < height) v = 'XPO.top';
							
							clone.dataset.XPO.h = h;
							clone.dataset.XPO.v = v;

							clone.className = 'XPO.item XPO.tile XPO.ani';

							setTimeout(function () {
								clone.className = 'XPO.item XPO.tile';
								appui.get('/'+geturi);
							}, 400);
						} else
							appui.get('/'+geturi);
					}
				};
			}
		},
		setupdynamicparts: function () {
			LV.dashboard.clear();

			var keys = dom.getformkeys( XPO.sessionform );
			keys.XPO.hidepassword.ontoggle = function (ignore, on) {
				if (on)
					keys.XPO.pass.type = 'password';
				else
					keys.XPO.pass.type = '';
			};

			var sitename = preferences.get('40');
			if (sitename) {
//				var adminuikeys = dom.getformkeys( XPO.adminui );
//				adminuikeys.XPO.sitename.innerText = sitename;
//				delete adminuikeys.XPO.sitename.dataset.XPO.i18n;
				XPO.globalname.innerText = sitename;
			}
			
			tileslist = [];
			if (appui.signedin) {
				tileslist = tileslist.concat([
//					{ XPO.uid: 'messages',			XPO.i18n: 'XPO.messages',		XPO.section: 'content',	XPO.icon: '#XPO.iconmessages'	},
				]);
			}
			tileslist = tileslist.concat([
				{ XPO.uid: 'contactus',		XPO.i18n: 'XPO.contactus',	XPO.section: 'app',	XPO.icon: '#XPO.iconmessages'			},
				{ XPO.uid: 'heartbeat',		XPO.i18n: 'XPO.heartbeat',	XPO.section: 'app',	XPO.icon: '#XPO.iconheart'				},
//				{ XPO.uid: 'backups',	XPO.i18n: 'XPO.backups',	XPO.section: 'administration'	},
//				{ XPO.uid: 'books',			XPO.i18n: 'XPO.books',		XPO.section: 'content',			XPO.icon: '#XPO.iconsubjects'},
				{ XPO.uid: 'pages',			XPO.i18n: 'XPO.pages',		XPO.section: 'content',			XPO.icon: '#XPO.iconpages'	},
				{ XPO.uid: 'blog',			XPO.i18n: 'XPO.blog',		XPO.section: 'content',			XPO.icon: '#XPO.iconblog'	},
				{ XPO.uid: 'home',			XPO.i18n: 'XPO.home',		XPO.section: 'content',			XPO.icon: '#XPO.iconhome'	},
			]);

			// only on Main, Central
			if ( !preferences.get(30, 1) ) {
				tileslist = tileslist.concat([
					{ XPO.uid: 'languages',		XPO.i18n: 'XPO.languages',		XPO.section: 'administration',	XPO.icon: '#XPO.icontranslations'	},
					{ XPO.uid: 'translations',	XPO.i18n: 'XPO.translations',	XPO.section: 'administration',	XPO.icon: '#XPO.icontranslations'	},
					{ XPO.uid: 'apps',			XPO.i18n: 'XPO.apps',			XPO.section: 'administration',	XPO.icon: '#XPO.iconapps'			},
				]);
				if (helpers.hasperm( 'XPO.Psetconfig' )) {
					tileslist = tileslist.concat([
						// edit+approve profile photos
						/*{ XPO.uid: 'idscanner',		XPO.i18n: 'XPO.idscanner',		XPO.section: 'administration',	XPO.icon: '#XPO.iconcamon'			},*/
						{ XPO.uid: 'billing',		XPO.i18n: 'XPO.billing',		XPO.section: 'app'			,	XPO.icon: '#XPO.iconmoney'			},
					]);
				}
			}

			if (appui.signedin) {
				tileslist = tileslist.concat([
					{ XPO.uid: 'people',		XPO.i18n: 'XPO.people',			XPO.section: 'profiles',	XPO.icon: '#XPO.iconprofile'		},

//					{ XPO.uid: 'config',		XPO.i18n: 'XPO.config',			XPO.section: 'app'm			XPO.icon: '#XPO.iconsettings'		},
					
					/*{ XPO.uid: 'haasib',		XPO.i18n: 'XPO.haasib',			XPO.section: 'administration'	,	XPO.icon: '#XPO.iconadd'	},*/

					// edit+approve parent+child connections
					/*{ XPO.uid: 'jobapplicants',	XPO.i18n: 'XPO.jobapplicants',	XPO.section: 'administration',	XPO.icon: '#XPO.icongroupadd'		},
					{ XPO.uid: 'payouts',		XPO.i18n: 'XPO.payouts',		XPO.section: 'administration',	XPO.icon: '#XPO.iconmoney'			},*/

					{ XPO.uid: 'posts',			XPO.i18n: 'XPO.posts',		XPO.section: 'profiles',	XPO.icon: '#XPO.icongroupadd'	},

					{ XPO.uid: 'editprofile',	XPO.i18n: 'XPO.editprofile',	XPO.section: 'profiles',	XPO.icon: '#XPO.iconedit'	},
					{ XPO.uid: 'logout',		XPO.i18n: 'XPO.logout',			XPO.section: 'profiles',	XPO.icon: '#XPO.iconlogout'	},

					{ XPO.uid: 'media',			XPO.i18n: 'XPO.media',			XPO.section: 'administration',	XPO.icon: '#XPO.iconphoto'		},
//					{ XPO.uid: 'templates',		XPO.i18n: 'XPO.templates',		XPO.section: 'content'			},
				]);
					
				if ( config(900) )
					tileslist = tileslist.concat([
						{ XPO.uid: 'nearby',		XPO.i18n: 'XPO.nearby',		XPO.section: 'profiles',	XPO.icon: '#XPO.icondashboard'	},
					]);

				if ( config(1000) )
					tileslist = tileslist.concat([
						{ XPO.uid: 'qamoos',		XPO.i18n: 'XPO.qamoos',			XPO.section: 'app',				XPO.icon: '#XPO.iconclasses'		},
					]);

				if ( config(1100) )
					tileslist = tileslist.concat([
						{ XPO.uid: 'umoor',			XPO.i18n: 'XPO.umoor',			XPO.section: 'app',				XPO.icon: '#XPO.iconchecked'		},
					]);
					
				if ( config(2100) )
					tileslist = tileslist.concat([
						{ XPO.uid: 'shop',			XPO.i18n: 'XPO.shop',		XPO.section: 'administration',	XPO.icon: '#XPO.iconshop'	},
						{ XPO.uid: 'invoices',		XPO.i18n: 'XPO.invoices',		XPO.section: 'app',			XPO.icon: '#XPO.iconmoney'			},
					]);

				if (helpers.hasperm( 'XPO.Psetprofilephotoothers' )) {
					tileslist = tileslist.concat([
						// edit+approve profile photos
						{ XPO.uid: 'profilephotos',	XPO.i18n: 'XPO.profilephotos',	XPO.section: 'administration',	XPO.icon: '#XPO.iconphoto'		},
					]);
				}
			} else {
				tileslist = tileslist.concat([
					{ XPO.uid: 'login',			XPO.i18n: 'XPO.loginjoin',			XPO.section: 'profiles',	XPO.icon: '#XPO.iconadd'	},
				]);
			}
			
			var sections = [];
			sections = sections.concat([
				{XPO.uid: 'app',				XPO.i18n: 'XPO.app'				},
			]);
			if (appui.signedin) {
				sections = sections.concat([
					{XPO.uid: 'administration',	XPO.i18n: 'XPO.administration'	},
				]);
			}
			sections = sections.concat([
				{XPO.uid: 'profiles',			XPO.i18n: 'XPO.profiles'/*, XPO.horizontal: 1*/},
				{XPO.uid: 'content',			XPO.i18n: 'XPO.content'	},
			]);
			LV.dashboard.setsections( sections );

			LV.dashboard.setall( $.array(tileslist), false );
		},
		state: 0,
		setuplistviews: function () {
			LV.menu = listview(XPO.menuui, tmpl.XPO.button, {limit: false});

			var keys = dom.getformkeys( XPO.homeui );

			LV.home = listview(keys.XPO.dashboard, tmpl.XPO.tile, {limit: false});
			LV.home.orderby = 'XPO.order';
			lvpages = listview(keys.XPO.pages, tmpl.XPO.pageitem, {limit: false, allowsearch: 0});
			lvblog = listview(keys.XPO.blog, tmpl.XPO.articleitem, {limit: false, allowsearch: 0});
		},
		items: $.array(),
		build: function () {
			var sections = [
				{XPO.uid: 'basics',		XPO.i18n: 'XPO.basics', XPO.classnames: 'XPO.menubasics'	},
				{XPO.uid: 'pinned',		XPO.i18n: 'XPO.pinned'										},
			];
			
			LV.menu.clear();
			LV.menu.setsections(sections);
			var list = [];
			
			if (appui.signedin) {
				list.push( { XPO.uid: 'posts',			XPO.i18n: 'XPO.posts',		XPO.section: 'pinned',	XPO.icon: 'XPO.icongroupadd'		} );

				if ( !preferences.get(30, 1) ) {
					list.push( { XPO.uid: 'languages',		XPO.i18n: 'XPO.languages',	XPO.section: 'pinned',	XPO.icon: 'XPO.icontranslations'	} );
					list.push( { XPO.uid: 'translations',	XPO.i18n: 'XPO.translations',XPO.section: 'pinned',	XPO.icon: 'XPO.icontranslations'	} );
				}
			}

			list.push( { XPO.uid: 'blog',			XPO.i18n: 'XPO.blog',		XPO.section: 'basics',	XPO.icon: 'XPO.iconblog'		} );
			list.push( { XPO.uid: 'pages',			XPO.i18n: 'XPO.pages',		XPO.section: 'basics',	XPO.icon: 'XPO.iconpages'		} );
			list.push( { XPO.uid: 'dashboard',		XPO.i18n: 'XPO.dashboard',	XPO.section: 'basics',	XPO.icon: 'XPO.icondashboard'	} );
			list.push( { XPO.uid: 'home',			XPO.i18n: 'XPO.home',		XPO.section: 'basics',	XPO.icon: 'XPO.iconhome'		} );

			var menuitemslist = $.array( list.concat( menu.items.toNative() ) );
			LV.menu.adapter.setall('XPO.uid', menuitemslist);
		},
		additem: function (obj) {
			menu.items.set(obj.XPO.uid, obj);
			menu.build();
		},
		setmenu: function (hide) {
			var keys = dom.getformkeys(XPO.menuuitoggle);
			if (hide) {
				preferences.set(5, 1);
				if (window.innerWidth >= 919)
					keys.XPO.icon.setAttribute('xlink:href', '#XPO.iconcardnext');
				delete document.body.dataset.XPO.hidemenu;
			} else {
				preferences.pop(5);
				keys.XPO.icon.setAttribute('xlink:href', '#XPO.iconmenu');
				document.body.dataset.XPO.hidemenu = 1;
			}
		},
		init: function () {
			Hooks.set('XPO.appuiget',		'XPO.menu',	function (crumbs) {
				var yes;

				var homeview = preferences.get(120, 1);
				if ( ['', 'index.html'].includes(crumbs[0]) ) {
					crumbs = menu.mainview(crumbs);

					XPO.btnback.disabled = 1;
				}

				switch (crumbs[0]) {
					/* TODO
					 * add a way to support 'ur' lang codes on the homepage :)
					 * */
					case 'index.html':
					case '':
						appui.settitle( helpers.translate('XPO.home') );
						menu.setlist();
						updatedashboard(LV.home);
						Hooks.run('XPO.appuiopenview', 'XPO.homeui');
						yes = 1;
						break;
					case 'dashboard':
						if (homeview == 1)
							XPO.btnback.disabled = 1;
							
						menu.setupdynamicparts();
						updatedashboard();
						appui.settitle( helpers.translate('XPO.dashboard') );
						Hooks.run('XPO.appuiopenview', 'XPO.adminui');
						yes = 1;
						break;
					case 'menu':
						appui.settitle( helpers.translate('XPO.menu') );
						/*
						 * the new way to manage custom widget states is to let
						 * their modules handle it, appui can also get & set it
						 * 
						 * but prefer to let the module listen on the pop event
						 * and just react by itself
						 * */
						appui.setmenu(menu.state);

						menu.state = !menu.state;
						yes = 1;
						break;
				}
				
				if (yes)
					return {
						doscroll: 0
					};
			});
		}
	};
	Hooks.set('XPO.domsetup', 'XPO.menu', function (id) {
		var hidemenu = preferences.get(5);
		menu.setmenu(hidemenu);
		XPO.menuuitoggle.onclick = function () {
			if (window.innerWidth <= 919)
				backstack.pushstate(0, 1),
				document.body.dataset.XPO.showmenu = 1,
				XPO.dimmerscreen.hidden = 0;
			else
				menu.setmenu( document.body.dataset.XPO.hidemenu );
		};
		menu.setuplistviews();
		menu.build();
		menu.init();
	});
	Hooks.set('XPO.appuisessionchange', 'XPO.menu', function (signedin) {
		menu.build();
	});
	Hooks.set('XPO.domsetclone', 'XPO.menu', function (options) {
		menu.setclone(options);
	});
	Hooks.set('XPO.domformdata', 'XPO.menu', function (data) {
		var button = data.button.dataset.XPO.id,
			keys;
		
		switch (data.form.id) {
			case 'XPO.homeui':
				switch (button) {
					case 'XPO.gotocontactus':
						appui.get('contactus');
						break;
					case 'XPO.gotodashboard':
						appui.get('dashboard');
						break;
					case 'XPO.gotopages':
						appui.get('pages');
						break;
					case 'XPO.gotoblog':
						appui.get('blog');
						break;
					case 'XPO.gotohome':
						appui.get('pages/home');
						break;
				}
				break;
		}
	});
	
})();
