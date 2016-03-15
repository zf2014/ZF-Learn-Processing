;(function($, S, undefined){
    
    // http://james.padolsey.com/javascript/76-bytes-for-faster-jquery/
    // 避免因过多创建jQuery对象而产生的性能消耗问题
    // 注意: 该方式创建的对象不能用于异步或事件回调函数中
    S.fastJQuery = (function(){
        var obj = $([1]);
        return function(node) {
            obj[0] = node;
            return obj;
        };
    })();
}(jQuery, window.zjport));