/**
 *  @desc: 事件触发器
 *		@example
 *			var emitter = new EventEmitter(),
 *					handleResult
 *			;
 *      emitter.addListener('eventName', listener);
 *      handleResult = emitter.trigger('eventName');
 *
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-09-11 
 *  
 *  @last: 2013-09-11
 *  
 */
(function () {
	'use strict';

	/**
	 * 构造函数
	 */
	function EventEmitter() {}

	// 原型对象
	var proto = EventEmitter.prototype;

	/**
	 * 事件索引
	 *
	 * @param {Function[]} 所有事件
	 * @param {Function} 指定事件
	 * @return {Number} 索引值
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * 别名操作
	 *
	 * @param {String} 需要提供别名的目标函数名称
	 * @return {Function} 别名后的函数
   *
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * 根据事件名称,返回一致的事件
	 *
	 * @param {String|RegExp} 事件名称
	 * @return {Function[]|Object} 事件集合对象
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		if (typeof evt === 'object') {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * 以数组的形式展示事件对象
	 *
	 * @param {Object[]} 事件集合对象
	 * @return {Function[]} 数组形式
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * 根据提供的事件名称,返回事件(对象形式)
	 *
	 * @param {String|RegExp} 事件名称
	 * @return {Object} 事件
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * 单个事件注册
	 *
	 * @param {String|Object|RegExp} 事件名称
	 * @param {Function}  单个事件动作
	 * @return {Object} 当前事件触发器实例
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * 单个事件注册,且该事件只能被触发一次
	 *
	 * @param {String|Object|RegExp} 事件名称
	 * @param {Function}  单个事件动作
	 * @return {Object} 当前事件触发器实例
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * 定义事件空间
	 *
	 * @param {String} 事件名称
	 * @return {Object} 当前事件触发器实例
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * 定义事件空间
	 *
	 * @param {String} 事件名称
	 * @return {Object} 当前事件触发器实例
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * 删除单个事件
	 *
	 * @param {String|RegExp} 事件名称
	 * @param {Function} 单个事件动作
	 * @return {Object} 当前事件触发器实例
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * 事件注册
	 *
	 * @param {String|Object|RegExp} 事件名称
	 * @param {Function[]} [listeners] 事件动作
	 * @return {Object} 当前事件触发器实例
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * 事件删除
	 *
	 * @param {String|Object|RegExp} 事件名称
	 * @param {Function[]} [listeners] 事件动作
	 * @return {Object} 当前事件触发器实例
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * 事件维护(删除/注册)
	 *
	 * @param {Boolean} 如果是true,表示删除,否则表示注册
	 * @param {String|Object|RegExp} 事件名称
	 * @param {Function[]} [listeners] 事件动作
	 * @return {Object} 当前事件触发器实例
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;


		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// 单个事件动作
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// 如果传入的evt为字符串, 且listeners为数组
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * 剔除目标类型下的所有事件,或者清空所有事件
	 *
	 * @param {String|RegExp} 事件名称
	 * @return {Object} 当前事件触发器实例
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		if (type === 'string') {
			delete events[evt];
		}
		else if (type === 'object') {
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			delete this._events;
		}

		return this;
	};


	/**
	 * 事件触发
	 *
	 * @param {String|RegExp} 事件名称
	 * @param {Array} 事件动作额外参数
	 * @return {Object} 当前事件触发器实例
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// 事件对象
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					// 事件执行结果
					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * 事件触发
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * 事件触发
	 *
	 * @param {String|RegExp} 事件名称
	 * @param {...*} 事件动作额外参数
	 * @return {Object} 当前事件触发器实例
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * 设置单次事件返回值
	 *
	 * @param {any}
	 * @return {Object} 当前事件触发器实例
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * 如果目标事件动作执行后返回的结果与该返回值一致,则会将该事件动作剔除
	 *
	 * @return {any} 默认为true
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * 事件存储对象(不存在需要新建)
	 * @return {Object} 按照事件类型存储
	 *	{'etype': [{listener: func, once: false}, {listener: func, once: true}, ...]}
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};


	// AMD 模块定义
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return EventEmitter;
		});
	}
	// CommonJs(Nodejs)
	else if (typeof module === 'object' && module.exports){
		module.exports = EventEmitter;
	}
	// Namespace
	else {
		this.EventEmitter = EventEmitter;
	}
	// this.EventEmitter = EventEmitter;
}.call(window));