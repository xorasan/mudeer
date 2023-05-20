//+ array _array _keys alter unique order onadd onset _id toNative each clean
//+ saabiq qaadim
;(function (){
	var _arrayPrototype = {
		set: function (id, object) {
			if (this._keys[id] !== undefined) { // update
				if (typeof object === 'function') {
					this._array[this._keys[id]] = object(this._array[this._keys[id]]);
				} else {
					this._array[this._keys[id]] = object;
				}

				typeof this.onset === 'function' && this.onset(object, id);

			} else { // add
				if (typeof object === 'function') {
					this._keys[id] = this._array.push(
												object(this._array[this._keys[id]])
											) - 1;
				} else {
					this._keys[id] = this._array.push(object) - 1;
				}
				
				typeof this.onadd === 'function' && this.onadd(object, id);
				
				++this.length;
			}
			return this;
		},
		alter: function (id, object) {
			var item = this.get(id);
			if (item) {
				this.set( id , Object.assign( item, object ) );
			}
			return this;
		},
		pop: function (id) {
			if (this._keys[id] !== undefined) {

				typeof this.onpop === 'function' && this.onpop(id);

				this._array[this._keys[id]] = undefined;
				delete this._keys[id];
				--this.length;
			}
			return this;
		},
		popall: function (array) {
			if (typeof array.toNative === 'function') array = array.toNative();
			
			for (var i in array) {
				this.pop( array[i] );
			}
		},
		get: function (id) {
			if (this._keys[id] > -1) {
				return this._array[ this._keys[id] ];
			} else {
				return undefined;
			}
		},
		each: function (fn) {
			if (typeof fn === 'function') {
				for (var i in this._array) {
					if (this._array[i] !== undefined) {
						var val = fn(this._array[i], i);
						// if a value is returned, replace the internal one
						if (val !== undefined) {
							this._array[i] = val;
						}
					}
				}
			}
		},
		/*
		 * this supports both native and Ge arrays
		 * id is the prop name in array that you want to be the id
		 * */
		setall: function (id, array) {
			this._id = id;
			if (typeof array.toNative === 'function') array = array.toNative();

			for (var i in array) {
				this.set( array[i][id], array[i] );
			}
		},
		unique: function () {
			var uniquearray = [];
			
			this._array.forEach(function (item) {
				if (uniquearray.indexOf(item) === -1)
					uniquearray.push(item);
			});
			
			return uniquearray;
		},
		order: function (order) {
			var ordered = [];

			for (var i in order) {
				var val = order[i];
				
				var index = this._array.indexOf(val);
				if (index > -1) {
					ordered.push( this._array[index] );
					this._array.splice(index, 1);
				}
			}
			
			return ordered.concat(this._array);
		},
		slice: function (from, to) {
			var nativearr = $.array();

			this.each(function (item, i) {
				if (i >= from && i <= to)
					nativearr.set(item.XPO.uid, item);
			});
			
			return nativearr;
		},
		/*
		 * id is the prop name in array that you want to be the id
		 * key is the prop you want to compare for order
		 * */
		sort: function (reverse, key, id) {

			var temparray = this.toNative();
			if (typeof reverse === 'function') {
				temparray.sort(reverse);
			} else {
				temparray.sort(function (a, b) {
					if (reverse) {
						if (key) {
							return b[key]-a[key];
						} else {
							return b-a;
						}
					} else {
						if (key) {
							return a[key]-b[key];
						} else {
							return a-b;
						}
					}
				});
			}

			if (id || this._id) {
				this._array = [];
				this.length = 0;
				this._keys = {};

				this.setall(id || this._id, temparray);
			}
			
			return this;
		},
		/*reverse: function (id, order) {
			// id is the prop name in array that you want to be the id
			this._array.reverse();
			this.setall(id, this._array);
			
			return this;
		},*/
		/*
		 * the new non-camelcase format in effect since 29nov2018
		 * returns all keys that are not 'undefined'
		 * returns native array
		 * */
		tokeys: function () {
			var arr = [], keys = Object.keys(this._keys);
			for (var i in keys) {
				if (keys[i] !== undefined)
					arr.push( keys[i] );
			}
			return arr;
		},
		saabiq: function (uid) {
			var index = this._keys[uid];
			if (!isundef(index) && index > -1) {
				for (var i = index-1; i >= 0; --i) {
					if (!isundef(this._array[i])) {
						return this._array[i];
					}
				}
			}
		},
		qaadim: function (uid) {
			var index = this._keys[uid];
			if (!isundef(index) && index > -1) {
				for (var i = index+1; i < this._array.length; ++i) {
					if (!isundef(this._array[i])) {
						return this._array[i];
					}
				}
			}
		},
		eawwad: function (uid, uid2) { // swap objects in array to change order
			var index = this._keys[uid];
			var index2 = this._keys[uid2];
			if (index > -1 && index2 > -1) {
				this._keys[uid] = index2;
				this._keys[uid2] = index;
				var temp = this._array[index];
				this._array[index] = this._array[index2];
				this._array[index2] = temp;
			}
		},
		toNative: function () {
			var arr = [];
			for (var i in this._array) {
				if (this._array[i] !== undefined) {
					arr.push(this._array[i]);
				}
			}
			return arr;
		}
	};
	
	$.array = function (prearray, id) {
		var newqueue = Object.create(_arrayPrototype);
		
		prearray = prearray || [];
		if (typeof prearray.toNative === 'function') prearray = prearray.toNative();
		
		newqueue._array		= prearray;
		newqueue._keys		= {};
		newqueue._id		= id;
		
		if (id)
			prearray.forEach(function (item, i) {
				newqueue._keys[ item[id] ] = i;
			});

		newqueue.length		= newqueue._array.length;
		
		return newqueue;
	};

	$.array.clean = function (arr) {
		var arr2 = [];
		if (arr) arr.forEach(function (item, i) {
			arr2.push(item);
		});
		return arr2;
	};

})();
