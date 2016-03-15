/**
 *  
 *  @desc: Cookie操作
 *  
 *  @API:
 *      zjport.Cookie                   --命名空间
 *      zjport.Cookie.cookie            --设置/获取cookie
 *      zjport.Cookie.set               --设置cookie
 *      zjport.Cookie.get               --获取cookie
 *      zjport.Cookie.remove            --删除cookie
 * 
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-24
 */
;(function(S, undefined) {
    var win = S.ENV.host,
        document = win["document"],
        encode = encodeURIComponent,
        decode = decodeURIComponent
    ;

    
    S.Cookie = {
        /**
         * 根据传入参数的数量来确定是设置还是获取Cookie
         * @param {String} name         Cookie键
         * @param {String} value        Cookie值
         * @param {Object} options      Cookie可选参数
         *   path
         *   domain
         *   expires
         *   secure
         * 
         * @return {void | String} 
         */
        cookie: function(name, value, options) {
            switch (arguments.length) {
                case 3:
                case 2:
                    return set(name, value, options);
                case 1:
                    return get(name);
                default:
                    return all();
            }
        },
        
        /**
         * 设置Cookie
         * @param {String} name         Cookie键
         * @param {String} value        Cookie值
         * @param {Object} options      Cookie可选参数
         *   path
         *   domain
         *   expires
         *   secure
         * 
         * @return {Void} 
         */
        set: function(name, value, options) {
            set(name, value, options);
        },
        
        /**
         * 获取Cookie值
         * @param {String} name         Cookie键
         * 
         * @return {String} 
         */
        get: function(name) {
            return get(name);
        },
        
        /**
         * 删除Cookie
         * @param {String} name         Cookie键
         * 
         * @return {void} 
         */
        remove: function(name) {
            set(name, null);
        }
    };
    /**
     * 设置cookie.
     *
     * @param {String} name
     * @param {String} value
     * @param {Object} options
     * @api private
     */
    function set(name, value, options) {
        options = options || {};
        var str = encode(name) + '=' + encode(value);

        if (null == value)
            options.maxage = -1;

        if (options.maxage) {
            options.expires = new Date(+new Date + options.maxage);
        }

        if (options.path)
            str += '; path=' + options.path;
        if (options.domain)
            str += '; domain=' + options.domain;
        if (options.expires)
            str += '; expires=' + options.expires.toUTCString();
        if (options.secure)
            str += '; secure';

        document.cookie = str;
    }

    /**
     * 获取所有cookie.
     *
     * @return {Object}
     * @api private
     */
    function all() {
        return parse(document.cookie);
    }

    /**
     * 根据cookie名称获取cookie值.
     *
     * @param {String} name
     * @return {String}
     * @api private
     */
    function get(name) {
        return all()[name];
    }

    /**
     * 解析cookie字符串.
     *
     * @param {String} str
     * @return {Object}
     * @api private
     */
    function parse(str) {
        var obj = {};
        var pairs = str.split(/ *; */);
        var pair;
        if ('' == pairs[0])
            return obj;
        for (var i = 0; i < pairs.length; ++i) {
            pair = pairs[i].split('=');
            obj[decode(pair[0])] = decode(pair[1]);
        }
        return obj;
    }
})(window.zjport);