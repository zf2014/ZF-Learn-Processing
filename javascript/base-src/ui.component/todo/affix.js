/**
 *  
 *  @desc: 黏贴
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-07-24 
 *  
 *  @last: 2013-07-24
 */
;(function($, S, undefined) {
  var global = S.ENV.host,
      AFFIX_DATA_CACHE = 'zjp.data.affix',
      AFFIX_EVENT_NAMESPACE = '.zjp.event.affix',
      AFFIX_DATA_OPTIONS = 'data-affix-options',
      defaultOptions = {
        bottom: 20,
        // false表示不自动隐藏, true阀值为0, 其他为有效数值
        autohide: true
      },
      isIE6 = zjport.UA.ie === 6,
      $$ = S.fastJQuery,
      toggle
  ;

  /**
   *
   * 粘贴{Affix}构造函数
   * 
   * @param  node           容器
   * @param  options        可选参数
   * 
   * @return Affix       构造对象
   *  
   */
  function Affix(node, options){
    this.node = node;
    // this.options = S.mix({}, defaultOptions, options, true);
    this._init(options);
  }

  // 原型对象
  Affix.prototype = {
    // 构造函数
    constructor : Affix,
    // 隐藏
    hide: function(){
      if(this._isHide){
        return;
      }
      this.node.hide();
      this._isHide = true;
    },

    // 显示
    show: function(){
      if(!this._isHide){
        return;
      }
      this.node.show();
      this._isHide = false;
    },
    // 初始化
    _init: function(options){
      var $node = this.node,
          attrOptions = S.qs.parse($node.attr(AFFIX_DATA_OPTIONS)||'')
      ;

      // 确定控制属性(存在优先级)
      S.each(attrOptions, function(val, key){
          attrOptions[key] = S.convert(val);
      });

      options = this.options = S.mix({}, defaultOptions, attrOptions, options, true);

      this.$window = $(window);

      $node.css('position', this._noFixed?'absolute' : 'fixed');
      this._nodeHeight = $node.height();

      this._setPosition(true);
      this._bindEvent();
    },

    // 事件绑定
    _bindEvent: function(){
      var self = this,
          $node = this.node,
          options = this.options,
          // 隐藏高度阀值
          autohide = options.autohide === false ? false : (options.autohide === true ?
                                       0 : options.autohide)
      ;

      this.$window.on('scroll' + AFFIX_EVENT_NAMESPACE, function(event){
        var windowScrollTop = self.$window.scrollTop();
        self._scrollspy();
        // 如果需要自定隐藏
        if(autohide !== false){
          if(windowScrollTop > autohide){
            self.show();
          }else{
            self.hide();
          }
        }
      });

      this.$window.on('resize' + AFFIX_EVENT_NAMESPACE, function(){
        self._setPosition(true);
      });
    },

    // 滚动监控
    _scrollspy: function(){
      this._setPosition();
    },

    // 定位
    _setPosition: function(enforce){
      var $window = this.$window,
          $node = this.node,
          options = this.options,
          // 相对于viewport
          offsetTop = options.top,
          offsetBottom = options.bottom,
          windowHieght,
          scrollHeight,
          scrollTop
      ;

      // 针对IE6
      if(this._noFixed || enforce){
        // 如果未指定偏移位置
        if(offsetTop == null && offsetBottom == null){
          return;
        }

        windowHieght = $window.height();
        scrollHeight = $(document).height();
        scrollTop = $window.scrollTop();

        // 如果未定义option.top属性, 那么需要通过option.bottom属性
        if(offsetTop == null){
          offsetTop = windowHieght - offsetBottom - this._nodeHeight;
        }

        $node.css('top', offsetTop);
      }
    },

    // 是否支持position : fixed属性, 如果是IE6, 该属性为true, 其他为false
    _noFixed: isIE6
  };

  // 触发器 {TODO 考虑对外提供接口}
  toggle = function(node, options){
    var $node = $(node),
        args = arguments,
        argsLength = args.length,
        affix
    ;
    if(!$node.length){
        return;
    }

    affix = $node.data(AFFIX_DATA_CACHE);

    if (!affix) {
        $node.data(AFFIX_DATA_CACHE, ( affix = new Affix($node, options)));
    }

    return affix;
  };



  // domReady
  $(function(){
      S.each($('body').find('.js-Affix'), function(item){
          toggle(item);
      });
  });
})(jQuery, window.zjport);