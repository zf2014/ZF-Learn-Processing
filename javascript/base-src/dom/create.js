;(function(undefined){
    var DOM = dom
       ,DOCUMENT = DOM.getDoc()
       ,body = DOCUMENT.body
       ,NODE_TYPE = DOM.NodeType
       ,RE_TAG = /<([\w:]+)/
       ,RE_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig
       ,RE_CHECKABLE = /^(?:checkbox|radio)$/i
       ,RE_HTML = /<|&#?\w+;/
       ,RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/
       ,Half_Baked = {
            // Support: IE 9
            option: [ 1, "<select multiple='multiple'>", "</select>" ],
    
            thead: [ 1, "<table>", "</table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
    
            _default: [ 0, "", "" ]
        }
    ;

    // Support: IE 9
    Half_Baked.optgroup = Half_Baked.option;
    Half_Baked.tbody = Half_Baked.tfoot = Half_Baked.colgroup = Half_Baked.caption = Half_Baked.col = Half_Baked.thead;
    Half_Baked.th = Half_Baked.td;
;
    
    S.mix(DOM , {
       
       
        /**
         * 
         * 将字符串插入到目标节点上
         * 
         * @param {string} selector        目标节点
         * @param {string} html         待建节点字符串
         * @param {document}  loadScripts  
         */
        html: function(selector , htmlstr , loadScripts) {
            var elems = DOM.query(selector), first = elems[0], finished = false, newNode;
    
            if (!first) {
                return;
            }
            //getter
            if (htmlstr === undefined && first.nodeType === NODE_TYPE.ELEMENT_NODE) {
                return first.innerHTML;
            }
            //setter
            else {
                htmlstr += '';
    
                if (!htmlstr.match(/<(?:script|style|link)/i) && !Half_Baked[ ( RE_TAG.exec( value ) || [ "", "" ] )[1].toLowerCase()]) {
                    S.each(elems, function(elem) {
                        if (elem.nodeType === NODE_TYPE.ELEMENT_NODE) {
                            //TODO clean data
                            elem.innerHTML = htmlstr;
                        }
                    });
    
                    finished = true;
                }
    
                if (!finished) {
                    
                    newNode = DOM.create(htmlstr);
                    
                    // 清空容器
                    DOM.empty(elems);
                    
                    //TODO  插入元素
                    DOM.append(newNode, elems, loadScripts);
                }
            }
        } 
        
        /**
         * 
         * 解析html字符串,并生成对应的节点
         * 
         * @param {string} html         待建节点字符串
         * @param {document}  ownerDoc  
         */
       ,create: function(html , ownerDoc){
           return createNodesByString(html , ownerDoc)
       }
       
        /**
         * 
         * 删除目标节点,同时需要
         * 
         * @param {string | array | element} selector 目标节点
         * @param {boolean}  keepData   是否需要保存缓存数据
         */
       ,remove: function (selector, keepData) {
                var el,
                    els = DOM.query(selector),
                    elChildren,
                    i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    if (!keepData && el.nodeType == DOM.NodeType.ELEMENT_NODE) {
                        
                        elChildren = getElementsByTagName(el, '*');
                        //清理所有后代节点数据
                        cleanData(elChildren);
                        
                        //清理当前节点数据
                        cleanData(el);
                    }

                    // 从DOM树中删除后台节点
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }
            }
       
       /**
         * 
         * 清空目标节点下,包括缓存数据
         * 
         * @param {string | array | element} selector 目标节点
         */
       ,empty: function(selector) {
           var elems = DOM.query(selector)
              ,i = 0
              ,len = elems.length
              ,node
              
           ;
           
           for(; i < len ; i++){
               node = elems[i];
               
               if(node.nodeType === DOM.NodeType.ELEMENT_NODE){
                   //DOM.remove(node);
                   cleanData(node);
                   
                   elem.textContent = "";
               }
               
           }
        }
        
        /**
         * 
         * 元素克隆
         * 
         * @param {element} selector 目标节点
         * @param {boolean} dataAndEvents 是否开启数据克隆
         * @param {boolean} deepDataAndEvents 是否要深度克隆
         * 
         * 
         */
        ,clone: function( elem, dataAndEvents, deepDataAndEvents ) {
            var i
                ,l
                ,srcElements
                ,destElements
                ,clone = elem.cloneNode( true )
                ,inPage = DOM.contains( elem.ownerDocument, elem )
                ,nodeType
            ;
        
            if(!elem){
                return;
            }
            nodeType = elem.nodeType;
            
            
            // Support: IE >=9
            if ( ( nodeType === DOM.NodeType.ELEMENT_NODE || nodeType === DOM.NodeType.DOCUMENT_FRAGMENT_NODE )) {
    
                destElements = getElementsByTagName( elem , "*" );
                srcElements = getElementsByTagName( clone , "*" );
    
                for ( i = 0, l = srcElements.length; i < l; i++ ) {
                    fixInputAttributes( srcElements[ i ], destElements[ i ] );
                }
            }
            
            
            // 开启数据克隆
            if ( dataAndEvents ) {
                // 深度克隆
                if ( deepDataAndEvents ) {
                    srcElements = srcElements || getElementsByTagName( elem , "*" );
                    destElements = destElements || getElementsByTagName( clone , "*" );
    
                    for ( i = 0, l = srcElements.length; i < l; i++ ) {
                        cloneCopyDataAndEvent( srcElements[ i ], destElements[ i ] );
                    }
                } 
                // 浅度克隆
                else {
                    cloneCopyDataAndEvent( elem, clone );
                }
            }
    
            // TODO script
    
            return clone;
        }
        
    });
    
    /**
     *
     *  根据提供的html片段生成Element对象
     * 
     *  @param {Object} html
     *  @param {Object} props
     *  @param {Object} ownerDoc
     */
    function createNodesByString(html , ownerDoc){
        var rst = []
           ,isString = typeof html === "string"
           ,ownerDoc = (ownerDoc || DOCUMENT)
           ,matched
           ,fragment
           ,tag
           ,key
           ,wrap
           ,temp
           ,i
        ;
        
        if(!RE_HTML.test(html)){
            rst.push(context.createTextNode(html));
        }
        // <p>
        else if((matched = RE_SIMPLE_TAG.exec(html))){
            rst.push(context.createElement(matched[1]));
        }
        else{
            // 
            fragment = ownerDoc.createDocumentFragment();
            
            temp = fragment.appendChild( ownerDoc.createElement("div") );
            
            html = html.replace(RE_XHTML_TAG, '<$1><' + '/$2>');
            
            tag = (matched = RE_TAG.exec(html)) && (key = matched[1]) && key.toLowerCase();
            
            wrap = Half_Baked[tag] || Half_Baked._default;
            
            temp.innerHTML = wrap[ 1 ] + html + wrap[ 2 ];
            
            i = wrap[ i ];
            while ( i-- ) {
                temp = temp.firstChild;
            }
            
            rst = S.merge(rst , temp.childNodes);
            
            if (rst.length === 1) {
                // return single node, breaking parentNode ref from 'fragment'
                rst = rst[0]["parentNode"].removeChild(rst[0]);
            } else if (rst.length > 1) {
                // return multiple nodes as a fragment
                rst = nodeListToFragment(rst);
            } else {
                S.error(html + ' : create node error');
            }
            
            
            // Remember the top-level container
            tmp = fragment.firstChild;

            // Fixes #12346
            // Support: Webkit, IE
            tmp.textContent = "";
        }
        
        return rst;
    }
    
    
    /**
     *
     *  清理element数据
     * 
     *  @param {Object} els
     */
    function cleanData(els) {
        //TODO 已绑定事件
        
        // 删除缓存数据
        DOM.removeData(els);
    }
    
    
        
    /**
     *
     *  获取目标节点下的指定TagName所有节点
     * 
     *  @param {element} el
     *  @param {string} tag  可以是*,表示所有节点
     */    
    function getElementsByTagName(el, tag) {
        return el.getElementsByTagName(tag);
    }
    
    
    /**
     *
     *  将原节点中的数据复制到目标节点上
     * 
     *  @param {element} src    原节点
     *  @param {element} dest   目标节点
     */
    function cloneCopyDataAndEvent( src, dest ) {
        var srcData,
            d;

        if (dest.nodeType == DOM.NodeType.ELEMENT_NODE && !DOM.hasData(src)) {
            return;
        }

        srcData = DOM.data(src);

        // 浅克隆，data 也放在克隆节点上
        for (d in srcData) {
            DOM.data(dest, d, srcData[d]);
        }
        
        //TODO Event

    }
    
    
    // Support: IE >= 9
    function fixInputAttributes( src, dest ) {
        var nodeName = dest.nodeName.toLowerCase();
    
        // Fails to persist the checked state of a cloned checkbox or radio button.
        if ( nodeName === "input" && RE_CHECKABLE.test( src.type ) ) {
            dest.checked = src.checked;
    
        // Fails to return the selected option to the default selected state when cloning options
        } else if ( nodeName === "input" || nodeName === "textarea" ) {
            dest.defaultValue = src.defaultValue;
        }
    }
    
    
    // 将 nodeList 转换为 fragment
    // 避免reflow/repaint,影响性能
    function nodeListToFragment(nodes) {
        var ret = null,
            i,
            ownerDoc,
            len;
        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();
            nodes = S.makeArray(nodes);
            for (i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        } else {
            S.log('Unable to convert ' + nodes + ' to fragment.');
        }
        return ret;
    }
}());