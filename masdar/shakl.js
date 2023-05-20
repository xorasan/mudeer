//+ shakl shayy adapter jaddad hajm adaaf selected
/* shakls have an adapter $.array, it contains the objects present in the dom shakl
 * 
 * */
var shakl;
;(function(){
	'use strict';
	
	var magnetcolors = ['red', 'green', 'blue', 'goldenrod', 'purple', 'darkcyan'];
	var iswithin = function (x, y, sx, sy, sw, sh) {
		if (arguments.length === 6) { // rect
			return x >= sx
				&& x <= sx+sw
				&& y >= sy
				&& y <= sy+sh;
		} else
		if (arguments.length === 5) { // circle
			var dx = sx - x; dx *= dx;
			var dy = sy - y; dy *= dy;
			return Math.sqrt( dx + dy ) <= sw;
		}
		
		return false;
	};
	var rotatepoint = function (p, a, o) { // point, angle in radians, origin
		var x = p.x-o.x, y = p.y-o.y, c = Math.cos(a), s = Math.sin(a);
		return {
			x: parsefloat(o.x + x*c - y*s, 5),
			y: parsefloat(o.y + x*s + y*c, 5)
		};
	};
	var getscaled = function (l, x, y) {
		var d = {x: x, y: y};
		if (l && isarr(l.origin) && isarr(l.scale)) {
			d = {
				x: (x - l.origin[0]) * ( l.scale[0] || 1 ) + l.origin[0],
				y: (y - l.origin[1]) * ( l.scale[1] || 1 ) + l.origin[1],
			};
		}
		return d;
	};

	var proto = {
		w: 360,
		h: 480,
		mfateeh: 0,
		alwaan: 0,
		pallete: 0,
		selected: 0,
		muntaxab: 0,
		asmaa: {}, // optionally assign obj here for names of layers etc
		itlaaqaat: 0,
		adapter: 0,
		adaafdata: 0,
		zoomlevel: 1,
		negmagnets: 0,
		posmagnets: 0,
		panned: 0,
		siyaaq: 0, // H5 canvas context
		maqdoor: 0,
		qadr: function (v) {
			this.maqdoor = !!v;
		},
		zoomin: function () {
			if (this.zoomlevel < 10) {
				this.zoomlevel = parsefloat(this.zoomlevel+0.1, 1);
				webapp.itlaa3( parsefloat(this.zoomlevel*100, 1)+'%' );
				this.jaddad();
			}
		},
		zoomout: function () {
			if (this.zoomlevel > 0.5) {
				this.zoomlevel = parsefloat(this.zoomlevel-0.1, 1);
				webapp.itlaa3( parsefloat(this.zoomlevel*100, 1)+'%' );
				this.jaddad();
			}
		},
		up: function () {
			var shkl = this, itlaaqaat = shkl.itlaaqaat;
			if (shkl.selected > 0) shkl.selected--;
			var i = Object.keys(itlaaqaat)[shkl.selected];
			var lib = shkl.adaafdata[i];
			if (lib) shkl.onmuntaxab && shkl.onmuntaxab(lib);
			return parseint(i);
		},
		left: function () {
			var shkl = this, itlaaqaat = shkl.itlaaqaat;
			if (itlaaqaat) {
				var rid = Object.keys(itlaaqaat)[shkl.selected];
				var keys = Object.keys(itlaaqaat[rid]);
				var chosen = keys.indexOf( shkl.muntaxab[rid]+'' );
				chosen = keys[ chosen === -1 ? 0 : chosen-1 ];
				if (!isundef(chosen)) {
					shkl.muntaxab[rid] = parseint(chosen);
					var libs = itlaaqaat[rid][chosen];
					if (libs && libs.each) {
						libs.each(function (l) {
							if (l.lawn) // is it a color
								shkl.updatecolors(rid, l.uid);

							shkl.onmuntaxab && shkl.onmuntaxab(l);
						});
					}
					shkl.jaddad();
				}
			}
		},
		right: function () {
			var shkl = this, itlaaqaat = shkl.itlaaqaat;
			if (itlaaqaat) {
				var rid = Object.keys(itlaaqaat)[shkl.selected];
				var keys = Object.keys(itlaaqaat[rid]);
				var chosen = keys.indexOf( shkl.muntaxab[rid]+'' );
				chosen = keys[ chosen === -1 ? 0 : chosen+1 ];
				if (!isundef(chosen)) {
					shkl.muntaxab[rid] = parseint(chosen);
					var libs = itlaaqaat[rid][chosen];
					if (libs && libs.each) {
						libs.each(function (l) {
							if (l.lawn) // is it a color
								shkl.updatecolors(rid, l.uid);

							shkl.onmuntaxab && shkl.onmuntaxab(l);
						});
					}
					shkl.jaddad();
				}
			}
		},
		down: function () {
			var shkl = this, itlaaqaat = shkl.itlaaqaat;
			if (shkl.selected < Object.keys(itlaaqaat).length-1) shkl.selected++;
			var i = Object.keys(itlaaqaat)[shkl.selected];
			var lib = shkl.adaafdata[i];
			if (lib) shkl.onmuntaxab && shkl.onmuntaxab(lib);
			return parseint(i);
		},
		mowdoo3: function (str) {
			var shkl = this, itlaaqaat = shkl.itlaaqaat;
			if (str)
				innertext(shkl.mfateeh.ism, str);
			else
			if (itlaaqaat) {
				str = '';
				var i = Object.keys(itlaaqaat)[shkl.selected];
				for (var rid in itlaaqaat) {
					var ism = rid;
					if (shkl.asmaa && shkl.asmaa[rid]) ism = rid+' '+shkl.asmaa[rid];
					if (rid == i) str += '\n[[ '+ism+' ]]';
					else str += '\n'+ism;
				}
				if (str) innertext(shkl.mfateeh.ism, str);
			}
		},
		intaxaabaat: function () {
			var shkl = this, itlaaqaat = shkl.itlaaqaat;
			if (itlaaqaat) {
				var opts = [];
				var rid = Object.keys(itlaaqaat)[shkl.selected];
				for (var luid in itlaaqaat[rid]) {
					var ism = luid;
					if (shkl.asmaa && shkl.asmaa[luid]) ism = luid+' '+shkl.asmaa[luid];
//					var lib = itlaaqaat[rid][luid];
//					if (lib)
//					lib.each(function (l) {
//						var str = '';
//						if (isarr(l.scale)) {
//							if (l.scale[0] != l.scale[1]) str += 's'+l.scale[0]+','+l.scale[1];
//							else str += 's'+l.scale[0];
//						}
//					});
					if (shkl.muntaxab[rid] == luid) opts.push('[[ '+ism+']]');
					else opts.push(ism);
				}
				innertext(shkl.mfateeh.list, opts.join(' '));
			}
		},
		updatecolors: function (key, val) {
			if ( isundef( val ) ) return;
			var LV = this;
			var clr;
			if (key == 60) {
				clr = LV.alwaan.iris[ val ];
				if (!clr) return;
				LV.pallete[ 110 ] = clr.d;
				LV.pallete[ 111 ] = clr.n;
				LV.pallete[ 112 ] = clr.b;
			}
			if (key == 30) {
				clr = LV.alwaan.hair[ val ];
				if (!clr) return;
				LV.pallete[ 120 ] = clr.d;
				LV.pallete[ 125 ] = clr.n;
				LV.pallete[ 130 ] = clr.b;
				LV.pallete[ 200 ] = clr.d;
				LV.pallete[ 210 ] = clr.n;
				LV.pallete[ 220 ] = clr.b;
			}
			if (key == 1) {
				clr = LV.alwaan.skin[ val ];
				if (!clr) return;
				LV.pallete[   0 ] = clr.xxxd;
				LV.pallete[   5 ] = clr.xxd ;
				LV.pallete[  10 ] = clr.xd  ;
				LV.pallete[  20 ] = clr.d   ;
				LV.pallete[  30 ] = clr.n   ;
				LV.pallete[  40 ] = clr.b   ;
				LV.pallete[  50 ] = clr.xb  ;
				LV.pallete[  60 ] = clr.xxb ;
				LV.pallete[  65 ] = clr.xxxb;
				LV.pallete[ 150 ] = clr.lipd;
				LV.pallete[ 155 ] = clr.lip ;
				LV.pallete[ 160 ] = clr.lipb;
			}
//			LV.jaddad();
		},
		panhere: function (dx, dy) {
			if (arguments.length === 2) {
				if (!this.panned) this.panned = { x: 0, y: 0 };
				this.panned.x = dx;
				this.panned.y = dy;
//				var zl = this.zoomlevel;
//				var minx = (this.w *zl)/2,
//					miny = (this.h *zl)/2,
//					maxx = ( (this.w *zl) /2 ) - this.w,
//					maxy = ( (this.h *zl) /2 ) - this.h;
//				if (this.panned.x < 0-maxx) this.panned.x = -maxx;
//				if (this.panned.y < 0-maxy) this.panned.y = -maxy;
//				if (this.panned.x > 0+minx) this.panned.x = minx;
//				if (this.panned.y > 0+miny) this.panned.y = miny;
//				this.jaddad();
			}
		},
		bbox: function (o) {
			var x, y, w, h;
			o && o.p && o.p.forEach(function (p) {
				if (isundef(x)) x = o.x+p.x;
				if (isundef(y)) y = o.y+p.y;
				if (isundef(w)) w = o.x+p.x;
				if (isundef(h)) h = o.y+p.y;
				if (p.c) {
					x = Math.min(o.x+p.x, o.x+p.c.x, x);
					y = Math.min(o.y+p.y, o.y+p.c.y, y);
					w = Math.max(o.x+p.x, o.x+p.c.x, w);
					h = Math.max(o.y+p.y, o.y+p.c.y, h);
				} else {
					x = Math.min(o.x+p.x, x);
					y = Math.min(o.y+p.y, y);
					w = Math.max(o.x+p.x, w);
					h = Math.max(o.y+p.y, h);
				}
			});
			return { x:x, y:y, w:w, h:h };
		},
		centroid: function (o) {
			var b = this.bbox(o);
			return {
				x: b.x + (b.w - b.x)/2,
				y: b.y + (b.h - b.y)/2
			};
		},
		shayytopoints: function (o, i, l) {
			var zl = this.zoomlevel;
			var px = this.panned.x, py = this.panned.y;
			var points = [];

			var c;
			if (o.cntrd) c = o.cntrd;
			else if (l && isarr(l.origin) && isarr(l.scale))
				c = { x: l.origin[0], y: l.origin[1] };
			else c = this.centroid(o);

			var sx = o.scale || 1, sy = sx;
			if (l && isarr(l.scale)) {
				if (sx !== 1) {
					sx = (l.scale[0])-(1-sx);
					if (sx < 0.1) sx = 0.1;
				} else sx = l.scale[0];
				if (sy !== 1) {
					sy = (l.scale[1])-(1-sy);
					if (sy < 0.1) sy = 0.1;
				} else sy = l.scale[1];
			}

			o.p && o.p.forEach(function (p) {
				var x = o.x+p.x, y = o.y+p.y;
				if (p.d) x = x+p.d.x, y = y+p.d.y;
				x = (x - c.x) * sx + c.x;
				y = (y - c.y) * sy + c.y;
				if (i) x = -x; if (i > 1) y = -y;
				if (p.c) {
					var cx = o.x+p.c.x, cy = o.y+p.c.y;
					if (p.d) cx = cx+p.d.x, cy = cy+p.d.y;
					cx = (cx - c.x) * sx + c.x;
					cy = (cy - c.y) * sy + c.y;
					if (i) cx = -cx; if (i > 1) cy = -cy;
					points.push( { x: px+x*zl, y: py+y*zl, c: 1,
									cx: px+cx*zl, cy: py+cy*zl } );
				} else
					points.push( { x: px+x*zl, y: py+y*zl } );
			});
			return points;
		},
		adaafasmaa: function (v) {
			Object.assign(this.asmaa, v);
			return this;
		},
		adaafitlaaqaat: function (v) {
			this.itlaaqaat = v;
			this.xarqitlaaqaat();
			return this;
		},
		xarqitlaaqaat: function () { // apply itlaaqaat defaults
			var v = this.itlaaqaat;
			for (var rid in v) {
				if (isundef(this.muntaxab[rid])) {
					var luid = Object.keys(v[rid])[0];
					if (!isundef(luid))
						this.muntaxab[rid] = parseint(luid);
				}
			}
		},
		adaafmuntaxab: function (v) {
			var shkl = this;
			shkl.muntaxab = {};
			if (isarr(v)) {
				var itlaaqaat = shkl.itlaaqaat;
				v.forEach(function (n) {
					for (var rid in itlaaqaat) {
						if (itlaaqaat[rid][n])
							shkl.muntaxab[rid] = n;
					}
				});
			} else {
				Object.assign(shkl.muntaxab, v);
			}
			shkl.xarqitlaaqaat();
			shkl.muntaxabitlaaq();
			return shkl;
		},
		adaaf: function (libs) { // add data
			/* without this there's a bug where adaafdata.$ ends up becoming
			 * HUGE and causes several seconds of ever increasing delays and
			 * high cpu usage
			 * */
			libs = shallowcopy(libs);

			var shkl = this;
			
			var alwaan = { // colors and hair types
				1: ['color-skin', shkl.alwaan.skin],
				30: ['color-hair', shkl.alwaan.hair],
				60: ['color-iris', shkl.alwaan.iris],
			};
			for (var rid in alwaan) {
				rid = parseint(rid);
				if (shkl.asmaa) shkl.asmaa[rid] = alwaan[rid][0];
				libs[ rid ] = { rid: rid, ism: alwaan[rid][0], layers: $.array() };
				var itlqt = shkl.itlaaqaat[ rid ] = shkl.itlaaqaat[ rid ] || {};
				var first = undefined;
				for (var i in alwaan[rid][1]) {
					itlqt[ i ] = itlqt[ i ] || $.array();
					itlqt[ i ].set(i, {
						rid: rid,
						puid: rid,
						uid: i,
						ism: i,
						lawn: 1,
					});
					if (!first) first = i;
					libs[ rid ].layers.set(i, {
						uid: i,
						ism: i,
						lawn: 1,
					});
				}
				shkl.muntaxab[ rid ] = parseint(shkl.muntaxab[ rid ] || first);
				shkl.updatecolors( rid, first );
			}
			libs.$ = shakl.intify(Object.keys(alwaan)).concat( libs.$ );
			var hairtypelib = libs[850];
			if (hairtypelib) {
				var hairs = {
					855: 'head',
					860: 'brow',
					865: 'stache',
					870: 'beard',
					875: 'chest',
					880: 'trail',
//					885: 'pubic',
					890: 'arms',
					893: 'pits',
//					895: 'legs',
				};
				for (var rid in hairs) {
					rid = parseint(rid);
					if (shkl.asmaa) shkl.asmaa[rid] = 'hair-'+hairs[rid];
//					shkl.itlaaqaat[ rid ] = shkl.itlaaqaat[ rid ] || {};
					libs[ rid ] = { rid: rid, ism: hairs[rid], layers: $.array() };
					libs[ rid ].layers.set(-1, {
						uid: -1,
						ism: 'none',
						ashyaa: $.array(),
					});
//					var first;
//					hairtypelib.layers.each(function (l) {
//						if (!first) first = l.rid;
//						libs[ rid ].layers.set( l.uid, l );
//						var itlq = shkl.itlaaqaat[ rid ][ l.uid ] = shkl.itlaaqaat[ rid ][ l.uid ] || $.array();
//						itlq.set(l.uid, {
//							uid: l.uid,
//							puid: rid,
//						});
//						if (shkl.asmaa) shkl.asmaa[l.uid] = l.ism;
//					});
//					shkl.muntaxab[ rid ] = parseint(shkl.muntaxab[ rid ] || first);
				}
//				libs.$ = shakl.intify(Object.keys(hairs)).concat(libs.$);
			}
			shkl.adaafdata = libs;
			shkl.muntaxabitlaaq();
//			shkl.up(); // to select the first one
//			shkl.jaddad();
		},
		/*mowjoodah: function () { // returns mowjoodah layer
			var shkl = this;
			var i = shkl.adaafdata.$[ shkl.selected ];
			var lib = shkl.adaafdata[i], current;
			if (lib)
			lib.layers.each(function (l) {
				if (shkl.muntaxab[i] == l.ism) current = l;
			});
			return current;
		},*/
		muntaxabitlaaq: function () {
			var shkl = this, itlaaqaat = shkl.itlaaqaat;
			if (itlaaqaat && shkl.adaafdata)
			for (var rid in itlaaqaat) {
				for (var luid in itlaaqaat[rid]) {
					var libs = itlaaqaat[rid][luid];
					if (libs && libs.each) {
						libs.each(function (o) {
							var lib = shkl.adaafdata[o.puid];
							var cur, first, l;
							lib.layers.each(function (l) {
								if (!first) first = l.uid;
								if (shkl.muntaxab[lib.rid] == o.uid) cur = l.uid;
							});
							if (cur || first) l = lib.layers.get( cur || first );
							if (shkl.muntaxab[rid] == luid && l && l.lawn)
								shkl.updatecolors( lib.rid, o.uid );
							var selectedrid = shkl.adaafdata.$[shkl.selected];
							if (selectedrid === lib.rid) {
								shkl.onmuntaxab && shkl.onmuntaxab(lib);
							}
						});
					}
				}
			}
		},
		gethairindex: function () {
			return [855, 860, 865, 870, 875, 880, 885, 890, 893, 895];
		},
		magnetmode: function (e) {
			var shkl = this,
				negmagnets = shkl.negmagnets,
				posmagnets = shkl.posmagnets;
			// go over all .rabts & add a .d[elta] to all influenced points
			Object.values(negmagnets).forEach(function (ashyaa, color) {
				for (var i in ashyaa) {
					var n = ashyaa[i][0];
					if (n.rawaabit) { n.rawaabit.forEach(function (rabt) {
						var p = rabt[0], l = rabt[1], d = {
							x: n.d.x - p.x,
							y: n.d.y - p.y,
						};
						l.ashyaa.each(function (o) {
							if (o.t === LINE && o.p)
								o.p.forEach(function (po) {
									if (iswithin(o.x+po.x, o.y+po.y, p.x, p.y, p.w*2))
										po.d = d;
								});
						});
					}); }
				}
			});
		},
		jaddadmagnets: function () {
			var shkl = this,
				negmagnets = shkl.negmagnets,
				posmagnets = shkl.posmagnets;
			// empty all indexed colors before
			for (var i in negmagnets) negmagnets[i] = {};
			for (var i in posmagnets) posmagnets[i] = {};

			shkl.adapter.forEach(function (l) {
				l.ashyaa && l.ashyaa.each(function (o) {
					if (o.t === LINE && o.p)
						o.p.forEach(function (po) {
							po.d = 0;
						});
					if (o.t === MAGNET && o.f && isnum(o.fg)) {
						o.rawaabit = []; // remove old rabt
						if (o.r) posmagnets[o.fg][o.i] = [o, l];
						else negmagnets[o.fg][o.i] = [o, l];
					}
				});
			});
			
			Object.values(negmagnets).forEach(function (ashyaa, color) {
				for (var i in ashyaa) {
					var n = ashyaa[i][0];
					n.d = getscaled(ashyaa[i][1], n.x, n.y);
					n.rawaabit = [];
					for (var j in posmagnets[color]) {
						var p = posmagnets[color][j];
						var yes = iswithin(p[0].x, p[0].y, n.d.x, n.d.y, n.w*2);
						if (yes) n.rawaabit.push(p);
					}
				}
			});
			
			shkl.magnetmode();
		},
		shayy: function (o, l) {
			var text = themes.get('XPO.text');
			
			if (o.t === LINE && o.f == -1) {
				var hair = this.axavmuntaxab(o.fg)[0]; // hairtype
				if (hair && hair.ashyaa) this.drawhair(o, hair.ashyaa, l);
			} else {
				if (o.t === LINE) this.siyaaq.linewidth(o.w*(this.zoomlevel/30));
				this.siyaaq.linedash();
				var points = this.shayytopoints(o, 0, l);
				if (points.length) {
					var color = (this.pallete[o.fg] || 'red');
					var color2 = alwaan.hex2lwn(color);
					color2 = alwaan.lwn2hex( alwaan.darken(color2, 20) );
					this.siyaaq.line(points, o.w ? color2 : -1, o.f == 1 ? color : -1);
					if (o.b) {
						this.siyaaq.line(this.shayytopoints(o, 1, l), o.w ? color2 : -1, o.f == 1 ? color : -1);
					}
				}
				if (o.t === LINE) this.siyaaq.linewidth(1);
			}
		},
		drawhair: function (o, hairashyaa, l) {
			var shkl = this;
			o.p.forEach(function (p, i) {
				var px = p.x, py = p.y;
				if (p.d) px = p.x+p.d.x, py = p.y+p.d.y;
				var angle = 0;
				if (o.p.length >= 2 && i < o.p.length-1) {
					var p2 = o.p[i+1];
					var p2x = p2.x, p2y = p2.y;
					if (p2.d) p2x = p2.x+p2.d.x, p2y = p2.y+p2.d.y;
					angle = 90+canvas.coordtoangle(px, py, p2x, p2y);
				}
				if (i < o.p.length-1 && (i+1) % 2)
				hairashyaa.each(function (h) {
					var amended = [];
					h.p && h.p.forEach(function (po) {
						var x = po.x, y = po.y, curve;
						if (!isundef(angle)) {
							var point = rotatepoint(po, canvas.toradians(angle), h);
							x = point.x, y = point.y;
						}
						if (po.c) {
							var cx = po.c.x, cy = po.c.y;
							if (!isundef(angle)) {
								var point = rotatepoint(po.c, canvas.toradians(angle), h);
								cx = point.x, cy = point.y;
							}
							curve = {x: cx, y: cy};
						}
						amended.push({
							x: x,
							y: y,
							c: curve,
						});
					});
					shkl.shayy({
						b: o.b,
						scale: o.scale,
						cntrd: {
							x: o.x + px + h.x,
							y: o.y + py + h.y,
						},
						t: h.t,
						x: o.x + px + h.x,
						y: o.y + py + h.y,
						w: h.w * o.w,
						f: h.f === 1 ? 1 : 0,
						fg: h.fg,
						p: amended,
					}, l);
				});
			});
		},
		axavmuntaxab: function (i) {
			var shkl = this, l = [], itlqt = shkl.itlaaqaat, mntx = shkl.muntaxab;
			if ( !isundef( mntx[i] ) && itlqt[i] && itlqt[i][ mntx[i] ] ) {
				if (itlqt[i][ mntx[i] ].each)
				itlqt[i][ mntx[i] ].each(function (o) {
					if (o.zumrahfaqat) {
						l.push(o);
					} else {
						var chosen = shkl.adaafdata[ o.puid ].layers.get( o.uid );
						if (chosen) {
							chosen.puid = o.puid;
							l.push(chosen);
						}
					}
				});
			}
			return l;
		},
		jaddad: function () { // renew, redraw, update
			var shkl = this,
				mw = getattribute(shkl.mfateeh.raees, 'width'),
				mh = getattribute(shkl.mfateeh.raees, 'height');

			shkl.adapter = [];
			var tempsorter = {}, xforms = {};

			if (isarr(shkl.adaafdata.$)) {
				for (var i in shkl.muntaxab) {
					i = parseint(i);
					shkl.axavmuntaxab(i).forEach(function (o) {
						if (o.zumrahfaqat) {
							var l = xforms[ o.puid ] = xforms[ o.puid ] || {};
							if (isnum(o.scalex)) l.scalex = o.scalex;
							if (isnum(o.scaley)) l.scaley = o.scaley;
						}
					});
				}
				shkl.adaafdata.$.forEach(function (i) {
					i = parseint(i);
					if (i >= 850 && i < 900) {
					} else {
						shkl.axavmuntaxab(i).forEach(function (o) {
							o.scale = undefined;
							
							// apply xforms
							var x = xforms[i];
							if (x) {
								if (isnum(x.scalex) || isnum(x.scaley)) {
									o.scale = o.scale || [1, 1];
									if (isnum(x.scalex)) o.scale[0] = x.scalex;
									if (isnum(x.scaley)) o.scale[1] = x.scaley;
								}
							}
							
							tempsorter[ o.puid ] = tempsorter[ o.puid ] || [];
							tempsorter[ o.puid ].push( o );
						});
					}
				});
				shkl.adaafdata.$.forEach(function (i) {
					if (tempsorter[i]) {
						shkl.adapter = shkl.adapter.concat( tempsorter[i] );
					}
				});
			}
			
			shkl.jaddadmagnets();
			shkl.magnetmode();
			shkl.drawonly();

//			$.log(shkl.eansar.dataset.id, 'jaddad')
		},
		drawonly: function () {
			var shkl = this,
				mw = getattribute(shkl.mfateeh.raees, 'width'),
				mh = getattribute(shkl.mfateeh.raees, 'height');
			
			if (isarr(shkl.adapter)) {
				shkl.siyaaq.clear(0, 0, mw, mh);
				if (shkl.maqdoor) {
					var metric = preferences.get(130, 1);
					var incher = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        			var hx = parseint(shkl.w/2), hy = parseint(shkl.h/2),
					    zl = shkl.zoomlevel, sc = shkl.siyaaq,
					    px = shkl.panned.x, py = shkl.panned.y;
					sc.linewidth(.2);
					var count = 105;
					for (var i = shkl.h; i > -hy; i-=15) {
						count += 2.53;
						var x = px*zl, y = py+i*zl;
						sc.line([
							{x: 110, y: y},
							{x: x, y: y}
						], 'white');
						var feet = count/30.48;
						var inches = incher[ parseint( Math.floor( 12 * (feet%1) ) ) ];
						if (inches) {
							sc.linedash([2, 2]);
						    inches = ' '+inches+'"';
						} else {
						    sc.linedash();
						    inches = '';
						}
						sc.matn(
							120, y-1,
							metric ?
								parseint(feet)+'\''+inches :
								parseint(count)+'cm'
							, -1, 'white'
						);
					}
					sc.linewidth();
				}
				
				shkl.adapter.forEach(function (l) {
					if (l.parent && l.ashyaa) // colors don't have parents so won't get thru
					l.ashyaa.each(function (o) {
						shkl.shayy(o, l);
					});
				});
			}
		},
		seteansar: function (eansar, noclear) {
			var shkl = this;
			if (eansar) {
//				$.log(eansar.dataset.id, noclear)
				if (!noclear) innertext(eansar, '');
				eansar.shakl = shkl;
//				eansar.shakluid = shakl.uid();
				shkl.eansar = templates.get( 'XPO.shakl', eansar )();
				shkl.mfateeh = templates.keys( shkl.eansar );
				shkl.siyaaq = canvas(shkl.mfateeh.raees);
				var mw = (shkl.mfateeh.raees.parentElement.offsetWidth),
					mh = (shkl.mfateeh.raees.parentElement.offsetHeight);
				shkl.setmaxwh(mw, mh);
				shkl.hajm(mw, mh);
//				shkl.setmaxwh(480, 480);
//				shkl.hajm(360, 280);
			}
		},
		badaa: function () {
			var shkl = this;
			shkl.posmagnets = {};
			shkl.negmagnets = {};
			magnetcolors.forEach(function (item, i) {
				shkl.posmagnets[i] = {};
				shkl.negmagnets[i] = {};
			});
			shkl.adapter = $.array();
			shkl.pallete = {
				100: '#ffffff66',
				115: '#00000099',
				116: '#ffffff99',
			};
			shkl.panned = { x: 0, y: 0 };
			shkl.muntaxab = /*shkl.muntaxab || */{};
		},
		hajm: function (w, h) { // resize
			this.w = w || this.w;
			this.h = h || this.h;
			var r = 0,
				mw = getattribute(this.mfateeh.raees, 'width'),
				mh = getattribute(this.mfateeh.raees, 'height');
			
			if (this.w > mw) {
				r = mw / this.w;
				this.w = Math.round(this.w * r);
				this.h = Math.round(this.h * r);
			}
			if (this.h > mh) {
				r = mh / this.h;
				this.w = Math.round(this.w * r);
				this.h = Math.round(this.h * r);
			}

			this.zoomlevel = ( mh / this.h );
			this.panhere(mw/2, mh/2);

			this.siyaaq.linejoin('round');
			this.siyaaq.linecap('round');
//			this.jaddad();
		},
		setmaxwh: function (w, h) {
			attribute(this.mfateeh.raees, 'width', w||480),
			attribute(this.mfateeh.raees, 'height', h||640);
//			this.jaddad();
		},
	};
	shakl = function (eansar, noclear) {
		if (eansar) {
			var shkl = Object.create(proto);
			shkl.badaa();
			shkl.seteansar(eansar, noclear);
			return shkl;
		} else return false;
	};
})();