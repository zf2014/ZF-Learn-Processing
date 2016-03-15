/**
 *  
 *  @desc: 文本选择(光标)
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-08-06 
 *  
 *  @last: 2013-08-06
 */
(function($, S, undefined) {
  var win = S.ENV.host,
      doc = win.document,
      isStandard = typeof win.getSelection === 'function',

      Selection = S.namespace('Selection')
  ;

  /**
   * 获取目标元素文本选择选择区域的基本信息
   *
   * @param   {Element}   element         目标元素
   * @return  {Object}    return
   * @return  {String}    return.text     返回选择内容
   * @return  {Integer}   return.start    开始光标位置
   * @return  {Integer}   return.end      结束光标位置
   */
  var _getCaretInfo = function(element) {
    var res = {
      text: '',
      start: 0,
      end: 0
    };

    if (!element.value) {
      return res;
    }

    try {

      // 不支持标准的getSelection函数
      if (isStandard) {
        res.start = element.selectionStart;
        res.end = element.selectionEnd;
        res.text = element.value.slice(res.start, res.end);
      // 非标准
      } else if (doc.selection) {
        // 首先需要先获得焦点
        element.focus();

        var range = doc.selection.createRange(),  // 用户选择的TextRange
            range2 = doc.body.createTextRange()   // 创建新TextRange2
        ;

        res.text = range.text;

        try {
          // TextRange2包含目标元素内容
          range2.moveToElementText(element);
          // TextRange2设置起始光标
          range2.setEndPoint('StartToStart', range);
        } catch (e) {
          range2 = element.createTextRange();
          range2.setEndPoint('StartToStart', range);
        }

        // 计算选择文本光标起始位置
        res.start = element.value.length - range2.text.length;
        // 计算选择文本光标结束位置
        res.end = res.start + range.text.length;
      }
    } catch (e) {
      S.debug('错误异常：%o', e);
    }

    return res;
  };



  /**
   * 光标操作
   *
   * @type {Object}
   */
  var _CaretOperation = {

    /**
     * 获取光标在目标元素中的位置
     *
     * @param   {Element}   element         目标元素
     * @return  {Object}    return
     * @return  {Integer}   return.start    起始位置
     * @return  {Integer}   return.end      结束位置
     */
    getPos: function(element) {
      var info = _getCaretInfo(element);
      return {
        start: info.start,
        end: info.end
      };
    },

    /**
     * 设置光标在目标元素中的位置
     *
     * @param   {Element}   element         目标元素
     * @param   {Object}    toRange         
     * @param   {Integer}   toRange.start   起始位置设置
     * @param   {Integer}   toRange.end     结束位置设置
     * @param   {String}    caret           光标合并压缩位置 {'start' or 'end'}
     */
    setPos: function(element, toRange, caret) {
      caret = this._caretMode(caret);

      if (caret == 'start') {
        toRange.end = toRange.start;
      } else if (caret == 'end') {
        toRange.start = toRange.end;
      }

      element.focus();
      try {
        if (element.createTextRange) {
          var range = element.createTextRange();

          if (win.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
            toRange.start = element.value.substr(0, toRange.start).replace(/\r/g, '').length;
            toRange.end = element.value.substr(0, toRange.end).replace(/\r/g, '').length;
          }

          range.collapse(true);
          range.moveStart('character', toRange.start);
          range.moveEnd('character', toRange.end - toRange.start);

          range.select();
        } else if (element.setSelectionRange) {
          element.setSelectionRange(toRange.start, toRange.end);
        } else{
          // TODO 
        }
      } catch (e) {
        S.debug('错误异常：%o', e);
      }
    },

    /**
     * 获取选择文本
     *
     * @param   {Element}   element         目标元素
     * @return  {String}    return          文本内容
     */
    getText: function(element) {
      return _getCaretInfo(element).text;
    },

    /**
     * 光标位置模式
     *
     * @param   {String}    caret           
     * @return  {String}    return          "keep" | "start" | "end"
     */
    _caretMode: function(caret) {
      
      if (caret === false) {
        caret = 'end';
      }

      switch (caret) {
        // 保持原状
        case 'keep':
        // 起始位置
        case 'start':
        // 结束位置
        case 'end':
          break;

        default:
          caret = 'keep';
      }

      return caret;
    },

    /**
     * 
     *
     * @param   {Element}   element         目标元素
     * @param   {String}    text            替换文本
     * @param   {String}    caret           "keep" | "start" | "end"
     */
    replace: function(element, text, caret) {
      var tmp = _getCaretInfo(element),
          orig = element.value,
          pos = $(element).scrollTop(),
          range = {
            start: tmp.start,
            end: tmp.start + text.length
          };

      element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.end);

      $(element).scrollTop(pos);

      this.setPos(element, range, caret);
    },

    /**
     * 选择文本前面插入特定文本
     *
     * @param   {Element}   element         目标元素
     * @param   {String}    text            待插入文本
     * @param   {String}    caret           "keep" | "start" | "end"
     */
    insertBefore: function(element, text, caret) {
      var tmp = _getCaretInfo(element),
          orig = element.value,
          pos = $(element).scrollTop(),
          range = {
            start: tmp.start + text.length,
            end: tmp.end + text.length
          };

      element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.start);

      $(element).scrollTop(pos);
      this.setPos(element, range, caret);
    },

    /**
     * 选择文本末尾插入特定文本
     *
     * @param   {Element}   element         目标元素
     * @param   {String}    text            待插入文本
     * @param   {String}    caret           "keep" | "start" | "end"
     */
    insertAfter: function(element, text, caret) {
      var tmp = _getCaretInfo(element),
        orig = element.value,
        pos = $(element).scrollTop(),
        range = {
          start: tmp.start,
          end: tmp.end
        };

      element.value = orig.substr(0, tmp.end) + text + orig.substr(tmp.end);

      $(element).scrollTop(pos);
      this.setPos(element, range, caret);
    }
  };
  
  
  /**
   * API
   * zjport.selection.apiMethod
   */
  S.mix(Selection, {

   /**
     * 获取光标位置
     *
     * @param   {Element}   element         目标元素
     * @return  {Object}    return
     * @return  {Integer}   return.start    开始光标位置
     * @return  {Integer}   return.end      结束光标位置
    **/
    getPos: function(element){
      return _CaretOperation.getPos(element);
    },

    /**
     * 设置光标位置
     *
     * @param   {Element}   element         目标元素
     * @param   {Object}    opts            光标位置
     * @param   {Integer}   opts.start      光标起始位置
     * @param   {Integer}   opts.end        光标结束位置
     * 
    **/
    setPos: function(element, opts){
      _CaretOperation.setPos(element, opts);
    },

    /**
     * 文本替换
     *
     * @param   {Element}   element         目标元素
     * @param   {Object}    opts            替换参数
     * @param   {Integer}   opts.text       替换内容
     * @param   {Integer}   opts.caret      光标模式 ["keep", "start", "end"]
     * 
    **/
    replace: function(element, opts){
      _CaretOperation.replace(element, opts.text, opts.caret);
    },

    /**
     * 文本插入
     *
     * @param   {Element}   element         目标元素
     * @param   {Object}    opts            插入参数
     * @param   {Integer}   opts.mode       插入模式 ['before, ]
     * @param   {Integer}   opts.text       插入内容
     * @param   {Integer}   opts.caret      光标模式 ["keep", "start", "end"]
     * 
    **/
    insert: function(element, opts){
      if (opts.mode === 'before') {
        _CaretOperation.insertBefore(element, opts.text, opts.caret);
      } else {
        _CaretOperation.insertAfter(element, opts.text, opts.caret);
      }
    },

    /**
     * 获取选择文本
     *
     * @param   {Element}   element         目标元素
     * @return  {String}                    选择文本
     * 
    **/
    getText: function(element){
      return _CaretOperation.getText(element);
    },

    /**
     * 获取选择内容(Text | Html)
     *
     * @param   {String}   mode             内容模式 ['text', 'html']
     * @return  {String}                    选择内容
     * 
    **/
    get: function(mode){
      var getText = ((mode || 'text').toLowerCase() == 'text');

      try {
        if (isStandard) {
          // get text
          if (getText) {
            return win.getSelection().toString();
          } else {
            // get html
            var sel = win.getSelection(),
                range;

            if (sel.getRangeAt) {
              range = sel.getRangeAt(0);
            } else {
              range = doc.createRange();
              range.setStart(sel.anchorNode, sel.anchorOffset);
              range.setEnd(sel.focusNode, sel.focusOffset);
            }
            return $('<div></div>').append(range.cloneContents()).html();
          }
        } else if (doc.selection) {
          if (getText) {
            // get text
            return doc.selection.createRange().text;
          } else {
            // get html
            return doc.selection.createRange().htmlText;
          }
        }
      } catch (e) {
        S.debug('错误异常：%o', e);
      }
      return '';
    }

  });
})(jQuery, window.zjport);