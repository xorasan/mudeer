/*
 * hashmaps of hashmaps of arrays of strings and booleans
 * .config files structure:
 * supports nested tags
 * each tag is treated like an object
 * a tag with no children is called a terminal tag else called a parent tag
 * if a tag has multiple terminal children tags, it's parsed to an Array
 * parent tags are parsed to Objects
 * each terminal child is parsed as a String
 * helper functions can help parse terminal children as other primitives as well
 * 
 * TODO: write a value parser 'true' -> true, etc
 * */

;(function(){

	var _mod = {
		/*
		 * returns all kids as strings in an array
		 * or returns '' if there are no kids
		 * */
		childrentoarray: function (children) {
			var array = [];
			for (var i in children) {
				array.push(children[i].line);
			}
			if (array.length === 0) return '';
			return array;
		},
		
		/*
		 * returns true if
		 * 	all kids don't have children
		 * 	and they also don't have values
		 * */
		allchildrenterminal: function (children) {
			for (var i in children) {
				if (children[i].children.length > 0 || children[i].value.length > 0) {
					return false;
				}
			}
			return true;
		},
		parseparenttag: function (tag, parent) {
			// value check
			if (tag.value.length > 0) {
			
				parent.obj[tag.line] = tag.value;
				
			// parent tag
			} else if (tag.children.length > 0) {

				if ( _mod.allchildrenterminal( tag.children ) ) {
					parent.obj[tag.line] = _mod.childrentoarray( tag.children );
				} else {
					parent.obj[tag.line] = tag.obj;
				}

			// parent tag with a single kid
			} else if (tag.children.length === 1) {
				if ( _mod.allchildrenterminal( tag.children ) ) {
					parent.obj[tag.line] = _mod.childrentoarray( tag.children );
				} else {
					parent.obj[tag.line] = tag.obj;
				}

			// terminal tag
			} else {
				
				if ( _mod.allchildrenterminal( tag.children ) ) {
					parent.obj[tag.line] = _mod.childrentoarray( tag.children );
				} else {
					parent.obj[tag.line] = tag.line;
				}
				
			}
		},
		_parsevalue: function (value) {
			if (value === 'true') return true;
			if (value === 'false') return false;
//			if (parseInt(value) !== NaN) return parseInt(value);
			return value;
		},
		parseroottag: function (tag, tree) {
			// parent tag
			if (tag.children.length > 0) {

				if ( _mod.allchildrenterminal( tag.children ) ) {
					tree[tag.line] = _mod.childrentoarray( tag.children );
				} else {
					tree[tag.line] = tag.obj;
				}

			// terminal tag
			} else {
				
				if (tag.value.length > 0) {
					tree[tag.line] = _mod._parsevalue(tag.value);
				} else {
					tree[tag.line] = true;
				}
				
			}
		},
		parse: function (parsedslang, options) {

			var dictionary	= {};
			var tree = {};

			for (var i in parsedslang) {
				
				var command = parsedslang[i];
				var tag = {
					uid:			parseInt(command.uid),
					line:			command.line,
					level:			command.level,
					parent:			command.parent,
					children:		[],
					obj:			{}
				};
				
				var splat = tag.line.split(' ');
				tag.line = splat[0];
				tag.value = splat.slice(1).join(' ');

				dictionary[tag.uid] = tag;
				if (command.parent > -1) {
					dictionary[command.parent].children.push( tag );
				}
			
			}
			
			for (var i in parsedslang) {
				
				tag = dictionary[ parsedslang[i].uid ];

				// and it has a parent
				if (tag.parent > -1) {
					
					var parent = dictionary[tag.parent];

					_mod.parseparenttag(tag, parent);

				} else {
					
					_mod.parseroottag(tag, tree, dictionary);
					
				}

			}
			
			return tree;
			
		}

	};

	module.exports = _mod;

})();
