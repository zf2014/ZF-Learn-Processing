/**
 *
 *  @desc: 查询字符串处理
 *
 *  @API:  ^parse ^stringify
 *
 *  @author: qzzf1987@gmail.com
 *
 *  @create: 2013-04-01
 *
 *  @last: 2013-04-23
 */
;
(function(S, undefined) {

  var stack = [],
    // Parse a key=val string.
    // These can get pretty hairy
    // example flow:
    // parse(foo[bar][][bla]=baz)
    // return parse(foo[bar][][bla],"baz")
    // return parse(foo[bar][], {bla : "baz"})
    // return parse(foo[bar], [{bla:"baz"}])
    // return parse(foo, {bar:[{bla:"baz"}]})
    // return {foo:{bar:[{bla:"baz"}]}}
    pieceParser = function(eq) {
      return function parsePiece(key, val) {

        var sliced, numVal, head, tail, ret;

        if (arguments.length !== 2) {
          // key=val, called from the map/reduce
          key = key.split(eq);
          return parsePiece(
            unescape(key.shift()),
            unescape(key.join(eq))
          );
        }
        key = key.replace(/^\s+|\s+$/g, '');
        if (S.isString(val)) {
          val = val.replace(/^\s+|\s+$/g, '');
          // convert numerals to numbers
          if (!isNaN(val)) {
            numVal = +val;
            if (val === numVal.toString(10)) {
              val = numVal;
            }
          }
        }
        sliced = /(.*)\[([^\]]*)\]$/.exec(key);
        if (!sliced) {
          ret = {};
          if (key) {
            ret[key] = val;
          }
          return ret;
        }
        // ["foo[][bar][][baz]", "foo[][bar][]", "baz"]
        tail = sliced[2];
        head = sliced[1];

        // array: key[]=val
        if (!tail) {
          return parsePiece(head, [val]);
        }

        // obj: key[subkey]=val
        ret = {};
        ret[tail] = val;
        return parsePiece(head, ret);
      };
    },

    // the reducer function that merges each query piece together into one set of params
    mergeParams = function(params, addition) {
      return (
        // if it's uncontested, then just return the addition.
        (!params) ? addition
        // if the existing value is an array, then concat it.
        : (S.isArray(params)) ? params.concat(addition)
        // if the existing value is not an array, and either are not objects, arrayify it.
        : (!S.isObject(params) || !S.isObject(addition)) ? [params].concat(addition)
        // else merge them as objects, which is a little more complex
        : mergeObjects(params, addition)
      );
    },

    // Merge two *objects* together. If this is called, we've already ruled
    // out the simple cases, and need to do the for-in business.
    mergeObjects = function(params, addition) {
      for (var i in addition) {
        if (i && addition.hasOwnProperty(i)) {
          params[i] = mergeParams(params[i], addition[i]);
        }
      }
      return params;
    },

    // replace "+" with " ", and then decodeURIComponent behavior.
    // decode
    unescape = function(str) {
      return decodeURIComponent(str.replace(/\+/g, ' '));
    },

    escape = function(str) {
      return encodeURIComponent(str);
    };

  var qs = S.namespace('qs');

  S.mix(qs, {
    /**
     *
     * 查询字符串解析
     *
     * @param  {String}  str       查询字符串
     * @param  {String}  sep       分隔符
     * @param  {String}  eq        连接符
     *
     * @return {Object}  解析对象
     *
     */
    parse: function(str, sep, eq) {
      var obj = {};
      S.reduce(

        S.map(
          str.split(sep || "&"),
          pieceParser(eq || "=")
        ), mergeParams, obj
      );

      return obj;
    },

    /**
     *
     * 对象序列化成查询字符串
     *
     * @param  {String}  obj       目标对象
     * @param  {String}  c         序列化选项
     *    sep                      分隔符
     *    eq                       连接符
     *    arrayKey                 数组表示
     * @param  {String}  name      序列化参数名
     *
     * @return {String}  序列化字符串
     *
     */
    stringify: function(obj, c, name) {
      var sep = c && c.sep ? c.sep : '&',
        eq = c && c.eq ? c.eq : '=',
        aK = c && c.arrayKey ? c.arrayKey : false,
        begin,
        end,
        i,
        l,
        n,
        s;

      if (S.isNull(obj) || S.isUndefined(obj) || S.isFunction(obj)) {
        return name ? escape(name) + eq : '';
      }

      if (S.isBoolean(obj)) {
        obj = +obj;
      }

      if (S.isNumber(obj) || S.isString(obj)) {
        return escape(name) + eq + escape(obj);
      }

      if (S.isArray(obj)) {
        s = [];
        name = aK ? name + '[]' : name;
        l = obj.length;
        for (i = 0; i < l; i++) {
          s.push(qs.stringify(obj[i], c, name));
        }

        return s.join(sep);
      }
      // now we know it's an object.
      // Y.log(
      //     typeof obj + (typeof obj === 'object' ? " ok" : "ONOES!")+
      //     Object.prototype.toString.call(obj)
      // );

      // Check for cyclical references in nested objects
      for (i = stack.length - 1; i >= 0; --i) {
        if (stack[i] === obj) {
          throw new Error("qs.stringify. Cyclical reference");
        }
      }

      stack.push(obj);
      s = [];
      begin = name ? name + '[' : '';
      end = name ? ']' : '';
      for (i in obj) {
        if (obj.hasOwnProperty(i)) {
          n = begin + i + end;
          s.push(qs.stringify(obj[i], c, n));
        }
      }

      stack.pop();
      s = s.join(sep);
      if (!s && name) {
        return name + "=";
      }

      return s;
    }
  });

})(window.zjport);