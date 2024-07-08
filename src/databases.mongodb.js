/* MongoDB adapter for Databases
 * adds:
 * 	Databases.mongodb
 * 
 * TODO: make async functions return value or error, make callbacks optional
 */

var MongoDB;
;(function () {
	'use strict';
	const { MongoClient, ObjectId } = require('./deps/mongodb');
	// TODO if default user pass, exit with error
	let uri = process.env.DEWAAN_MONGO_URI || 'mongodb://localhost/';
	if (process.env.DEWAAN_MONGO_NAME) {
		let mongo_name = process.env.DEWAAN_MONGO_NAME || 'dewaan-mongodb',
			mongo_user = process.env.DEWAAN_MONGO_USER || 'PLEASE_CHANGE_ME',
			mongo_pass = process.env.DEWAAN_MONGO_PASS || 'PLEASE_CHANGE_ME',
			mongo_port = '27017';
		uri = 'mongodb://'+mongo_user+':'+mongo_pass+'@'+mongo_name+':'+mongo_port+'/';
	}
	const client = new MongoClient( uri );
	var db, tbl_pops = 'pops', debug_mongodb = 0;

	function generate_uid() { return new ObjectId().toString(); }

	async function connect() { // TODO hide sensitive data
		Cli.echo(' ^bright^MongoDB~~ Connecting... ^dim^', uri, '~~');
		try {
			await client.connect();
			Cli.echo(' ^bright^MongoDB~~ Connected ');
		} catch (error) {
			Cli.echo(' ^bright^MongoDB~~ Error connecting ');
			$.log.e( error );
			process.exit(1);
		} finally {
			// Don't forget to close the connection when you're done
			// await client.close();
		}
	}
	
	function use_db(name) {
		return client.db(name);
	}

	/* LOGIC
	 * .uid is always translated to ._id since all mudeer modules use .uid
	 * doc.uid is used to find a match
	 * .created autofilled if not set, only on insert
	 * this returns the same doc object that was provided with uid/ruid updated, no shallow copy is made
	 * it doesn't fill missing props, use get or query with $in for that
	 * */
	async function upsert(db, collection_name, doc, cb) {
		if (debug_mongodb) $.log( ' upsert... ', collection_name );
		var out_error;
		try {
			const collection = use_db( db ).collection( collection_name );

			var created = get_time_now(), uid, ruid;
			if (doc.uid) {
				if (isnum(doc.uid) && doc.uid < 0) {
					ruid = doc.uid;
					uid = generate_uid();
				} else {
					uid = doc.uid;
				}
			} else {
				uid = generate_uid();
			}
			delete doc.ruid; // this is never saved, only return back to client to update the correct temp doc
			delete doc.uid; // this is a readonly system property
			doc.updated = created; // needed for syncing in network module
			delete doc.created; // this is a readonly system property

			// Specify the update or the document to insert if not found
			const update = {
				$set: doc, // update props whether doc is found or not
				$setOnInsert: { _id: uid, created: created },
			};

			const result = await collection.updateOne(
				{ _id: uid }, // filter, find previous doc
				update,
				{ upsert: true },
			);

			if (result.upsertedCount > 0) {
				doc.uid = result.upsertedId;
				doc.created = created;
//				$.log(' Doc inserted:', doc);
			} else { // TODO should i check result.matchedCount == 1?
				doc.uid = doc._id || uid;
				delete doc._id; // MongoDB doesnt even return this tho, prolly extraneous
//				$.log(' Doc updated:', doc);
			}
			if (ruid) doc.ruid = ruid;
		} catch (error) {
			$.log.e(' Error during upsert:', error);
		} finally {
			if (isfun(cb)) cb( out_error, doc );
			return { err: out_error, rows: [doc] };
		}
	}

	// always outs an { err, rows: [] }
	async function upsert_one_or_many(db, collection_name, doc_or_docs, cb) {
		var out_docs = [], out_error;

		if (!isarr( doc_or_docs )) doc_or_docs = [ doc_or_docs ];

		for (const o of doc_or_docs) {
			await upsert(db, collection_name, o, function (err, doc) {
				if (err) {
					if (!isarr(out_error)) out_error = [];
					out_error.push(err);
				}
				out_docs.push( doc );
			});
		}

		var out = { rows: out_docs };
		if (out_error) out.err = out_error;
		if (isfun(cb)) cb( out );

		return out;
	}

	// converts uid to _id and reverse on out, always outs an { err, rows: [] }
	async function find_many_as_array(db, collection_name, filter, cb) {
		if (debug_mongodb) $.log( ' find_many_as_array... ', collection_name, JSON.stringify(filter) );

		var out_docs, out_error, aggregate, sort, limit, skip;
		filter = filter || {};
		// convert uid to _id
		if (filter.uid) { filter._id = filter.uid; delete filter.uid; }

		if (filter.$sort || filter.$limit || filter.$skip) { aggregate = 1; } // has to be first
		
		limit = filter.$limit; delete filter.$limit;
		sort  = filter.$sort ; delete filter.$sort ;
		skip  = filter.$skip ; delete filter.$skip ;

		try {
			const collection = use_db( db ).collection( collection_name );
			if (aggregate) {
				var filter_array = [ { $match: filter } ];
				if (sort) filter_array.push( { $sort: sort } );
				if (skip) filter_array.push( { $skip: skip } );
				if (limit) filter_array.push( { $limit: limit } );
				out_docs = await collection.aggregate( filter_array ).toArray();
			} else {
				out_docs = await collection.find( filter ).toArray();
			}

			// convert _id to uid
			out_docs = out_docs.map(function (o) {
				o.uid = o._id;
				delete o._id;
				return o;
			});
		} catch (error) {
			out_error = error;
			$.log.e(' Error during find_many_as_array:', error);
		} finally {
			var out = { rows: out_docs };
			if (debug_mongodb) out.filter = filter;
			if (out_error) out.err = out_error;
			if (isfun(cb)) { cb( out ); }
			return out;
		}
	}
	
	async function find_as_count(db, collection_name, filter, cb) {
		if (debug_mongodb) $.log( ' find_as_count... ', collection_name, JSON.stringify(filter) );

		var out_count, out_error;
		filter = filter || {};
		// convert uid to _id
		if (filter.uid) {
			filter._id = filter.uid;
			delete filter.uid;
		}

		try {
			const collection = use_db( db ).collection( collection_name );
			out_count = await collection.countDocuments( filter );
		} catch (error) {
			out_error = error;
			$.log.e(' Error during find_as_count:', error);
		} finally {
			var out = { count: out_count };
			if (out_error) out.err = out_error;
			if (isfun(cb)) cb( out );
			return out;
		}
	}

	// converts uid to _id and reverse on out, outs { doc } or false
	async function find_one(db, collection_name, filter, cb) {
		if (debug_mongodb) $.log( ' find_one... ', collection_name );

		var out_docs, out_error;
		filter = filter || {};
		// convert uid to _id
		if (filter.uid) {
			filter._id = filter.uid;
			delete filter.uid;
		}

		try {
			const collection = use_db( db ).collection( collection_name );
			out_docs = await collection.find( filter ).limit(1).toArray();
			// convert _id to uid
			out_docs = out_docs.map(function (o) {
				o.uid = o._id;
				delete o._id;
				return o;
			});
		} catch (error) {
			$.log.e(' Error during find_one:', error);
		} finally {
			if (out_docs[0]) {
				if (isfun(cb)) cb( out_docs[0] );
				return out_docs[0];
			} else {
				if (isfun(cb)) cb( false );
				return false;
			}
		}
	}

	// outs (err, deletedCount)
	// TODO add support for inserting more props easily, so it acts more like a trash bin
	async function delete_one(db, collection_name, uid, cb, alt_collection_name) {
		$.log( ' delete_one... ', collection_name );

		var result, out_error;

		try {
			const collection = use_db( db ).collection( collection_name );
			result = await collection.deleteOne({ _id: uid })
			
			if (result.deletedCount) {
				await upsert(db, tbl_pops, {
					luid:		uid,
					ltable:		alt_collection_name || collection_name,
					updated:	get_time_now(),
				}, function (err, doc) {
					out_error = err;
				});
			}
		} catch (error) {
			out_error = error;
			$.log.e(' Error during delete_one:', error);
		} finally {
			if (isfun(cb)) cb( out_error, result );
			return { err: out_error, uid: result };
		}
	}

	// outs ( [uids_deleted], [errors] )
	async function delete_many(db, collection_name, filter, cb, alt_collection_name) {
		var uids = [];
		// is it uid or filter
		if (isstr(filter) || isnum(filter) || isarr(filter)) {
			// uid: proceed normally
			uids = isarr(filter) ? filter : [ filter ];
		} else {
			// filter: first find many and get their uids as an array
			await find_many_as_array(db, collection_name, filter, function (out) {
				if (out.rows.length) {
					out.rows.forEach(function (o) {
						uids.push( o.uid );
					});
				}
			});
		}
		
		if (debug_mongodb) $.log( ' delete_many... ', collection_name );

		var out_uids = [], out_error;

		for (const o of uids) {
			await delete_one(db, collection_name, o, function (err, doc) {
				if (err) {
					if (!isarr(out_error)) out_error = [];
					out_error.push(err);
				}
				out_uids.push( o );
			});
		}

		// delete old pops
		var old_time = get_time_now() - (40*1000*60*60*24); // 40 days
		var pops_result;
		try {
			const collection = use_db( db ).collection( tbl_pops );
			pops_result = await collection.deleteMany({
				updated: {
					$lte: old_time
				}
			});
		} catch (error) {
			Cli.echo( ' delete_many error while deleting old pops ' );
			$.log.e( error );
		} finally {
			if (pops_result && pops_result.deletedCount) {
				Cli.echo( ' delete_many deleted '+pops_result.deletedCount+' old pops ' );
			}
		}

		if (isfun(cb)) {
			if (out_uids.length && debug_mongodb) Cli.echo( ' delete_many deleted '+out_uids.length+' docs ' );

			cb( out_uids, out_error );
		}

		return { err: out_error, uids: out_uids };
	}

	// this doesn't add deleted items to pops
	async function delete_many_without_notice(db, collection_name, filter, cb) {
		if (debug_mongodb) $.log( ' delete_many_without_notice... ', collection_name );

		let result, out_error;

		if (filter && filter.uid) {
			filter._id = filter.uid;
			delete filter.uid;
		}

		try {
			const collection = use_db( db ).collection( collection_name );
			result = await collection.deleteMany( filter );
			
			if (result.deletedCount) {
			}
		} catch (error) {
			out_error = error;
			$.log.e(' Error during delete_many_without_notice:', error);
		} finally {
			if (isfun(cb)) cb( out_error, result );
			return { err: out_error, count: result.deletedCount };
		}
	}

	module.exports = Databases.mongodb = MongoDB = {
		connect	: connect,
		db		: use_db,
		set		: upsert_one_or_many,
		query	: find_many_as_array,
		count	: find_as_count,
		get		: find_one,
		pop		: delete_many,
		purge	: delete_many_without_notice,
		uid		: generate_uid,
	};
})();
Web.during_init(function (done, queue) {
	MongoDB.connect().finally(function () {
		done(queue);
	});
});


