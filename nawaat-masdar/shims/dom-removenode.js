/* removeNode */
if ( window.Node ) Node.prototype.removeNode = function( removeChildren ) { var self = this; if ( Boolean( removeChildren ) ) { return this.parentNode.removeChild( self ); } else { var range = document.createRange(); range.selectNodeContents( self ); return this.parentNode.replaceChild( range.extractContents(), self ); } }
