/**
 *  @desc: 常规函数
 * 
 *  @API:
 *      ^isEqual^max^min^globalEval
 * 
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-16
 */
;(function(S){
    var toString = Object.prototype.toString,
        eq
    ;
    S.mix(S , {
        /**
         * 比较两个对象是否相等
         * @param {Object} a        目标对象1
         * @param {Object} b        目标对象2
         * 
         * @return {Boolean}        是否相等   
         */
        isEqual: function(a , b){
            return eq(a , b  , []);
        },
        /**
         * 最大值获取
         * @param {Object} obj              目标对象
         * @param {Object} iterator         遍历条件
         * @param {Object} context          遍历条件执行上下文              
         * 
         * 
         * @return {Number}                 最大值   
         */
        max: function(obj, iterator, context) {
            //如果是有效数组,且未提供遍历条件
            if (!iterator && S.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
              return Math.max.apply(Math, obj);
            }
            
            if (!iterator && S.isEmpty(obj)) return -Infinity;
            
            var result = {computed : -Infinity};
            
            S.each(obj, function(value, index, list) {
              var computed = iterator ? iterator.call(context, value, index, list) : value;
              computed >= result.computed && (result = {value : value, computed : computed});
            });
            
            return result.value;
        },
        
        /**
         * 最小值获取
         * @param {Object} obj              目标对象
         * @param {Object} iterator         遍历条件
         * @param {Object} context          遍历条件执行上下文              
         * 
         * 
         * @return {Number}                 最小值   
         */
        min: function(obj, iterator, context) {
            //如果是有效数组,且未提供遍历条件
            if (!iterator && S.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
              return Math.min.apply(Math, obj);
            }
            
            if (!iterator && S.isEmpty(obj)) return Infinity;
            
            var result = {computed : Infinity};
            
            S.each(obj, function(value, index, list) {
              var computed = iterator ? iterator.call(context, value, index, list) : value;
              computed < result.computed && (result = {value : value, computed : computed});
            });
            
            return result.value;
        },
        // 执行字符串脚本
        globalEval: function(data) {
            var indirect = eval;
            if ( S.trim(data)) {
                indirect(data + ";");
            }
        }
    });
    
    
    /**
     * 
     * 比较两个目标对象是否相等(内部使用) 
     * @param {Object} a        目标对象
     * @param {Object} b        目标对象
     * @param {Array} stack     缓存之前通过比较的对象,防止重复比较
     */
    eq = function(a, b, stack){
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
        // 如果a和b指向同一个引用
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        // 处理null 和 undefined 
        if (a == null || b == null) return a === b;
        
        // 如果自带isEqual函数,则优先使用该函数
        if (a.isEqual && S.isFunction(a.isEqual)) return a.isEqual(b);
        if (b.isEqual && S.isFunction(b.isEqual)) return b.isEqual(a);
        
        // 比较内部[[CLASS]]属性,确保两个对象属于同一类型
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
          // 如果是字符串
          case '[object String]':
            // "5" == new String("5")
            return a == String(b);
          // 如果是数值型
          case '[object Number]':
            // 如果都是比较双方都是NaN, 可以认为是相等的
            // 否则必须保证自反性(a == +b)
            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
          // 如果是日期/布尔型
          case '[object Date]':
          case '[object Boolean]':
            // 首先需要被转换为数值型数据,然后比较是否一致
            return +a == +b;
          // 如果是正则表达式,则需要比较source和flags
          case '[object RegExp]':
            return a.source == b.source &&
                   a.global == b.global &&
                   a.multiline == b.multiline &&
                   a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        
        // 如果stack中存在a对象,我们可以认为这个之前已经比较过,而无需再次比较.
        var length = stack.length;
        while (length--) {
          if (stack[length] == a) return true;
        }
        // 入栈
        stack.push(a);
        /* 对象和数组 */
        var size = 0, result = true;
       //数组
        if (className == '[object Array]') {
          // 首先比较其长度
          size = a.length;
          result = size == b.length;
          // 逐项比较
          if (result) {
            while (size--) {
              // 深度比较
              if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
            }
          }
        //对象
        } else {
          // 首先比较构造函数
          if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
          // 其次比较属性名
          for (var key in a) {
            if (S.has(a, key)) {
              size++; 
              // 深度比较
              if (!(result = S.has(b, key) && eq(a[key], b[key], stack))) break;
            }
          }
          // 最后比较属性数量
          if (result) {
            for (key in b) {
              if (S.has(b, key) && !(size--)) break;
            }
            result = !size;
          }
        }
        // 出栈
        stack.pop();
        return result;
    };
})(window.zjport);