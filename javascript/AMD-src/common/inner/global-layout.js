define(['jquery'], function($){

	var gWidth = 925,
		$html = $('html'),
		$win = $(window),

		width,
		smallLayoutClassname = 'layout925'

	;


	// window.setInterval(function(){
	// 	width = $win.width();
	// 	if(width < gWidth){
	// 		$html.addClass(smallLayoutClassname)
	// 	}
	// }, 200);
	

	function init(){
		width = $win.width();
		if(width < gWidth){
			$html.addClass(smallLayoutClassname)
		}

		monitor();
	}

	function monitor(){
		$win.on('resize', function(){
			width = $win.width();
			if(width < gWidth){
				$html.addClass(smallLayoutClassname)
			}else{
				$html.removeClass(smallLayoutClassname)
			}
		});
	}

	init();
})