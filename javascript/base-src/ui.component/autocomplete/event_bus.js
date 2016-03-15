/**
 *  事件总线
 */ 
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
