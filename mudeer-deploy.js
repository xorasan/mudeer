/*
 * Transfers specified files to the target directories, runs commands pre and post
 * 
 * format:
 * targets
 * 		/home/nano/Sites/dewaan-hub/
 * host		ip
 * user		...
 * pass		...
 * */

'use strict';
var Hooks, Cli, Files, Weld;
const { NodeSSH } = require('./deps/node-ssh');
var echo, node_ssh, ssh;

var do_build = require('./mudeer-build'); // this also loads mudeer kernel $ $$

var get_configw = function (path) {
	var configw = false;
	try {
		configw = Files.get.file(path+'/config.w').toString();
	} catch (e) {
		Cli.echo(' '+path+' ');
		Cli.echo(' config.w not found, try ^bright^mudeer-create~~ ');
		return false;
	}
	if (configw === false) return false;
	
	if (configw === false || configw.length === 0) {
		Cli.echo(' config.w in '+path+' is empty, deployment aborted! ');
		return false;
	}
		
	return Weld.config.parse( Weld.parse( configw ) );
};
var do_deploy = async function (args) {
	var deployw = false, deployfile = 'deploy.w';
	if (deployfile && deployfile.length) {
		try {
			deployw = Files.get.file(deployfile);
			deployw = deployw.toString();
			deployw = Weld.parse( deployw );
			deployw = Weld.config.parse( deployw );
		} catch (e) {
			Cli.echo(' ^bright^'+deployfile+'~~ not found ');
			return;
		}
	}
	
	// TODO user pass host verif
	let package_path, target_path;
	
	if (args.raw.length) {
		package_path = args.raw[0];
	} else {
		echo('provide at least one path to a package to deploy');
		return;
	}

	if (deployw.targets.length) {
		target_path = deployw.targets[0];
	} else {
		echo('provide at least one target path in deploy.w, this is where the package will be extracted');
		return;
	}

	echo('Connecting...');
	await ssh.connect({
		host: deployw.host || 'localhost',
		username: deployw.user || 'admin',
		port: deployw.port || 22,
		password: deployw.pass || '',
		tryKeyboard: true,
	});
	echo('Connected');

	let remote_tmp_path = '/tmp/dewaan-tmp.tgz';

	echo('Package copying...');
	await ssh.putFiles([{ local: package_path, remote: remote_tmp_path }]);
	echo('Package copied');

	echo('Package extracting...');
	await ssh.exec('tar ', ['xvf', remote_tmp_path], {
		cwd: target_path,
		onStdout(chunk) {
			echo(chunk.toString('utf8'))
		},
		onStderr(chunk) {
			echo('stderrChunk ', chunk.toString('utf8'))
		},
	});
	echo('Package extracted');

	await ssh.dispose();
};
$.preload( [ 'files', 'hooks', 'cli' ], function() {
	Cli			= $('cli')				,
	Hooks		= $('hooks')			,
	Files		= $('files')			,
	Weld		= require('./weld')		;
	ssh = new NodeSSH();
	Hooks.set(Cli.events.answer, async function (options) { await do_deploy(options); });
	Hooks.set(Cli.events.init, async function (options) { await do_deploy(options); });
	Hooks.set(Cli.events.command, async function (options) { await do_deploy(options); });

	echo = Cli.echo;
	Cli.init();
});
