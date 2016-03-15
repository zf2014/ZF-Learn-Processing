define(['jquery', 'utils', 'common/fast-jquery', 'common/dom', 'common/validation'], function($, S, $$, $dom, validation){

	var validator;

	// 增加
	$dom.on('click', '.J-addRowBtn', function(){
		var $container = $$(this).closest('.J-dynRowContainer'),
			template,
			$templateContainer,
			$tr
		;

		if(!$container.length){
			return;
		}

		template = $container.data('loaded-template') || false;

		if(template === false){
			$templateContainer = $$(this).siblings('.J-dynAppendRowTemplate:first');
			if(!$templateContainer.length){
				return;
			}

			template = S.template($templateContainer.val(), null, {
				evaluate : /<%([\s\S]+?)%>/g,
				interpolate : /<%=([\s\S]+?)%>/g
			});

			$container.data('loaded-template', template);
			
			$templateContainer.remove();
		}

		($tr = $(template()).appendTo($container)).find('input:first').focus();

		// 添加验证规则
		$tr.find('.J-vldBTInp').each(function(idx){
			if(!validator){
				validator = validation($$(this).closest('form'));
			}
			validator.addItem(this);
		})
		
		return false
	})



	// 删除模块
	;(function(){
		$dom.on('click', '.J-delRowBtn', function(){
			var $thatRow = $$(this).closest('.J-dynThatRow'),
				canDelete
			;
			canDelete = $thatRow.siblings().size() > 0 ? true:false
			if(canDelete){

				// 删除验证规则
				$thatRow.find('.J-vldBTInp').each(function(){
					if(validator){
						validator.removeItem(this);
					}
				});

				$thatRow.remove();
			}
			return false;
		});
	}())




})