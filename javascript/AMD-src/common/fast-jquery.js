define(['jquery'], function($){
	return (function(){
        var obj = $([1]);
        return function(node) {
            obj[0] = node;
            return obj;
        };
    })();
});