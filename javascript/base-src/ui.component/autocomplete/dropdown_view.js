/**
 *  查询结果对象(TODO 样式修改)
 *  
 */ 
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
