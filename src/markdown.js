var Markdown;
;(function(){
	'use strict';

	Markdown = {
		shorten: function (text, maxLength = 75) {
			if (text.length <= maxLength) { return text; }

			const start = text.slice(0, maxLength / 2 - 1);
			const end = text.slice(-maxLength / 2 + 2);

			return start+'…'+end;
		},
		deformat: function (text) {
			text = Markdown.htmlentities( text );
			
			text = text.replace(/\n  /g, ' ');

			// strong
			text = text.replace(/\*\*(.+?!*)\*\*/gm, '$1');
			
			// emphasize
			text = text.replace(/\*(.+?!*)\*/gm, '$1');
			
			// strike
			text = text.replace(/\~\~(.+?!~)\~\~/gm, '$1');
			
			// code
			text = text.replace(/\`\`\`(.+?)\`\`\`/gm, '$1');
			
			return text;
		},
		format: function (text, allowbreaks) {
			text = Markdown.htmlentities( text );
			
			if (allowbreaks)
				text = text.replace(/\n  /g, '<br />');

			// strong
			text = text.replace(/\*\*(.+?!*)\*\*/gm, '<strong>$1</strong>');
			
			// emphasize
			text = text.replace(/\*(.+?!*)\*/gm, '<em>$1</em>');
			
			// strike
			text = text.replace(/\~\~(.+?!*)\~\~/gm, '<strike>$1</strike>');
			
			// code
			text = text.replace(/\`\`\`(.+?)\`\`\`/gm, '<code>$1</code>');

			text = Markdown.linkify(text);
			
			return text;
		},
		linkify: function (inputText) {
			var replacedText, replacePattern1, replacePattern2, replacePattern3;
			
			//URLs starting with http://, https://, or ftp://
			replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
			replacedText = inputText.replace(replacePattern1, function (ignore, a) {
				return '<a href="'+a+'" target="_blank">'+Markdown.shorten(a)+'</a>';
			});
			
			//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
			replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
			replacedText = replacedText.replace(replacePattern2, function (ignore, a, b) {
				return a+'<a href="http://'+b+'" target="_blank">'+Markdown.shorten(b)+'</a>';
			});
			
			//Change email addresses to mailto:: links.
			replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
			replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
			
			return replacedText;
		},
		render: function (text, options) {
			var rendered = '';
			options = options || {};
			var use_span = options.use_span;
			text = ( text || '' );
			
			text = text.split('\n');
			
			text.forEach(function (part, i) {
				part = part.trim();
				
				if (part === '') {
					// remove empty parts
				}
				else if (part.startsWith('-')) {
					part = part.substr(1);
					rendered += '<li>' + Markdown.format(part, true) + '</li>';
				}
				else if (part.startsWith('##')) {
					part = part.substr(2);
					part = Markdown.htmlentities(part);
					rendered += '<h2>' + part + '</h2>';
				}
				else if (part.startsWith('#')) {
					part = part.substr(1);
					part = Markdown.htmlentities(part);
					rendered += '<h1>' + part + '</h1>';
				}
				else if (part.startsWith('```')) {
					part = part.substr(4);
					rendered += '<pre>' + Markdown.format(part, true).replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') + '</pre>';
				}
				else if (part.startsWith('"\n') && part.endsWith('\n"')) {
					part = part.replace('"\n', '');
					part = part.replace('\n"', '');
					rendered += '<blockquote>' + Markdown.format(part, true) + '</blockquote>';
				}
				else if (part.startsWith('[') && part.endsWith(')')) {
					part.replace(/\[(.*)\]\((.+)\)/gm, function (fulltext, title, path) {
						title = Markdown.htmlentities(title);
						path = Markdown.htmlentities(path);
						rendered += '<a class=l href="'+path+'">' + title + '</a>';
					});
				}
				else if (part.startsWith('![') && part.endsWith(')')) {
					part.replace(/\!\[(.*)\]\((.+)\)/gm, function (fulltext, title, path) {
						title = Markdown.htmlentities(title);
						path = Markdown.htmlentities(path);
						rendered += '<a class=l href="' + path + '"><span>' + title + '</span><br><img src="' + path + '" /></a>';
					});
				}
				else {
					rendered += (use_span ? '<span>' : '<p>')
							 +  Markdown.format(part, true)
							 +  (use_span ? '</span>' : '</p>');
				}
			});
			
			return rendered;
		},
		/*
		 * auto gens a text intro from a page or article
		 * */
		getintro: function (text) {
			var parts = Markdown.toparts(text), rendered = '';
			parts.toNative().reverse().forEach(function (part) {
				if (part.type === 'paragraph' && rendered === '')
					rendered += part.content;
			});
			
			rendered = Markdown.deformat(rendered);
			
			return rendered.substr(0, 240) + (rendered.length > 240 ? '&hellip;' : '');
		},
		getphoto: function (text) {
			var parts = Markdown.toparts(text), rendered = '';
			parts.toNative().reverse().forEach(function (part) {
				if (part.type === 'photo' && rendered === '')
					rendered = part.path;
			});
			return rendered;
		},
		toparts: function (text) {
			var parts = [];
			
			text = ( text || '' ).split('\n\n');
			
			text.forEach(function (part, i) {
				part = part.trim();
				
				if (part === '') {
					// remove empty parts
				}
				else if (part.startsWith('-')) {
					part = part.substr(1);
					parts.push({
						uid:		i+1,
						type:		'bullet',
						content:	part.replace(/\n  /g, '\n'),
					});
				}
				else if (part.startsWith('## ')) {
					part = part.substr(3);
					parts.push({
						uid:		i+1,
						type:		'headline2',
						content:	part,
					});
				}
				else if (part.startsWith('# ')) {
					part = part.substr(2);
					parts.push({
						uid:		i+1,
						type:		'headline',
						content:	part,
					});
				}
				else if (part.startsWith('```')) {
					part = part.substr(7);
					part = part.replace(/\n  /g, '\n');
					parts.push({
						uid:		i+1,
						type:		'code',
						content:	part,
					});
				}
				else if (part.startsWith('"\n') && part.endsWith('\n"')) {
					part = part.replace('"\n', '');
					part = part.replace('\n"', '');
					parts.push({
						uid:		i+1,
						type:		'quote',
						content:	part.replace(/\n  /g, '\n'),
					});
				}
				else if (part.startsWith('[') && part.endsWith(')')) {
					part.replace(/\[(.*)\]\((.+)\)/gm, function (fulltext, title, path) {
						parts.push({
							uid:		i+1,
							type:		'link',
							title:		title,
							path:		path,
						});
					});
				}
				else if (part.startsWith('![') && part.endsWith(')')) {
					part.replace(/\!\[(.*)\]\((.+)\)/gm, function (fulltext, title, path) {
						parts.push({
							uid:		i+1,
							type:		'photo',
							title:		title,
							path:		path,
						});
					});
				}
				else {
					// this merges consecutive paragraphs
//					var lastpart = parts[ parts.length-1 ];
//					if (lastpart && lastpart.type === 'paragraph') {
//						lastpart.content += '\n\n' + part;
//					} else {
						parts.push({
							uid:		i+1,
							type:		'paragraph',
							content:	part.replace(/\n  /g, '\n'),
						});
//					}
				}
			});
			
//			$.log.s( parts );
			var finalparts = [];
			parts.reverse();
			for (var i in parts) {
				var part = parts[i];
				
				// these are needed for proper listview order
				part.uid = ( parseInt(i) + 1 );
				
				finalparts.push( part );
			}
			
			return $.array( parts );
		},
		brwithspaces: function (text) {
			return String(text).replace(/\n/g, '\n  ')
		},
		htmlentities: function (str) {
			return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},
	};

})();