//+ minhuroof mintarteeb nasab sawt ajraa minhuroof silence
var sawtkaatib;
;(function(){
	'use strict';
	
	{ var notesdict = {}, names = [], notes = [
	'c0',  'ca',   16.35   ,	'c#0', 'Ca',   17.32   , 'd0',  'da',   18.35   ,	'd#0', 'Da',   19.45   ,
	'e0',  'ea',   20.6    ,	'f0',  'fa',   21.83   , 'f#0', 'Fa',   23.12   ,	'g0',  'ga',   24.5    ,
	'g#0', 'Ga',   25.96   ,	'a0',  'aa',   27.5    , 'a#0', 'Aa',   29.14   ,	'b0',  'ba',   30.87   ,
    
	'c1',  'cb',   32.7    ,	'c#1', 'Cb',   34.65   , 'd1',  'db',   36.71   ,	'd#1', 'Db',   38.89   ,
	'e1',  'eb',   41.2    ,	'f1',  'fb',   43.65   ,'f#1', 'Fb',   46.25   ,	'g1',  'gb',   49      ,
	'g#1', 'Gb',   51.91   ,	'a1',  'ab',   55      , 'a#1', 'Ab',   58.27   ,	'b1',  'bb',   61.74   ,
    
	'c2',  'cc',   65.41   ,	'c#2', 'Cc',   69.3    , 'd2',  'dc',   73.42   ,	'd#2', 'Dc',   77.78   ,
	'e2',  'ec',   82.41   ,	'f2',  'fc',   87.31   , 'f#2', 'Fc',   92.5    ,	'g2',  'gc',   98      ,
	'g#2', 'Gc',   103.83  ,	'a2',  'ac',   110     , 'a#2', 'Ac',   116.54  ,	'b2',  'bc',   123.47  ,
    
	'c3',  'cd',   130.81  ,	'c#3', 'Cd',   138.59  , 'd3',  'dd',   146.83  ,	'd#3', 'Dd',   155.56  ,
	'e3',  'ed',   164.81  ,	'f3',  'fd',   174.61  , 'f#3', 'Fd',   185     ,	'g3',  'gd',   196     ,
	'g#3', 'Gd',   207.65  ,	'a3',  'ad',   220     , 'a#3', 'Ad',   233.08  ,	'b3',  'bd',   246.94  ,
    
	'c4',  'ce',   261.63  ,	'c#4', 'Ce',   277.18  , 'd4',  'de',   293.66  ,	'd#4', 'De',   311.13  ,
	'e4',  'ee',   329.63  ,	'f4',  'fe',   349.23  , 'f#4', 'Fe',   369.99  ,	'g4',  'ge',   392     ,
	'g#4', 'Ge',   415.3   ,	'a4',  'ae',   440     , 'a#4', 'Ae',   466.16  ,	'b4',  'be',   493.88  ,
    
	'c5',  'cf',   523.25  ,	'c#5', 'Cf',   554.37  , 'd5',  'df',   587.33  ,	'd#5', 'Df',   622.25  ,
	'e5',  'ef',   659.25  ,	'f5',  'ff',   698.46  , 'f#5', 'Ff',   739.99  ,	'g5',  'gf',   783.99  ,
	'g#5', 'Gf',   830.61  ,	'a5',  'af',   880     , 'a#5', 'Af',   932.33  ,	'b5',  'bf',   987.77  ,
    
	'c6',  'cg',   1046.5  ,	'c#6', 'Cg',   1108.73 , 'd6',  'dg',   1174.66 ,	'd#6', 'Dg',   1244.51 ,
	'e6',  'eg',   1318.51 ,	'f6',  'fg',   1396.91 , 'f#6', 'Fg',   1479.98 ,	'g6',  'gg',   1567.98 ,
	'g#6', 'Gg',   1661.22 ,	'a6',  'ag',   1760    , 'a#6', 'Ag',   1864.66 ,	'b6',  'bg',   1975.53 ,
    
	'c7',  'ch',   2093    ,	'c#7', 'Ch',   2217.46 , 'd7',  'dh',   2349.32 ,	'd#7', 'Dh',   2489.02 ,
	'e7',  'eh',   2637.02 ,	'f7',  'fh',   2793.83 , 'f#7', 'Fh',   2959.96 ,	'g7',  'gh',   3135.96 ,
	'g#7', 'Gh',   3322.44 ,	'a7',  'ah',   3520    , 'a#7', 'Ah',   3729.31 ,	'b7',  'bh',   3951.07 ,
    
	'c8',  'ci',   4186.01 ,	'c#8', 'Ci',   4434.92 , 'd8',  'di',   4698.63 ,	'd#8', 'Di',   4978.03 ,
	'e8',  'ei',   5274.04 ,	'f8',  'fi',   5587.65 , 'f#8', 'Fi',   5919.91 ,	'g8',  'gi',   6271.93 ,
	'g#8', 'Gi',   6644.88 ,	'a8',  'ai',   7040    , 'a#8', 'Ai',   7458.62 ,	'b8',  'bi',   7902.13
	]; }
	for (var i = 0; i < notes.length; i += 3) {
		names.push( notes[i] );
		notesdict[ notes[i] ]	= notes[i+2];
		notesdict[ notes[i+1] ]	= notes[i+2];
	}
	var types = ['sine', 'square', 'triangle', 'sawtooth'];
	var context, currentbpm = 240,
		il3ab = function (o) {
			var freq = sawtkaatib.axav(o[0]);
			if (freq) {
				var m = (( o[1] || 1 )+1) * (60/currentbpm);
				sawtkaatib.ajraa(0, .1+(m/10), m, freq, .2);
			}
		},
		onfinish = function () {
			// TODO causing a bug on kaios
//			$.taxeer('XPO.sawtkaatib', function () {
				if (context) context.close();
				context = 0;
//			}, 7*1000);
		};

	sawtkaatib = {
		silence: 0,
		hajm: 1,
		axav: function (v) {
			return notesdict[v];
		},
		saabiq: function (v) {
			var index = names.indexOf(v || 'c3');
			if (index > 0) {
				return names[ --index ];
			}
			return v;
		},
		qaadim: function (v) {
			var index = names.indexOf(v || 'c3');
			if (index < names.length-1) {
				return names[ ++index ];
			}
			return v;
		},
		ajraa: function (type, playfor, fadeout, freq, hajm) {
			if (sawtkaatib.silence) return;
			if (!context) context = new AudioContext();

			var o = context.createOscillator(),
				g = context.createGain();

			o.type = types[type] || types[0];
			o.frequency.value = freq || 830.6;
			g.gain.value = 0;
			o.connect(g);
			g.connect(context.destination);
			
			setTimeout(function () {
				playfor = playfor || 0.1;
				fadeout = fadeout || 0.015;

				if (context.currentTime)
				g.gain.exponentialRampToValueAtTime(.1 + hajm, context.currentTime + playfor);
				g.gain.value = hajm || sawtkaatib.hajm;
				
				// compensation for Autoplay policies
				var promise = o.start(0);

				if (promise !== undefined) {
					promise.then(function (e) {
						// Autoplay started!
					}).catch(function (e) {
						// show the unmute button
					});
				}

				setTimeout(function () {
					if (context.currentTime)
					g.gain.exponentialRampToValueAtTime(.005, context.currentTime + fadeout);
					g.gain.setTargetAtTime(0, context.currentTime, fadeout);
					setTimeout(function () {
						o.stop();
						onfinish();
					}, fadeout * 1000);
				}, playfor * 1000);
			}, 10);
		},
		il3ab: function (taraateeb) {
			if (sawtkaatib.silence) return;

			var queue = $.queue(), i = 0, timeout;
			(taraateeb || []).forEach(function () {
				queue.set(function (done, queue) {
					var secs = 60000 / currentbpm, o1, o2, o3, o4,
						t = taraateeb[ i ];
					
					if (t) {
						o1 = t[0]; if (o1) il3ab(o1);
						o2 = t[1]; if (o2) il3ab(o2);
						o3 = t[2]; if (o3) il3ab(o3);
						o4 = t[3]; if (o4) il3ab(o4);
					}
					clearTimeout(timeout);
					timeout = setTimeout(function () {
						i++;
						done(queue);
					}, secs);
				});
			});
			queue.run();
			queue.onfinish = function () {
				queue.intahaa();
				onfinish();
			};
			return queue;
		},
		mintarteeb: function (str, hajm) {
			var t = [];
			str = str||'';
			str = str.replace(/\/\/.*/g, '').trim()
					 .replace(/\n/g, ' ');
			var arr = str.split(' '), j = 0;
			for (var i = 0; i < 60; ++i) {
				t[ i ] = t[ i ] || [[], [], [], []];
				if (arr[j]) {
					var alfaaz = arr[j].split(',');
					var o = t[ i ];
					if (o) {
						alfaaz.forEach(function (lafz, i) {
							if (lafz) {
								var secs = lafz.match(/\-/g);
								if (secs) secs = secs.length;
								else secs = '';
								
								o[i][0] = lafz.replace(/\-/g, '');
								o[i][1] = secs;
							}
						});
					}
				}
				j++;
			}
			
			return sawtkaatib.il3ab(t);
		},
		minhuroof: function (str, sinf, muddah) {
			if (isstr(str) && str.length) {
				var arr = [], delay = 0, tone = 0, hajm;
				for (var i = 0; i < str.length; ++i) {
					hajm = .7;
					delay = 0;
//					tone = ( str[i].charCodeAt(0)*3 );
					tone = ( 900+(str[i].charCodeAt(0)/4) );
					if (tone < 800) tone += 800;
					if (' .,?'.includes(str[i])) delay = .08, hajm = 0;

					arr.push( [ sinf||0, muddah||.001, .2+delay, .03+delay, tone, hajm, str[i] ] );
				}
				return sawtkaatib.nasab(arr);
			}
		},
		/*
		 * audiomaker.melody([ [1,0.1,0.1,0.1,320], [1,0.1,0.1,0.1,320] ])
		 * [ type, playfor, fadeout, delay, freq ]
		 * */
		nasab: function (sequence) {
			if (sawtkaatib.silence) return;

			var queue = $.queue(), i = 0;
			(sequence || []).forEach(function () {
				queue.set(function (done, queue) {
					var args	= sequence[i],
						type	= args[0] || 0,
						playfor	= args[1] || 0,
						fadeout	= args[2] || 0,
						delay	= args[3] || 0,
						freq	= args[4] || 0,
						hajm	= args[5] || 0,
						lafz	= args[6] || 0;
					
					sawtkaatib.ajraa(type, playfor, fadeout, freq, hajm);
					setTimeout(function () {
						isfun(queue.uponsawt) && queue.uponsawt(lafz);
						onfinish();
						++i;
						done(queue);
					}, (playfor+delay) * 1000);
				});
			});
			queue.run();
			queue.onfinish = function () {
				queue.intahaa();
				onfinish();
			};
			return queue;
		},
	};
	
})();