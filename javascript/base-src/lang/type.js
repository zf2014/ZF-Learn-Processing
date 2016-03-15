/**
 *  @desc: 对象类型判断
 * 
 *  @API:
 *      ^type^isObject^isFunction^isDate^isError^isString^isArray^isBoolean^isNumber^isDate^isArguments^isNull
 *      ^isUndefined^isWindow^isEmpty^isPlainObject
 *      ^convert
 * 
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-16
 */
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
    
})(window.zjport);