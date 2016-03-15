define(['jquery', 'utils', 'common/fast-jquery', 'common/dom'], function($, S, $$, $dom){
	
	var $btn = $('#J-unfoldBtn'),
		$html
	;

	if(!$btn.length){
		return;
	}

	$html = $('html');

	$btn.click(function(){
		$html.toggleClass('content-expanded');		
	});

});
