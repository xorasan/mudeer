var musajjal, recorder, Recorder, debug_recorder = 0,
MSJLXATAM		= 10	,	// playback ended
MSJLBADAA		= 30	,	// started recording
MSJLTASJEEL		= 60	,	// got recorded blob
MSJLINTAHAA		= 90	;	// exited recording
;(function(){
	'use strict';
	var stop_softkey = { n: 'Stop',
			k: 's',
			alt: 1,
			c: function () {
				Recorder.stop();
			},
			i: 'iconstop',
		},
		pause_softkey = { n: 'Pause',
			k: 'p',
			alt: 1,
			c: function () {
				Recorder.pause();
			},
			i: 'iconpause',
		};

	var sawt, media_recorder, initial_time, mfateeh, audctx, cnvctx,
	kbps = 12*1000, livesize = 0, module_name = 'recorder', module_title = 'Recorder',
	mimetype = 'audio/webm;codecs="opus"',
	audanlzr, dataarr, buflen,
	bigx = 0, drawto, portion,
	draw = function () {
		if (Recorder.attached) {
			var w = mfateeh.hafr.width;
			var h = mfateeh.hafr.height;
		
			if (Recorder.recording) {
				clearTimeout(drawto);
				drawto = setTimeout(draw, 200);
			}
			
			if (initial_time) {
				var t = Math.round((Time.now()-initial_time)/1000);
				innertext(mfateeh.awqaat, '() '+t+'s --- '+parsefloat(livesize/1024, 1)+'kB');
				if (t >= 60) Recorder.itlaqsawt();
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
		if (!mfateeh.hafr) $.log.w(module_name, 'graph element not found');
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
		Recorder.duration = 0;
		Recorder.file_size = 0;
		if (sawt) {
			if (!sawt.paused) sawt.pause();
			sawt.remove();
		}
		if (Recorder.attached) {
			setcss(mfateeh.irtiqaa, 'l');
			innertext(mfateeh.awqaat, '');
		}
		sawt = new Audio();
		sawt.ontimeupdate = function () {
			do_playback_time();
		};
		sawt.onended = function () {
			Recorder.stop();
		};
		sawt.onplay = function () {
			// TODO
		};
		sawt.onpause = function () {
			// TODO
		};
	},
	do_playback_time = function () {
		if (Recorder.attached) {
			var t = Recorder.duration || sawt.duration;
			var file_size = Recorder.recorded_blob ? Recorder.recorded_blob.size : Recorder.file_size;
			if (Recorder.recording) {
			} else
			if (isnum(t)) {
				var str = (sawt.paused ? '||' : '>>')
						+' '+Math.round(sawt.currentTime)+' / '+Math.round(t)+'s';
				if (file_size) str += ' --- '+Math.round(file_size/1024)+'kB';
				innertext(mfateeh.awqaat, str);
				var w = sawt.currentTime/t *100;
				if (w < 101) setcss(mfateeh.irtiqaa, 'left', w+'%');
			}
		}
	},
	pausebtn = function () {
		Softkeys.add(pause_softkey);
	},
	stopbtn = function () {
		Softkeys.add(stop_softkey);
	},
	rewindbtn = function () {
		Softkeys.add({ n: 'Rewind',
			k: 'r',
			alt: 1,
			c: function () {
				Recorder.irja3();
			},
			i: 'iconfastrewind',
		});
	},
	forwardbtn = function () {
		Softkeys.add({ n: 'Forward',
			k: 'f',
			alt: 1,
			c: function () {
				Recorder.id3am();
			},
			i: 'iconfastforward',
		});
	},
	relay_event = function (nabaa) { // relay event
		Hooks.run('musajjal', nabaa);
		Hooks.run('recorder', nabaa);
	};
	
	function apply_mode() {
		// Recording
//		if (Recorder.recording)
		// Paused Recording
//		if (Recorder.recording)
		// Has Recording Blob
		// Playing
		// Paused Playback
		// Hidden
		// 
	}
	
	recorder = Recorder = musajjal = {
		duration: 0, // override duration
		file_size: 0, // override size
		attached: 0, // is attached to elements
		playing: 0, // is playing
		recording: 0, // is recording
		recorded_blob: 0, // recording blob
		busy: function () {
			return /*Recorder.playing || */Recorder.recording || Recorder.recorded_blob;
		},
		play: async function (address) { // play
			if (debug_recorder) $.log.w(module_title, 'play', address);
			if (Recorder.recording) {
				Webapp.itlaa3('cannot play this while recording...');
			} else
			if (Recorder.attached) {
				izhar(mfateeh.sawt);

				if (address) {
					relay_event(MSJLXATAM);
					sawt.src = address;
					var { duration, size } = await sawthafr.get_duration(address);
					Recorder.duration = duration;
					Recorder.file_size = size;
					sawt.currentTime = 0;
					sawt.play();
				} else {
					sawt.play();
				}
				pausebtn();
				stopbtn();
				setdata(mfateeh.sawt, 'playing', 1);
				Recorder.playing = 1;
				relay_event();
			}
		},
		pause: function (dont_play) { // pause
			if (Recorder.recording) {
				Recorder.itlaqsawt(2);
			}
			if (Recorder.attached && sawt) {
				if (sawt.ended) sawt.currentTime = 0;
				if (sawt.paused) {
					if (!dont_play) Recorder.play();
				}
				else {
					sawt.pause();
					popdata(mfateeh.sawt, 'playing');
					Recorder.playing = 0;
					relay_event();
				}
			}
		},
		stop: function () { // stop
			if (Recorder.attached && sawt) {
				ixtaf(mfateeh.sawt);
				sawt.currentTime = 0;
				if (sawt.paused) {
					if (!Recorder.recorded_blob) {
						jaddadsawt();
						Softkeys.remove(pause_softkey);
						Softkeys.remove(stop_softkey );
						relay_event(MSJLXATAM);
					}
				}
			}
			Recorder.pause(1);
			relay_event();
		},
		attach: function (m) { // attach
			if (m) {
				mfateeh = m;
				ixtaf(mfateeh.hafr);
				Recorder.attached = 1;
				relay_event();
			}
		},
		infasal: function () { // detach
			if (Recorder.attached) {
				mfateeh = 0;
				cnvctx = 0;
				Recorder.attached = 0;
				Recorder.stop();
				jaddadsawt();
				relay_event();
			}
		},
		itlaqsawt: function (sinf) {
			if (media_recorder) {
				initial_time = (time.now()-initial_time)/1000;
				media_recorder.stop();
				media_recorder = 0;
				popdata(mfateeh.sawt, 'recording');
				Recorder.recording = 0;
				if (Recorder.attached) {
					do_playback_time();
//					popdata(mfateeh.waqt, 'time');
					stopbtn();
					pausebtn();
				}
			}
			if (sinf === 2) {
				initial_time = 0;
				if (Recorder.attached) {
					Softkeys.remove(pause_softkey);
					Softkeys.remove(stop_softkey );
					mfateeh.matn && izhar(mfateeh.matn);
				}
				jaddadsawt();
				if (Recorder.recorded_blob) {
					ixtaf(mfateeh.hafr);
					Recorder.recorded_blob = 0;
					relay_event(MSJLINTAHAA);
				}
			}
			relay_event();
		},
		isjal: function (state) {
			markooz && markooz().blur();
			if (Recorder.attached) {
				izhar(mfateeh.sawt);
				mfateeh.matn && ixtaf(mfateeh.matn);
			}
			if (!('require' in window) && state && mfateeh.state) {
				if (state === -2) setdata(mfateeh.state, 'sawtmas3oob');
				else if (state === -1) setdata(mfateeh.state, 'sawtmasool');
				else {
					navigator.permissions.query({
						name: 'microphone'
					}).then(function(result) {
						var react = function (s) {
							if (s == 'granted') Recorder.isjal();
							else if (s == 'denied') Recorder.isjal(-2);
							else if (s == 'prompt') Recorder.isjal(-1);
						};
						/*result.onchange = function() {
							// will trigger recording always on perm change :(
							react(result.state);
						};*/
						react(result.state);
					});
				}
			}
			else {
				jaddadsawt();
				navigator.mediaDevices.getUserMedia({
					audio: {
//						sampleRate: 8000,
//						sampleSize: 8,
						channelCount: 1,
					},
					noiseSuppression: true,
					echoCancellation: true,
					autoGainControl: false,
					video: false,
				}).then(function (stream) {
					media_recorder = new MediaRecorder(stream, {
						mimeType: mimetype,
						bitsPerSecond: kbps,
					});
					visualize(stream);
					var ajzaa = [];
					listener(media_recorder, 'dataavailable', function(e) {
						if (e.data.size > 0) {
							ajzaa.push(e.data);
							livesize += e.data.size;
						}
					});
					listener(media_recorder, 'stop', function () {
						if (Recorder.attached) {
							Recorder.recorded_blob = new Blob(ajzaa, { type: mimetype });
							fixwebm(Recorder.recorded_blob, initial_time, function (fixedblob) {
								popdata(mfateeh.sawt, 'recording');
								Recorder.recording = 0;
								Recorder.recorded_blob = fixedblob;
								Recorder.play( URL.createObjectURL(Recorder.recorded_blob) );
								relay_event(MSJLTASJEEL);
							}, { logger: 0 });
						}
						audctx.close();
						audctx = 0;
					});
					do_playback_time();
					initial_time = time.now();
					izhar(mfateeh.hafr);
					livesize = 0;
					media_recorder.start(2000);
					setdata(mfateeh.sawt, 'recording', 1);
					Recorder.recording = 1;
					draw();
					relay_event(MSJLBADAA);
				});
			}
		},
	};
	
	Recorder.il3ab   = Recorder.play;
	Recorder.inqata3 = Recorder.pause;
	Recorder.intahaa = Recorder.stop;
	Recorder.iltahaq = Recorder.attach;
	Recorder.detach  = Recorder.infasal;
	Recorder.remove  = Recorder.itlaqsawt; // ? @TODO verify
	Recorder.record  = Recorder.isjal;
	
	Hooks.set('restore', function () { // called on backstack changes
		Recorder.itlaqsawt(2);
	});

})();