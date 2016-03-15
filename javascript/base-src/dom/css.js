;(function(undefined){
    var 
       UNDEFINED = undefined
       ,DOM = dom 
       ,WINDOW = DOM.getWin()
       ,DOC = DOM.getDoc()
       ,RE_NUM = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/                       //数值
       ,RE_NUM_SOURCE = RE_NUM.source
       ,RE_NUM_NOT_PX = new RegExp( "^(" + RE_NUM_SOURCE + ")(?!px)[a-z%]+$", "i" )       //非像素值
       ,RE_UPPER = /([A-Z]|^ms)/g
       ,defaultDisplay = { }
       ,cssVendorPrefixes = [ "Webkit", "O", "Moz", "ms" ]
       ,cssShow = { position: "absolute", visibility: "hidden", display: "block" }
       
       ,camelCase = S.camelCase
       
       //数值类型样式
       ,cssNumber = {
            "fillOpacity": 1,
            "fontWeight": 1,
            "lineHeight": 1,
            "opacity": 1,
            "orphans": 1,
            "widows": 1,
            "zIndex": 1,
            "zoom": 1
        }
       ,DEFAULT_UNIT = "px" 
       ,OWNER_DOCUMENT = "ownerDocument"
       ,STYLE = "style"
       ,FLOAT = "float"
       ,RE_MARGIN = /^margin/
       ,WIDTH = "width"
       ,HEIGHT = "height"
       ,AUTO = "auto"
       ,DISPLAY = "display"
       ,OLD_DISPLAY = DISPLAY + S.now()
       ,EMPTY_STR = ""
       
       
       ,STYLE_HOOKS = { }           // 特殊样式操作{get/set}  参考:jQuery
       ,cssProps = {                // 保留字
            "float" : "cssFloat"
       }
    ;

    // return a css property mapped to a potentially vendor prefixed property
    // 厂商特殊属性名称
    function vendorPropName( style, name ) {
    
        // shortcut for names that are not vendor prefixed
        if ( name in style ) {
            return name;
        }
    
        // check for vendor prefixed names
        var capName = name.charAt(0).toUpperCase() + name.slice(1),
            origName = name,
            i = cssVendorPrefixes.length;
    
        while ( i-- ) {
            name = cssVendorPrefixes[ i ] + capName;
            if ( name in style ) {
                return name;
            }
        }
    
        return origName;
    }
    
    /**
     * 
     * @param {Object} elem
     * @param {Object} el
     */
    function isHidden( elem ) {
        return elem ? true : DOM.css( elem, "display" ) === "none" || !DOM.contains( elem[OWNER_DOCUMENT], elem );
    }
    
    // 获取目标元素所有计算样式值.
    function getStyles( elem ) {
        return window.getComputedStyle( elem, null );
    }
    
    // 记录目标元素在浏览器中默认可见状态.
    function getDefaultDisplay(tagName) {
        var body,
            oldDisplay = defaultDisplay[ tagName ],
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = DOC.body || DOC.documentElement;
            elem = DOC.createElement(tagName);
            // TODO 封装函数
            //DOM.prepend(elem, body);
            body.insertBefore(elem , body.firstChild);
            oldDisplay = DOM.css(elem, 'display');
            body.removeChild(elem);
            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }
        return oldDisplay;
    }
    
    // 临时替换目标元素中特殊样式规则,并且触发回调函数,最后还原.(inner: 计算Elem{display : none}的高度和宽度 )
    function swap(elem, options, callback) {
        var old = {}, name;
 
        // Remember the old values, and insert the new ones
        for (name in options) {
            old[ name ] = elem[STYLE][ name ];
            elem[STYLE][ name ] = options[ name ];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            elem[STYLE][ name ] = old[ name ];
        }
    }
    
    // 设置/获取目标元素的inline样式
    function style(elem , name , val){
        
        var style
           ,rst
           ,hook
        ;
        
        if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
            return undefined;
        }
        
        name = camelCase(name);       
        hook = STYLE_HOOKS[name];
        name = cssProps[name] || name;
        
        
        // getter
        if(S.isUndefined(val)){
            //优先考虑hook操作   => $STYLE_HOOKS
            if (hook && 'get' in hook && (ret = hook.get(elem, false)) !== undefined) {
                return rst;
            }
            return style[name];
        }
        // setter
        else{
            // normalize unset
            if (val === null || val === EMPTY_STR) {
                val = EMPTY_STR;
            }
            // number values may need a unit
            else if (!isNaN(Number(val)) && !cssNumber[name]) {
                val += DEFAULT_UNIT;
            }
            if (hook && hook.set) {
                val = hook.set(elem, val);
            }
            if (val !== undefined) {
                // ie 无效值报错
                try {
                    // EMPTY_STR will unset style!
                    style[name] = val;
                } catch (e) {
                    S.log('css set error :' + e);
                }
                // #80 fix,font-family
                if (val === EMPTY_STR && style.removeAttribute) {
                    style.removeAttribute(name);
                }
            }
            return undefined;
        }
        
    }
    
    // 获取目标元素样式的computed value.
    function getComputedStyle(elem , name){
        var val = '',
            computedStyle,
            width,
            minWidth,
            maxWidth,
            style = elem[STYLE],
            d = elem.ownerDocument;

        name = name.replace(RE_UPPER, '-$1').toLowerCase();

        if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
            val = computedStyle.getPropertyValue(name) || computedStyle[name];
        }
        
        
        // 如果目标元素未在document中,那么拿inline样式
        if (val === '' && !DOM.contains(d, elem)) {
            name = cssProps[name] || name;
            val = style[name];
        }

        // Safari 5.1 returns percentage for margin
        // 针对margin 且该值非绝对数值 
        if (RE_NUM_NOT_PX.test(val) && RE_MARGIN.test(name)) {
            width = style.width;
            minWidth = style.minWidth;
            maxWidth = style.maxWidth;

            style.minWidth = style.maxWidth = style.width = val;
            val = computedStyle.width;

            style.width = width;
            style.minWidth = minWidth;
            style.maxWidth = maxWidth;
        }

        return val;
    }
    
    /*
     *
     * 计算目标元素的高度/宽度.
     * @param elem
     * @param name
     * @param {String} [extra]  
     *  'padding'  : 本质宽度/高度 + padding
     *  'border '  : 本质宽度/高度 + padding + border
     *  'margin '  : 本质宽度/高度 + padding + border + margin
     */
    function getWidthOrHeight(elem, name, extra) {
        if (S.isWindow(elem)) {
            return name == WIDTH ? DOM.viewportWidth(elem) : DOM.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? DOM.docWidth(elem) : DOM.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;    

        if (val > 0) {
            if (extra !== 'border') {
                S.each(which, function (w) {
                    if (!extra) {
                        val -= parseFloat(DOM.css(elem, 'padding' + w)) || 0;
                    }
                    if (extra === 'margin') {
                        val += parseFloat(DOM.css(elem, extra + w)) || 0;
                    } else {
                        val -= parseFloat(DOM.css(elem, 'border' + w + 'Width')) || 0;
                    }
                });
            }

            return val;
        }

        // Fall back to computed then un computed css if necessary
        val = getComputedStyle(elem, name);
        if (val == null || (Number(val)) < 0) {
            val = elem.style[ name ] || 0;
        }
        // Normalize '', auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function (w) {
                val += parseFloat(DOM.css(elem, 'padding' + w)) || 0;
                if (extra !== 'padding') {
                    val += parseFloat(DOM.css(elem, 'border' + w + 'Width')) || 0;
                }
                if (extra === 'margin') {
                    val += parseFloat(DOM.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }
    
    /**
     *
     * 获得指定elem高度和宽度(目标元素可能display : none) 
     * @param {Object} elem
     * @param {string} mark     width|height
     * @param {string} extra    padding | border | margin
     * 
     */
    function getWHForInvisible(elem) {
        var val, args = arguments;
        // in case elem is window
        // elem.offsetWidth === undefined
        if (elem.offsetWidth !== 0) {
            val = getWidthOrHeight.apply(UNDEFINED, args);
        } else {
            swap(elem, cssShow, function () {
                val = getWidthOrHeight.apply(UNDEFINED, args);
            });
        }
        return val;
    }
    
    
    
    // 添加HOOK.
    // 在获取height和width时,可能目标元素的display为none,导致无法获得computed value.
    S.each(['height', 'width'], function (name) {
        STYLE_HOOKS[ name ] = {
            get: function (elem, computed) {
                if (computed) {
                    return getWHForInvisible(elem, name) + 'px';
                }
            }
        };
    });
    
    
    // 接口定义
    S.mix(DOM , {
       
        _getWHForInvisible : getWHForInvisible,
       
        /**
         * 
         * getter inline style[first]
         * or
         * setter inline style[one or more]
         * 
         * @param {Object} selector
         * @param {Object} name
         * @param {Object} val
         */
        style: function(selector , name , val){
            var elems = DOM.query(selector)
                ,key
                ,elem = elems[0]
                ,len = elems.length
                ,i
                ,rst
           ;
           
           //setter
           if (S.isPlainObject(name)) {
                for (key in name) {
                    for (i = len - 1; i >= 0; i--) {
                        style(elems[i], key, name[key]);
                    }
                }
                return UNDEFINED;
            }
            
            //getter
            if(typeof val === "undefined"){
                rst = '';
                if(elem){
                    rst = style(elem , name , val)
                }
                return rst;
            }
            //setter
            else{
                $.each(elems , function(el){
                    style(el, name, val);
                });
                return UNDEFINED;
            }
       }
       
       /**
         * 
         * getter computed style [first]
         * or
         * setter inline style[one or more]
         * 
         * @param {Object} selector
         * @param {Object} name
         * @param {Object} val
         */
       ,css: function(selector, name, val){
           var els = DOM.query(selector),
                    elem = els[0],
                    k,
                    hook,
                    ret,
                    i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }

                name = camelCase(name);
                hook = STYLE_HOOKS[name];
                // getter
                if (S.isUndefined(val)) {
                    ret = '';
                    if (elem) {
                        // If a hook was provided get the computed value from there
                        if (hook && 'get' in hook && (ret = hook.get(elem, true)) !== undefined) {
                        } else {
                            ret = getComputedStyle(elem, name);
                        }
                    }
                    return ret === undefined ? '' : ret;
                }
                // setter
                else {
                    for (i = els.length - 1; i >= 0; i--) {
                        style(els[i], name, val);
                    }
                }
                return undefined;
           
       }
   
       ,show: function(selector){
            var elems = DOM.query(selector)
               ,display
               ,tagName
            ;
           
            S.each(elems , function(elem){
               
               display = elem.style.display;
               
               if(display === "none"){
                   elem.style.display = DOM.data(elem, OLD_DISPLAY) || EMPTY_STR;
               }
                if(isHidden(elem)){
                    tagName = elem.tagName.toLowerCase();
                    old = getDefaultDisplay(tagName);       //部分元素特性就是不可见的
                    DOM.data(elem, OLD_DISPLAY, old);   
                    elem[STYLE][DISPLAY] = old;
               }
           });
           
           return DOM;
       }

       ,hide: function(selector) {
            var elems = DOM.query(selector)
               ,display
            ;
            
            S.each(elems , function(elem){
               
               display = elem.style.display;
               
               if(display !== "none" && !isHidden(elem)){
                   elem.style.display = DOM.data(elem, OLD_DISPLAY , display);
               }
               
               elem.style.display = "none";
               
           });
           
           return DOM;
        }

   });
   
   
   
   
    //  [2013-3-18]
    //  仿照KISSY 和 jQuery 提供了关于DOM 样式的控制
}());
