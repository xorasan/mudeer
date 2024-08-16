// put global functions here that are only available to zaboon
var
is_partly_visible = function (el, partiallyVisible = true) {
	const { top, left, bottom, right } = el.getBoundingClientRect();
	const { innerHeight, innerWidth } = window;
	return partiallyVisible
		? ((top > 0 && top < innerHeight) ||
			(bottom > 0 && bottom < innerHeight)) &&
			((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
		: top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
},
select_content = function (e, start, end) {
	if (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) {
		if (isnum(start)) {
			e.selectionStart = start || 0;
			e.selectionEnd = end || start || 0;
		} else if (isfun(e.select)) {
			e.select();
		}
	} else {
		function getTextNodesIn(node) {
			var textNodes = [];
			if (node.nodeType == 3) {
				textNodes.push(node);
			} else {
				var children = node.childNodes;
				for (var i = 0, len = children.length; i < len; ++i) {
					textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
				}
			}
			return textNodes;
		}
		if (document.createRange && window.getSelection) {
			var range = document.createRange();
			range.selectNodeContents(e);
			var textNodes = getTextNodesIn(e);
			var foundStart = false;
			var charCount = 0, endCharCount;

			for (var i = 0, textNode; textNode = textNodes[i++]; ) {
				endCharCount = charCount + textNode.length;
				if (!foundStart && start >= charCount
						&& (start < endCharCount ||
						(start == endCharCount && i <= textNodes.length))) {
					range.setStart(textNode, start - charCount);
					foundStart = true;
				}
				if (foundStart && end <= endCharCount) {
					range.setEnd(textNode, end - charCount);
					break;
				}
				charCount = endCharCount;
			}

			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (document.selection && document.body.createTextRange) {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(e);
			textRange.collapse(true);
			textRange.moveEnd("character", end);
			textRange.moveStart("character", start);
			textRange.select();
		}
	}
},
get_caret_position = function (e) {
	if (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) {
		return [e.selectionStart, e.selectionEnd];
	}

    var start = 0;
    var end = 0;
    var doc = e.ownerDocument || e.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(e);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            start = preCaretRange.toString().length;
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            end = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(e);
        preCaretTextRange.setEndPoint("EndToStart", textRange);
        start = preCaretTextRange.text.length;
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        end = preCaretTextRange.text.length;
    }
    return [start, end];
},
enc = function (v) {
	return encodeURIComponent(v);
},
dec = function (v) {
	return decodeURIComponent(v);
},
encp = function (v) {
	return encodeURI(v);
},
decp = function (v) {
	return decodeURI(v);
},
innerhtml = function (obj, v) {
	obj.innerHTML = v;
},
setvalue = function (obj, v) {
	obj.value = v;
},
scroll_by = function (x, y, a) {
	scrollBy({ left: x, top: y, behavior: a ? 'smooth' : 'instant' });
},
scroll_to = function (x, y, a) {
	scrollTo({ left: x, top: y, behavior: a ? 'smooth' : 'instant' });
},
scrollintoview = function (obj) {
	obj && obj.scrollIntoView(1);
},
scroll_into_view_with_padding = function (e, padding) {
	var rect = e.getBoundingClientRect();
	var padt, padb, pads, pade;

	padt = padb = padding || 0;
	if (isarr(padding)) {
		if (padding.length == 2) { // [v, h]
			padt = padb = padding[0];
			pads = pade = padding[1];
		}
		if (padding.length == 4) { // cw [t, e, b, s]
			padt = padding[0];
			pade = padding[1];
			padb = padding[2];
			pads = padding[3];
		}
	}
	
	var se = scrollingelement(), top;
	
	if (rect.y < padt) {
		top = padt;
	} else if (rect.y >= innerheight()-padb) {
		top = innerheight()+padb; // extra to compensate for element height
	}
	// TODO horizontal
	if (isnum(top)) scrollTo({ top: top, behavior: 'smooth' });
},
prevsibling = function (obj) {
	return obj.previousElementSibling;
},
nextsibling = function (obj) {
	return obj.nextElementSibling;
},
getattribute = function (obj, k) {
	return obj.getAttribute(k);
},
attribute = function (obj, k, v) {
	v == '' ? obj.removeAttribute(k) : obj.setAttribute(k, v);
},
setcss = function (obj, k, v) {
	if (v === undefined)
		obj.style[k] = '';
	else
		obj.style[k] = v;
},
getcss = function (obj, k) {
	return obj.style[k];
},
popdata = function (obj, k, v) {
	if (obj) delete obj.dataset[k];
},
setdata = function (obj, k, v) {
	if (obj) obj.dataset[k] = v;
},
getdata = function (obj, k) {
	return obj.dataset[k];
},
innertext = function (obj, v) {
	if (isundef(v)) return obj.innerText;
	else obj.innerText = v;
},
innerwidth = function (v) { // returns width + v
	return innerWidth + (v||0);
},
innerheight = function (v) {
	return innerHeight + (v||0);
},
hasownprop = function (obj, i) {
	if (obj && obj.hasOwnProperty)
		return obj.hasOwnProperty(i);
},
izhar = function (v) {
	for (var v of arguments) {
		v.hidden = 0;
	}
},
ixtaf = function () {
	for (var v of arguments) {
		v.hidden = 1;
	}
},
isixtaf = function (v) {
	return v.hidden || getattribute(v, 'type') == 'hidden';
},
markooz = function () {
	return document.activeElement;
},
preventdefault = function (obj) {
	obj && obj.cancelable && obj.preventDefault && obj.preventDefault();
},
raycast = function (x, y) {
	return document.elementsFromPoint(x, y);
},
elementbyid = function (id) {
	return document.getElementById(id);
},
listener = function (obj, name, fn, o) {
	if (typeof obj === 'string' || obj instanceof Array)
		o = fn,
		fn = name,
		name = obj,
		obj = window;

	if (name instanceof Array) { // TODO return array
		name.forEach(function (item) {
			obj.addEventListener(item, fn, o);
		});
	} else obj.addEventListener(name, fn, o);
	
	return {
		remove: function () {
			obj.removeEventListener(name, fn);
		}
	};
},
createelement = function (name, classes, id) {
	var e = document.createElement(name||'div');
	if (classes) e.className = classes;
	if (id) e.id = id;
	return e;
},
tahmeel = function (filename, text, mimetype, encode) { // download file with a name
	let e = createelement('a'), prefix = '';
	if (mimetype !== false) prefix = (mimetype||'data:text/plain;charset=utf-8,');
	if (encode   !== false) text = encodeURIComponent(text);

	attribute(e, 'href', prefix + text);
	attribute(e, 'download', filename);
	setcss(e, 'display', 'none');
	document.body.appendChild(e);
	e.click();
	document.body.removeChild(e);
},
download_blob = function ({ blob, file_name = 'file.bin' } = {}) {
	const url = window.URL.createObjectURL(blob);
	let e = createelement('a');
	attribute(e, 'href', url);
	attribute(e, 'download', file_name);
	setcss(e, 'display', 'none');
	document.body.appendChild(e);
	e.click();
	document.body.removeChild(e);
	window.URL.revokeObjectURL(url);
},
iswithinelement = function (arr, element) {
	var a = arr[0],
		b = arr[1],
		x = element.offsetLeft,
		y = element.offsetTop,
		w = x+element.offsetWidth,
		h = y+element.offsetHeight;
	
	return (a >= x && a <= w && b >= y && b <= h);
},
getposition = function (el) {
	var x = 0, y = 0, w = 0, h = 0;
	
	if (el) {
		var pos = el.getBoundingClientRect();
		x = pos.x; y = pos.y;
		w = pos.width; h = pos.height;
	}

	return [x, y, w, h];
},
get_bounds = getposition,
replacewith = function (el, el2) {
	el.replaceWith(el2);
};
;(function(){
	// element.replaceWith(otherelement) is not available on kaiOS Gecko 48
	var replacewithpolyfill = function () {
	  'use-strict'; // For safari, and IE > 10
	  var parent = this.parentNode, i = arguments.length, currentNode;
	  if (!parent) return;
	  if (!i) // if there are no arguments
		parent.removeChild(this);
	  while (i--) { // i-- decrements i and returns the value of i before the decrement
		currentNode = arguments[i];
		if (typeof currentNode !== 'object'){
		  currentNode = this.ownerDocument.createTextNode(currentNode);
		} else if (currentNode.parentNode){
		  currentNode.parentNode.removeChild(currentNode);
		}
		// the value of "i" below is after the decrement
		if (!i) // if currentNode is the first argument (currentNode === arguments[0])
		  parent.replaceChild(currentNode, this);
		else // if currentNode isn't the first
		  parent.insertBefore(currentNode, this.nextSibling);
	  }
	}
	if (!Element.prototype.replaceWith)
		Element.prototype.replaceWith = replacewithpolyfill;
	if (!CharacterData.prototype.replaceWith)
		CharacterData.prototype.replaceWith = replacewithpolyfill;
	if (!DocumentType.prototype.replaceWith) 
		DocumentType.prototype.replaceWith = replacewithpolyfill;
})();
