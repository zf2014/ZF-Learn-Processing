/**
 *  @desc: Function操作函数
 * 
 *  @API:
 *      ^bind^memoize^compose^delay^defer^debounce^throttle^once^random
 *      ^globalEval
 *      ^NOOP
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-10-08
 *  
 *  @modify(2013-06-09)
 *     新增globalEval函数
 *  @modify(2013-10-08)
 *     新增random函数
 *  
 */
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
    
})(window.zjport);

/* 2013-07-31 修改*/
// 添加NOOP函数