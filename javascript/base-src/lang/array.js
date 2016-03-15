/**
 *  @desc: 数组操作函数
 *
 *  @API:
 *      ^each^some^every^map^reduce^sortedIndex^indexOf^filter^last^unique^find^pluck^zip^flatten
 *      ^inArray^values^toArray
 *      ^arrayMerge
 *      ^reject
 *      ^shuffle^sortBy
 *
 *  @author: qzzf1987@gmail.com
 *
 *  @create: 2013-04-01
 *
 *  @last: 2013-10-08
 *
 *  @modify(2013-04-16)
 *      添加arrayMerge方法
 *  @modify(2013-09-27)
 *      添加reject方法
 *  @modify(2013-10-08)
 *      添加shuffle|sortBy|size方法
 */
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
      return S.filter(array, function() {
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
})(window.zjport);