/**
 *  数据传播对象(Ajax)
 */ 
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
