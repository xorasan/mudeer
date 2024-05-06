var raafi3, uploader, Uploader,
RF3BADAA		= 10	,	// started conversion
RF3XATAM		= 30	,	// conversion finished
RF3TASJEEL		= 60	,	// got converted blob
RF3INTAHAA		= 90	;	// exited process
;(function(){
	'use strict';
	
	var mfateeh, quality = 0.4, oldsize,
	sizeinkb = function (v) {
		return parsefloat(v/1024, 1)+'kB';
	},
	scalewithaspect = function (sw, sh, tw, th, onlydown) {
		var rw = tw / sw,
			rh = th / sh,
			r  = rw < rh ? rw : rh;
		if (r >= 1 && onlydown) return [sw, sh, r];
		return [Math.round(sw*r), Math.round(sh*r), r];
	},
	oninput = function (file) { if (file) {
		mfateeh.text && ixtaf(mfateeh.text);
		izhar(mfateeh.photo);
		rawaa(RF3BADAA);
		innertext(mfateeh.tafseel, 'Loading...');
		mfateeh.preview.onload = function () {
			var sw		= mfateeh.preview.naturalWidth		,
				sh		= mfateeh.preview.naturalHeight		,
				cnvs	= new OffscreenCanvas(sw, sh)		,
				ctx		= cnvs.getContext('2d')				,
				r		= scalewithaspect(sw, sh, 1920, 1080, 1),
				cnvs2	= new OffscreenCanvas(r[0], r[1])	;
			
			var oldsize = '<i>'+sizeinkb(file.size)+'</i> <b>'+sw+'x'+sh+'</b>';
			
			innerhtml(mfateeh.tafseel, 'Converting... from '+oldsize);
			ctx.drawImage(mfateeh.preview, 0, 0);
			pica().resize(cnvs, cnvs2, {}, function (err) { $.log( err ); })
			.then(function (c) {
				c.convertToBlob({ type: 'image/jpeg', quality })
				.then(function (b) {
					URL.revokeObjectURL(mfateeh.preview.src);
					raafi3.marfoo3 = b;
					var url = URL.createObjectURL(b);
					mfateeh.preview.onload = function () {
						innerhtml(mfateeh.tafseel, oldsize+' to <i>'+sizeinkb(b.size)+'</i> <b>'+r[0]+'x'+r[1]+'</b>');
						rawaa(RF3XATAM);
						URL.revokeObjectURL(url);
					};
					mfateeh.preview.src = url;
				});
			});
		};
		mfateeh.preview.src = URL.createObjectURL(file);
	}},
	rawaa = function (nabaa) { // relay event
		Hooks.run('raafi3', nabaa);
		Hooks.run('uploader', nabaa);
	};
	
	Uploader = uploader = raafi3 = {
		hajam: 0, // override size
		naqal: 0, // is converting the upload
		mulhaq: 0, // is attached to elements
		marfoo3: 0, // blob to upload
		size_in_kb: sizeinkb,
		mashghool: function () {
			return raafi3.naqal || raafi3.marfoo3;
		},
		intahaa: function () { // stop
			Uploader.marfoo3 = 0;
			if (Uploader.mulhaq) {
				
			}
			rawaa(RF3INTAHAA);
		},
		iltahaq: function (m) { // attach
			if (m) {
				mfateeh = m;
				mfateeh.upload_photo.oninput = function () {
					Uploader.intaxab( mfateeh.upload_photo.files[0] );
				};
				Uploader.mulhaq = 1;
				rawaa();
			}
		},
		infasal: function () { // detach
			if (Uploader.mulhaq) {
				mfateeh = 0;
				Uploader.mulhaq = 0;
				Uploader.intahaa();
				rawaa();
			}
		},
		intaxab: function (file) { // pick
			markooz && markooz().blur();
			if (Uploader.mulhaq) oninput(file);
		},
	};

	Uploader.busy	= Uploader.mashghool;
	Uploader.stop	= Uploader.intahaa	;
	Uploader.attach	= Uploader.iltahaq	;
	Uploader.detach	= Uploader.infasal	;
	Uploader.pick	= Uploader.intaxab	;

	Hooks.set('restore', function () { // called on backstack changes
	});

})();