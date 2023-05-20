html, body, svg text
	font-family		Segoe UI, Noto Naskh Arabic UI, sans-serif

if min-width = 640px
	body
		max-width	640px
		margin		0 auto !important
	::-webkit-scrollbar
		width						8px
		height						8px
		background					@primary
	::-webkit-scrollbar-thumb
		background					@textd
	::-webkit-scrollbar-thumb:active
		background					@text

if min-width = 800px
	#itlaa3 .text
		font-size		150%
	#dialogui
		font-size		150%
		padding-bottom	140px
	#skdots
		display			none !important
	#softkeysui .row2
		display			flex !important
	#softkeysui .row2 button
		height			54px
//		padding			0px 35px
//		border-top		2px solid @secondary
	#softkeysui .row2 button svg
		height			48px
		width			48px
	#softkeysui button span
		margin-left		8px
	#softkeysui .row2, #skdots
		margin-bottom	80px

if min-width = 1024px
	#eqonahui
		display			inline-block
	body
		max-width	600px
		margin		0 90px 0 auto !important
	#pagermowjoodah
		max-width	600px
	[data-fullscreen]
		position	fixed
		top			0
		left		0
		width		calc(100vw - 700px) !important
		bottom		0
		overflow	auto
	#skenter
		width		96px
	#softkeysui .row1 button
		height		96px
	#softkeysui .row1 button svg
		height		48px
		width		48px
