//+ adaaf talaf axad nazzaf baddal malaf
/*
 * for kaios, needs readwrite permission
 * */
var malafaat, SDCARD, ROOT;
;(function(){
	var 
	getroot = function (callback) {
		SDCARD.getRoot().then(function (root) {
			ROOT = root;
			callback && callback(root);
		}, function () {
			webapp.header( translate('XPO.permissiondenied') );
		});
	},
	getfile = function (path, callback, readas) {
		var request = readas ? SDCARD.getEditable(path) : SDCARD.get(path);

		request.onsuccess = function () {
			var file = this.result;
			readas = readas || 0;
			if (readas < 1) {
				callback && callback(file);
			} else {
				var fr = new FileReader();

				fr.onloadend = function () {
					callback && callback(fr.result);
				};
				fr.onerror = function () {
					$.log(this.error);
				};
				
				if (readas === 2) fr.readAsArrayBuffer(file);
				else if (readas === 3) fr.readAsBinaryString(file);
				else fr.readAsText(file);
			}
		}

		request.onerror = function () {
			callback && callback(undefined, this.error);
			$.log(this.error);
		};
	},
	removefile = function (path, callback) {
		var request = SDCARD.delete(path);

		request.onsuccess = function () { callback && callback(); };

		request.onerror = function () {
			$.log(this.error.name); callback && callback();
		};
	};
	
	malafaat = {
		adaaf: function (path, data, callback, type) { // add
			$.taxeer(path, function () {
				removefile(path, function () {
					var file = new Blob([data], {type: type||'text/plain'});
					var request = SDCARD.addNamed(file, path);

					request.onsuccess = function () {
						callback && callback(this.result);
					};

					// An error typically occur if a file with the same name already exist
					request.onerror = function () {
						$.log(this.error);
					};
				});
			});
		},
		axad: function (path, callback, readas) { // get or getall
			if (path instanceof Array) {
				var q = $.queue(), arr = [];
				path.forEach(function (p) {
					if (p && p.length)
					q.set(function (done) {
						malafaat.axad(p, function (file) {
							arr.push(file);
							done(q);
						});
					});
				});
				q.run(function () {
					callback && callback(arr);
				});
			} else {
				getfile(path, callback, readas);
			}
		},
		malaf: function (dir, callback) { // get directory
			if (typeof dir === 'function') callback = dir, dir = undefined;

			var andthen = function () {
				if (typeof dir === 'string') {
					if (dir.startsWith('/')) dir = dir.substr(1);
					if (dir.endsWith('/')) dir = dir.slice(0, -1);
					
					var cursor = SDCARD.enumerateEditable(dir);
					var collection = [];
					cursor.onsuccess = function () {
						if (this.done) {
							callback && callback(collection);
						} else {
							collection.push(this.result);
							this.continue();
						}
					};
					cursor.onerror = function () {
						$.log( this.error );
					};
				} else {
					var getfrom = (dir || ROOT);
					getfrom.getFilesAndDirectories().then(function (files) {
						callback && callback(files);
					});
				}
			};

			if (ROOT) andthen();
			else getroot(function () { andthen(); });
		},
		baddal: function (oldpath, newpath, callback) { // change or rename
			malafaat.axad(oldpath, function (file) {
				malafaat.talaf(oldpath, function () {
					malafaat.adaaf(newpath, file, callback);
				});
			}, 1);
		},
		nazzaf: function (name) { // remove slash, some symbols etc, lowercase
			return (name||'').trim().toLowerCase().replace(/[\\\/]/g, '');
		},
		talaf: function (path, callback) { // delete
			removefile(path, callback);
		},
	};

	if (PRODUCTION)
	SDCARD = SDCARD || navigator.getDeviceStorage('sdcard');
})();