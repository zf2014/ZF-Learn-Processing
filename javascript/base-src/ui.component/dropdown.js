/**
 *  
 *  @desc: 下拉框组件封装
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-15
 */

;(function($, S, undefined) {
    var global = S.ENV.host,
        doc = global.document,
        DD_EVENT_NAMESPACE = '.zjp.event.dropdown',
        DD_DATA_CACHE = 'zjp.data.dropdown',
        DD_TOGGLER = '.js-Dropdown-Toggler',
        defaultOptions = {
            type : 'click'
        },
        dropdownEventStateMap = {
            'hover' : 'dropdown_hover',
            'click' : 'dropdown_on'
        },
        kindHooks = {
            'btn' : 1
        },
        cleanAll,
        toggle,
        getDropdownTargetKind
    ;
    
    /**
     *
     *  下拉框{Dropdown}构造函数
     * 
     *  @param  node           目标触发元素
     *  @param  options        可选参数
     *      event: 事件对象
     *   
     * 
     *  @return Dropdown       构造对象
     *  
     */
    function Dropdown(node, options){
        this.node = node;
        this.options = S.mix({} , defaultOptions, options, true);
        this._init();
        
        return this;
    }
    
    /**
     *  原型对象
     */
    Dropdown.prototype = {
        
        constructor : Dropdown,
        
        toggle : function(){
            var $node = this.node,
                $parent = this.parent,
                options = this.options,
                toggleType = options.type,
                opened = this._isActive
            ;
            
            $node.toggleClass(this._state);
            
            cleanAll();
            
            this._isActive = $node.hasClass(this._state);
            
            if(opened){
                return;
            }
            
            $parent.toggleClass(dropdownEventStateMap[toggleType]);
        },
        /**
         * 隐藏dropdown
         */
        clean: function(){
            var $node = this.node,
                $parent = this.parent,
                options = this.options,
                toggleType = options.type
            ;
            
            // 是否激活
            if(!this._isActive){
                return;
            }
            
            $node.removeClass(this._state);
            $parent.removeClass(dropdownEventStateMap[toggleType]);
            this._isActive = false;
        },
        _init : function(){
            
            var $node = this.node,
                options = this.options,
                kind
            ;
            
            options.type = options.event && options.event.type || options.type;
            kind = getDropdownTargetKind($node[0]);
            
            if(kind && kindHooks[kind]){
                this._state = kind + '_on';
            }
            
            this.parent = $node.parent();
            
        },
        _isActive : false,
        _state: 'on'
        
    };
    
    /**
     *  隐藏所有下拉框
     */
    cleanAll = function(){
        S.each($(DD_TOGGLER), function(node){
            toggle(node, true);
        });
        
    };
    
    toggle = function(node, options, /*internal*/isClean){
        var $node = $(node),
            args = arguments,
            argsLength = args.length,
            dropdown
        ;
        
        if(!$node.length){
            return;
        }
        dropdown = $node.data(DD_DATA_CACHE);
        
        if(argsLength === 2 && S.isBoolean(options)){
            isClean = options;
            options = {};
        }else{
            options = S.isPlainObject(options)?options : {};
        }
        
        // 隐藏下拉框        
        if(isClean){
            dropdown && dropdown.clean();
            return;
        }
        
        if(!dropdown){
            $node.data(DD_DATA_CACHE, (dropdown = new Dropdown($node, options)));
        }
        
        dropdown.toggle();
    };
    
    getDropdownTargetKind = function(node){
        var type,
            classNames
        ;
        
        if(!node || node.nodeType !== 1){
            return;
        }
        
        if((classNames = S.trim(node.className))){
            type = classNames.split(/\s+/)[0];
        }
        
        return type;
    };

    $(function(){
        $('html').on('click' + DD_EVENT_NAMESPACE , function(){
            cleanAll();
        });
        $('body').on('click' + DD_EVENT_NAMESPACE , DD_TOGGLER , function(event){
            toggle(this, {
                event : event
            });
            return false;
        });
    });
    
})(window.jQuery , window.zjport);

