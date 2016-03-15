/**
 *  变量定义区
 */ 
var AUTO_EVENT_NAMESPACE = '.zjp.event.autocomplete',
    AUTO_EVENT_PREFIX = 'autocomplete:',

    AUTO_CLASSNAME_PREFIX = 'autocomplete-',

    AUTO_WRAPPER_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'wrapper',
    AUTO_QUERY_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'inp',
    AUTO_HINT_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'hint-inp',
    AUTO_DD_MENU_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'menu',


    ua = S.UA,
    
    bindAll = function(obj){
      var val;
        for (var key in obj) {
          S.isFunction(val = obj[key]) && (obj[key] = S.bind(val, obj));
        }
    },
    getProtocol=function() {
        return location.protocol;
    },
    escapeRegExChars = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    },
    tokenizeQuery=function(str) {
      return S.trim(str).toLowerCase().split(/[\s]+/);
    },

    tokenizeText=function(str) {
      return S.trim(str).toLowerCase().split(/[\s\-_]+/);
    }
;