html, body, svg text
	font-family		FreeSans, Segoe UI, Noto Naskh Arabic UI, sans-serif

if min-height = 600px
	body
		padding-right	8px
		padding-left	8px

if min-width = 640px
	body
		max-width	640px
		margin		0 auto
	::-webkit-scrollbar
		width						8px
		height						8px
		background					@primary
	::-webkit-scrollbar-thumb
		background					@textd
	::-webkit-scrollbar-thumb:active
		background					@text

if min-width = 800px
	body
		max-width	700px
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
	#softkeysui .row2 button .tooltip
		right			90px
	#softkeysui .row2 button svg
		height			48px
		width			48px
	#softkeysui button span
		margin-left		8px

if min-width = 1024px
	body
		max-width	840px
	#eqonahui
		display			inline-block
	#softkeysui .row1 button
		height			96px
	#softkeysui .row1 button svg
		height			48px
		width			48px




