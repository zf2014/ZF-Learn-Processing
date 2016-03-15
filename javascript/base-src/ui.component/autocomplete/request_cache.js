/**
 * http请求结果缓存,缓存标识符:url  
 */ 
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
