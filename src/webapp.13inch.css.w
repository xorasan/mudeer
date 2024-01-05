html, body, svg text
	font-family		Segoe UI, Noto Naskh Arabic UI, sans-serif

if min-height = 600px
	body
		padding			0px 5px 50vh 5px

if min-width = 320px
	#softkeysui .left
		display			flex !important
		flex-direction	row-reverse
		align-items		center
	#softkeysui .right
		display			flex !important
		flex-direction	row
		align-items		center
	#softkeysui .row2 button:hover .tooltip, #softkeysui[data-shown] .row2 button .tooltip
		display			flex
//	#softkeysui[data-shown] .row2 button .tooltip label
//		display			none
	#softkeysui .row2 button:hover .tooltip label
		display			flex
	#softkeysui[data-shown] .row2 button .tooltip
		font-size		80%
	#softkeysui .row2 button .tooltip
		display			none
		position		absolute
		right			70px
		align-items		center
		top				0
		font-weight		normal
		border			1px solid @secondaryd
		background		@primaryl
		font-size		100%
		width			max-content
		padding			8px
		border-radius	8px
		pointer-events	none
	#softkeysui button .key
		margin			2px
		padding			2px
		background		@secondaryd
	#softkeysui button label
		border			0 !important
		height			auto
	#softkeysui .row1 button .tooltip
		font-size		90%
		flex-direction	column

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
	#softkeysui .row2 button .tooltip
		right			90px
	#softkeysui .row2 button svg
		height			48px
		width			48px
	#softkeysui button span
		margin-left		8px
	#softkeysui .row2, #skdots
		margin-bottom	80px

if min-width = 1024px
	body
		max-width	840px
	#eqonahui
		display			inline-block
	#softkeysui .row1 button
		height		96px
	#softkeysui .row1 button svg
		height		48px
		width		48px
