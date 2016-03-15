/**
 *  
 *  @desc: 字符串相关操作函数
 *  
 *  @API:
 *      ^getLenght^trim^ltrim^rtrim^lines^startsWith^endsWith^camelCase^upFirst^template
 *      ^getByteLenght^isBlank^chars^escapeURL^unescapeURL^escapeHTML^unescapeHTML^escapeRegExp^splice^truncate^repeat
 *      ^isHtml
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-12
 *
 */
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
})(window.zjport);

/* 2013-09-17 修改*/
// 删除S.parseJSON函数, 使用S.JSON.parse替换