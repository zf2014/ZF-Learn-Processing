/**
 *  @desc: 同域/跨域 iframe高度自适应
 * 
 *  @author: zhangF
 * 
 *  @create: 2013-08-23 
 *  
 *  @last: 2013-08-26
 *  
 *  @record
 *    2013-08-26  [修改]
 *    2013-09-09  [添加]  最小高度设置
 *    2013-12-05  [添加]  IE11无法识别ActiveXObject, 导致无法自适应
 */
;(function(undefined){

	var doc = window.document,
			body = doc.body,
			isIE = /MSIE/.test(window.navigator.userAgent),
			queryStr = window.location.search.substring(1),
			id = 0,
			filterPrefix = 'autoheight_',
			i,
			guid,
			mix,
			startsWith,
			parse,
			configFilter,
			scriptConfig,
			isSameDomain,

			
			config = {
				id : 'mainFrame',																					// 目标iframe的id属性(必须保证唯一性)
				url : 'http://192.168.180.54:8082/autoheight/proxy.html',	// 代理页面地址(该地址域名必须和目标iframe所在文档域名一致)
				delay: 200,																								// 检测频率(200ms/1次)
				minHeight: 0
			},

			createProxy
	;

	// 对象混合
	mix = function(target , source){
	    for(var i in source){
	        target[i] = source[i];
	    }
  	};

  	// 判断某字符串是否以特定字符串打头的
	startsWith = function(str, prefix){
		return str.lastIndexOf(prefix , 0) === 0;
  	};

	// 解析key=value[&key=value[&key=value]]结构数据
	parse = function(query, filter){
		var querys = query.split('&'),
				len = querys.length,
				reslut = {},
				param,
				kv,
				key,
				value
		;
		while(len){
			param = querys[--len];
			kv = param.split('=');
			key = kv[0];
			value = kv[1];

			if(filter && typeof filter === 'function'){
				// 如果返回的为false, 那么表示过滤掉了
				key = filter(key);
			}

			if(key !== false){
				reslut[key] = value;
			}
		}
		return reslut;
	};

	// 脚本配置解析
	scriptConfig = function(){
		var scripts = doc.getElementsByTagName('script'),
				script = scripts[scripts.length - 1],
				params = script.getAttribute('data-params') || ''
		;
		return parse(params, configFilter);
	};

	// 配置参数过滤
	configFilter = function(key){
		if(startsWith(key, filterPrefix)){
			return key.substring(filterPrefix.length);
		}
		return false;
	};

	// 唯一标识符
	guid = function(prefix){
		return (prefix || '') + (id++);
	};

	// 创建代理iframe元素
	createProxy = function(sign){
		var proxyNode = doc.createElement('iframe');
		proxyNode.style.display = "none";
		proxyNode.name="proxy" + sign;
		proxyNode.id="proxy" + sign;
		return proxyNode;
	};

	isSameDomain = function(){
		var curLocation = window.location,
				topLocation = window.top.location,
				result = false
		;
		try{
			result = curLocation.protocol === topLocation.protocol && curLocation.host === topLocation.host;
		}catch(e){
			// nothing
			// console.log(e);
		}
		return result;
	};

	/**
	 *
	 * 高度自适应{AutoHeight}构造函数
	 * 
	 * @return AutoHeight       AutoHeight
	 *  
	 */
	var AutoHeight = function(){
		this.config = config;
		this.init();
	};

	AutoHeight.prototype = {

		// 构造器
	    constructor : AutoHeight,

    	// 标识符
		guid: guid(),

		// 是否同域
		isSameDomain: isSameDomain(),

		// 初始化
		init: function(){
			if(!this.isSameDomain){
				this.proxy = createProxy(this.guid);
			}
			this._setConfig();
			this._domReady();
		},

		// 之前高度
		prevHeight: 0,

		// 代理iframe元素
		proxy: null,


		// 添加配置项,注意有优先级(本地配置->script标签属性->iframe地址参数)
		_setConfig: function(){
			var config = this.config,
					sConfig,
					uConfig
			;
			sConfig = scriptConfig();
			uConfig = parse(queryStr, configFilter);
			mix(config, sConfig);
			mix(config, uConfig);
		},

		// 目标iframe页面加载完成后事件绑定
		_domReady: function(){
			var self = this,
					onload = function(){
						self._appendProxy();
						self._trackHeight();
					};

			if(doc.addEventListener){
				window.addEventListener("load",onload,false);
			}else{
				window.attachEvent("onload",onload);
			}
		},

		// 跟踪当前iframe页面高度变化
		_trackHeight: function(){
			var self = this,
					same = this.isSameDomain,
					delay = this.config.delay,
					minHeight = this.config.minHeight
			;

			window.setInterval(function(){
					var iframeBodyHeight = self._getCurBodyHeight(),
							iframePrevHeight = self.prevHeight,
							changed = iframeBodyHeight !== iframePrevHeight,
							tooShort = iframeBodyHeight < minHeight,
							calculatedHeight = tooShort ? minHeight : iframeBodyHeight

					;

					// 如果目标iframe的文档显示高度发生变化
					if(changed){
						same ? self._setSameDomainIFrameHeight(calculatedHeight) : self._setProxyIFrameSrc(calculatedHeight);
						self.prevHeight = iframeBodyHeight;
					}

				},delay);
		},

		// 插入代理页面
		_appendProxy: function(){
			var proxyEle = this.proxy;
			if(proxyEle){
				body.appendChild(proxyEle);
			}
		},


		// 获取当前iframe内容高度
		_getCurBodyHeight: function(){

			if(isIE) {
         return body.scrollHeight;
      }else if (doc.createExpression) {
         return body.offsetHeight;
      }
      return 150;
		},

		// 修改代理iframe的src地址, 通过该代理页面脚本来完成修改目标iframe的高度
		_setProxyIFrameSrc: function(height){
			var proxy = this.proxy,
					config = this.config
			;
			proxy.src = config.url + '?ah-height=' + height + '&ah-target=' + config.id;
		},

		// 同域情况下, 设置目标iframe的高度
		_setSameDomainIFrameHeight: function(height){
			var target = window.top.document.getElementById(this.config.id);
			target.style.height = height + 'px';
		}
	};

	// 如果当前viewpoint属于嵌套viewpoint, 则高度自适应
	if(window != window.parent){
		new AutoHeight();
	}
}());