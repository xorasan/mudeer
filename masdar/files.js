/*
	Files - 02 Aug 2016
		  - 11 Nov 2016
		  - 22 May 2018	add sync retrieval support
*/
var Files;
;(function () {
	'use strict';
	Files = {
		data: {},
		cache: {},
		fs: false,
		path: false,
		basepath: false,
		s: false,
		init: function () {
			if (Files.fs === false) {
				if (typeof require === 'function') { // use node fs
					try { Files.fs = require('fs-extra'); }
					catch (e) { Files.fs = require('fs'); }
					
					Files.path = require('path');
					Files.s = Files.path.sep;
					var __dirname = '';
						if (typeof process === 'object') {
							__dirname = process.execPath.match(/(.*)\/.*$/)[1];
						}
					Files.basepath = __dirname;
				} else { // use h5 file api
					
				}
			}
		},
		// dummy function
		exists: {
			file: function (path) {
				var yes = 1;
				try {
					Files.get.file(path);
				} catch (e) {
					if (e.code !== 'EISDIR') yes = 0;
				}
				return yes;
			},
			folder: function () {
				var yes = 1;
				try {
					Files.get.folder(path);
				} catch (e) {
					yes = 0;
				}
				return yes;
			},
		},
		stats: function (path, cb) {
			if (typeof cb === 'function') {
				Files.fs.lstat(path, cb);
				return true;
			} else {
				return Files.fs.lstatSync(path);
			}
		},
		realpath: function (path, cache, cb) {
			if (typeof cache === 'function') {
				cb = cache;
				cache = {};
			}
			
			if (typeof cb === 'function') {
				Files.fs.realpath(path, cache, cb);
				return true;
			} else {
				return Files.fs.realpathSync(path, cache);
			}
		},
		/*
		 * if cb is not a func, uses sync methods
		 */
		get: {
			file: function (path, cb, options) {
				if (typeof cb === 'function') {
					var innercb = function (err, data) {
						cb(data, err); // data, err
					}
					Files.fs.readFile(path, innercb);
					return true;
				} else {
					return Files.fs.readFileSync(path);
				}
				return false;
			},
			folder: function (path, cb, options) {
				if (typeof cb === 'function') {
					var innercb = function (err, data) {
						cb(data);
						if (err) throw err;
					}
					Files.fs.readdir(path, innercb);
					return true;
				} else {
					return Files.fs.readdirSync(path);
				}
				return false;
			}
		},
		set: {
			symlink: function (srcpath, dstpath, cb) {
				if (typeof cb === 'function') {

					var innercb = function (b, c) {
						cb(c);
						if (b) throw b;
					}

					Files.fs.symlink(srcpath, dstpath, innercb);
					return true;
				} else {
					try {
						Files.fs.symlinkSync(srcpath, dstpath);
					} catch (e) {
//						$.log.s( e );
					}
					return true;
				}
				
			},
			file: function (path, cb, data) {
				if (typeof cb === 'function') {

					var innercb = function (b, c) {
						cb(c);
						if (b) throw b;
					}

					// if data is not set
					if (data === undefined) {

						// check if file exists
						Files.get.file(path, function (data, err) {
							
							// if it doesn't exist
							if (err) {
								
								// create it with an empty body
								Files.fs.writeFile(path, '', innercb);

							} else {
								
								innercb(null);
								
							}
							
						});
						
					} else {
						
						Files.fs.writeFile(path, data, innercb);
						
					}
					return true;
				} else {
					return Files.fs.writeFileSync(path, cb);
				}
				return false;
			},
			folder: function (path, mask, cb) {
				// allow the `mask` parameter to be optional
				if (typeof mask === 'function') {
					cb = mask;
					mask = '0777';
				}
				if (typeof cb === 'function') {
					Files.fs.mkdir(path, mask, function(err) {
						if (err) {
							// ignore the error if the folder already exists
							if (err.code == 'EEXIST') cb(null);
							// something else went wrong
							else cb(err);
						// successfully created folder
						} else cb(null);
					});
				} else {
					mask = mask || '0777';
					try {
						Files.fs.mkdirSync(path, mask)
					} catch (e) {
//						$.log.s( e );
					}
					return true;
				}
			}
		},
		move: function (oldPath, newPath, callback) {
			function copyunlink () {
				var readStream = Files.fs.createReadStream(oldPath);
				var writeStream = Files.fs.createWriteStream(newPath);

				readStream.on('error', callback);
				writeStream.on('error', callback);

				readStream.on('close', function () {
					Files.fs.unlink(oldPath, callback);
				});

				readStream.pipe(writeStream);
			}

			Files.fs.rename(oldPath, newPath, function (err) {
				if (err) {
					if (err.code === 'EXDEV') {
						copyunlink();
					} else {
						callback(err);
					}
					return;
				}
				callback();
			});
		},
		copy: function (oldPath, newPath, callback) {
			if (typeof callback === 'function') {
				Files.fs.copyFile(oldPath, newPath, function (err) {
					if (err) {
						callback(err);
						return;
					}
					callback();
				});
			} else {
				Files.fs.copyFileSync(oldPath, newPath);
			}
		},
		pop: {
			file: function (path, cb) {
				if (typeof cb === 'function') {
					Files.fs.unlink(path, cb);
				} else {
					Files.fs.unlinkSync(path);
				}
				return true;
			},
			folder: function (path, cb, rf) {
				if (typeof cb === 'function') {
					if (rf)
						Files.fs.remove(path, cb);
					else
						Files.fs.rmdir(path, cb);
				} else {
					if (rf)
						Files.fs.removeSync(path);
					else
						Files.fs.rmdirSync(path);
				}
				return true;
			}
		}
	};
	Files.init();
	module.exports = Files;
})();
