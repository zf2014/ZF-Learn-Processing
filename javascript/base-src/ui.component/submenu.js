/**
 *  
 *  @desc: 子菜单
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-18 
 *  
 *  @last: 2013-04-18
 */

;(function($, S, undefined) {
    var global = S.ENV.host,
        doc = global.document,
        SM_EVENT_NAMESPACE = '.zjp.event.submenu',
        SM_DATA_CACHE = 'zjp.data.submenu',
        SM_TOGGLER = '.js-Submenu-Toggler',
        
        SM_CONTAINER_ACTIVED_CLASSNAME = 'submenu_on',
        SM_TOGGLER_ACTIVED_CLASSNAME = 'on',
        SM_MENU_ACTIVED_CLASSNAME = 'submenu-menu_on',
        records = [],
        defaultOptions = {},
        splice = Array.prototype.splice,
        toggle,
        hideAll
    ;    
    
    /**
     *
     *  子菜单{Submenu}构造函数
     * 
     *  @param  node           目标触发元素
     *  @param  options        可选参数
     * 
     *  @return Dropdown       构造对象
     *  
     */
    function Submenu(node){
        this.element = node;
        
        this._init();
        
        return this;
    }
    
    /**
     *  原型对象
     */
    Submenu.prototype = {
        
        constructor : Submenu,
        
        show: function(){
            this._isActive = true;
            this._changeState();
        },
        hide: function(){
            this._isActive = false;
            this._changeState();
        },
        
        _init: function(){
            
            var $container = this.element,
                $toggler = $container.find('a:first'),
                $menu = $toggler.next()
            ;
            
            this.toggler = $toggler;
            
            this.menu = $menu;
            
        },
        
        _changeState: function(){
            var classNameChangeWay = this._isActive?'addClass' : 'removeClass',
                $toggler = this.toggler,
                $container = this.element,
                $menu = this.menu
            ;
            $toggler[classNameChangeWay](SM_TOGGLER_ACTIVED_CLASSNAME);
            $container[classNameChangeWay](SM_CONTAINER_ACTIVED_CLASSNAME);
            $menu[classNameChangeWay](SM_MENU_ACTIVED_CLASSNAME);
            
        },
        
        _isActive : 0,
        
        toggler : null,
        
        menu: null
        
    }
    
    toggle = function(node, type){
        var $node = $(node),
            submenu
        ;
        
        if(!$node.length){
            return;
        }
        submenu = $node.data(SM_DATA_CACHE);
        
        if(!submenu){
            $node.data(SM_DATA_CACHE, (submenu = new Submenu($node)));
            records.push(submenu);
        }
        
        S.isString(type) && submenu[type]();
    },
    
    hideAll = function(exclude){
        var i = records.length,
            submenu,
            toggler
        ;
        
        while(i--){
            submenu = records[i];
            
            if(submenu._isActive && !S.inArray(exclude, submenu.element[0])){
                submenu.hide();
            }
        }
    }
    
    $(function(){
        
        $('body').on('hover' + SM_EVENT_NAMESPACE , SM_TOGGLER , function(event){
            var eventType = event.type,
                isMouseEnter = eventType === 'mouseout' || eventType === 'mouseenter',
                $mouseOutTo = !isMouseEnter && $(event.toElement)
            ;
            
            if($mouseOutTo){
                hideAll($mouseOutTo.parents(SM_TOGGLER).toArray());
            }
            
            toggle(this, isMouseEnter ? 'show' : 'hide');
            
            return false;
        });
        
    });
    
})(window.jQuery , window.zjport)


;(function($, S, undefined){
    
    
    
    
    
    
}(window.jQuery , window.zjport));
