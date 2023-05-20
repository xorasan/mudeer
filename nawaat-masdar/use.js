;(function (){
	$.use = function (project) {
		var glatteisprojects = process.env.HOME+'/Documents/projects/';

		/*
		 * improve this using native ge scripts
		 * once a dependency resolver is built-into ge
		 * then this 'use' engine module can be included alone in scripts
		 * and the repl will also include 'files'
		 * since it queries folders and gets files from them synchronously
		 * */
		var temp = $;
		var mod = require(glatteisprojects+project);
		global.$ = temp;
		return mod;
	};

})();
