;(function(){
    var WINDOW = S.ENV.host,
    
        NODE_TYPE = {
            /**
             * element type
             */
            ELEMENT_NODE: 1,
            /**
             * attribute node type
             */
            'ATTRIBUTE_NODE': 2,
            /**
             * text node type
             */
            TEXT_NODE: 3,
            /**
             * cdata node type
             */
            'CDATA_SECTION_NODE': 4,
            /**
             * entity reference node type
             */
            'ENTITY_REFERENCE_NODE': 5,
            /**
             * entity node type
             */
            'ENTITY_NODE': 6,
            /**
             * processing instruction node type
             */
            'PROCESSING_INSTRUCTION_NODE': 7,
            /**
             * comment node type
             */
            COMMENT_NODE: 8,
            /**
             * document node type
             */
            DOCUMENT_NODE: 9,
            /**
             * document type
             */
            'DOCUMENT_TYPE_NODE': 10,
            /**
             * document fragment type
             */
            DOCUMENT_FRAGMENT_NODE: 11,
            /**
             * notation type
             */
            'NOTATION_NODE': 12
        }
    ;
    S.mix(dom, {
        
        NodeType : NODE_TYPE,
        
        getWin : function(elem) {
            if (!elem) {
                return WINDOW;
            }
            return ('scrollTo' in elem && elem['document']) ? elem : elem.nodeType === NODE_TYPE.DOCUMENT_NODE ? elem.defaultView || elem.parentWindow : WINDOW;
        },
        getDoc : function(elem) {
            if (elem) {
                return (elem.nodeType === NODE_TYPE.DOCUMENT_NODE) ? elem : // element === document
                elem["ownerDocument"] || // element === DOM node
                this.getWin(elem)["document"] // element === window
            }
            return this.getWin(elem)["document"];
        },
        isXML : function(elem) {
            return this.getDoc(elem) ? documentElement.nodeName !== "HTML" : false;
        }
        
    }); 

    
})()
