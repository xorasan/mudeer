var shakl = shakl || {};
var LINE = 1, BONE = 2, RECT = 3, MAGNET = 4;
shakl.uid = function (raise) {
	if (raise) {
		shakl.__uid = Math.max(raise, shakl.__uid+1);
		return raise; // retain provided uid
	} else return ++shakl.__uid;
};
shakl.__uid = 0;
shakl.intify = function (arr) { // DEPRECATED, moved to reset, migration needed
	for (var i = 0; i < arr.length; ++i) {
		arr[i] = parseint(arr[i]);
	}
	return arr;
};
shakl.linepoints = function (str, type) {
	var points = [];
	str.trim().split(' ').forEach(function (p) {
		p = intify(p.split(','));
		var curve, radius = 1, angle = 1;
		if (p[2] !== undefined) {
			if (type === LINE) curve = {x: p[2], y: p[3]};
			else if (type === BONE) radius = p[2], angle = p[3];
		}
		points.push({
			i: shakl.uid(), r: radius, a: angle, damage: 1,
			x: p[0], y: p[1], c: curve
		});
	});
	return points;
};
shakl.ixtyaaraat = function (str, asmaa) { // .ixtyaaraat to {}
	var itlaaqaat = {}, itla, bazaarcat, shaklcat; // current $.array, parent
	str.split('\n').forEach(function (l) {
		l = l.trim();
		if (l.startsWith('#')) {
			bazaarcat = parseint(l.slice(1));
		} else
		if (l.startsWith('$')) {
			shaklcat = parseint(l.slice(1));
		} else
		if (l.startsWith('@') && !isundef(bazaarcat)) {
			itlaaqaat[bazaarcat] = itlaaqaat[bazaarcat] || {};
			itla = itlaaqaat[bazaarcat][ l.slice(1) ] = $.array();
		} else
		if (!isundef(bazaarcat) && !isundef(shaklcat) && itla && l.length) {
			var l = l.split('|'),
				scalex = l[1] || undefined,
				scaley = l[2] || undefined;
			
			if ( isstr(scalex) && scalex.length )
				scalex = parsefloat( scalex || 0 );
			if ( isstr(scaley) && scaley.length )
				scaley = parsefloat( scaley || 0 );
			
			var o = {
				puid: shaklcat,
				scalex: scalex,
				scaley: scaley,
				parent: (asmaa && asmaa[ shaklcat ]) || '',
			};
			if (l[0].length) {
				o.ism = (asmaa && asmaa[ l[0] ]) || '';
				o.tafseel = shaklcat+'-'+l[0];
				o.uid = parseint(l[0]);
			} else {
				o.ism = '',
				o.tafseel = shaklcat,
				o.uid = shaklcat;
				o.zumrahfaqat = 1;
			}

			itla.set(o.uid, o);
		}
	});
	return itlaaqaat;
};
shakl.eqonah = function (str) { // .eqonah to {}
	var lib = {}, currentlib;
	var layers, layer = 0;
	if (str) {
		str = str.trim().split('\n');
		str.forEach(function (line, i) {
			var cmds = line.split('|');
			if (line.startsWith('$')) { // tarteeb
				cmds[0] = cmds[0].slice(1);
				lib.$ = intify(cmds);
			} else if (line.startsWith('@')) {
				currentlib = cmds[0].slice(1);
				lib[currentlib] = {
					uid: currentlib,
					rid: currentlib,
					ism: cmds[1],
					layers: $.array(),
				};
				layers = lib[currentlib].layers;
			} else if (layers && line.startsWith('=')) {
				layer = parseint( cmds[0].slice(1) );
				var scale = (cmds[3]||'').split(',');
				if (scale.length == 2)
					scale[0] = parsefloat(scale[0]||0),
					scale[1] = parsefloat(scale[1]||0);
				else scale = 0;
				var origin = (cmds[4]||'').split(',');
				if (origin.length == 2)
					origin[0] = parsefloat(origin[0]||0),
					origin[1] = parsefloat(origin[1]||0);
				else origin = 0;
				layers.set(layer, {
					uid: layer,
					ism: cmds[1] || 'layer'+layer,
					exclusive: parseint(cmds[2]||0),
					scale: scale,
					origin: origin,
					parent: currentlib,
					ashyaa: $.array(),
				});
			} else if (layers) {
				var o = { layer: layer };
				o.uid = o.i = shakl.uid();
				if (layer !== undefined) {
					var layerobj = layers.get(layer);
					if (layerobj) {
						layerobj.ashyaa.set(o.uid, o);
					}
				}
				o.lid = layer;
				o.t = parseint(cmds[0]);
				o.x = parseint(cmds[1]);
				o.y = parseint(cmds[2]);
				o.o = 0; // orientation
				if (o.t === MAGNET) {
					o.r = parsefloat(cmds[3]);
					if (!isnum(o.r)) o.r = 0;
					if (cmds[4] !== '') o.s = parsefloat(cmds[4]);
					if (cmds[5] !== '') o.e = parsefloat(cmds[5]);
					o.w = parsefloat(cmds[6]||1);
					o.f = parseint(cmds[7]||0);
					if (cmds[8]) {
						o.fg = parseint(cmds[8]||0);
						if (!isnum(o.fg)) o.fg = 0;
					}
				}
				if (o.t === RECT) {
					o.w = parseint(cmds[3]);
					o.h = parseint(cmds[4]);
					o.f = parseint(cmds[5]||0);
					o.s = parseint(cmds[6]||1);
					if (cmds[7]) o.fg = cmds[7];
				}
				if (o.t === LINE || o.t === BONE) {
					o.s = -1;
					if (cmds[3]) o.p = shakl.linepoints(cmds[3], o.t); else o.p = [];
					if (o.t === LINE)
						o.w = parsefloat(cmds[4]||0); // line width
					if (o.t === BONE)
						o.r = parsefloat(cmds[4]||1); // range -180-180
					if (cmds[5] !== '') o.f = parseint(cmds[5]);
					if (cmds[6]) o.fg = cmds[6];
					if (cmds[7]) o.b = cmds[7];
					if (cmds[8]) o.scale = parsefloat(cmds[8]||0, 5);
				}
			}
		});
	}
	return lib;
};
shakl.decode = function (str) { // .shakl (eqonah+ixtyaaraat)
	var obj = {};
	
	str = str.split('\n+\n');
	if (str[0]) obj.itlaaqaat = shakl.ixtyaaraat(str[0]);
	if (str[1]) obj.library = shakl.eqonah(str[1]);

	return obj;
};
