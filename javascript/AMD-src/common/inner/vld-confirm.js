define(['jquery', 'utils', 'common/fast-jquery', 'common/confirm', 'common/modal'], function($, S, $$, confirm, modal){

	var $thatForm = confirm.confirm('#J-vldFormSubmitBtn', function(data){
		var that = this;
		if(data.code === 0){
			modal.alert('保存成功！', function(){
				window.location.href = $$(that).data('redirect');
			});
		}else{
			modal.alert('保存失败！');
		}
	}, true)

})