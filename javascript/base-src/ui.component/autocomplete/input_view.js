/**
 *  输入框
 */ 
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
