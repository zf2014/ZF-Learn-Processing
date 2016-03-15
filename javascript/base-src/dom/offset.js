;(function(undefined){
    var DOM = dom
        ,win = window
        ,body = DOM.getDoc().body
        ,doc = win.document
        ,docElem = doc && doc.documentElement
        ,SCROLL= "scroll"
        ,SCROLL_LEFT= SCROLL + "Left"
        ,SCROLL_TOP= SCROLL + "Top"
        ,OWNER_DOCUMENT = "ownerDocument"
        ,DOCUMENT = "document"
        ,DOC_ELEMENT = 'documentElement'
        ,getWin = DOM.getWin
        ,POSITION = "position"
        ,LEFT = "left"
        ,TOP = "top"
        ,isNumber = S.isNumber
    ;
    
    
    var getClientPosition , getPageOffset , getOffset , setOffset;
    
    
    S.mix(DOM , {
        /*
         * 设置/获取目标元素坐标
         * 
         * @param {string} selector          目标元素
         * @param {object} coordinates       坐标值{left: 10 , top : 20}
         * @param {viewpoint} relativeWin   可能出现iframe嵌套,通过relativeWin来明确是相对于哪个iframe.默认是相对于viewpoint
         * 
         */
        offset: function(selector , coordinates , relativeWin) {
            // getter
            if (coordinates === undefined) {
                var elem = DOM.get(selector), ret;
                if (elem) {
                    ret = getOffset(elem, relativeWin);
                }
                return ret;
            }
            // setter
            var els = DOM.query(selector), i;
            for (i = els.length - 1; i >= 0; i--) {
                elem = els[i];
                setOffset(elem, coordinates);
            }
        }
         /*
         * 
         * 设置/获取横向滚动条偏移位置
         * @param {string} elem         目标元素
         * @param {object} val          偏移位置大小
         * 
         */
       ,scrollLeft: 0
       /*
         * 
         * 设置/获取纵向滚动条偏移位置
         * @param {string} elem         目标元素
         * @param {object} val          偏移位置大小
         * 
         */
       ,scrollTop: 0
        
    });
    
    
    // 添加scrollTop/scrollLeft
    S.each(["Left" , "Top"] , function(name , i){
        var method = SCROLL + name;
        DOM[method] = function(elem , val){
            elem = DOM.get(elem);
            var ret,
                left,
                top,
                w = getWin(elem),
                d;
            //针对Window
            if (w) {
                //setter
                if (val !== undefined) {
                    val = parseFloat(val);
                    // 注意多 window 情况，不能简单取 win
                    left = name == 'Left' ? val : DOM.scrollLeft(w);
                    top = name == 'Top' ? val : DOM.scrollTop(w);
                    w['scrollTo'](left, top);
                //getter
                } else {
                    //标准
                    //chrome == body.scrollTop
                    //firefox/ie9 == documentElement.scrollTop
                    ret = w[ 'page' + (i ? 'Y' : 'X') + 'Offset'];
                    if (!isNumber(ret)) {
                        d = w[DOCUMENT];
                        //ie6,7,8 standard mode
                        ret = d[DOC_ELEMENT][method];
                        if (!isNumber(ret)) {
                            //quirks mode
                            ret = d[BODY][method];
                        }
                    }
                }
            //非Window
            } else if (elem.nodeType == DOM.NodeType.ELEMENT_NODE) {
                if (val !== undefined) {
                    elem[method] = parseFloat(val)
                } else {
                    ret = elem[method];
                }
            }
            return ret;
        }
    })
    
    getClientPosition= function(elem) {
        var box, x , y ,
            doc = elem && elem.ownerDocument,
            body = doc.body;

        if (!elem.getBoundingClientRect) {
            return {
                left: 0,
                top: 0
            };
        }

        // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        box = elem.getBoundingClientRect();

        // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
        // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
        // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

        x = box[LEFT];
        y = box[TOP];

        // In IE, most of the time, 2 extra pixels are added to the top and left
        // due to the implicit 2-pixel inset border.  In IE6/7 quirks mode and
        // IE6 standards mode, this border can be overridden by setting the
        // document element's border to zero -- thus, we cannot rely on the
        // offset always being 2 pixels.

        // In quirks mode, the offset can be determined by querying the body's
        // clientLeft/clientTop, but in standards mode, it is found by querying
        // the document element's clientLeft/clientTop.  Since we already called
        // getClientBoundingRect we have already forced a reflow, so it is not
        // too expensive just to query them all.

        x -= docElem.clientLeft || body.clientLeft || 0;
        y -= docElem.clientTop || body.clientTop || 0;

        return { left: x, top: y };
    }
    
    getPageOffset= function(el) {
        var pos = getClientPosition(el),
            w = getWin(el[OWNER_DOCUMENT]);
        pos.left += DOM[SCROLL_LEFT](w);
        pos.top += DOM[SCROLL_TOP](w);
        return pos;
    }

    getOffset= function(el , relativeWin){
        var position = {left: 0, top: 0},

        // Iterate up the ancestor frame chain, keeping track of the current window
        // and the current element in that window.
            currentWin = getWin(el[OWNER_DOCUMENT]),
            offset,
            currentEl = el;
        relativeWin = relativeWin || currentWin;

        do {
            // if we're at the top window, we want to get the page offset.
            // if we're at an inner frame, we only want to get the window position
            // so that we can determine the actual page offset in the context of
            // the outer window.
            offset = currentWin == relativeWin ?
                getPageOffset(currentEl) :
                getClientPosition(currentEl);
            position.left += offset.left;
            position.top += offset.top;
        } while (currentWin &&
            currentWin != relativeWin &&
            (currentEl = currentWin['frameElement']) &&
            (currentWin = currentWin.parent));

        return position;
        
    }
        // 设置 elem 相对 elem.ownerDocument 的坐标
    setOffset= function(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (DOM.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = 'relative';
        }

        var old = getOffset(elem),
            ret = { },
            current, key;

        for (key in offset) {
            current = parseInt(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }
}());
