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
	* [ ] Add system theme detection
		* [ ] [Samsung Internet dark mode](https://developer.samsung.com/internet/blog/en-us/2020/12/15/dark-mode-in-samsung-internet)
	* [ ] [Notch support](https://css-tricks.com/the-notch-and-css/)
	* [x] Tall & curved screens support
	* [ ] Fix bug where selected theme and contrast isn't restored properly

* [ ] Install
	* [ ] Make `src` optional, include can be used to figure out `src`

* [ ] Release
	* [x] Convert a server+client full stack mudeer app into a self-contained portable folder with full copied deps
	* [ ] Calling mudeer-install in a folder with no config.w should try to use release.w

* [ ] Database
	* [ ] The database should be able to run as an independent server and communicate as a JSON API

* [ ] Share
	* [ ] Give modules an optional share key with an easy share function
	* [ ] Allow modules a way to receive shared items using hooks

* [ ] Webapp
	* [ ] Notifications
		* [ ] They should have title desc icon
		* [ ] Add support for notifying through service worker

	* [ ] Manifest
		* [x] Should always be generated dynamically
		* [x] Save changes on server
		* [ ] Upload icon

	* [ ] Status
		* [ ] Have status pile up and show one by one
		* [ ] Hold off until app visibility

	* [x] Home
		* [x] `Webapp.is_at_home` checks if one of the views marked as home is active
		* [x] `Webapp.add_home_view`, `Webapp.remove_home_view`, `Webapp.get_home_views`

* [ ] Softkeys
	* [ ] Move `Webapp.status` above the back button on desktop
	* [ ] `Webapp.notify` actions can be merged into the softkeys
	* [ ] Support new properties `order`, `last`, `first`, `before`, `after`
	* [ ] Add .alias to support linking secondary keysets to a shortcut entry

* [ ] Backstack [Discussion](Philosophy/Backstack.md)
	* [x] Home > View > Sheet > Dialog, that's the ceiling by default, can be extended using history
	* [ ] History
		* [x] Recreate the stack when `Webapp` fires the `ready` hook
		* [x] Offer modules a way to react to stack changes and break the default 4 ceiling
		* [ ] Using `Softkeys`, holding the back button should trigger a history list
		* [ ] Show hint that history list is available when there's more than 3ish items

