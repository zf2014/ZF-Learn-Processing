/**
 *  @desc:  
 * 
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-15
 */
;(function(name, definition){
  if(typeof define == 'function'){
      define(name, definition);
  }else{
    this[name] = definition();
  }
}('zjport', function(){
    var EMPTY = '',
        global = typeof global === 'undefined'? this : global,
        guid = 0,
        prevObj = global.zjport || {}
    ;
    return {
        ENV: {
            host : global
        },
        CONFIG: {
            debug : <%= BEBUG %>
        },

        VERSION: "<%= JSVERSION %>",

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
}));


