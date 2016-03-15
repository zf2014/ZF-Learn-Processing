define(['jquery', 'utils', 'common/fast-jquery'], function($, S, $$){
	var $dom = $(document),

		btnHoverClassname = 'btn_is-hover',
		btnPressClassname = 'btn_is-press'
	;


	$dom.on('mouseenter', '.J-btn', function(){
		$$(this).addClass(btnHoverClassname);
	});

	$dom.on('mouseleave', '.J-btn', function(){
		$$(this).removeClass(btnHoverClassname);
	});

	$dom.on('mousedown', '.J-btn', function(){
		$$(this).addClass(btnPressClassname);
	});

	$dom.on('mouseup', '.J-btn', function(){
		$$(this).removeClass(btnPressClassname);
	});

})