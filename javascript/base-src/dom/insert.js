;(function(undefined){
    var DOM = dom 
       ,win = DOM.getWin()
       ,doc = DOM.getDoc()
       ,head = doc.getElementsByTagName("head")[0]
       ,jscallbacks = {}
    ;
    /**
    *
    * 脚本执行适配器
    *   全局执行            (可执行脚本)
    *   动态加载执行  (提供的是脚本绝对地址)
    * 
    *   @param {string | object} el  目标脚本
    *     
    */
    function evalScript(el) {
        if (el.src) {
            DOM.loadScript(el.src);
        } else {
            var code = S.trim(el.text || el.textContent || el.innerHTML || '');
            if (code) {
                S.globalEval(code);
            }
        }
    }
    
    
    
    /**
     *
     *  加载script
     *  @param {string |Object} options     如果是string类型,那么认为是script绝对地址,其他参数通过对象来定义
     *  @param {function Object} callback   如果是function类型,那么认为是成功回调函数,如果需要设置失败/其他回调函数,那么通过对象方式定义
     * 
     */
    function loadScript(options, callback) {
        
        var https =  doc.location.protocol === 'https:'
           ,callbacks
           ,url
           ,success = callback
           ,error
           ,script
           ,readyState
           ,finish = function(code){
                var index = code,   //success: 0 , error: 1
                    fn;
                    S.each(jscallbacks[url], function (callback) {
                        if (fn = callback[index]) {
                            fn.call(script);
                        }
                    });
                    delete jscallbacks[url];    // 清空
           }
        ;
        
        
        
        if (!options) throw new Error('Cant load nothing...');
    
        if (S.type(options) === 'string') {
            options = { src : options };
        }
    
        
        
        //自动添加协议(http|https)
        if (options.src && options.src.indexOf('//') === 0) {
            url = options.src = https ? 'https:' + options.src : 'http:' + options.src;
        }
        
        if (S.isPlainObject(callback)) {
            success = callback['success'];
            error = callback['error'];
        }
        
        callbacks = jscallbacks[url] = jscallbacks[url] || [];
        callbacks.push([success , error]);
        
        if(callbacks.length > 1){
            return;
        }
    
        if (https && options.https) options.src = options.https;
        else if (!https && options.http) options.src = options.http;
    
    
    
        script = doc.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = options.src;
        if (charset) {
            script.charset = options.charset || "utf-8";
        }
        
        head.insertBefore(script, head.firstChild);
        
        script.onload = script.onreadystatechange = function () {
            readyState = script.readyState;
            if (!readyState ||
                readyState == "loaded" ||
                readyState == "complete") {
                script.onreadystatechange = script.onload = null;
                finish(0)
            }
        };
        script.onerror = function () {
            script.onerror = null;
            finish(1);
        };
        
        return script;
    };
    S.mix(DOM , {
        loadScript: loadScript
    });    
    
}());