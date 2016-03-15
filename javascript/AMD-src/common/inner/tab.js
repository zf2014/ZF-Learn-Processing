define(['jquery', 'utils', 'common/fast-jquery', 'common/dom'], function($, S, $$, $dom){

	var tbItemActiveCn = 'tb-item__active',
		tcItemActiveCn = 'tc-item__active';



	var Tab = function(node){
		this.node = $(node);
		this.activedTBItem = null;
		this.init();
	}

	Tab.prototype = {
		constructor: Tab,
		init: function(){
			var $node = this.node,
				firstActiveTbItem,
				self = this
			;

			firstActiveTbItem = $node.find('.' + tbItemActiveCn + '[data-tab-target]');
			if(!firstActiveTbItem.length){
				firstActiveTbItem = $node.find('[data-tab-target]:first');
			}

			$node.on('click', '[data-tab-target]', function(){
				if(this === self.activedTBItem){
					return false;
				}
				self.__doActive(this);
				return false;
			})
			this.__doActive(firstActiveTbItem[0]);

		},
		__doActive: function(tbItem){
			var $tbItem = $$(tbItem),
				$tcItem
			;
			if(!$tbItem.hasClass(tbItemActiveCn)){
				$tbItem.addClass(tbItemActiveCn);
			}
			$tcItem = this.__getTCItemByTBItem(tbItem);

			if(this.activedTBItem){
				this.__doInvalid(this.activedTBItem);
			}
			this.activedTBItem = tbItem;

			$tcItem.addClass(tcItemActiveCn);
		},
		__doInvalid: function(tbItem){
			var $tbItem = $$(tbItem),
				$tcItem
			;
			if($tbItem.hasClass(tbItemActiveCn)){
				$tbItem.removeClass(tbItemActiveCn);
			}
			$tcItem = this.__getTCItemByTBItem(tbItem);
			$tcItem.removeClass(tcItemActiveCn);
			this.activedTBItem = null;
		},

		__getTCItemByTBItem: function(tbItem){
			var $tbItem = $$(tbItem);
			return $($tbItem.data('tabTarget'))
		}




	};
	

	(function INIT(){
		var $tabs = $dom.find('.J-tab');
		S.each($tabs, function(tab){
			new Tab(tab);
		})
	})();



	return Tab;

})