define(['jquery', 'utils', 'common/fast-jquery', 'common/modal', 'common/dom'], function($, S, $$, modal, $dom){

	var viewObj = {};
	var template = S.template('<iframe src="<@= url@>" frameborder="0" style="width: <@= width@>px;height: <@= height@>px;"></iframe>');
	var $row;

	viewObj.dialog = function(target, url, opts){
		$dom.on('click', target, function(){
			var dialog,
				dialogCssObj,
				dialogOpt,

				$checkboxes,
				viewId,
				viewUrl = url
			;

			$checkboxes = findChecked();

			if($checkboxes.length){
				$row = $checkboxes.closest('tr');
			}

			dialogCssObj = {
				// 保证弹出框大小跟实际的一致
				// 2: 边线; 36: 标题高度
				height: opts.height + 2 + 36,
				// 2: 边线
				width: opts.width + 2
			};
			dialogCssObj['margin-top'] = -(dialogCssObj.height/2);
			dialogCssObj['margin-left'] = -(dialogCssObj.width/2);
			dialogParams = $$(this).data('dialog-params') || '';
			if(dialogParams){
				viewUrl = url + ( /\?/.test( url ) ? "&" : "?" ) + dialogParams;
			}else if($checkboxes.length){
				viewId = $checkboxes.val();
				viewUrl = url + ( /\?/.test( url ) ? "&" : "?" ) + 'id=' + viewId;
			}
			dialogOpt = {
				url: viewUrl,
				height: opts.height,
				width: opts.width
			};

			window.currentDialog = dialog = modal.dialog(template(dialogOpt), [], {
				header: opts.title || '查看功能'
			});

			dialog.node.css(dialogCssObj);

			dialog.node.on('hidden', function(event, data){
				// TODO 数据验证
				if(!!data){
					// 如果有数据
					opts.callback(data);
				}
				window.currentDialog = null;
				$row = null;

			});
		});
	}

	function findChecked(){
		return $('.J-checkbox-one:checked');
	}

	return viewObj;


})