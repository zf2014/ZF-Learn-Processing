/**
 *  
 *  @desc: 按钮组件封装
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-15
 */
;(function($, S, undefined) {
    var global = S.ENV.host,
        BTN_DATA_CACHE = 'zjp.data.button',
        BTN_EVENT_NAMESPACE = '.zjp.event.button',
        BTN_ACTIVE_CLASSNAME = 'btn_active',
        BTN_LOADING_DATA = 'loading-text',
        BTN_CLASSNAME = 'btn',
        BTN_GROUP_CLASSNAME = 'btn-group',
        NOOP = function(){},
        FALSE = false,
        rclassNameSpace = /\s+/,
        defaultOptions = {
            // action: NOOP   自定义单击行为
        },
        isString = S.isString,
        trim = S.trim,
        hooks = {
            text : {
                set : function(button, text){
                    var $node = button.node,
                        btnTextNode
                    ;
                    
                    if(button._isValueText){
                        $node.val(text);
                        return;
                    }
                    
                    btnTextNode = $node.children('.btn-txt:first');
                    
                    if(!btnTextNode.length){
                        btnTextNode = S.each($node[0].childNodes, function(elem){
                            if(elem.nodeType === 3 && trim(elem.nodeValue)){
                                elem.replaceWholeText(text);
                            }
                        });
                    }else{
                        btnTextNode.text(text);
                    }
                    
                },
                get : function(button){
                    var $node = button.node;
                    
                    if(button._isValueText){
                        return trim($node.val());
                    }
                    return trim($node.text());
                }
            }
        },
        jq = (function(){
            var collection = $([1]);
            return function(element){
                collection[0] = element;
                return collection;
            };
        })(),
        toggle
    ;
    
    
    /**
     *
     * 按钮{Button}构造函数
     * 
     * @param  node           目标触发元素
     * @param  options        可选参数
     *   
     * 
     * @return Button       构造对象
     *  
     */
    function Button(node , options) {
        this.node = node;
        this.options = S.mix({} ,defaultOptions ,options, true);
        this._init();
    }
    
    // Button原型对象
    Button.prototype = {
        /**
         * 构造函数
         */
        constructor: Button,
        
        /**
         * 按钮组件事件入口
         */
        click: function() {
            
            var self = this,
                $node = this.node,
                options = this.options,
                needPreventDefault = FALSE,
                defaultAction = this._defaultAction,
                customAction = this.customAction,
                customActionResult,
                deferThen
            ;
            
            
            // 自定义函数只有在未激活状态下能被触发
            if(customAction){
                if(this._isActived){
                    return FALSE;
                }
                customActionResult = customAction.call(this);
            }
            
            // 自定义函数执行结果明确返回false, 终止后续动作
            if(customActionResult === FALSE){
                return FALSE;
            }
            
            // 如果是异步操作(ajax | 定时器), 基于CommonJS Promise规范
            if(customActionResult && customActionResult.promise && S.isFunction(customActionResult.promise.then)){
                customActionResult.promise.then(function(){
                    self.restore();
                });
                // return needPreventDefault;
            }
            
            defaultAction.call(this);
            
            return FALSE;
        },
        
        /**
         * getter/setter 按钮文本
         * 
         * @param{String} (setter)修改按钮名称
         * 
         * @return{String} (getter)获取按钮名称
         * 
         */
        text: function(words){
            
            var $node = this.node,
                hookText = hooks.text
            ;
            
            if(words && isString(words)){
                hookText.set(this, words);
                this._isReplaceText = (words !== this._defaultText);
                return;
            }
            
            return hookText.get(this);
        
        },
        /**
         * 还原按钮初始状态
         */
        restore: function(){
            this._isReplaceText && this.text(this._defaultText);
            this._isActived && this.node.removeClass(BTN_ACTIVE_CLASSNAME);
            this._isActived = false;
        },
        
        // 构成按钮元素类型{a | button | input[type=submit|button|reset]}
        type: '',
        
        // 自定义单击行为函数
        customAction: 0,
        
        // 按钮组元素
        group: 0,
        
        // 按钮组类型{checkbox | radio}
        groupType: 0,
        
        /**
         * 
         * 按钮组件初始化函数{选择性状态控制}
         * 
         * 控制参数:
         *    构造函数传入
         *    页面元素设置
         */
        _init: function(){
            var self = this,
                $node = this.node,
                options = this.options,
                nodeName = $node[0].tagName.toLowerCase(),
                isGroupBtn = false,     // 判断是否为群组按钮(checkbox | radio )
                $btnGroup,
                loadingBtnText,
                btnType
            ;
            
            // a | button | input[type=button] | input[type=submit] | input[type=reset]
            btnType = this.type = nodeName === 'input' ? ('input[type=' + $node[0].type + ']'  ) : nodeName;
            this._isValueText = !!S.startsWith(btnType, 'input');
            this._defaultText = this.text();
            
            this._isActived = $node.hasClass(BTN_ACTIVE_CLASSNAME);
            
            
            // 判断目标元素上是否有 data-loading-text属性  | 通过可选参数options.loadingText
            if(!!(loadingBtnText = ($node.data(BTN_LOADING_DATA)||options.loadingText))){
                options.action = function(){
                    var defer = new S.Defer();                   
                    // 2秒后执行延迟的动作
                    window.setTimeout(function(){
                        defer.reslove(true);
                    }, 2000);
                    
                    self.text(loadingBtnText);
                    
                    return defer;
                }
            }
            
            if(($btnGroup = $node.parent()).hasClass(BTN_GROUP_CLASSNAME)){
                this.group = $btnGroup;
                this.groupType = $btnGroup.data('group-type');
            }
            
            this.customAction = S.isFunction(options.action)?options.action : FALSE;
            
        },
        
        /**
         * 
         * 按钮默认行为反应{状态变化}
         *  
         */
        _defaultAction: function(){
            var $node = this.node,
                $group = this.group,
                groupType = $group && this.groupType
            ;
            
            if(groupType === 'radio'){
                toggle($group.find('.'+BTN_ACTIVE_CLASSNAME), true);
            }
            
            $node.toggleClass(BTN_ACTIVE_CLASSNAME, (this._isActived = !this._isActived));
        },
        
        /**
         * 
         * 该按钮文本是否通过value属性控制{特指input}
         *  
         */
        _isValueText: 0,
        
        /**
         *
         * 记录按钮默认名称
         *  
         */
        _defaultText: '',
        
        /**
         *
         * 记录按钮激活状态
         *  
         */
        _isActived: 0,
        
        /**
         *
         * 记录按钮名称是否已经被替换过
         *  
         */
        _isReplaceText: 0  // 是否有修改过按钮文本
    };
    
    
    toggle = function(node, options, /*internal*/isRestore) {
        
        var $node = $(node),
            args = arguments,
            argsLength = args.length,
            button
        ;
        if(!$node.length){
            return;
        }
        button = $node.data(BTN_DATA_CACHE);
        
        if(argsLength === 2 && S.isBoolean(options)){
            isRestore = options;
            options = {};
        }else{
            options = S.isPlainObject(options)?options : {};
        }
        
        if(isRestore){
            button && button.restore();
            return FALSE;
        }
        
        if (!button) {
            $node.data(BTN_DATA_CACHE, ( button = new Button($node, options)));
        }
        
        return button.click();
        
    };
    
    $(function(){
        $('body').on("click"+BTN_EVENT_NAMESPACE, ".js-Btn-Toggle", function(event){
            
            var $btn = $(event.target);
            
            if(!$btn.hasClass(BTN_CLASSNAME)){
                $btn = $btn.closest('.'+BTN_CLASSNAME);
            }
            
            return toggle($btn);
        });
        
        /**
         *   
         *  S.btnToggle = function(node , options){
         *     $(node).on("click"+BTN_EVENT_NAMESPACE , function(){
         *         toggle(this , options);
         *     });
         *  };
         */
    });
        
})(jQuery, window.zjport);