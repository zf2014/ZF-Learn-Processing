;(function(undefined) {
    var DOM = dom
        ,body = DOM.getDoc().body
        ,SCROLL= "scroll"
        ,SCROLL_LEFT= SCROLL + "Left"
        ,SCROLL_TOP= SCROLL + "Top"
        ,OWNER_DOCUMENT = "ownerDocument"
        ,DOCUMENT = "document"
        ,DOC_ELEMENT = 'documentElement'
        ,getWin = DOM.getWin
        ,CLIENT = 'client'
        ,BODY = "body"
        ,VIEWPORT = "viewport"
        ,WIDTH = "width"
        ,HEIGHT = "height"
    ;

        S.mix(DOM, {
            /**
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            docWidth : 0,
            /**
             * Get the height of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            docHeight : 0,
            /**
             * Get the height of window
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            viewportHeight : 0,
            /**
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            viewportWidth : 0,
            
            
            /**
             * computed height{csswidth} : height + padding 
             * @param {selector} 目标元素
             * @param {val} 高度/宽度值
             */
            width : 0,
            
            /**
             * 
             * computed innerwidth : csswidth - padding - border
             * @param {selector} 目标元素
             * 
             */
            innerWidth : 0,
            
            /**
             * 
             *
             * computed outerwidth : csswidth + includeMargin ? margin : 0
             * @param {selector} 目标元素
             * @includeMargin {boolean} 是否包含margin值
             * 
             */
            outerWidth : 0,
            /**
             * 
             * computed height{cssheight} : height + padding 
             * 
             * @param {selector} 目标元素
             * @param {val} 高度/宽度值
             */
            height : 0,
            
            /**
             * 
             * computed innerheight : cssheight - padding - border
             * 
             * @param {selector} 目标元素
             * 
             */
            innerHeight : 0,
            /**
             * 
             *
             * computed outerheight : cssheight + includeMargin ? margin : 0
             * 
             * 
             * @param {selector} 目标元素
             * @includeMargin {boolean} 是否包含margin值
             * 
             */
            outerHeight : 0
        });
        
    // 添加 docWidth/Height, viewportWidth/Height getter methods
    S.each([WIDTH, HEIGHT], function (name) {
        var upperName = S.upFirst(name);
        
        DOM['doc' + upperName] = function (refWin) {
            refWin = DOM.get(refWin);
            var w = getWin(refWin),
                d = w[DOCUMENT];
            return Math.max(
                //firefox chrome documentElement.scrollHeight< body.scrollHeight
                //ie standard mode : documentElement.scrollHeight> body.scrollHeight
                d[DOC_ELEMENT][SCROLL + name],
                //quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
                d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + upperName] = function (refWin) {
            refWin = DOM.get(refWin);
            var prop = CLIENT + name,
                win = getWin(refWin),
                doc = win[DOCUMENT],
                body = doc[BODY],
                documentElement = doc[DOC_ELEMENT],
                documentElementProp = documentElement[prop];
            // 标准模式取 documentElement
            // backcompat 取 body
            return doc[compatMode] === CSS1Compat
                && documentElementProp ||
                body && body[ prop ] || documentElementProp;
        }
        
        DOM['inner' + upperName] = function (selector) {
            var el = DOM.get(selector);
            return el && DOM._getWHForInvisible(el, name, 'padding');
        };

        DOM['outer' + upperName] = function (selector, includeMargin) {
            var el = DOM.get(selector);
            return el && DOM._getWHForInvisible(el, name, includeMargin ? 'margin' : 'border');
        };

        DOM[name] = function (selector, val) {
            var ret = DOM.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };
        
    });        
    
        
}()); 