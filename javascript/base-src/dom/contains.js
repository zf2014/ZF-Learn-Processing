;(function(){
    if ( document.documentElement.contains ) {
      dom.contains = function( a, b ) {
        return a !== b && (a.contains ? a.contains(b) : true);
      };
    } else if ( document.documentElement.compareDocumentPosition ) {
      dom.contains = function( a, b ) {
        return !!(a.compareDocumentPosition(b) & 16);
      };
    } else {
      dom.contains = function() {
        return false;
      };
    }
}())
