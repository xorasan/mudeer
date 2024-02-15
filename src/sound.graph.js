//+ 
var sound = sound || {};
var Sound = Sound || sound;
var sawthafr, audio_graph;
;(function(){
	'use strict';
	
	// Set up audio context
	var audioContext;

	audio_graph = sawthafr = {
		axavmuddah: function (url, cb) {
			fetch(url).then(function(a) {
				a.body.getReader().read().then(function (v) {
					var rawsize = v.value.buffer.byteLength;
					if (!audioContext) audioContext = new AudioContext();
					audioContext.decodeAudioData(v.value.buffer).then(function (audioBuffer) {
						if (isfun(cb)) cb(audioBuffer.duration, rawsize);
					});
				});
			});
		},
		/**
		 * Retrieves audio from an external source, the initializes the drawing function
		 * @param {String} url the url of the audio we'd like to fetch
		 */
		drawaudio: function (canvas, url, vertical, pxpersec) {
			var then;
			fetch(url).then(function(a) {
				a.body.getReader().read().then(function (v) {
					var rawsize = v.value.buffer.byteLength;
					if (!audioContext) audioContext = new AudioContext();
					$.taxeer('XPO.qatraudioctx', function () {
						audioContext.close();
						audioContext = 0;
					}, 5*1000);
					audioContext.decodeAudioData(v.value.buffer).then(function (audioBuffer) {
						var size = 0;
						if (canvas instanceof HTMLCanvasElement) size = vertical ? canvas.height : canvas.width
						else size = canvas;
						
						if (pxpersec)
							size = Math.floor(audioBuffer.duration * pxpersec);
						
						if (canvas instanceof HTMLCanvasElement) {
							if (vertical) canvas.height = size;
							else canvas.width = size;
							var ctx = canvas.getContext('2d');
							ctx.restore();
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							ctx.save();
							if (vertical)
								ctx.translate(canvas.width / 2, 0); // set X = 0 to be in the middle of the canvas
							else 
								ctx.translate(0, canvas.height / 2); // set Y = 0 to be in the middle of the canvas
						}
						
		
						var filtered = sawthafr.normalizeData(
							sawthafr.filterData( size, audioBuffer )
						);
						if (typeof then == 'function') then(audioBuffer, filtered, rawsize);
		
						if (canvas instanceof HTMLCanvasElement)
						return sawthafr.draw(
							canvas,
							filtered,
							vertical
						);
					});
				})
			});
			return {
				then: function (cb) { if (typeof cb == 'function') then = cb; }
			};
		},
		/**
		 * Filters the AudioBuffer retrieved from an external source
		 * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
		 * @returns {Array} an array of floating point numbers
		 */
		filterData: function (samples, audioBuffer) {
			// samples: Number of samples we want to have in our final data set
			var rawData;
			if (audioBuffer instanceof Array)
				rawData = audioBuffer;
			else
				rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data

			var blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
			var filteredData = [];
			for (var i = 0; i < samples; i++) {
				var blockStart = blockSize * i; // the location of the first sample in the block
				var sum = 0;
				for (var j = 0; j < blockSize; j++) {
//					sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
					sum = sum + rawData[blockStart + j]; // find the sum of all the samples in the block
				}
				filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
			}
			return filteredData;
		},
		/**
		 * Normalizes the audio data to make a cleaner illustration 
		 * @param {Array} filteredData the data from filterData()
		 * @returns {Array} an normalized array of floating point numbers
		 */
		normalizeData: function (filteredData) {
			var multiplier = Math.pow(Math.max(...filteredData), -1);
			return filteredData.map(n => n * multiplier);
		},
		/**
		 * Draws the audio file into a canvas element.
		 * @param {Array} normalizedData The filtered array returned from filterData()
		 * @returns {Array} a normalized array of data
		 */
		draw: function (canvas, normalizedData, vertical) {
			var ctx = canvas.getContext('2d');
			if (vertical) {
				// draw the line segments
				var width = canvas.height / normalizedData.length;
				for (var i = 0; i < normalizedData.length; i++) {
					var y = width * i;
					var height = normalizedData[i] * canvas.width;
					if (height < 0) {
						height = 0;
					} else if (height > canvas.width / 2) {
						height = height > canvas.width / 2;
					}
					sawthafr.line(ctx, y, height, (i + 1) % 2, vertical);
				}
			}
			else {
				// draw the line segments
				var width = canvas.offsetWidth / normalizedData.length;
				for (var i = 0; i < normalizedData.length; i++) {
					var x = width * i;
					var height = normalizedData[i] * canvas.height;
					if (height < 0) {
						height = 0;
					} else if (height > canvas.height / 2) {
						height = height > canvas.height / 2;
					}
					sawthafr.line(ctx, x, height, (i + 1) % 2, vertical);
				}
			}
		},
		/**
		 * A utility function for drawing our line segments
		 * @param {AudioContext} ctx the audio context 
		 * @param {number} x  the x coordinate of the beginning of the line segment
		 * @param {number} height the desired height of the line segment
		 * @param {number} width the desired width of the line segment
		 * @param {boolean} isEven whether or not the segmented is even-numbered
		 */
		line: function (ctx, x, height, isEven, vertical) {
			ctx.lineWidth = 1; // how thick the line is
			ctx.strokeStyle = themes.get('XPO.text'); // what color our line is
			ctx.beginPath();
			height = isEven ? height : -height;
			if (vertical) {
				ctx.moveTo(0, x);
				ctx.lineTo(height, x);
			} else {
				ctx.moveTo(x, 0);
				ctx.lineTo(x, height);
			}
//			ctx.arc(x + width / 2, height, width / 2, Math.PI, 0, isEven);
//			ctx.lineTo(x + width, 0);
			ctx.stroke();
		},
	};
	
	sound.graph = sawthafr;
})();