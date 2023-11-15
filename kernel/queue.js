//+ _init _next _process run onnext onfinish uid count _didinit _didrun queuearray
//+ _onnext _onfinish intahaa muntahaa
;(function (){
	var _queuePrototype = {
		_init: function () {
			if (!this._didinit) {
//				console.log('_init');
				this._didinit = true;
				this._didrun = false;
				
				this.queuearray = [];
				this.active = false;
				this.count = 0;
				this.uid = false;
				this._onnext = false;
				this._onfinish = false;
			}
		},
		_next: function (queue, extra) {
//			console.log('_next');
			++queue.count;
			queue._process(queue, extra);
			queue.active = false;
			return queue.count;
		},
		_process: function (queue, extra) {
//			console.log('_process');
			if (queue.muntahaa) return;
			if (typeof queue._onnext === 'function') {
				if (queue.queuearray.length > 0) {
					queue.uid = queue.queuearray.length;
					queue.active = true;
					
					var worker = queue.queuearray.pop();
					var done = function (queue, extra) {
						queue._onnext(queue._next, queue, extra);
					};
					
					worker(done, queue, extra);
					
					return false;
				} else {
					queue.active = false;
					--queue.count;
					if (typeof queue._onfinish === 'function') {
						queue._onfinish(queue, extra);
					}
					return false;
				}
			}
		},
		intahaa: function () {
			this.muntahaa = 1
		},
		set: function (worker) {
//			console.log('set');
			this._init();
			
			if (typeof worker === 'function') {
				this.queuearray.unshift(worker);
			}
			
			return this;
		},
		run: function (_onfinish) {
//			console.log('run');

			this.onfinish(_onfinish);

			var queue = this;
			queue._init();
			
			// if there's no _onnext fn set, use the built in one
			if (typeof queue._onnext !== 'function') {
				queue.onnext(function (done, _queue, extra) {
					done(_queue, extra);
				});
			}
			
			if (!queue._didrun
			&&	typeof queue._onnext === 'function') {
				queue._didrun = true;
				
				queue._process(queue);
			}
		},
		onnext: function (cb) {
			if (typeof cb === 'function') {
				this._onnext = cb;
			}
		},
		onfinish: function (cb) {
			if (typeof cb === 'function') {
				this._onfinish = cb;
			}
		}
	};
	
	$.queue = function (onnext, onfinish) {
		var newqueue = Object.create(_queuePrototype);
		newqueue._init();
		
		if (typeof onnext === 'function') {
			newqueue._onnext = onnext;
		}
		if (typeof onfinish === 'function') {
			newqueue._onfinish = onfinish;
		}
		
		return newqueue;
	};
	
//	var ourarray = [
//		{text: 'one', num: 1},
//		{text: 'two', num: 2},
//		{text: 'three', num: 3},
//		{text: 'four', num: 4}
//	];
//	
//	var finalarray = [];
//	
//	var ourworker = function (done, queue) {
//		$.log.s('ourworker', queue.count, ourarray[queue.count].text);
//		var extra = {com: ourarray[queue.count].text+ourarray[queue.count].num};
//		done(queue, extra);
//	};
//	
//	var ouronnext = function (done, queue, extra) {
//		$.log.s('ouronnext', queue.count, ourarray[queue.count].text);
//		finalarray.push(extra);
//		done(queue);
//	};
//	
//	var ouronfinish = function (queue) {
//		$.log.s('ouronfinish', queue.count);
//		for (var i in finalarray) {
//			console.log(finalarray[i]);
//		}
//	};
//	
//	var queue = $.queue(ouronnext, ouronfinish);
//	for (var i in ourarray) {
//		queue.set(ourworker);
//	}
//	queue.run();

})();
