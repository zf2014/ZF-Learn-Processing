/**
 *  CommonJS Promise实现
 *  
 *  构造函数Defer
 * 
 *  用例:
 *  var defer = new S.Defer();
 * 
 *  defer.then(successcallback1 , errorcallback1).then(successcallback2 , errorcallback2)
 * 
 *  defer.resolve(value) =>当异步任务执行成功时,触发该函数
 *  defer.reject(value) =>当异步任务执行失败时,触发该函数
 * 
 *  成功:
 *  ->successcallback1(value) ->successcallback2(value)
 * 
 *  失败:
 *  ->errorcallback1(value) ->errorcallback2(value)
 * 
 *  author: qzzf1987@gmail.com
 * 
 */
;(function(S, undefined){
    var PROMISE_VALUE = "__promise_value"
        ,PROMISE_REJECT = "__promise_reject"
        ,TRUE = true
    ;
    var doPromiseWhen = function(promise , fin , fail){
        
        if(promise[PROMISE_REJECT]){
            if(fail){
                fail(promise[PROMISE_VALUE])
            }
            return ;
        }
        if(promise.pqueue){
            promise.pqueue.push([fin , fail]);
            return;
        }
        if(fin){
            fin(promise[PROMISE_VALUE])
        }
    }
    
    var Promise = function(){
        this.pqueue = [];
    }
    
    Promise.prototype = {
        constructor : Promise
        
        ,then : function(fincallback , failcallback){
            doPromiseWhen(this , fincallback , failcallback);
            return this;
        }
        ,fin : function(fincallback){
            doPromiseWhen(this , fincallback , 0);
            return this;
        }
        ,fail : function(failcallback){
            doPromiseWhen(this , 0 , failcallback);
            return this;
        },
        when : function(value , fin , fail){
            var defer = new Defer()
                ,promise = defer.promise
            ;
            promise.then(fin , fail);
            
            if(value instanceof Promise){
                doPromiseWhen(value , function(val){
                    defer.resolve(val); 
                } , function(){
                    //失败原因
                })
            }else{
               defer.resolve(value);
            }
            
            return promise;
        }
    }

    var Defer = function(){
        this.promise = new Promise();
    }
    
    Defer.prototype = {
        constructor : Defer
        
        ,resolve : function(value , isReject){
            
            var promise = this.promise
                ,pqueue = [].concat(promise.pqueue)
                ,len = pqueue.length
                ,i = 0
            ;
            promise[PROMISE_VALUE] = value
            promise[PROMISE_REJECT] = !!isReject 
            promise.pqueue = null;
            for(;i<len;i++){
                doPromiseWhen(promise , pqueue[i][0] , pqueue[i][1]);
            }
            return this;
        }
        ,reject : function(value){
            this.resolve(value , true);
            return this;
        }
    }
    S.Defer = Defer;
})(window.zjport);
















