/**
 * 文件: .js 
 * 公司: 浙江电子口岸
 * 作者: qzzf1987@gmail.com
 * 时间: 2015-03-24 01:54:28
 */
define(['jquery', 'utils', 'css!csspath/autocomplete.css'], function($, S){
var VERSION = "v1.0";
var autocomplete;

var AUTO_EVENT_NAMESPACE = '.Z.event.autocomplete',
    AUTO_EVENT_PREFIX = 'autocomplete:',

    AUTO_CLASSNAME_PREFIX = 'autocomplete-',

    AUTO_WRAPPER_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'wrapper',
    AUTO_QUERY_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'inp',
    AUTO_HINT_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'hint-inp',
    AUTO_DD_MENU_CLASSNAME = AUTO_CLASSNAME_PREFIX + 'menu',


    ua = S.UA,
    
    bindAll = function(obj){
      var val;
        for (var key in obj) {
          S.isFunction(val = obj[key]) && (obj[key] = S.bind(val, obj));
        }
    },
    getProtocol=function() {
        return location.protocol;
    },
    escapeRegExChars = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    },
    tokenizeQuery=function(str) {
      return S.trim(str).toLowerCase().split(/[\s]+/);
    },

    tokenizeText=function(str) {
      return S.trim(str).toLowerCase().split(/[\s\-_]+/);
    }
;
var EventTarget = (function() {
  
  var eventSplitter = /\s+/;

  return {
    // 注册事件
    on: function(events, callback) {
      var event;

      if (!callback) { return this; }

      this._callbacks = this._callbacks || {};
      events = events.split(eventSplitter);

      while (event = events.shift()) {
        this._callbacks[event] = this._callbacks[event] || [];
        this._callbacks[event].push(callback);
      }

      return this;
    },

    // 触发事件
    trigger: function(events, data) {
      var event, callbacks;

      if (!this._callbacks) { return this; }

      events = events.split(eventSplitter);

      while (event = events.shift()) {
        if (callbacks = this._callbacks[event]) {
          for (var i = 0; i < callbacks.length; i += 1) {
            callbacks[i].call(this, { type: event, data: data });
          }
        }
      }

      return this;
    }
  };
})();

var EventBus = (function() {

  function EventBus(o) {
    if (!o || !o.el) {
      S.error('EventBus initialized without el');
    }

    this.$el = $(o.el);
  }

  S.mix(EventBus.prototype, {

    trigger: function(type) {
      var args = [].slice.call(arguments, 1);

      this.$el.trigger(AUTO_EVENT_PREFIX + type, args);
    }
  });

  return EventBus;
})();

var PersistentStorage = (function() {
  var ls,
      methods,
      now = S.now,
      encode,
      decode
  ;

  encode = function(val) {
    return JSON.stringify(S.isUndefined(val) ? null : val);
  }

  decode = function(val) {
    return JSON.parse(val);
  }

  // 判断当前浏览器是否支持本地存储功能
  try {
    ls = window.localStorage;

    ls.setItem('~~~', '!');
    ls.removeItem('~~~');
  } catch (err) {
    ls = null;
  }
  // 数据持久构造函数
  function PersistentStorage(namespace) {
    this.prefix = ['__', namespace, '__'].join('');
    this.ttlKey = '__ttl__';
    this.keyMatcher = new RegExp('^' + this.prefix);
  }

  // 持久化数据操作(增/删/取/清/有效期)
  if (ls && window.JSON) {
    methods = {

      // 数据存储标识符(内部使用)
      _prefix: function(key) {
        return this.prefix + key;
      },
      // 数据期限存储标识符(内部使用)
      _ttlKey: function(key) {
        return this._prefix(key) + this.ttlKey;
      },

      // 公共函数
      get: function(key) {
        if (this.isExpired(key)) {
          this.remove(key);
        }

        return decode(ls.getItem(this._prefix(key)));
      },


      /**
       * 数据持久
       * @param {String} key                目标持久键
       * @param {Any} val                   目标持久数据
       * @param {isNumber} ttl              持久期限
       * 
       * @return {PersistentStorage}        当前持久对象   
       */
      set: function(key, val, ttl) {
        if (S.isNumber(ttl)) {
          ls.setItem(this._ttlKey(key), encode(now() + ttl));
        }

        else {
          ls.removeItem(this._ttlKey(key));
        }

        return ls.setItem(this._prefix(key), encode(val));
      },

      remove: function(key) {
        ls.removeItem(this._ttlKey(key));
        ls.removeItem(this._prefix(key));

        return this;
      },

      clear: function() {
        var i, key, keys = [], len = ls.length;

        for (i = 0; i < len; i++) {
          if ((key = ls.key(i)).match(this.keyMatcher)) {
            keys.push(key.replace(this.keyMatcher, ''));
          }
        }

        for (i = keys.length; i--;) {
          this.remove(keys[i]);
        }

        return this;
      },

      // 判断该持久数据是否超过了有效期
      isExpired: function(key) {
        var ttl = decode(ls.getItem(this._ttlKey(key)));

        return S.isNumber(ttl) && now() > ttl ? true : false;
      }
    };
  }else {
    methods = {
      get: S.NOOP,
      set: S.NOOP,
      remove: S.NOOP,
      clear: S.NOOP,
      isExpired: S.NOOP
    };
  }

  S.mix(PersistentStorage.prototype, methods);

  return PersistentStorage;
})();

var RequestCache = (function() {


  // 构造函数
  function RequestCache(o) {
    bindAll(this);
    o = o || {};

    // 最大缓存数,默认是10条
    this.sizeLimit = o.sizeLimit || 10;

    this.cache = {};
    this.cachedKeysByAge = [];
  }

  S.mix(RequestCache.prototype, {
    // 读取缓存数据
    get: function(url) {
      return this.cache[url];
    },

    // 添加缓存数据
    set: function(url, resp) {
      var requestToEvict;

      if (this.cachedKeysByAge.length === this.sizeLimit) {
        requestToEvict = this.cachedKeysByAge.shift();
        delete this.cache[requestToEvict];
      }

      this.cache[url] = resp;
      this.cachedKeysByAge.push(url);
    }
  });

  return RequestCache;
})();

var Transport = (function() {
  var pendingRequestsCount = 0,     // 当前阻塞请求数
      pendingRequests = {},         // 阻塞请求缓存
      maxPendingRequests,           // 最大阻塞请求数
      requestCache,                 // 请求缓存对象
      ajaxReq = $.ajax              // ajax入口函数
  ;
    /**
     *
     *  数据传播{Transport}构造函数
     * 
     *  @param  o             传播配置
     *  {
     *    'url'             :      '数据服务地址',
     *    'wildcard'        :      '通配符',                  {%QUERY}
     *    'filter'          :      '过滤操作',
     *    'replace'         :      '替换操作',
     *    'cache'           :      '是否需要缓存',
     *    'timeout'         :      '请求超时设置',
     *    'dataType'        :      '请求结果数据类型格式',    {默认为json格式}
     *    'beforeSend'      :      '请求前置操作',
     *    'rateLimitFn'     :      '请求频率限制',
     *    'rateLimitWait'   :      '请求频率限制时限',
     *  }
     *  @return Transport     构造对象
     *  
     */
  function Transport(o) {

    bindAll(this);

    o = S.isString(o) ? { url: o } : o;

    requestCache = requestCache || new RequestCache();

    maxPendingRequests = S.isNumber(o.maxParallelRequests) ?
      o.maxParallelRequests : maxPendingRequests || 6;

    // 请求配置项
    this.url = o.url;   
    this.wildcard = o.wildcard || '%QUERY';
    this.filter = o.filter;
    this.replace = o.replace;

    this.ajaxSettings = {
      type: 'get',
      cache: o.cache,
      timeout: o.timeout,
      dataType: o.dataType || 'json',
      beforeSend: o.beforeSend
    };

    this._get = (/^throttle$/i.test(o.rateLimitFn) ?
      S.throttle : S.debounce)(this._get, o.rateLimitWait || 300);
  }

  S.mix(Transport.prototype, {


    // 处理请求(内部)
    _get: function(url, cb) {
      var that = this;

      // 如果未超过最大阻塞数,发起请求
      if (belowPendingRequestsThreshold()) {
        this._sendRequest(url).done(done);
      }

      // 挂起当前请求,保存当前请求参数
      else {
        this.onDeckRequestArgs = [].slice.call(arguments, 0);
      }

      // 请求完成回调函数
      function done(resp) {

        // var data = that.filter ? that.filter(resp) : resp;
        //cb && cb(data);

        cb && cb(that._process(resp));

        requestCache.set(url, resp);
      }
    },

    _process: function(resp){
      return this.filter ? this.filter(resp) : resp;
    },

    // 建立请求(内部)
    _sendRequest: function(url) {
      var that = this, jqXhr = pendingRequests[url];

      if (!jqXhr) {
        incrementPendingRequests();
        jqXhr = pendingRequests[url] =
          ajaxReq(url, this.ajaxSettings).always(always);
      }

      return jqXhr;

      // 请求结束处理结果
      function always() {
        decrementPendingRequests();
        pendingRequests[url] = null;

        // 重新发起最后阻塞的请求
        if (that.onDeckRequestArgs) {
          that._get.apply(that, that.onDeckRequestArgs);
          that.onDeckRequestArgs = null;
        }
      }
    },

    /**
     *  
     *  获取请求数据
     *  @param query     查询条件
     *  @param cb        查询结果回调函数
     * 
     */
    get: function(query, cb) {
      var that = this,
          encodedQuery = encodeURIComponent(query || ''),
          url,
          resp;

      cb = cb || S.NOOP;

      // 根据配置项提供的url模板来生成符合要求的请求地址
      url = this.replace ?
        this.replace(this.url, encodedQuery) :
        this.url.replace(this.wildcard, encodedQuery);

      if (resp = requestCache.get(url)) {
        S.defer(function() { cb(that._process(resp)); });
      }

      else {
        this._get(url, cb);
      }

      return !!resp;
    }
  });

  return Transport;

  // 增加阻塞请求数
  function incrementPendingRequests() {
    pendingRequestsCount++;
  }

  // 减少阻塞请求数
  function decrementPendingRequests() {
    pendingRequestsCount--;
  }

  // 判断当前阻塞请求超过最大允许阻塞数
  function belowPendingRequestsThreshold() {
    return pendingRequestsCount < maxPendingRequests;
  }
})();

var Dataset = (function() {
  var keys = {
        thumbprint: 'thumbprint',
        protocol: 'protocol',
        itemHash: 'itemHash',
        adjacencyList: 'adjacencyList'
      },
      ajaxReq = $.getJSON 
  ;

    /**
     *
     *  数据集{Dataset}构造函数
     * 
     *  @param  o             传播配置
     *  {
     *    'engine'          :      '模板引擎',
     *    'template'        :      '数据模板',
     *    'local'           :      '数据源(本地)',
     *    'prefetch'        :      '数据源(预先抓取)',       {url: '请求地址', ttl: '存储时长'}
     *    'remote'          :      '数据源(实时数据)',
     *    'name'            :      '数据集标识符',
     *    'limit'           :      '最大条数',    {5条}
     *    'minLength'       :      '最小条数',    {1条}
     *    'header'          :      '头数据',
     *    'footer'          :      '尾数据',
     *    'valueKey'        :      '数据键',
     *  }
     *  @return Transport     构造对象
     *  
     */
  function Dataset(o) {
    bindAll(this);

    if (S.isString(o.template) && !o.engine) {
      S.error('no template engine specified');
    }

    if (!o.local && !o.prefetch && !o.remote) {
      S.error('one of local, prefetch, or remote is required');
    }

    this.name = o.name || S.guid();
    this.limit = o.limit || 5;
    this.minLength = o.minLength || 1;
    this.header = o.header;
    this.footer = o.footer;
    this.valueKey = o.valueKey || 'value';
    this.template = compileTemplate(o.template, o.engine, this.valueKey);

    // 用于确定是否需要初始化
    this.local = o.local;
    this.prefetch = o.prefetch;
    this.remote = o.remote;

    // 
    this.itemHash = {};
    this.adjacencyList = {};    // 接近的数据

    // 本地存储对象
    this.storage = o.name ? new PersistentStorage(o.name) : null;
  }

  S.mix(Dataset.prototype, {

    // 处理本地数据
    _processLocalData: function(data) {
      this._mergeProcessedData(this._processData(data));
    },

    // 加载预抓取数据
    _loadPrefetchData: function(o) {
      var that = this,
          thumbprint = VERSION + (o.thumbprint || ''),
          storedThumbprint,
          storedProtocol,
          storedItemHash,
          storedAdjacencyList,
          isExpired,
          deferred;

      if (this.storage) {
        storedThumbprint = this.storage.get(keys.thumbprint);
        storedProtocol = this.storage.get(keys.protocol);
        storedItemHash = this.storage.get(keys.itemHash);
        storedAdjacencyList = this.storage.get(keys.adjacencyList);
      }

      // 是否过期
      isExpired = storedThumbprint !== thumbprint || storedProtocol !== getProtocol();

      o = S.isString(o) ? { url: o } : o;

      o.ttl = S.isNumber(o.ttl) ? o.ttl : 24 * 60 * 60 * 1000;

      if (storedItemHash && storedAdjacencyList && !isExpired) {
        this._mergeProcessedData({
          itemHash: storedItemHash,
          adjacencyList: storedAdjacencyList
        });

        deferred = $.Deferred().resolve();
      }else {
        deferred = ajaxReq(o.url).done(processPrefetchData);
      }

      return deferred;

      function processPrefetchData(data) {
        var filteredData = o.filter ? o.filter(data) : data,
            processedData = that._processData(filteredData),
            itemHash = processedData.itemHash,
            adjacencyList = processedData.adjacencyList;

        // 添加本地存储, 防止多次请求(现代浏览器支持)
        if (that.storage) {
          that.storage.set(keys.itemHash, itemHash, o.ttl);
          that.storage.set(keys.adjacencyList, adjacencyList, o.ttl);
          that.storage.set(keys.thumbprint, thumbprint, o.ttl);
          that.storage.set(keys.protocol, getProtocol(), o.ttl);
        }

        that._mergeProcessedData(processedData);
      }
    },

    // 数据转换
    // @return  {value: value, tokens: tokens, datum: datum}
    _transformDatum: function(datum) {
      var value = S.isString(datum) ? datum : datum[this.valueKey],
          tokens = datum.tokens || tokenizeText(value),
          item = { value: value, tokens: tokens };

      if (S.isString(datum)) {
        item.datum = {};
        item.datum[this.valueKey] = datum;
      }else {
        item.datum = datum;
      }

      // 关键字过滤
      item.tokens = S.filter(item.tokens, function(token) {
        return !S.isBlank(token);
      });

      // 统一转为小写
      item.tokens = S.map(item.tokens, function(token) {
        return token.toLowerCase();
      });

      return item;
    },

    // 数据分组(第一个字符)
    // @return  {itemHash: itemHash, adjacencyList: adjacencyList}
    _processData: function(data) {
      var that = this, itemHash = {}, adjacencyList = {};

      S.each(data, function(datum, i) {
        var item = that._transformDatum(datum),
            id = S.guid(item.value);

        itemHash[id] = item;

        S.each(item.tokens, function(token, i) {
          var character = token.charAt(0),
              adjacency = adjacencyList[character] ||
                (adjacencyList[character] = [id]);

          !~S.indexOf(adjacency, id) && adjacency.push(id);
        });
      });

      return { itemHash: itemHash, adjacencyList: adjacencyList };
    },

    // 数据合并
    _mergeProcessedData: function(processedData) {
      var that = this;

      // merge item hash
      S.mix(this.itemHash, processedData.itemHash);

      // merge adjacency list
      S.each(processedData.adjacencyList, function(adjacency, character) {
        var masterAdjacency = that.adjacencyList[character];

        that.adjacencyList[character] = masterAdjacency ?
          masterAdjacency.concat(adjacency) : adjacency;
      });
    },


    // 从本地缓存对象中获取匹配的数据
    _getLocalSuggestions: function(terms) {
      var that = this,
          firstChars = [],
          lists = [],
          shortestList,
          suggestions = [];


      S.each(terms, function(term, i) {
        var firstChar = term.charAt(0);
        !~S.indexOf(firstChars, firstChar) && firstChars.push(firstChar);
      });

      S.each(firstChars, function(firstChar, i) {
        var list = that.adjacencyList[firstChar];

        if (!list) { return false; }

        lists.push(list);

        if (!shortestList || list.length < shortestList.length) {
          shortestList = list;
        }
      });

      if (lists.length < firstChars.length) {
        return [];
      }

      S.each(shortestList, function(id, i) {
        var item = that.itemHash[id], isCandidate, isMatch;

        isCandidate = S.every(lists, function(list) {
          return ~S.indexOf(list, id);
        });

        isMatch = isCandidate && S.every(terms, function(term) {
          return S.some(item.tokens, function(token) {
            return token.indexOf(term) === 0;
          });
        });

        isMatch && suggestions.push(item);
      });

      return suggestions;
    },

    // 初始化
    initialize: function() {
      var deferred;

      this.local && this._processLocalData(this.local);

      this.transport = this.remote ? new Transport(this.remote) : null;

      deferred = this.prefetch ?
        this._loadPrefetchData(this.prefetch) :
        new $.Deferred().resolve();

      this.local = this.prefetch = this.remote = null;
      this.initialize = function() { return deferred; };

      return deferred;
    },

    // 根据查询条件获取匹配的数据源(优先从本地缓存中抓取)
    getSuggestions: function(query, cb) {
      var that = this, terms, suggestions, cacheHit = false;

      if (query.length < this.minLength) {
        return;
      }

      terms = tokenizeQuery(query);
      suggestions = this._getLocalSuggestions(terms).slice(0, this.limit);

      if (suggestions.length < this.limit && this.transport) {
        cacheHit = this.transport.get(query, processRemoteData);
      }


      !cacheHit && cb && cb(suggestions);

      // 远程获取
      function processRemoteData(data) {
        suggestions = suggestions.slice(0);

        // convert remote suggestions to object
        S.some(data, function(datum, i) {
          var item = that._transformDatum(datum), isDuplicate;

          // 是否存在重复
          isDuplicate = S.some(suggestions, function(suggestion) {
            return item.value === suggestion.value;
          });

          !isDuplicate && suggestions.push(item);

          // 保证不会超过最大限制数
          if(suggestions.length === that.limit){
            return true;
          }

        });

        cb && cb(suggestions);
      }
    }
  });

  return Dataset;


  // TODO 模板编译
  function compileTemplate(template, engine, valueKey) {
    var renderFn, compiledTemplate;

    if (S.isFunction(template)) {
      renderFn = template;
    }else if (S.isString(template)) {
      compiledTemplate = engine.compile(template);
      renderFn = S.bind(compiledTemplate.render, compiledTemplate);
    }else {
      renderFn = function(context) {
        return '<span>' + context[valueKey] + '</span>';
      };
    }
    return renderFn;
  }
})();

var InputView = (function() {

  // 构造函数
  function InputView(o) {
    var that = this;

    bindAll(this);

    this.specialKeyCodeMap = {
      9: 'tab',
      27: 'esc',
      37: 'left',
      39: 'right',
      13: 'enter',
      38: 'up',
      40: 'down'
    };

    this.$hint = $(o.hint);

    /* 事件注册 */
    this.$input = $(o.input)
    .on('blur' + AUTO_EVENT_NAMESPACE, this._handleBlur)
    .on('focus' + AUTO_EVENT_NAMESPACE, this._handleFocus)
    .on('keydown' + AUTO_EVENT_NAMESPACE, this._handleSpecialKeyEvent);


    // IE 不支持input事件
    if (!ua.ie) {
      this.$input.on('input' + AUTO_EVENT_NAMESPACE, this._compareQueryToInputValue);
    }else {
      this.$input.on('keydown' + AUTO_EVENT_NAMESPACE + ' keypress' + AUTO_EVENT_NAMESPACE + ' cut' + AUTO_EVENT_NAMESPACE + ' paste' + AUTO_EVENT_NAMESPACE, function($e) {
        if (that.specialKeyCodeMap[$e.which || $e.keyCode]) { return; }
        S.defer(that._compareQueryToInputValue);
      });
    }

    // 关键字
    this.query = this.$input.val();

    // 模拟input样式
    this.$overflowHelper = buildOverflowHelper(this.$input);
  }

  S.mix(InputView.prototype, EventTarget, {

    _handleFocus: function() {
      this.trigger('focused');
    },

    _handleBlur: function() {
      this.trigger('blured');
    },

    _handleSpecialKeyEvent: function($e) {
      // which is normalized and consistent (but not for IE)
      var keyName = this.specialKeyCodeMap[$e.which || $e.keyCode];

      keyName && this.trigger(keyName + 'Keyed', $e);
    },

    _compareQueryToInputValue: function() {
      var inputValue = this.getInputValue(),
          isSameQuery = compareQueries(this.query, inputValue),
          isSameQueryExceptWhitespace = isSameQuery ?
            this.query.length !== inputValue.length : false;

      if (isSameQueryExceptWhitespace) {
        this.trigger('whitespaceChanged', { value: this.query });
      }

      else if (!isSameQuery) {
        this.trigger('queryChanged', { value: this.query = inputValue });
      }
    },

    destroy: function() {
      this.$hint.off(AUTO_EVENT_NAMESPACE);
      this.$input.off(AUTO_EVENT_NAMESPACE);

      this.$hint = this.$input = this.$overflowHelper = null;
    },

    focus: function() {
      this.$input.focus();
    },

    blur: function() {
      this.$input.blur();
    },

    getQuery: function() {
      return this.query;
    },

    setQuery: function(query) {
      this.query = query;
    },

    getInputValue: function() {
      return this.$input.val();
    },

    setInputValue: function(value, silent) {
      this.$input.val(value);

      !silent && this._compareQueryToInputValue();
    },

    getHintValue: function() {
      return this.$hint.val();
    },

    setHintValue: function(value) {
      this.$hint.val(value);
    },

    getLanguageDirection: function() {
      return (this.$input.css('direction') || 'ltr').toLowerCase();
    },

    // 如果输入的文字超过了输入框的长度,则返回true
    isOverflow: function() {
      this.$overflowHelper.text(this.getInputValue());

      return this.$overflowHelper.width() > this.$input.width();
    },

    // 判断输入框光标是否在最后
    isCursorAtEnd: function() {
      var valueLength = this.$input.val().length,
          selectionStart = this.$input[0].selectionStart,
          range;

      if (S.isNumber(selectionStart)) {
       return selectionStart === valueLength;
      }

      else if (document.selection) {
        // this won't work unless the input has focus, the good news
        // is this code should only get called when the input has focus
        range = document.selection.createRange();
        range.moveStart('character', -valueLength);

        return valueLength === range.text.length;
      }

      return true;
    }
  });

  return InputView;

  function buildOverflowHelper($input) {
    return $('<span></span>')
    .css({
      // position helper off-screen
      position: 'absolute',
      left: '-9999px',
      visibility: 'hidden',
      // avoid line breaks
      whiteSpace: 'nowrap',
      // use same font css as input to calculate accurate width
      fontFamily: $input.css('font-family'),
      fontSize: $input.css('font-size'),
      fontStyle: $input.css('font-style'),
      fontVariant: $input.css('font-variant'),
      fontWeight: $input.css('font-weight'),
      wordSpacing: $input.css('word-spacing'),
      letterSpacing: $input.css('letter-spacing'),
      textIndent: $input.css('text-indent'),
      textRendering: $input.css('text-rendering'),
      textTransform: $input.css('text-transform')
    })
    .insertAfter($input);
  }

  function compareQueries(a, b) {
    // strips leading whitespace and condenses all whitespace
    a = (a || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
    b = (b || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');

    return a === b;
  }
})();

var DropdownView = (function() {
  var html = {
        suggestionsList: '<div class="autocomplete-suggestions"></div>'
      },
      css = {
        suggestionsList: { display: 'block' },
        suggestion: { whiteSpace: 'nowrap', cursor: 'pointer' },
        suggestionChild: { whiteSpace: 'normal' }
      };

  // 构造函数
  function DropdownView(o) {
    bindAll(this);

    this.isOpen = false;
    this.isEmpty = true;
    this.isMouseOverDropdown = false;

    this.$menu = $(o.menu)
    .on('mouseenter' + AUTO_EVENT_NAMESPACE, this._handleMouseenter)
    .on('mouseleave' + AUTO_EVENT_NAMESPACE, this._handleMouseleave)
    .on('click' + AUTO_EVENT_NAMESPACE, '.autocomplete-suggestion', this._handleSelection)
    .on('mouseover' + AUTO_EVENT_NAMESPACE, '.autocomplete-suggestion', this._handleMouseover);
  }

  S.mix(DropdownView.prototype, EventTarget, {
    _handleMouseenter: function() {
      this.isMouseOverDropdown = true;
    },

    _handleMouseleave: function() {
      this.isMouseOverDropdown = false;
    },

    _handleMouseover: function($e) {
      var $suggestion = $($e.currentTarget);

      this._getSuggestions().removeClass('autocomplete-is-under-cursor');
      $suggestion.addClass('autocomplete-is-under-cursor');
    },

    _handleSelection: function($e) {
      var $suggestion = $($e.currentTarget);
      this.trigger('suggestionSelected', extractSuggestion($suggestion));
    },

    _show: function() {
      this.$menu.css('display', 'block');
    },

    _hide: function() {
      this.$menu.hide();
    },

    _moveCursor: function(increment) {
      var $suggestions, $cur, nextIndex, $underCursor;

      // don't bother moving the cursor if the menu is closed or empty
      if (!this.isVisible()) {
        return;
      }

      $suggestions = this._getSuggestions();
      $cur = $suggestions.filter('.autocomplete-is-under-cursor');

      $cur.removeClass('autocomplete-is-under-cursor');

      // shifting before and after modulo to deal with -1 index of search input
      nextIndex = $suggestions.index($cur) + increment;
      nextIndex = (nextIndex + 1) % ($suggestions.length + 1) - 1;

      if (nextIndex === -1) {
        this.trigger('cursorRemoved');

        return;
      }

      else if (nextIndex < -1) {
        // circle to last suggestion
        nextIndex = $suggestions.length - 1;
      }

      $underCursor = $suggestions.eq(nextIndex).addClass('autocomplete-is-under-cursor');

      // in the case of scrollable overflow
      // make sure the cursor is visible in the menu
      this._ensureVisibility($underCursor);

      this.trigger('cursorMoved', extractSuggestion($underCursor));
    },

    _getSuggestions: function() {
      return this.$menu.find('.autocomplete-suggestions > .autocomplete-suggestion');
    },

    _ensureVisibility: function($el) {
      var menuHeight = this.$menu.height() +
            parseInt(this.$menu.css('paddingTop'), 10) +
            parseInt(this.$menu.css('paddingBottom'), 10),
          menuScrollTop = this.$menu.scrollTop(),
          elTop = $el.position().top,
          elBottom = elTop + $el.outerHeight(true);

      if (elTop < 0) {
        this.$menu.scrollTop(menuScrollTop + elTop);
      }

      else if (menuHeight < elBottom) {
        this.$menu.scrollTop(menuScrollTop + (elBottom - menuHeight));
      }
    },

    destroy: function() {
      this.$menu.off(AUTO_EVENT_NAMESPACE);

      this.$menu = null;
    },

    isVisible: function() {
      return this.isOpen && !this.isEmpty;
    },

    closeUnlessMouseIsOverDropdown: function() {
      if (!this.isMouseOverDropdown) {
        this.close();
      }
    },

    close: function() {
      if (this.isOpen) {
        this.isOpen = false;
        this.isMouseOverDropdown = false;
        this._hide();

        this.$menu
        .find('.autocomplete-suggestions > .autocomplete-suggestion')
        .removeClass('autocomplete-is-under-cursor');

        this.trigger('closed');
      }
    },

    open: function() {
      if (!this.isOpen) {
        this.isOpen = true;
        !this.isEmpty && this._show();

        this.trigger('opened');
      }
    },

    setLanguageDirection: function(dir) {
      var ltrCss = { left: '0', right: 'auto' },
          rtlCss = { left: 'auto', right:' 0' };

      dir === 'ltr' ? this.$menu.css(ltrCss) : this.$menu.css(rtlCss);
    },

    moveCursorUp: function() {
      this._moveCursor(-1);
    },

    moveCursorDown: function() {
      this._moveCursor(+1);
    },

    getSuggestionUnderCursor: function() {
      var $suggestion = this._getSuggestions()
          .filter('.autocomplete-is-under-cursor')
          .first();

      return $suggestion.length > 0 ? extractSuggestion($suggestion) : null;
    },

    getFirstSuggestion: function() {
      var $suggestion = this._getSuggestions().first();

      return $suggestion.length > 0 ? extractSuggestion($suggestion) : null;
    },

    // TODO
    renderSuggestions: function(dataset, suggestions) {
      var datasetClassName = 'autocomplete-dataset-' + dataset.name,
          wrapper = '<div class="autocomplete-suggestion">%body</div>',
          compiledHtml,
          $suggestionsList,
          $dataset = this.$menu.find('.' + datasetClassName),
          elBuilder,
          fragment,
          $el;

      // first time rendering suggestions for this dataset
      if ($dataset.length === 0) {
        $suggestionsList = $(html.suggestionsList).css(css.suggestionsList);

        $dataset = $('<div></div>')
        .addClass(datasetClassName)
        .append(dataset.header)
        .append($suggestionsList)
        .append(dataset.footer)
        .appendTo(this.$menu);
      }

      // suggestions to be rendered
      if (suggestions.length > 0) {
        this.isEmpty = false;
        this.isOpen && this._show();

        elBuilder = document.createElement('div');
        fragment = document.createDocumentFragment();

        S.each(suggestions, function(suggestion, i) {
          suggestion.dataset = dataset.name;
          compiledHtml = dataset.template(suggestion.datum);
          elBuilder.innerHTML = wrapper.replace('%body', compiledHtml);

          $el = $(elBuilder.firstChild)
          .css(css.suggestion)
          .data('suggestion', suggestion);

          $el.children().each(function() {
            $(this).css(css.suggestionChild);
          });

          fragment.appendChild($el[0]);
        });

        // show this dataset in case it was previously empty
        // and render the new suggestions
        $dataset.show().find('.autocomplete-suggestions').html(fragment);
      }else {
        this.clearSuggestions(dataset.name);
      }

      // 数据项渲染后,触发suggestionsRendered事件
      this.trigger('suggestionsRendered');
    },

    // 清理/隐藏补全项
    clearSuggestions: function(datasetName) {
      var $datasets = datasetName ?
            this.$menu.find('.autocomplete-dataset-' + datasetName) :
            this.$menu.find('[class^="autocomplete-dataset-"]'),
          $suggestions = $datasets.find('.autocomplete-suggestions');

      $datasets.hide();
      $suggestions.empty();

      if (this._getSuggestions().length === 0) {
        this.isEmpty = true;
        this._hide();
      }
    }
  });

  return DropdownView;


  function extractSuggestion($el) {
    return $el.data('suggestion');
  }
})();

var TypeaheadView = (function() {
  var html = {
        // 包含容器
        wrapper: '<span class="' + AUTO_WRAPPER_CLASSNAME + '"></span>',
        // 文字提示
        hint: '<input class="' + AUTO_HINT_CLASSNAME + '" type="text" autocomplete="off" spellcheck="off" disabled>',
        // 自动补全下拉容器
        dropdown: '<div class="' + AUTO_DD_MENU_CLASSNAME + '"></div>'
      },
      css = {
        wrapper: {
          position: 'relative',
          display: 'inline-block'
        },
        hint: {
          position: 'absolute',
          top: '0',
          left: '0',
          borderColor: 'transparent',
          boxShadow: 'none'
        },
        query: {
          position: 'relative',
          verticalAlign: 'top',
          backgroundColor: 'transparent'
        },
        dropdown: {
          position: 'absolute',
          top: '100%',
          left: '0',
          // TODO: should this be configurable?
          zIndex: '100',
          display: 'none'
        }
      },

      mise = ua.ie

    ;

  if (mise) {
    S.mix(css.query, {
      // 透明图
      backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)'
    });

    if (mise <= 7) {
      S.mix(css.wrapper, { display: 'inline', zoom: '1' });
      
      if(mise === 6){
        S.mix(css.query, { marginTop: '-1px' });
      }

    }
  }



  function TypeaheadView(o) {
    var $menu, $input, $hint;

    bindAll(this);

    this.$node = buildDomStructure(o.input);
    this.datasets = o.datasets;
    this.dir = null;

    this.eventBus = o.eventBus;

    $menu = $('.' + AUTO_DD_MENU_CLASSNAME, this.$node[0]);
    $input = $('.' + AUTO_QUERY_CLASSNAME, this.$node[0]);
    $hint = $('.' + AUTO_HINT_CLASSNAME, this.$node[0]);

    this.dropdownView = new DropdownView({ menu: $menu })
    .on('suggestionSelected', this._handleSelection)
    .on('cursorMoved', this._clearHint)
    .on('cursorMoved', this._setInputValueToSuggestionUnderCursor)
    .on('cursorRemoved', this._setInputValueToQuery)
    .on('cursorRemoved', this._updateHint)
    .on('suggestionsRendered', this._updateHint)
    .on('opened', this._updateHint)
    .on('closed', this._clearHint)
    .on('opened closed', this._propagateEvent);

    this.inputView = new InputView({ input: $input, hint: $hint })
    .on('focused', this._openDropdown)
    .on('blured', this._closeDropdown)
    .on('blured', this._setInputValueToQuery)
    .on('enterKeyed tabKeyed', this._handleSelection)
    .on('queryChanged', this._clearHint)
    .on('queryChanged', this._clearSuggestions)
    .on('queryChanged', this._getSuggestions)
    .on('whitespaceChanged', this._updateHint)
    .on('queryChanged whitespaceChanged', this._openDropdown)
    .on('queryChanged whitespaceChanged', this._setLanguageDirection)
    .on('escKeyed', this._closeDropdown)
    .on('escKeyed', this._setInputValueToQuery)
    .on('tabKeyed upKeyed downKeyed', this._managePreventDefault)
    .on('upKeyed downKeyed', this._moveDropdownCursor)
    .on('upKeyed downKeyed', this._openDropdown)
    .on('tabKeyed leftKeyed rightKeyed', this._autocomplete);
  }

  S.mix(TypeaheadView.prototype, EventTarget, {

    _managePreventDefault: function(e) {
      var $e = e.data,
          hint,
          inputValue,
          preventDefault = false;

      switch (e.type) {
        case 'tabKeyed':
          hint = this.inputView.getHintValue();
          inputValue = this.inputView.getInputValue();
          preventDefault = hint && hint !== inputValue;
          break;

        case 'upKeyed':
        case 'downKeyed':
          preventDefault = !$e.shiftKey && !$e.ctrlKey && !$e.metaKey;
          break;
      }

      preventDefault && $e.preventDefault();
    },

    _setLanguageDirection: function() {
      var dir = this.inputView.getLanguageDirection();

      if (dir !== this.dir) {
        this.dir = dir;
        this.$node.css('direction', dir);
        this.dropdownView.setLanguageDirection(dir);
      }
    },

    _updateHint: function() {
      var suggestion = this.dropdownView.getFirstSuggestion(),
          hint = suggestion ? suggestion.value : null,
          dropdownIsVisible = this.dropdownView.isVisible(),
          inputHasOverflow = this.inputView.isOverflow(),
          inputValue,
          query,
          escapedQuery,
          beginsWithQuery,
          match;

      if (hint && dropdownIsVisible && !inputHasOverflow) {
        inputValue = this.inputView.getInputValue();
        query = inputValue
        .replace(/\s{2,}/g, ' ') // condense whitespace
        .replace(/^\s+/g, ''); // strip leading whitespace
        escapedQuery = escapeRegExChars(query);

        beginsWithQuery = new RegExp('^(?:' + escapedQuery + ')(.*$)', 'i');
        match = beginsWithQuery.exec(hint);

        this.inputView.setHintValue(inputValue + (match ? match[1] : ''));
      }
    },

    _clearHint: function() {
      this.inputView.setHintValue('');
    },

    _clearSuggestions: function() {
      this.dropdownView.clearSuggestions();
    },

    _setInputValueToQuery: function() {
      this.inputView.setInputValue(this.inputView.getQuery());
    },

    _setInputValueToSuggestionUnderCursor: function(e) {
      var suggestion = e.data;

      this.inputView.setInputValue(suggestion.value, true);
    },

    _openDropdown: function() {
      this.dropdownView.open();
    },

    _closeDropdown: function(e) {
      this.dropdownView[e.type === 'blured' ?
        'closeUnlessMouseIsOverDropdown' : 'close']();
    },

    _moveDropdownCursor: function(e) {
      var $e = e.data;

      if (!$e.shiftKey && !$e.ctrlKey && !$e.metaKey) {
        this.dropdownView[e.type === 'upKeyed' ?
          'moveCursorUp' : 'moveCursorDown']();
      }
    },

    _handleSelection: function(e) {
      var byClick = e.type === 'suggestionSelected',
          suggestion = byClick ?
            e.data : this.dropdownView.getSuggestionUnderCursor();

      if (suggestion) {
        this.inputView.setInputValue(suggestion.value);

        // if triggered by click, ensure the query input still has focus
        // if triggered by keypress, prevent default browser behavior
        // which is most likely the submission of a form
        // note: e.data is the jquery event
        byClick ? this.inputView.focus() : e.data.preventDefault();

        // focus is not a synchronous event in ie, so we deal with it
        byClick && ua.ie ?
          S.defer(this.dropdownView.close) : this.dropdownView.close();

        this.eventBus.trigger('selected', suggestion.datum, suggestion.dataset);
      }
    },

    _getSuggestions: function() {
      var that = this, query = this.inputView.getQuery();

      if (S.isBlank(query)) { return; }

      S.each(this.datasets, function(dataset, i) {
        dataset.getSuggestions(query, function(suggestions) {
          // only render the suggestions if the query hasn't changed
          if (query === that.inputView.getQuery()) {
            that.dropdownView.renderSuggestions(dataset, suggestions);
          }
        });
      });
    },

    _autocomplete: function(e) {
      var isCursorAtEnd, ignoreEvent, query, hint, suggestion;

      if (e.type === 'rightKeyed' || e.type === 'leftKeyed') {
        isCursorAtEnd = this.inputView.isCursorAtEnd();
        ignoreEvent = this.inputView.getLanguageDirection() === 'ltr' ?
          e.type === 'leftKeyed' : e.type === 'rightKeyed';

        if (!isCursorAtEnd || ignoreEvent) { return; }
      }

      query = this.inputView.getQuery();
      hint = this.inputView.getHintValue();

      if (hint !== '' && query !== hint) {
        suggestion = this.dropdownView.getFirstSuggestion();
        this.inputView.setInputValue(suggestion.value);

        this.eventBus.trigger(
          'autocompleted',
          suggestion.datum,
          suggestion.dataset
        );
      }
    },

    _propagateEvent: function(e) {
      this.eventBus.trigger(e.type);
    },

    // public methods
    // --------------

    destroy: function() {
      this.inputView.destroy();
      this.dropdownView.destroy();

      destroyDomStructure(this.$node);

      this.$node = null;
    },

    setQuery: function(query) {
      this.inputView.setQuery(query);
      this.inputView.setInputValue(query);

      this._clearHint();
      this._clearSuggestions();
      this._getSuggestions();
    }
  });

  return TypeaheadView;

  // 容器结构创建(.autocomplete-wrapper)
  function buildDomStructure(input) {
    var $wrapper = $(html.wrapper),
        $dropdown = $(html.dropdown),
        $input = $(input),
        $hint = $(html.hint);

    $wrapper = $wrapper.css(css.wrapper);
    $dropdown = $dropdown.css(css.dropdown);

    $hint.css(css.hint)
    // copy background styles from query input to hint input
    .css({
      backgroundAttachment: $input.css('background-attachment'),
      backgroundClip: $input.css('background-clip'),
      backgroundColor: $input.css('background-color'),
      backgroundImage: $input.css('background-image'),
      backgroundOrigin: $input.css('background-origin'),
      backgroundPosition: $input.css('background-position'),
      backgroundRepeat: $input.css('background-repeat'),
      backgroundSize: $input.css('background-size')
    });

    // 记录输入框的属性
    $input.data('original-attrs', {
      dir: $input.attr('dir'),
      autocomplete: $input.attr('autocomplete'),
      spellcheck: $input.attr('spellcheck'),
      style: $input.attr('style')
    });

    $input
    .addClass(AUTO_QUERY_CLASSNAME)
    .attr({ autocomplete: 'off', spellcheck: false })
    .css(css.query);

    try { !$input.attr('dir') && $input.attr('dir', 'auto'); } catch (e) {}

    return $input
    .wrap($wrapper)
    .parent()
    .prepend($hint)
    .append($dropdown);
  }

  function destroyDomStructure($node) {
    var $input = $node.find('.' + AUTO_QUERY_CLASSNAME);

    // need to remove attrs that weren't previously defined and
    // revert attrs that originally had a value
    S.each($input.data('original-attrs'), function(val, key) {
      S.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
    });

    $input
    .detach()
    .removeData('original-attrs')
    .removeClass(AUTO_QUERY_CLASSNAME)
    .insertAfter($node);

    $node.remove();
  }
})();

(function() {
  var cache = {}, viewKey = 'ttView', methods;

  methods = {
    initialize: function(datasetDefs) {
      var datasets;

      datasetDefs = S.isArray(datasetDefs) ? datasetDefs : [datasetDefs];

      if (datasetDefs.length === 0) {
        $.error('no datasets provided');
      }

      datasets = S.map(datasetDefs, function(o) {
        var dataset = cache[o.name] ? cache[o.name] :  new Dataset(o);

        if (o.name) {
          cache[o.name] = dataset;
        }

        return dataset;
      });

      return this.each(initialize);

      function initialize() {
        var $input = $(this),
            deferreds,
            eventBus = new EventBus({ el: $input });

        deferreds = S.map(datasets, function(dataset) {
          return dataset.initialize();
        });

        $input.data(viewKey, new TypeaheadView({
          input: $input,
          eventBus: eventBus = new EventBus({ el: $input }),
          datasets: datasets
        }));

        $.when.apply($, deferreds)
        .always(function() {
          S.defer(function() { eventBus.trigger('initialized'); });
        });
      }
    },

    destroy: function() {
      return this.each(destroy);

      function destroy() {
        var $this = $(this), view = $this.data(viewKey);

        if (view) {
          view.destroy();
          $this.removeData(viewKey);
        }
      }
    },

    setQuery: function(query) {
      return this.each(setQuery);

      function setQuery() {
        var view = $(this).data(viewKey);

        view && view.setQuery(query);
      }
    }
  };




  // 接口定义
  autocomplete = function(input, method){
    var $input = $(input),
        execute,
        executable,
        executeParams;

    // 如果不存在目标输入框,则终止
    if($input.length === 0){
      return;
    }

    execute = methods[method];
    executable = S.isFunction(execute);
    executeParams = [].slice.call(arguments, (executable ? 2 : 1));

    method = executable ? execute : methods["initialize"];

    method.apply($input, executeParams);

  }
})();

  
  return autocomplete;


});