/* 
 * polling.worker is queued at the very end
 * if no module returns (extra.consumed = true) (handled)
 * only then the worker should index this request
 * 
 * modules know if this is a live request, so when they actually
 * have stuff to return they can mark the request as handled
 * and that'll tell the polling.worker to not get queued
 * */
Polling = {};
;(function(){
	'use strict';
	var connections = {};
		
	/* theory
	 * these connections are not to be used for syncing
	 * syncing is done using regular requests that clients can trigger regularly
	 * like when getting online, once a client is fully synced, only then it
	 * should start polling
	 * 
	 * connections is account uids as index
	 * and objects of requests indexed using timestamps
	 * whenever the server wants to send an 'obj' to an account
	 * it will call .finish(accountuid, obj)
	 * this will send that obj to all pending requests under that account
	 * and then that account will get popped from connections
	 * */
		
	Polling = {
		worker: function (done, queue, extra) {
			var payload 	= extra.payload,
				obj			= extra.obj,
				queue2		= $.queue();
	
			queue2.set(function (done2, queue2) { // listen
				if ( extra.consumed ) { // handled consumed munfaq
					/*
					 * this means there already was new data that some module
					 * has included in the extra.obj
					 * 
					 * EXPERIMENTAL override
					 * since this is the time the request is being sent out
					 * this time should be added to extra.obj
					 * -50ms compensates for any lag caused by the chained 
					 * module queue
					 * 
					 * THIS is now being handled in shabakah using diff logic
					 * */
//					extra.obj.time = new Date().getTime()-50;
					done2(queue2, extra);
				} else
				if ( extra.account && payload.broadcast && extra.account.sid ) {
//					$.log.s( 'broadcast', extra.account.name );
					
					connections[ extra.account.sid ] = {
						uid: extra.account.uid,
						sid: extra.account.sid,
						name: extra.account.name,
						res: extra.res,
						time: new Date().getTime(),
					};
					
//					$.log.s( 'connections:', Object.keys(connections).length );
				} else done2(queue2, extra);
			});
			queue2.run( function () {
				done(queue, extra);
			} );
		},
		/*
		 * use this function somwhere
		 * and the next step is to make this pass through all the Main mods
		 * each main mod should have a poll or recap like function that takes
		 * from and to timestamps 
		 * when this function is called
		 * it goes through all the mods' poll or recap function
		 * piles up an object, and then sends it out
		 * and do pragmatically think big, this in the near future should be
		 * used for collab in the pages+articles editor so build it solid
		 * */
		finish: function (obj) {
			for (var i in connections) {
				try {
					connections[i].res.json(obj || 1);
//					$.log( 'polling.finish', i, connections[i].uid );
					delete connections[i];
				} catch (e) {
					$.log.s('Polling.finish err', e);
				}
			}
		},
		/*
		 * accounts is an array, only requests for these account uids should end
		 * if accounts is undefined, then just end all
		 * */
		finish_all: function (accounts) {
			for (var i in connections) {
				var yes;
				if (accounts && accounts.includes(connections[i].uid)) yes = 1;
				
				if (!accounts) yes = 1;

				if (yes) {
					try {
//						$.log.s('Polling.finish_all', i);
						connections[i].res.end('1');
						delete connections[i];
					} catch (e) {
						$.log('Polling.finish_all err', e);
					}
				}
			}
		},
	};
	
	var poptimer = setInterval(function () {
		var current_time = new Date().getTime();
		
		for (var i in connections) {
			if ( current_time - connections[i].time >= 30 * 1000 ) {
				delete connections[i];
			}
		}
		
	}, 10 * 60 * 1000);

	module.exports = Polling;

	Network.get('polling', 'connections', function (response) {
		var names = [];
		for (var i in connections) { names.push(connections[i].name); }
		response.get('names', names)
				.finish();
	});

	Web.add(Polling.worker);

})();
