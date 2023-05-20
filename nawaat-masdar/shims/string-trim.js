/* Trim - 24Dec2014 */
;(function () { if (!String.prototype.trim) { String.prototype.trim = function trim() { return this.toString().replace(/^([\s]*)|([\s]*)$/g, ''); }; } })();
