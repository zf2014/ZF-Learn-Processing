/**
 * 文件: .js 
 * 公司: 浙江电子口岸
 * 作者: qzzf1987@gmail.com
 * 时间: 2014-10-28 14:44:41
 */
;(function(name, definition){

  if(typeof define == 'function'){
      define(definition);
  }else{
    this[name] = definition();
  }
  // this[name] = definition(require, exports, module);
  
}('zjport', function(){
    var EMPTY = '',
        global = typeof global === 'undefined'? this : global,
        guid = 0,
        prevObj = global.zjport || {},
        Z
    ;

    Z = {
        ENV: {
            host : global
        },
        CONFIG: {
            debug : false
        },

        VERSION: "1.0.0",

        now: function(){
            return +new Date();
        },
        log: function(){
            global.console&&
            console.log&&
            console.log.apply(console, arguments);
        },
        error: function(){
            global.console&&
            console.error&&
            console.error.apply(console, arguments);
        },
        debug: function(msg){
            if(this.CONFIG.debug){
                this.log.apply(this, [].slice.call(arguments, 0));
                // this.log(msg);
            }
        },
        guid: function (pre) {
            return (pre || EMPTY) + guid++;
        },
        noConflict: function(){
            global.zjport = prevObj;
            return this;
        },
        identity: function(value){
            return value;
        }
    };


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
})(Z);
;(function(S) {
  var i,
    l,
    FALSE = false,
    BREAKER = false,
    UNFIND_INDEX = -1,
    each,
    ArrayProto = Array.prototype,
    nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    slice = ArrayProto.slice,
    push = ArrayProto.push;


  S.mix(S, {
    /*
     * 遍历目标对象, 并且逐项操作.
     * @param obj               目标对象(数组|类数组|对象)
     * @param fn                回调函数
     *    @item  a              遍历元素
     *    @item  b              遍历索引
     *    @return(Any)          false:跳出遍历
     * @param context           指定上下文对象
     */
    each: function(obj, fn, context) {
      var i, l;
      if (obj == null) {
        return;
      }
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(fn, context);
      } else if (obj.length === +obj.length) {
        for (i = 0, l = obj.length; i < l; i++) {
          if (fn.call(context, obj[i], i, obj) === BREAKER) {
            return;
          }
        }
      } else {
        for (i in obj) {
          if (S.has(obj, i)) {
            if (fn.call(context, obj[i], i, obj) === BREAKER) {
              return;
            }
          }
        }
      }
    },
    /**
     * 保证目标对象中至少一项满足匹配操作
     * @param obj       目标对象
     * @param fn        匹配操作每个列表项
     * @param context   指定上下文对象
     * @return(Boolean) 是否匹配
     */
    some: function(obj, fn, context) {
      var result = FALSE;
      fn || (fn = S.identity);
      if (obj == null) return result;
      if (nativeSome && obj.some === nativeSome) {
        return obj.some(fn, context);
      }
      each(obj, function(value, index, list) {
        if (result || (result = fn.call(context, value, index, list))) return BREAKER;
      });
      return !!result;
    },

    /**
     * 保证数组中任何项都满足匹配操作
     * @param array         目标对象
     * @param fn            匹配操作每个列表项
     *  @return(Boolean)    每项匹配结果(如果返回false,则终止后续匹配)
     * @param context       指定上下文对象
     * @return(Boolean)     是否匹配
     */
    every: function(array, fn, context) {
      var result = true;
      if (array == null) return result;
      if (nativeEvery && array.every === nativeEvery) {
        return array.every(fn, context);
      }
      each(array, function(value, index, list) {
        if (!(result = result && fn.call(context, value, index, list))) return BREAKER;
      });
      return !!result;
    },

    /**
     * 数组逐项映射
     * @param array         数组
     * @param fn            映射操作
     *  @return(Any)        映射结果
     * @param context       指定上下文对象
     * @return(Array)       映射结果集
     */
    map: function(array, fn, context) {
      var reslut = [];
      if (array == null) {
        return;
      }
      if (nativeMap && array.map === nativeMap) {
        reslut = array.map(fn, context);
      } else {
        each(array, function(value, index, list) {
          reslut[reslut.length] = fn.call(context, value, index, list);
        });
      }
      return reslut;
    },
    /**
     * 提供一个可以归纳操作数组各项的函数,并且最终返回操作结果
     * @param array         数组
     * @param fn            归纳操作
     *  @return(Any)        归纳操作结果
     * @param memo          初始项(如果未提供,则由数组第一项替换)
     * @param context       指定上下文对象
     * @return(Any)         最终累加操作结果
     *
     */
    reduce: function(array, fn, memo, context) {
      var initial = arguments.length > 2;
      if (array == null) {
        array = [];
      }
      if (nativeReduce && array.reduce === nativeReduce) {
        if (context) {
          fn = S.bind(fn, context);
        }
        return initial ? array.reduce(fn, memo) : array.reduce(fn);
      }
      each(array, function(value, index, list) {
        if (!initial) {
          memo = value;
          initial = true;
        } else {
          memo = fn.call(context, memo, value, index, list);
        }
      });
      if (!initial) throw new TypeError('Reduce of empty array with no initial value');
      return memo;
    },
    /*
     * 有序数组中查找目标项的最接近的索引值(二分法查询)
     * @param array         有序数组
     * @param obj           查询项
     * @param fn            匹配操作
     *
     * @return 索引值
     */
    sortedIndex: function(array, obj, fn) {
      var value,
        low = 0,
        high = array.length;
      fn || (fn = S.identity);
      value = fn(obj);
      while (low < high) {
        var mid = (low + high) >> 1;
        fn(array[mid]) < value ? low = mid + 1 : high = mid;
      }
      return low;
    },
    /*
     * 数组中查找目标项的索引值
     * @param array         数组
     * @param item          查询项
     * @param isSorted      是否是有序数组
     *
     * @return 索引值                  -1表示未找到
     */
    indexOf: function(array, item, isSorted) {
      if (array == null) {
        return UNFIND_INDEX;
      }
      if (isSorted) {
        i = S.sortedIndex(array, item);
        return array[i] === item ? i : UNFIND_INDEX;
      }
      if (nativeIndexOf && array.indexOf === nativeIndexOf) {
        return array.indexOf(item);
      }
      for (i = 0, l = array.length; i < l; i++) {
        if (array[i] === item) {
          return i;
        }
      }
      return UNFIND_INDEX;
    },


    /*
     * 数组过滤(匹配的)
     * @param array         目标数组
     * @param fn            过滤操作
     * @param context       指定上下文对象
     *
     * @return Array        过滤结果集
     */
    filter: function(array, fn, context) {
      var results = [];
      if (array == null) return results;
      if (nativeFilter && array.filter === nativeFilter) {
        return array.filter(fn, context);
      }
      each(array, function(value, index, list) {
        if (fn.call(context, value, index, list)) results[results.length] = value;
      });
      return results;
    },


    /*
     * 数组过滤(不匹配的)
     * @param array         目标数组
     * @param fn            过滤操作
     * @param context       指定上下文对象
     *
     * @return Array        过滤结果集
     */
    reject: function(array, fn, context) {
      return S.filter(array, function(value, index, list) {
        return !fn.call(context, value, index, list);
      }, context);
    },


    /*
     * 截取数组末尾N个元素
     * @param array                 目标数组
     * @param n [可选|0]            截取个数
     * @return Any                  截取结果集
     */
    last: function(array, n) {
      if (n != null) {
        return slice.call(array, Math.max(array.length - n, 0));
      } else {
        return array[array.length - 1];
      }
    },

    /*
     * 截取数组开头N个元素
     * @param array                 目标数组
     * @param n [可选|0]            截取个数
     * @return Any                  截取结果集
     */
    first: function(array, n){
      if (array == null) return void 0;
      return (n == null) ? array[0] : slice.call(array, 0, n);
    },

    /*
     * 过滤掉数组中重复项
     * @param array                 目标数组
     * @param isSorted              是否是有序数组
     * @param fn                    映射条件
     *
     * @return Array                处理后的结果集
     */
    unique: function(array, isSorted, fn) {
      var initial = fn ? S.map(array, fn) : array;
      var results = [];
      S.reduce(initial, function(memo, value, index) {
        if (isSorted ? (S.last(memo) !== value || !memo.length) : !S.inArray(memo, value)) {
          memo.push(value);
          results.push(array[index]);
        }
        return memo;
      }, []);
      return results;
    },
    /*
     * 搜索目标对象
     * @param {Object|Array}  obj            目标对象
     * @param {Function}      fn             搜索条件
     * @param {Object}        context        指定上下文对象
     *
     * @return Any           搜索结果
     */
    find: function(obj, fn, context) {
      var result;
      S.some(obj, function(value, index, list) {
        if (fn.call(context, value, index, list)) {
          result = value;
          return true;
        }
      });
      return result;
    },
    /*
     * 遍历目标对象,将各项的特定属性的值添加到结果集中
     * @param obj            目标对象
     * @param key            特定属性名
     *
     * @return Array         属性值结果集
     */
    pluck: function(obj, key) {
      return S.map(obj, function(value) {
        return value[key];
      });
    },
    /*
     * 数组压缩
     *
     * @param   args..      待压缩数组
     *
     * @return Array        压缩结果集
     */
    zip: function() {
      var args = slice.call(arguments);
      var length = S.max(S.pluck(args, 'length'));
      var results = new Array(length);
      for (var i = 0; i < length; i++) {
        results[i] = S.pluck(args, "" + i);
      }
      return results;
    },
    /*
     * 多维数组进行(1次或完全)摊平
     * @param {Array} array             多维数组
     * @param {Boolean} shallow         是否转为一维数组
     *
     * @return {Array}                  摊平结果
     */
    flatten: function(array, shallow) {
      return flatten(array, shallow, []);
    },
    /*
     * 判断数组中是否存在目标项
     * @param array         数组
     * @param item          目标项
     *
     * @return Boolean      TRUE|FALSE
     */
    inArray: function(array, item) {
      var found = FALSE;
      if (array == null) return found;
      return !!~S.indexOf(array, item);
    },
    /*
     * 将对象的所有属性值以数组形式表现
     * @param obj         目标对象.
     *
     * @return Array
     */
    values: function(obj) {
      return S.map(obj, S.identity);
    },
    /*
     *  两个数组合并成一个数组
     *  @param first         数组1.
     *  @param second        数组2
     *  @return {array}
     */
    arrayMerge: function(first, second) {
      return flatten(second, true, first);
    },
    /*
     * 将对象转换为数组类型
     * @param obj         目标对象.
     * @return Array
     */
    toArray: function(obj) {
      if (!obj) return [];
      if (S.isArray(obj)) return slice.call(obj);
      if (S.isArguments(obj)) return slice.call(obj);
      if (obj.toArray && S.isFunction(obj.toArray)) return obj.toArray();
      return S.values(obj);
    },

    /*
     * 将数组排序随机打乱
     * @param obj       目标对象
     * @return Array    打乱后的数组
     *
     * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     */
    shuffle: function(obj) {
      var rand;
      var index = 0;
      var shuffled = [];
      each(obj, function(value) {
        rand = S.random(index++);
        shuffled[index - 1] = shuffled[rand];
        shuffled[rand] = value;
      });
      return shuffled;
    },

     /*
     * 数组排序
     * @param obj           目标对象
     * @return iterator     排序策略
     * @return iterator     上下文
     *
     * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     */
    sortBy: function(obj, iterator, context){
      iterator = S.isFunction(iterator) ? iterator : S.identity;
      return S.pluck(
        // 先将目标数组转换成特定的数组, 包含特殊的排序因子
        S.map(obj, function(value, index, list) {
          return {
            value: value,
            index: index,
            criteria: iterator.call(context, value, index, list)
          };
        })
        // 具体的排序策略
        .sort(function(left, right) {
          var a = left.criteria;
          var b = right.criteria;
          if (a !== b) {
            if (a > b || a === void 0) return 1;
            if (a < b || b === void 0) return -1;
          }
          return left.index - right.index;
        }),

        'value');
      },

      // 计算数组(类数组对象)长度
      size: function(obj) {
        if (obj == null) return 0;
        return (obj.length === +obj.length) ? obj.length : S.keys(obj).length;
      }
  });

  //私有变量
  each = S.each;

  /*
   * 判断目标对象是类数组对象
   * @param obj           目标对象
   * @return Boolean      TRUE|FALSE
   */

  function isArraylike(obj) {
    var length = obj.length,
      type = S.type(obj);

    if (S.isWindow(obj)) {
      return false;
    }

    if (obj.nodeType === 1 && length) {
      return true;
    }

    return type === "array" || type !== "function" &&
      (length === 0 ||
      typeof length === "number" && length > 0 && (length - 1) in obj);
  }


  /**
   * 将输入对象摊平成数组
   * @param {Object} input        输入对象
   * @param {Object} shallow      是否完全摊平(如果设置为true,则输出结果为一维数组)
   * @param {Array} output        输出结果
   */

  function flatten(input, shallow, output) {
    each(input, function(value) {
      if (S.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  }
})(Z);
;(function(S){
    var global = S.ENV.host,
        nativeFunctionPrototype = Function.prototype,
        nativeFunctionBind = nativeFunctionPrototype.bind,
        nativeArraySlice = Array.prototype.slice,
        
        
        
        Ctor = function(){}
    ;
    
    
    S.mix(S , {
        
        
        /**
         *  为目标函数动态提供thisBind对象
         *  @param {Function}  func     目标函数
         *  @param {Object}    context  动态thisBind对象
         *  @return {Function}  新函数
         * 
         *  @example
         *  
         *  var obj = {
         *      name: 'zhangF',
         *      test: function(){
         *          console.log(this.name);
         *      }   
         *  }; 
         *  obj.test();  // => zhangF
         * 
         * 
         *  var testFuncContext = {
         *      name: 'zhangFeng'    
         *  }
         *  var newTestFunc = bind(obj.test, testFuncContext);
         *  newTestFunc(); // =>zhangFeng
         *   
         */
        bind : function(func, context) {
            
            var BFunction,
                args = nativeArraySlice.call(arguments, 2);
                
            if (func.bind === nativeFunctionBind && nativeFunctionBind){
                return nativeFunctionBind.apply(func, nativeArraySlice.call(arguments, 1));
            }
            if (!S.isFunction(func)) {
                S.debug("S.bind:传入参数不是函数类型！");
            }
            return BFunction = function() {
                var ctor,
                    excuteRst
                ;
                    
                if (!(this instanceof BFunction)) {
                    return func.apply(context, args.concat(nativeArraySlice.call(arguments)));
                }
                //假如是通过构造函数方式来触发
                Ctor.prototype = func.prototype;
                
                ctor = new Ctor;
                
                excuteRst = func.apply(ctor, args.concat(nativeArraySlice.call(arguments)));
                
                if(Object(excuteRst) === excuteRst){
                   return excuteRst;
                }
                
                return ctor;
            };
        },
        
        /**
         *   
         *  缓存目标函数执行结果
         *  @param {Function}  func     目标函数
         *  @param {Function}  keyer    缓存键生成器
         *  @return {Function}  新函数
         * 
         *  @example
         *   
         */
        memoize: function(func /*, keyer*/){
            var cached = {},
                keyer = S.isFunction(arguments[1])? arguments[1] : S.identity
            ;
            
            return function(){
                var args = arguments,
                    key = keyer.apply(this, args)
                ;
                
                return S.has(cached, key)?cached[key] : (cached[key] = func.apply(this, args));
                
            };
        },
        
        /**
         *  
         *  创建一个函数, 该函数接收任意多个函数.在触发该函数时,会依次执行这些函数,且消耗其返回的结果值.
         *  类似:a(b(c()));
         * 
         *  @param var_args       多个目标函数
         *  @return {Function}     新函数
         * 
         *  @example
         *  var a = function(b){
         *     return 'a' + b;     
         *  }
         *  var b = function(c){
         *     return 'b' + c;
         *  }
         *  var c = function(){
         *     return 'c';
         *  } 
         * 
         *  var abc = compose(a, b, c);
         *  console.log(abc());  // => abc
         *  
         *  等价于
         *  a(b(c()));
         *  
         */
        compose: function(var_args) {
            var funcs = arguments;
            
            return function() {
                var args = arguments, length = funcs.length;

                while (length--) {
                    args = [funcs[length].apply(this, args)];
                }
                return args[0];
            };
        },
        
        
        /**
         *  
         *  延迟(周期)性执行目标函数
         * 
         *  @param func     目标函数
         *  @param ms       延迟时间
         *  @param cycle    是否循环调用
         * 
         *  @return         标识
         * 
         */
        delay: function(func, ms, cycle){
            var args = nativeArraySlice.call(arguments, 2),
                callback = function(){
                    return func.apply(null, args);
                }
            ;
            return global[cycle?'setInterval':'setTimeout'](callback, ms);
        },
        
        /**
         *  
         *  创建一个函数, 将目标脱离出当前执行栈, 直到当前栈结束才被触发
         * 
         *  @param func     目标函数
         * 
         *  @return {Function}     新函数
         * 
         */
        defer: function(func) {
            var args = nativeArraySlice.call(arguments, 1);
            return setTimeout(function(){
                return func.apply(null, args);
            }, 1);
        },
        
        /**
         *  
         *  创建一个函数, 当该函数执行时, 目标函数必须等待一定时间才会被触发. 如果需要
         *  即可执行,可以设置immediate为true
         * 
         *  @param {Function} func          目标函数
         *  @param {Number}   wait          等待时间
         *  @param {Booleab}  immediate     是否立刻执行
         * 
         *  @return {Function}     新函数
         * 
         */
        debounce: function(func, wait, immediate){
          var timeout,
              args,
              context,
              timestamp,
              result
          ;
          return function() {

            context = this;
            args = arguments;
            timestamp = new Date();

            var later = function() {
              var last = (new Date()) - timestamp;
              if (last < wait) {
                timeout = setTimeout(later, wait - last);
              } else {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
              }
            };

            var callNow = immediate && !timeout;
            if (!timeout) {
              timeout = setTimeout(later, wait);
            }
            if (callNow) result = func.apply(context, args);
            return result;
          };
        },
        
        /**
         *  创建一个新函数, 该函数如果被连续触发, 那么在指定的间隔时间内只会被触发一次.
         * 
         *  @param func                 目标函数
         *  @param wait                 时间阀值
         *  @param options[可选]        可选参数
         *    @key lead{Boolean}        新创建的函数每次被执行时, 是否必须等待指定阀值才会被触发.
         *    @key tail{Boolean}        新创建的函数被连续执行时, 是否必须提供最后一次执行操作
         * 
         *  NOTE1:在未提供lead配置参数时, 新函数在第一次被触发时, 不会考虑阀值问题. 如果希望第一次触发也需要
         *        进行阀值控制, 那么必须传入lead=false.
         *  NOTE2:如果希望在未达到时间阀值而新函数被执行, 目标函数不被触发, 可以通过设置tail=false来使其失效.
         * 
         */
        throttle: function(func, wait, options){
            var throttled = false, // 启动状态
                args,
                result,
                thisArg,
                timeoutId = null,
                later,
                last = 0
            ;

            // 可选参数
            options || (options = {});

            later = function() {
                last = options.lead === false ? 0 : new Date;
                timeoutId = null;
                result = func.apply(thisArg, args);
            };
            
            return function() {
                
                var now, remaining;
                
                now = new Date;
                args = arguments;
                thisArg = this;

                if(!last && options.lead === false){
                  last = now;
                }
                remaining = wait - (now - last);
                
                // 如果已经超过阀值, 执行目标函数
                if (remaining <= 0) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                    last = now;
                    result = func.apply(thisArg, args);
                }
                // 如果未达到阀值, 则必须等待
                // 如果设置tail = false, 那么必须间隔时间必须超过阀值才会被触发
                else if(!timeoutId && options.tail !== false) {
                    timeoutId = setTimeout(later, remaining);
                }
                return result;
            };
        },

        /**
         *  
         *  在global环境下执行脚本
         * 
         *  @param {Function} expression   脚本表达式
         * 
         */
        globalEval: function(expression){
            // 环境测试是否支持间接执行
            var isIndirectEvalGlobal = (function(original, Object) {
                try {
                  return (1,eval)('Object') === original;
                }
                catch(err) {
                  return false;
                }
              })(Object, 123);

              // 如果支持间接eval操作则使用, 否则使用execScript函数
              if (isIndirectEvalGlobal) {

                    return function(expression) {
                        return (1,eval)(expression);
                    };

              }else if (typeof window.execScript !== 'undefined') {
                    return function(expression) {
                        return window.execScript(expression);
                    };
              }

        },

        // 迫使目标函数至多被执行一次
        // 目标函数的执行结果将会被缓存
        once: function(func) {
          var ran = false, memo;
          return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
          };
        },

        // 无操作
        NOOP: function(){},

        /**
         *  
         *  生成随机数
         * 
         *  @param min   最小值
         *  @param max   最大值
         * 
         */
        random: function(min, max){
          // 如果只提供第一个参数, 那么该参数表示最大值, 此时最小值为0
          if (max == null) {
            max = min;
            min = 0;
          }
          return min + Math.floor(Math.random() * (max - min + 1));
        }
    });
    
})(Z);

/* 2013-07-31 修改*/
// 添加NOOP函数
;(function(S, undefined) {
    var StringProto = String.prototype,
    
        nativeTrim = StringProto.trim,
        nativeTrimRight = StringProto.trimRight,
        nativeTrimLeft = StringProto.trimLeft,
        
        // JSON字符串正则表达式
        rvalidchars = /^[\],:{}\s]*$/,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
        
        rhtml = /^(?:[^<]*<[\w\W]+>[^>]*$)/,
        rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi,
        escapeChars = {
            lt: '<',
            gt: '>',
            quot: '"',
            apos: "'",
            amp: '&'
        },
        reversedEscapeChars = {},
        fcamelCase,
        strRepeat
    ;
    
    for(var key in escapeChars){
        reversedEscapeChars[escapeChars[key]] = key;
    }
    

    fcamelCase = function(all, letter) {
        return letter.toUpperCase();
    };
    
    
    strRepeat = function(str, times){
        var result = '';
        if (times < 1){
            return result;
        }
        while (times > 0) {
          if (times & 1){
              result += str;
          }
          times >>= 1,
          str += str;
        }
        return result;
    };
    
    S.mix(S, {
        
        /**
         *  获取字符串字符长度
         *  @param {String}  str
         *  @return {Number}  字节数量  
         */
        getLenght : function(str) {
            return str.length;
        },
        
        /**
         *  获取字符串字节长度
         *  @param {String}  str
         *  @return {Number}  字节数量  
         */
        getByteLenght : function(str) {
            return str.replace(/[^\x00-\xff]/gi, '**').length;
        },
        
        /**
         *  判断目标字符串是否为空
         *  
         *  @param {String}   str   目标字符串
         *  @return {Booleab}        是否为空字符串  
         * 
         */
        isBlank : function(str){
            if(str == null){
                str = '';
            }
            return (/^\s*$/g).test(str);
        },
        
        /**
         *
         *  字符串转换为字符数组
         *  @param {String} str
         *  @return {Array}
         *
         */
        chars: function(str) {
            if (str == null){
                return [];
            }
            return String(str).split('');
        },

        
        /**
         *
         *  去字符串两端空白
         *  @param {String} str
         *  @param {String|Regex TODO} characters
         *  @return {String}
         *
         */
        trim : function(str/*, characters*/){
            // TODO{zhangF} 自定义字符
            return nativeTrim ? nativeTrim.call(str) :
                (function(){
                    return str.replace(/^\s+|\s+$/g, '');
                }());
        },
        /**
         *
         *  去字符串左端空白
         *  @param {String} str
         *  @param {String|Regex TODO} characters
         *  @return {String}
         *
         */
        ltrim : function(str/*, characters*/){
            // TODO{zhangF} 自定义字符
            return nativeTrim ? nativeTrimLeft.call(str) :
                (function(){
                    return str.replace(/^\s+$/, '');
                }());
        },
        /**
         *
         *  去字符串右端空白
         *  @param {String} str
         *  @param {String|Regex TODO} characters
         *  @return {String}
         *
         */
        rtrim : function(str/*, characters*/){
            // TODO{zhangF} 自定义字符
            return nativeTrim ? nativeTrimRight.call(str) :
                (function(){
                    return str.replace(/^\s+/, '');
                }());
        },
        
        /**
         *
         *  返回行字符数组
         *  @param {String} str
         *  @param {String|Regex TODO} characters
         *  @return {String}
         *
         */
        lines : function(str){
            if (str == null) return [];
            return str.split("\n");
        },
        /**
         *
         *  判断字符串是否已另一个字符串开头
         *
         *  @param {String} str
         *  @param {String} suffix
         *  @return {Boolean}
         *
         */
        startsWith : function(str, prefix){
            return str.lastIndexOf(prefix , 0) === 0;
        },
        /**
         *
         *  判断字符串是否已另一个字符串结尾
         *
         *  @param {String} str
         *  @param {String} suffix
         *  @return {Boolean}
         *
         */
        endsWith : function(str, suffix){
            var idx  = str.length - suffix.length;
            return idx >= 0 && str.indexOf(suffix, idx) === idx;
            
            /*
                var idx = str.lastIndexOf(suffix)
                    fullLength = str.length,
                    suffixLength = suffix.length
                ;
                
                return idx > 0 && (idx + suffixLength === fullLength);
            */
        },
        /**
         *
         *  首字母转为大写
         *
         *  @param {String} string
         *  @return {String}
         *
         */
        camelCase : function(string){
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },
        
        /**
         *
         * 首字母大写  
         * @param {String} str
         */
        upFirst : function(str){
            str += '';
            return str.charAt(0).toUpperCase() + str.substring(1);
        },
        
        /**
         *   
         * 字符串转义成有效的浏览器可识别的URL字符串
         * 
         * @param  {String}  str       目标字符串         
         * @param  {Boolean} isParam   是否作为URL参数
         * 
         * @return {String}  转义字符串
         * 
         * @example
         *    escapeURL('http://foo.com/"bar"')       -> http://foo.com/%22bar%22
         *    escapeURL('http://foo.com/"bar"', true) -> http%3A%2F%2Ffoo.com%2F%22bar%22
         */
        escapeURL : function(str, isParam){
            return isParam ? encodeURIComponent(str) : encodeURI(str);
        },
        
        /**
         *   
         * 将转义后的URL字符串还原成可识别字符串
         * 
         * @param  {String}  str       目标字符串         
         * @param  {Boolean} isPart    是否只还原URL中的params部分
         * 
         * @return {String}  还原转义字符串
         * 
         */
        unescapeURL : function(str, isPart){
            return isPart ? decodeURI(str) : decodeURIComponent(str);
        },
        
        
        /**
         *   
         * 字符串转义成HTML解析器可识别的字符串
         * 
         * @param  {String}  str       目标字符串         
         * 
         * @return {String}  转义字符串
         * 
         */
        escapeHTML : function(str){
            return str.replace(/[&<>"']/g, function(m){ return '&' + reversedEscapeChars[m] + ';'; });
        },
        
        
        /**
         *   
         * 字符串转义成HTML解析器可识别的字符串
         * 
         * @param  {String}  str       目标字符串         
         * 
         * @return {String}  还原转义字符串
         * 
         */
        unescapeHTML : function(str){
            if (str == null){
                return '';
            }
            return str.replace(/\&([^;]+);/g, function(entity, entityCode){
                var match;
                if (entityCode in escapeChars) {
                    return escapeChars[entityCode];
                } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)){
                    return String.fromCharCode(parseInt(match[1], 16));
                } else if (match = entityCode.match(/^#(\d+)$/)){
                    return String.fromCharCode(~~match[1]);
                } else {
                    return entity;
                }
            });
        },
        
        escapeRegExp : function(str){
            if (str == null){
                return '';
            }
            return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
        },
        
        /**
         *   
         * 类似数组的splice函数,截取/插入
         * 
         * @param  {String}  str       目标字符串         
         * @param  {String}  i         起始位置  
         * @param  {String}  howmany   截取数量
         * @param  {String}  substr    插入字符串    
         * 
         * @return {String}  截取/插入后返回结果
         * 
         */
        splice : function(str, i, howmany, substr) {
            var arr = S.chars(str);
            arr.splice(~~i, ~~howmany, substr);
            return arr.join('');
        },
        
        
        /**
         *   
         * 截短字符串,并将多出的部分用特定的符号表示
         * 
         * @param  {String}  str            目标字符串         
         * @param  {Number}  length         最大显示长度
         * @param  {String}  truncateStr    替换字符{默认为省略号}
         * 
         * @return {String}  截短后的字符串
         * 
         */
        truncate : function(str, length, truncateStr){
            str = String(str);
            truncateStr = truncateStr || '...';
            length = ~~length;
            return str.length > length ? str.slice(0, length) + truncateStr : str;
        },
        
        /**
         *   
         * 重复字符串,并且进行连接
         * 
         * @param  {String}  str            目标字符串         
         * @param  {Number}  times          重复次数
         * @param  {String}  separator      连接符
         * 
         * @return {String} 
         * 
         */
        repeat : function(str, times, separator){
            if(str == null){
                return '';
            }

            times = ~~times;
            
            // 无连接符,那么使用内置repeat函数来提升性能
            if(separator == null){
                return strRepeat(str, times);
            }
            for (var repeat = []; times > 0; repeat[--times] = str) {}
            return repeat.join(separator);
        },
        
        /**
         *   
         * 简易判断字符串是否是HTML结构
         * 
         * @param  {String}  text     目标字符串         
         * 
         * @return {Boolean} 
         * 
         */
        isHtml: function(text) {
            return typeof text != 'string' || (text.charAt(0) === "<" && text.charAt( text.length - 1 ) === ">" && text.length >= 3) || rhtml.exec(text);
        },

        /**
         *   
         * 获得文件路径的后缀名
         * 
         * @param  {String}  str   目标文件路径           
         * 
         * @return {String} 
         * 
         */
        extname: function(str){
            if(str == null){
                return '';
            }
            var i = str.indexOf('?');
            str = str.substring(0, ~i ? i : str.length);
            return str.substring(str.lastIndexOf('.') + 1);
        }
    });
    
    S.mix(S , {
        /**
         * Javascript Template(不支持逻辑关系)
         * John Resig's implementation
         * URL:http://ejohn.org/blog/javascript-micro-templating/
         * 
         * 如果想要使用logicless templating,可以选择使用HandleBars.js
         */
        template : (function(){
            var templateSettings = {
                    evaluate : /<@([\s\S]+?)@>/g,
                    interpolate : /<@=([\s\S]+?)@>/g
                },
                noMatch = /.^/,
                escapes = {
                    '\\' : '\\',
                    "'" : "'",
                    'r' : '\r',
                    'n' : '\n',
                    't' : '\t',
                    'u2028' : '\u2028',
                    'u2029' : '\u2029'
                }
            ;
            for(var p in escapes){
                escapes[escapes[p]] = p;
            }
            var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
            var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;
            var unescape = function(code) {
                return code.replace(unescaper, function(match, escape) {
                    return escapes[escape];
                });
            };
            return function(str, data , formatOpt) {
                var settings = templateSettings;
                
                settings = $.extend( {} ,settings , formatOpt);
                
                var source = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' + 'with(obj||{}){__p.push(\'' + str.replace(escaper, function(match) {
                    return '\\' + escapes[match];
                }).replace(settings.interpolate || noMatch, function(match, code) {
                    return "',\n" + unescape(code) + ",\n'";
                }).replace(settings.evaluate || noMatch, function(match, code) {
                    return "');\n" + unescape(code) + "\n;__p.push('";
                }) + "');\n}\nreturn __p.join('').replace('&lt;','<');";
                var render = new Function('obj', source);
                if(data){
                    return render(data);
                }
                var template = function(data) {
                    return render.call(this, data);
                };
                template.source = 'function(obj){\n' + source + '\n}';
                return template;
            };
        })()
    });
})(Z);

/* 2013-09-17 修改*/
// 删除S.parseJSON函数, 使用S.JSON.parse替换
;(function(S){
    
    var CLASS_TYPES= {}
        ,TRUE= true
        ,FALSE= false
        ,objectProto= Object.prototype
        ,objectProtoTostring = objectProto.toString
        ,hasOwn = objectProto.hasOwnProperty
        ,rbrace = /^(?:\{.*\}|\[.*\])$/
    ;
    S.mix(S , {
        type : function(obj){
            if ( obj == null ) {
                return String( obj );
            }
            return typeof obj === "object" || typeof obj === "function" ?
                CLASS_TYPES[ objectProtoTostring.call(obj) ] || "object" :
                typeof obj;
        },
        /*
        isObject: function(obj){},
        isFunction: function(obj){},
        isDate: function(obj){},
        isError: function(obj){},
        isString: function(obj){},
        isArray: function(obj){},
        isBoolean: function(obj){},
        isNumber: function(obj){},
        isArguments: function(obj){},
        */
        isNull: function(obj){
            return obj === null;
        },
        isUndefined: function(obj){
            return typeof obj === "undefined";
        },
        isWindow: function(obj){
            return obj != null && obj == obj.window;
        },
        isEmpty: function(obj){
            for(var p in obj){
                return FALSE
            }
            return TRUE
        },
        isPlainObject: function(obj){
            var key;
            // - window / Element
            if ( S.type( obj ) !== "object" || obj.nodeType || S.isWindow( obj ) ) {
                return FALSE;
            }
    
            // Support: Firefox >16
            // The try/catch supresses exceptions thrown when attempting to access
            // the "constructor" property of certain host objects, ie. |window.location|
            try {
                if ( obj.constructor &&
                        !hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
                    return FALSE;
                }
            } catch ( e ) {
                return FALSE;
            }
    
            // If the function hasn't returned already, we're confident that
            // |obj| is a plain object, created by {} or constructed with new Object
            
            
            for(key in obj){}
            
            return key === undefined  || hasOwn.call(obj , key);
        },
        
        /**
         *   
         * 字符串转为其他类型格式数据
         * 
         * @param  {String}  data     待转换字符串        
         * 
         * @return {Other}           
         * 
         */
        convert: function(data){
            if ( typeof data === "string" ) {
                try {
                    data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null :
                    S.isNumber( data ) ? parseFloat( data ) :
                        rbrace.test( data ) ? S.parseJSON( data ) :
                        data;
                } catch( e ) {}
    
            } else if( typeof data !== "number" ) {
S.debug('数据类型:' + (typeof data));
                data = undefined;
            }
            return data;
        }
    });
    
    
    
    S.each("String Boolean Array Error Date Function Number Arguments Object RegExp".split(" ") , function(name){
        var typeName;
        CLASS_TYPES["[object " + name + "]"] = (typeName = name.toLowerCase());
        S["is"+name] = function(obj){
            // return typeof obj === typeName;
            return S.type(obj) === typeName;
        }
    });
    
})(Z);
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
})(Z);
;
(function(S, undefined) {

  var stack = [],
    // Parse a key=val string.
    // These can get pretty hairy
    // example flow:
    // parse(foo[bar][][bla]=baz)
    // return parse(foo[bar][][bla],"baz")
    // return parse(foo[bar][], {bla : "baz"})
    // return parse(foo[bar], [{bla:"baz"}])
    // return parse(foo, {bar:[{bla:"baz"}]})
    // return {foo:{bar:[{bla:"baz"}]}}
    pieceParser = function(eq) {
      return function parsePiece(key, val) {

        var sliced, numVal, head, tail, ret;

        if (arguments.length !== 2) {
          // key=val, called from the map/reduce
          key = key.split(eq);
          return parsePiece(
            unescape(key.shift()),
            unescape(key.join(eq))
          );
        }
        key = key.replace(/^\s+|\s+$/g, '');
        if (S.isString(val)) {
          val = val.replace(/^\s+|\s+$/g, '');
          // convert numerals to numbers
          if (!isNaN(val)) {
            numVal = +val;
            if (val === numVal.toString(10)) {
              val = numVal;
            }
          }
        }
        sliced = /(.*)\[([^\]]*)\]$/.exec(key);
        if (!sliced) {
          ret = {};
          if (key) {
            ret[key] = val;
          }
          return ret;
        }
        // ["foo[][bar][][baz]", "foo[][bar][]", "baz"]
        tail = sliced[2];
        head = sliced[1];

        // array: key[]=val
        if (!tail) {
          return parsePiece(head, [val]);
        }

        // obj: key[subkey]=val
        ret = {};
        ret[tail] = val;
        return parsePiece(head, ret);
      };
    },

    // the reducer function that merges each query piece together into one set of params
    mergeParams = function(params, addition) {
      return (
        // if it's uncontested, then just return the addition.
        (!params) ? addition
        // if the existing value is an array, then concat it.
        : (S.isArray(params)) ? params.concat(addition)
        // if the existing value is not an array, and either are not objects, arrayify it.
        : (!S.isObject(params) || !S.isObject(addition)) ? [params].concat(addition)
        // else merge them as objects, which is a little more complex
        : mergeObjects(params, addition)
      );
    },

    // Merge two *objects* together. If this is called, we've already ruled
    // out the simple cases, and need to do the for-in business.
    mergeObjects = function(params, addition) {
      for (var i in addition) {
        if (i && addition.hasOwnProperty(i)) {
          params[i] = mergeParams(params[i], addition[i]);
        }
      }
      return params;
    },

    // replace "+" with " ", and then decodeURIComponent behavior.
    // decode
    unescape = function(str) {
      return decodeURIComponent(str.replace(/\+/g, ' '));
    },

    escape = function(str) {
      return encodeURIComponent(str);
    };

  var qs = S.namespace('qs');

  S.mix(qs, {
    /**
     *
     * 查询字符串解析
     *
     * @param  {String}  str       查询字符串
     * @param  {String}  sep       分隔符
     * @param  {String}  eq        连接符
     *
     * @return {Object}  解析对象
     *
     */
    parse: function(str, sep, eq) {
      var obj = {};
      S.reduce(

        S.map(
          str.split(sep || "&"),
          pieceParser(eq || "=")
        ), mergeParams, obj
      );

      return obj;
    },

    /**
     *
     * 对象序列化成查询字符串
     *
     * @param  {String}  obj       目标对象
     * @param  {String}  c         序列化选项
     *    sep                      分隔符
     *    eq                       连接符
     *    arrayKey                 数组表示
     * @param  {String}  name      序列化参数名
     *
     * @return {String}  序列化字符串
     *
     */
    stringify: function(obj, c, name) {
      var sep = c && c.sep ? c.sep : '&',
        eq = c && c.eq ? c.eq : '=',
        aK = c && c.arrayKey ? c.arrayKey : false,
        begin,
        end,
        i,
        l,
        n,
        s;

      if (S.isNull(obj) || S.isUndefined(obj) || S.isFunction(obj)) {
        return name ? escape(name) + eq : '';
      }

      if (S.isBoolean(obj)) {
        obj = +obj;
      }

      if (S.isNumber(obj) || S.isString(obj)) {
        return escape(name) + eq + escape(obj);
      }

      if (S.isArray(obj)) {
        s = [];
        name = aK ? name + '[]' : name;
        l = obj.length;
        for (i = 0; i < l; i++) {
          s.push(qs.stringify(obj[i], c, name));
        }

        return s.join(sep);
      }
      // now we know it's an object.
      // Y.log(
      //     typeof obj + (typeof obj === 'object' ? " ok" : "ONOES!")+
      //     Object.prototype.toString.call(obj)
      // );

      // Check for cyclical references in nested objects
      for (i = stack.length - 1; i >= 0; --i) {
        if (stack[i] === obj) {
          throw new Error("qs.stringify. Cyclical reference");
        }
      }

      stack.push(obj);
      s = [];
      begin = name ? name + '[' : '';
      end = name ? ']' : '';
      for (i in obj) {
        if (obj.hasOwnProperty(i)) {
          n = begin + i + end;
          s.push(qs.stringify(obj[i], c, n));
        }
      }

      stack.pop();
      s = s.join(sep);
      if (!s && name) {
        return name + "=";
      }

      return s;
    }
  });

})(Z);


/**
 *  @desc: 浏览器UserAgent解析
 * 
 *  @API:
 *      ^zjp.UA对象
 * 
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-16
 */
;(function(S ,undefined){
    S.ENV.parseUA = function(subUA) {
    
        var numberify = function(s) {
            var c = 0;
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 1) ? '' : '.';
            }));
        },
    
        win = S.ENV.host,

        nav = win && win.navigator,

        o = {

            /**
             * Internet Explorer version number or 0.  Example: 6
             * @property ie
             * @type float
             * @static
             */
            ie: 0,

            /**
             * Opera version number or 0.  Example: 9.2
             * @property opera
             * @type float
             * @static
             */
            opera: 0,

            /**
             * Gecko engine revision number.  Will evaluate to 1 if Gecko
             * is detected but the revision could not be found. Other browsers
             * will be 0.  Example: 1.8
             * <pre>
             * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
             * Firefox 1.5.0.9: 1.8.0.9 <-- 1.8
             * Firefox 2.0.0.3: 1.8.1.3 <-- 1.81
             * Firefox 3.0   <-- 1.9
             * Firefox 3.5   <-- 1.91
             * </pre>
             * @property gecko
             * @type float
             * @static
             */
            gecko: 0,

            /**
             * AppleWebKit version.  KHTML browsers that are not WebKit browsers
             * will evaluate to 1, other browsers 0.  Example: 418.9
             * <pre>
             * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the
             *                                   latest available for Mac OSX 10.3.
             * Safari 2.0.2:         416     <-- hasOwnProperty introduced
             * Safari 2.0.4:         418     <-- preventDefault fixed
             * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
             *                                   different versions of webkit
             * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
             *                                   updated, but not updated
             *                                   to the latest patch.
             * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native
             * SVG and many major issues fixed).
             * Safari 3.0.4 (523.12) 523.12  <-- First Tiger release - automatic
             * update from 2.x via the 10.4.11 OS patch.
             * Webkit nightly 1/2008:525+    <-- Supports DOMContentLoaded event.
             *                                   yahoo.com user agent hack removed.
             * </pre>
             * http://en.wikipedia.org/wiki/Safari_version_history
             * @property webkit
             * @type float
             * @static
             */
            webkit: 0,

            /**
             * Safari will be detected as webkit, but this property will also
             * be populated with the Safari version number
             * @property safari
             * @type float
             * @static
             */
            safari: 0,

            /**
             * Chrome will be detected as webkit, but this property will also
             * be populated with the Chrome version number
             * @property chrome
             * @type float
             * @static
             */
            chrome: 0,

            /**
             * The mobile property will be set to a string containing any relevant
             * user agent information when a modern mobile browser is detected.
             * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
             * devices with the WebKit-based browser, and Opera Mini.
             * @property mobile
             * @type string
             * @default null
             * @static
             */
            mobile: null,

            /**
             * Adobe AIR version number or 0.  Only populated if webkit is detected.
             * Example: 1.0
             * @property air
             * @type float
             */
            air: 0,
            /**
             * PhantomJS version number or 0.  Only populated if webkit is detected.
             * Example: 1.0
             * @property phantomjs
             * @type float
             */
            phantomjs: 0,
            /**
             * Detects Apple iPad's OS version
             * @property ipad
             * @type float
             * @static
             */
            ipad: 0,
            /**
             * Detects Apple iPhone's OS version
             * @property iphone
             * @type float
             * @static
             */
            iphone: 0,
            /**
             * Detects Apples iPod's OS version
             * @property ipod
             * @type float
             * @static
             */
            ipod: 0,
            /**
             * General truthy check for iPad, iPhone or iPod
             * @property ios
             * @type Boolean
             * @default null
             * @static
             */
            ios: null,
            /**
             * Detects Googles Android OS version
             * @property android
             * @type float
             * @static
             */
            android: 0,
            /**
             * Detects Kindle Silk
             * @property silk
             * @type float
             * @static
             */
            silk: 0,
            /**
             * Detects Kindle Silk Acceleration
             * @property accel
             * @type Boolean
             * @static
             */
            accel: false,
            /**
             * Detects Palms WebOS version
             * @property webos
             * @type float
             * @static
             */
            webos: 0,

            /**
             * Google Caja version number or 0.
             * @property caja
             * @type float
             */
            caja: nav && nav.cajaVersion,

            /**
             * Set to true if the page appears to be in SSL
             * @property secure
             * @type boolean
             * @static
             */
            secure: false,

            /**
             * The operating system.  Currently only detecting windows or macintosh
             * @property os
             * @type string
             * @default null
             * @static
             */
            os: null,

            /**
             * The Nodejs Version
             * @property nodejs
             * @type float
             * @default 0
             * @static
             */
            nodejs: 0,
            /**
            * Window8/IE10 Application host environment
            * @property winjs
            * @type Boolean
            * @static
            */
            winjs: !!((typeof Windows !== "undefined") && Windows.System),
            /**
            * Are touch/msPointer events available on this device
            * @property touchEnabled
            * @type Boolean
            * @static
            */
            touchEnabled: false
        },
    
        ua = subUA || nav && nav.userAgent,
    
        loc = win && win.location,
    
        href = loc && loc.href,
    
        m;
    
        /**
        * The User Agent string that was parsed
        * @property userAgent
        * @type String
        * @static
        */
        o.userAgent = ua;
    
    
        o.secure = href && (href.toLowerCase().indexOf('https') === 0);
    
        if (ua) {
    
            if ((/windows|win32/i).test(ua)) {
                o.os = 'windows';
            } else if ((/macintosh|mac_powerpc/i).test(ua)) {
                o.os = 'macintosh';
            } else if ((/android/i).test(ua)) {
                o.os = 'android';
            } else if ((/symbos/i).test(ua)) {
                o.os = 'symbos';
            } else if ((/linux/i).test(ua)) {
                o.os = 'linux';
            } else if ((/rhino/i).test(ua)) {
                o.os = 'rhino';
            }
    
            // Modern KHTML browsers should qualify as Safari X-Grade
            if ((/KHTML/).test(ua)) {
                o.webkit = 1;
            }
            if ((/IEMobile|XBLWP7/).test(ua)) {
                o.mobile = 'windows';
            }
            if ((/Fennec/).test(ua)) {
                o.mobile = 'gecko';
            }
            // Modern WebKit browsers are at least X-Grade
            m = ua.match(/AppleWebKit\/([^\s]*)/);
            if (m && m[1]) {
                o.webkit = numberify(m[1]);
                o.safari = o.webkit;
    
                if (/PhantomJS/.test(ua)) {
                    m = ua.match(/PhantomJS\/([^\s]*)/);
                    if (m && m[1]) {
                        o.phantomjs = numberify(m[1]);
                    }
                }
    
                // Mobile browser check
                if (/ Mobile\//.test(ua) || (/iPad|iPod|iPhone/).test(ua)) {
                    o.mobile = 'Apple'; // iPhone or iPod Touch
    
                    m = ua.match(/OS ([^\s]*)/);
                    if (m && m[1]) {
                        m = numberify(m[1].replace('_', '.'));
                    }
                    o.ios = m;
                    o.os = 'ios';
                    o.ipad = o.ipod = o.iphone = 0;
    
                    m = ua.match(/iPad|iPod|iPhone/);
                    if (m && m[0]) {
                        o[m[0].toLowerCase()] = o.ios;
                    }
                } else {
                    m = ua.match(/NokiaN[^\/]*|webOS\/\d\.\d/);
                    if (m) {
                        // Nokia N-series, webOS, ex: NokiaN95
                        o.mobile = m[0];
                    }
                    if (/webOS/.test(ua)) {
                        o.mobile = 'WebOS';
                        m = ua.match(/webOS\/([^\s]*);/);
                        if (m && m[1]) {
                            o.webos = numberify(m[1]);
                        }
                    }
                    if (/ Android/.test(ua)) {
                        if (/Mobile/.test(ua)) {
                            o.mobile = 'Android';
                        }
                        m = ua.match(/Android ([^\s]*);/);
                        if (m && m[1]) {
                            o.android = numberify(m[1]);
                        }
    
                    }
                    if (/Silk/.test(ua)) {
                        m = ua.match(/Silk\/([^\s]*)\)/);
                        if (m && m[1]) {
                            o.silk = numberify(m[1]);
                        }
                        if (!o.android) {
                            o.android = 2.34; //Hack for desktop mode in Kindle
                            o.os = 'Android';
                        }
                        if (/Accelerated=true/.test(ua)) {
                            o.accel = true;
                        }
                    }
                }
    
                m = ua.match(/(Chrome|CrMo|CriOS)\/([^\s]*)/);
                if (m && m[1] && m[2]) {
                    o.chrome = numberify(m[2]); // Chrome
                    o.safari = 0; //Reset safari back to 0
                    if (m[1] === 'CrMo') {
                        o.mobile = 'chrome';
                    }
                } else {
                    m = ua.match(/AdobeAIR\/([^\s]*)/);
                    if (m) {
                        o.air = m[0]; // Adobe AIR 1.0 or better
                    }
                }
            }
    
            if (!o.webkit) { // not webkit
                // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
                if (/Opera/.test(ua)) {
                    m = ua.match(/Opera[\s\/]([^\s]*)/);
                    if (m && m[1]) {
                        o.opera = numberify(m[1]);
                    }
                    m = ua.match(/Version\/([^\s]*)/);
                    if (m && m[1]) {
                        o.opera = numberify(m[1]); // opera 10+
                    }
    
                    if (/Opera Mobi/.test(ua)) {
                        o.mobile = 'opera';
                        m = ua.replace('Opera Mobi', '').match(/Opera ([^\s]*)/);
                        if (m && m[1]) {
                            o.opera = numberify(m[1]);
                        }
                    }
                    m = ua.match(/Opera Mini[^;]*/);
    
                    if (m) {
                        o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                    }
                } else { // not opera or webkit
                    m = ua.match(/MSIE\s([^;]*)/);
                    if (m && m[1]) {
                        o.ie = numberify(m[1]);
                    } else { // not opera, webkit, or ie
                        m = ua.match(/Gecko\/([^\s]*)/);
                        if (m) {
                            o.gecko = 1; // Gecko detected, look for revision
                            m = ua.match(/rv:([^\s\)]*)/);
                            if (m && m[1]) {
                                o.gecko = numberify(m[1]);
                            }
                        }
                    }
                }
            }
        }
    
        //Check for known properties to tell if touch events are enabled on this device or if
        //the number of MSPointer touchpoints on this device is greater than 0.
        if (win && nav && !(o.chrome && o.chrome < 6)) {
            o.touchEnabled = (("ontouchstart" in win) || (("msMaxTouchPoints" in nav) && (nav.msMaxTouchPoints > 0)));
        }
    
        //It was a parsed UA, do not assign the global value.
        if (!subUA) {
    
            // node 环境下
            if (typeof process === 'object') {
    
                if (process.versions && process.versions.node) {
                    //NodeJS
                    o.os = process.platform;
                    o.nodejs = numberify(process.versions.node);
                }
            }
    
            S.UA = o;
    
        }
    
        return o;
    };
    
    
    
    S.UA = S.ENV.parseUA();
    
    /**
    Performs a simple comparison between two version numbers, accounting for
    standard versioning logic such as the fact that "535.8" is a lower version than
    "535.24", even though a simple numerical comparison would indicate that it's
    greater. Also accounts for cases such as "1.1" vs. "1.1.0", which are
    considered equivalent.
    
    Returns -1 if version _a_ is lower than version _b_, 0 if they're equivalent,
    1 if _a_ is higher than _b_.
    
    Versions may be numbers or strings containing numbers and dots. For example,
    both `535` and `"535.8.10"` are acceptable. A version string containing
    non-numeric characters, like `"535.8.beta"`, may produce unexpected results.
    
    @method compareVersions
    @param {Number|String} a First version number to compare.
    @param {Number|String} b Second version number to compare.
    @return -1 if _a_ is lower than _b_, 0 if they're equivalent, 1 if _a_ is
        higher than _b_.
    **/
    S.UA.compareVersions = function (a, b) {
        var aPart, aParts, bPart, bParts, i, len;
    
        if (a === b) {
            return 0;
        }
    
        aParts = (a + '').split('.');
        bParts = (b + '').split('.');
    
        for (i = 0, len = Math.max(aParts.length, bParts.length); i < len; ++i) {
            aPart = parseInt(aParts[i], 10);
            bPart = parseInt(bParts[i], 10);
    
            isNaN(aPart) && (aPart = 0);
            isNaN(bPart) && (bPart = 0);
    
            if (aPart < bPart) {
                return -1;
            }
    
            if (aPart > bPart) {
                return 1;
            }
        }
    
        return 0;
    };
})(Z);

    return Z;
}));


