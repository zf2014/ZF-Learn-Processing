/**
 *  
 *  @desc: 键盘敲击事件封装
 *  
 *  @API:
 *      zjport.Keyboard                 --命名空间
 *      zjport.Keyboard.bind            --绑定接口
 *      zjport.Keyboard.unbind          --取消绑定接口
 *      zjport.Keyboard.trigger         --事件触发接口
 *      zjport.Keyboard.reset           --事件重置接口
 *      zjport.Keyboard.stopCallback    --回调函数终止设置
 * 
 * 
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-04-01 
 *  
 *  @last: 2013-04-24
 */
;(function(win, S, undefined){
    var document = win.document
    ;
    
    (function(global) {
    
        /**
         * mapping of special keycodes to their corresponding keys
         *
         * everything in this dictionary cannot use keypress events
         * so it has to be here to map to the correct keycodes for
         * keyup/keydown events
         *
         * @type {Object}
         */
        var _MAP = {
                8: 'backspace',
                9: 'tab',
                13: 'enter',
                16: 'shift',
                17: 'ctrl',
                18: 'alt',
                20: 'capslock',
                27: 'esc',
                32: 'space',
                33: 'pageup',
                34: 'pagedown',
                35: 'end',
                36: 'home',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down',
                45: 'ins',
                46: 'del',
                91: 'meta',
                93: 'meta',
                224: 'meta'
            },
    
            /**
             * mapping for special characters so they can support
             *
             * this dictionary is only used incase you want to bind a
             * keyup or keydown event to one of these keys
             *
             * @type {Object}
             */
            _KEYCODE_MAP = {
                106: '*',
                107: '+',
                109: '-',
                110: '.',
                111 : '/',
                186: ';',
                187: '=',
                188: ',',
                189: '-',
                190: '.',
                191: '/',
                192: '`',
                219: '[',
                220: '\\',
                221: ']',
                222: '\''
            },
    
            /**
             * this is a mapping of keys that require shift on a US keypad
             * back to the non shift equivelents
             *
             * this is so you can use keyup events with these keys
             *
             * note that this will only work reliably on US keyboards
             * 
             * @type {Object}
             */
            _SHIFT_MAP = {
                '~': '`',
                '!': '1',
                '@': '2',
                '#': '3',
                '$': '4',
                '%': '5',
                '^': '6',
                '&': '7',
                '*': '8',
                '(': '9',
                ')': '0',
                '_': '-',
                '+': '=',
                ':': ';',
                '\"': '\'',
                '<': ',',
                '>': '.',
                '?': '/',
                '|': '\\'
            },
    
            /**
             * this is a list of special strings you can use to map
             * to modifier keys when you specify your keyboard shortcuts
             *
             * @type {Object}
             */
            _SPECIAL_ALIASES = {
                'option': 'alt',
                'command': 'meta',
                'return': 'enter',
                'escape': 'esc'
            },
    
            /**
             * variable to store the flipped version of _MAP from above
             * needed to check if we should use keypress or not when no action
             * is specified
             *
             * @type {Object|undefined}
             */
            _REVERSE_MAP,
    
            /**
             * a list of all the callbacks setup via Keyboard.bind()
             *
             * @type {Object}
             */
            _callbacks = {},
    
            /**
             * direct map of string combinations to callbacks used for trigger()
             *
             * @type {Object}
             */
            _directMap = {},
    
            /**
             * keeps track of what level each sequence is at since multiple
             * sequences can start out with the same sequence
             *
             * @type {Object}
             */
            _sequenceLevels = {},
    
            /**
             * variable to store the setTimeout call
             *
             * @type {null|number}
             */
            _resetTimer,
    
            /**
             * temporary state where we will ignore the next keyup
             *
             * @type {boolean|string}
             */
            _ignoreNextKeyup = false,
    
            /**
             * are we currently inside of a sequence?
             * type of action ("keyup" or "keydown" or "keypress") or false
             *
             * @type {boolean|string}
             */
            _sequenceType = false
        ;
    
        /**
         * loop through the f keys, f1 to f19 and add them to the map
         * programatically
         */
        for (var i = 1; i < 20; ++i) {
            _MAP[111 + i] = 'f' + i;
        }
    
        /**
         * loop through to map numbers on the numeric keypad
         */
        for (i = 0; i <= 9; ++i) {
            _MAP[i + 96] = i;
        }
    
        /**
         * 事件绑定
         *
         * @param {Element|HTMLDocument} object
         * @param {string} type
         * @param {Function} callback
         * @returns void
         */
        function _addEvent(object, type, callback) {
            if (object.addEventListener) {
                object.addEventListener(type, callback, false);
                return;
            }
    
            object.attachEvent('on' + type, callback);
        }
    
        /**
         * 确定主键名
         *
         * @param {Event} e
         * @return {string}
         */
        function _characterFromEvent(e) {
    
            // for keypress events we should return the character as is
            if (e.type == 'keypress') {
                var character = String.fromCharCode(e.which);
    
                // if the shift key is not pressed then it is safe to assume
                // that we want the character to be lowercase.  this means if
                // you accidentally have caps lock on then your key bindings
                // will continue to work
                //
                // the only side effect that might not be desired is if you
                // bind something like 'A' cause you want to trigger an
                // event when capital A is pressed caps lock will no longer
                // trigger the event.  shift+a will though.
                if (!e.shiftKey) {
                    character = character.toLowerCase();
                }
    
                return character;
            }
    
            // for non keypress events the special maps are needed
            if (_MAP[e.which]) {
                return _MAP[e.which];
            }
    
            if (_KEYCODE_MAP[e.which]) {
                return _KEYCODE_MAP[e.which];
            }
    
            // if it is not in the special map
    
            // with keydown and keyup events the character seems to always
            // come in as an uppercase character whether you are pressing shift
            // or not.  we should make sure it is always lowercase for comparisons
            return String.fromCharCode(e.which).toLowerCase();
        }
    
        /**
         * checks if two arrays are equal
         *
         * @param {Array} modifiers1
         * @param {Array} modifiers2
         * @returns {boolean}
         */
        function _modifiersMatch(modifiers1, modifiers2) {
            return modifiers1.sort().join(',') === modifiers2.sort().join(',');
        }
    
        /**
         * resets all sequence counters except for the ones passed in
         *
         * @param {Object} doNotReset
         * @returns void
         */
        function _resetSequences(doNotReset, maxLevel) {
            doNotReset = doNotReset || {};
    
            var activeSequences = false,
                key;
    
            for (key in _sequenceLevels) {
                if (doNotReset[key] && _sequenceLevels[key] > maxLevel) {
                    activeSequences = true;
                    continue;
                }
                _sequenceLevels[key] = 0;
            }
    
            if (!activeSequences) {
                _sequenceType = false;
            }
        }
    
        /**
         * 根据主键, 复合键, 事件类型来获得回调函数数组
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event|Object} e
         * @param {boolean=} remove - should we remove any matches
         * @param {string=} combination
         * @returns {Array}
         */
        function _getMatches(character, modifiers, e, remove, combination) {
            var i,
                callback,
                matches = [],
                action = e.type;
    
            // if there are no events related to this keycode
            if (!_callbacks[character]) {
                return [];
            }
    
            // if a modifier key is coming up on its own we should allow it
            if (action == 'keyup' && _isModifier(character)) {
                modifiers = [character];
            }
    
            // loop through all callbacks for the key that was pressed
            // and see if any of them match
            for (i = 0; i < _callbacks[character].length; ++i) {
                
                callback = _callbacks[character][i];
    
                // if this is a sequence but it is not at the right level
                // then move onto the next match
                if (callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                    continue;
                }
    
                // if the action we are looking for doesn't match the action we got
                // then we should keep going
                if (action != callback.action) {
                    continue;
                }
    
                // if this is a keypress event and the meta key and control key
                // are not pressed that means that we need to only look at the
                // character, otherwise check the modifiers as well
                //
                // chrome will not fire a keypress if meta or control is down
                // safari will fire a keypress if meta or meta+shift is down
                // firefox will fire a keypress if meta or control is down
                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {
    
                    // remove is used so if you change your mind and call bind a
                    // second time with a new function the first one is overwritten
                    if (remove && callback.combo == combination) {
                        _callbacks[character].splice(i, 1);
                    }
    
                    matches.push(callback);
                }
            }
    
            return matches;
        }
    
        /**
         * 
         * 确定系统组合键
         *
         * @param {Event} e
         * @returns {Array}
         */
        function _eventModifiers(e) {
            var modifiers = [];
    
            if (e.shiftKey) {
                modifiers.push('shift');
            }
    
            if (e.altKey) {
                modifiers.push('alt');
            }
    
            if (e.ctrlKey) {
                modifiers.push('ctrl');
            }
    
            if (e.metaKey) {
                modifiers.push('meta');
            }
    
            return modifiers;
        }
    
        /**
         * 
         * 执行回调函数, 如果该回调函数返回false, 那么将取消默认动作
         *
         * @param {Function} callback
         * @param {Event} e
         * @returns void
         */
        function _fireCallback(callback, e, combo) {
    
            // if this event should not happen stop here
            if (Keyboard.stopCallback(e, e.target || e.srcElement, combo)) {
                return;
            }
    
            if (callback(e, combo) === false) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
    
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
    
                e.returnValue = false;
                e.cancelBubble = true;
            }
        }
    
        /**
         * 定位回调函数
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event} e
         * @returns void
         */
        function _handleKey(character, modifiers, e) {
            var callbacks = _getMatches(character, modifiers, e),
                i,
                doNotReset = {},
                maxLevel = 0,
                processedSequenceCallback = false;
    
            // loop through matching callbacks for this key event
            for (i = 0; i < callbacks.length; ++i) {
    
                // fire for all sequence callbacks
                // this is because if for example you have multiple sequences
                // bound such as "g i" and "g t" they both need to fire the
                // callback for matching g cause otherwise you can only ever
                // match the first one
                if (callbacks[i].seq) {
                    processedSequenceCallback = true;
    
                    // as we loop through keep track of the max
                    // any sequence at a lower level will be discarded
                    maxLevel = Math.max(maxLevel, callbacks[i].level);
    
                    // keep a list of which sequences were matches for later
                    doNotReset[callbacks[i].seq] = 1;
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                    continue;
                }
    
                // if there were no sequence matches but we are still here
                // that means this is a regular match so we should fire that
                if (!processedSequenceCallback && !_sequenceType) {
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                }
            }
    
            // if you are inside of a sequence and the key you are pressing
            // is not a modifier key then we should reset all sequences
            // that were not matched by this key event
            if (e.type == _sequenceType && !_isModifier(character)) {
                _resetSequences(doNotReset, maxLevel);
            }
        }
    
        /**
         * 
         * 定位和执行具体回调函数
         *
         * @param {Event} e
         * @returns void
         */
        function _handleKeyEvent(e) {
            // normalize e.which for key events
            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
            if (typeof e.which !== 'number') {
                e.which = e.keyCode;
            }
    
            var character = _characterFromEvent(e);
    
            // no character found then stop
            if (!character) {
                return;
            }
    
            if (e.type == 'keyup' && _ignoreNextKeyup == character) {
                _ignoreNextKeyup = false;
                return;
            }
    
            Keyboard.handleKey(character, _eventModifiers(e), e);
        }
    
        /**
         * 根据键名来判断该键是否为组合键
         *
         * @param {string} key
         * @returns {boolean}
         */
        function _isModifier(key) {
            return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
        }
    
        /**
         * 
         * 连续建超过1秒后, 取消连续事件.
         * 
         * @returns void
         */
        function _resetSequenceTimer() {
            clearTimeout(_resetTimer);
            _resetTimer = setTimeout(_resetSequences, 1000);
        }
    
        /**
         * 
         * 从_Map中找到更适合使用keypress事件的键.查询条件:键值不在(95, 112)范围内即可
         *
         * @return {Object}
         */
        function _getReverseMap() {
            if (!_REVERSE_MAP) {
                _REVERSE_MAP = {};
                for (var key in _MAP) {
    
                    // pull out the numeric keypad from here cause keypress should
                    // be able to detect the keys from the character
                    if (key > 95 && key < 112) {
                        continue;
                    }
    
                    if (_MAP.hasOwnProperty(key)) {
                        _REVERSE_MAP[_MAP[key]] = key;
                    }
                }
            }
            return _REVERSE_MAP;
        }
    
        /**
         * 
         * 在未提供事件类型时, 系统根据待绑定的键值来选择最佳方案.{区分keydown和keypress}
         *
         * @param {string} key - 主键值
         * @param {Array} modifiers 复合键{shift, ctrl, alt, meta}
         * @param {string=} action 事件类型{keydown, keypress, keyup}
         */
        function _pickBestAction(key, modifiers, action) {
    
            // if no action was picked in we should try to pick the one
            // that we think would work best for this key
            if (!action) {
                action = _getReverseMap()[key] ? 'keydown' : 'keypress';
            }
    
            // modifier keys don't work as expected with keypress,
            // switch to keydown
            // 
            if (action == 'keypress' && modifiers.length) {
                action = 'keydown';
            }
    
            return action;
        }
    
        /**
         * 连续键事件绑定
         *
         * @param {string} combo - 连续键字符形式, 可作为标识符
         * @param {Array} keys   - 连续键数组形式
         * @param {Function} callback - 回调函数
         * @param {string=} action - 事件类型
         * @returns void
         */
        function _bindSequence(combo, keys, callback, action) {
    
            // 记录当前连续键级别, 从0开始, 会递增
            _sequenceLevels[combo] = 0;
    
            // if there is no action pick the best one for the first key
            // in the sequence
            if (!action) {
                action = _pickBestAction(keys[0], []);
            }
    
            /**
             * callback to increase the sequence level for this sequence and reset
             * all other sequences that were active
             *
             * @param {Event} e
             * @returns void
             */
            var _increaseSequence = function() {
                    _sequenceType = action;
                    ++_sequenceLevels[combo];
                    _resetSequenceTimer();
                },
    
                /**
                 * wraps the specified callback inside of another function in order
                 * to reset all sequence counters as soon as this sequence is done
                 *
                 * @param {Event} e
                 * @returns void
                 */
                _callbackAndReset = function(e) {
                    _fireCallback(callback, e, combo);
    
                    // we should ignore the next key up if the action is key down
                    // or keypress.  this is so if you finish a sequence and
                    // release the key the final key will not trigger a keyup
                    if (action !== 'keyup') {
                        _ignoreNextKeyup = _characterFromEvent(e);
                    }
                    
                    // 清楚所有连续键过程状态
                    setTimeout(_resetSequences, 10);
                },
                i;
    
            // loop through keys one at a time and bind the appropriate callback
            // function.  for any key leading up to the final one it should
            // increase the sequence. after the final, it should reset all sequences
            for (i = 0; i < keys.length; ++i) {
                _bindSingle(keys[i], i < keys.length - 1 ? _increaseSequence : _callbackAndReset, action, combo, i);
            }
        }
    
        /**
         * 绑定单个键盘事件组合
         *
         * @param {string} 单个组合键
         * @param {Function} 对应的回调函数
         * @param {string=} 事件类型
         * @param {string=} 连续名称
         * @param {number=} 级别
         * @returns void
         */
        function _bindSingle(combination, callback, action, sequenceName, level) {
    
            // store a direct mapped reference for use with Keyboard.trigger
            _directMap[combination + ':' + action] = callback;
    
            // make sure multiple spaces in a row become a single space
            combination = combination.replace(/\s+/g, ' ');
    
            var sequence = combination.split(' '),
                i,
                key,
                keys,
                modifiers = [];
    
            // if this pattern is a sequence of keys then run through this method
            // to reprocess each pattern one key at a time
            if (sequence.length > 1) {
                _bindSequence(combination, sequence, callback, action);
                return;
            }
    
            // take the keys from this pattern and figure out what the actual
            // pattern is all about
            keys = combination === '+' ? ['+'] : combination.split('+');
    
            for (i = 0; i < keys.length; ++i) {
                key = keys[i];
    
                // normalize key names
                if (_SPECIAL_ALIASES[key]) {
                    key = _SPECIAL_ALIASES[key];
                }
    
                // if this is not a keypress event then we should
                // be smart about using shift keys
                // this will only work for US keyboards however
                if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                    key = _SHIFT_MAP[key];
                    modifiers.push('shift');
                }
    
                // if this key is a modifier then add it to the list of modifiers
                if (_isModifier(key)) {
                    modifiers.push(key);
                }
            }
    
            // depending on what the key combination is
            // we will try to pick the best event for it
            action = _pickBestAction(key, modifiers, action);
    
            // make sure to initialize array if this is the first time
            // a callback is added for this key
            if (!_callbacks[key]) {
                _callbacks[key] = [];
            }
    
            // remove an existing match if there is one
            _getMatches(key, modifiers, {type: action}, !sequenceName, combination);
    
            // add this call back to the array
            // if it is a sequence put it at the beginning
            // if not put it at the end
            //
            // this is important because the way these are processed expects
            // the sequence ones to come first
            _callbacks[key][sequenceName ? 'unshift' : 'push']({
                callback: callback,
                modifiers: modifiers,
                action: action,
                seq: sequenceName,
                level: level,
                combo: combination
            });
        }
    
        /**
         * 多个组合键绑定同一个回调函数
         *
         * @param {Array} 组合键数组
         * @param {Function} 回调函数
         * @param {string|undefined} 事件类型
         * @returns void
         */
        function _bindMultiple(combinations, callback, action) {
            for (var i = 0; i < combinations.length; ++i) {
                _bindSingle(combinations[i], callback, action);
            }
        }
    
        // start!
        _addEvent(document, 'keypress', _handleKeyEvent);
        _addEvent(document, 'keydown', _handleKeyEvent);
        _addEvent(document, 'keyup', _handleKeyEvent);
        
        
        
        var Keyboard = {
    
            /**
             * binds an event to keyboard
             *
             * can be a single key, a combination of keys separated with +,
             * an array of keys, or a sequence of keys separated by spaces
             *
             * be sure to list the modifier keys first to make sure that the
             * correct key ends up getting bound (the last key in the pattern)
             *
             * @param {string|Array} keys
             * @param {Function} callback
             * @param {string=} action - 'keypress', 'keydown', or 'keyup'
             * @returns void
             */
            bind: function(keys, callback, action) {
                keys = keys instanceof Array ? keys : [keys];
                _bindMultiple(keys, callback, action);
                return this;
            },
    
            /**
             *
             * 取消特定的键事件
             * TODO 目前处理方式设置空函数. 实际上应该从_callbacks中删除对应的数据
             * 
             * @param {string|Array} keys
             * @param {string} action
             * @returns void
             */
            unbind: function(keys, action) {
                return Keyboard.bind(keys, function() {}, action);
            },
    
            /**
             * 不通过设备触发, 而是手动触发对应的事件
             *
             * @param {string} keys
             * @param {string=} action
             * @returns void
             */
            trigger: function(keys, action) {
                if (_directMap[keys + ':' + action]) {
                    _directMap[keys + ':' + action]({}, keys);
                }
                return this;
            },
    
            /**
             *
             * 重置所有事件
             * 
             * @returns void
             */
            reset: function() {
                _callbacks = {};
                _directMap = {};
                return this;
            },
    
           /**
            * 是否需要终止执行绑定的事件回调函数()
            *   如果发现目标元素上存在keyboard类名, 那么始终不阻止
            *   如果事件发生在输入框/选择框/文本框中,默认终止
            *
            * @param {Event} e
            * @param {Element} element
            * @return {boolean}
            */
            stopCallback: function(e, element) {
    
                // if the element has the class "keyboard" then no need to stop
                if ((' ' + element.className + ' ').indexOf(' keyboard ') > -1) {
                    return false;
                }
    
                // stop for input, select, and textarea
                return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');
            },
    
            /**
             * exposes _handleKey publicly so it can be overwritten by extensions
             */
            handleKey: _handleKey
        };
        
        global.Keyboard = Keyboard;
        
    })(S);

}(window, window.zjport));