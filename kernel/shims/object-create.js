// use case: memory efficient .method sharing
// use .assign for .property sharing
// 
if (!Object.create) {
	Object.create = function (o) {
		if (arguments.length > 1) {
			throw new Error ("only takes one argument");
		}
		
		function F() {};
		F.prototype = o;
		return new F();
	};
}
