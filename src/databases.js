/* Databases wrapper around wrappers like mysql, mongodb, sqlite, ...
 * 
 * 
 */

Databases = {}, uid_with_value = {};
;(function () {
	'use strict';
	Databases = {
		uid_value: function (u, v) {
			return { uid: u, value: v };
		}
	};
	uid_with_value = Databases.uid_value;
	
	module.exports = Databases;
})();
