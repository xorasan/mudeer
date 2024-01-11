// TODO add props mw, mh
// TODO add maintain aspect ratio on resize given one min dimension
var Canvas, canvas;
var calcdistance = function (x1, y1, x2, y2) {
	var dx = x2 - x1; dx *= dx;
	var dy = y2 - y1; dy *= dy;
	return Math.sqrt( dx + dy );
};
;(function(){
	var toradians = function (degs) {
		return degs * Math.PI / 180;
	};
	var todegrees = function (angle) {
		return angle * (180 / Math.PI);
	};
	var coordtoangle = function (x0, y0, x1, y1) {
		var dx = x1 - x0;
		var dy = y1 - y0;
		var ang = todegrees( Math.atan2(dy, dx) );
		return (ang < 0 ? ang + 360 : ang);
	};
	
	Canvas = canvas = function (element) {
		var c = {
			f: '#fff',
			s: -1,
			o: element.getContext('2d')
		};
		c.linedash = function (v) {
			c.o.setLineDash(v || [])
		};
		c.linecap = function (v) {
			c.o.lineCap = v;
		};
		c.linejoin = function (v) {
			c.o.lineJoin = v;
		};
		c.linewidth = function (v) {
			c.o.lineWidth = v;
		};
		c.fillcolor = function (v) {
			c.f = v;
			if (typeof v == 'object') {
				var grd = c.o.createLinearGradient(
							0, 0, v.length, v.angle
						);
				v.stops.forEach(function (item, i) {
					if (item instanceof Array) {
						grd.addColorStop(item[0], item[1]);
					} else {
						var stop = 0;
						if (i) stop = (i+1)/v.length;
						grd.addColorStop(stop, item);
					}
				});
				c.o.fillStyle = grd;
			} else c.o.fillStyle = v;
		};
		c.strokecolor = function (v) {
			c.s = v;
			c.o.strokeStyle	= v;
		};
		c.matn = function (x, y, m, s, f, mw) {
			c.fillcolor(f);
			c.strokecolor(s);

			if (c.f !== -1) c.o.fillText(m, x, y, mw);
			if (c.s !== -1) c.o.strokeText(m, x, y, mw);
		};
		c.rect = function (x, y, w, h, s, f) {
			c.fillcolor(f);
			c.strokecolor(s);

			if (c.f !== -1) c.o.fillRect	(x, y, w, h);
			if (c.s !== -1) c.o.strokeRect	(x, y, w, h);
		};
		c.line = function (points, s, f) {
			c.fillcolor(f);
			c.strokecolor(s);
			var lw = c.o.lineWidth;

			points.forEach(function (p, i) {
				if (i === 0) {
					c.o.beginPath();
					c.o.moveTo(p.x, p.y);
				}

				if (p.c) {
					c.o.quadraticCurveTo(p.cx, p.cy, p.x, p.y);
				}
				else {
					c.o.lineTo(p.x, p.y);
				}

				if (i === points.length-1) {
//					c.o.closePath();
					if (s != -1) c.o.stroke();
					if (f != -1) c.o.fill();
				}
			});
			
			c.o.lineWidth = lw;
		};
		c.circle = function (x, y, r, sa, ea, s, f) {
			c.fillcolor(f);
			c.strokecolor(s);

			c.o.beginPath(); // for a clean start
			c.o.arc(x, y, r, toradians(sa || 0), toradians(ea || 360), 0);
//			c.o.closePath(); // cant think of a use case
			if (f) c.o.fill();
			if (s) c.o.stroke();
		};
		c.clear = function (x, y, w, h) {
			c.o.clearRect(x, y, w, h);
		};
		
		c.text = c.matn;
		
		return c;
	};
	
	Canvas.coordtoangle = coordtoangle;
	Canvas.todegrees = todegrees;
	Canvas.toradians = toradians;

})();
