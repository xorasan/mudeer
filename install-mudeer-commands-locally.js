#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var log = console.log;

log(' This script creates shell scripts in ~/.local/bin ');
log(' They point to mudeer-*.js files in this directory ');
log(' The path is static so run this script again ');
log(' if you move mudeer elsewhere ');

log('\n '+process.cwd()+'\n');

try {
	fs.mkdirSync(process.env.HOME+'/.local/bin');
} catch (e) {
}

function generate_sh_script(name) {
	return '#! /bin/sh\n'
			+'\nnode '+name+' $*\n';
}

fs.readdirSync('.').forEach(file => {
	if (file.startsWith('mudeer-') && file.endsWith('.js')) {
		var name = file.slice(0, -3);
		log(' '+process.env.HOME+'/.local/bin/'+name);
		var full_path = process.cwd()+'/'+file;
		var target_path = process.env.HOME+'/.local/bin/'+name;
		fs.writeFileSync(target_path, generate_sh_script(full_path));
		fs.chmodSync(target_path, '755');
//		fs.symlinkSync(process.env.HOME+'/.local/bin/'+name, process.cwd()+'/'+file);
	}
});
