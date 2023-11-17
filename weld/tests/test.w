+htm
!DOCTYPE @html

+css
body
	padding				0
	margin				0
div
	color				@primary
	background			@secondary,
						url(abc/def.jpg)
	border				10px
	wow					omg
span
.item.highlighted
	border-bottom		3px solid @accent
	padding-top			5px
h1
	background	dimgray linear-gradient(10deg, red, blue)
	padding		10px
	margin		0
if min-width = 200px and max-width = 500px
	h1
		display			block
		font-size		80%
		color			@accent
	input
h2
	color				blue
	font-size			150%
.header
	color				@accent
.glance
	color				pink
#hub #omg.header .main .wow.this.shit div.logo
	display				block

+htm
script @src(/&!.js)
link @href(/&!.css) @rel(stylesheet)

h1
	'h1 h1 h1 '
h2
	'h2 h2 h2 '

div #hub
	section .header #omg
		div .main 'asdfasf'
			'athis is a test'
			'this is a testa'
			div .wow.this.shit
				img .logo @src(/icon.png) @width(100px) @hidden @constructor
---
			br
			div [fly=y es] [over] [under] [why=no] []
				button	#usernamelbl	'@username'		
				button	#newpostbtn		'new post'		.priv
				button	#mediabtn		'media'			.priv .full
				button	#signupbtn		'sign up'		
				button	#signinbtn		'sign in'		
				button	#signoutbtn		'sign out'		.red .blue
			div
				input	#searchfld		@placeholder(search)
				button	#searchbtn		'search'

	section .body
		div .main
			div
				button	.newerbtn		'newer'
			div
				h2		#newpoststitle	'new posts'		.class
			div
				button	.olderbtn		'older'
			
			span #test
			
			div #newposts .posts
			
			div
				button	.newerbtn		'newer'
				button	.olderbtn		'older'
 
	section .glance
		div .main
			div .titlediv
				h2 .title				'popular posts'
				
			div #topposts .posts
			
	section .footer
		div .part
			p 'receive popular posts in your email inbox every month'
			
			input #newsemail @placeholder(email address)
			button 'subscribe'
		div .part
			button 'information'
			button 'rights'
			button 'privacy'
		div
			img .starlogo @src(/qamar-najm.svg)
			span .caption 'quality pakistani export'
