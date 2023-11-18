+data
jiddat
	u_act
		uid
			 bigint(20) unsigned pri auto_increment
		email
			 blob 
		type
			 bigint(255) 
		pass
			 blob 
		salt
			 blob 
		name
			 blob 
		displayname
			 blob 
		status
			 bigint(255) 
		checkin
			 bigint(255) 
		created
			 bigint(255) 
		updated
			 bigint(255) 
	u_cmt
		uid
			 bigint(20) unsigned pri auto_increment
		content
			 blob 
		created
			 bigint(255) 
		updated
			 bigint(255) 
		title
			 blob 
		account
			 bigint(255) 
		alias
			 blob 
		parent
			 bigint(255) 
		votes
			 bigint(255) 
		upvotes
			 bigint(255) 
		downvotes
			 bigint(255) 
	u_pgs
		uid
			 bigint(20) unsigned pri auto_increment
		alias
			 blob 
		title
			 blob 
		content
			 blob 
		account
			 bigint(255) 
		created
			 datetime 
		updated
			 datetime 
	u_pho
		uid
			 bigint(20) unsigned pri auto_increment
		account
			 bigint(255) 
		accessGroup
			 blob 
		access
			 int(2) 
		path
			 blob 
		approved
			 int(2) 
		deleted
			 int(2) 
		created
			 bigint(255) 
		updated
			 bigint(255) 
	u_pst
		uid
			 bigint(20) unsigned pri auto_increment
		content
			 blob 
		intro
			 blob 
		featured
			 blob 
		header
			 blob 
		verdict
			 blob 
		created
			 bigint(255) 
		updated
			 bigint(255) 
		title
			 blob 
		account
			 bigint(255) 
		alias
			 blob 
		tags
			 blob 
		views
			 bigint(255) 
	u_ssn
		uid
			 bigint(20) unsigned pri auto_increment
		title
			 blob 
		useragent
			 blob 
		account
			 bigint(255) 
		keya
			 blob 
		keyb
			 blob 
		keyc
			 blob 
		created
			 bigint(255) 
		updated
			 bigint(255) 
	u_tmp
		uid
			 bigint(20) unsigned pri auto_increment
		hash
			 blob 
		key
			 blob 
		value
			 blob 
		updated
			 bigint(255) 
	u_vot
		uid
			 bigint(20) unsigned pri auto_increment
		account
			 bigint(255) 
		parent
			 bigint(255) 
		type
			 bigint(255) 
		created
			 bigint(255) 
		updated
			 bigint(255) 
		read
			 int(2) 