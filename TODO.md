# TODO  
This is an incomplete progress list of features & known bugs.  

* [ ] List
	* [ ] Recycle: Only render visible elements `recycle( yes )`
		* [ ] Dynamic items
		* [ ] Calculate scroll height on update
		* [ ] Remember scroll position or item
		* [ ] Reuse off screen items
	* [ ] Improve scrolling, only scroll into view when absolutely necessary.
	* [ ] Sheets should call `.destroy()` on any lists inside them upon exit to avoid orphaned events
* [ ] Themes
	* [ ] add system theme detection
		* [ ] [Samsung Internet dark mode](https://developer.samsung.com/internet/blog/en-us/2020/12/15/dark-mode-in-samsung-internet)
	* [ ] [Notch support](https://css-tricks.com/the-notch-and-css/)
	* [x] Tall & curved screens support

* [ ] Install
	* [ ] make `src` optional, include can be used to figure out `src`

* [ ] Release
	* [x] convert a server+client full stack mudeer app into a self-contained portable folder with full copied deps
	* [ ] calling mudeer-install in a folder with no config.w should try to use release.w

* [ ] Database
	* [ ] the database should be able to run as an independent server and communicate as a JSON API

* [ ] Webapp
	* [ ] Notifications
		* [ ] they should have title desc icon

	* [ ] Manifest
		* [x] should always be generated dynamically
		* [x] save changes on server
		* [ ] upload icon
	
	* [ ] Home
		* [ ] `Webapp.is_at_home` checks if one of the views marked as home is active
		* [ ] `Webapp.add_home_view`, `Webapp.remove_home_view`, `Webapp.get_home_views`

* [ ] Softkeys
	* [ ] move `Webapp.status` above the back button on desktop
	* [ ] `Webapp.notify` actions can be merged into the softkeys
	* [ ] support new properties `order`, `last`, `first`, `before`, `after`
	* [ ] add .alias to support linking secondary keysets to a shortcut entry

* [ ] Backstack
	* [ ] History
		* [ ] Home > View > Sheet > Dialog, that's the ceiling by default
		* [ ] recreate the stack when `Webapp` fires the `ready` hook
		* [ ] using `Softkeys`, holding the back button should trigger a history list
		* [ ] show hint that history list is available when there's more than 3ish items

