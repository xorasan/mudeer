var profile,
	TAGMAX = 15,
	ISMMUBEENMAX = 48,
	HIKAAYAHMAX = 480;
	
;(function(){
	profile = {
		value: function (u, v) {
			return { uid: u, value: v };
		},
		nazzaf: function (str, max) {
			if (!isstr(str)) str = parsestring(str);
			return str.trim().slice(0, max);
		},
	};
})();

Network.intercept('profile', function (response) {
	if (response.account) { // signed in?
		var arr = [];
		
		if (response.time < response.account.updated) {
			arr.push( profile.value('name',			response.account.name			) );
			arr.push( profile.value('displayname',	response.account.displayname	) );
			arr.push( profile.value('lifestory',	response.account.lifestory		) );
		}

		if (arr.length) response.get(arr).consumed();
		else response.finish();
	} else response.finish();
});
Network.sync('profile', function (response) {
	var value = response.value;
	
	if (!response.account) { response.finish(); return; } // not signed in
	if (!value) { response.finish(); return; } // received nothing
	var tabdeel = 0, things = { uid: response.account.uid }, arr = [];

	/* shape possessions jobs
	 * multiple things are inserted to represent their numbers
	 * */

//	uid			unique id
//	name		user name
	// REMEMBER when you do create this, make sure the username is unique!
//	displayname	display name
	if (isstr(value.displayname)) {
		arr.push(
			profile.value('displayname',
				things.displayname = profile.nazzaf(value.displayname, ISMMUBEENMAX)
			)
		);
	}
//	lifestory	life story
	if (isstr(value.lifestory)) {
		arr.push(
			profile.value('lifestory',
				things.lifestory = profile.nazzaf(value.lifestory, HIKAAYAHMAX)
			)
		);
//		response.sync('lifestory',
//			things.lifestory = profile.nazzaf(value.lifestory, HIKAAYAHMAX)
//		);
		tabdeel = 1;
	}
//	birthday		birthday
	if (isnum(value.birthday)) {
		response.sync('birthday', things.birthday = value.birthday );
		tabdeel = 1;
	}
//	sinf		type, rank
//	gender		jins
	if (isnum(value.gender)) {
		if (value.gender < 0 || value.gender > 3) value.gender = 0;
		response.sync('gender', things.gender = value.gender);
		tabdeel = 1;
	}
//	haram		family
//	aqrabaa		relatives
//	masaa3ib	blocks
//	asdiqaa		friends
//	mushtarayaat purchased items
//	naqd		money
//	talab		wants
//	haatif		phone
//	haalah		status
//	ittisaal	connected when
//	indimaam	joined when (after invitation)
//	xattil3ard	latitude
//	xattiltool	longitude
//	created		created when
//	updated		updated when
	if (arr.length) {
		things.updated = get_time_now();
		MongoDB.set(Config.database.name, tbl_hsbt, [things], function (j) {
			Polling.finish_all([response.account.uid]);
			response.sync(arr).finish();
		});
	}
	else response.finish();
});


