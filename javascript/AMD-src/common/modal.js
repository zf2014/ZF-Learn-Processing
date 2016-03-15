/**
 *  
 *  @desc: 弹出框
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-15
 */
define(['jquery', 'utils'], function($, S){
    
    var global = window,
        document = global.document,
        
        isIE6 = S.UA.ie === 6,  // IE6
        
        MODAL_SELECTOR = '.J-dialog-modal',
        MODAL_DATA_CACHE = 'Z.data.modal',
        MODAL_EVENT_NAMESPACE = '.Z.event.modal',
        MODAL_OPEN_CLASSNAME = 'modal_open',
        
        _locale = 'zh',         // 当前语言环境
        _defaultLocale = 'zh',  // 默认语言环境
        _animate = false,        // 是否动画效果
        _defaultHref = 'javascript:;',
        _classes = '',
        _btnClasses = {
            OK: 'btn__confirm',
            CANCEL: 'btn__cancel',
            CONFIRM: 'btn__confirm'
            
        },
        _icons = {},
        _locales = {
            'en' : {
                OK      : 'OK',
                CANCEL  : 'Cancel',
                CONFIRM : 'OK'
            },
            'zh' : {
                OK      : '确认',
                CANCEL  : '取消',
                CONFIRM : '确认'
            }
        },
        that = {},
        
        defaultOptions = {},
        toggle
    ;

    
    /**
     *
     * 设置语言环境.提供的语言环境变量必须是有效变量
     * 
     * @param  locale  语言环境变量
     *   
     * @return void         
     *  
     */
    that.setLocale = function(locale) {
        for (var i in _locales) {
            if (i == locale) {
                _locale = locale;
                return;
            }
        }
    };
    
    /**
     *
     * 添加/覆盖可支持语言环境
     * 
     * @param  locale        类型
     * @param  translations  语言环境属性
     *   
     * @return void         
     *  
     */
    that.addLocale = function(locale, translations) {
        if (typeof _locales[locale] === 'undefined') {
            _locales[locale] = {};
        }
        for (var str in translations) {
            _locales[locale][str] = translations[str];
        }
    };
    
    /**
     *
     * 设置图标
     * 
     * @param  icons         
     *   
     * @return void         
     *  
     */
    that.setIcons = function(icons) {
        _icons = icons;
        if (typeof _icons !== 'object' || _icons === null) {
            _icons = {};
        }
    };

    /**
     *
     * 设置按钮样式
     * 
     * @param  icons         
     *   
     * @return void         
     *  
     */
    that.setBtnClasses = function(btnClasses) {
        _btnClasses = btnClasses;
        if (typeof _btnClasses !== 'object' || _btnClasses === null) {
            _btnClasses = {};
        }
    };
    
    // TODO 动画效果实现
    that.animate = function(animate) {
        _animate = animate;
    };

    /**
     *
     * 自定义弹出框风格
     * 
     * @param  classes  自定义风格样式
     *   
     * @return void
     *  
     */
    that.classes = function(classes) {
        _classes = classes;
    };
    
    
    /**
     *
     * 警示对话框接口(1个按钮)
     * 
     * @param  str        警示内容
     * @param  label      按钮文本(默认为确认)
     * @param  cb         单击按钮后触发的回调函数
     *   
     * @return modal         
     *  
     */
    that.alert = function(/*str, label, cb*/) {
        var str   = "",
            label = _translate('OK'),
            cb    = null;

        switch (arguments.length) {
            case 1:
                // no callback, default button label
                str = arguments[0];
                break;
            case 2:
                // callback *or* custom button label dependent on type
                str = arguments[0];
                if (typeof arguments[1] == 'function') {
                    cb = arguments[1];
                } else {
                    label = arguments[1];
                }
                break;
            case 3:
                // callback and custom button label
                str   = arguments[0];
                label = arguments[1];
                cb    = arguments[2];
                break;
            default:
                throw new Error("Incorrect number of arguments: expected 1-3");
        }

        return that.dialog(str, {
            "label"   : label,
            "icon"    : _icons.OK,
            "class"   : _btnClasses.OK,
            "callback": cb
        }, {
            'close': false,
            'header': '信息提示',
            'classes': 'modal_alert'
        });
    };
    
    /**
     *
     * 成功对话框接口(1个按钮)
     * 
     * @param  str        警示内容
     * @param  label      按钮文本(默认为确认)
     * @param  cb         单击按钮后触发的回调函数
     *   
     * @return modal         
     *  
     */
    that.ok = function(/*str, label, cb*/) {
        var str   = "",
            label = _translate('OK'),
            cb    = null;

        switch (arguments.length) {
            case 1:
                // no callback, default button label
                str = arguments[0];
                break;
            case 2:
                // callback *or* custom button label dependent on type
                str = arguments[0];
                if (typeof arguments[1] == 'function') {
                    cb = arguments[1];
                } else {
                    label = arguments[1];
                }
                break;
            case 3:
                // callback and custom button label
                str   = arguments[0];
                label = arguments[1];
                cb    = arguments[2];
                break;
            default:
                throw new Error("Incorrect number of arguments: expected 1-3");
        }

        return that.dialog(str, {
            "label"   : label,
            "icon"    : _icons.OK,
            "class"   : _btnClasses.OK,
            "callback": cb
        }, {
            'close': false,
            'header': '信息提示',
            'classes': 'modal_alert modal_alert_ok'
        });
    };

    /**
     *
     * 失败对话框接口(1个按钮)
     * 
     * @param  str        警示内容
     * @param  label      按钮文本(默认为确认)
     * @param  cb         单击按钮后触发的回调函数
     *   
     * @return modal         
     *  
     */
    that.fail = function(/*str, label, cb*/) {
        var str   = "",
            label = _translate('OK'),
            cb    = null;

        switch (arguments.length) {
            case 1:
                // no callback, default button label
                str = arguments[0];
                break;
            case 2:
                // callback *or* custom button label dependent on type
                str = arguments[0];
                if (typeof arguments[1] == 'function') {
                    cb = arguments[1];
                } else {
                    label = arguments[1];
                }
                break;
            case 3:
                // callback and custom button label
                str   = arguments[0];
                label = arguments[1];
                cb    = arguments[2];
                break;
            default:
                throw new Error("Incorrect number of arguments: expected 1-3");
        }

        return that.dialog(str, {
            "label"   : label,
            "icon"    : _icons.OK,
            "class"   : _btnClasses.OK,
            "callback": cb
        }, {
            'close': false,
            'header': '信息提示',
            'classes': 'modal_alert modal_alert_fail'
        });
    };

    /**
     *
     * 确认对话框接口(2个按钮,确认|取消)
     * 
     * @param  str              确认内容
     * @param  labelCancel      取消按钮文本(默认为取消)
     * @param  labelOk          确认按钮文本(默认为确认)
     * @param  cb               按钮触发后执行的回调函数, 该回调函数接收一个boolean型参数
     *   
     * @return modal         
     *  
     */
    that.confirm = function(/*str, labelCancel, labelOk, cb*/) {
        var str         = "",
            labelCancel = _translate('CANCEL'),
            labelOk     = _translate('CONFIRM'),
            cb          = null;

        switch (arguments.length) {
            case 1:
                str = arguments[0];
                break;
            case 2:
                str = arguments[0];
                if (typeof arguments[1] == 'function') {
                    cb = arguments[1];
                } else {
                    labelCancel = arguments[1];
                }
                break;
            case 3:
                str         = arguments[0];
                labelCancel = arguments[1];
                if (typeof arguments[2] == 'function') {
                    cb = arguments[2];
                } else {
                    labelOk = arguments[2];
                }
                break;
            case 4:
                str         = arguments[0];
                labelCancel = arguments[1];
                labelOk     = arguments[2];
                cb          = arguments[3];
                break;
            default:
                throw new Error("Incorrect number of arguments: expected 1-4");
        }

        var cancelCallback = function() {
            if (typeof cb === 'function') {
                return cb(false);
            }
        };

        var confirmCallback = function() {
            if (typeof cb === 'function') {
                return cb(true);
            }
        };

        return that.dialog(str, [{
            "label"   : labelCancel,
            "icon"    : _icons.CANCEL,
            "class"   : _btnClasses.CANCEL,
            "callback": cancelCallback
        }, {
            "label"   : labelOk,
            "icon"    : _icons.CONFIRM,
            "class"   : _btnClasses.CONFIRM,
            "callback": confirmCallback
        }], {
            'close': false,
            'header': '信息提示',
            'classes': 'modal_confirm'
        });
    };
    
    /**
     *
     * 提示对话框接口(2个按钮,确认|取消), 将会生成一个表单和一个输入框
     * 
     * @param  str              警示内容
     * @param  labelCancel      取消按钮文本(默认为取消)
     * @param  labelOk          确认按钮文本(默认为确认)
     * @param  cb               按钮触发后执行的回调函数, 该回调函数接收一个boolean型参数
     * @param  defaultVal       默认提示框内的输入框的值
     *   
     * @return modal         
     *  
     */
    that.prompt = function(/*str, labelCancel, labelOk, cb, defaultVal*/) {
        var str         = "",
            labelCancel = _translate('CANCEL'),
            labelOk     = _translate('CONFIRM'),
            cb          = null,
            defaultVal  = "",
            cancelCallback,
            confirmCallback,
            modal,
            header,
            div
                
        ;

        switch (arguments.length) {
            case 1:
                str = arguments[0];
                break;
            case 2:
                str = arguments[0];
                if (typeof arguments[1] == 'function') {
                    cb = arguments[1];
                } else {
                    labelCancel = arguments[1];
                }
                break;
            case 3:
                str         = arguments[0];
                labelCancel = arguments[1];
                if (typeof arguments[2] == 'function') {
                    cb = arguments[2];
                } else {
                    labelOk = arguments[2];
                }
                break;
            case 4:
                str         = arguments[0];
                labelCancel = arguments[1];
                labelOk     = arguments[2];
                cb          = arguments[3];
                break;
            case 5:
                str         = arguments[0];
                labelCancel = arguments[1];
                labelOk     = arguments[2];
                cb          = arguments[3];
                defaultVal  = arguments[4];
                break;
            default:
                throw new Error("Incorrect number of arguments: expected 1-5");
        }

        header = str;

        div = $("<div></div>");
        div.append('<input class="inp_text" autocomplete="off" type="text" value="' + defaultVal + '" />');

        cancelCallback = function() {
            if (typeof cb === 'function') {
                return cb(null);
            }
        };

        confirmCallback = function() {
            if (typeof cb === 'function') {
                return cb(div.find("input[type=text]").val());
            }
        };

        modal = that.dialog(div, [{
            "label"   : labelCancel,
            "icon"    : _icons.CANCEL,
            "class"   : _btnClasses.CANCEL,
            "callback":  cancelCallback
        }, {
            "label"   : labelOk,
            "icon"    : _icons.CONFIRM,
            "class"   : _btnClasses.CONFIRM,
            "callback": confirmCallback
        }], {
            // 显示标题
            "header"  : header,
            // 重新绑定shown事件
            "show"    : false
        });


        modal.node.on("shown", function() {
            div.find("input[type=text]").focus();
        });
        
        modal.show();

        return modal;
    };
    
    
    /**
     *
     * 弹出框基本元素设置和渲染
     * 
     * @param{String}           str        弹出内容主题
     * @param{Array || Object}  handlers   弹出框操作按钮性质
     *   @item  label     按钮名称
     *   @item  class     按钮风格
     *   @item  callback  按钮回调函数
     * @param{Object}           options    弹出可选操作
     *   @item  header    标题文本
     *   @item  close     是否显示关闭按钮{默认显示}
     *   @item  show      是否显示
     *   @item  classes   自定义风格样式
     * 
     * @return Modal         
     *  
     */
    that.dialog = function(str, handlers, options) {
        var buttons = [],
            callbacks  = [],
            parts = [],
            closeButton = '',
            i,
            modalDiv,
            optionalClasses,
            modal
        ;

        /* ^属性初始化 */
        if (!options) {
            options = {};
        }

        // 按钮操作初始化
        if (typeof handlers === 'undefined') {
            handlers = [];
        } else if (typeof handlers.length == 'undefined') {
            handlers = [handlers];
        }
        /* $属性初始化 */
        
        
        /* ^弹出操作解析 */
        i = handlers.length;
        while (i--) {
            var label = null,
                href = null,
                _class = '',
                icon = '',
                callback = null,
                handler = handlers[i]
            ;
            
            
            if (typeof handler['label']    == 'undefined' &&
                typeof handler['class']    == 'undefined' &&
                typeof handler['callback'] == 'undefined') {
                var propCount = 0,      
                    property  = null;

                for (var j in handler) {
                    property = j;
                    if (++propCount > 1) {
                        break;
                    }
                }

                if (propCount == 1 && typeof handler[j] == 'function') {
                    handler['label']    = property;
                    handler['callback'] = handler[j];
                }
            }

            if (typeof handler['callback']== 'function') {
                callback = handler['callback'];
            }

            if (handler['class']) {
                _class = handler['class'];
            }

            if (handler['label']) {
                label = handler['label'];
            } else {
                label = "Option "+(i+1);
            }

            if (handler['icon']) {
                icon = '<span class="' + handler['icon'] + '"></span>';
            }

            if (handler['href']) {
                href = handler['href'];
            }
            else {
                href = _defaultHref;
            }
            
            buttons.push('<a data-handler="' + i + '" class="btn ' + _class + '" href="' + href + '"><span class="btn-txt">' + label + '</span></a>');
            
            callbacks[i] = callback;
        }
        /* $弹出操作解析 */
       
       
        /* ^弹出内容拼接*/
        buttons = buttons.join('');
        parts.push('<div class="modal J-dialog-modal">');
        if (options['header']) {
            if (typeof options['close'] == 'undefined' || options['close']) {
                closeButton = '<a href="' + _defaultHref + '" class="close"><i class="ico-font">&#xe604;</i></a>';
            }
            parts.push('<div class="modal-header"><h2>' + options['header'] + '</h2>' + closeButton + '</div>');
        }
        parts.push("<div class='modal-body'></div>");
        if (buttons) {
            parts.push("<div class='modal-foot'>" + buttons + "</div>");
        }
        parts.push("</div>");
        /* $弹出内容拼接*/
       
        
        /* ^生成jQuery modal对象, 并且塞进内容*/
        modalDiv = $(parts.join("\n"));

        optionalClasses = (typeof options.classes === 'undefined') ? _classes : options.classes;
        if (optionalClasses) {
            modalDiv.addClass(optionalClasses);
        }
        modalDiv.find(".modal-body").html(str);
        /* ^生成jQuery modal对象, 并且塞进内容*/
        
        
        /* ^jQuery modal对象事件绑定*/
        function onCancel(source) {
            modal.hide();
        }

        // 绑定关闭按钮事件
        modalDiv.on('click', 'a.close', function(e) {
            e.preventDefault();
            onCancel('close');
        });
        

        // 绑定完全隐藏事件
        modalDiv.on('hidden', function() {
            /* fixed iframe input focus bug */
            if(modalDiv.find('iframe').length){
                $(document).find('input:first').focus();
            }
            modalDiv.remove();
        });

        // 底部按钮单击事件绑定
        modalDiv.on('click', '.modal-foot a', function(e) {
            var $btn = $(this),
                handle = callbacks[$btn.data('handler')],
                rst
            ;
            
            if(handle && typeof handle === 'function'){
                rst = handle.call($btn);
            }
            
            if(rst !== false){
                modal.hide();
            }
            
        });
        /* $jQuery modal对象事件绑定*/
        // 页面渲染
        $("body").append(isIE6 ? modalDiv.css({
            'position': 'absolute'
        }) :  modalDiv);
        
        
        // 创建一个Modal对象, 默认不可见状态
        modal = toggle(modalDiv, {
            show: false  // 显示控制交由可选参数控制
        });
        
        
        // Modal#show
        if (typeof options.show === 'undefined' || options.show === true) {
            modal.show();

            if(buttons){
                modalDiv.find('.btn:first').focus();
            }else{
                modalDiv.focus();
            }
        }
        
        // 返回Modal对象
        return modal;
    };


    /**
     * 
     * 根据语言文字转换
     * 
     * @param    str     关键字
     * @param    locale  语言环境(本地语言环境:zh)
     * 
     * @renturn{String}  转换结果 
     */
    function _translate(str, locale) {
        if (typeof locale === 'undefined') {
            locale = _locale;
        }
        if (typeof _locales[locale][str] === 'string') {
            return _locales[locale][str];
        }

        if (locale != _defaultLocale) {
            return _translate(str, _defaultLocale);
        }

        return str;
    }

    
    /**
     *
     * 模态{Modal}构造函数
     * 
     * @param  node           目标触发元素
     * @param  options        可选参数
     * 
     * @return Button       构造对象
     *  
     */
    function Modal(node, options){
        this.node = node;
        this.options = S.mix({} ,defaultOptions ,options, true);
        this._init();
    }
    
    
    // 构造函数原型对象
    Modal.prototype = {
        constructor: Modal,
        
        show: function(){
            var self = this,
                $node = this.node,
                event = $.Event('show'),
                
                isShown = !!this._isShown
            ;
            $node.trigger(event);  // 触发show事件
            
            if(isShown){
                return;
            }
            this._isShown = true;
            $node.addClass(MODAL_OPEN_CLASSNAME);
            this._showBackdrop(function(){
                $node.trigger('shown'); // 触发shown事件
            });
        },
        
        hide: function(data){
            var self = this,
                $node = this.node,
                event = $.Event('hide'),
                
                isShown = !!this._isShown
            ;
            $node.trigger(event);  // 触发hide事件
            
            if(!isShown){
                return;
            }
            this._isShown = false;
            $node.removeClass(MODAL_OPEN_CLASSNAME);
            this._hideBackdrop(function(){
                self._$backdrop.remove(); // 遮掩层从dom中删除
                $node.trigger('hidden', data); // 触发hiden事件
            });
        },
        
        _$backdrop: null,
        
        _init: function(){
            // TODO
        },
        
        _isShown: 0,
        
        _showBackdrop: function(callback){
            
            this._$backdrop = (isIE6 ? $('<iframe class="modal-cover" onselectstart="return false;"></iframe>') : $('<div class="modal-cover"></div>')).css(isIE6 ? {'position': 'absolute', 'height': $(global).height()} : {}).appendTo(document.body);
            
            if(callback && typeof callback === 'function'){
                callback();
            }
        },
        
        _hideBackdrop: function(callback){
            this._$backdrop.hide(0, function(){
                callback();
            });
        }
        
    }
    
    
    // Modal对象生成函数
    toggle = function(node, options) {
        
        var $node = $(node),
            args = arguments,
            argsLength = args.length,
            modal
        ;
        if(!$node.length){
            return;
        }
        modal = $node.data(MODAL_DATA_CACHE);
        
        if (!modal) {
            $node.data(MODAL_DATA_CACHE, ( modal = new Modal($node, options)))
        }
        
        return modal;
    }
    
    
    // 接口曝露
    // S.Modal = that;
    return that;
    
})