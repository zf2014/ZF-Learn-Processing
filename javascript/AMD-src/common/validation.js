/**
 *
 *  @desc: 表单验证
 *
 *  @author: qzzf1987@gmail.com
 *
 *  @create: 2013-06-03
 *
 *  @last: 2013-06-03
 */
define(['jquery', 'utils', 'common/io'], function($, S, io){
    'use strict';
    var global = window,
        VALIDATION_DATA_CACHE = 'Z.data.validator',
        VALIDATION_EVENT_NAMESPACE = '.Z.event.validator',
        // VALIDATION_ERRORLIST_CLASSNAME = 'error',

        // 默认配置项
        defaultOptions = {
            inputs : 'input, textarea, select',                             // 可支持验证的表单控件
            excluded : 'input[type=hidden], input[type=file], :disabled',   // 不支持验证的表单控件
            trigger : false,                    // 注册验证事件
            animate : false,                    // 错误提示动画效果
            animateDuration : 300,              // 提示间隔
            focus : 'first',                    // 有错误时, 聚焦输入框的位置
            validationMinlength : 3,            // 最短验证长度
            successClass : 'validate-inp-success',  // 验证通过的样式
            errorClass : 'validate-inp-error',      // 验证失败的样式
            errorHintClass: 'error',
            errorMessage : false,               // 
            validators : {},                    // 自定义验证规则
            showErrors : true,                  // 是否显示错误提示
            messages : {},                      // 自定义验证错误提示
            validateIfUnchanged : false,        // 如果未作任何修改, 是否需要重修验证
            interrupt: false,
            /* 具体控制如何展示错误提示 **/
            errors : { 
                /**
                 *
                 * 自定义错误状态{class}操作元素, 默认为当前字段元素
                 * 
                 * @param  elem                     可选参数
                 * @param  isRadioOrCheckbox        可选参数
                 *   
                 * @return Element
                 *  
                 */                                                     
                classHandler : function(elem, isRadioOrCheckbox) {},
                container : function(elem, isRadioOrCheckbox) {},
                errorsWrapper : '<ul></ul>',
                errorElem : '<li class="validate-hint-error"></li>'
            },
            listeners : {
                onFieldValidate : function(elem, ValidateForm) {
                    return false;
                },
                onFormSubmit : function(isFormValid, event, ValidateForm) {
                },
                onFieldError : function(elem, constraints, ValidateField) {
                },
                onFieldSuccess : function(elem, constraints, ValidateField) {
                }
            }
        },
        toggle
    ;

    /**
     *
     * Validator构造函数. 提供默认操作和对应错误提示文本
     * 
     * @param  options        可选参数
     *   
     * @return Validator
     *  
     */
    var Validator = function(options) {
        
        // 默认错误提示
        this.messages = {
            defaultMessage : "无效字段！",
            // 输入框字段类型
            type : {
                email : "请输入有效的邮箱地址！",
                url : "请输入有效的URL地址！",
                urlstrict : "请输入有效的URL地址！",
                number : "请输入有效的数值！",
                digits : "请输入有效的数字！",
                dateIso : "请输入有效的日期格式 (YYYY-MM-DD)！",
                alphanum : "请输入有效的字符或数字！",
                phone : "请输入有效的手机号码！"
            },
            notnull : "该字段不能为空！",
            notblank : "该字段不能为空！",
            required : "该字段不能为空！",
            regexp : "该字段无法正确匹配！",
            min : "该字段值不能小于 %s！",
            max : "该字段值不能大于 %s！",
            range : "该字段值应该大于%s 且小于 %s！",
            minlength : "该字段长度不能小于 %s！",
            maxlength : "该字段长度不能大于 %s！",
            rangelength : "该字段长度应该大于%s 且小于 %s！",
            mincheck : "该字段长度不能小于 %s！",
            maxcheck : "该字段长度不能大于 %s！",
            rangecheck : "该字段长度应该大于%s 且小于 %s！",
            equalto : "该字段值不一致！",
            remote: "验证失败"
        }; 
        this.init(options);
    };

    // 原型对象
    Validator.prototype = {

        constructor : Validator,

        // 验证规则空间, 确定哪些规则可用
        validators : {
            // 字段值的长度是否大于0
            notnull : function(val) {
                return val.length > 0;
            },

            // 字段不能为空字符
            notblank : function(val) {
                return 'string' === typeof val && '' !== val.replace(/^\s+/g, '').replace(/\s+$/g, '');
            },

            // 必须输入
            required : function(val) {

                if ('object' === typeof val) {
                    for (var i in val ) {
                        if (this.required(val[i])) {
                            return true;
                        }
                    }

                    return false;
                }
                
                
                return this.notnull(val) && this.notblank(val);
            },

            // 字段类型验证(number | digits | alphanum | email | url | urlstrict | dateIso | phone)            
            type : function(val, type) {
                var regExp;

                switch ( type ) {
                    case 'number':
                        regExp = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
                        break;
                    case 'digits':
                        regExp = /^\d+$/;
                        break;
                    case 'alphanum':
                        regExp = /^\w+$/;
                        break;
                    case 'email':
                        regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
                        break;
                    case 'url':
                        val = new RegExp('(https?|s?ftp|git)', 'i').test(val) ? val : 'http://' + val;
                    case 'urlstrict':
                        regExp = /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                        break;
                    case 'dateIso':
                        regExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/;
                        break;
                    case 'phone':
                        regExp = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
                        break;
                    default:
                        return false;
                }

                return '' !== val ? regExp.test(val) : false;
            },

            // 正则验证
            regexp : function(val, regExp, self) {
                return new RegExp(regExp, self.options.regexpFlag || '').test(val);
            },

            // 最小长度验证
            minlength : function(val, min) {
                return val.length >= min;
            },

            // 最大长度验证
            maxlength : function(val, max) {
                return val.length <= max;
            },

            // 长度范围验证
            rangelength : function(val, arrayRange) {
                return this.minlength(val, arrayRange[0]) && this.maxlength(val, arrayRange[1]);
            },

            // 最小值验证
            min : function(val, min) {
                return Number(val) >= min;
            },

            // 最大值验证
            max : function(val, max) {
                return Number(val) <= max;
            },

            // 数值值范围验证
            range : function(val, arrayRange) {
                return val >= arrayRange[0] && val <= arrayRange[1];
            },

            // 是否一致验证
            equalto : function(val, elem, self) {
                self.options.validateIfUnchanged = true;

                return val === $(elem).val();
            },

            // 异步验证
            remote : function(val, url, self) {
                var result = null, data = {}, dataType = {};

                data[ self.$element.attr('name')] = val;

                if ('undefined' !== typeof self.options.remoteDatatype) {
                    dataType = {
                        dataType : self.options.remoteDatatype
                    };
                }

                var manage = function(isConstraintValid, message) {
                    if ('undefined' !== typeof message && 'undefined' !== typeof self.Validator.messages.remote && message !== self.Validator.messages.remote) {
                        $(self.ulError + ' .remote').remove();
                    }

                    self.updtConstraint({
                        name : 'remote',
                        valid : isConstraintValid
                    }, message);
                    
                    if (self.options.showErrors) {
                    	self.manageValidationResult();
                    }
                    
                    if(isConstraintValid){
                    	self.options.listeners.onFieldSuccess(self.element, self.constraints, self);
                    }else{
                    	self.options.listeners.onFieldError(self.element, self.constraints, self);
                    }
                };

                var handleResponse = function(response) {
                    if ('object' === typeof response) {
                        return response;
                    }

                    try {
                        response = $.parseJSON(response);
                    } catch ( err ) {
                    }

                    return response;
                }
                var manageErrorMessage = function(response) {
                    return 'object' === typeof response && null !== response ? ('undefined' !== typeof response.error ? response.error : ('undefined' !== typeof response.message ? response.message : null ) ) : null;
                }

                io.request($.extend({}, {
                // $.ajax($.extend({}, {
                    url : url,
                    data : data,
                    type : self.options.remoteMethod || 'GET',
                    success : function(response) {
                        response = handleResponse(response);
                        manage(1 === response || true === response || ('object' === typeof response && null !== response && response.messageType !== "0"  ), manageErrorMessage(response));
                    },
                    error : function(response) {
                        response = handleResponse(response);
                        manage(false, manageErrorMessage(response));
                    }
                }, dataType));

                return result;
            },

            /** 别名 */
            mincheck : function(obj, val) {
                return this.minlength(obj, val);
            },
            maxcheck : function(obj, val) {
                return this.maxlength(obj, val);
            },
            rangecheck : function(obj, arrayRange) {
                return this.rangelength(obj, arrayRange);
            }
        },

        // 注册自定义验证规则
        init : function(options) {
            var customValidators = options.validators, customMessages = options.messages;

            var key;
            for (key in customValidators ) {
                this.addValidator(key, customValidators[key]);
            }

            for (key in customMessages ) {
                this.addMessage(key, customMessages[key]);
            }
        },

        // 信息格式化
        formatMesssage : function(message, args) {

            if ('object' === typeof args) {
                for (var i in args ) {
                    message = this.formatMesssage(message, args[i]);
                }

                return message;
            }

            return 'string' === typeof message ? message.replace(new RegExp('%s', 'i'), args) : '';
        },

        // 新增或覆盖验证操作
        addValidator : function(name, fn) {
            this.validators[name] = fn;
        },


        // 新增或覆盖错误提示文本
        addMessage : function(key, message, type) {

            if ('undefined' !== typeof type && true === type) {
                this.messages.type[key] = message;
                return;
            }

            if ('type' === key) {
                for (var i in message ) {
                    this.messages.type[i] = message[i];
                }

                return;
            }

            this.messages[key] = message;
        }
    };

    /**
     *
     * ValidateField构造函数. 单个字段验证
     * 
     * @param  element          字段元素
     * @param  options          可选参数
     * @param  type             字段类型(单个或者多个)
     *   
     * @return ValidateField
     *  
     */
    var ValidateField = function(element, options, type) {
        this.options = options;
        this.Validator = new Validator(options);

        if (type === 'ValidateFieldMultiple') {
            return this;
        }

        this.init(element, type || 'ValidateField');
    };

    ValidateField.prototype = {

        constructor : ValidateField,

        // 属性设置及绑定事件
        init : function(element, type) {
            this.type = type;
            this.valid = true;
            this.element = element;
            this.validatedOnce = false;
            this.$element = $(element);
            this.val = this.$element.val();
            this.isRequired = false;
            this.constraints = {};

            // 如果该元素radio或者是checkbox, 那么将修改此属性
            if ('undefined' === typeof this.isRadioOrCheckbox) {
                this.isRadioOrCheckbox = false;
                this.hash = this.generateHash();
                this.errorClassHandler = this.options.errors.classHandler(element, this.isRadioOrCheckbox) || this.$element;
            }

            this.ulErrorManagement();

            this.bindHtml5Constraints();

            // 根据options属性来控制验证规则
            this.addConstraints();

            // 如果该字段存在限制规则, 则需要进行事件的绑定
            if (this.hasConstraints()) {
                this.bindValidationEvents();
            }
        },
        setParent : function(elem) {
            this.$parent = $(elem);
        },
        getParent : function() {
            return this.$parent;
        },

        // html5验证规则
        bindHtml5Constraints : function() {
            if (this.$element.hasClass('required') || this.$element.prop('required')) {
                this.options.required = true;
            }

            // 如果是非纯文本输入框
            if ('undefined' !== typeof this.$element.attr('type') && new RegExp(this.$element.attr('type'), 'i').test('email url number range')) {
                this.options.type = this.$element.attr('type');

                if (new RegExp(this.options.type, 'i').test('number range')) {
                    this.options.type = 'number';

                    if ('undefined' !== typeof this.$element.attr('min') && this.$element.attr('min').length) {
                        this.options.min = this.$element.attr('min');
                    }

                    if ('undefined' !== typeof this.$element.attr('max') && this.$element.attr('max').length) {
                        this.options.max = this.$element.attr('max');
                    }
                }
            }

            // 正则表达式
            if ('string' === typeof this.$element.attr('pattern') && this.$element.attr('pattern').length) {
                this.options.regexp = this.$element.attr('pattern');
            }
        },

        addConstraints : function() {
            for (var constraint in this.options ) {
                var addConstraint = {};
                addConstraint[constraint] = this.options[constraint];
                this.addConstraint(addConstraint, true);
            }
        },

        // 记录规则
        addConstraint : function(constraint, doNotUpdateValidationEvents) {
            for (var name in constraint ) {
                name = name.toLowerCase();

                if ('function' === typeof this.Validator.validators[name]) {
                    this.constraints[name] = {
                        name : name,                        // 规则名称
                        requirements : constraint[name],    // 规则限制
                        valid : null                        // 
                    }

                    if (name === 'required') {
                        this.isRequired = true;
                    }

                    this.addCustomConstraintMessage(name);
                }
            }

            // 是否需要绑定事件
            if ('undefined' === typeof doNotUpdateValidationEvents) {
                this.bindValidationEvents();
            }
        },

        // 规则修改
        updateConstraint : function(constraint, message) {
            for (var name in constraint ) {
                this.updtConstraint({
                    name : name,
                    requirements : constraint[name],
                    valid : null
                }, message);
            }
        },

        // 规则修改
        updtConstraint : function(constraint, message) {
            this.constraints[constraint.name] = S.mix({}, this.constraints[constraint.name], constraint, true);

            if ('string' === typeof message) {
                this.Validator.messages[constraint.name] = message;
            }

            this.bindValidationEvents();
        },

        // 规则删除
        removeConstraint : function(constraintName) {
            var constraintName = constraintName.toLowerCase();
            delete this.constraints[constraintName];

            if (constraintName === 'required') {
                this.isRequired = false;
            }

            if (!this.hasConstraints()) {
                if ('ValidateForm' === typeof this.getParent()) {
                    this.getParent().removeItem(this.$element);
                    return;
                }

                this.destroy();
                return;
            }

            this.bindValidationEvents();
        },

        // 添加规则提示
        addCustomConstraintMessage : function(constraint) {

            var customMessage = constraint + 
                                ('type' === constraint && 'undefined' !== typeof this.options[constraint] ? 
                                    this.options[constraint].charAt(0).toUpperCase() + this.options[constraint].substr(1) 
                                        : 
                                    '' 
                                ) + 'Message';

            if ('undefined' !== typeof this.options[customMessage]) {
                this.Validator.addMessage('type' === constraint ? this.options[constraint] : constraint, this.options[customMessage], 'type' === constraint);
            }
        },

        // 事件注册
        bindValidationEvents : function() {

            this.valid = null;

            // this.$element.addClass('Validate-validated');

            // 之前注册的所有事件
            this.$element.off('.' + this.type);

            // 异步验证, 注册change事件
            if (this.options.remote && !new RegExp('change', 'i').test(this.options.trigger)) {
                this.options.trigger = !this.options.trigger ? 'change' : ' change';
            }

            // 自定义事件注册(不提供则用keyup)
            var triggers = (!this.options.trigger ? 'keyup' : this.options.trigger );
            // var triggers = (!this.options.trigger ? '' : this.options.trigger ) + (new RegExp('key', 'i').test(this.options.trigger) ? '' : ' keyup' );


            // 如果是select标签, 默认注册change事件
            if (this.$element.is('select')) {
                triggers += new RegExp('change', 'i').test(triggers) ? '' : ' change';
            }

            // 去空白
            triggers = triggers.replace(/^\s+/g, '').replace(/\s+$/g, '');

            // 注册
            this.$element.on((triggers + ' ' ).split(' ').join('.' + this.type + ' '), false, $.proxy(this.eventValidation, this));
        },

        // 生成hash值
        generateHash : function() {
            return 'Validate-' + (Math.random() + '' ).substring(2);
        },

        // 返回hash值
        getHash : function() {
            return this.hash;
        },

        // 返回字段值
        getVal : function() {
            return S.trim(this.$element.data('value') || this.$element.val());
        },

        // 事件适配器
        eventValidation : function(event) {
            var val = this.getVal();

//            if (event.type === 'keyup' && !/keyup/i.test(this.options.trigger) && !this.validatedOnce) {
//                return true;
//            }
//
//            if (event.type === 'change' && !/change/i.test(this.options.trigger) && !this.validatedOnce) {
//                return true;
//            }
//
//            if (!this.isRadioOrCheckbox && val.length < this.options.validationMinlength && !this.validatedOnce) {
//                return true;
//            }

            this.validate();
        },

        // 该字段是否通过验证
        isValid : function() {
            return this.validate(false);
        },

        // 是否存在验证规则
        hasConstraints : function() {
            for (var constraint in this.constraints ) {
                return true;
            }

            return false;
        },

        // 验证和错误展示
        validate : function(errorBubbling) {
            var val = this.getVal(), valid = null;

            // do not even bother trying validating a field w/o constraints
            if (!this.hasConstraints()) {
                return null;
            }

            // reset Validate validation if onFieldValidate returns true, or if field is empty and not required
            if (this.options.listeners.onFieldValidate(this.element, this) || ('' === val && !this.isRequired )) {
                this.reset();
                return null;
            }

            // do not validate a field already validated and unchanged !
            if (!this.needsValidation(val)) {
                return this.valid;
            }

            valid = this.applyValidators();

            if ('undefined' !== typeof errorBubbling ? errorBubbling : this.options.showErrors) {
                this.manageValidationResult();
            }

            return valid;
        },

        // 当字段变化后是否需要重新验证
        needsValidation : function(val) {
            if (!this.options.validateIfUnchanged && this.valid !== null && this.val === val && this.validatedOnce) {
                return false;
            }

            this.val = val;
            return this.validatedOnce = true;
        },

        // 逐个规则验证, 记录每个验证结果, 且依次事件形式反馈.
        applyValidators : function() {
            var valid = null;

            for (var constraint in this.constraints ) {
                var result = this.Validator.validators[ this.constraints[ constraint ].name ](this.val, this.constraints[constraint].requirements, this);
                if (false === result) {
                    valid = false;
                    this.constraints[constraint].valid = valid;

                    
                    // @qzzf1987@gmail.com 2015/04/17 (避免多次错误验证)
                    // 一旦发现错误, 立即打断
                    if(this.options.interrupt){
                        this.options.listeners.onFieldError(this.element, this.constraints[ constraint ], this);
                        return valid;
                    }

                    this.options.listeners.onFieldError(this.element, this.constraints, this);
                    
                } else if (true === result) {
                    this.constraints[constraint].valid = true;
                    valid = false !== valid;
                    this.options.listeners.onFieldSuccess(this.element, this.constraints, this);
                }else{
                	valid = null;
                	this.constraints[constraint].valid = false;
                }
            }

            return valid;
        },

        // 统一管理验证结果
        manageValidationResult : function() {
            var valid = null;

            for (var constraint in this.constraints ) {
                if (false === this.constraints[constraint].valid) {

                    if(this.options.interrupt){
                        this.ulTemplate.empty();
                    }

                    this.manageError(this.constraints[constraint]);
                    valid = false;

                    if(this.options.interrupt){
                        this.valid = valid;
                        return valid;
                    }


                } else if (true === this.constraints[constraint].valid) {
                    this.removeError(this.constraints[constraint].name);
                    valid = false !== valid;
                }
            }

            this.valid = valid;

            if (true === this.valid) {
                this.removeErrors();
                this.errorClassHandler.removeClass(this.options.errorClass).addClass(this.options.successClass);
                return true;
            } else if (false === this.valid) {
                this.errorClassHandler.removeClass(this.options.successClass).addClass(this.options.errorClass);
                return false;
            }

            return valid;
        },

        // 列表展示验证结果
        ulErrorManagement : function() {
            this.ulError = '#' + this.hash;
            this.ulTemplate = $(this.options.errors.errorsWrapper).attr('id', this.hash).addClass(this.options.errorHintClass);
        },

        // 删除对应错误结果
        removeError : function(constraintName) {
            var liError = this.ulError + ' .' + constraintName, that = this;

            this.options.animate ? $(liError).fadeOut(this.options.animateDuration, function() {
                $(this).remove();

                if (that.ulError && $(that.ulError).children().length === 0) {
                    that.removeErrors();
                }
            }) : $(liError).remove();

            // remove li error, and ul error if no more li inside
            if (this.ulError && $(this.ulError).children().length === 0) {
                this.removeErrors();
            }
        },

        // 添加错误结果
        addError : function(error) {
            for (var constraint in error ) {
                var liTemplate = $(this.options.errors.errorElem).addClass(constraint);

                $(this.ulError).append(this.options.animate ? $(liTemplate).html(error[constraint]).hide().fadeIn(this.options.animateDuration) : $(liTemplate).html(error[constraint]));
            }
        },

        // 删除所有验证结果
        removeErrors : function() {
            this.options.animate ? $(this.ulError).fadeOut(this.options.animateDuration, function() {
                $(this).remove();
            }) : $(this.ulError).remove();
        },

        // 重置
        reset : function() {
            this.valid = null;
            this.removeErrors();
            this.validatedOnce = false;
            this.errorClassHandler.removeClass(this.options.successClass).removeClass(this.options.errorClass);

            for (var constraint in this.constraints ) {
                this.constraints[constraint].valid = null;
            }

            return this;
        },

        // 管理错误结果
        manageError : function(constraint) {
            // display ulError container if it has been removed previously (or never shown)
            if (!$(this.ulError).length) {
                this.manageErrorContainer();
            }

            // TODO: refacto properly
            // if required constraint but field is not null, do not display
            // if ('required' === constraint.name && null !== this.getVal() && this.getVal().length > 0) {
            //     return;
            //     // if empty required field and non required constraint fails, do not display
            // } else if (this.isRequired && 'required' !== constraint.name && (null === this.getVal() || 0 === this.getVal().length )) {
            //     return;
            // }

            // TODO: refacto error name w/ proper & readable function
            var constraintName = constraint.name, liClass = false !== this.options.errorMessage ? 'custom-error-message' : constraintName, liError = {}, message = false !== this.options.errorMessage ? this.options.errorMessage : (constraint.name === 'type' ? this.Validator.messages[ constraintName ][constraint.requirements] : ('undefined' === typeof this.Validator.messages[constraintName] ? this.Validator.messages.defaultMessage : this.Validator.formatMesssage(this.Validator.messages[constraintName], constraint.requirements) ) );
            // add liError if not shown. Do not add more than once custom errorMessage if exist
            if (!$(this.ulError + ' .' + liClass).length) {
                liError[liClass] = message;
                this.addError(liError);
            }
        },

        // 管理显示错误结果的容器
        manageErrorContainer : function() {
            var errorContainer = this.options.errorContainer || this.options.errors.container(this.element, this.isRadioOrCheckbox), ulTemplate = this.options.animate ? this.ulTemplate.show() : this.ulTemplate;

            if ('undefined' !== typeof errorContainer) {
                $(errorContainer).append(ulTemplate);
                return;
            }

            !this.isRadioOrCheckbox ? this.$element.after(ulTemplate) : this.$element.parent().after(ulTemplate);
        },

        addListener : function(object) {
            for (var listener in object ) {
                this.options.listeners[listener] = object[listener];
            }
        }
        /**
         * Destroy Validate field instance
         *
         * @private
         * @method destroy
         */,
        destroy : function() {
            // this.$element.removeClass('Validate-validated');
            this.reset().$element.off('.' + this.type).removeData(this.type);
        }
    };


    /**
     *
     * ValidateFieldMultiple构造函数. 多个字段验证{checkbox和radio}
     * 
     * @param  element          字段元素
     * @param  options          可选参数
     * @param  type             字段类型(单个或者多个)
     *   
     * @return ValidateField
     *  
     */
    var ValidateFieldMultiple = function(element, options, type) {
        this.initMultiple(element, options);
        this.inherit(element, options);
        this.Validator = new Validator(options);

        // call ValidateField constructor
        this.init(element, type || 'ValidateFieldMultiple');
    };

    ValidateFieldMultiple.prototype = {

        constructor : ValidateFieldMultiple,

        // 属性设置
        initMultiple : function(element, options) {
            this.element = element;
            this.$element = $(element);
            this.group = options.group || false;
            this.hash = this.getName();
            this.siblings = this.group ? '[data-group="' + this.group + '"]' : 'input[name="' + this.$element.attr('name') + '"]';
            this.isRadioOrCheckbox = true;
            this.isRadio = this.$element.is('input[type=radio]');
            this.isCheckbox = this.$element.is('input[type=checkbox]');
            this.errorClassHandler = options.errors.classHandler(element, this.isRadioOrCheckbox) || this.$element.parent();
        },

        // 从ValidateField继承操作属性
        inherit : function(element, options) {
            var clone = new ValidateField(element, options, 'ValidateFieldMultiple');

            for (var property in clone ) {
                if ('undefined' === typeof this[property]) {
                    this[property] = clone[property];
                }
            }
        },

        // 
        getName : function() {
            if (this.group) {
                return 'Validate-' + this.group;
            }

            if ('undefined' === typeof this.$element.attr('name')) {
                throw "A radio / checkbox input must have a data-group attribute or a name to be Validate validated !";
            }

            return 'Validate-' + this.$element.attr('name').replace(/(:|\.|\[|\])/g, '');
        },

        // 返回值
        getVal : function() {
            if (this.isRadio) {
                return $(this.siblings + ':checked').val() || '';
            }

            if (this.isCheckbox) {
                var values = [];

                $(this.siblings + ':checked').each(function() {
                    values.push($(this).val());
                });

                return values;
            }
        },

        // 事件绑定(覆盖ValidateField提供的操作)
        bindValidationEvents : function() {
            this.valid = null;
            // this.$element.addClass('Validate-validated');

            this.$element.off('.' + this.type);

            var self = this, triggers = (!this.options.trigger ? '' : this.options.trigger ) + (new RegExp('change', 'i').test(this.options.trigger) ? '' : ' change' );

            triggers = triggers.replace(/^\s+/g, '').replace(/\s+$/g, '');

            $(this.siblings).each(function() {
                $(this).on(triggers.split(' ').join('.' + self.type + ' '), false, $.proxy(self.eventValidation, self));
            })
        }
    };

    /**
     *
     * ValidateForm构造函数. 表单所有字段验证
     * 
     * @param  element          字段元素
     * @param  options          可选参数
     * @param  type             字段类型(单个或者多个)
     *   
     * @return ValidateField
     *  
     */
    var ValidateForm = function(element, options, type) {
        this.init(element, options, type || 'ValidateForm');
    };

    ValidateForm.prototype = {

        constructor : ValidateForm,

        // 初始化, 绑定submit操作
        init : function(element, options, type) {
            this.type = type;
            this.items = [];
            this.$element = $(element);
            this.options = options;
            var self = this;

            this.$element.find(options.inputs).each(function() {
                self.addItem(this);
            });

            this.$element.on('submit.' + this.type, false, $.proxy(this.validate, this));
        },

        addListener : function(object) {
            for (var listener in object ) {
                if (new RegExp('Field').test(listener)) {
                    for (var item = 0; item < this.items.length; item++) {
                        this.items[item].addListener(object);
                    }
                } else {
                    this.options.listeners[listener] = object[listener];
                }
            }
        },

        // 记录每个表单字段{ 实际上每个字段都会创建一个ValidateField对象 }
        addItem : function(elem) {
            if ($(elem).is(this.options.excluded)) {
                return false;
            }

            var ValidateField = toggle($(elem), this.options);
            ValidateField.setParent(this);

            this.items.push(ValidateField);
        },

        // 删除记录(该字段无需验证)
        removeItem : function(elem) {
            var ValidateItem = toggle($(elem), this.options);

            // identify & remove item if same Validate hash
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].hash === ValidateItem.hash) {
                    this.items[i].destroy();
                    this.items.splice(i, 1);
                    return true;
                }
            }

            return false;
        },

        // 执行验证
        validate : function(event) {
            var valid = true;
            this.focusedField = false;

            for (var item = 0; item < this.items.length; item++) {
                if ('undefined' !== typeof this.items[item] && false === this.items[item].validate()) {
                    valid = false;

                    if (!this.focusedField && 'first' === this.options.focus || 'last' === this.options.focus) {
                        this.focusedField = this.items[item].$element;
                    }
                }
            }

            // form is invalid, focus an error field depending on focus policy
            if (this.focusedField && !valid) {
                this.focusedField.focus();
            }

            this.options.listeners.onFormSubmit(valid, event, this);
            return valid;
        },

        // 是否验证通过
        isValid : function() {
            for (var item = 0; item < this.items.length; item++) {
                if (false === this.items[item].isValid()) {
                    return false;
                }
            }

            return true;
        },

        // 删除所有字段错误提示
        removeErrors : function() {
            for (var item = 0; item < this.items.length; item++) {
                // toggle(this.items[item], 'reset');
                this.items[item].reset();
            }
        },

        // 无需验证
        destroy : function() {
            for (var item = 0; item < this.items.length; item++) {
                this.items[item].destroy();
            }

            this.$element.off('.' + this.type).removeData(this.type);
        },

        // 所有字段重置
        reset : function() {
            for (var item = 0; item < this.items.length; item++) {
                this.items[item].reset();
            }
        }
    };


    return (function(){

        function bind($node, type, options, callback) {
            var ValidateInstance = $node.data(VALIDATION_DATA_CACHE);

            if (!ValidateInstance) {
                switch ( type ) {
                    case 'ValidateForm':
                        ValidateInstance = new ValidateForm($node, options, 'ValidateForm');
                        break;
                    case 'ValidateField':
                        ValidateInstance = new ValidateField($node, options, 'ValidateField');
                        break;
                    case 'ValidateFieldMultiple':
                        ValidateInstance = new ValidateFieldMultiple($node, options, 'ValidateFieldMultiple');
                        break;
                    default:
                        return;
                }

                $node.data(VALIDATION_DATA_CACHE, ValidateInstance);
            }

            
            if ('string' === typeof option && 'function' === typeof ValidateInstance[option]) {
                var response = ValidateInstance[ option ](fn);

                return 'undefined' !== typeof response ? response : $node;
            }

            return ValidateInstance;
        }

        toggle = function(node, option, callback){
            var $node = $(node),
                newInstance = null,
                options
            ;
            options = S.mix({}, defaultOptions, 'undefined' !== typeof global.ValidateConfig ? global.ValidateConfig : {}, option, $node.data(), true);
            // 如果是表单
            if ($node.is('form') || true === $node.data('bind')) {
                newInstance = bind($node, 'ValidateForm', options, callback);
            }
            // 如果是字段
            else if ($node.is(options.inputs) && !$node.is(options.excluded)) {
                newInstance = bind($node, (!$node.is('input[type=radio], input[type=checkbox]') ? 'ValidateField' : 'ValidateFieldMultiple'), options, callback);
            }
            return newInstance;
        }

        return toggle;

    })()
});
