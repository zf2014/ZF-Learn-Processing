define(['jquery', 'utils', 'common/io'], function($, S, io){
	
	var Cxselect = function(cxSelectors, options){
		var that;
		if( !(this instanceof Cxselect) ){
			new Cxselect(cxSelectors, options)
			return;
		}
		that = this;
		this.size = cxSelectors.length;
		this.selectors = S.map(cxSelectors, function(selector, idx){
			var $select = typeof selector === 'string' ? $(selector) : selector;
			if($select.length > 1){
				$select = $select.eq(0);
			}
			if($select.length < 1 || !isSelect($select[0])){
				that._fail = true;
			}
			return {sel: $select, order: idx}
		});
		this.options = options || {};
		this.storage = [
			{
				n: '浙江',
				v: '01', 
				list: [
					{
						n:'衢州1',
						v: '011',
						list: [{
								n: '衢江1',
								v: '0111'
							}]
					},
					{n:'衢州02', v: '012', list: [{n: '衢江02', v: '0121'}]}
				]
			},
			{n: '四川', v: '02', list: [{n:'衢州2', v: '021', list: [{n: '衢江2', v: '0211'}]}]},
			{n: '新疆', v: '03', list: [{n:'衢州3', v: '031', list: [{n: '衢江3', v: '0311'}]}]}
		];
		this.init();
	};
	Cxselect.prototype = {
		constructor: Cxselect,
		init: function(){
			var that = this;

			// 失效
			if(that.size < 0 || that._fail === true){
				return;
			}
			this._onChange();
			this._buildOpt(0, this.storage);
		},
		_onChange: function(){
			var selectors = this.selectors,
				that = this
			;

			S.each(selectors, function(obj){
				obj.sel.on('change', (function(order){
					return function(){
						if((order + 1) === that.size){
							return;
						}

						if(obj.sel.val() === '0'){
							that._cleanAfterOpt(order);
							return;
						}

						var cacheList = that._getCacheList(order);
						if(S.isArray(cacheList) && cacheList.length > 0){
							that._buildNextOpt(order, cacheList)
						}else{
							this._loadAndCache(order);
						}
					}
				})(obj.order));
			});
		},

		_buildOpt: function(order, list){
			var $select = this.selectors[order].sel,
				selOpts = [],
				sysOptions = this.options
			;
			if(!S.isArray(list)){
				return;
			}

			if(sysOptions.required === false){
				selOpts.push('<option value="0">请选择</option>');
			}

			S.each(list, function(selOpt){
				selOpts.push('<option value="'+selOpt.v+'">' + selOpt.n + '</option>');
			});
			$select.html(selOpts.join(''));
		},
		_buildNextOpt: function(order, list){
			var next = order + 1;
			this._buildOpt(next, list);
			this._cleanAfterOpt(next);
		},
		_cleanAfterOpt: function(order){
			var selectors = this.selectors.slice(order + 1);
			S.each(selectors, function(selector){
				selector.sel.empty();
			});
		},
		_getCacheList: function(order){
			var arr = this.selectors.slice(0, order + 1),
				i = 0,
				len = arr.length,
				list = this.storage,
				val,
				idx
			;
			while(i < len){
				val = arr[i].sel.val();
				idx = S.indexOf(S.pluck(list, 'v'), val);
				list = list[idx].list;
				if(!list){
					list = list[idx].list = []
				}
				i++
			}
			return list;
		},
		_setCacheList: function(order, cacheList){
			var arr = this.selectors.slice(0, order + 1),
				i = 0,
				len = arr.length,
				list = this.storage,
				val,
				idx
			;
			while(i < len){
				val = arr[i].sel.val();
				idx = S.indexOf(S.pluck(list, 'v'), val);
				list = list[idx].list;	
				if(!list){
					list = list[idx].list = cacheList;
				}
				i++
			}
			return list;
		},
		_loadAndCache: function(order){
			var $curSelect = this.selectors[order].sel;
			var ajaxUrl = $curSelect.data('url');
			var that = this;
			io.request(ajaxUrl, {
				data: {
					code: curVal
				}
			}, function(ajaxData){
				// TODO SUCCESS
				// var cacheList = _setCacheList(order, /*formatter list*/);
				// that._buildNextOpt(order, cacheList)
			});
		}
	};


	function isSelect(node){
		return node && node.tagName === 'SELECT';
	}

	return Cxselect;
});