# Backstack
The Backstack module is designed to give a predictable back/forward button behavior (for web browsers).

## History API
[Mozilla Developers Network: History API](https://developer.mozilla.org/en-US/docs/Web/API/History)

* Take this URI as an example, `/rooms/lobby/meeting-of-the-minds`
* By default, the first crumb is assumed to be a View name.
	* `/rooms` would do `Hooks.run('view', 'rooms')`
* The rest of the crumbs are hooked out as `backstack-crumbs`
	* modules can react to these crumbs according to custom logic
	* `lobby` might open a room
	* `meeting-of-the-minds` could be the name of a specific thread inside `lobby`
* Pressing back would fire on the `backstack-crumbs` hook again until we reach `/`
	* `/` refers to the `main` view
* Each time a URI with multiple crumbs is loaded in a browser, the entire stack is recreated










