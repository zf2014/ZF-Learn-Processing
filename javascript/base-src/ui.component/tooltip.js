/**
 *  
 *  @desc: 工具提示框
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-15 
 *  
 *  @last: 2013-05-29
 * 
 */

;(function($, S, undefined) {
    var win = S.ENV.host,
        TOOLTIP_DATA_CACHE = 'zjp.data.tooltip',
        TOOLTIP_EVENT_NAMESPACE = '.zjp.event.tooltip',
        
        TOOLTIP_DATA_TITLE = 'data-original-title',
        TOOLTIP_DATA_OPTIONS = 'data-tooltip-options',
        
        TOOLTIP_BEM_PREFIX = 'tooltip_',
        
        defaultOptions = {
            // 页面模板
            template: '<div class="tooltip">'
                        +'<div class="tooltip-arrow"></div>'
                        +'<div class="tooltip-inner"></div>'
                     +'</div>',
            title: '提示文本',      // 标题
            delay: {                
                show: 500,          // 延迟显示 
                hide: 300           // 延迟隐藏
            },               
            gravity: 'top',         // 重心
            trigger: 'hover'        // 手动提示
        },
        
        toggle
    ;
    
    /**
     *
     * 提示框{Tooltip}构造函数
     * 
     * @param  node           目标触发元素
     * @param  options        可选参数
     *   
     * 
     * @return Tooltip       构造对象
     *  
     */
    function Tooltip(node, options){
        this.node = node;
        this._init(options);
    }
    
    // 原型对象
    Tooltip.prototype = {
        constructor: Tooltip,
        
        show: function(){
            var $tip,
                options,
                gravity,
                nodeRoom,
                actualWidth,
                actualHeight,
                tp
            ;
            
            if(this._shown){
                return;
            }
            this._shown = true;
            $tip = this.getTip();   // 提示元素 
            this.setTip();  // 插入内容
            options = this.options;
            gravity = typeof options.gravity === 'function' 
                      ? options.gravity.call(this, $tip[0], this.node[0])
                      : options.gravity;
            
            
            // 插入dom文档中
            $tip.remove()
                .css({top: 0, left: 0, display: 'block'})
                .appendTo(document.body);
            
            room = S.merge(this.getNodePosition(), this.getNodeDimension())
            
            // 提示框高度和宽度
            actualWidth = $tip.innerWidth();
            actualHeight = $tip.innerHeight();
            
            
            switch (gravity) {
                case 'bottom':
                    tp = {top: room.top + room.height, left: room.left + room.width / 2 - actualWidth / 2}
                    break
                case 'top':
                    tp = {top: room.top - actualHeight, left: room.left + room.width / 2 - actualWidth / 2}
                    break
                case 'left':
                    tp = {top: room.top + room.height / 2 - actualHeight / 2, left: room.left - actualWidth}
                    break
                case 'right':
                    tp = {top: room.top + room.height / 2 - actualHeight / 2, left: room.left + room.width}
                    break
            }
            $tip.css(tp).addClass(TOOLTIP_BEM_PREFIX + gravity);
        },
        
        hide: function(){
            var self = this,
                $tip = this.getTip()   
            ;
            
            if(!this._shown){
                return;
            }
            this._shown = false;
            
            $tip.remove();
        },
        
        // 提示内容文本获取
        getTitle: function(){
            var $node = this.node,
                options = this.options,
                title
            ;
            
            title = $node.attr(TOOLTIP_DATA_TITLE) || 
                    (typeof options.title === 'function'? options.title.call($node[0]): options.title)
            
            return title;
        },
        
        
        // 提示框元素获取
        getTip: function(){
            return this._tip || (this._tip = $(this.options.template));
        },
        
        
        // 目标元素坐标{left和top}
        getNodePosition: function(){
            var $node = this.node;
            return $node.offset();
        },
        
        // 目标元素尺度{width和height}
        getNodeDimension: function(){
            var $node = this.node;
            return {
                width: $node.width(),
                height: $node.height()
            }
        },
        
        // 设置提示框内容操作
        setTip: function(){
            
            var $tip = this.getTip(),
                content = this.getTitle(),
                $container = $tip.find('.tooltip-inner')
            ;
            
            $container[S.isHtml(content)?'html' : 'text'](content);
            
        },
        
        // 功能恢复
        enable: function () {
            this.enabled = true
        },
        
        // 功能失效
        disable: function () {
            this.enabled = false
        },
        // 初始化操作
        _init: function(options){
            
            var $node = this.node,
                options = options || {},
                attrOptions = S.qs.parse($node.attr(TOOLTIP_DATA_OPTIONS)||''), // 根据元素属性{data-tooltip-options}来设置Tooltip可选参数
                immutable
            ;
            
            this.enable();
            
            // 类型转换(String->Other)
            S.each(attrOptions, function(val, key){
                attrOptions[key] = S.convert(val);
            });
           
            // Tooltip控制属性设置{defaultOptions->attrOptions->options}[优先级从低到高]
            options = this.options = S.mix({}, defaultOptions, attrOptions, options, true);
            
            
            this._fixTitle();
            
            
            if(options.immutable){
                options.trigger = 'manual';
                this.show();
                this.disable();
            }
            
            
            // 如果触发方式不是手动, 那么需要绑定相关的事件
            if(options.trigger !== 'manual'){
                this._bindEvent();
            }
        },
        
        // 去除默认title显示
        _fixTitle: function(){
            var $node = this.node;
            
            if($node.attr('title') || (typeof $node.attr(TOOLTIP_DATA_TITLE) !== 'string')){
                $node.attr(TOOLTIP_DATA_TITLE, $node.attr('title') || '').removeAttr('title');
            }
            
        },
        
        _bindEvent: function(){
            var self = this,
                $node = this.node,
                options = this.options,
                triggerType = options.trigger,
                showEventType = triggerType ==='hover'?'mouseenter' : 'focus',
                hideEventType = triggerType ==='hover'?'mouseleave' : 'blur',
                
                timeout
            ;
            
            $node.on(showEventType, function(){
                // 终止上一个定时任务
                clearTimeout(timeout);
                
                // 定时器    
                timeout = setTimeout(function(){
                    if(!self.shown){
                        self.show();
                    }
                }, options.delay.show);
                
            });
            $node.on(hideEventType, function(){
                // 终止上一个定时任务
                clearTimeout(timeout);
                // 定时器
                timeout = setTimeout(function(){
                    if(self._shown){
                        self.hide();
                    }
                }, options.delay.hide);
            });
            
        },
        
        // 提示元素容器
        _tip: null,
        
        _shown: 0
    };
    
    
    // 发射器
    toggle = function(node, options){
        
        var $node = $(node),
            args = arguments,
            argsLength = args.length,
            tooltip
        ;
        if(!$node.length){
            return;
        }
        tooltip = $node.data(TOOLTIP_DATA_CACHE);
        
        options = S.isPlainObject(options)?options : {};
        
        
        if (!tooltip) {
            $node.data(TOOLTIP_DATA_CACHE, ( tooltip = new Tooltip($node, options)))
        }
        
        return tooltip;
        
    };
    
    
    // domReady
    $(function(){
        S.each($('body').find('.js-Tooltip'), function(item){
            toggle($(item));
        });
    });
    
})(jQuery , window.zjport);





