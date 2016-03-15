/**
 *  
 *  @desc: 幻灯片
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-05-14 
 *  
 *  @last: 2013-07-18
 *
 *
 *
 *  @modify(2013-07-18)
 *    支持标签属性(data-slide-options)控制幻灯片
 *  @modify(2013-10-30)
 *    如果只提供一张图片, 那么不会被激活
 *  @modify(2013-12-03)
 *    如果幻灯片宽度和浏览器宽度一致
 *    @option.fullsreen = true
 */

;(function($, S, undefined){
  var win                              = S.ENV.host,
      doc                              = win.document,
      clearInterval                    = win.clearInterval,
      /* 常量定义区   */
      SLIDE_DATA_CACHE                 = 'zjp.data.slide',
      SLIDE_DATA_OPTIONS               = 'data-slide-options',
      SLIDE_EVENT_NAMESPACE            = '.zjp.event.slide',
      SLIDE_ITEM_SELECTOR              = '.slide-item',
      SLIDE_ITEM_CONTAINER_SELECTOR    ='.slide-list',
      SLIDE_ITEM_ACTIVED_CLASSNAME     = 'slide-item-active',
      SLIDE_INDICATOR_ACTIVE_CLASSNAME = 'on',
      STR_NEXT                         = 'next',
      STR_PREVIOUS                     = 'prev',
      SLIDE_ARROW_TEMPLATE = '<div class="slide-arrow">' +
                              '<a class="slide-prev-btn" data-index="'+STR_PREVIOUS+'" href="javascript:;" hidefocus="true"></a>' +
                              '<a class="slide-next-btn" data-index="'+STR_NEXT+'" href="javascript:;" hidefocus="true"></a>' +
                             '</div>',
      SLIDE_INDICATOR_CONTAINER_TEMPLATE = '<ol class="slide-indicator"></ol>',
      SLIDE_INDICATOR_ITEM_TEMPLATE = '<li><a data-index="<@=(num-1)@>"><@=num@></a></li>',
      STATUS = {
          UNINIT: 0,      // 未初始化
          INITED: 1,      // 已初始化
          PAUSE: 2,       // 暂停
          PROCESSING: 3,  // 正在进行中
          COMPLETED: 4    // 结束 
      },
      /* 变量定义区   */
      defaultOptions = {
          speed: 6000,        // 等待时间间隔             {4000ms}
          slide: 500,         // 动画时间间隔             {300ms}
          indicator: true,    // 是否显示指示灯           {显示}
          arrow: true,        // 是否显示导航             {显示}
          ltr: true,          // 滚动方向                 {左到右}
          vertical: false,    // 是否垂直结构             {水平结构}
          auto: true          // 是否自动启动             {启动}
      },
      /* 函数定义区   */
      // 实际动画操作
      goTo = function(indexOrArrow){
          // 变量声明定义区域
          var self = this,
              $items = self._items,
              $activedItem = self._actived,
              $prevActivedItem = $activedItem,
              options = self.options,
              ltr = self._ltr,                 // 默认滑动方向
              unit = '%',
              percent = self._marginPercent(),
              activedIndex = S.indexOf($items, $activedItem[0]),
              total = self._itemSize,
              isHead = false,
              isTail = false,
              span = 1,                       // 跨度
              factor,
              newPercent,
              prepareActivedIndex
          ;
            // 带激活元素索引值
            if(S.isNumber(indexOrArrow)){
                prepareActivedIndex = indexOrArrow % total;
                // 如果是呼吸灯
                ltr = prepareActivedIndex > activedIndex ?false : true;
                span = Math.abs(prepareActivedIndex - activedIndex);
            }else if(indexOrArrow === STR_NEXT){
                ltr = false;
                self._arrow = STR_NEXT;
                prepareActivedIndex = (activedIndex + 1) % total;
            }else if(indexOrArrow === STR_PREVIOUS){
                ltr = true;
                self._arrow = STR_PREVIOUS;
                prepareActivedIndex = activedIndex - 1;
                if(activedIndex === 0){
                    prepareActivedIndex = total - 1;
                }
            }
            factor = ltr ? 1 : -1;
            if(indexOrArrow === STR_PREVIOUS && activedIndex === 0){
                isHead = true;
            }else if(indexOrArrow === STR_NEXT && activedIndex === (total - 1)){
                isTail = true;
            }

            newPercent = percent + span*100*factor;
            $({left: percent}).animate({left: newPercent}, {
                duration: options.slide,
                easing: 'linear',
                step: function(val){
                    self._marginPercent(val+'%');
                },
                complete: function(){
                    if(isHead){
                        self._marginPercent((-total*100)+'%');
                    }else if(isTail){
                        self._marginPercent('-100%');
                    }
                    self._toggleActived();
                    self._actived = $items.eq((self._index = prepareActivedIndex));
                    self._toggleActived();
                    self._status = STATUS.COMPLETED;
                }
            });
        },
        splice = Array.prototype.splice,
        unshift = Array.prototype.unshift,
        $$ = S.fastJQuery,
        toggle
    ;

    /**
     *
     * 旋转木马{Slide}构造函数
     * 
     * @param  node         目标触发元素
     * @param  options      可选参数
     *   
     * 
     * @return Slide        构造对象
     *  
     */
    function Slide(node, options){
        this.node = node;
        // this.options = S.mix({} ,settings ,options, true);
        this._init();
        this._status = STATUS.INITED;
    }

    Slide.prototype = {

        // 构造属性
        constructor: Slide,

        // 循环滑动
        repeat: function(){
            var self = this,
                options = this.options,
                speed = options.speed
            ;
            this._interval = S.delay(function(){
                self.slide();
            }, speed, true);
        },

        // 滑动
        slide: function(index){
            if(this._status === STATUS.PROCESSING){
                return;
            }
            var options = this.options,
                speed = options.speed,
                arrow = this._arrow
            ;
            index = typeof index === 'undefined'?arrow : index;

            this._status = STATUS.PROCESSING;

            S.bind(goTo, this)(index);
        },

        // 暂停
        pause: function(){
            var interval = this._interval;
            if(interval){
                clearInterval(interval);
                this._interval = 0;
            }
            this._status = STATUS.PAUSE;
            return this;
        },

        // 不会同时修改原先运行朝向
        to: function(index){
            this.slide(index);
        },

        // 会同时改变原先运行朝向
        next: function(){
            this.slide();
        },

        // 会同时改变原先运行朝向
        prev: function(){
            this.slide();
        },

        // 初始化
        _init: function(){

            var self = this,
                // options = this.options,
                $node = this.node,
                $itemContainer = $node.find(SLIDE_ITEM_CONTAINER_SELECTOR),
                $items = $itemContainer.find(SLIDE_ITEM_SELECTOR),
                attrOptions = S.qs.parse($node.attr(SLIDE_DATA_OPTIONS)||''),
                options,
                $WIN = $(win)
            ;

            // 类型转换(String->Other)
            S.each(attrOptions, function(val, key){
                attrOptions[key] = S.convert(val);
            });
            options = this.options = S.mix({}, defaultOptions, attrOptions, true);

            this._itemContainer = $itemContainer;
            this._items = $items;
            this._itemSize = $items.length;
            this._ltr = !!options.ltr;

            // 如果只有一张图
            if(this._itemSize === 1){
              return;
            }

            // 如果是满屏
            if(options.fullscreen){
              var $itemParent = $itemContainer.parent().css({overflow: 'hidden'});
              var setFullWidth;

              setFullWidth = function(){
                var screenWidth = $WIN.width();
                $itemContainer.find(SLIDE_ITEM_SELECTOR).css({width: screenWidth});
                $itemParent.css({width: screenWidth});
              };

              setFullWidth();

              $(win).resize(function(){
                setFullWidth();
              });
            }

            if(options.indicator){
                this._appendIndicator();
            }
            if(options.arrow){
                this._appendArrow();
            }
            this._dimension();

            this._toggleActived();

            this._bindEvent();
        },

        // 设置容器
        _dimension: function(){
            var $itemContainer = this._itemContainer,
                $items = this._items,
                width = (this._itemSize + 2)*100 + '%',
                ltr = this._ltr
            ;

            // 容器前后各自插入一个列表
            $itemContainer.prepend($items.last().clone()).append((this._actived = $items.first()).clone());

            $itemContainer.css({
                width: width,
                marginLeft: '-100%'
            });
        },

        // 计算margin比值
        _marginPercent: function(percent){
            var $itemContainer = this._itemContainer,
                prop = S.camelCase('margin-left')
            ;

            if(typeof percent === 'undefined'){
                return $itemContainer[0] && parseInt($itemContainer[0].style[prop], 10);
            }
            $itemContainer.css(prop, percent);
        },

        // 状态变化
        _toggleActived: function(){
            var options = this.options,
                $activedItem = this._actived,
                $indicatorContainer = this._indicatorContainer,
                index = this._index,
                methodName = $activedItem.hasClass(SLIDE_ITEM_ACTIVED_CLASSNAME)?'removeClass' : 'addClass'
            ;
            $activedItem[methodName](SLIDE_ITEM_ACTIVED_CLASSNAME);

            // 如果存在指示灯
            if(options.indicator){
            // if($indicatorContainer && $indicatorContainer.length){
                $indicatorContainer.find('a').eq(index)[methodName](SLIDE_INDICATOR_ACTIVE_CLASSNAME);
            }
        },

        // 事件绑定
        _bindEvent: function(){
            var self = this,
                $node = this.node,
                $arrowContainer = this._arrowContainer,
                $indicatorContainer = this._indicatorContainer,
                options = this.options
            ;

            // 鼠标悬停事件{暂停旋转}
            $node.on('mouseenter', function(){self.pause();})
                 .on('mouseleave', function(){self.repeat();});

            // 箭头按钮单击事件
            if(options.arrow){
                this._arrowContainer.on('click', 'a', function(){
                    self.to($$(this).data('index'));
                    return false;
                });
            }

            // 指示灯按钮单击事件
            if(options.indicator){
                this._indicatorContainer.on('click', 'a', function(){
                    var $$btn = $$(this),
                        index = +$$btn.data('index')
                    ;

                    if(index !== self._index){
                        self.to(index);
                    }

                    return false;
                });
            }
        },

        // 箭头插入
        _appendArrow: function(){
            this._arrowContainer = $(SLIDE_ARROW_TEMPLATE).appendTo(this.node);
        },

        // 指示灯插入
        _appendIndicator: function(){
            var total = this._itemSize,
                templateObj = {num: 0},
                htmls = [],
                template = S.template(SLIDE_INDICATOR_ITEM_TEMPLATE),
                i = total
            ;

            for(; i > 0; i--){
                templateObj.num = i;
                unshift.call(htmls, template(templateObj));
            }

            this._indicatorContainer = $(SLIDE_INDICATOR_CONTAINER_TEMPLATE).append(htmls.join('')).appendTo(this.node);

        },

        _itemContainer: null,       // 滑动元素容器
        _items: null,               // 所有滑动元素
        _actived: null,             // 已激活元素
        _arrowContainer: null,      // 箭头元素容器
        _indicatorContainer: null,  // 指示灯元素容器

        _itemSize: 0,               // 记录滑动元素数量
        _ltr: 1,                    // 记录滑动方向, 用于确定动画效果
        _index: 0,                  // 记录滑动索引值, 默认为第一个
        _interval: 0,               // 记录循环定时器标识, 用于暂停处理
        _status: STATUS.UNINIT,     // 记录状态

        _arrow: STR_NEXT
    };

    toggle = function(node, option){

        var $node = $(node),
            options = S.isPlainObject(option)&&option,
            slide,
            settings
        ;

        slide = $node.data(SLIDE_DATA_CACHE);

        if (!slide) {
            $node.data(SLIDE_DATA_CACHE, ( slide = new Slide($node, options)));
        }

        // 假设只有一个选项, 无需循环
        if(slide._itemSize === 1){
          return;
        }

        settings = slide.options;

        if(S.isNumber(option)){
            slide.to(+option);
        }else if(S.isString(option)){
            try{
                slide[option]();
            }catch(e){
S.log('无效的参数option:['+ option +']');
            }
        }else{
            settings.speed ? slide.repeat() : slide.slide();
        }
    };

    $(function(){
        //var targets = S.toArray($('.js-silde'));
        S.each(S.toArray($('.js-silde')), function(item, index){
            toggle(item);
        });
    });

}(jQuery, window.zjport));


