define(['jquery', 'utils', 'common/fast-jquery', 'common/io'], function($, S, $$, io){

	var $dom = $(document),
		$resultContainer
	;
	

	// 分页
    $dom.on('click', '.J-page-btn', (function(){
        var $pageBtn,
            $page,
            $target,
            $skipInput,
            pageCount,
            current,
            params,
            targetFormParamstr
        ;


       	function init(pageBtnEle){
       		$pageBtn = $$(pageBtnEle);
	        $page = $pageBtn.closest('.J-page');
	        $skipInput = $page.find('input[id = currPage]:first');
	        params = S.qs.parse($page.data('params') || '');
	        $target = $(document.getElementById(params.target));
	        targetFormParamstr = $target.serialize();
	        pageCount = +document.getElementById('__pageCount').value;
	        current = params.current;
            setResultContainerByTarget(pageBtnEle);
       	}


        function adjustSkipInput(){
            var oldNum = +$skipInput.val(),
                newNum
            ;
            // 通过确认按钮进行分页
            if($pageBtn.hasClass('pageskip-btn')){

                if(!S.isNumber(oldNum) || oldNum < 1){
                    newNum = 1;    
                }else{
                    newNum = oldNum > pageCount ? pageCount : oldNum;
                }
            }
            // 通过页码进行分页
            else{
                newNum = +$pageBtn.data('num');
            }

            $skipInput.val(newNum);
        }


        function doRequestBefore(){
            // 置顶
            if(params.isTop === 'true'){
                window.scrollTo(0, 0);
            }
            adjustSkipInput();
            waitLoading();

        }

        function doRequest(){
            io.form($page, {
                url: params.url,
                data: targetFormParamstr,
                // dataType: 'json',
                type: 'POST'
            }, function(rst){
                if(rst.code === 0){
                    appendRst(rst.rst.html);
                }
            });
        }
        
       	return function(){
	        init(this);
            doRequestBefore();
        	doRequest();
       	};

    })());

    // 查询
    $dom.on('click', '.J-searchBtn', function(){
        var $submitBtn = $$(this),
            $form = $submitBtn.closest('form')
        ;
        setResultContainerByTarget(this);
        waitLoading();
        io.form($form, {}, function(rst){
            if(rst.code === 0){
                appendRst(rst.rst.html);
            }
        });
        return false;
    });
	
    // 重置
    $dom.on('click', '.J-resetBtn', function(){
        var $resetBtn = $$(this),
        $form = $resetBtn.closest('form');
        $form[0].reset();
    });


    window.waitLoading = function(){
        setResultContainerByTarget();
        waitLoading();
    }


    /*****************************************************
     *              
     *          工具类函数
     *              
     *****************************************************/
    function waitLoading(){
        $resultContainer.empty();
        var loadingContent = '<div class="result-loading-content"></div>';
        if($resultContainer[0].tagName === 'TBODY'){
            var colSpan = 1,
                $thead
            ;
            $thead = $resultContainer.prev('thead');
            
            if($thead && $thead.length){
                colSpan = ($thead.find('tr th').length) || colSpan;
            }
            loadingContent = '<tr class="tr__is-loading"><td colspan="'+colSpan+'"><div class="result-loading-content"></div></td></tr>';
        }
        $resultContainer.append(loadingContent);
    
    }

    function appendRst(content){
        $resultContainer.empty().append(content);
        unsetResultContainer();
    }

    function setResultContainerByTarget(target){
        var $result;
        $result = $$(target).closest('.J-resultContainer');
        if(!$result.length){
            $result = $('#J-resultContainer');
        }
        $resultContainer = $result;
    }

    function unsetResultContainer(){
        $resultContainer = null;   
    }

})