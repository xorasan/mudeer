//+ mulhaq la3ib sajil tasjeel il3ab inqata3 intahaa iltahaq infasal itlaqsawt isjal
//+ mashghool muddah
var musajjal, recorder, Recorder,
MSJLXATAM		= 10	,	// playback ended
MSJLBADAA		= 30	,	// started recording
MSJLTASJEEL		= 60	,	// got recorded blob
MSJLINTAHAA		= 90	;	// exited recording
;(function(){
	'use strict';
	
	var sawt, medrec, waqtibtidaa, mfateeh, audctx, cnvctx,
	kbps = 12*1000, livesize = 0,
	mimetype = 'audio/webm;codecs="opus"',
	audanlzr, dataarr, buflen,
	bigx = 0, drawto, portion,
	draw = function () {
		if (musajjal.mulhaq) {
			var w = mfateeh.hafr.width;
			var h = mfateeh.hafr.height;
		
			if (musajjal.sajil) {
				clearTimeout(drawto);
				drawto = setTimeout(draw, 200);
			}
			
			if (waqtibtidaa) {
				var t = Math.round((time.now()-waqtibtidaa)/1000);
				innertext(mfateeh.awqaat, '() '+t+'s --- '+parsefloat(livesize/1024, 1)+'kB');
				if (t >= 60) musajjal.itlaqsawt();
			}
		
			audanlzr.getByteTimeDomainData(dataarr);
//			audanlzr.getByteFrequencyData(dataarr);
//			$.log(dataarr.length);
			
			cnvctx.lineWidth = 2;
			cnvctx.strokeStyle = 'white';
		
			cnvctx.beginPath();
		
			var slicewidth = portion / buflen;
			var x = 0;
		
			for (var i = 0; i < buflen; i++) {
				var v = dataarr[i] / 128;
				var y = v * h/2;
			
				if (i === 0) {
					cnvctx.moveTo(bigx+x, y);
				} else {
					cnvctx.lineTo(bigx+x, y);
				}
			
				x += slicewidth;
			}
			
			bigx += portion;
			if (bigx > w) {
				bigx = 0;
				cnvctx.fillRect(0, 0, w, h);
			}
//			cnvctx.lineTo(w, h/2);
			cnvctx.stroke();
		}
	},
	visualize = function (stream) {
		if (!audctx) audctx = new AudioContext();
		bigx = 0;
		attribute(mfateeh.hafr, 'width', (mfateeh.hafr.parentElement.offsetWidth-5)+'px');
		var w = mfateeh.hafr.width;
		var h = mfateeh.hafr.height;
		portion = Math.round( w / (60*5) );
		cnvctx = mfateeh.hafr.getContext('2d');
		cnvctx.fillStyle = 'black';
		cnvctx.fillRect(0, 0, w, h);
		var src = audctx.createMediaStreamSource(stream);
		audanlzr = audctx.createAnalyser();
		audanlzr.fftSize = 128;

		buflen = audanlzr.frequencyBinCount;
		dataarr = new Uint8Array(buflen);

		src.connect(audanlzr);
		
		draw();
	},
	jaddadsawt = function () {
		musajjal.muddah = 0;
		musajjal.hajam = 0;
		if (sawt) {
			if (!sawt.paused) sawt.pause();
			sawt.remove();
		}
		if (musajjal.mulhaq) {
			setcss(mfateeh.irtiqaa, 'width');
			innertext(mfateeh.awqaat, '');
		}
		sawt = new Audio();
		sawt.ontimeupdate = function () {
			waqtissawt();
		};
		sawt.onended = function () {
			musajjal.intahaa();
		};
		sawt.onplay = function () {
			// TODO
		};
		sawt.onpause = function () {
			// TODO
		};
	},
	waqtissawt = function () {
		if (musajjal.mulhaq) {
			var t = musajjal.muddah || sawt.duration;
			var hajam = musajjal.tasjeel ? musajjal.tasjeel.size : musajjal.hajam;
			if (musajjal.sajil) {
			} else
			if (isnum(t)) {
				var str = (sawt.paused ? '||' : '>>')
						+' '+Math.round(sawt.currentTime)+' / '+Math.round(t)+'s';
				if (hajam) str += ' --- '+Math.round(hajam/1024)+'kB';
				innertext(mfateeh.awqaat, str);
				var w = sawt.currentTime/t *100;
				if (w < 101) setcss(mfateeh.irtiqaa, 'width', w+'%');
			}
		}
	},
	pausebtn = function () {
		softkeys.set('5', function () {
			musajjal.inqata3();
		}, '5', 'iconpause');
	},
	stopbtn = function () {
		softkeys.set('8', function () {
			musajjal.intahaa();
		}, '8', 'iconstop');
	},
	rewindbtn = function () {
		softkeys.set('4', function () {
			musajjal.irja3();
		}, '4', 'iconfastrewind');
	},
	forwardbtn = function () {
		softkeys.set('6', function () {
			musajjal.id3am();
		}, '6', 'iconfastforward');
	},
	rawaa = function (nabaa) { // relay event
		Hooks.run('musajjal', nabaa);
		Hooks.run('recorder', nabaa);
	};
	
	recorder = Recorder = musajjal = {
		muddah: 0, // override duration
		hajam: 0, // override size
		mulhaq: 0, // is attached to elements
		la3ib: 0, // is playing
		sajil: 0, // is recording
		tasjeel: 0, // recording blob
		mashghool: function () {
			return /*musajjal.la3ib || */musajjal.sajil || musajjal.tasjeel;
		},
		il3ab: function (xitaab) { // play
			if (musajjal.sajil) {
				webapp.itlaa3('cannot play this while recording...');
			} else
			if (musajjal.mulhaq) {
				if (xitaab) {
					rawaa(MSJLXATAM);
					sawt.src = xitaab;
					sawthafr.axavmuddah(xitaab, function (muddah, hajam) {
						musajjal.muddah = muddah;
						musajjal.hajam = hajam;
						sawt.currentTime = 0;
						sawt.play();
					});
				} else {
					sawt.play();
				}
				pausebtn();
				stopbtn();
				musajjal.la3ib = 1;
				rawaa();
			}
		},
		inqata3: function (lysil3ab) { // pause
			if (musajjal.sajil) {
				musajjal.itlaqsawt(2);
			}
			if (musajjal.mulhaq && sawt) {
				if (sawt.ended) sawt.currentTime = 0;
				if (sawt.paused) {
					if (!lysil3ab) musajjal.il3ab();
				}
				else {
					sawt.pause();
					musajjal.la3ib = 0;
					rawaa();
				}
			}
		},
		intahaa: function () { // stop
			if (musajjal.mulhaq && sawt) {
				sawt.currentTime = 0;
				if (sawt.paused) {
					if (!musajjal.tasjeel) {
						jaddadsawt();
						softkeys.havaf('5');
						softkeys.havaf('8');
						rawaa(MSJLXATAM);
					}
				}
			}
			musajjal.inqata3(1);
			rawaa();
		},
		iltahaq: function (m) { // attach
			if (m) {
				mfateeh = m;
				ixtaf(mfateeh.hafr);
				musajjal.mulhaq = 1;
				rawaa();
			}
		},
		infasal: function () { // detach
			if (musajjal.mulhaq) {
				mfateeh = 0;
				cnvctx = 0;
				musajjal.mulhaq = 0;
				musajjal.intahaa();
				jaddadsawt();
				rawaa();
			}
		},
		itlaqsawt: function (sinf) {
			if (medrec) {
				waqtibtidaa = (time.now()-waqtibtidaa)/1000;
				medrec.stop();
				medrec = 0;
				musajjal.sajil = 0;
				if (musajjal.mulhaq) {
					waqtissawt();
//					popdata(mfateeh.waqt, 'time');
					stopbtn();
					pausebtn();
				}
			}
			if (sinf === 2) {
				waqtibtidaa = 0;
				if (musajjal.mulhaq) {
					softkeys.havaf('5');
					softkeys.havaf('8');
					mfateeh.matn && izhar(mfateeh.matn);
				}
				jaddadsawt();
				if (musajjal.tasjeel) {
					ixtaf(mfateeh.hafr);
					musajjal.tasjeel = 0;
					rawaa(MSJLINTAHAA);
				}
			}
			rawaa();
		},
		isjal: function (haalah) {
			markooz && markooz().blur();
			if (musajjal.mulhaq) {
				izhar(mfateeh.sawt);
				mfateeh.matn && ixtaf(mfateeh.matn);
			}
			if (!('require' in window) && haalah) {
				if (haalah === -2) setdata(mfateeh.haalah, 'sawtmas3oob');
				else if (haalah === -1) setdata(mfateeh.haalah, 'sawtmasool');
				else
				navigator.permissions.query({name:'microphone'}).then(function(result) {
					var react = function (s) {
						if (s == 'granted') musajjal.isjal();
						else if (s == 'denied') musajjal.isjal(-2);
						else if (s == 'prompt') musajjal.isjal(-1);
					};
					/*result.onchange = function() {
						// will trigger recording always on perm change :(
						react(result.state);
					};*/
					react(result.state);
				});
			}
			else {
				jaddadsawt();
				navigator.mediaDevices.getUserMedia({
					audio: {
//						sampleRate: 8000,
//						sampleSize: 8,
						channelCount: 1,
					},
					video: false,
				}).then(function (stream) {
					medrec = new MediaRecorder(stream, {
						mimeType: mimetype,
						bitsPerSecond: kbps,
					});
					visualize(stream);
					var ajzaa = [];
					listener(medrec, 'dataavailable', function(e) {
						if (e.data.size > 0) {
							ajzaa.push(e.data);
							livesize += e.data.size;
						}
					});
					listener(medrec, 'stop', function () {
						if (musajjal.mulhaq) {
							musajjal.tasjeel = new Blob(ajzaa, { type: mimetype });
							fixwebm(musajjal.tasjeel, waqtibtidaa, function (fixedblob) {
								musajjal.sajil = 0;
								musajjal.tasjeel = fixedblob;
								musajjal.il3ab( URL.createObjectURL(musajjal.tasjeel) );
								rawaa(MSJLTASJEEL);
							}, { logger: 0 });
						}
						audctx.close();
						audctx = 0;
					});
					waqtissawt();
					waqtibtidaa = time.now();
					izhar(mfateeh.hafr);
					livesize = 0;
					medrec.start(2000);
					musajjal.sajil = 1;
					draw();
					rawaa(MSJLBADAA);
				});
			}
		},
	};
	
	recorder.play = recorder.il3ab;
	recorder.pause = recorder.inqata3;
	recorder.stop = recorder.intahaa;
	recorder.attach = recorder.iltahaq;
	recorder.detach = recorder.infasal;
	recorder.remove = recorder.itlaqsawt; // ? @TODO verify
	recorder.record = recorder.isjal;
	
	Hooks.set('restore', function () { // called on backstack changes
		musajjal.itlaqsawt(2);
	});

})();