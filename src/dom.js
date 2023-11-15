;(function(){
	'use strict';
	hideall = function () {
		for (var i in arguments) {
			arguments[i].hidden = true;
		}
	};
	showall = function () {
		for (var i in arguments) {
			arguments[i].hidden = false;
		}
	};
	isempty = function (value) {
		if (typeof value === 'string' || typeof value === 'number') return false;
		return true;
	};

	var bodystyle = document.body.style;
	
	ruid = function () {
		var ruid = parseInt( preferences.get(3) || -1 );
		preferences.set(3, ruid - 1);
		return (ruid - 1);
	};
	
	var idleto;
	var autohidecursor = function () {
		delete document.body.dataset.XPO.idle;
		clearTimeout(idleto);
		idleto = setTimeout(function () {
			document.body.dataset.XPO.idle = 1;
		}, 3000);
	};

	tmpl = {};
	
	var hidereload = 1;
	var applyshowreload = function (show) {
		hidereload = !show;
		XPO.btnreload.hidden = !show;
	};

	var isfullscreen = function () {
		return window.matchMedia('(display-mode: fullscreen)').matches;
	};
	
	dom = {
		setdialog: function (options, yes, no) {
			if (options === false) {
				hideall(XPO.dialogui, XPO.dimmerscreen);
				// compensates for mediaui
				if (XPO.mediaui.hidden) {
					bodystyle.overflowY = '';
				}
			} else {
				if (options === true)
					options = {};
				else
					options = options || {};

				if (options.uri)
					backstack.pushstate(options.uri, 1);
				else
					backstack.pushstate(0, 1);

				bodystyle.overflowY = 'hidden';
				showall(XPO.dialogui, XPO.dimmerscreen);
				XPO.dialogui.children[0].innerText = options.title || helpers.translate('XPO.deleteconfirmtitle');
				XPO.dialogui.children[1].innerText = options.body || helpers.translate('XPO.deleteconfirmdetail');
				XPO.dialoguiyes.onclick = function () {
					typeof yes === 'function' && yes(options);
					dom.setdialog(false);
					backstack.back();
				};
				XPO.dialoguino.onclick = function () {
					typeof no === 'function' && no(options);
					dom.setdialog(false);
					backstack.back();
				};
			}
		},
		setloading: function (textalias, subtext, reloadable) {
//			$.log.s( 'setloading', textalias, subtext, reloadable );
			if (textalias) {
				XPO.loadingmsg.dataset.XPO.i18n = textalias;
				XPO.loading.hidden = 0;
				bodystyle.overflowY = 'hidden';
			} else {
				delete XPO.loadingmsg.dataset.XPO.i18n;
				XPO.loading.hidden = 1;
				bodystyle.overflowY = '';
			}
			
			if (subtext)
				XPO.loadingsubmsg.innerText = subtext;
			else
				XPO.loadingsubmsg.innerText = '';
				
			helpers.updatei18n(XPO.loading);
			
			// only hides on 0 or false
			if ([0, false].includes(reloadable))
				XPO.appreload.hidden = 1;
			else
				XPO.appreload.hidden = 0;
				
		},
		screentapped: function (e) {
			Hooks.run('XPO.domscreentapped', e);
		},
		searchopen: function (e) {
			/* TODO FIX BUG
			 * when at home, the back button is disabled
			 * but on phones, the back button is needed in search mode to close
			 * figure out a way to temporarily enable it
			 * */
			
			if (!hidereload)
				hideall(XPO.btnreload);

			if (window.innerWidth <= 960 || isfullscreen()) {
				hideall(XPO.btnmenu, XPO.btnsettings, XPO.btnsearch, XPO.btnprofile, XPO.btnnotif);
				XPO.fldsearchp.dataset.XPO.show = 1;
			}

			XPO.fldsearch.focus();
		},
		searchclose: function (e) {
			if (!hidereload)
				showall(XPO.btnreload);

			showall(XPO.btnmenu, XPO.btnsettings, XPO.btnsearch, XPO.btnprofile, XPO.btnnotif);
			delete XPO.fldsearchp.dataset.XPO.show;
		},
		setnotifybar: function (text, date) {
			dom.quicktip(text, 0, date, 1)
		},
		_quicktip: false,
		quicktip: function (text, time, date, type) {
			if (type) {
				XPO.notifybar.hidden = !text;
				if (text) {
					XPO.notifybar.firstElementChild.innerText = text + ' ';
					XPO.notifybar.lastElementChild.dataset.XPO.datetime = date;
				}
				helpers.updatedates();
			} else {
				clearTimeout(dom._quicktip);

				text = text || '';
				time = time || 3000;
				XPO.notifybar.style.opacity = '0';

				XPO.quicktip.hidden = 0;
				
				dom._quicktip = setTimeout(function () {
					XPO.quicktip.firstElementChild.innerText = text;
					XPO.quicktip.style.opacity = '1';
					XPO.quicktip.style.transform = 'translateY(0px)';
					
					dom._quicktip = setTimeout(function () {
						XPO.notifybar.style.opacity = '';

						XPO.quicktip.style.opacity = '';
						XPO.quicktip.style.transform = '';
						dom._quicktip = setTimeout(function () {
							XPO.quicktip.hidden = 1;
						}, 250);
					}, time);
				}, 50);
			}
		},
		setspinner: function (on) {
			if (on) showall(XPO.spinner, XPO.dimmerscreen);
			else hideall(XPO.spinner, XPO.dimmerscreen);
		},
		popstate: function (e) {
			Hooks.run('XPO.dompopstate', e);
		},
		mediaclose: function (yes) {
			delete document.body.dataset.XPO.mediamode;
			delete document.body.dataset.XPO.immersive;
			
			bodystyle.overflowY = '';
			hideall(XPO.mediaui);

			yes && typeof dom.mediacallback === 'function' && dom.mediacallback( mediaselection.toNative() );
			dom.mediacallback = false;

			yes && backstack.back();

			mediaio.clearselection();
		},
		/*
		 * XPO.single = tapping any photos removes selection from any others
		 * XPO.multiple = allows selecting multiple photos across pages
		 * XPO.default = no selection allowed
		 * */
		mediacallback: false,
		mediaopen: function (mode, callback) {
			document.body.dataset.XPO.mediamode = mode;
			if (mode) LV.media.setuptabs(1);
			else LV.media.setuptabs(0);
			
			dom.mediacallback = callback || false;
			if (callback) {
				backstack.pushstate(0, 1);
				document.body.dataset.XPO.immersive = 1;
				bodystyle.overflowY = 'hidden';
			}
			
			mediaio.clearselection();
			
			LV.media.getall();
			showall(XPO.mediaui);
		},
		contextmenu: function (e) {
//			$.log.s( e );
		},
		/*
		 * returns the listview object if any for the given XPO.type
		 * this is automated, whenever listview() is called, it caches here:
		 * an object with keys as XPO.<l v type> and the values as
		 * the actual listview object
		 * TODO
		 * move this to listview.<uri || type> or something and refactor code 
		 * */
		_typetolist: {},
		typetolist: function (type) {
			return dom._typetolist[ type ] || false;
		},
		XPO.searchablelist: {},
		_uritolist: {},
		uritolist: function (uri) {
			return dom._uritolist[ uri ] || false;
		},
		/*
		 * element required (type to clone)
		 * newparent if omitted, clone is returned, else append(?)
		 * options, object
		 * rawitem, optional
		 * */
		getclone: function (element, newparent, options, rawitem) {
//			$.log.s( 'getclone', element, newparent, options );

			if (!(element instanceof HTMLElement)) return false;

			// support for (element, options, rawitem)
			if (!(newparent instanceof HTMLElement)) {
				rawitem = options;
				options = newparent;
				newparent = false;
			}
			
			var clone = element.cloneNode(true);
			
			/*
			 * if no options are passed then dom.setclone is just not called
			 * this allows using getclone to only clone an element under the new
			 * parent and leaves its configuration up to you
			 * */
			if (typeof options === 'object')
				dom.setclone(clone, options, rawitem);
			else
				options = {};

			if (newparent) {
				if (options.append === false) {
					newparent.insertBefore(clone, newparent.firstChild);
				} else if (options.append instanceof HTMLElement) {
					newparent.insertBefore(clone, options.append);
				} else {
					newparent.append(clone);
				}

				helpers.updatei18n(newparent);
			}
			
			return clone;
		},
		setclone: function (clone, options, rawitem) {
			options = options || {};
			
//			$.log.s( 'setclone', options.uid, options.ruid );
			dom.setupwidgets(clone);
			helpers.updatei18n(clone);
			
			var type	= clone.dataset.XPO.type,
				uri		= clone.dataset.XPO.uri,
				shorturi= 0,
				adapter	= options._adapter,
				list	= options._list,
				store	= options._store,
				keys	= dom.isoftype(clone, type),
				crumbs	= appui.crumbify();

			if (list)
				shorturi = list.XPO.shorturi;

			rawitem = rawitem || options._rawitem || {};

			// prefer id over rid, but if no id found, give it an rid
			if (options.id) clone.id = options.id;

			// no >0, these are sometimes text
			if (options.XPO.uid || options.XPO.uid === 0) clone.dataset.XPO.uid = options.XPO.uid;
			if (rawitem.XPO.uid || rawitem.XPO.uid === 0) clone.dataset.XPO.rawuid = rawitem.XPO.uid;
			
			// is one of account type
			var isaccounttype = ['XPO.personitem'].includes( type );
			
			var unarchivefn = function () {
				var uid		= rawitem.XPO.uid,
					item	= list.adapter.get(uid);
				
				if (item && uid) {
					item.XPO.uid		= uid;
					item.XPO.archived	= 0;
					item.XPO.pending	= 1;
					item.XPO.form = type;
					list.save(item, false);
					
					// force refresh
					if (list.options.temp)
						list.lastfetched = $.array();
				}
			};
			var archivefn = function () {
				var uid		= rawitem.XPO.uid,
					item	= list.adapter.get(uid);
				
				if (item && uid) {
					item.XPO.uid		= uid;
					item.XPO.archived	= 1;
					item.XPO.pending	= 1;
					item.XPO.form = type;
					list.save(item, false);
					
					// force refresh
					if (list.options.temp)
						list.lastfetched = $.array();
				}
			};
			var trashfn = function () {
				var uid		= rawitem.XPO.uid,
					item	= list.adapter.get(uid);
				
				if (item && uid) {
					dom.setdialog(true, function () {
						if ( parseInt(uid) < 0 ) {
							adapter.pop(uid);
						} else {
							item.XPO.uid		= uid;
							if (item.XPO.pending) {
								item.XPO.pop		= 2; // delete + edited
							} else {
								item.XPO.pop		= 1; // delete only
							}
							item.XPO.pending	= 1;
							item.XPO.form = type;
							list.save(item, false);
						}
						
						// force refresh
						if (list.options.temp || list.options.perm)
							list.lastfetched = $.array();
					});
				}
			};
			var undofn = function () {
				var uid		= rawitem.XPO.uid,
					item	= adapter.get(uid);
				
				if (item.XPO.pop === 2) {
					item.XPO.pending = 1;
				} else {
					item.XPO.pending = 0;
				}

				if (list.archival && !item.XPO.archived) {
					item.XPO.archived = 1; // don't unarchive
					item.XPO.pending = 0;
				}

				if (!list.archival && item.XPO.archived) {
					item.XPO.archived = 0; // don't archive
					item.XPO.pending = 0;
				}

				item.XPO.pop = 0; // don't delete
				// lets hope this doens't mess stuff up
				item.XPO.approved = undefined; // don't approve
				
				item.XPO.form = type;
				list.save(item, false);
			};
			var approvefn = function () {
				var uid		= rawitem.XPO.uid,
					item	= adapter.get(uid);
				
				if (item && uid) {
					item.XPO.uid = uid;
					item.XPO.approved = 1;
					item.XPO.pending = 1;
				
					list.save(item, true);
				}
			};
			var disapprovefn = function () {
				var uid		= rawitem.XPO.uid,
					item	= adapter.get(uid);
				
				if (item && uid) {
					item.XPO.uid = uid;
					item.XPO.approved = -1;
					item.XPO.pending = 1;
					
					list.save(item, true);
				}
			};
			var toggleeditinplace = function () {
				if (keys.XPO.editinplace.hidden) {
					keys.XPO.trash.hidden = 0;
					keys.XPO.content.hidden = 0;
					keys.XPO.editinplace.hidden = 0;
					keys.XPO.editcontent.hidden = 1;
					keys.XPO.canceledit.hidden = 1;
					keys.XPO.save.hidden = 1;
				} else {
					keys.XPO.trash.hidden = 1;
					keys.XPO.content.hidden = 1;
					keys.XPO.editinplace.hidden = 1;
					keys.XPO.editcontent.hidden = 0;
					keys.XPO.canceledit.hidden = 0;
					keys.XPO.save.hidden = 0;
				}
			};
			var saveinplace = function () {
				var uid		= rawitem.XPO.uid,
					item	= list.adapter.get(uid);
				
				if (item && uid) {
					item.XPO.uid		= uid;
					item.XPO.content	= keys.XPO.editcontent.value;
					item.XPO.pending	= 1;
					item.XPO.form		= type;
					list.save(item, false);
					
					// force refresh
					if (list.options.temp)
						list.lastfetched = $.array();
				}
			};
			
			if ( 'XPO.profileitem' === type ) {
				if (rawitem.XPO.title) keys.XPO.title.innerText = rawitem.XPO.title;
				if (rawitem.XPO.title === '')
					keys.XPO.title.innerText = '@'+rawitem.XPO.alias;
				
				if (rawitem.XPO.scanned) {
					keys.XPO.scanned.dataset.XPO.datetime = rawitem.XPO.scanned;
					if (rawitem.XPO.scanned - new Date().getTime() > -1000)
						clone.style.animation = 'fadein 0.5s ease-in';
				}

				// since this can house multiple types of profiles, we need to get to their lists
				if (rawitem.XPO.photo === 1) {
					var reflist = rawitem.XPO.reflist;
					reflist && reflist.onsetall && reflist.onsetall($.array([rawitem]), 0, 1);
				}
			}
			/*
			 * all templates that have trash, edit and undo buttons rigged here
			 * */
			if (keys && list) {
				if (!isempty(options.XPO.info)) {
					if (keys.XPO.info)
						keys.XPO.info.innerText = options.XPO.info;
				}
				if (keys.XPO.undo && keys.XPO.trash) {
					if (rawitem.XPO.pop) {
						keys.XPO.undo.hidden = 0;
						keys.XPO.trash.hidden = 1;
						if (keys.XPO.edit) keys.XPO.edit.hidden = 1;
						if (keys.XPO.editor) keys.XPO.editor.hidden = 1;
					}
					else {
						keys.XPO.undo.hidden = 1;
						keys.XPO.trash.hidden = 0;
						if (keys.XPO.edit) keys.XPO.edit.hidden = 0;
						if (keys.XPO.editor) keys.XPO.editor.hidden = 0;
					}
				}

				if (keys.XPO.edit && list) {
					keys.XPO.edit.onclick = function () {
						appui.get('editor/'+list.uriraw+'/' + rawitem.XPO.uid);
					};
				}

				if (keys.XPO.undo) keys.XPO.undo.onclick = undofn;
				if (keys.XPO.trash) keys.XPO.trash.onclick = trashfn;
			}
			if (keys && keys.XPO.halfbutton && list && list.options.allowselection && rawitem.XPO.uid > 0) {
				keys.XPO.halfbutton.oncontextmenu = function (e) {
					if (clone.dataset.XPO.selected) {
						delete clone.dataset.XPO.selected;
						list.selecteditems.pop(rawitem.XPO.uid);
					} else {
						clone.dataset.XPO.selected = 1;
						list.selecteditems.set(rawitem.XPO.uid, rawitem);
					}

					if (e) {
						list.updateselection();
						e.preventDefault();
					}
				};
				
				/*keys.XPO.halfbutton.onauxclick = function (e) {
					keys.XPO.halfbutton.oncontextmenu(e);
				};*/
				
				if (rawitem && rawitem.XPO.uid && list.selecteditems.get(rawitem.XPO.uid))
					clone.dataset.XPO.selected = 1;
				else
					delete clone.dataset.XPO.selected;
			}
			if (keys && keys.XPO.halfbutton && list && !keys.XPO.halfbutton.dataset.XPO.custom) {
				keys.XPO.halfbutton.onclick = function (e) {
					if (list.selecteditems.length) {
						keys.XPO.halfbutton.oncontextmenu(e);
					} else
					if (rawitem.XPO.uid && keys.XPO.halfbutton.dataset.XPO.edit) {
						/* TEST TODO
						 * dummy items need to be put it unsaved-store
						 * they exist only in LV adapters
						 * if rawitem is a dummy (the ruid is fake, duplicate)
						 * then give it a real ruid on click
						 * */
						if (rawitem.XPO.dummy)
							rawitem.XPO.uid = ruid();
						
						if (uri || rawitem.XPO.shorturi)
							appui.get('/editor/'+(uri || rawitem.XPO.shorturi)+'/'+rawitem.XPO.uid);

						e.preventDefault();
					} else
					if (!clone.dataset.XPO.norenderui) {
						if (shorturi)
							appui.get('/'+shorturi+( rawitem.XPO.alias||rawitem.XPO.uid ) );
						else if (uri || rawitem.XPO.shorturi)
							appui.get('/'+(uri || rawitem.XPO.shorturi)+'/'+( rawitem.XPO.alias||rawitem.XPO.uid ) );

						e.preventDefault();
					}
				};
			}
			if (keys && keys.XPO.editinplace && list && rawitem.XPO.uid > 0) {
				keys.XPO.editinplace.onclick = function () {
					toggleeditinplace();
					keys.XPO.editcontent.value = keys.XPO.content.innerText;
				};
				keys.XPO.save.onclick = function () {
					toggleeditinplace();
					saveinplace();
				};
				keys.XPO.canceledit.onclick = function () {
					toggleeditinplace();
				};
			}
			if (keys && keys.XPO.alias) {
				if (rawitem && rawitem.XPO.title === '') {
					keys.XPO.alias.hidden = 0;
				} else if (!['XPO.section', 'XPO.languageitem'].includes(type)) {
					keys.XPO.alias.hidden = 1;
				}
			}
			if (keys && keys.XPO.photo && rawitem.XPO.uid) {
				keys.XPO.photo.dataset.XPO.photo = rawitem.XPO.uid;
				keys.XPO.photo.dataset.XPO.listtype = type;
				if (rawitem.XPO.photo && rawitem.XPO.photo !== 1)
					keys.XPO.photo.style.backgroundImage = 'url(data:image/jpg;base64,'+rawitem.XPO.photo+')';

				if (keys.XPO.photoloading) {
					if (rawitem.XPO.photo === 1 && preferences.get('lowd', 1) !== 1)
						keys.XPO.photoloading.hidden = 0;
					else
						keys.XPO.photoloading.hidden = 1;
				}

				if (keys.XPO.pendingphoto) {
					if (rawitem.XPO.pendingphoto)
						keys.XPO.pendingphoto.hidden = 0;
					else
						keys.XPO.pendingphoto.hidden = 1;
				}
			}
			if ( isaccounttype && printmode ) {
				var sitename = preferences.get('40');
				if (sitename)
					keys.XPO.sitename.innerText = sitename;
				var siteaddress = preferences.get('50');
				if (siteaddress)
					keys.XPO.address.innerText = siteaddress;
				var sitephone = preferences.get('60');
				if (sitephone)
					keys.XPO.phone.innerText = sitephone;

				keys.XPO.issued.innerText = new Date().toLocaleDateString();
				keys.XPO.expires.innerText = new Date(helpers.traversebyyears( new Date().getTime(), 1 )).toLocaleDateString();
				
				if (!rawitem.XPO.class) {
					keys.XPO.classlabel.hidden = 1;
					keys.XPO.class.hidden = 1;
				}
				if (rawitem.XPO.nid && rawitem.XPO.nid.length) {
					keys.XPO.nidgroup.hidden = 0;
					keys.XPO.nid.innerText = rawitem.XPO.nid;
				}
				keys.XPO.designation.innerText = helpers.translate(list.options.singular);

				keys.XPO.webapp.innerText = location.host;
				keys.XPO.qrcode.innerText	= '';
				var qrcode = new QRCode(keys.XPO.qrcode, {
					width:	88,
					height:	88,
				});
			}
			if ( 'XPO.suggestible' == type ) {
				var selection = $.array();
				
				if (options.XPO.classes.length)
					clone.className += ' '+options.XPO.classes;

				keys.XPO.label.dataset.XPO.i18n = options.XPO.i18n || '';

				/*
				 * single mode just replaces stuff
				 * */

				var updateselection = function () {
					keys.XPO.selected.innerHTML = '';

					selection.each(function (obj) {
						var btn = dom.getclone(tmpl.XPO.button, keys.XPO.selected, {
							title: obj.XPO.title,
							ontap: function () {
								var uids = clone.value.split(' ');
								if (uids.indexOf(obj.XPO.uid+'') > -1)
									uids.splice( uids.indexOf(obj.XPO.uid+''), 1 );
								clone.value = uids.join(' ');
								selection.pop(obj.XPO.uid);
								btn.remove();
								keys.XPO.input.focus();
							},
						});
					});
				};
				var addtoselection = function (obj) {
					if (obj) {
						clone.value = clone.value || '';
						if ( !clone.value.split(' ').includes( obj.XPO.uid+'' ) ) {
							if (options.XPO.mode == 'XPO.single') {
								clone.value = ''+obj.XPO.uid;
								selection = $.array();
							} else {
								clone.value += (clone.value ? ' ' : '')+obj.XPO.uid;
							}
							selection.set(obj.XPO.uid, obj);

							updateselection();
						}
					}
				};

				clone.setvalue = function (value) {
					clone.value = ''+(value || '');
					
					// .value fetch from store and add all
					var olditems = (clone.value || '').split(' ');
					if (olditems.length) {
						if (options.XPO.type == 'allprofiles')
							profiles.getall(function (objects) {
								var newobjects = $.array();
								newobjects.setall('XPO.uid', objects);
								if (newobjects.length) {
									olditems.forEach(function (obj) {
										var item = newobjects.get(obj);
										if ( item )
											selection.set(item.XPO.uid, item);
									});
								}
								updateselection();
							});
						else
							offline.getall(options.XPO.type, 0, function (objects) {
								if (objects.length) {
									olditems.forEach(function (obj) {
										var item = objects.get(obj);
										if ( item )
											selection.set(item.XPO.uid, item);
									});
								}
								updateselection();
							});
					} else {
						selection = $.array();
						updateselection();
					}
				};
				
				var updateresults = function (objects, e) {
					keys.XPO.suggestions.innerHTML = '';
					objects.slice(0,3).forEach(function (obj) {
						dom.getclone(tmpl.XPO.button, keys.XPO.suggestions, {
							title: obj.XPO.title,
							ontap: function () {
								addtoselection( obj );
								keys.XPO.input.focus();
							},
						});
					});
					if (objects.length && e.key.toLowerCase() === 'enter') {
						addtoselection( objects[0] );
					}
				};
				
				keys.XPO.input.onkeyup = function (e) {
					var text = this.value.trim().toLowerCase();
					if (text.length > 1) {
						helpers.delayedexec('XPO.suggestible', function () {
							if (options.XPO.type == 'allprofiles')
								profiles.getall(function (objects) {
									updateresults(objects, e);
								}, {
									XPO.alias$i: text,
									XPO.title$i: text,
								});
							else {
								var list = dom._typetolist[ options.XPO.type ];
								list && list.wetsearch(text, function (objects) {
									updateresults(objects, e);
								}, 0);
							}
						}, 300);
					} else {
						keys.XPO.suggestions.innerHTML = '';
					}
				};
			}
			if ( 'XPO.filterday' == type ) {
				if (typeof options.perms === 'string')
					keys.XPO.save.className =
					keys.XPO.edit.className =
					keys.XPO.close.className = 'XPO.round '+options.perms;
				
				keys.XPO.edit.onclick = function () {
					typeof options.onediting === 'function' && options.onediting();

					keys.XPO.edit.hidden = 1;

					keys.XPO.close.hidden = 0;
					keys.XPO.save.hidden = 0;
				};
				keys.XPO.close.onclick = function () {
					typeof options.onclosed === 'function' && options.onclosed();

					keys.XPO.edit.hidden = 0;

					keys.XPO.close.hidden = 1;
					keys.XPO.save.hidden = 1;
				};
				keys.XPO.save.onclick = function () {
					typeof options.onsaved === 'function' && options.onsaved();
					
					keys.XPO.edit.hidden = 0;

					keys.XPO.close.hidden = 1;
					keys.XPO.save.hidden = 1;
				};
			}
			if ( 'XPO.select' == type ) {
				if (options.XPO.options && options.XPO.options.each) {
					options.XPO.options.each(function (option) {
						dom.getclone(tmpl.XPO.option, clone, {
							XPO.i18n: option.XPO.i18n,
							title: option.XPO.title,
							value: option.XPO.uid,
						});
					});
					
					clone.onchanges = function () {
						if (typeof options.XPO.onchanges === 'function') options.XPO.onchanges(this.value);
					};
				}
			}
			if ( 'XPO.option' == type ) {
				if (!isempty(options.XPO.i18n)) {
					clone.dataset.XPO.i18n = options.XPO.i18n;
				}
				if (!isempty(options.title)) {
					clone.innerText = options.title;
				}
				if (!isempty(options.value)) {
					clone.value = options.value;
				}
				if (!isempty(options.alias)) {
					clone.dataset.XPO.alias = options.alias;
				}
			}
			if ( isaccounttype || ['XPO.tile', 'XPO.siteitem', 'XPO.pageitem', 'XPO.articleitem'].includes( type ) ) {
				if (!isempty(options.XPO.title)) {
					keys.XPO.title.hidden = 0;
					keys.XPO.title.innerText = options.XPO.title;
				} else if (rawitem.XPO.i18n) {
					keys.XPO.title.dataset.XPO.i18n = rawitem.XPO.i18n;
				} else {
					delete keys.XPO.title.dataset.XPO.i18n;
				}
				if (rawitem.XPO.title === 0) {
					keys.XPO.title.innerText = '';
					keys.XPO.title.hidden = 1;
				}

				if (isaccounttype) {
					if (rawitem.XPO.title === '')
						keys.XPO.title.innerText = '@'+rawitem.XPO.alias;

					if (rawitem.XPO.status === 0) {
						keys.XPO.nologin.hidden = 1;

						if (rawitem.XPO.needspass)
							keys.XPO.needspass.hidden = 0;
						else
							keys.XPO.needspass.hidden = 1;
					}
					if (rawitem.XPO.status === 1) {
						keys.XPO.nologin.hidden = 0;
						keys.XPO.needspass.hidden = 1;
					}

					if (keys.XPO.resetpass)
						keys.XPO.resetpass.setvalue( rawitem.XPO.resetpass );
				}
				if (keys.XPO.permsgroup) {
					var perms = rawitem.XPO.perms || [];
					var permkeys = keys.XPO.permsgroup.children || [];
					for (var elt in permkeys) {
						if (permkeys.hasOwnProperty(elt)) {
							var perm = permkeys[elt];
							var permid = perm.dataset.XPO.id;
							perm.setvalue(perms.includes(permid));
						}
					}
				}
			}
			if ( 'XPO.siteitem' == type ) {
				if (!isempty(rawitem.XPO.status)) {
					var status = '';
					if (['0', 0].includes( rawitem.XPO.status )) status = helpers.translate('XPO.disabled');
					if (['1', 1].includes( rawitem.XPO.status )) status = helpers.translate('XPO.enabled');
					keys.XPO.status.innerText = status;
					
					if (!isempty(rawitem.XPO.alias)) {
						keys.XPO.icon.src  = 'https://'+rawitem.XPO.alias+'/icon.png';
					}
				}
			}
			if ( 'XPO.profilephoto' == type ) {
				if (rawitem.XPO.title && rawitem.XPO.title.length)
					keys.XPO.title.innerText = rawitem.XPO.title;
				else
					keys.XPO.title.innerText = '@'+( rawitem.XPO.alias || '' );

				if (rawitem.XPO.updated)
					keys.XPO.updated.dataset.XPO.datetime = rawitem.XPO.updated;
				if (rawitem.XPO.photo) {
					var linkuri = 'url(data:image/jpg;base64,'+rawitem.XPO.photo+')';
					keys.XPO.image.style.backgroundImage = linkuri;
				}
				if (rawitem.XPO.approved || rawitem.XPO.pop) {
					keys.XPO.trash.hidden = 1;
					keys.XPO.approve.hidden = 1;
					keys.XPO.undo.hidden = 0;
				} else {
					keys.XPO.trash.hidden = 0;
					keys.XPO.approve.hidden = 0;
					keys.XPO.undo.hidden = 1;
				}
				
//				keys.XPO.trash.onclick = trashfn;
//				keys.XPO.undo.onclick = undofn;
				keys.XPO.approve.onclick = approvefn;
			}
			if ( isaccounttype || ['XPO.siteitem', 'XPO.articleitem', 'XPO.pageitem'].includes( type ) ) {
				
				if (!isempty(rawitem.XPO.alias)) {
					keys.alias.innerText = rawitem.XPO.alias;

					var url = '';
					if (type === 'XPO.siteitem') {
						url = 'https://'+rawitem.XPO.alias;
					} else {
						url = '/'+uri+'/'+rawitem.XPO.alias;
					}
					keys.XPO.title.href = url;

					if (type === 'XPO.siteitem') {
						keys.XPO.title.target = 'blank';
					} else {
						keys.XPO.title.onclick = function (e) {
							if (!e.ctrlKey) {
								appui.get(url);
								e.preventDefault();
							}
						};
						if (keys.XPO.photo)
							keys.XPO.photo.onclick = keys.XPO.title.onclick;
					}
				}

				if (isaccounttype) {
					if (rawitem.XPO.approved === false) {
						keys.XPO.approve.hidden = false;
						keys.XPO.disapprove.hidden = false;
					} else {
						keys.XPO.approve.hidden = true;
						keys.XPO.disapprove.hidden = true;
					}
					keys.XPO.approve.onclick = approvefn;
					keys.XPO.disapprove.onclick = disapprovefn;
				}

			}
			if ( 'XPO.tab' == type ) {
				if (options.XPO.i18n)
					clone.dataset.XPO.i18n = options.XPO.i18n;

				if (options.XPO.selected)
					clone.className = 'XPO.selected';
					
				if (options.XPO.value !== undefined)
					clone.dataset.XPO.id = options.XPO.value;
					
				clone.onclick = function () {
					this.parentNode.childNodes.forEach(function (tab) {
						tab.className = '';
					});
					
					this.className = 'XPO.selected';

					if (options.XPO.ontap)
						options.XPO.ontap(options.XPO.i18n, options.XPO.value);
				};
			}
			if ( 'XPO.section' === type ) {
				if (!isempty(options.XPO.count)) keys.XPO.sectioncount.innerText = options.XPO.count || 0;
				if (!isempty(options.XPO.classnames)) clone.className = clone.className +' '+ options.XPO.classnames;
				keys.XPO.sectioncount.hidden = !options.XPO.count;
				
				if (options.XPO.info)
					keys.XPO.info.dataset.XPO.i18n = options.XPO.info;
				
				if (options.XPO.i18n === 0) {
					keys.XPO.fold.hidden = 1;
					keys.XPO.title.hidden = 1;
					options.XPO.fold = 0;
				}

				if (options.XPO.i18n) {
					keys.XPO.title.dataset.XPO.i18n = options.XPO.i18n;
				} else {
					delete keys.XPO.title.dataset.XPO.i18n;
					if (options.XPO.title)
						keys.XPO.title.innerText = options.XPO.title;
				}

				if (options.XPO.data) {
					for (var i in options.XPO.data) {
						clone.firstElementChild.dataset[i] = options.data[i];
					}
				}
				
				if (options.XPO.horizontal) {
					clone.className = 'XPO.section XPO.horizontal';
					keys.XPO.grid.onscroll = function () {
						if ( keys.XPO.grid.scrollWidth === keys.XPO.grid.clientWidth ) {
							keys.XPO.shadowstart.hidden = 1;
							keys.XPO.shadowend.hidden = 1;
						}
						else if ( keys.XPO.grid.scrollLeft === 0 ) {
							keys.XPO.shadowstart.hidden = 1;
							keys.XPO.shadowend.hidden = 0;
						}
						else if ( keys.XPO.grid.scrollLeft === keys.XPO.grid.scrollWidth - keys.XPO.grid.clientWidth ) {
							keys.XPO.shadowstart.hidden = 0;
							keys.XPO.shadowend.hidden = 1;
						}
						else {
							keys.XPO.shadowstart.hidden = 0;
							keys.XPO.shadowend.hidden = 0;
						}
					};
					setTimeout(function () {
						keys.XPO.grid.onscroll();
					}, 250);
				}
				
				if (options.XPO.fold) {
					keys.XPO.fold.hidden = 0;
					var timeout		= false,
						foldstatus	= true;
					keys.XPO.hitarea.onclick = function (e) {
						clearTimeout(timeout);
						if (foldstatus) {
							if (document.body.dir === 'rtl')
								keys.XPO.fold.style.transform = 'rotate(180deg)';
							else
								keys.XPO.fold.style.transform = 'rotate(0deg)';
							keys.XPO.grid.style.transform = 'translateY(-80px)';
							keys.XPO.grid.style.opacity = '0';
							timeout = setTimeout(function () {
								keys.grid.hidden = 1;
							}, 201);
						} else {
							keys.XPO.fold.style.transform = '';
							keys.XPO.grid.hidden = 0;
							timeout = setTimeout(function () {
								keys.XPO.grid.style.transform = '';
								keys.XPO.grid.style.opacity = '';
							}, 50);
						}
						foldstatus = !foldstatus;
					};
				}
			}
			if ( ['XPO.bareicon', 'XPO.button'].includes(type) ) {
				if (options.XPO.icon) {
					keys.XPO.iconparent.hidden = 0;
					keys.XPO.btnicon.setAttribute('xlink:href', '#'+options.XPO.icon);
				} else {
					keys.XPO.iconparent.hidden = 1;
				}

				if (!isempty(options.title)) keys.XPO.btntitle.innerText = options.title;
				
				var i18n = (options || {}).XPO.i18n || (rawitem || {}).XPO.i18n;
				
				if (i18n)
					keys.XPO.btntitle.dataset.XPO.i18n = i18n;
				else
					delete keys.XPO.btntitle.dataset.XPO.i18n;
				
				if (options.XPO.selected)
					clone.dataset.XPO.selected = 1;

				if (options.round)
					clone.className = 'XPO.button XPO.round';

				if (options.rect)
					clone.className = 'XPO.button XPO.rect';

				if (options.square)
					clone.className = 'XPO.button XPO.square';
					
				if (options.value)
					clone.value = options.value;
				
				if (typeof options.ontap === 'function')
					clone.ontap = options.ontap;
					
				clone.onclick = function (e) {
					if (typeof clone.ontap === 'function')
						clone.ontap();

					Hooks.run('XPO.dombuttontap', this);
				};
			}
			if ( 'XPO.swatch' === type ) {
				if (options.value !== undefined) {
					clone.value = options.value;
				}
				if (options.XPO.color) {
					clone.style.backgroundColor = options.XPO.color;
				}
				
				if (typeof options.ontap === 'function')
					clone.ontap = options.ontap;
					
				clone.onclick = function (e) {
					if (typeof clone.ontap === 'function')
						clone.ontap();

					Hooks.run('XPO.dombuttontap', this);
				};
			}
			if ( 'XPO.toggle' === type ) {
				if (!isempty(options.title)) clone.lastElementChild.innerText = options.title;
				if (!isempty(options.XPO.html)) clone.lastElementChild.innerHTML = options.XPO.html;

				if (options.XPO.i18n)
					clone.lastElementChild.dataset.XPO.i18n = options.XPO.i18n;
				else
					delete clone.lastElementChild.dataset.XPO.i18n;
				
				if (options.checked || options.XPO.checked) clone.setAttribute('checked', 'true');
				else clone.removeAttribute('checked');
				
				if (options.checked || options.XPO.checked) clone.value = 1;
				else clone.value = 0;
				
				if (typeof options.ontoggle === 'function' || typeof options.XPO.ontoggle === 'function')
					clone.ontoggle = options.ontoggle || options.XPO.ontoggle;
					
				clone.setvalue = function (value) {
					if (value) this.setAttribute('checked', 'true');
					else this.removeAttribute('checked');

					if (value) clone.value = 1;
					else clone.value = 0;
				};
				
				clone.onclick = function () {
					var value = (this.getAttribute('checked') === 'true');

					if (value) this.removeAttribute('checked');
					else this.setAttribute('checked', 'true');

					if (value) clone.value = 0;
					else clone.value = 1;
					
					if (typeof this.ontoggle === 'function') this.ontoggle(this, !value);
				};
			}
			if ( 'XPO.expandable' === type ) {
				if (!isempty(options.XPO.i18n) && keys.XPO.etitle)
					keys.XPO.etitle.dataset.XPO.i18n = options.XPO.i18n;
				
				if (typeof options.ontoggle === 'function')
					clone.ontoggle = options.ontoggle;

				if (document.body.dir === 'rtl')
					keys.XPO.efold.style.transform = 'rotate(180deg)';
				else
					keys.XPO.efold.style.transform = 'rotate(0deg)';

				clone.dataset.XPO.collapsed = '1';

				clone.onclick = function () {
					var nes = this.nextElementSibling;
					
					var value = (this.dataset.XPO.collapsed === '1');

					if (value) {
						keys.XPO.efold.style.transform = '';
						this.dataset.XPO.collapsed = '0';
						if (nes) nes.hidden = 0;
					}
					else {
						if (document.body.dir === 'rtl')
							keys.XPO.efold.style.transform = 'rotate(180deg)';
						else
							keys.XPO.efold.style.transform = 'rotate(0deg)';

						this.dataset.XPO.collapsed = '1';
						if (nes) nes.hidden = 1;
					}
					
					if (typeof this.ontoggle === 'function') this.ontoggle(this, !value);
				};
			}
			
			Hooks.run('XPO.domsetclone', {
				_keys:		keys,
				dom:		clone,
				type:		type,
				list:		list,
				rawitem:	rawitem,
				options:	options,
			});
			
			dom.setupwidgets(clone);
			helpers.updatei18n(clone);
			
			return clone;
		},
		focusfirstinput: function (clone, allowinputs, noscroll) {
			if (clone) {
				var firstinput = clone.querySelector('textarea')
							|| clone.querySelector('.XPO.caption')
							|| clone.querySelector('.XPO.number');
				
				if (firstinput.className.includes('XPO.caption') && allowinputs)
					firstinput = clone.querySelector('input');
				
				firstinput
				&& firstinput.focus()
				&& !noscroll
				&& helpers.smartscroll(clone.offsetTop);
			}
		},
		focusfirstbutton: function (clone) {
			if (clone) {
				var firstinput = clone.querySelector('button');
				firstinput && firstinput.focus() && firstinput.scrollIntoView();
			}
		},
		/* 
		 * takes in HTMLElement and XPO.type
		 * returns if the indexed references to key elements inside the element
		 * if there's a match depending on the type
		 * */
		isoftype: function (element, type, dry) {
			var obj = {};
			if (element) {
				if ( element.dataset.XPO.type === type ) {
					if (dry === true) return true;

					// get all .id items
					obj = Object.assign( obj, dom.getformkeys(element) );

					// overrides
					var isaccounttype = ['XPO.personitem'].includes( type );

					if ( isaccounttype || ['XPO.siteitem', 'XPO.mediaitem'].includes(type) ) {
						obj.view		=	element.querySelector('.XPO.view')					;

						obj.close		=	element.querySelector('.XPO.close')					;
						obj.submit		=	element.querySelector('.XPO.submit')				;
					}

					return obj;
				}
			}
			return false;
		},
		getform: function (element) {
			if (!(element instanceof HTMLElement)) return;

			var payload = {};
			var otherviews = element.querySelectorAll('[data-XPO.id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {
					
					if (otherviews[i].getvalue)
						payload[ otherviews[i].dataset.XPO.id ] = otherviews[i].getvalue();
					else
						payload[ otherviews[i].dataset.XPO.id ] = otherviews[i].value;
					// this code tries to reset the form somewhat
/*
					if (otherviews[i] instanceof HTMLSelectElement) {
						otherviews[i].value = 0;
					} 
					else if ( ['text', 'textarea'].includes(otherviews[i].type) ) {
						otherviews[i].value = '';
					}
					else {
						
					}
*/
				}
			}
			return payload;
		},
		getformkeys: function (element) {
			if (!(element instanceof HTMLElement)) return;
			
			var keys = {};
			var otherviews = element.querySelectorAll('[data-XPO.id]');
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i) ) {

					keys[ otherviews[i].dataset.XPO.id ] = otherviews[i];

				}
			}
			return keys;
		},
		/*
		 * auto gens list.save compatible payload from a html element
		 * sets it as pending, adds store, ruid (or uid if provided)
		 * */
		emitform: function (element, uid) {
//			$.log.s( 'dom.emitform' );
			
			var payload = dom.getform(element);
			var list = dom.typetolist( payload.XPO.form );
			payload.XPO.store = list.store;
			payload.XPO.uid = uid || ruid();
			payload.XPO.pending	= 1;

			list.save(payload);
			
			return payload.XPO.uid;
		},
		/*
		 * this version lets you setup custom callbacks for forms
		 * each call sends you three things
		 * cb(formelement, pressedbutton, payload)
		 * */
		sendform: function (element, button) {
//			$.log.s( 'dom.sendform' );
			
			var payload, keys;
			if (element) {
				payload = dom.getform(element);
				keys = dom.getformkeys(element);
			} else {
				element = {
					id: button.dataset.XPO.form,
				};
			}
			Hooks.run('XPO.domformdata', {
				form: element,
				button: button,
				payload: payload,
				keys: keys,
			});
		},
		setupforms: function () {
			/*var inputfields	= document.querySelectorAll('.XPO.form input[data-XPO.id]');
			for (var i in inputfields) {
				if ( inputfields.hasOwnProperty(i) ) {
					inputfields[i].onkeyup = function (e) {
						if ( e.key === 'Enter' ) {
//							$.log.s( 'Reroute this to tab behavior' );
						}
					};
				}
			}*/
			var submitbuttons	= document.querySelectorAll('.XPO.form .XPO.submit');
			for (var i in submitbuttons) {
				if ( submitbuttons.hasOwnProperty(i) ) {
					submitbuttons[i].onclick = function () {
						dom.emitform( document.querySelector( '#'+this.dataset.XPO.form ) );
					};
				}
			}
			var sendbuttons	= document.querySelectorAll('.XPO.form .XPO.send');
			for (var i in sendbuttons) {
				if ( sendbuttons.hasOwnProperty(i) ) {
					sendbuttons[i].onclick = function () {
						dom.sendform( document.querySelector( '#'+this.dataset.XPO.form ), this );
					};
				}
			}
			var counts	= document.querySelectorAll('.XPO.form label.XPO.count');
			for (var i in counts) {
				var countlabel = counts[i];
				if ( counts.hasOwnProperty(i) ) {
					var field = countlabel.parentNode.nextElementSibling;
					field.oninput = function () {
						this.previousElementSibling.lastElementChild.innerText = (this.value || '').length;
					};
					field.oninput();
				}
			}
		},
		setuptabs: function () {
			var tabs	= document.querySelectorAll('.XPO.autotabs');
			for (var i in tabs) {
				if ( tabs.hasOwnProperty(i) ) {
					tabs[i].setvalue = function (id) {
						var btn = this.querySelector('[data-XPO.id="'+id+'"]');
						if (btn)
							btn.onclick();
					};
				}
			}
			var tab	= document.querySelectorAll('.XPO.autotabs button');
			for (var i in tab) {
				if ( tab.hasOwnProperty(i) ) {
					if ( tab[i].className.indexOf('XPO.selected') > -1 ) {
						tab[i].parentNode.value = tab[i].dataset.XPO.id;
					}
					
					tab[i].onclick = function () {
						var tpager = XPO.container.querySelector('.XPO.pager[data-XPO.id="'+this.parentNode.dataset.XPO.id+'"]');
						
						if (tpager) {
							tpager = tpager.children;
							for (var j in tpager) {
								if ( tpager.hasOwnProperty(j) ) {
									if (this.dataset.XPO.id == tpager[j].dataset.XPO.id)
										tpager[j].hidden = 0;
									else
										tpager[j].hidden = 1;
								}
							}
						}
						
						for (var j in this.parentNode.children) {
							if ( tab.hasOwnProperty(j) ) {
								var child = this.parentNode.children[j];
								child.className = '';
							}
						}
						
						this.className = 'XPO.selected';
						this.parentNode.value = this.dataset.XPO.id;

						Hooks.run('XPO.domtabdata', {
							id: this.parentNode.dataset.XPO.id,
							parent: this.parentNode,
							value: this.dataset.XPO.id,
							button: this,
						});
					};
				}
			}
		},
		/*
		 * also install widgets inplace of widget definitions
		 * 
		 * if no [XPO.id=*] is spec'd than it looks #id and transcends that on
		 * 
		 * we dont use document as parent because that messes up the widgets in
		 * templates i think
		 * */
		setupwidgets: function (parent) {
			Hooks.run('XPO.domsetupwidgets', parent);

			var suggestibles = parent.querySelectorAll('[data-XPO.suggestible]');
			for (var i in suggestibles) {
				if ( suggestibles.hasOwnProperty(i) ) {
					var i18n = suggestibles[i].dataset.XPO.i18n;
					var id = suggestibles[i].dataset.XPO.id;
					var type = suggestibles[i].dataset.XPO.type;
					var mode = suggestibles[i].dataset.XPO.mode;
					var classes = suggestibles[i].className;

					if (type) {
						var element = dom.getclone(tmpl.XPO.suggestible, suggestibles[i], {
							XPO.i18n: i18n,
							XPO.type: type,
							XPO.mode: mode,
							XPO.classes: classes,
						});
						
						suggestibles[i].replaceWith(element);
						if (id)
							element.dataset.XPO.id = id;
						else
							element.id = suggestibles[i].id;
							
						helpers.updatedates( element.parentElement );
						helpers.updatei18n( element.parentElement );
					}
				}
			}

			var checkboxes = parent.querySelectorAll('[data-XPO.checkbox]');
			for (var i in checkboxes) {
				if ( checkboxes.hasOwnProperty(i) ) {
					var i18n = checkboxes[i].innerText.trim();
					var id = checkboxes[i].dataset.XPO.id;
					var checked = checkboxes[i].dataset.XPO.checked;

					var element = dom.getclone(tmpl.XPO.toggle, checkboxes[i], {
						XPO.i18n: i18n,
						checked: checked
					});
					
					checkboxes[i].replaceWith(element);
					if (id)
						element.dataset.XPO.id = id;
					else
						element.id = checkboxes[i].id;
				}
			}

			var expandables = parent.querySelectorAll('[data-XPO.expandable]');
			for (var i in expandables) {
				if ( expandables.hasOwnProperty(i) ) {
					var i18n = expandables[i].innerText.trim();
					var id = expandables[i].dataset.XPO.id;
					var collapsed = expandables[i].dataset.XPO.collapsed;

					var element = dom.getclone(tmpl.XPO.expandable, expandables[i], {
						XPO.i18n: i18n,
					});
					
					expandables[i].replaceWith(element);
					if (id)
						element.dataset.XPO.id = id;
					else
						element.id = checkboxes[i].id;
						
					if (!collapsed)
						element.onclick();
				}
			}

		},
		/*
		 * index templates from htm
		 * */
		setuptemplates: function () {
			for (var i in XPO.templates.children) {
				if ( XPO.templates.children.hasOwnProperty(i) ) {
					var item = XPO.templates.children[i];
					tmpl[ item.dataset.XPO.type ] = item;
				}
			}
			for (var i in XPO.editors.children) {
				if ( XPO.editors.children.hasOwnProperty(i) ) {
					var item = XPO.editors.children[i];
					item.hidden = 1;
					listview.editors[ item.dataset.XPO.type ] = item;
				}
			}
		},
		setuplistviews: function () {
			LV.editor = listview(XPO.editorsink, tmpl.XPO.editorpart, {limit: false, nosections: true});

			LV.dashboard = listview(XPO.adminlistuisink, tmpl.XPO.tile,
				{allowsearch: true, limit: false, plural: 'XPO.dashboard', uri: 'dashboard', icon: '#XPO.icondashboard'}
			);

			LV.books = listview(XPO.bookssink, tmpl.XPO.bookitem, {
				allowsearch: true, offline: true, count: true, keys: ['XPO.alias'], allowselection: 1,
				newbtn: 'XPO.Osetbook', plural: 'XPO.books', icon: '#XPO.iconsubjects'
			});

			LV.pages = listview(XPO.pageslistuisink, tmpl.XPO.pageitem, {
				XPO.rid: 200, allowsearch: true, offline: true, count: true, keys: ['XPO.alias', ['XPO.status', 'XPO._page']], allowselection: 1,
				newbtn: 'XPO.Osetpage', plural: 'XPO.pages', icon: '#XPO.iconpages'
			});
			LV.pages.XPO.shorturi = '&';
			
			LV.articles = listview(XPO.articleslistuisink,		tmpl.XPO.articleitem, {
				XPO.rid: 100, allowsearch: true, offline: true, count: true, keys: ['XPO.alias', ['XPO.status', 'XPO._page'], 'XPO.account', ['XPO.account', 'XPO._page']],
				newbtn: 'XPO.Osetarticle', plural: 'XPO.blog', icon: '#XPO.iconblog', allowselection: 1,
				filters: {
					XPO.own: { XPO.type: 'XPO.checkbox', XPO.i18n: 'XPO.onlymine' },
		 		}
			});
			LV.articles.XPO.shorturi = '+';
			LV.articles.uponfilter = function () {
				if (LV.articles.filters.XPO.own.XPO.value)
					LV.articles.filter.XPO.account = preferences.get(2, 1);
				else
					delete LV.articles.filter.XPO.account;
				
				LV.articles.lastfetched = $.array();
				LV.articles.getall();
			};
			
			LV.pages.torawitem = LV.articles.torawitem = editor.torawitem;
			
			LV.relatedlinks = listview(XPO.relatedlinks, tmpl.XPO.linkitem, {limit: false, nosections: true});
		},
		setupbuttons: function () {
			XPO.fldsearch.onkeyup = function (e) {
				Hooks.run('XPO.domfldsearch', {
					key: e.key,
					code: e.keyCode,
					value: this.value,
				});
			};
			XPO.fldclose.onclick = function (e) {
				if (XPO.fldsearch.value === '') {
					if (appui.states.search)
						backstack.back();
					else
						appui.setsearch();
				} else
					XPO.fldsearch.value = '';
					XPO.fldsearch.focus();
					XPO.fldsearch.onkeyup(e);
			};
			XPO.dimmerscreen.onclick		= dom.screentapped;
			XPO.btnmenu.onclick = function (e) {
				Hooks.run('XPO.dombtnmenu', e);
			};
			XPO.btnsearch.onclick = function (e) {
				Hooks.run('XPO.dombtnsearch', e);
			};
			XPO.btnback.onclick = function (e) {
				Hooks.run('XPO.dombtnback', e);
			};
			XPO.btnsettings.onclick = function (e) {
				Hooks.run('XPO.dombtnsettings', e);
			};
//			XPO.btnmessages.onclick = function (e) {
//				appui.get('messages/')
//			};
			XPO.btnprofile.onclick = function (e) {
				appui.get('editprofile/')
			};
			XPO.btnblog.onclick = function (e) {
				appui.get('blog/')
			};
			XPO.btnpages.onclick = function (e) {
				appui.get('pages/')
			};
			XPO.btnhome.onclick = function (e) {
				if (appui.mainstandalone)
					backstack.reconstruct();
				else
					appui.get('/dashboard');
			};

			XPO.appreload.onclick = XPO.btnreload.onclick = function (e) {
				location.reload();
//				Hooks.run('XPO.dombtnreload', e);
			};
		},
		setupshortcuts: function () {
			var clearshortcuts = function (e) {
				delete document.body.dataset.XPO.shortcuts;
			};
			window.onselectstart =
			window.oncontextmenu = function (e) {
				if (e.target && e.target.tagName) {
					var yes = 1;
					if ( ['XPO.menuuitoggle'].includes( e.target.id ) ) {
						yes = 1;
					} else
					if ( ['p', 'span', 'input', 'textarea', 'li', 'img', 'button',
					'h1', 'h2', 'a', 'select', 'use', 'svg'].includes( e.target.tagName.toLowerCase() )
					|| ['XPO.halfbutton'].includes( e.target.className ) ) {
						yes = 0;
					}
					if (yes) {
						if (e.type == 'contextmenu')
							XPO.menuuitoggle.onclick(), blur();

						e.preventDefault();
					}
				}
			};
			window.onblur = clearshortcuts;
			window.onkeyup = function (e) {
				clearshortcuts();
				
				var yes, c;
				
				if (e) {
					var key = e.key.toLowerCase();
					
					if (e.ctrlKey) {
						switch (key) {
							case 'ر':
							case 'r':
								XPO.btnreload.click();
								yes = 1;
								break;
						}
					}
					
					if (!XPO.dimmerscreen.hidden && key === 'escape')
						backstack.back();
					
					// && !yes ensure the next block is ignored
					if ( dom.mainview === 'XPO.renderui' && !yes ) {
						if (e.altKey) {
							var keys = dom.getformkeys( XPO.renderui );
							if (keys)
							switch (key) {
								case 'e':
									keys.XPO.edit.onclick();
									yes = 1;
									break;
							}
						}
					}
					
					// && !yes ensure the next block is ignored
					if ( (helpers.isat('/editprofile') || helpers.isat('/login') )
					&& !yes && !appui.signedin) {
						if (!e.shiftKey) {
							switch (key) {
								case 'enter':
									var keys = dom.getformkeys( XPO.sessionform );
									if (keys && keys.XPO.submit) {
										keys.XPO.submit.click();
									}
									yes = 1;
									break;
							}
						}
					}

					if ( (helpers.isat('/editor/blog') || helpers.isat('/editor/pages') )
					&& !yes) {
						if (e.altKey && !e.shiftKey) {
							switch (key) {
								case 'س':
								case 's':
									editor.ontoggle();
									yes = 1;
									break;
								case '-':
									c = editor.addpart('XPO.blank');
									yes = 1;
									break;
								case '1':
									c = editor.addpart('XPO.headline');
									yes = 1;
									break;
								case '2':
									c = editor.addpart('XPO.headline2');
									yes = 1;
									break;
								case 'ن': // نيا
								case 'n': // new
									c = editor.addpart('XPO.paragraph');
									yes = 1;
									break;
								case 'ت': // تصوير
								case 'p':
									c = editor.addpart('XPO.photo');
									yes = 1;
									break;
								case 'b':
									c = editor.addpart('XPO.bullet');
									yes = 1;
									break;
								case 'ر': // ربط
								case 'l':
									c = editor.addpart('XPO.link');
									yes = 1;
									break;
								case 'ا': // اقتباس
								case 'q':
									c = editor.addpart('XPO.quote');
									yes = 1;
									break;
								case 'c': // code
									c = editor.addpart('XPO.code');
									yes = 1;
									break;
								case 'ت':
								case 't': // table
									c = editor.addpart('XPO.table');
									yes = 1;
									break;
							}
						} else if (e.ctrlKey && e.shiftKey) {
							switch (key) {
								case 'arrowleft':
									editor.flush('XPO.editorshrink', 1);
									yes = 1;
									break;
								case 'arrowright':
									editor.flush('XPO.editorgrow', 1);
									yes = 1;
									break;
								case 'arrowup':
									editor.flush('XPO.editorup');
									yes = 1;
									break;
								case 'arrowdown':
									editor.flush('XPO.editordown');
									yes = 1;
									break;
							}
						} else if (e.ctrlKey) {
							switch (key) {
								case 'arrowleft':
									editor.flush('XPO.editorshrink', 0.1);
									yes = 1;
									break;
								case 'arrowright':
									editor.flush('XPO.editorgrow', 0.1);
									yes = 1;
									break;
								case 'arrowup':
									editor.prev();
									yes = 1;
									break;
								case 'arrowdown':
									editor.next();
									yes = 1;
									break;
								case '-':
								case '+':
									yes = 1;
									break;
							}
						}
						
						c && dom.focusfirstinput( c );
					}

					var crumbs = appui.crumbify(), list, typecrumb;
					if ( ['', 'index.html'].includes(crumbs[0]) )
						crumbs = menu.mainview(crumbs);

					if (crumbs[0] === 'editor')
						typecrumb = crumbs[1];
					else
						typecrumb = crumbs[0];

					list = dom.XPO.searchablelist[ typecrumb ];
					if ( list && !yes && (list.options.newbtn || list.options.XPO.newform) && e.altKey && !e.shiftKey) {
						switch (key) {
							case 'ن':
							case 'n':
								appui.get( '/editor/'+typecrumb+'/new' );
								yes = 1;
								break;
						}
					}
				}
				
				yes && e.preventDefault();
			};
			window.onkeydown = function (e) {
				/*
				 * c s a
				 * temporarily shows shortcut hints on buttons
				 * */
				var marker = '';
				if (e.ctrlKey)	marker += 'c';
				if (e.shiftKey)	marker += 's';
				if (e.altKey)	marker += 'a';
				
				if (marker)
					document.body.dataset.XPO.shortcuts = marker;

				var yes, c;
				
				if (e) {
					var key = e.key.toLowerCase(), crumbs = appui.crumbify(), list, typecrumb;
				
					// prevent chrome menu
					if (e.altKey && key == 'e') e.preventDefault();

					if ( ['', 'index.html'].includes(crumbs[0]) )
						crumbs = menu.mainview(crumbs);

					if (crumbs[0] === 'editor')
						typecrumb = crumbs[1];
					else
						typecrumb = crumbs[0];

					var list = dom.XPO.searchablelist[ typecrumb ];
					
					if (['enter'].includes(key) && !XPO.datepickerui.hidden)
						datepicker.docallback(1), yes = 1;
						
					if (['escape', 'f11'].includes(key) && document.fullscreenElement)
						document.exitFullscreen(), yes = 1;
					if (key === 'f11' && !yes)
						document.firstElementChild.requestFullscreen(), yes = 1;

					if ( (helpers.isat('/editor/blog')
					||	helpers.isat('/editor/pages') )
					&& !yes) {
						if (e.ctrlKey && e.shiftKey) {
							switch (key) {
								case 'ش':
								case 'c': // copy
									c = editor.copyall();
									yes = 1;
									break;
								case 'ذ':
								case 'v': // paste
									c = editor.pasteall();
									yes = 1;
									break;
							}
						} else
						if (e.ctrlKey && !e.shiftKey) {
							switch (key) {
								case 'پ':
								case 'p':
									editor.preview();
									yes = 1;
									break;
								case 'س':
								case 's':
									editor.save();
									yes = 1;
									break;
							}
						} else {
							if (['p', ' ', 'پ'].includes(key)
							&& !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
								editor.flush('XPO.editorplay');
								yes = 1;
							}
						}
					} else if ( dom.mainview === 'XPO.renderui' ) {
						if (['p', ' ', 'پ'].includes(key)
						&& !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
							var keys = dom.getformkeys( XPO.renderui );
							if (keys.XPO.play.hidden) {
								keys.XPO.pause.onclick();
							} else {
								keys.XPO.play.onclick();
							}
							yes = 1;
						}
					} else if ( dom.mainview === 'XPO.nasheet' ) {
						if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
							if (['p', ' ', 'پ'].includes(key)) {
								if (appcontrols.XPO.play.hidden) {
									appcontrols.XPO.pause.onclick();
								} else {
									appcontrols.XPO.play.onclick();
								}
								yes = 1;
							}
							if (['arrowleft', 'j', 'ج'].includes(key)) {
								appcontrols.XPO.prev.onclick();
								yes = 1;
							}
							if (['arrowright', 'k', 'ك'].includes(key)) {
								appcontrols.XPO.next.onclick();
								yes = 1;
							}
						}
					} else if ( helpers.isat('/editor') ) {
						if (e.ctrlKey && !e.shiftKey) {
							switch (key) {
								case 'پ':
								case 'p':
									editor.preview();
									yes = 1;
									break;
								case 'س':
								case 's':
									editor.sensiblesave();
									yes = 1;
									break;
							}
						}
					} else if ( helpers.isat('/billing') ) {
						if (e.ctrlKey && !e.shiftKey) {
							switch (key) {
								case 'س':
								case 's':
									billing.sensiblesave();
									yes = 1;
									break;
							}
						}
					} else if ( helpers.isat('/editprofile') || helpers.isat('/login') ) {
						if (e.ctrlKey && !e.shiftKey) {
							switch (key) {
								case 'س':
								case 's':
									var keys = dom.getformkeys( XPO.editprofileui );
									keys.XPO.save.onclick();
									yes = 1;
									break;
							}
						}
					} else if (e.altKey && !e.shiftKey && !yes) {
						switch (key) {
							case 'home':
								XPO.btnmenu.onclick();
								yes = 1;
								break;
						}
					} else if (e.ctrlKey && !e.shiftKey && !yes) {
						switch (key) {
							case 'م':
							case 'm':
								XPO.btnnotif.onclick();
								yes = 1;
								break;
							case 'ي':
							case 'i':
								XPO.btnsettings.onclick();
								yes = 1;
								break;
							case 'ع':
							case 'e':
								if (list && list._keys && list.options.allowsearch) {
									dom.searchopen();
									yes = 1;
								}
								break;
							case 'ا':
							case 'a':
								if (list && list._keys && list.options.allowselection && !list.options.XPO.noselectall
								&& !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
									list._keys.XPO.select.click();
									yes = 1;
								}
								break;
							case 'پ':
							case 'p':
								if (list && list.options.XPO.printable) {
									list._keys.XPO.print.click();
									yes = 1;
								}
							case 'س':
							case 's':
								if (list && list.options.XPO.newform) {
									if (!list._keys.XPO.save.hidden)
										list._keys.XPO.save.click();
									yes = 1;
								}
								break;
						}
					}
					
					yes && e.preventDefault();
				}
			};
		},
		buildsettings: function () {
			dom.setupwidgets(XPO.settingsui);

			XPO.settingsuihomeview.value = preferences.get(120, 1) || 0;
			XPO.settingsuihomeview.onchanges = function () {
				preferences.set(120, this.value);
			};

			XPO.settingsuilanguage.onchanges = function () {
				helpers.changelanguage(this.value);
				preferences.set(25, this.value);
			};
			XPO.settingsuicurrency.onchanges = function () {
				preferences.set('80', this.value);
				billing.XPO.updatecurrency();
			};
			var defcurrency = preferences.get('80');
			if (defcurrency) XPO.settingsuicurrency.value = defcurrency;

			var sui = XPO.settingsuitoggles;
			sui.innerHTML = '';
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 140,
				XPO.i18n: 'XPO.userecommendedfont',
				checked: !!preferences.get(140, 1),
				ontoggle: function (elt, on) {
					if (on)
						document.body.dataset.XPO.font = 1,
						preferences.set(140, 1);
					else
						delete document.body.dataset.XPO.font,
						preferences.set(140, 0);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 130,
				XPO.i18n: 'XPO.useimperial',
				checked: !!preferences.get(130, 1),
				ontoggle: function (elt, on) {
					if (on)
						preferences.set(130, 1);
					else
						preferences.set(130, 0);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 'lowd',
				XPO.i18n: 'XPO.lowdatausage',
				checked: ( preferences.get('lowd') === '1' ),
				ontoggle: function (elt, on) {
					if (on)
						preferences.set('lowd', '1');
					else
						preferences.set('lowd', '0');
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 'srel',
				XPO.i18n: 'XPO.showreload',
				checked: ( preferences.get('srel') === 'true' ),
				ontoggle: function (elt, on) {
					applyshowreload(on);
					
					preferences.set('srel', on);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 'maketextlarger',
				XPO.i18n: 'XPO.maketextlarger',
				checked: ( preferences.get('largetext') === 'true' ),
				ontoggle: function (elt, on) {
					dom.applyscaling(on);
					
					preferences.set('largetext', on);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 'turnanimoff',
				XPO.i18n: 'XPO.turnanimoff',
				checked: ( preferences.get(15, 1) ),
				ontoggle: function (elt, on) {
					dom.applyanimations(on);
					
					preferences.set(15, on);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 'linkinnewtab',
				XPO.i18n: 'XPO.linkinnewtab',
				checked: ( preferences.get('innewtab') === 'true' ),
				ontoggle: function (elt, on) {
					preferences.set('innewtab', on);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 'enabletransparency',
				XPO.i18n: 'XPO.enabletransparency',
				checked: ( preferences.get('transparency') === 'true' ),
				ontoggle: function (elt, on) {
					dom.applytransparency(on);
					
					preferences.set('transparency', on);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: 'stmp',
				XPO.i18n: 'XPO.scrolltopmost',
				checked: ( preferences.get('stmp') === 'true' ),
				ontoggle: function (elt, on) {
					preferences.set('stmp', on);
				},
			});
			dom.getclone(tmpl.XPO.toggle, sui, {
				alias: '24',
				XPO.i18n: 'XPO.24hour',
				checked: ( preferences.get('24') === '1' ),
				ontoggle: function (elt, on) {
					preferences.set('24', on ? 1 : 0);
				},
			});
			
			var oldaccent = preferences.get('themeaccent');
			var siteconfig = dom.getformkeys( XPO.settingsui );
			sui = siteconfig.XPO.accentcolor;
			sui.innerHTML = '';
			Object.keys(accents).forEach(function (c) {
				var color = accents[c];
				var clone = dom.getclone(tmpl.XPO.swatch, sui, {
					value: c,
					XPO.color: color,
					ontap: function () {
						sui.querySelectorAll('button').forEach(function (swatch) {
							delete swatch.dataset.XPO.selected;
						});
						this.dataset.XPO.selected = 1;
						appui.applytheme( accents[this.value] );
					},
				});

				if (color === oldaccent)
					clone.dataset.XPO.selected = 1;
			});

			var oldtheme = preferences.get('theme', 1);
			var sui2 = siteconfig.XPO.theme;
			sui2.innerHTML = '';
			[
			'#000', '#222', '#fff'
			].forEach(function (color, i) {
				var clone = dom.getclone(tmpl.XPO.swatch, sui2, {
					value: i,
					XPO.color: color,
					ontap: function () {
						preferences.set('theme', this.value);
						
						appui.applytheme();

						sui2.querySelectorAll('button').forEach(function (swatch) {
							delete swatch.dataset.XPO.selected;
						});
						this.dataset.XPO.selected = 1;
					},
				});

				if (i === oldtheme)
					clone.dataset.XPO.selected = 1;
			});
		},
		mainview: false,
		onlyshow: function (id, parent) {
			var otherviews = parent.children;
			for (var i in otherviews) {
				if ( otherviews.hasOwnProperty(i)
				&& otherviews[i].className.startsWith('XPO.view') ) {

					otherviews[i].hidden = 1;

				}
			}
			
			if (id) {
				var view = document.querySelector('#'+id);
				if (view) view.hidden = 0;
				
				dom.mainview = id;
			}
		},
		applyi18n: function () {
			dom.buildsettings();
		},
		applytheme: function (theme) {
			// GE provided global theme function
			var style = XPO.updatetheme( theme );
			
			dynamicstyle.innerHTML = style;
		},
		applyscaling: function (on) {
			if (on)
				document.body.dataset.XPO.largetext = 1;
			else
				delete document.body.dataset.XPO.largetext;
		},
		applytransparency: function (on) {
			if (on)
				document.body.dataset.XPO.transparency = 1;
			else
				delete document.body.dataset.XPO.transparency;
		},
		applysession: function (on) {
			if (on)
				document.body.dataset.XPO.session = 1;
			else
				delete document.body.dataset.XPO.session;
		},
		applyanimations: function (off) {
			if (off) {
				delete document.body.dataset.XPO.animate;
				document.firstElementChild.style.scrollBehavior = '';
			}
			else {
				document.body.dataset.XPO.animate = 1;
				document.firstElementChild.style.scrollBehavior = 'smooth';
			}
		},
		deploytemplates: function () {
			dom.setuptemplates();
			dom.buildsettings();
		},
		init: function () {
			appcontrols = dom.getformkeys(XPO.appcontrolsui);

			applyshowreload( preferences.get('srel', 1) );
			if (!preferences.get(25)) preferences.set(25, 'en');
			
			appui.applytheme();

			dom.setupbuttons();
			dom.deploytemplates();

			dom.setuplistviews();
			datepicker.init();

			/*
			 * you can also setup data for core listviews since they are def'd
			 * right before this hook
			 * 
			 * an indicator for other mods that this is the time to hook up
			 * any listviews or dom related stuff because right after this
			 * 
			 * the widget replacements and other primary dom hook ups are run
			 * also if your view isn't ready and appui.get happens, it might
			 * result in a crash or unexpected behavior
			 * */
			Hooks.run('XPO.domsetup', null);

			dom.setupforms();
			dom.setuptabs();
			dom.setupshortcuts();
			dom.setupwidgets(XPO.adminuis);
			dom.setupwidgets(XPO.configui);
			dom.setupwidgets(XPO.renderui);
			dom.setupwidgets(XPO.sessionsui);
			dom.setupwidgets(XPO.editoruiform);
			dom.setupwidgets(XPO.invoiceui);

			if (preferences.get(140, 1))
				document.body.dataset.XPO.font = 1;

			document.onfullscreenchange = function () {
				Hooks.run('XPO.domfullscreen', document.fullscreenElement);
			};
			
			;(function () {
				var keys = dom.getformkeys(XPO.heartbeatui);
				XPO.icons.querySelectorAll('symbol').forEach(function (icon) {
					dom.getclone(tmpl.XPO.bareicon, keys.XPO.icons, {
						XPO.icon: icon.id,
					});
				});
			})();

			window.addEventListener('touchstart',	autohidecursor, true);
			window.addEventListener('mousemove',	autohidecursor, true);
			window.addEventListener('mousedown',	autohidecursor, true);
			window.addEventListener('keydown',		autohidecursor, true);

			window.addEventListener('popstate',		dom.popstate, true);
			window.addEventListener('contextmenu',	dom.contextmenu, true);
			window.onresize = function () {
				if (window.innerHeight <= 480 && XPO.fldsearch.parentElement.hidden)
					document.body.dataset.XPO.keyboardopen = 1;
				else
					delete document.body.dataset.XPO.keyboardopen;
				
				Hooks.run('XPO.domresize', null);
			};
			var keys = dom.getformkeys( XPO.profileui );
			var renderkeys = dom.getformkeys( XPO.renderui );
			var repeatx = XPO.container.querySelectorAll('.XPO.repeatx');
			var repeaty = XPO.container.querySelectorAll('.XPO.repeaty');
			var pasttopfn = function (top, topofpage) {
				if (top > topofpage) document.body.dataset.XPO.pasttop = 1;
				else delete document.body.dataset.XPO.pasttop;
			};
			document.body.onscroll = function (e) {
				var top				= document.firstElementChild.scrollTop,
					scrollheight	= document.firstElementChild.scrollHeight,
					topofpage		= XPO.topofthepage.offsetTop,
					halftopofpage	= topofpage/2;
				
				if (scrollheight > window.innerHeight+450)
					helpers.delayedexec('XPO.snaptotop', function () {
						
						// if b/w top most and 120px
						if (top > 0 && top <= halftopofpage)
							XPO.topmostofthepage.scrollIntoView();
						// if b/w 121 and topofthepage
						else if (top > halftopofpage && top <= topofpage)
							XPO.topofthepage.scrollIntoView();
						
						pasttopfn(top, halftopofpage);
					}, 150);

				pasttopfn(top, halftopofpage);

				if (dom.mainview !== 'XPO.adminui') {
					var percent = (top / topofpage);
					if (percent < 1.4) {
						repeatx.forEach(function (r) {
							if (!r.hidden)
								r.style.backgroundPositionX = percent*200+'%';
						});
						repeaty.forEach(function (r) {
							if (!r.hidden)
								r.style.backgroundPositionY = percent*200+'%';
						});
					}
				}
				if (['XPO.renderui', 'XPO.homeui'].includes(dom.mainview) && renderkeys && renderkeys.XPO.headerphoto) {
					renderkeys.XPO.headertint.style.top =
					renderkeys.XPO.headerphoto.style.top = (-top * 0.25)+'px';
				}
				helpers.delayedexec('XPO.blurpropic', function () {
					if (dom.mainview === 'XPO.profileui' && keys && keys.XPO.photo) {
						var bluramount = ( ((top / scrollheight) - 0.2) * 65 ).toFixed();
						var scaleamount = ( ((top / scrollheight) + 0.3) * 2 ).toFixed(2);
						
						if (bluramount > 10)
							bluramount = 10;
						if (bluramount < 0)
							bluramount = 0;

						keys.XPO.photo.style.filter = 'blur('+bluramount+'px)';

						if (scaleamount < 1)
							scaleamount = 1;
						if (scaleamount > 1.1)
							scaleamount = 1.1;

						keys.XPO.photo.style.transform = 'scale('+scaleamount+')';
					}
				}, 100);
			};
			Hooks.set('XPO.appuiclosedialog',		'XPO.dom',		function () {
				dom.setdialog(false);
			});
			Hooks.set('XPO.appuisearchclose',		'XPO.dom',		dom.searchclose);
			Hooks.set('XPO.appuisearchopen',		'XPO.dom',		dom.searchopen);
			Hooks.set('XPO.appuiopenview',			'XPO.dom',		function (id) {
				dom.onlyshow(id, XPO.container);
				dom.onlyshow(id, XPO.adminuis);
			});

			networki.init();
		}
	};
})();
