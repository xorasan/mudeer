/*
 * detect color notation
 * offer conversion to hex, hsla, rgba, hsva, etc
 * fluent api:	 Colors.auto('#096')
 * 		returns {
 * 					darken: fn,
 * 					brighten: fn,
 * 					r, g, b, h, s, l, v, a,
 * 					toString([type]),
 * 					torgba,
 * 					tohsva,
 * 					tohsla, all return strings
 * 				}
 * darken, brighten by percentage
 * 
 * */
var alwaan;
;(function () {
	'use strict';
	alwaan = {
		types: {
			hex: 10,
			rgb: 20,
			hsl: 30,
			hsv: 40,
			name: 50,
		},
		
		/**
		 * Converts an RGB color value to HSL. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
		 * Assumes r, g, and b are contained in the set [0, 255] and
		 * returns h, s, and l in the set [0, 1].
		 *
		 * @param   Number  r       The red color value
		 * @param   Number  g       The green color value
		 * @param   Number  b       The blue color value
		 * @return  Array           The HSL representation
		 */
		_rgbtohsl: function (r, g, b) {
		  r /= 255, g /= 255, b /= 255;

		  var max = Math.max(r, g, b), min = Math.min(r, g, b);
		  var h, s, l = (max + min) / 2;

		  if (max == min) {
			h = s = 0; // achromatic
		  } else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
			  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			  case g: h = (b - r) / d + 2; break;
			  case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		  }

		  return { h:h, s:s, l:l };
		},

		/**
		 * Converts an HSL color value to RGB. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
		 * Assumes h, s, and l are contained in the set [0, 1] and
		 * returns r, g, and b in the set [0, 255].
		 *
		 * @param   Number  h       The hue
		 * @param   Number  s       The saturation
		 * @param   Number  l       The lightness
		 * @return  Array           The RGB representation
		 */
		_hsltorgb: function (h, s, l) {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}
			var r, g, b;

			if (s == 0) {
				r = g = b = l; // achromatic
			} else {
				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;

				r = hue2rgb(p, q, h + 1/3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1/3);
			}

			return { r:(r * 255).toFixed(), g:(g * 255).toFixed(), b:(b * 255).toFixed() };
		},

		/**
		 * Converts an RGB color value to HSV. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
		 * Assumes r, g, and b are contained in the set [0, 255] and
		 * returns h, s, and v in the set [0, 1].
		 *
		 * @param   Number  r       The red color value
		 * @param   Number  g       The green color value
		 * @param   Number  b       The blue color value
		 * @return  Array           The HSV representation
		 *
		_rgbtohsv: function (r, g, b) {
		  r /= 255, g /= 255, b /= 255;

		  var max = Math.max(r, g, b), min = Math.min(r, g, b);
		  var h, s, v = max;

		  var d = max - min;
		  s = max == 0 ? 0 : d / max;

		  if (max == min) {
			h = 0; // achromatic
		  } else {
			switch (max) {
			  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			  case g: h = (b - r) / d + 2; break;
			  case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		  }

		  return { h:h, s:s, v:v };
		},
		*/

		/**
		 * Converts an HSV color value to RGB. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
		 * Assumes h, s, and v are contained in the set [0, 1] and
		 * returns r, g, and b in the set [0, 255].
		 *
		 * @param   Number  h       The hue
		 * @param   Number  s       The saturation
		 * @param   Number  v       The value
		 * @return  Array           The RGB representation
		 *
		_hsvtorgb: function (h, s, v) {
		  var r, g, b;

		  var i = Math.floor(h * 6);
		  var f = h * 6 - i;
		  var p = v * (1 - s);
		  var q = v * (1 - f * s);
		  var t = v * (1 - (1 - f) * s);

		  switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		  }

		  return { r:(r * 255).toFixed(), g:(g * 255).toFixed(), b:(b * 255).toFixed() };
		},
		*/

		_hextorgb: function (hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				a: 1,
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		},
		
		_componenttohex: function (c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		},
		_rgbtohex: function (r, g, b) {
			return "#" + alwaan._componenttohex(r) + alwaan._componenttohex(g) + alwaan._componenttohex(b);
		},

/*		_colornamesreverse: {
		},*/
/*		_colornames: {
			'aliceblue': '#f0f8ff',
			'antiquewhite': '#faebd7',
			'aqua': '#00ffff',
			'aquamarine': '#7fffd4',
			'azure': '#f0ffff',
			'beige': '#f5f5dc',
			'bisque': '#ffe4c4',
			'black': '#000000',
			'blanchedalmond': '#ffebcd',
			'blue': '#0000ff',
			'blueviolet': '#8a2be2',
			'brown': '#a52a2a',
			'burlywood': '#deb887',
			'cadetblue': '#5f9ea0',
			'chartreuse': '#7fff00',
			'chocolate': '#d2691e',
			'coral': '#ff7f50',
			'cornflowerblue': '#6495ed',
			'cornsilk': '#fff8dc',
			'crimson': '#dc143c',
			'cyan': '#00ffff',
			'darkblue': '#00008b',
			'darkcyan': '#008b8b',
			'darkgoldenrod': '#b8860b',
			'darkgray': '#a9a9a9',
			'darkgreen': '#006400',
			'darkgrey': '#a9a9a9',
			'darkkhaki': '#bdb76b',
			'darkmagenta': '#8b008b',
			'darkolivegreen': '#556b2f',
			'darkorange': '#ff8c00',
			'darkorchid': '#9932cc',
			'darkred': '#8b0000',
			'darksalmon': '#e9967a',
			'darkseagreen': '#8fbc8f',
			'darkslateblue': '#483d8b',
			'darkslategray': '#2f4f4f',
			'darkslategrey': '#2f4f4f',
			'darkturquoise': '#00ced1',
			'darkviolet': '#9400d3',
			'deeppink': '#ff1493',
			'deepskyblue': '#00bfff',
			'dimgray': '#696969',
			'dimgrey': '#696969',
			'dodgerblue': '#1e90ff',
			'firebrick': '#b22222',
			'floralwhite': '#fffaf0',
			'forestgreen': '#228b22',
			'fuchsia': '#ff00ff',
			'gainsboro': '#dcdcdc',
			'ghostwhite': '#f8f8ff',
			'gold': '#ffd700',
			'goldenrod': '#daa520',
			'gray': '#808080',
			'green': '#008000',
			'greenyellow': '#adff2f',
			'grey': '#808080',
			'honeydew': '#f0fff0',
			'hotpink': '#ff69b4',
			'indianred': '#cd5c5c',
			'indigo': '#4b0082',
			'ivory': '#fffff0',
			'khaki': '#f0e68c',
			'lavender': '#e6e6fa',
			'lavenderblush': '#fff0f5',
			'lawngreen': '#7cfc00',
			'lemonchiffon': '#fffacd',
			'lightblue': '#add8e6',
			'lightcoral': '#f08080',
			'lightcyan': '#e0ffff',
			'lightgoldenrodyellow': '#fafad2',
			'lightgray': '#d3d3d3',
			'lightgreen': '#90ee90',
			'lightgrey': '#d3d3d3',
			'lightpink': '#ffb6c1',
			'lightsalmon': '#ffa07a',
			'lightseagreen': '#20b2aa',
			'lightskyblue': '#87cefa',
			'lightslategray': '#778899',
			'lightslategrey': '#778899',
			'lightsteelblue': '#b0c4de',
			'lightyellow': '#ffffe0',
			'lime': '#00ff00',
			'limegreen': '#32cd32',
			'linen': '#faf0e6',
			'magenta': '#ff00ff',
			'maroon': '#800000',
			'mediumaquamarine': '#66cdaa',
			'mediumblue': '#0000cd',
			'mediumorchid': '#ba55d3',
			'mediumpurple': '#9370db',
			'mediumseagreen': '#3cb371',
			'mediumslateblue': '#7b68ee',
			'mediumspringgreen': '#00fa9a',
			'mediumturquoise': '#48d1cc',
			'mediumvioletred': '#c71585',
			'midnightblue': '#191970',
			'mintcream': '#f5fffa',
			'mistyrose': '#ffe4e1',
			'moccasin': '#ffe4b5',
			'navajowhite': '#ffdead',
			'navy': '#000080',
			'oldlace': '#fdf5e6',
			'olive': '#808000',
			'olivedrab': '#6b8e23',
			'orange': '#ffa500',
			'orangered': '#ff4500',
			'orchid': '#da70d6',
			'palegoldenrod': '#eee8aa',
			'palegreen': '#98fb98',
			'paleturquoise': '#afeeee',
			'palevioletred': '#db7093',
			'papayawhip': '#ffefd5',
			'peachpuff': '#ffdab9',
			'peru': '#cd853f',
			'pink': '#ffc0cb',
			'plum': '#dda0dd',
			'powderblue': '#b0e0e6',
			'purple': '#800080',
			'rebeccapurple': '#663399',
			'red': '#ff0000',
			'rosybrown': '#bc8f8f',
			'royalblue': '#4169e1',
			'saddlebrown': '#8b4513',
			'salmon': '#fa8072',
			'sandybrown': '#f4a460',
			'seagreen': '#2e8b57',
			'seashell': '#fff5ee',
			'sienna': '#a0522d',
			'silver': '#c0c0c0',
			'skyblue': '#87ceeb',
			'slateblue': '#6a5acd',
			'slategray': '#708090',
			'slategrey': '#708090',
			'snow': '#fffafa',
			'springgreen': '#00ff7f',
			'steelblue': '#4682b4',
			'tan': '#d2b48c',
			'teal': '#008080',
			'thistle': '#d8bfd8',
			'tomato': '#ff6347',
			'turquoise': '#40e0d0',
			'violet': '#ee82ee',
			'wheat': '#f5deb3',
			'white': '#ffffff',
			'whitesmoke': '#f5f5f5',
			'yellow': '#ffff00',
			'yellowgreen': '#9acd32'
		},*/

		_breakup: function (unknown) {
			var matches = unknown.match(/\((.*)\)/);
			if (matches) matches = matches[1];
			else matches = '';
			matches = matches.split(',');
			for (var i in matches) {
				matches[i] = parseFloat( matches[i].trim() );
			}
			return [
				matches[0]||0,
				matches[1]||0,
				matches[2]||0,
				matches[3]||1,
			];
		},
		
		lwnlimit: function (l) {
			alwaan.lwnfloor(l);
			alwaan.lwnceil(l);
			return l;
		},
		lwnfloor: function (l) {
			if (l.r < 0) l.r = 0;
			if (l.g < 0) l.g = 0;
			if (l.b < 0) l.b = 0;
			return l;
		},
		lwnceil: function (l) {
			if (l.r > 255) l.r = 255;
			if (l.g > 255) l.g = 255;
			if (l.b > 255) l.b = 255;
			return l;
		},
		
		hex2lwn: function (hex) {
			return alwaan._hextorgb(hex);
		},
		argb2lwn: function (color) {
			var l = {a: 1};

			l.a = color >> 24	& 0xff;
			l.r = color >> 16	& 0xff;
			l.g = color >>  8	& 0xff;
			l.b = color 		& 0xff;
			
			return l;
		},
		lwn2argb: function (l) { // returns int
			var argb  = l.a << 24	;
				argb += l.r << 16	;
				argb += l.g << 8	;
				argb += l.b			;
			
			return argb;
		},
		
		darken: function (l, dec, comp) { // returns mod'd copy of l
			dec = dec || 10;
			l = Object.assign({}, l);
			if (comp === 0 || isundef(comp)) l.r -= dec;
			if (comp === 1 || isundef(comp)) l.g -= dec;
			if (comp === 2 || isundef(comp)) l.b -= dec;
			alwaan.lwnfloor(l);
			return l;
		},
		brighten: function (l, inc, comp) {
			inc = inc || 10;
			l = Object.assign({}, l);
			if (comp === 0 || isundef(comp)) l.r += inc;
			if (comp === 1 || isundef(comp)) l.g += inc;
			if (comp === 2 || isundef(comp)) l.b += inc;
			alwaan.lwnceil(l);
			return l;
		},
		
		int2hex: function (color) {
			 return alwaan.lwn2hex( alwaan.argb2lwn(color) );
		},
		lwn2hex: function (l) {
			 return alwaan._rgbtohex(l.r, l.g, l.b);
		},
		
		auto: function (unknown) {
			if (typeof unknown !== 'string') return false;
			unknown = unknown.trim().toLowerCase();
			
			var obj = {
				r: 0, g: 0, b: 0,
				darken: function (byint) {
					byint = byint || 10;

					if (this.r-byint > 0)
						this.r = this.r-byint;
					if (this.g-byint > 0)
						this.g = this.g-byint;
					if (this.b-byint > 0)
						this.b = this.b-byint;

					return this;
				},
				brighten: function (byint) {
					byint = byint || 10;
					
					if (this.r+byint < 255)
						this.r = this.r+byint;
					if (this.g+byint < 255)
						this.g = this.g+byint;
					if (this.b+byint < 255)
						this.b = this.b+byint;

					return this;
				},
				toString: function () {
					return 'rgba('+this.r+', '+this.g+', '+this.b+', '+this.a+')';
				},
				torgba: function () {
					return 'rgba('+this.r+', '+this.g+', '+this.b+', '+this.a+')';
				},
//				v: 0,
//				tohsva: function () {
//					return 'hsva('+(this.h*359).toFixed()+', '+(this.s*100).toFixed()+'%, '+(this.l*100).toFixed()+'%, '+this.a+')';
//				},
				h: 0, s: 0, l: 0, a: 0,
				tohsla: function () {
					return 'hsla('+(this.h*359).toFixed()+', '+(this.s*100).toFixed()+'%, '+(this.l*100).toFixed()+'%, '+this.a+')';
				},
				tohex: function () {
					return alwaan._rgbtohex(this.r, this.g, this.b);
				}
			};

			/*
			 * this allows color name detection
			 * */
/*			if (alwaan._colornames[unknown]) {
				obj.type = alwaan.types.name;
				unknown = alwaan._colornames[unknown]
				Object.assign( obj, alwaan._hextorgb(unknown) );
				Object.assign( obj, alwaan._rgbtohsl(obj.r, obj.g, obj.b) );
				obj.a = 1;
			} else*/
			if (unknown.startsWith('#')) {
				obj.type = alwaan.types.hex;
				Object.assign( obj, alwaan._hextorgb(unknown) );
				Object.assign( obj, alwaan._rgbtohsl(obj.r, obj.g, obj.b) );
				obj.a = 1;
			} else
			if (unknown.startsWith('rgb')) {
				obj.type = alwaan.types.rgb;
				var comps = alwaan._breakup( unknown );
				obj.r = comps[0];
				obj.g = comps[1];
				obj.b = comps[2];
				obj.a = comps[3];
				Object.assign( obj, alwaan._rgbtohsl(obj.r, obj.g, obj.b) );
//				Object.assign( obj, alwaan._rgbtohsv(obj.r, obj.g, obj.b) );
			} else
			if (unknown.startsWith('hsl')) {
				obj.type = alwaan.types.hsl;
				var comps = alwaan._breakup( unknown );
				obj.h = comps[0]/359;
				obj.s = comps[1]/100;
				obj.l = comps[2]/100;
				obj.a = comps[3];
//				$.log.s( comps );
				Object.assign( obj, alwaan._hsltorgb(obj.h, obj.s, obj.l) );
			} else
				return false
//			if (unknown.startsWith('hsv')) {
//				obj.type = alwaan.types.hsv;
//				var comps = alwaan._breakup( unknown );
//				obj.h = comps[0]/359;
//				obj.s = comps[1]/100;
//				obj.v = comps[2]/100;
//				obj.a = comps[3];
//				Object.assign( obj, alwaan._hsvtorgb(obj.h, obj.s, obj.v) );
//			} else {
//				Object.assign( obj, alwaan._rgbtohsv(obj.r, obj.g, obj.b) );
//			}
			
			return obj;
		},

		/*init: function () {
			// gens a 'hex': 'colorname' object from 'colorname': 'hex'
			for (var i in alwaan._colornames) {
				alwaan._colornamesreverse[ alwaan._colornames[i] ] = i;
			}

		}*/
	};
})();

