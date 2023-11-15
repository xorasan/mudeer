var shakl = shakl || {};
shakl.encode = function (layers, w, h) { // {} to .eqonah
	var str = '';
	if (layers) {
		if (w || h) str += (w||16)+'|'+(h||16);
		layers.each(function (l) {
			str += '\n='+l.uid
				+'|'+l.ism
				+'|'+(l.exclusive||'')
				+'|'+(l.scale||[]).join(',');
			l.ashyaa.each(function (o) {
				var fg = isundef(o.fg) ? '' : o.fg;
				str += '\n';
				str += o.t+'|'+o.x+'|'+o.y;
				if (o.t === CIRCLE) {
					str += '|'+o.r+'|'+(o.s||'')+'|'+(o.e||'')+'|'+(o.w||'')+'|'+(o.f||'')+'|'+fg;
				}
				if (o.t === RECT) {
					str += '|'+o.w+'|'+o.h+'|'+(o.f||'')+'|'+(o.s||'')+'|'+fg;
				}
				if (o.t === LINE || o.t === BONE) {
					str += '|';
					o.p.forEach(function (p) {
						str += ' '+p.x+','+p.y;
						if (o.t === LINE) {
							if (p.c) str += ','+p.c.x+','+p.c.y;
						} else if (o.t === BONE) {
							if (p.r) str += ','+(p.r||1)+','+(p.a||1);
						}
					});
					str += '|'+(o.w||'')+'|'+(o.f||'')+'|'+fg
						+  '|'+(o.b||'');
					
					str += '|';
					if (isnum(o.scale) && o.scale !== 1) {
						str += o.scale;
					}
				}
			});
		});
	}
	return str.trim();
};