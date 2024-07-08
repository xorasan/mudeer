/* 01 Jan 2017
 * these are on demand
 * included in the custom engine build process
 * standard ECMA/JS shims
 * don't include shims for non-standard JS features
 * or vendor specific features here
 * index   engine/shims.js
 * 				  shims/node.js
 * 				  shims/dom-removenode.js
 * 				  shims/object-create.js
 * 				  shims/object-assign.js
 * 				  shims/string-trim.js
 */

if (typeof module !== 'object') { module = {}; }
if (typeof module.exports !== 'object') { module.exports = {}; }
if (typeof window !== 'object') { window = global||{}; }
if (typeof global !== 'object') { global = window||{}; }
if (typeof document !== 'object') {
	document = {
		body: {},
//		getElementsByTagName: function () { return []; }
	};
}
