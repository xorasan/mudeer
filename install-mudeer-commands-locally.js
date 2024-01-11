#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var log = console.log;

// TODO check if ~/.local/bin exists, first try installing there
// or offer a choice between the two ~/bin/

log(' This script creates shell scripts in ~/bin ');
log(' They point to mudeer-*.js files in this directory ');
log(' The path is static so run this script again ');
log(' if you move mudeer elsewhere ');

log('\n '+process.cwd()+'\n');

try {
	fs.mkdirSync(process.env.HOME+'/bin');
} catch (e) {
}

function generate_sh_script(name) {
	return '#! /bin/sh\n'
			+'\nnode '+name+' $*\n';
}

fs.readdirSync('.').forEach(file => {
	if (file.startsWith('mudeer-') && file.endsWith('.js')) {
		var name = file.slice(0, -3);
		log(' '+process.env.HOME+'/bin/'+name);
		var full_path = process.cwd()+'/'+file;
		var target_path = process.env.HOME+'/bin/'+name;
		fs.writeFileSync(target_path, generate_sh_script(full_path));
		fs.chmodSync(target_path, '755');
//		fs.symlinkSync(process.env.HOME+'/.local/bin/'+name, process.cwd()+'/'+file);
	}
});

log(' in case these don\'t work, log out log back in again to the shell ');
log(' or do: source ~/.profile (might not work) \n');

// https://askubuntu.com/questions/1144231/home-local-bin-not-in-path-for-ubuntu-19-04