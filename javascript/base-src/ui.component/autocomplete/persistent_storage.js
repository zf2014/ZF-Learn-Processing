/**
 *  持久化数据
 */ 
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
