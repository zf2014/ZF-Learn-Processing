/**
 *  自动补全接口定义
 */ 
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
  S.autocomplete = function(input, method){
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
