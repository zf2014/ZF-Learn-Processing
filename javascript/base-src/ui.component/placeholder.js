/**
 *  
 *  @desc: 文本输入框占位符
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-05-17
 *  
 *  @last: 2013-05-17
 */
;(function($, S, undefined) {
    var window = S.ENV.host,
        document = window.document,
        PLACEHOLDER_DATA_CACHE = 'zjp.data.placeholder',
        PLACEHOLDER_EVENT_NAMESPACE = '.zjp.event.placeholder',
        PLACEHOLDER_CLASSNAME = 'placeholder',
        PLACEHOLDER_WRAPPER = '<span class="placeholder"></span>',
        PLACEHOLDER_TEXT = '<span class="placeholder-text"></span>',
        isSupportPlaceholder = 'placeholder' in document.createElement('input'),
        toggle
    ;
    
    /**
     *
     * 占位符{Placeholder}构造函数
     * 
     * @param  node         目标输入框
     * @return Placeholder  构造对象
     *  
     */
    function Placeholder(node){
        this.node = node;
        this._init();
    }
    
    // Placeholder原型对象
    Placeholder.prototype = {
        
        constructor: Placeholder,
        
        text: '',
        
        packNode: null,
        
        _init: function(){

            // 如果浏览器支持, 跳出
            if(isSupportPlaceholder){
                return;
            }
            
            var self = this,
                $node = this.node,
                $placeholderText,
                node = $node[0],
                isInput = node && node.nodeType === 1 &&(node.tagName === 'INPUT' || node.tagName === 'TEXTAREA'),
                text = this.text = S.trim(isInput ?node.getAttribute('placeholder') : ''),
                lineHeight = $node.css('line-height')
            ;
            
            
            // 如果是空文本, 跳出
            if(!text){
                return;
            }
            
            $placeholderText = this._pack().css('line-height', parseInt(lineHeight, 10) + 2 + 'px');
            
            $node = this.node = $placeholderText.prev();
            
            // 事件绑定
            // 聚焦
            $placeholderText.bind('click'+PLACEHOLDER_EVENT_NAMESPACE, function(){
                $placeholderText.hide();
                $node.focus();
            });
            
            // IE8 bug fixed
            $node.bind('focus'+PLACEHOLDER_EVENT_NAMESPACE, function(){
                $placeholderText.hide();
            });
            
            // 失焦
            $node.bind('blur'+PLACEHOLDER_EVENT_NAMESPACE, function(){
                var inpValue = S.trim($node.val());
                
                if(!inpValue){
                    $placeholderText.show();
                }
            });

            // 如果输入框中已经有value值, 那么不显示占位符
            if(S.trim($node.val())){
                $placeholderText.hide();
            }
        },
        
        _pack: function(){
            var self = this,
                $node = this.node,
                $placeholderWrapper = $(PLACEHOLDER_WRAPPER)
            ;

            return this.packNode = $(PLACEHOLDER_TEXT).appendTo($node.wrap($placeholderWrapper).parent()).append('<em>' + self.text + '</em>');
        },
        
        toString: function(){
            return this.text;
        }
        
    };
    
    toggle = function(node){
        var $node = $(node),
            placeHolder
        ;
        
        placeHolder = $node.data(PLACEHOLDER_DATA_CACHE);
        
        if (!placeHolder) {
            $node.data(PLACEHOLDER_DATA_CACHE, ( placeHolder = new Placeholder($node)));
        }
    };
    
    // domReady
    $(function(){
        S.each($('body').find('[placeholder]'), function(item){
            toggle(item);
        });
    });
})(jQuery , window.zjport);



/* 2013-08-01 修改*/
// IE下导致无法完成自动补全操作

/* 2013-11-15 修改*/
// 解决内容显示重叠问题