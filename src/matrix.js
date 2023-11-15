var Matrix;
;(function(){
	'use strict';

	var bordertype = function (r, f, j, k, x, y) {
			var d = distance(j, k, x, y);
			if (f) return d <= r;
			else return d >= (r-1) && d <= r;
		},
		distance = function (x1, y1, x2, y2) {
			var dx = x2 - x1; dx *= dx;
			var dy = y2 - y1; dy *= dy;
			return Math.sqrt( dx + dy );
		},
		EPS = 1e-7, floor = Math.floor, ceil = Math.ceil,
		todegrees = function (angle) {
			return angle * (180 / Math.PI);
		},
		coordtoangle = function (x0, y0, x1, y1) {
			// accepts either two points or two deltas
			var dx, dy;
			if (arguments.length === 2) {
				dx = x0; dy = y0;
			} else {
				dx = x1 - x0; dy = y1 - y0;
			}
			var ang = todegrees( Math.atan2(dy, dx) );
			return (ang < 0 ? ang + 360 : ang);
		},
		WhenEquals = function (p0, p1, p2, val, minp) {
			//p0 * (1-t)^2 + p1 * 2t(1 - t) + p2 * t^2 = val
			var qa = p0 + p2 - 2 * p1;
			var qb = p1 - p0;
			var qc = p0 - val;
			if (!(Math.abs(qa) > EPS)) return;	//singular case must be handled separately
			var qd = qb * qb - qa * qc;
			if (qd < -EPS)
				return Infinity;
			var qd = Math.sqrt(Math.max(qd, 0.0));
			var t1 = (-qb - qd) / qa;
			var t2 = (-qb + qd) / qa;
			if (t2 < t1) {
				var tmp = t1;
				t1 = t2;
				t2 = tmp;
			}
			if (t1 > minp + EPS)
				return t1;
			else if (t2 > minp + EPS)
				return t2;
			return Infinity;
		},
		toalpha = function (c, i) {
			return Mu3avin.alpha(c, 1-i);
		},
		angletocoord = function (x, y, r, a) {
			var hpi = Math.PI / 180;
			var na = a - 180; // shift angle -180
			var cx = x + r * Math.cos( na * hpi );
			var cy = y + r * Math.sin( na * hpi );
			return [cx, cy];
		},
		inpolygon = function (x, y, polygon) {
			var isInside = false;
			if (polygon && polygon[0]) {
				var minX = polygon[0].x, maxX = polygon[0].x;
				var minY = polygon[0].y, maxY = polygon[0].y;
				for (var n = 1; n < polygon.length; n++) {
					var q = polygon[n];
					minX = Math.min(q.x, minX);
					maxX = Math.max(q.x, maxX);
					minY = Math.min(q.y, minY);
					maxY = Math.max(q.y, maxY);
				}

				if (x < minX || x > maxX || y < minY || y > maxY) {
					return false;
				}

				var i = 0, j = polygon.length - 1;
				for (i, j; i < polygon.length; j = i++) {
					if ( (polygon[i].y > y) != (polygon[j].y > y) &&
							x < (polygon[j].x - polygon[i].x)
								* (y - polygon[i].y)
								/ (polygon[j].y - polygon[i].y) + polygon[i].x )
					{
						isInside = !isInside;
					}
				}
			}

			return isInside;
		},
		polytorect = function (polygon) {
			var minX = 0, maxX = 0, minY = 0, maxY = 0;
			if (polygon && polygon[0]) {
				minX = polygon[0].x, maxX = polygon[0].x;
				minY = polygon[0].y, maxY = polygon[0].y;
				for (var n = 1; n < polygon.length; n++) {
					var q = polygon[n];
					minX = Math.min(q.x, minX);
					maxX = Math.max(q.x, maxX);
					minY = Math.min(q.y, minY);
					maxY = Math.max(q.y, maxY);
				}
			}
			return [minX, minY, maxX-minX, maxY-minY];
		};

	/*
	 * if buffer is Buffer, it uses write|readUInt32BE
	 * if buffer is anything Array-like, it uses array[x] = whatever
	 * if you specify a TypedArray then make sure to limit your set to that type
	 * d is the default empty filler char
	 * */
	Matrix = function (w, h, d, buffer, bytes, aliasing) {
		aliasing = aliasing === undefined ? 0 : aliasing;
		var cursor = [0, 0], buf = 0, arr, matrix = {
			length: 0,
			width: 0,
			height: 0,
			bytes: 4,
			count: [],
			smooth: function (a) {
				aliasing = a === undefined ? !aliasing : a;
				return aliasing;
			},
			data: function (newarr) {
				if (newarr) arr = newarr;
				return arr;
			},
			/*
			 * create a new matrix with a buffer and returns it
			 * */
			clone: function () {
				var b = arr;
				if (arr instanceof Array) {
					b = Buffer.alloc(matrix.length*matrix.bytes);
					arr.forEach(function (v, i) {
						b.writeUInt32BE(v, i*matrix.bytes);
					});
				}
				return Matrix(matrix.width, matrix.height, null, b, matrix.bytes);
			},
			isoutofrange: function (x, y) {
				if (x < 0 || y < 0
				|| x > this.width-1 || y > this.height-1)
					return true;

				return false;
			},
			clear: function (newval, all) {
				if (!buf)
					newval = newval === undefined ? d : newval;

				this.each(function (val, x, y) {
					matrix.set(x, y, newval);
				}, 0, 0, 0, 0, all);
				
				return this;
			},
			each: function (callback, w, h, j, k, all) {
				// TODO re-eval the usefulness of 'all', get rid of it if...
				// all forces the loop to run even past the matrix grid
				// all allows skipping undefined/empty cells
				j = j || 0;
				w = (w || matrix.width) + j;
				k = k || 0;
				h = (h || matrix.height) + k;
				for (var y = k; y < h; ++y) {
					for (var x = j; x < w; ++x) {
						var val = this.get(x, y);
						if (all || val !== undefined) {
							val = callback(val, x, y);
							if (val !== undefined)
								this.set(x, y, val);
						}
					}
				}
				
				return this;
			},
			init: function (w, h, def, buffer, newbytes) {
				if (buffer instanceof Buffer) {
					buf = 1; // using buffer
				} else {
					buf = 0;
				}

				this.bytes = (newbytes || bytes || 4);
				
				d = (def === null || def) ? def : 0;
				arr = buffer || [];

				cursor = [0, 0];

				w = parseInt(w); h = parseInt(h);

				this.width = w;
				this.height = h;
				this.count = [w, h];
				this.length = w * h;

				if (d !== null)
					this.clear();
				
				return this;
			},
			/*
			 * if v is not spec'd then returns and only modifies coordinates
			 * 
			 * if blend is a 1, all values that are '-'s won't get set
			 * 
			 * if blend is a function, it'll get called with the oldvalue, newvalue
			 * this function should return a new value, if not the oldvalue is used;
			 * */
			set: function (x, y, v, blend) {
				cursor = [x, y];

				x = parseInt(x); y = parseInt(y);
				
//				if (blend) $.log.s( blend, v );

				if (typeof blend === 'function') {
					v = blend( this.get(x, y), v );
				} else if (blend) {
					if (v == 0 || v == '-' || v == undefined)
						return;
				}
				
				if (v === undefined)
					return this;

				if (this.isoutofrange(x, y))
					return this; // OutOfRange

				var addr = (y * this.width) + x;
				if (buf) {
					addr = addr * this.bytes;
					arr.writeUInt32BE(v, addr);
				} else {
					arr[addr] = v;
				}
				return this;
			},
			/*
			 * if x,y is not spec'd then returns the last modified coordinates
			 * */
			get: function (x, y) {
				if (x === undefined && y === undefined)
					return cursor;

				if (this.isoutofrange(x, y))
					return (buf ? 0 : undefined); // OutOfRange
				
				var addr = (y * this.width) + x;
				if (buf) {
					addr = addr * this.bytes;
					return arr.readUInt32BE(addr);
				} else if (arr[addr] !== undefined)
					return arr[addr];

				return (buf ? 0 : undefined);
			},
			getall: function () {
				var out = new Array(matrix.height).fill([]);
				for (var y = 0; y < out.length; ++y) {
					for (var x = 0; x < matrix.width; ++x) {
						out[y][x] = this.get(x, y);
					}
					out[y] = out[y].join(' ');
				}
				return out.join('\n');
			},
			replace: function (arg1, arg2) {
				// replace all elements matching arg1 with arg2
				arr.forEach(function (el, i) {
					if (el == arg1)
						arr[i] = arg2;
				});
				return matrix;
			},
			/*
			 * get a selected rect portion
			 * 
			 * example from a 9x9 mtrx, get 3x3 - 6x6
			 * 
			 * */
			slice: function (rx, ry, w, h, filler) {
				var portion	= Matrix(w, h);
				
				w = rx+w; h = ry+h;
				
				var out = new Array(matrix.height).fill([]);
				out.forEach(function (ignore, y) {
					if (y < h) {
						var width = y * matrix.width;
						arr.slice(width, width+matrix.width).slice(rx, w).forEach(function (val, x) {
							portion.set( x, y, val == '-' ? (filler || 0) : val );
						});
					}
				});
				return portion;
			},
			/*
			 * add matrix to the j, k coordinates of this matrix
			 * */
			setall: function (rx, ry, frommatrix, blend, mw, mh, invert) {
				if (frommatrix) {
					var crsr = cursor;
					if (rx !== undefined && ry !== undefined)
						crsr = [rx, ry];
					
					var w = mw || frommatrix.width,
						h = mh || frommatrix.height;
					
					for (var y = 0; y < h; ++y) {
						for (var x = 0; x < w; ++x) {
							matrix.set(crsr[0]+x, crsr[1]+y,
									frommatrix.get(invert ? w-x : x, y), blend);
						}
					}
				}
				return this;
			},
			setalli: function (rx, ry, frommatrix, blend, mw, mh) { // inverted horizontally
				this.setall(rx, ry, frommatrix, blend, mw, mh, 1);
				return this;
			},
			linea: function (x0, y0, x1, y1, color, w, blend) {
				w = w || 1;
				
				if (w <= 1) {
					matrix.line(x0, y0, x1, y1, color, blend);
					return;
				}

				// Bresenham line algo, color, width
				if (x1 === undefined
				||	y1 === undefined
				||	y0 === undefined
				||	x0 === undefined
				||	color === undefined)
					return;

				x0 = parseInt(x0); y0 = parseInt(y0);
				x1 = parseInt(x1); y1 = parseInt(y1);

				if (w >= 1) w = w - .5;
				
				var dx		= Math.abs(x1 - x0)	,
					dy		= Math.abs(y1 - y0)	,
					sx		= (x0 < x1) ? 1 : -1,
					sy		= (y0 < y1) ? 1 : -1,
					err		= dx - dy			,
					i		= 0					,
					w2		= w*2				,
					dist	= Matrix.distance(x0, y0, x1, y1),
					ang		= Matrix.coordtoangle( x0, y0, x1, y1 )	;

				var a = Matrix.angletocoord(x0, y0, w, ang+90 )	,
					b = Matrix.angletocoord(x0, y0, w, ang-90 )	,
					c = Matrix.angletocoord(x1, y1, w, ang-90 )	,
					d = Matrix.angletocoord(x1, y1, w, ang+90 )	;

				var p = x0 < x1 ? x0 : x1, q = y0 < y1 ? y0 : y1,
					r = (dx+w2), s = (dy+w2);

				p = (p-w); q = (q-w);
				
				var poly = [
					{x: a[0], y: a[1]},
					{x: b[0], y: b[1]},
					{x: c[0], y: c[1]},
					{x: d[0], y: d[1]},
				];
				
				matrix.each(function (val, j, k) {
					if (inpolygon(j, k, poly)) {
						var c = color;
						if (color instanceof Array && color.length === 2) {
							var dist2 = Matrix.distance(j, k, x1, y1) / dist;
							if (dist2 > 1) dist2 = 1;
							if (dist2 < 0) dist2 = 0;
							c = Mu3avin.mix(color[0], color[1], dist2);
						}
						matrix.set(j, k, c, Mu3avin.mixchannels);
					}
				}, r, s, p, q, 1);
			},
			lines: function (x0, y0, x1, y1, color) {
				var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
				if (steep) {
					[y0, x0] = [x0, y0];
					[y1, x1] = [x1, y1];
				}
				if (x0 > x1) {
					[x1, x0] = [x0, x1];
					[y1, y0] = [y0, y1];
				}

				//compute the slope 
				var dx = x1-x0; 
				var dy = y1-y0; 
				var gradient = dy / dx; 
				if (dx == 0) gradient = 1; 

				var xpxl1 = x0;
				var xpxl2 = x1; 
				var y = y0; 

				if (steep) {
					for (var x = xpxl1; x <=xpxl2; x++) {
						// pixel coverage is determined by fractional 
						// part of y co-ordinate 
						matrix.set(parseInt(y),	 x, toalpha(color, 1 - y % 1), Mu3avin.mixchannels); 
						matrix.set(parseInt(y)-1, x, toalpha(color, y % 1), Mu3avin.mixchannels); 
						y += gradient;
					}
				} else {
					for (var x = xpxl1 ; x <=xpxl2 ; x++) {
						matrix.set(x, parseInt(y)  , toalpha(color, 1 - y % 1), Mu3avin.mixchannels);
						matrix.set(x, parseInt(y)-1, toalpha(color, y % 1), Mu3avin.mixchannels);
						y += gradient;
					}
				}
			},
			line: function (x0, y0, x1, y1, c, blend, li) {
				// Bresenham line algo, c can be a function
				if (x1 === undefined
				||	y1 === undefined
				||	y0 === undefined
				||	x0 === undefined
				||	c === undefined)
					return;
				
				x0 = parseInt(x0);
				y0 = parseInt(y0);
				x1 = parseInt(x1);
				y1 = parseInt(y1);
				
				var dx		= Math.abs(x1 - x0)		,
					dy		= Math.abs(y1 - y0)		,
					sx		= (x0 < x1) ? 1 : -1	,
					sy		= (y0 < y1) ? 1 : -1	,
					err		= dx - dy				,
					i		= li || 0				;
				
				while (1) {
					if (typeof c === 'function')
						c(x0, y0, matrix, i);
					else
						matrix.set( x0, y0, c, blend );
					
					if (x0 === x1 && y0 === y1) break;
					
					var err2 = 2*err;

					if (err2 > -dy)
						err -= dy, x0 += sx, ++i;
					if (err2 < dx)
						err += dx, y0 += sy, ++i;
				}
			},
			circle: function (x, y, r, c, f, blend) {
				// Bresenham circle algo
				for (var j=x-r; j<=x+r; j++)
					for (var k=y-r; k<=y+r; k++) {
						if (f !== undefined) {
							if (bordertype(r, 1, j, k, x, y))
								matrix.set(j, k, f, blend);
						}
						if (c) {
							if (bordertype(r, 0, j, k, x, y))
								matrix.set(j, k, c, blend);
						}
					}
				return matrix;
			},
			ring: function (x, y, r, t, c, blend) {
				// Bresenham circle algo
				if (c)
				for (var j=x-r; j<=x+r; j++)
					for (var k=y-r; k<=y+r; k++) {
						var d = distance(j, k, x, y);
						if (d >= (r-(t)) && d <= r)
							matrix.set(j, k, c, blend);
					}
				return matrix;
			},
			arc: function (x, y, r, sa, ea, c, straight) {
				// center, radius, start-end angle, c can be a function
				if (sa !== ea) {
					sa = parseInt(sa);
					ea = parseInt(ea);
					if (sa > ea) sa = sa - 360;
					if (straight) {
						var s = angletocoord(x, y, r, sa);
						var e = angletocoord(x, y, r, ea);
						matrix.line(s[0], s[1], e[0], e[1], c);
					} else {
						var lx, ly, hpi = Math.PI/180;
						for (var a = sa; a < ea; ++a) {
							var na = a-180; // shift angle -180
							var cx = x + r * Math.cos(na*hpi);
							var cy = y + r * Math.sin(na*hpi);
							if (lx !== undefined) {
								matrix.line(cx, cy, lx, ly, c, undefined, a);
							}
							lx = cx;
							ly = cy;
						}
					}
				}
			},
			bezier: function (x0, y0, x1, y1, x2, y2, color, blend) {
				// color can be a function
				var parts = Math.sqrt( Matrix.distance(x1, y1, x2, y2) );
				var lastx = x0, lasty = y0;
				for (var t = 0; t < parts; t++){
					var T = t / parts;
					var x = Math.pow(1-T,2) * x0 + 2 * (1-T) * T * x1 + Math.pow(T,2) * x2; 
					var y = Math.pow(1-T,2) * y0 + 2 * (1-T) * T * y1 + Math.pow(T,2) * y2; 

					x = parseInt(x);
					y = parseInt(y);

					if ( ! ( x == lastx && y == lasty ) ) {
						matrix.line(lastx, lasty, x, y, color, blend, t);
						lastx = x;
						lasty = y;
					}
				}
				if ( ! ( lastx == x2 && lasty == y2 ) )
					matrix.line(lastx, lasty, x2, y2, color);
			},
			beziera: function (x0, y0, x1, y1, x2, y2, color, w, blend) {
				// color can be a function
				var parts = Math.sqrt( Matrix.distance(x1, y1, x2, y2) );
				var lastx = x0, lasty = y0;
				w = w === undefined ? 1 : w;
				var poly = [{x:x0,y:y0}];
				for (var t = 0; t < parts; t++){
					var T = t / parts;
					var x = Math.pow(1-T,2) * x0 + 2 * (1-T) * T * x1 + Math.pow(T,2) * x2; 
					var y = Math.pow(1-T,2) * y0 + 2 * (1-T) * T * y1 + Math.pow(T,2) * y2; 

					x = parseInt(x);
					y = parseInt(y);

					if ( ! ( x == lastx && y == lasty ) ) {
						poly.push({x:x,y:y});
						if (w) matrix.linea(lastx, lasty, x, y, color, w, blend);
						lastx = x;
						lasty = y;
					}
				}
				if ( ! ( lastx == x2 && lasty == y2 ) ) {
					poly.push({x:x2,y:y2});
					if (w) matrix.linea(lastx, lasty, x2, y2, color, w, blend);
				}
				return poly;
			},
			rect: function (x, y, w, h, c, f, blend) {
				x = floor(x || 0);
				y = floor(y || 0);
				w = floor(w || 0);
				h = floor(h || 0);
				if (w < 2 && h < 2) {
					matrix.set(x, y, c||f, blend);
				} else {
					if (f !== undefined) {
						if (w && h)
						matrix.each(function (val, j, k) {
							matrix.set(j, k, f, blend);
						}, w, h, x, y, 1);
					}

					if (c) {
						matrix.line(x, y, x+w-1, y, c, blend);			// 0
						matrix.line(x+w-1, y, x+w-1, y+h-1, c, blend);	// 1
						matrix.line(x, y, x, y+h-1, c, blend);			// 2
						matrix.line(x, y+h-1, x+w-1, y+h-1, c, blend);	// 3
					}
				}
				return matrix;
			},
			poly: function (points, c, f, blend) {
				// TODO implement this
				return matrix;
			},
		};

		if (w && h) matrix.init(w || 0, h || 0, d, buffer, bytes);

		return matrix;
	};
	
	Matrix.distance = distance;
	Matrix.angletocoord = angletocoord;
	Matrix.coordtoangle = coordtoangle;
	Matrix.todegrees = todegrees;
	Matrix.inpolygon = inpolygon;
	Matrix.polytorect = polytorect;
	
/*	var a = Matrix(4, 3, 1);
	var b = Matrix(12, 8);	
	console.log(a.getall());
	console.log();
	console.log(b.getall());
	console.log();
	console.log(b.setall(0, 0, a).getall());
	console.time();
	console.log();
	var c = Matrix(1920, 1080);
	c.rect(0, 0, 1920, 1080, 1);
	console.timeEnd();
	console.log();
	b.rect(0, 0, 1, 7, 9);
	console.log(b.getall());
	console.log(b.slice(3, 2, 2, 2).getall());
	// Matrix from Buffer
	var m = Matrix( 3, 3, null, Buffer.alloc(3*3*4), 4 );
	m.clear();
	m.set(0, 0, 0xFfFfFfFf);
	m.set(2, 2, 0x13131313);
	$.log( m.data() );
	// Matrix clone
	var m = Matrix( 3, 3, '-', [], 4 );
	m.clear();
	m.set(0, 0, 0xFfFfFfFf);
	m.set(2, 2, 0x13131313);
	$.log( m.clone().data() );*/
	
	module.exports = Matrix;
	
})();
