/**
 *  
 *  @desc: 滚动字幕
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-06-03 
 *  
 *  @last: 2013-06-03
 */
;(function($, S, undefined) {
    var global = S.ENV.host,
        RT_DATA_CACHE = 'zjp.data.rolltitle',
        RT_EVENT_NAMESPACE = '.zjp.event.rolltitle',
        RT_DATA_OPTIONS = 'data-rolltitle-options',
        RT_ITEM_SELECTOR = '.rolltitle-item',

        defaultOptions = {
					serial : true,				// 是否是连续的						{true}
					easing: 'linear',			// 移动轨迹
					delay: 40,						// 元素移动时差(毫秒)			{40毫秒}
					rollDelay : 40,				// 元素间滚动时差(毫秒)		{40毫秒}
					speed: 25,						// 每秒位移单位(px)				{25px/s}
					manual: false,				// 是否手动启动						{false}
					silent: false,				// 无事件模式
					replace: true						// 是否填补
        },


        $$ = S.fastJQuery,
        toggle
    ;


    /**
     *
     * 字幕滚动{Rolltitle}构造函数
     * 
     * @param  node           容器
     * @param  options        可选参数
     *   
     * 
     * @return Rolltitle       构造对象
     *  
     */
    function Rolltitle(node , options) {
        this.node = node;
        
        //this.options = S.mix({}, defaultOptions, options, true);
        
        this._init();
        this._bindEvent();
        this.start();
    }



    // 原型对象
    Rolltitle.prototype = {

			constructor : Rolltitle,

			// 重复
			repeat: function(){
				var self = this,
						options = this.options
				;

				this._timeout = S.delay(function(){
					self._roll();
				}, options.rollDelay, true);
			},

			start: function(){
				if(this.enabled === false){
					return;
				}
				this.repeat();
			},

			pause: function(){
				window.clearInterval(this._timeout);
			},

			// 功能恢复
			enable: function () {
				this.enabled = true;
			},

			// 功能失效
			disable: function () {
				this.enabled = false;
			},

			// 重新
			reload: function(){
				this.pause();
				this._init();
				this.enable();
				this.start();
			},
			// type: shown
			regist: function(type, callback){
				this.node.bind(type + RT_EVENT_NAMESPACE, callback);
			},

			// 初始化
			_init: function(){
				var $node = this.node,
						$holder,
						$list,
						$items,
						$cloneItems,
						$curItem,
						attrOptions = S.qs.parse($node.attr(RT_DATA_OPTIONS)||''),
						maxItemDimension = 0,
						options,
						measure,
						size,
						containerDimension,		// 可视大小
						itemsDimension,				// 列表元素总和
						hreshold							// 移动临界值
				;

				// 类型转换(String->Other)
        S.each(attrOptions, function(val, key){
            attrOptions[key] = S.convert(val);
        });
        options = this.options = S.mix({}, defaultOptions, attrOptions, true);

				// 元素定位
				$holder = this._holder = $node.find('.rolltitle-holder');
				$list = this._list = $holder.find('.rolltitle-list');
				$items = this._items = $list.find(RT_ITEM_SELECTOR);		// TODO 
				// $curItem = this._curItem = $items.first();
				// 如果列表项为空, 那么无=滚动效果
				size = $items.length;
				if (!size) {
					this.disable();
					return;
				}

				// 尺寸计算
				if($node.hasClass('rolltitle_vertical')){
					measure = this._measure = 'height';
					this._margin = 'margin-top';
				}else{
					measure = this._measure = 'width';
					this._margin = 'margin-left';
				}

				this._reversed = !!options.reversed;

				$curItem = this._curItem = $items[this._reversed ? 'last':'first']();

				containerDimension = $node[measure]();

				itemsDimension = S.reduce($items, function(prev, item, idx){

					var itemDimension = $$(item)[ 'outer' + S.upFirst(measure)](true);

					if(idx === 0){
						hreshold = itemDimension;
					}


					if(itemDimension > maxItemDimension){
						maxItemDimension = itemDimension;
					}

					return itemDimension + prev;
				}, 0);

				// 如果容器足够包含所有元素, 那么无需滚动
				if(containerDimension > itemsDimension){
					this.disable();
					return;
				}

				// 设置临界值
				this._hreshold = hreshold;



				// 克隆列表, 保证元素滚动不间断
				$cloneItems = $items.clone();

				$list[this._reversed ? 'prepend' : 'append']($cloneItems);

				// 设置列表元素尺寸(列表项元素尺寸 + 最大列表项尺寸), 保证在移动时不会间断
				$list[measure]( 2*itemsDimension);


				if(options.manual){
					this.disable();
				}
			},

			_bindEvent: function(){
				var self = this,
						$node = self.node,
						options = self.options
				;

				if(!options.silent){
					$node.on('mouseenter', function(){self.pause();}).on('mouseleave', function(){self.start();});
				}
			},

			// 单次移动
			_roll: function(){

				var self = this,
						options = this.options,
						$node = this.node,
						$holder = this._holder,
						marginStyle = this._margin,
						animatedGap = this._animatedGap,
						hreshold = this._hreshold,
						animateGap = options.serial ? (options.speed * options.rollDelay / 1000) : hreshold,
						animateProps = {}
					;

				animatedGap += animateGap;
				animateProps[marginStyle] = this._reversed ? animatedGap : -animatedGap;

				$holder.animate(animateProps, {
					duration : options.serial ? 0 : options.delay,
					easing: options.easing,
					complete: function(){
						self._animatedGap = animatedGap;

						// 如果超过临界值 
						if(animatedGap >= hreshold){
							var prevItem = self._curItem;

							self._transition();

							$node.trigger('shown', {
								cur: self._curItem,
								prev: prevItem
							});
						}


					}
				});


				// $holder.css(marginStyle, -animatedGap);

				// this._animatedGap = animatedGap;

				// // 如果超过临界值 
				// if(animatedGap >= hreshold){
				// 	this._transition();
				// }
				// if(!(animatedGap < hreshold)){
				// this._transition();
				// }
			},

			// 当前状态转换
			_transition: function(){

				var $curItem = this._curItem,
						$holder = this._holder,
						$list = this._list,
						$nextItem = $curItem[this._reversed ?'prev' : 'next'](),
						marginStyle = this._margin,
						measure = this._measure,
						options = this.options
				;

				// 是否需要填补
				options.replace && $list[this._reversed ? 'prepend' : 'append']($curItem);

				// $list.append($curItem);
				$holder.css(marginStyle, 0);
				$curItem = this._curItem = $nextItem;

				this._animatedGap = 0;

				this._hreshold = $curItem[ 'outer' + S.upFirst(measure)](true);
			},



			_holder: null,					// 记录待移动元素
			_list: null,						// 记录列表元素
			_items: null,						// 记录所有列表项
			_curItem: null,					// 记录当前活动元素
			_hreshold: 0,						// 记录位移临界值{和curItem保持一致}
			_reversed: false,				// 反向运动

			_measure: 'width',			// 测量标准{默认为水平移动}
			_margin: 'margin-left',	// 动画属性控制
			_timeout: 0 ,						// 定时器标识符{用于暂停}
			_animatedGap: 0				// 记录已移动单位{替换活动元素时, 同重新计算}
    };

    // 触发器 {TODO 考虑对外提供接口}
    toggle = function(node, options){
        var $node = $(node),
            args = arguments,
            argsLength = args.length,
            rolltitle
        ;
        if(!$node.length){
            return;
        }

        rolltitle = $node.data(RT_DATA_CACHE);

        if (!rolltitle) {
            $node.data(RT_DATA_CACHE, ( rolltitle = new Rolltitle($node, options)));
        }

        return rolltitle;
    };


    // domReady
    $(function(){
        S.each($('body').find('.js-Rolltitle'), function(item){
            toggle(item);
        });
    });
})(jQuery, window.zjport);

/* 2013-07-19 修改*/
// 水平滚动连贯性

/* 2013-08-02 修改*/
// 支持标签属性(data-rolltitle-options)

/* 2013-08-02 修改*/
// 添加serial配置, 是否连续, 默认为[true]

/* 2013-12-10 修改*/
// 添加完成一次滚动事件激活
// 添加reload

/* 2013-12-11 修改*/
// 添加silent配置项, 无事件模式