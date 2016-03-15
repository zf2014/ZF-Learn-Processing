/**
 *  
 *  @desc: 图片延迟加载, 如果加载失败将会采用默认图片替换(提升用户体验)
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-08-30 
 *  
 *  @last: 2013-08-30
 * 
 */

;(function($, S, undefined){
    var curWin = S.ENV.host,
        curDom = curWin.document,
        $$ = S.fastJQuery,
        ns = S.namespace('image'),

        IMG_ACTUAL_SRC_AN = 'data-delayLoad-src',
        IMG_ACUTAL_LOADED_AN ='data-delayLoad-completed',
        ACTIVE_IMG_NODE_CN = 'js-delayimg',
        defalutOpt = {
            // 目标图片元素选择器
            target : '.'+ACTIVE_IMG_NODE_CN ,
            // 默认替换图片
            altSrc : ''
        },

        analyst, stealthilyLoad
    ;

    // 解析目标img元素
    analyst = function(img, options){
        var node = img,
            delaySrc = node.getAttribute(IMG_ACTUAL_SRC_AN),
            delayCompleted = S.convert(node.getAttribute(IMG_ACUTAL_LOADED_AN))
        ;

        if(!delayCompleted && _validImgSrc(delaySrc)){
            stealthilyLoad(delaySrc, node, options);
        }
    };

    // 悄悄地去加载图片(根据浏览器缓存机制, 同一个文件资源不会重复加载)
    stealthilyLoad = function(src, imgNode, options){
        // 通过Image构造函数生成一个目标对象,通过该对象让浏览器去执行加载操作
        var img = new Image();

        // 事件绑定(有数据资源被加载触发)
        img.onload = function(){
            render(false);
            loadend();
        };
        // 事件绑定(无法加载导致加载失败)
        img.onerror = function(){
            render(true);
            loadend();
        };

        // 指定需要加载的图片地址
        img.src = src;

        // 加载完成回调函数
        function loadend(){
            img.onload = img.onerror = null;
            img = null;
        }

        // 图片渲染
        function render(error){
            // 如果加载失败, 使用默认图片替换
            var renderSrc = error ? options.altSrc : src;
            $$(imgNode).attr(IMG_ACUTAL_LOADED_AN,true).removeAttr(IMG_ACTUAL_SRC_AN);
            imgNode.src = renderSrc;
        }
    };

    // 接口
    ns.delayLoad = function(selector,options){

        var args = arguments,
            length = args.length,
            $container,
            $targets
        ;

        if(length === 1){
            options = selector;
            selector = curDom;
        }

        options = S.mix({}, defalutOpt, options);
        $container = $(selector);
        $targets = $(options.target, $container[0]);

        if($targets.length){
            S.each($targets, function(imgNode){
                analyst(imgNode, options);
            });
        }
    };

    // TODO 验证图片地址是否有效
    function _validImgSrc(src){
        return true;
    }

})(jQuery , window.zjport);