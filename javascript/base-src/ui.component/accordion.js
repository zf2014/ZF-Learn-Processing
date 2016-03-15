/**
 *  
 *  @desc: 手风琴组件
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-05-29 
 *  
 *  @last: 2013-05-29
 * 
 */

;(function($, S, undefined){
    var global = S.ENV.host,
        canDebug = S.CONFIG.debug,
        
        ACCORDION_DATA_CACHE = 'zjp.data.accordion',
        ACCORDION_EVENT_NAMESPACE = '.zjp.event.accordion',
        ACCORDION_CLASSNAME = 'accordion-expand',
        ACCORDION_TOGGLER_SELECTOR = '[data-toggler]',
        NOOP = function(){},
        
        fxAttrPrefix = 'outer-',
        
        
        defaultOptions = {
            delay : {
                show: 350,
                hide: 350
            }
        },
        $$ = S.fastJQuery,
        toggle
    ;
    
    /**
     *
     * 手风琴{Accordion}构造函数
     * 
     * @param  node           目标触发元素
     * @param  options        可选参数
     *   
     * 
     * @return Accordion      构造对象
     *  
     */
    function Accordion(node , options) {
        this.node = node;
        this.options = S.mix({} ,defaultOptions ,options, true);
        this._init();
    }
    
    // Accordion原型对象
    Accordion.prototype = {
        
        constructor: Accordion,
        
        /**
         * 
         * 隐藏或显示
         * 
         * @param {Element} elem    目标元素{可选}
         * 
         * 如果是手动触发的话, 那么必须提供正确的elem参数
         * 
         */
        toggle: function(elem){
            elem = elem || this._eventItem;
            if(!elem || (elem && elem.nodeType !==1)){
                if(canDebug){
S.log('对不起, 您指定的元素不符合要求！', elem);
                }
                return;
            }
            this._eventItem = elem;
            this._isActived(elem) ? this._hide() : this._show();
        },
        
        // 展开
        _show: function(elem){
            
            var prevItem = this._activedItem,
                options = this.options,
                fxAttr = {},
                attr = this._fx,
                item,
                target
            ;
            
            item = elem || this._eventItem;
            target = this._findTarget(item);
            
            prevItem && this._hide(prevItem);   // 隐藏上一个激活元素
            
            // 如果同一个元素, 单单是隐藏
            if(item === prevItem){
                return;
            }
            
            this._activedItem = item;
            
            fxAttr[attr] = this.genFxAttr(target);  // 计算需动画属性大小
            
            this._doFx(target, fxAttr, options.delay.show);
            $$(target).addClass(ACCORDION_CLASSNAME);
        },
        
        // 合并
        _hide: function(elem){
            var self = this,
                item = elem || this._eventItem,
                target = this._findTarget(item),
                fxAttr = {},
                options = this.options
            ;
            
            this._activedItem = null;
            fxAttr[this._fx] = this.genFxAttr();    // 计算需动画属性大小
            
            //$$(target).removeClass(ACCORDION_CLASSNAME);
            
            this._doFx(target, fxAttr, options.delay.hide, function(){
                $$(target).removeClass(ACCORDION_CLASSNAME);    
            });
        },
        
        
        // 动画效果
        _doFx: function(fxNode, fxAttr, speed , callback){
            var fxDirection = this._fx === 'height' ? true : false,
                $fxTarget = $$(fxNode)
            ;
                
            if(!fxDirection){
                $fxTarget = $$(fxNode).closest('.accordion-group');
            }
            
            
            $fxTarget.animate(fxAttr, (typeof speed === 'undefined'? 350 : speed), callback);
        },
        
        // 
        genFxAttr: function(fxNode){
            var fxDirection = this._fx === 'height' ? true : false, // 记录动画方向{true: 垂直 , false: 水平}
                $container = this.node,
                reslut,
                
                totalWidth,
                itemWidth = this._itemDimension['width']
            ;
            
            // 隐藏
            if(typeof fxNode === 'undefined'){
                // 垂直
                if(fxDirection){
                    reslut = 0; 
                }else{
                    reslut = itemWidth;
                }
            }else{
                // 垂直
                if(fxDirection){
                    reslut = $$(fxNode).children()[S.camelCase(fxAttrPrefix + this._fx)](); 
                }else{
                    reslut = $$(fxNode).closest('.accordion-inner').width();
                }
            }
            return reslut;
        },
        
        _isActived: function(elem){
            return $$(elem).hasClass(ACCORDION_CLASSNAME);  
        },
        
        _findTarget: function(elem){
            var reslut;
            
            reslut = S.find(this._pairs, function(pair){
                if(pair['toggler'] === elem){
                    return true;
                }
            });
            
            return reslut['target'];
        },
        
        _bindEvent: function(){
            var self = this,
                $container = this.node
            ;
            
            $container.on('click' + ACCORDION_EVENT_NAMESPACE, ACCORDION_TOGGLER_SELECTOR, function(e){
                self._eventItem = e.target || e.srcElement;
                self.toggle();
                return false;
            });
            
        },
        
        _init: function(){
            var $container = this.node,
                $items = $container.find(ACCORDION_TOGGLER_SELECTOR),
                $target,
                size = $items.size(),
                pairs = [],
                dimension = {},
                
                horizontal = false,
                horizontalWidth,
                totalWidth = $container.outerWidth()
            ;
            
            // 动画属性{默认为height}
            if($container.hasClass('accordion_vertical')){
                this._fx = 'width';
                horizontal = true;
            }
            
            S.each($items, function(item, index){
                $target = $($$(item).attr('data-target'));
                if(index === 0){
                    dimension['width'] = $$(item).outerWidth();
                    dimension['height'] = $$(item).outerHeight();
                    
                }
                
                // TODO 有设计缺陷, 待修改
                horizontal && $target.width(totalWidth - size*dimension['width'] - (size + 3));
                horizontal && $target.parent().width(totalWidth - (size - 1)*dimension['width'] - size - 1);
                
                pairs.push({
                    'toggler' : item,
                    'target' : $target[0]
                });
            });
            
            
            
            // 触发元素对
            this._pairs = pairs;
            this._itemDimension = dimension;
            
            // 触发元素数量
            this._size = size;
            
            
            // 事件绑定
            this._bindEvent();
            
            
        },
        
        _pairs: 0,              // 记录所有触发元素和展示元素对
        _size: 0,               // 记录可激活元素数量
        _itemDimension: 0,      // 记录触发元素的尺度{width和height}
        
        
        _activedItem: null,     // 记录被激活的元素
        _eventItem: null,       // 记录事件目标元素
        
        _fx: 'height'           // 记录动画属性
    };
    
    
    
    toggle = function(node, options){
        var $node = $(node),
            accordion
        ;
        
        accordion = $node.data(ACCORDION_DATA_CACHE);
        
        if (!accordion) {
            $node.data(ACCORDION_DATA_CACHE, (accordion = new Accordion($node, options)));
        }
        
        return accordion;
    }
    
    
    
    $(function(){
        S.each($('.js-Accordion'), function(node){
            toggle(node);
        });
    });
    
})(jQuery , window.zjport);