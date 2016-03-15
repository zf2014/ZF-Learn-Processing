/**
 *  数据集(Dataset)
 */ 
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

      // 如果只是远程抓取,且本地匹配数据不够
      if (suggestions.length < this.limit && this.transport) {
        cacheHit = this.transport.get(query, processRemoteData);
      }


      !cacheHit && cb && cb(suggestions);

      // 远程获取
      function processRemoteData(data) {
        suggestions = suggestions.slice(0);

        // convert remote suggestions to object
        S.each(data, function(datum, i) {
          var item = that._transformDatum(datum), isDuplicate;

          // 是否存在重复
          isDuplicate = S.some(suggestions, function(suggestion) {
            return item.value === suggestion.value;
          });

          !isDuplicate && suggestions.push(item);

          // 保证不会超过最大限制数
          return suggestions.length < that.limit;
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
