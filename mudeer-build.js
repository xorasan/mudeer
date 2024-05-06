/*
 * mudeer-build (build+release a project)
 * 
 * you can optionally specify a path where it'll put the released file
 * 
 * */

'use strict';
global.$ = require(__dirname+'/kernel.js');
$.path = __dirname;
var Hooks, Cli, Files, Uglify, Weld, path = require('path'), prepad = 0;

var printsize = function (name, sizebytes) {
	Cli.echo( ' '+name+' ^dim^'+Math.round(sizebytes/1024)+'kB~~' );
};
var version = function (v) {
	var minor = v % 10;
	var major = (v - minor) % 100;
	var main = (v - major - minor);
	return (main/100)+'.'+(major/10)+'.'+minor;
};
var makemanifest = function (args, conf, BUILDNUMBER, xpath) {
	var origin = 'app://';
	var root = '';
	if (conf.root) root += conf.root;

	if (conf.origin) origin += conf.origin;
	else origin += (conf.appname||conf.name)+'.xorasan';

	var manifest = {
		version: version(BUILDNUMBER),
		name: conf.appname || conf.name,
		subtitle: conf.sub || '',
		description: conf.desc || '',
		display: 'standalone',
		fullscreen: conf.fullscreen || undefined,
		cursor: conf.cursor || 'false',
		background_color: conf.bg || undefined,
		type: conf.type,
		role: conf.role,
		start_url: root+"/",
		launch_path: root+"/",
		developer: {
			name: "Hasan Xorasani",
			url: "mailto:hxorasani@gmail.com",
		},
		locales: {
			"en-US": {
				name: conf.appname || conf.name,
				subtitle: conf.sub || '',
				description: conf.desc || '',
			}
		},
		default_locale: "en-US",
//		orientation: 'default',
	};

	manifest.icons = [{
		src: root+"/e.png",
		sizes: "512x512"
	}];
	
	Files.set.file( xpath+'manifest.json', JSON.stringify( manifest, null, '\t' ) );

	manifest.origin = origin;
	manifest.icons = {
		"56": root+"/0.png",
		"112": root+"/1.png",
	};
	manifest.chrome = {
		statusbar: 'overlap'
	};
	
	if (typeof conf['activities'] == 'object') {
		manifest['activities'] = conf['activities'];
	}
	
	if (typeof conf['datastores-owned'] == 'object') {
		manifest['datastores-owned'] = conf['datastores-owned'];
	}
	
	if (typeof conf['datastores-access'] == 'object') {
		manifest['datastores-access'] = conf['datastores-access'];
	}
	
	if (typeof conf.access == 'object') {
		manifest.permissions = Object.assign({}, conf.access);
		for (var i in manifest.permissions) {
//			$.log(i, manifest.permissions[i]);
			if (typeof manifest.permissions[i] == 'string'
			&& manifest.permissions[i] === '{}') {
				manifest.permissions[i] = {};
			}
		}
	}

	Files.set.file( xpath+'manifest.webapp', JSON.stringify( manifest, null, '\t' ) );
	
	var packagejson = {
		name: conf.name,
		main: xpath+'index.html',
		// to show js files in devtools sources
		"chromium-args": '--disable-features=ProcessPerSiteUpToMainFrameThreshold',
	};
	
	packagejson.window = packagejson.window || {};

	packagejson.window.icon = 'pub/e.png';
	
	if (typeof conf.frame == 'boolean') {
		packagejson.window.frame = String(conf.frame);
	}

	if (conf.height || conf.width) {
		packagejson.window.width = parseInt(conf.width||0);
		packagejson.window.height = parseInt(conf.height||0);
	}
	
	if (conf.bg == 'transparent') {
		packagejson.window.frame = false;
		packagejson.window.transparent = true;
	}
	
//	Files.set.file( xpath+'package.json', JSON.stringify( packagejson, null, '\t' ) );
	// BUG? why put package.json in pub/ ?, shouldn't it be in / for nwapp
	Files.set.file( 'package.json', JSON.stringify( packagejson, null, '\t' ) );
};
var indextranslation = function (path, filename, languages, translations) {
	var splat = filename.split('.');
	var langname = splat[0];
	var ext = splat.pop();
	if (languages.includes(langname) && ext == 'w') {
		var filedata = Files.get.file(path+filename).toString();
		var parsed = Weld.parse( filedata ); 
		parsed = Weld.config.parse( parsed ); 
		
		var parsedwithxpo = {};
		
		Object.keys(parsed).forEach(function (key) {
			parsedwithxpo[ 'XPO.'+key ] = parsed[ key ];
		});
		translations[ langname ] = translations[ langname ] || {};
		translations[ langname ] = Object.assign( translations[ langname ], parsedwithxpo );
	}
};
var updatetranslations = function (conf, path) {
	var translations = {}, languages = conf.langs || [];
	
	if (path) path += '/langs/';

	path = path||'langs/';
	
	var result = Files.get.folder(path);
	result.forEach(function (filename) {
		indextranslation(path, filename, languages, translations)
	});

	try {
		result = Files.get.folder(path+'linked');
	} catch (e) {
		if ( e.code === 'ENOENT' ) {
			Cli.echo( '\n ~red~ ! ~~ langs/linked not found ~blue~ i ~~ try ^bright^mudeer-install~~ \n' );
			process.exit(0);
		}
	}
	result.forEach(function (filename) {
		indextranslation(path+'linked/', filename, languages, translations);
	});
	
	return translations;
};
var managedincludes = function (conf, args) {
	// manage auto +include for css|js|htm dev-imports
	var pathprefix = 'src/';

	var includesjs = '', includescss = '', includeshtm = '';
	if (conf.include instanceof Array) {
		for (var i in conf.include) {
			var yes = 1, name = conf.include[i];
			if ( !args.keys.production && conf.include[i].startsWith(':') ) {
				name = conf.include[i].substr(1);
			}
			
			if (yes) {
				if (conf.kind == 'client') {
					includescss	+= '+include linked/'+name+'.css.w\n';
					includeshtm	+= '+include linked/'+name+'.htm.w\n';
				}
				includesjs	+= '+include linked/'+name+'.js\n';
			}
		}

		if (conf.kind == 'client') {
			Files.set.file( pathprefix+'managed.htm.w', includeshtm );
			Files.set.file( pathprefix+'managed.css.w', includescss );
		}
		Files.set.file( pathprefix+'managed.js.w', includesjs );
	}
};
var compile_icons = function (options, folder) {
	var beautify = require($.path+'/deps/js-beautify').html;
	var cheerio = require($.path+'/deps/cheerio');
	// Merge task-specific and/or target-specific options with these defaults
	var options = {
		prefix: 'i-',
		svg: {
//					'xmlns': "http://www.w3.org/2000/svg"
		},
		symbol: {},
		formatting: false,
		includedemo: false,
		inheritviewbox: false,
		cleanupdefs: false,
		fixedSizeVersion: false,
		externalDefs: false,
		includeTitleElement: true,
		preserveDescElement: true
	};

	var	$resultDocument = cheerio.load('<svg><defs></defs></svg>', { xmlMode: true }),
		$resultSvg = $resultDocument('svg'),
		$resultDefs = $resultDocument('defs').first(),
		iconNameViewBoxArray = [];  // Used to store information of all icons that are added
								  // { name : '' }

	// incase i need to hide this svg defs thing????
	$resultSvg.attr('id', 'XPO.icons');

	// Merge in SVG attributes from option
	for (var attr in options.svg) {
		$resultSvg.attr(attr, options.svg[attr]);
	}

	var cleanupAttributes = [];
	if (options.cleanup && typeof options.cleanup === 'boolean') {
	  // For backwards compatibility (introduced in 0.2.6).
	  cleanupAttributes = ['style'];
	} else if (Array.isArray(options.cleanup)){
	  cleanupAttributes = options.cleanup;
	}

	var urlPattern = /url\(\s*#([^ ]+?)\s*\)/g;
	
	var svgs = Files.get.folder('icons/');
	svgs.forEach(function (svg, i, arr) {
		
		var filename = arr[i].substr(0, arr[i].length-4);
		var id = (filename || '').replace(' ', '-');
		
		svg = Files.get.file('icons/'+svg);
//				$.log.s( svg.length );
		
		svg = cheerio.load(svg, {
			normalizeWhitespace: true,
			xmlMode: true
		});

		// Remove empty g elements
		svg('g').each(function(){
			var $elem = svg(this);
			if (!$elem.children().length) {
				$elem.remove();
			}
		});
		
		// Map to store references from id to uniqueId + id;
		var mappedIds = {};

		function getUniqueId(oldId) {
		  return id + "-" + oldId;
		}

		svg('[id]').each(function () {
		  var $elem = svg(this);
		  var id = $elem.attr('id');
		  var uid = getUniqueId(id);
		  mappedIds[id] = {
			id : uid,
			referenced : false,
			$elem : $elem
		  };
		  $elem.attr('id', uid);
		});

		svg('*').each(function () {
		  var $elem = svg(this);
		  var attrs = $elem.attr();

		  Object.keys(attrs).forEach(function (key) {
			var value = attrs[key];
			var id, match, isFillCurrentColor, isStrokeCurrentColor, preservedKey = '';

			while ( (match = urlPattern.exec(value)) !== null){
			  id = match[1];
			  if (!!mappedIds[id]) {
				mappedIds[id].referenced = true;
				$elem.attr(key, value.replace(match[0], 'url(#' + mappedIds[id].id + ')'));
			  }
			}

			if ( key === 'xlink:href' ) {
			  id = value.substring(1);
			  var idObj = mappedIds[id];
			  if (!!idObj){
				idObj.referenced = false;
				$elem.attr(key, '#' + idObj.id);
			  }
			}

			// IDs are handled separately
			if (key !== 'id') {

			  if (options.cleanupdefs || !$elem.parents('defs').length) {

				if (key.match(/preserve--/)) {
				  //Strip off the preserve--
				  preservedKey = key.substring(10);
				}

				if (cleanupAttributes.indexOf(key) > -1 || cleanupAttributes.indexOf(preservedKey) > -1){

				  isFillCurrentColor = key === 'fill' && $elem.attr('fill') === 'currentColor';
				  isStrokeCurrentColor = key === 'stroke' && $elem.attr('stroke') === 'currentColor';

				  if (preservedKey && preservedKey.length) {
					//Add the new key preserving value
					$elem.attr(preservedKey, $elem.attr(key));

					//Remove the old preserve--foo key
					$elem.removeAttr(key);
				  }
				  else if (!(isFillCurrentColor || isStrokeCurrentColor)) {
					// Letting fill inherit the `currentColor` allows shared inline defs to
					// be styled differently based on an SVG element's `color` so we leave these
					$elem.removeAttr(key);
				  }
				} else {
				  if (preservedKey && preservedKey.length) {
					//Add the new key preserving value
					$elem.attr(preservedKey, $elem.attr(key));

					//Remove the old preserve--foo key
					$elem.removeAttr(key);
				  }
				}
			  }
			}
		  });
		});

		if ( cleanupAttributes.indexOf('id') > -1 ) {
		  Object.keys(mappedIds).forEach(function(id){
			var idObj = mappedIds[id];
			if (!idObj.referenced){
			   idObj.$elem.removeAttr('id');
			}
		 });
		}

		var $svg = svg('svg');
		var $title = svg('title');
		var $desc = svg('desc');
		var $def = svg('defs').first();
		var defContent = $def.length && $def.html();

		// Merge in the defs from this svg in the result defs block
		if (defContent) {
		  $resultDefs.append(defContent);
		}

		var title = $title.first().html();
		var desc = $desc.first().html();

		// Remove def, title, desc from this svg
		$def.remove();
		$title.remove();
		$desc.remove();

		// If there is no title use the filename
		title = title || id;

		// Generate symbol
		var $res = cheerio.load('<symbol>' + $svg.html() + '</symbol>', { xmlMode: true });
		var $symbol = $res('symbol').first();

		// Merge in symbol attributes from option
		for (var attr in options.symbol) {
		  $symbol.attr(attr, options.symbol[attr]);
		}

		// Add title and desc (if provided)
		if (desc && options.preserveDescElement) {
		  $symbol.prepend('<desc>' + desc + '</desc>');
		}

//				if (title && options.includeTitleElement) {
//				  $symbol.prepend('<title>' + title + '</title>');
//				}

		// Add viewBox (if present on SVG w/ optional width/height fallback)
		var viewBox = $svg.attr('viewBox');

		if (!viewBox && options.inheritviewbox) {
		  var width = $svg.attr('width');
		  var height = $svg.attr('height');
		  var pxSize = /^\d+(\.\d+)?(px)?$/;
		  if (pxSize.test(width) && pxSize.test(height)) {
			viewBox = '0 0 ' + parseFloat(width) + ' ' + parseFloat(height);
		  }
		}

		if (viewBox) {
		  $symbol.attr('viewBox', viewBox);
		}

		// Add ID to symbol
		var graphicId = options.prefix + id;
		
		// I MADE A CHANGE HERE FOR UGLIFICATION
		$symbol.attr('id', graphicId.replace('i-', 'XPO.icon'));

		// Extract gradients and pattern
		var addToDefs = function(){
		  var $elem = $res(this);
		  $resultDefs.append($elem.toString());
		  $elem.remove();
		};

		$res('linearGradient').each(addToDefs);
		$res('radialGradient').each(addToDefs);
		$res('pattern').each(addToDefs);

		// Append <symbol> to resulting SVG
		$resultSvg.append($res.html());

		// Add icon to the demo.html array
		if (!!options.includedemo) {
		  iconNameViewBoxArray.push({
			name: graphicId,
			title: title
		  });
		}

		if (viewBox && !!options.fixedSizeVersion) {
		  var fixedWidth = options.fixedSizeVersion.width || 50;
		  var fixedHeight = options.fixedSizeVersion.width || 50;
		  var $resFixed = cheerio.load('<symbol><use></use></symbol>', { lowerCaseAttributeNames: false });
		  var fixedId = graphicId + (options.fixedSizeVersion.suffix || '-fixed-size');
		  var $symbolFixed = $resFixed('symbol')
			.first()
			.attr('viewBox', [0, 0, fixedWidth, fixedHeight].join(' '))
			.attr('id', fixedId);
		  Object.keys(options.symbol).forEach(function (key) {
			$symbolFixed.attr(key, options.symbol[key]);
		  });
		  if (desc) {
			$symbolFixed.prepend('<desc>' + desc + '</desc>');
		  }
//				  if (title) {
//					$symbolFixed.prepend('<title>' + title + '</title>');
//				  }
		  var originalViewBox = viewBox
			.split(' ')
			.map(function (string) {
			  return parseInt(string);
			});

		  var translationX = ((fixedWidth - originalViewBox[2]) / 2) + originalViewBox[0];
		  var translationY = ((fixedHeight - originalViewBox[3]) / 2) + originalViewBox[1];
		  var scale = Math.max.apply(null, [originalViewBox[2], originalViewBox[3]]) /
			Math.max.apply(null, [fixedWidth, fixedHeight]);

		  $symbolFixed
			.find('use')
			.attr('xlink:href', '#' + fixedId)
			.attr('transform', [
			  'scale(' + parseFloat(scale.toFixed(options.fixedSizeVersion.maxDigits.scale || 4)).toPrecision() + ')',
			  'translate(' + [
				parseFloat(translationX.toFixed(options.fixedSizeVersion.maxDigits.translation || 4)).toPrecision(),
				parseFloat(translationY.toFixed(options.fixedSizeVersion.maxDigits.translation || 4)).toPrecision()
			  ].join(', ') + ')'
			].join(' '));

		  $resultSvg.append($resFixed.html());
		  if (options.includedemo) {
			iconNameViewBoxArray.push({
			  name: fixedId
			});
		  }
		}
	});

	// Remove defs block if empty
	if ( $resultDefs.html().trim() === '' ) {
		$resultDefs.remove();
	}
	
	var result = options.formatting ? beautify($resultDocument.html(), options.formatting) : $resultDocument.html();
	
//			$.log.s( result.length );
	Files.set.file( (folder||'src')+'/icons.svg', result);

};
var do_build = function (args, xpo) {
	prepad = args.keys.prepad || prepad;
	var prespace = ' '.repeat( prepad );
	
	var configw = false;
	try {
		configw = Files.get.file('config.w');
	} catch (e) {
		Cli.echo(prespace+' '+process.cwd()+' ');
		Cli.echo(prespace+' config.w not found, try ^bright^mudeer-create~~ ');
		return;
	}
	if (configw === false) return;
	var conf = configw.toString();

	conf = Weld.parse( conf );
	conf = Weld.config.parse( conf );

	var xpow = false, xpofile = args.keys.xpo || args.keys.x;
	xpo = xpo || {};
	if (xpofile && xpofile.length) {
		try {
			xpow = Files.get.file(xpofile);
			xpo = xpow.toString();
			xpo = Weld.parse( xpo );
			xpo = Weld.config.parse( xpo );
		} catch (e) {
			Cli.echo(prespace+' '+xpofile+' not found ');
			return;
		}
	}

	Cli.echo(prespace+' mudeer-build... ');
	
	args.keys.ipath	= args.keys.ipath	|| 'build/';
	args.keys.xpath	= args.keys.xpath	|| 'pub/';
	if (typeof args.keys.xpath == 'string')
		if (!args.keys.xpath.endsWith('/')) args.keys.xpath += '/';
	if (typeof args.keys.ipath == 'string')
		if (!args.keys.ipath.endsWith('/')) args.keys.ipath += '/';
	var xpath = args.keys.xpath,
		ipath = args.keys.ipath;
	args.keys.production	= args.keys.production	|| args.keys.pro;
	args.keys.compress		= args.keys.compress	|| args.keys.cmp;
	args.keys.uglify		= args.keys.uglify		|| args.keys.ugl;
	args.keys.verbose		= args.keys.verbose		|| args.keys.vrb;

	var remove_comments = args.keys.remove_comments || conf.remove_comments || false;

	// by default, assume admin version is wanted
	if (!args.keys.client && !args.keys.all)
		args.keys.admin = true;

	var BUILDNUMBER = args.keys.buildnum || 0;
	if (args.keys.buildnum == undefined) {
		try {
			BUILDNUMBER = Files.get.file(ipath+'number.w');
			BUILDNUMBER = BUILDNUMBER.toString();
		} catch (e) {
			// ignore because we can make do without both these files
		}
	}

	args.keys.appname = conf.appname || conf.name;

	managedincludes( conf, args );

	if (conf.kind == 'client') {
		// compress svg icons into dev-public/icons.svg
		compile_icons(0);

		var translations = updatetranslations(conf);

		/* REMEMBER IMPORTANT MEMO
		 * make sure taraajim is defined globally beforehand
		 * this helps uglifyjs when passed mangle.eval.true to uglify
		 * global vars
		 * */
		translations = 'var taraajim = '+JSON.stringify(translations)+';';
		Files.set.file( 'src/langs.js', ( translations || '' ) );
	}

	var options = {
		appname:		args.keys.appname || 0			,
		production:		args.keys.production || 0		,
		buildnumber:	BUILDNUMBER || 0				,
		compress:		args.keys.c || args.keys.compress || false		,
		remove_comments:		remove_comments			,
		linkify:		true,
		server:			conf.kind == 'server' || false,
		client:			conf.kind == 'client' || false,
		uglify:			args.keys.uglify || false		,
//		nouglyjs:		args.keys.nouglyjs || false		,
		minify:			args.keys.m || args.keys.minify || false		,
		// save temp js css htm... aggregated code to build/
		savetemp:		args.keys.savetemp || false		,
		debug:			args.keys.debug || false		,
		verbose:		args.keys.verbose || false		,
		// reserved words & previously xpo'd words
		map:			xpo,
		prespace:		prespace,
	};

	options.admin = true;
	var sourcefile = 'src/index.htm.w';
	// TODO make this a possibility in weld
//	if (conf.kind == 'server') sourcefile = 'src/script.js.w';

	var parsedoutput = Weld.multi( sourcefile, options );

	// TODO make this tots dynamic
	parsedoutput.rawjs = parsedoutput.rawjs.replace(/XAADIMPORT/g, conf.port||3000);

	if (args.keys.buildnum == undefined) ++BUILDNUMBER;

	if (conf.kind == 'server') {
		var str2save = ( parsedoutput.rawjs || '' );

		Files.set.file( xpath+'index.js', str2save );
		printsize(prespace+'index.js', str2save.length );
//		Files.set.file( xpath+'xpo.w', Weld.to_weld(parsedoutput.map) );
	} else if (conf.kind == 'client') {
		parsedoutput.parsed = parsedoutput.parsed
						.replace(/JAZAR/g, conf.root||'');
		
		Files.set.file( xpath+'index.html', ( parsedoutput.parsed || '' ) );
		printsize(prespace+'index.html', (parsedoutput.parsed||'').length );
		
		
		var trimmed_conf = Object.assign({}, conf);

		delete trimmed_conf.kernel;
		delete trimmed_conf.src;
		delete trimmed_conf.icons;
		delete trimmed_conf.include;
		delete trimmed_conf.langs;
		delete trimmed_conf.connected;
		delete trimmed_conf.kind;

		parsedoutput.rawjs = 'var Config='+JSON.stringify(trimmed_conf)+';\n'+parsedoutput.rawjs;
		Files.set.file( xpath+'a.js', ( parsedoutput.rawjs || '' ) );
		printsize(prespace+'a.js', (parsedoutput.rawjs||'').length );

		if (conf.src.includes('sw')) {
			var swjs;
			try {
				swjs = Files.get.file($.path+'/src/sw.js');
			} catch (e) {
				$.log( e );
			}
			if (swjs) {
				swjs = swjs.toString();
				swjs = swjs.replace(/BUILDNUMBER/g, parseInt(BUILDNUMBER)+1);
				
				var parsedoutputswjs = { code: swjs };
//				var parsedoutputswjs = Uglify.minify(swjs, {
//					fromString:			true,
//					mangle:				true,
//				});
				Files.set.file( xpath+'_.js', ( parsedoutputswjs.code || '' ) );
				printsize(prespace+'_.js', (parsedoutputswjs.code||'').length );
			}
		}

	}

	if (conf.kind == 'client') makemanifest(args, conf, BUILDNUMBER, xpath);

	if (args.keys.buildnum == undefined)
		Files.set.file( ipath+'number.w', ''+( BUILDNUMBER || '' ) );

	Cli.echo(prespace+' done ');

	return parsedoutput.map;
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Uglify		= require('./deps/uglify-js'),
	Weld		= require('./weld')		;
	if (require.main === module) { // called directly
		Hooks.set(Cli.events.answer, function (options) { do_build(options); });
		Hooks.set(Cli.events.init, function (options) { do_build(options); });
		Hooks.set(Cli.events.command, function (options) { do_build(options); });
		Cli.init();
	}
});
module.exports = do_build;