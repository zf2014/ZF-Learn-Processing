/**
 *  
 *  @desc: 输入输出操作(基于jQuery Ajax)
 *  
 *  @author: qzzf1987@gmail.com
 * 
 *  @create: 2013-09-11 
 *  
 *  @last: 2013-09-18
 */
define(['jquery', 'utils', 'common/emitter', 'common/json'], function($, S, EventEmitter, json){

	var io = {},
			qs = S.qs,
			slice = Array.prototype.slice,
			query = $,
			libajax = $.ajax,
			noop = S.NOOP,
			jsonParse = json.parse,

			// 提示内容收纳箱
			tipBags = {
				// 提示方式{inner|noop|function}
				type: 'inner',
				// 错误提示内容集合
				errors: [],
				// 成功提示内容集合
				successes: []
			},
			originalType = tipBags.type,
			// 提示操作
			tipOp = {
				'inner': function(msgs, successful){
					S.debug(successful ? '请求成功!:' : '请求失败, 失败原因:');
					S.each(msgs, function(msg){
						S.debug(msg);
					});
				},
				'noop': noop
			},
			// 默认请求配置
			defSettings = {
				// 返回数据类型
				dataType: 'json',
				// 防止请求被缓存(GET/HEAD方式)
				cache: false
			},
			// 错误提示语
			sysErrorMsgs = {
				'parsererror': '数据格式错误!',
				'404': '访问地址无效!'
			},
			// 事件发射器
			gEmitter,

			// input元素正则表达式
			rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
			// select和textarea正则表达式
			rselectTextarea = /^(?:select|textarea)/i,
			// 换行符正则表达式
			rCRLF = /\r?\n/g
	;

	// 事件注册
	gEmitter = new EventEmitter();
	gEmitter.addListener('error', gErrorCB);
	gEmitter.addListener('complete', gCompleteCB);

	/**
	 * 请求
	 *
	 * @param {string|Object|Function}[必填]		url						请求地址
	 * @param {function}[可选]									callback			请求回调函数
	 * @public
	 */
	io.request = function(url, callback){
		var	// 请求提交配置
				reqSettings,
				// 请求成功
				onsuccess,
				// 用户配置
				settings = {}
		;

		// 如果第一个参数是字符串, 那么可以作为请求地址使用
		if(typeof url === "string"){
			settings['url'] = url;
		}
		// 如果是函数, 则执行该函数
		else if(typeof url === "function"){
			settings['url'] = url();
		}
		// 如果都不是
		else{
			settings = url;
		}

		// 请求配置合并
		reqSettings = S.mix({}, defSettings, settings, true);

		// 如果未提供请求地址
		if(!reqSettings.url){
			gEmitter.emit('error', '未提供有效的请求地址!', true);
			return;
		}

		// 如果有提供处理请求结果的回调函数
		if(typeof callback === 'function'){
			reqSettings['success'] = function(reqData){
				
				// 被传输的数据
				var transmission,
						args = slice.call(arguments, 1)
				;

				// 请求返回的结果是字符串
				if(typeof reqData === 'string'){
					try{
						// 转为json串
						transmission = jsonParse(reqData);
					}catch(e){
						// 如果该字符串不是json格式, 那么直接使用该字符串作为被传输的数据
						transmission = reqData;
					}
				}else{
					transmission = reqData;
				}

				args.unshift(transmission);

				// 执行回调函数
				return callback.apply(this, args);
			};
		}
		
		// 发起请求
		return request(reqSettings);
	};




	/**
	 * 跨域请求
	 *
	 * @param {string|Object}[必填]		url						请求地址[跨域地址]
	 * @param {function}[可选]				options				可选配置参数
	 * @param {function}[必填]				callback			请求回调函数
	 * @public
	 */
	io.jsonp = function(url, options, callback){

		var fixed = {
					// 请求地址(跨域)
					url: url,
					// 数据类型
					dataType: 'jsonp',
					// 会自动添加一组查询参数[jsonp]=[jsonpCallback], 服务端需要解析该参数, 并且合并成js可执行的语句
					// 基本返回格式: [jsonpCallback]({json data});
					// 并且最好在response head中设置content-type为'application/javascript'
					// jsonp: 'callback',
					jsonpCallback: function(){
						// 生成当前执行环境下唯一的名称
						return S.guid('zjport_jsonp_');
					}
				},
				reqSettings,
				args = slice.call(arguments, 1)
		;

		// 仅传入2个参数
		if(args.length === 1){
			callback = options;
			options = undefined;
		}


		reqSettings = S.mix({}, options, fixed);

		// 发起请求
		return io.request(reqSettings, callback);
	};




	/**
	 * 
	 * 表单提交,根据返回的结果进行处理
	 *
	 * @param {element|string}[必填]	target        目标表单
	 * @param {string|Object}[可选]		settings			表单请求参数
	 * @param {function}[可选]				callback			请求回调函数
	 * @public
	 */
	io.form = function(target, settings, callback){
		var $form = query(target),
				node = $form[0],
				
				// 可选参数
				args = slice.call(arguments, 1),
				argLength = args.length,

				// 表单参数
				formSettings,
				// 表单提交方式
				formMethod,
				// 表单请求参数(用户输入)
				formParams,
				// 用户传入的请求参数
				reqParams,
				// 请求提交配置
				reqSettings,
				// 辅助配置
				aidSettings = {},
				// 请求成功
				onsuccess
		;

		if(!isNode(node, 'form')){
			gEmitter.emit('error', '目标元素[' + node.tagName.toLowerCase() + ']不是form元素!', true);
			return;
		}

		// 从目标表单元素上根据属性来获取配置项
		formSettings = {
			// 请求方式(post | get)
			type : S.inArray(['post', 'get'], (formMethod = $form.attr('method')) && formMethod.toLowerCase())? formMethod : 'get',
			// 请求地址
			url : $form.attr('action')
		};

		// 如果只传入了回调函数,则表单请求参数根据页面
		if(argLength === 1){
			callback = settings;
			settings = {};
		}
		// 如果既传入了配置项,也提供了回调函数
		else if(argLength === 2){
			// 如果第二个参数是字符串,则可认为是请求地址
			if(S.isString(settings)){
				settings = {url: settings};
			}
		}
		// 请求配置合并
		reqSettings = S.mix({}, formSettings, settings);
		
		// 表单控制字段拼接成查询条件字符串
		formParams = toParams($form);
		// 用户定义的参数
		reqParams = reqSettings.data && typeof reqSettings.data !== 'string'?
									qs.stringify(reqSettings.data):
									(reqSettings.data || '');
		// 请求参数		
		reqSettings.data = (!!reqParams ? (reqParams + '&') : '') + formParams;
		// 取消参数序列化操作
		reqSettings.processData = false;

		// 发起请求
		return io.request(reqSettings, callback);
	};




	// ajax请求(封装)
	// @param reqSettings			请求配置
	// @private
	function request(reqSettings){
		// 用户定义的错误回调函数
		var prevError = reqSettings.error,
				// 用户定义的完成后回调函数
				prevComplete = reqSettings.complete
		;

		// 系统定义的错误回调函数
		reqSettings.error = function(xhr, errorflag, e){

			var msg, flag = errorflag, rst;
			
			// 错误标识
			if(flag === 'error'){
				flag = xhr.status;
			}

			// 错误信息内容
			if(!(msg = sysErrorMsgs[flag])){
				if(e instanceof Error){
					msg = e.toString();
				}else{
					msg = e;
				}
			}

			// 如果用户定义了错误处理回调函数
			if(typeof prevError === 'function'){
				rst = prevError.call(this, flag, msg);

				// 如果处理的结果是字符串, 那么该字符串可以作为错误信息使用
				if(typeof rst === 'string'){
					msg = rst;
				}
			}

			// 如果提供了事件触发器
			if(gEmitter){
				gEmitter.emit('error', msg);
			}
		};

		// 系统定义的完成回调函数
		reqSettings.complete = function(xhr, status){
			// 如果用户定义了完成后回调函数
			if(typeof prevComplete === 'function'){
				prevComplete.call(this, xhr, status);
			}

			// 如果提供了事件触发器
			if(gEmitter){
				gEmitter.emit('complete');
			}

			// 重置
		};

		return libajax(reqSettings);
	}


	// 节点类型
	// @param node						目标节点
	// @param type						节点类型名称
	// @private
	function isNode(node, type){
		if(node && node.nodeType === 1 && node.tagName === type.toUpperCase()){
			return true;
		}
		return false;
	}


	// 表单控制元素组合生成请求参数
	// @param $form						表单元素[jQuery对象]
	// @private
	function toParams($form){
		var params = {};
		if($form && isNode($form[0], 'form')){
			$form.map(function(){
				return this.elements ? jQuery.makeArray( this.elements ) : this;
			})
			// 元素过滤
			// 1. 必须要有name属性
			// 2. 不能有disabled属性
			// 3. 选中的checkbox || radio或者select或者textarea或者除了checkbox和radio的其他input
			.filter(function(){
				return this.name && !this.disabled &&
					( this.checked || rselectTextarea.test( this.nodeName ) ||
						rinput.test( this.type ) );
			}).
			// key-value配对
			map(function(i, elem){
				var val = jQuery(this).val(),
						vals,
						v,
						name = elem.name
				;
				vals = params[name] || (params[name] = []);

				v = val == null ?
					null :
					S.isArray( val ) ?
						S.map( val, function( val, i ){
							return val.replace( rCRLF, "\r\n" );
						}) :
						val.replace( rCRLF, "\r\n" );
			
				if(S.isArray(v)){
					vals.concat(v);
				}else{
					vals.push(v);
				}
			});

			return qs.stringify(params);
		}
	}

	// 错误提示
	// @param msg[String]			提示内容
	// @param done[Boolean]		终止
	// @private
	function gErrorCB(msg, done){
		var errors = tipBags.errors || (tipBags.errors = []);
		errors.push(msg);
		// 如果无后续操作, 则触发完成事件
		if(done){
			this.emit('complete');
		}
	}


	// 完成后提示
	// @private
	function gCompleteCB(){
		var type = tipBags.type,
				errors = tipBags.errors,
				successes = tipBags.successes,
				op = ((typeof type === 'function') ? type : tipOp[type]) || noop
		;

		// 如果有错误信息
		if(errors.length){
			op.call(this, errors, false);
		}

		// 如果有成功信息
		if(successes.length){
			op.call(this, successes, true);
		}

		// reset
		tipBags.type = originalType;
		tipBags.errors = [];
		tipBags.successes = [];
	}
	

	return io;
});