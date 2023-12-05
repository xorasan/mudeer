# Lists
A list is a collection of objects. These objects are represented using templates, usually vertically.  
Other layouts like grids and freeflow are also available.  
Each object needs to have a unique ID and a DOM prefix (to allow quick access later).  

To create a list, put this in your `main.htm.w` file:
```
	[view=main]
		[id=list]
```

Then in your `main.js` file:
```
var dom_keys = view.dom_keys('main');
my_list = List( dom_keys.main.list );
```

## Recycle mode
```
my_list.recycle(1);
```

This mode uses the least amount of DOM elements to render huge lists.  

### Algorithm
We calculate how much space is available. Then start rendering objects until we run out of space.  
This requires binding the list to a parent Scrolling Element, so that scroll events can be routed to it only
when it's visible. The default scrolling element (document root) is used if none is set.

1. Get available height
2. Calculate visible items
3. 

```
my_list.set_scrolling_element( element );
```































