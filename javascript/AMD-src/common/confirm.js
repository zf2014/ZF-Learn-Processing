define(['jquery', 'utils', 'common/fast-jquery', 'common/validation', 'common/io'], function($, S, $$, validation, io){

	// 表单验证
	var $submitBtn,
		$form,
		clickBtn,
		submitPrcessingClassname = 'submit-processing',
		validator,
		processing = false,
		validateSuccessClassname = 'success',
		validateErrorClassname = 'error',
		cb = S.NOOP,
		needVerify = false,
		needAsyn = true,
		obj = {}
	;

	function init(){
		$form = $submitBtn.closest('form');
		if(needVerify){
			_initValidator();
		}
		_bindSubmit();

		return $form;
	}

	function _bindSubmit(){
		$submitBtn.click(function(){
			if(processing === true){
				return false;
			}
			_btn2Prcessing(this);
			if(_validateForm()){
				_formSubmit(this);
			}else{
				_btn2Normal(this);
			}

			return false;
		})
	}

	function _initValidator(){
		validator = validation($form, {
			interrupt: true,
			errors: {
				container: function($elem, isRadio){
					return _getTipContainerByInp($elem);
				},
				errorsWrapper: '<p></p>',
				errorElem: '<span class="tip-txt"></span>'
			},
			listeners: {
				onFieldSuccess: function($elem, constraints, ValidateField){
					var $tip, bool;
					bool = S.every(constraints, function(constraint, key){
						return !!constraint.valid
					});
					if(bool){
						$tip = _getTipContainerByInp($elem);
						$tip.empty().append('<p class="success"><i class="ico-dui"></i></p>');
					}
				}
			}
		});
	}

	function _validateForm(){
		if(!needVerify){
			return true;
		}
		return validator.validate()
	}

	function _formSubmit(btn){
		
		var paramsStr = $$(btn).data('confirm-params') || '',
			paramsObj = S.qs.parse(paramsStr),
			formAction
		;
		if(needAsyn){
			io.form($form, {
				data: S.mix({}, paramsObj),
				complete: function(ajaxData){
					_btn2Normal(btn);
				}
			}, function(ajaxData){
				if(S.isFunction(cb)){
					cb.call(btn, ajaxData);
				}
			})
		}else{
			formAction = $form.attr('action');
			formAction = formAction + ( !!paramsStr ? (( /\?/.test( formAction ) ? "&" : "?" ) + paramsStr ) : '');
			$form.attr('action', formAction);
			$form.submit();
		}

	}

	function _getTipContainerByInp($inp){
		var $inpGroup = $inp.closest('.J-controllerInp'),
			$tip
		;

		if(!$inpGroup.length){
			$inpGroup = $inp.parent();
		}
		$tip = $inpGroup.siblings('.J-controllerTip:first').empty();

		if(!$tip.length){
			$tip = $('<div class="controller-tip J-controllerTip"></div>').insertAfter($inpGroup)
		}
		return $tip;
	}

	function _btn2Prcessing(btn){
		processing = true;
		$$(btn).addClass(submitPrcessingClassname);
	}

	function _btn2Normal(btn){
		$$(btn).removeClass(submitPrcessingClassname);
		processing = false;
	}




    /**
     *   
     *   确认操作
     *   
     */
	obj.confirm = function($btn, callback, vBool){

		if(S.isString($btn)){
			$btn = $($btn);
		}

		if(!$btn.length){
			return;
		}

		if(S.isFunction(callback)){
			cb = callback;
			needAsyn = true;
		}else{
			needAsyn = false;	
		}
		needVerify = !!vBool;

		$submitBtn = $btn.eq(0);
		return init();
	};

	return obj;
});