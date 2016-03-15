/**
 *
 *  @desc: 标签组件封装
 *
 *  @author: qzzf1987@gmail.com
 *
 *  @create: 2013-04-01
 *
 *  @last: 2013-04-17
 */
;(function($, S, undefined) {
  var global = S.ENV.host,
      TAB_DATA_CACHE = 'zjp.data.button',
      TAB_EVENT_NAMESPACE = '.zjp.event.tab',
      TAB_TARGET_SIGN = 'data-tab-target',
      TAB_CLASSNAME = 'tabs-nav',
      TAB_ITEM_CLASSNAME = 'nav-item',
      TAB_ITEM_ACTIVE_CLASSNAME = 'nav-item_active',
      TAB_CONTENT_ACTIVE_CLASSNAME = 'tab-content_active',
      TAB_TOGGLER_SELECTOR = '.js-Tab-Toggler',
      rHrefTarget = /.*(?=#[^\s]*$)/,

      toggle,
      doActiveTab;

  function Tab(node) {
    this.node = node;
    this._init();
  }

  Tab.prototype = {

    constructor: Tab,

    show: function() {
      var actived = this._isActived,
          self = this,
          disabled = false,
          prevTab;

      // 如果已经是激活状态
      if (actived) {
        return;
      }

      // tab切换前的操作, 返回的结果
      disabled = (false === $.event.trigger('prevShow', {item: self._item}, self.node[0]));

      // 如果用户自定义'prevShow'事件, 且执行结果为false
      if(disabled){
        return;
      }

      doActiveTab(this._content, this._contentContainer);

      doActiveTab(this._item, this._itemContainer, function(tab) {
        tab._isActived = false;
        prevTab = tab;
      });

      self._isActived = true;

      // 触发shown事件
      self._itemContainer.trigger('shown', {
        item: self._item,
        content: self._content,
        prevItem: prevTab && prevTab._item,
        prevContent: prevTab && prevTab._content
      });
    },

    _init: function() {
      var $node = this.node,
          $item = $node.parent('.' + TAB_ITEM_CLASSNAME),
          $container = $node.closest('.' + TAB_CLASSNAME),
          $target,
          targetSelector = $node.attr(TAB_TARGET_SIGN);


      if ($item && $item.length) {
        this._item = $item;

        this._isActived = $item.hasClass(TAB_ITEM_ACTIVE_CLASSNAME);
      }

      if ($container && $container.length) {
        this._itemContainer = $container;
      }

      if (!targetSelector) {
        targetSelector = $node.attr('href');
        targetSelector = targetSelector && targetSelector.replace(rHrefTarget, '');
      }

      $target = $(targetSelector);

      if ($target && $target.length) {
        this._content = $target;
        this._contentContainer = $target.parent();
      }
    },
    
    _isActived: 0,
    _item: 0,
    _itemContainer: 0,
    _content: 0,
    _contentContainer: 0

  };


  toggle = function(node, options) {

    var $node = $(node),
        tab;
    if (!$node.length) {
      return;
    }
    tab = $node.data(TAB_DATA_CACHE);

    if (!tab) {
      $node.data(TAB_DATA_CACHE, (tab = new Tab($node)));
    }

    if (S.isString(options)) {
      tab[options]();
    }
  };


  doActiveTab = function(node, container, callback) {

    var isTabItem = node.hasClass(TAB_ITEM_CLASSNAME),
        activeClassName = isTabItem ? TAB_ITEM_ACTIVE_CLASSNAME : TAB_CONTENT_ACTIVE_CLASSNAME,
        prevTab,
        hasCallback = callback && S.isFunction(callback);

    prevTab = container.find('.' + activeClassName).removeClass(activeClassName).find(TAB_TOGGLER_SELECTOR).data(TAB_DATA_CACHE);

    node.addClass(activeClassName);

    if (hasCallback) {
      prevTab && callback(prevTab);
    }

  };

  $(function() {
    $('body').on('click' + TAB_EVENT_NAMESPACE, TAB_TOGGLER_SELECTOR, function(event) {
      event.preventDefault(); // 阻止默认动作
      toggle($(this), 'show');
    });
  });



})(jQuery, window.zjport);