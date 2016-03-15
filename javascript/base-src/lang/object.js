/**
 *  
 *  @desc: 对象操作函数
 *  
 *  @API:
 *      ^object^keys^has^cached^mix^merge^namespace
 *
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-12
 */
;(function(S, undefined){
    var i,
        UNDEFINED,
        PERIOD= ".",
        global_NS= "zjp",
        
        hasOwn= Object.prototype.hasOwnProperty,
        EMPTY= function(){},
        hasEnumBug= S._hasEnumBug = !{valueOf: 0}.propertyIsEnumerable('valueOf'),
        hasProtoEnumBug= S._hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ],
        
        nativeArraySlice = Array.prototype.slice,
        nativeObjectProto= Object.prototype,
        navtiveCreate= Object.create,
        nativeKeys= Object.keys,
        nativeHasOwnProperty= nativeObjectProto.hasOwnProperty
    ;
    
    
    _simpleMix(S , {
        
        /**
         *  创建一个新对象, 并且继承其他对象
         *  @param {Object}   obj    继承属性
         *  @return {Object}          新对象
         */
        object: function(obj){
            if(navtiveCreate && S.isFunction(navtiveCreate)){
                return navtiveCreate(obj);
            }else{
               EMPTY.prototype= obj;
               return new EMPTY();
            }
        },
        
        /**
         *  返回对象中所有属性键
         *  @param {Object}   obj    目标对象
         *  @return {Array}           
         */
        keys: nativeKeys || function(obj){
            var reslut = [],
                k
            ;
            
            if(obj !== Object(obj)){
                return reslut;
            }
            
            for(k in obj){
                reslut[k] = obj[k];
            }
            
            if (hasEnumBug) {
                for (i = enumProperties.length - 1; i >= 0; i--) {
                    k = enumProperties[i];
                    if (S.has(obj , k)) {
                        result.push(k);
                    }
                }
            }
            return reslut;
        },
        
        /**
         *  判断目标对象中是否存在目标属性
         *  @param {Object}   obj    目标对象
         *  @param {String}   key    目标属性键
         *  @return {Boolean}           
         */
        has: function(obj , key){
            return nativeHasOwnProperty.call(obj, key);
        },
        
        
        /**
         * getter/setter 缓存
         * 
         * @example
         * 
         *  
         *  var cachObj = S.cached((function(){
         *      var i= 0;
         *      return function(key){
         *          i += 1;
         *          return key+"_" +i;
         *      }
         *  })());
         * 
         * cachObj("key1"); //=>key1_1   //setter
         * cachObj("key1"); //=>key1_1   //getter
         * 
         * cachObj("key2"); //=>key2_2   //setter
         * cachObj("key3"); //=>key3_3   //setter
         * 
         * 
         * @param {Function} source         缓存值生成函数
         * @param {Object} cache            缓存对象[默认为空对象]
         * @param {Boolean|Any} refetch     是否强制写入缓存中
         * 
         */
        cached: function(source, cache, refetch) {
            cache || (cache = {});
        
            return function(arg) {
                var key = arguments.length > 1 ?
                        Array.prototype.join.call(arguments, CACHED_DELIMITER) :
                        String(arg);
        
                if (!(key in cache) || (refetch && cache[key] == refetch)) {
                    cache[key] = source.apply(source, arguments);
                }
        
                return cache[key];
            };
        },
        
        /**
         * 对象合并到第一个对象上
         * 
         * @param {Object}   target       目标对象.
         * @param {Object}   var_args     原始对象
         * @param {boolean}  deep         深度合并
         */
        mix: function(target, var_args/*, deep*/){
            var args = arguments,
                length = args.length,
                deep,
                index = 0
            ;
            
            if(typeof args[length - 1] === 'boolean'){
                deep = args[length - 1];
                length--;
            }
            
            if(args == null){
                return target;
            }
            if(deep === true){
                return _internalMix.apply(S, nativeArraySlice.call(arguments, 0, length));
            }else{
                while(++index < length){
                    _simpleMix(target, args[index])
                }
                return target;
            }
        },
        
        /**
         * 对象合并为新的对象,而且如果出现相同的key值,会覆盖之前的相同key属性
         * 
         * @param {Object}  任意数量的对象.
         * @return {Object} 合并后的对象.
         * 
         */
        merge: function () {
            var i      = 0,
                len    = arguments.length,
                result = {},
                key,
                obj;
        
            for (; i < len; ++i) {
                obj = arguments[i];
        
                for (key in obj) {
                    if (S.has(obj, key)) {
                        result[key] = obj[key];
                    }
                }
            }
        
            return result;
        },
        
        /**
         * 
         * 创建命名空间
         * 
         * @param {String} 任意数量的命名空间,以点号{.}分隔.
         * @return {Object} 返回最后一个命名空间对象
         * 
         */
        namespace: function(){
            var a = arguments, o, i = 0, j, d, arg;
            for (; i < a.length; i++) {
                o = this; 
                arg = a[i];
                if (arg.indexOf(PERIOD) > -1) {
                    d = arg.split(PERIOD);
                    for (j = (d[0] == global_NS) ? 1 : 0; j < d.length; j++) {
                        o[d[j]] = o[d[j]] || {};
                        o = o[d[j]];
                    }
                } else {
                    o[arg] = o[arg] || {};
                    o = o[arg];
                }
            }
            return o;
        }
        
    });
    
    
    function _simpleMix(target , source){
        for(i in source){
            target[i] = source[i];
        }
    }
    function _internalMix(object, source/*,callback , stackA, stackB, recursion*/) {
        var args = arguments,
            index = 0,
            length = args.length,
            stackA = [],
            stackB = [],
            recursion = args[length - 1],
            callback
        ;
        
        if (!S.isObject(object) && !S.isArray(object)) {
            return object;
        }
        
        if(typeof recursion === 'number' && recursion === 1){
            stackA = args[length - 3];
            stackB = args[length - 2];
            length = length - 3;
        }
        
        if(length > 2 && typeof args[length - 1] == 'function'){
            callback = args[--length];
        }
        
        while (++index < length) {
            S.each(args[index], function(source, key) {
                var result = source,
                    value = object[key],
                    found,
                    isArr,
                    stackLength,
                    isShallow
                ;
            
                if (source && (( isArr = S.isArray(source)) || S.isPlainObject(source))) {
                    // avoid merging previously merged cyclic sources
                    stackLength = stackA.length;
                    while (stackLength--) {
                        if ((found = stackA[stackLength] == source)) {
                            value = stackB[stackLength];
                            break;
                        }
                    }
                    if (!found) {
                        if (callback) {
                            result = callback(value, source);
                            if ((isShallow = typeof result != 'undefined')) {
                                value = result;
                            }
                        }
                        if (!isShallow) {
                            value = isArr ? (S.isArray(value) ? value : []) : (S.isPlainObject(value) ? value : {});
                        }
                        // add `source` and associated `value` to the stack of traversed objects
                        stackA.push(source);
                        stackB.push(value);

                        // recursively merge objects and arrays (susceptible to call stack limits)
                        if (!isShallow) {
                            value = _internalMix(value, source, callback, stackA, stackB, 1);
                        }
                    }
                } else {
                    if (callback) {
                        result = callback(value, source);
                        if ( typeof result == 'undefined') {
                            result = source;
                        }
                    }
                    if ( typeof result != 'undefined') {
                        value = result;
                    }
                }
                object[key] = value;
            });
        }
        return object;
    }
})(window.zjport);