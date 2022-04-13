MWF.xDesktop.requireApp("process.Xform", "$Module", null, false);
/** @class Documenteditor 公文编辑器。
 * @o2cn 公文编辑器
 * @example
 * //可以在脚本中获取该组件
 * //方法1：
 * var documenteditor = this.form.get("fieldId"); //获取组件
 * //方法2
 * var documenteditor = this.target; //在组件事件脚本中获取
 * @extends MWF.xApplication.process.Xform.$Module
 * @o2category FormComponents
 * @o2range {Process}
 * @hideconstructor
 */
MWF.xApplication.process.Xform.Documenteditor = MWF.APPDocumenteditor =  new Class(
/** @lends MWF.xApplication.process.Xform.Documenteditor# */
{
    Extends: MWF.APP$Module,
    options: {
        /**
         * 当公文编辑器内容每次被渲染的时候都会触发。
         * @event MWF.xApplication.process.Xform.Documenteditor#loadPage
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        "moduleEvents": ["load", "queryLoad", "beforeLoad", "postLoad", "afterLoad", "loadPage", "fullScreen", "returnScreen"],
        "docPageHeight": 850.4,
        "docPageFullWidth": 794,
        "pageShow": "single"
    },
    initialize: function(node, json, form, options){
        this.node = $(node);
        this.node.store("module", this);
        this.json = json;
        this.form = form;
        this.field = true;
        this.fieldModuleLoaded = false;
    },
    _loadCss: function(reload){
        var key = encodeURIComponent(this.cssPath);
        if (!reload && o2.widget.css[key]){
            this.css = o2.widget.css[key];
        }else{
            this.cssPath = (this.cssPath.indexOf("?")!=-1) ? this.cssPath+"&v="+o2.version.v : this.cssPath+"?v="+o2.version.v;
            var r = new Request.JSON({
                url: this.cssPath,
                secure: false,
                async: false,
                method: "get",
                noCache: false,
                onSuccess: function(responseJSON, responseText){
                    this.css = responseJSON;
                    o2.widget.css[key] = responseJSON;
                }.bind(this),
                onError: function(text, error){
                    console.log(error + text);
                }
            });
            r.send();
        }
    },
    load: function(){
        if (!this.json.isDelay){
            this.active();
        }
    },
    /**
     * 激活公文编辑器编辑。设置了延迟加载的时候，可以通过这个方法来激活
     * @example
     * this.form.get("fieldId").active();
    */
    active: function(){
        this._loadModuleEvents();
        if (this.fireEvent("queryLoad")){
            this.fireEvent("beforeLoad");
            this.cssPath = this.form.path+this.form.options.style+"/doc.wcss";
            this._loadCss();

            this._queryLoaded();
            this._loadUserInterface(function(){

                this.fieldModuleLoaded = true;

                this.fireEvent("postLoad");
                this.fireEvent("afterLoad");
                this.fireEvent("load");

                this.form.app.addEvent("resize", function(){
                    // if (this.options.pageShow!=="double"){
                    //     this._doublePage();
                    // }else{
                    this._singlePage();
                    // }
                    this._checkScale();
                }.bind(this));

                o2.UD.getDataJson("documenteditorScale", function(json){
                    if (json){
                        this.scaleTo(json.scale);
                        this.documenteditorScale = json.scale
                    }
                    this.addEvent("loadPage", function(){
                        if (this.documenteditorScale) this.scaleTo(this.documenteditorScale);
                    }.bind(this));

                }.bind(this));

            }.bind(this));
            this._loadStyles();

            this._afterLoaded();
        }
    },

    _createNewPage: function(){
        var pageNode = new Element("div.doc_layout_page", {"styles": this.css.doc_page}).inject(this.contentNode);
        var pageContentNode = new Element("div.doc_layout_page_content", {"styles": this.css.doc_layout_page_content}).inject(pageNode);
        pageNode.set("data-pagecount", this.pages.length+1);
        this.pages.push(pageNode);
        return pageNode;
    },
    _getShow: function(name, typeItem, scriptItem){
        switch (this.json[typeItem]) {
            case "y":
                return true;
            case "n":
                return false;
            case "a":
                if (["copies", "secret", "priority", "attachment", "annotation"].indexOf(name!=-1)){
                    if (o2.typeOf(this.data[name])=="string"){
                        var v = this.data[name].trim();
                        return !!v && (!!v.length);
                    }else{
                        return !!this.data[name] && (!!this.data[name].length);
                    }

                }
                return true;
            case "s":
                if (this.json[scriptItem] && this.json[scriptItem].code){
                    return !!this.form.Macro.exec(this.json[scriptItem].code, this);
                }
                return true;
            default:
                return true;
        }
    },
    _createPage: function(callback, callbackAftreLoad){
        var pageContentNode = this._createNewPage().getFirst();

        var control = this.getShowControl();
        this.json.fileup =  !!(control.signer);

        if (this.json.css && this.json.css.code && !this.styleNode){
            var cssText = this.form.parseCSS(this.json.css.code);
            cssText = cssText.replace(/documenteditor_table/g, 'documenteditor_table'+this.form.json.id+this.json.id)


            // var rex = new RegExp("(.+)(?=\\{)", "g");
            // var match;
            // var id = this.json.id.replace(/\-/g, "");
            // var prefix = this.form.json.id+this.json.id;
            //
            // while ((match = rex.exec(cssText)) !== null) {
            //     var rulesStr = match[0];
            //     if (rulesStr.indexOf(",")!=-1){
            //         var rules = rulesStr.split(/\s*,\s*/g);
            //         rules = rules.map(function(r){
            //             return r+prefix;
            //         });
            //         var rule = rules.join(", ");
            //         cssText = cssText.substring(0, match.index) + rule + cssText.substring(rex.lastIndex, cssText.length);
            //         rex.lastIndex = rex.lastIndex + (prefix.length*rules.length);
            //
            //     }else{
            //         var rule = match[0]+prefix;
            //         cssText = cssText.substring(0, match.index) + rule + cssText.substring(rex.lastIndex, cssText.length);
            //         rex.lastIndex = rex.lastIndex + prefix.length;
            //     }
            // }

            var styleNode = document.createElement("style");
            styleNode.setAttribute("type", "text/css");
            styleNode.id="style"+this.json.id;
            //styleNode.inject(pageContentNode);
            styleNode.inject(this.node, "top");

            if(styleNode.styleSheet){
                var setFunc = function(){
                    styleNode.styleSheet.cssText = cssText;
                };
                if(styleNode.styleSheet.disabled){
                    setTimeout(setFunc, 10);
                }else{
                    setFunc();
                }
            }else{
                var cssTextNode = document.createTextNode(cssText);
                styleNode.appendChild(cssTextNode);
            }
            this.styleNode = styleNode;
        }

        if (this.json.documentTempleteType=="cus"){
            var url = this.json.documentTempleteUrl+((this.json.documentTempleteUrl.indexOf("?")!==-1) ? "&" : "?")+"v="+o2.version.v;
            pageContentNode.loadHtml(o2.filterUrl(url), function(){
                this._clearCopytoTrs();
                if (this.json.toWordPageNumber=="y") this.doPageStyles(pageContentNode);

                if (this.attachmentTemplete){
                    var attNode = pageContentNode.getElement(".doc_layout_attachment_content");
                    if (attNode) attNode.empty();
                }
                if (callback) callback(control);
                this.fireEvent("loadPage");
                if (callbackAftreLoad) callbackAftreLoad(control);
            }.bind(this));
        }else{
            this.getTempleteJson(function(){
                this._clearCopytoTrs();
                var templete = this.json.documentTempleteName || "standard";

                var url = "../x_component_process_FormDesigner/Module/Documenteditor/templete/"+this.templeteJson[templete].file;
                url = url+((url.indexOf("?")!==-1) ? "&" : "?")+"v="+o2.version.v;

                pageContentNode.loadHtml(o2.filterUrl(url), function(){
                    if (this.json.toWordPageNumber=="y") this.doPageStyles(pageContentNode);

                    if (this.attachmentTemplete){
                        var attNode = pageContentNode.getElement(".doc_layout_attachment_content");
                        if (attNode) attNode.empty();
                    }
                    if (callback) callback(control);
                    this.fireEvent("loadPage");
                    if (callbackAftreLoad) callbackAftreLoad(control);
                }.bind(this));
            }.bind(this));
        }
    },
    _clearCopytoTrs: function(){
        if (this.layout_copytoContentTr){
            this.layout_copytoContentTr.destroy();
            this.layout_copytoContentTr = null;
        }
        if (this.layout_copytoContentTrP){
            this.layout_copytoContentTrP.destroy();
            this.layout_copytoContentTrP = null;
        }
        if (this.layout_copyto2ContentTr){
            this.layout_copyto2ContentTr.destroy();
            this.layout_copyto2ContentTr = null;
        }
        if (this.layout_copyto2ContentTrP){
            this.layout_copyto2ContentTrP.destroy();
            this.layout_copyto2ContentTrP = null;
        }
    },
    doPageStyles: function(pageContentNode){
        var style = pageContentNode.getLast("style");
        if (style){
            var origin = window.location.origin;
            var header = o2.filterUrl(origin+"/x_component_process_FormDesigner/Module/Documenteditor/header.htm");

            var text = style.get("html");
            var pageRex = /(?:@page\s*\{)([\s\S]*?)(?:\})/;
            var arr = text.match(pageRex);
            if (arr && arr.length){
                cssText = arr[2];
                if (cssText){
                    var last = cssText.substr(cssText.length-1,1);
                    if (last!==";") cssText = cssText+";";
                    cssText += "mso-page-border-surround-header:no;\n" +
                        "        mso-page-border-surround-footer:no;\n" +
                        "        mso-footnote-separator:url(\""+header+"\") fs;\n" +
                        "        mso-footnote-continuation-separator:url(\""+header+"\") fcs;\n" +
                        "        mso-endnote-separator:url(\""+header+"\") es;\n" +
                        "        mso-endnote-continuation-separator:url(\""+header+"\") ecs;\n" +
                        "        mso-facing-pages:yes;";
                    text = text.replace(arr[0], arr[1]+cssText+arr[3]);
                }
            }else{
                text += "@page\n" +
                    "    {mso-page-border-surround-header:no;\n" +
                    "        mso-page-border-surround-footer:no;\n" +
                    "        mso-footnote-separator:url(\""+header+"\") fs;\n" +
                    "        mso-footnote-continuation-separator:url(\""+header+"\") fcs;\n" +
                    "        mso-endnote-separator:url(\""+header+"\") es;\n" +
                    "        mso-endnote-continuation-separator:url(\""+header+"\") ecs;\n" +
                    "        mso-facing-pages:yes;}"
            }

            pageRex = /(@page\s*WordSection1\s*\{)([\s\S]*?)(\})/;
            arr = text.match(pageRex);
            if (arr && arr.length){
                cssText = arr[2];
                if (cssText){
                    var last = cssText.substr(cssText.length-1,1);
                    if (last!==";") cssText = cssText+";";
                    cssText += "mso-header-margin:42.55pt;\n" +
                        "        mso-footer-margin:70.9pt;\n" +
                        "        mso-even-footer:url(\""+header+"\") ef1;\n" +
                        "        mso-footer:url(\""+header+"\") f1;\n" +
                        "        mso-paper-source:0;";
                    text = text.replace(arr[0], arr[1]+cssText+arr[3]);
                }
            }else{
                text += "@page WordSection1\n" +
                    "    {size:595.3pt 841.9pt;\n" +
                    "        margin:104.9pt 73.7pt 99.25pt 79.4pt;\n" +
                    "        layout-grid:15.6pt;\n" +
                    "        line-height:normal;\n" +
                    "        font-size:16.0pt;\n" +
                    "        font-family:仿宋;\n" +
                    "        letter-spacing:-0.4pt;\n" +
                    "        mso-header-margin:42.55pt;\n" +
                    "        mso-footer-margin:70.9pt;\n" +
                    "        mso-even-footer:url(\""+header+"\") ef1;\n" +
                    "        mso-footer:url(\""+header+"\") f1;\n" +
                    "        mso-paper-source:0;\n" +
                    "    }"
            }
            style.set("html", text)
        }
    },
    getTempleteJson: function(callback){
        if (this.templeteJson){
            if (callback) callback();
        }else{
            o2.getJSON(o2.filterUrl("../x_component_process_FormDesigner/Module/Documenteditor/templete/templete.json"), function(json){
                this.templeteJson = json;
                if (callback) callback();
            }.bind(this));
        }
    },
    getShowControl: function(){
        var control = {};
        control.copiesSecretPriority = this._getShow("copiesSecretPriority", "copiesSecretPriorityShow", "copiesSecretPriorityShowScript");

        control.copies = this._getShow("copies", "copiesShow", "copiesShowScript");
        control.secret = this._getShow("secret", "secretShow", "secretShowScript");
        control.priority = this._getShow("priority", "priorityShow", "priorityShowScript");

        control.redHeader = this._getShow("redHeader", "redHeaderShow", "redHeaderShowScript");
        control.redLine = this._getShow("redLine", "redLineShow", "redLineShowScript");

        control.signer = this._getShow("signer", "signerShow", "signerShowScript");
        control.fileno = this._getShow("fileno", "filenoShow", "filenoShowScript");
        control.subject = this._getShow("subject", "subjectShow", "subjectShowScript");
        control.mainSend = this._getShow("mainSend", "mainSendShow", "mainSendShowScript");
        control.attachment = this._getShow("attachment", "attachmentShow", "attachmentShowScript");
        control.issuanceUnit = this._getShow("issuanceUnit", "issuanceUnitShow", "issuanceUnitShowScript");
        control.issuanceDate = this._getShow("issuanceDate", "issuanceDateShow", "issuanceDateShowScript");
        control.annotation = this._getShow("annotation", "annotationShow", "annotationShowScript");
        control.copyto = this._getShow("copyto", "copytoShow", "copytoShowScript");
        control.copyto2 = this._getShow("copyto2", "copyto2Show", "copyto2ShowScript");
        control.editionUnit = this._getShow("editionUnit", "editionUnitShow", "editionUnitShowScript");
        control.editionDate = this._getShow("editionDate", "editionDateShow", "editionDateShowScript");

        control.meetingAttend = this._getShow("meetingAttend", "meetingAttendShow", "meetingAttendShowScript");
        control.meetingLeave = this._getShow("meetingLeave", "meetingLeaveShow", "meetingLeaveShowScript");
        control.meetingSit = this._getShow("meetingSit", "meetingSitShow", "meetingSitShowScript");
        control.meetingRecord = this._getShow("meetingRecord", "meetingRecordShow", "meetingRecordShowScript");
        return control;
    },
    // _getEdit: function(name, typeItem, scriptItem){
    //     switch (this.json[typeItem]) {
    //         case "y":
    //             return true;
    //         case "n":
    //             return false;
    //         // case "a":
    //         //     if (["copies", "secret", "priority", "attachment", "annotation", "copyto"].indexOf(name!=-1)){
    //         //         return !!this.data[name] && (!!this.data[name].length);
    //         //     }
    //         //     return true;
    //         case "s":
    //             if (this.json[scriptItem] && this.json[scriptItem].code){
    //                 return !!this.form.Macro.exec(this.json[scriptItem].code, this);
    //             }
    //             return true;
    //     }
    // },
    getEditControl: function(){
        var control = {};
        control.copies = this._getEdit("copies", "copiesEdit", "copiesEditScript");
        control.secret = this._getEdit("secret", "secretEdit", "secretEditScript");
        control.priority = this._getEdit("priority", "priorityEdit", "priorityEditScript");
        control.redHeader = this._getEdit("redHeader", "redHeaderEdit", "redHeaderEditScript");
        control.signer = this._getEdit("signer", "signerEdit", "signerEditScript");
        control.fileno = this._getEdit("fileno", "filenoEdit", "filenoEditScript");
        control.subject = this._getEdit("subject", "subjectEdit", "subjectEditScript");
        control.mainSend = this._getEdit("mainSend", "mainSendEdit", "mainSendEditScript");
        control.attachment = this._getEdit("attachment", "attachmentEdit", "attachmentEditScript");
        control.attachmentText = this._getEdit("attachmentText", "attachmentTextEdit", "attachmentTextEditScript");
        control.issuanceUnit = this._getEdit("issuanceUnit", "issuanceUnitEdit", "issuanceUnitEditScript");
        control.issuanceDate = this._getEdit("issuanceDate", "issuanceDateEdit", "issuanceDateEditScript");
        control.annotation = this._getEdit("annotation", "annotationEdit", "annotationEditScript");
        control.copyto = this._getEdit("copyto", "copytoEdit", "copytoEditScript");
        control.copyto2 = this._getEdit("copyto2", "copyto2Edit", "copyto2EditScript");
        control.editionUnit = this._getEdit("editionUnit", "editionUnitEdit", "editionUnitEditScript");
        control.editionDate = this._getEdit("editionDate", "editionDateEdit", "editionDateEditScript");
        control.meetingAttend = this._getShow("meetingAttend", "meetingAttendEdit", "meetingAttendEditScript");
        control.meetingLeave = this._getShow("meetingLeave", "meetingLeaveEdit", "meetingLeaveEditScript");
        control.meetingSit = this._getShow("meetingSit", "meetingSitEdit", "meetingSitEditScript");
        control.meetingRecord = this._getShow("meetingRecord", "meetingRecordEdit", "meetingRecordEditScript");
        return control;
    },
    //份数 密级 紧急程度
    _loadCopiesSecretPriority: function(){
        this.layout_copiesSecretPriority = this.contentNode.getElement(".doc_layout_copiesSecretPriority");
        if (this.layout_copiesSecretPriority) this.layout_copiesSecretPriority.setStyles(this.css.doc_layout_copiesSecretPriority);

        /**
         * @summary 份数的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_copies = this.contentNode.getElement(".doc_layout_copies");
        if (this.layout_copies) this.layout_copies.setStyles(this.css.doc_layout_copies);

        /**
         * @summary 密级的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_secret = this.contentNode.getElement(".doc_layout_secret");
        if (this.layout_secret) this.layout_secret.setStyles(this.css.doc_layout_secret);

        /**
         * @summary 紧急度的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_priority = this.contentNode.getElement(".doc_layout_priority");
        if (this.layout_priority) this.layout_priority.setStyles(this.css.doc_layout_priority);

        this.layout_copiesSecretPriority_blank = this.contentNode.getElement(".doc_layout_copiesSecretPriority_blank");

    },

    //红头
    _loadRedHeader: function(){
        /**
         * @summary 红头的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_redHeader = this.contentNode.getElement(".doc_layout_redHeader");
        if (this.layout_redHeader) this.layout_redHeader.setStyles(this.css.doc_layout_redHeader);
    },
    //文号签发人（上行文）
    _loadFileNoUp: function(){
        this.layout_filenoArea = this.contentNode.getElement(".doc_layout_fileno_area");
        this.layout_fileNoUpTable = this.contentNode.getElement(".doc_layout_filenoup");
        if (this.layout_fileNoUpTable) this.layout_fileNoUpTable.setStyles(this.css.doc_layout_filenoup);

        var td = this.contentNode.getElement(".doc_layout_filenoup_fileno_td");
        if (td) td.setStyles(this.css.doc_layout_filenoup_fileno_td);

        /**
         * @summary 文号的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_fileno = this.contentNode.getElement(".doc_layout_filenoup_fileno");
        if (this.layout_fileno) this.layout_fileno.setStyles(this.css.doc_layout_filenoup_fileno);

        td = this.contentNode.getElement(".doc_layout_filenoup_signer_td");
        if (td) td.setStyles(this.css.doc_layout_filenoup_signer_td);

        var node = this.contentNode.getElement(".doc_layout_filenoup_signer_table");
        if (node) node.setStyles(this.css.doc_layout_filenoup_signer_table);
        node = this.contentNode.getElement(".doc_layout_filenoup_signerTitle_td");
        if (node) node.setStyles(this.css.doc_layout_filenoup_signerTitle_td);
        this.layout_signerTitle = this.contentNode.getElement(".doc_layout_filenoup_signer");
        if (this.layout_signerTitle) this.layout_signerTitle.setStyles(this.css.doc_layout_filenoup_signer);
        node = this.contentNode.getElement(".doc_layout_filenoup_signerContent_td");
        if (node) node.setStyles(this.css.doc_layout_filenoup_signerContent_td);

        /**
         * @summary 签发人的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_signer = this.contentNode.getElement(".doc_layout_filenoup_signerContent");
        if (this.layout_signer) this.layout_signer.setStyles(this.css.doc_layout_filenoup_signerContent);

        if (!this.layout_fileno){
            this.layout_fileNoUpTable = this.contentNode.getElement(".doc_layout_filenoup");
            this.layout_filenoArea = this.contentNode.getElement(".doc_layout_fileno_area");
            this.layout_fileno = this.contentNode.getElement(".doc_layout_fileno");
            if (this.layout_fileno) this.layout_fileno.setStyles(this.css.doc_layout_fileno);
        }
    },

    //文号
    _loadFileNo: function(){
        this.layout_fileNoUpTable = this.contentNode.getElement(".doc_layout_filenoup");
        this.layout_filenoArea = this.contentNode.getElement(".doc_layout_fileno_area");
        this.layout_fileno = this.contentNode.getElement(".doc_layout_fileno");
        if (this.layout_fileno) this.layout_fileno.setStyles(this.css.doc_layout_fileno);

        td = this.contentNode.getElement(".doc_layout_filenoup_signer_td");
        if (td) td.setStyles(this.css.doc_layout_filenoup_signer_td);

        var node = this.contentNode.getElement(".doc_layout_filenoup_signer_table");
        if (node) node.setStyles(this.css.doc_layout_filenoup_signer_table);
        node = this.contentNode.getElement(".doc_layout_filenoup_signerTitle_td");
        if (node) node.setStyles(this.css.doc_layout_filenoup_signerTitle_td);
        this.layout_signerTitle = this.contentNode.getElement(".doc_layout_filenoup_signer");
        if (this.layout_signerTitle) this.layout_signerTitle.setStyles(this.css.doc_layout_filenoup_signer);
        node = this.contentNode.getElement(".doc_layout_filenoup_signerContent_td");
        if (node) node.setStyles(this.css.doc_layout_filenoup_signerContent_td);

        this.layout_signer = this.contentNode.getElement(".doc_layout_filenoup_signerContent");
        if (this.layout_signer) this.layout_signer.setStyles(this.css.doc_layout_filenoup_signerContent);

        if (!this.layout_fileno){
            this.layout_filenoArea = this.contentNode.getElement(".doc_layout_fileno_area");
            this.layout_fileNoUpTable = this.contentNode.getElement(".doc_layout_filenoup");
            if (this.layout_fileNoUpTable) this.layout_fileNoUpTable.setStyles(this.css.doc_layout_filenoup);

            var td = this.contentNode.getElement(".doc_layout_filenoup_fileno_td");
            if (td) td.setStyles(this.css.doc_layout_filenoup_fileno_td);

            this.layout_fileno = this.contentNode.getElement(".doc_layout_filenoup_fileno");
            if (this.layout_fileno) this.layout_fileno.setStyles(this.css.doc_layout_filenoup_fileno);
        }
    },

    //红线
    _loadRedLine: function(){
        this.layout_redLine = this.contentNode.getElement(".doc_layout_redline");
        if (this.layout_redLine) this.layout_redLine.setStyles(this.css.doc_layout_redline);
    },

    //标题
    _loadSubject:function(){
        /**
         * @summary 标题的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_subject = this.contentNode.getElement(".doc_layout_subject");
        if (this.layout_subject) this.layout_subject.setStyles(this.css.doc_layout_subject);
        if (this.json.subjectFontFamily){
            if (this.layout_subject) this.layout_subject.setStyle("font-family", this.json.subjectFontFamily);
        }
    },

    //主送
    _loadMainSend: function(){
        /**
         * @summary 主送的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_mainSend = this.contentNode.getElement(".doc_layout_mainSend");
        if (this.layout_mainSend) this.layout_mainSend.setStyles(this.css.doc_layout_mainSend);
    },

    //正文
    // _createFiletext: function(filetextNode, node, where){
    //     if (!filetextNode){
    //         var filetextNode = new Element("div.doc_layout_filetext").inject(node, where);
    //         filetextNode.addClass("doc_block");
    //         filetextNode.setAttribute('contenteditable', true);
    //     }
    //     CKEDITOR.disableAutoInline = true;
    //     var filetextEditor = CKEDITOR.inline(filetextNode, this._getEditorConfig());
    //     filetextNode.store("editor", filetextEditor);
    //     if (!this.filetextEditors) this.filetextEditors = [];
    //     this.filetextEditors.push(filetextEditor);
    //
    //     filetextEditor.on( 'blur', function(e) {
    //         // var filetextNode = e.editor.container.$;
    //         // var pageNode = filetextNode.getParent(".doc_layout_page");
    //         // this._checkSplitPage(pageNode);
    //         // this._repage();
    //     }.bind(this));
    //
    //     return filetextNode;
    // },
    _loadFiletext: function(){
        /**
         * @summary 正文区域的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_filetext = this.contentNode.getElement(".doc_layout_filetext");
        this.layout_filetext.addClass("css"+this.form.json.id+this.json.id);
        this.layout_filetext.setStyles(this.css.doc_layout_filetext);

        //this.layout_filetext = this.contentNode.getElement(".doc_layout_filetext");
        // if (this.layout_filetexts.length){
        //     this.layout_filetexts.each(function(layout_filetext){
        //         layout_filetext.setStyles(this.css.doc_layout_filetext);
        //     }.bind(this));
        // }
    },

    //附件
    _loadAttachment: function(){
        this.layout_attachmentTable = this.contentNode.getElement(".doc_layout_attachment");
        if (this.layout_attachmentTable) this.layout_attachmentTable.setStyles(this.css.doc_layout_attachment);

        var node = this.contentNode.getElement(".doc_layout_attachment_title_td");
        if (node) node.setStyles(this.css.doc_layout_attachment_title_td);

        this.layout_attachmentTitle = this.contentNode.getElement(".doc_layout_attachment_title");
        if (node) node.setStyles(this.css.doc_layout_attachment_title);

        node = this.contentNode.getElement(".doc_layout_attachment_content_td");
        if (node) node.setStyles(this.css.doc_layout_attachment_content_td);

        /**
         * @summary 附件区域的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_attachment = this.contentNode.getElement(".doc_layout_attachment_content");
        if (this.layout_attachment) this.layout_attachment.setStyles(this.css.doc_layout_attachment_content);
    },

    //发布单位
    _loadIssuance: function(){
        this.layout_issuanceTable = this.contentNode.getElement(".doc_layout_issuance");
        /**
         * @summary 发文单位的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_issuanceUnit = this.contentNode.getElement(".doc_layout_issuanceUnit");
        /**
         * @summary 发文时间的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_issuanceDate = this.contentNode.getElement(".doc_layout_issuanceDate");

        if (this.layout_issuanceTable) this.layout_issuanceTable.setStyles(this.css.doc_layout_issuance);
        if (this.layout_issuanceUnit) this.layout_issuanceUnit.setStyles(this.css.doc_layout_issuanceUnit);
        if (this.layout_issuanceDate) this.layout_issuanceDate.setStyles(this.css.doc_layout_issuanceDate);
    },

    //附注
    _loadAnnotation: function(){
        /**
         * @summary 附注的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_annotation = this.contentNode.getElement(".doc_layout_annotation");
        if (this.layout_annotation) this.layout_annotation.setStyles(this.css.doc_layout_annotation);
    },

    //附件文本
    _loadAttachmentText: function(){
        this.layout_attachmentText = this.contentNode.getElement(".doc_layout_attachment_text");
    },


    //版记
    _loadEdition: function(){
        this.layout_editionArea = this.contentNode.getElement(".doc_layout_editionArea");
        this.layout_edition = this.contentNode.getElement(".doc_layout_edition");
        if (this.layout_edition) this.layout_edition.setStyles(this.css.doc_layout_edition);

        var node = this.contentNode.getElement(".doc_layout_edition_copyto");
        if (node) node.setStyles(this.css.doc_layout_edition_copyto);
        node = this.contentNode.getElement(".doc_layout_edition_copyto_table");
        if (node) node.setStyles(this.css.doc_layout_edition_copyto_table);

        var node = this.contentNode.getElement(".doc_layout_edition_copyto2");
        if (node) node.setStyles(this.css.doc_layout_edition_copyto);
        node = this.contentNode.getElement(".doc_layout_edition_copyto2_table");
        if (node) node.setStyles(this.css.doc_layout_edition_copyto_table);

        this.layout_copytoTitle = this.contentNode.getElement(".doc_layout_edition_copyto_title");
        if (this.layout_copytoTitle) this.layout_copytoTitle.setStyles(this.css.doc_layout_edition_copyto_title);

        /**
         * @summary 抄送的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_copytoContent = this.contentNode.getElement(".doc_layout_edition_copyto_content");
        if (this.layout_copytoContent) this.layout_copytoContent.setStyles(this.css.doc_layout_edition_copyto_content);

        this.layout_copyto2Title = this.contentNode.getElement(".doc_layout_edition_copyto2_title");
        if (this.layout_copyto2Title) this.layout_copyto2Title.setStyles(this.css.doc_layout_edition_copyto_title);
        this.layout_copyto2Content = this.contentNode.getElement(".doc_layout_edition_copyto2_content");
        if (this.layout_copyto2Content) this.layout_copyto2Content.setStyles(this.css.doc_layout_edition_copyto_content);

        var issuance = this.contentNode.getElement(".doc_layout_edition_issuance");
        if (issuance) issuance.setStyles(this.css.doc_layout_edition_issuance);
        var issuance_table = this.contentNode.getElement(".doc_layout_edition_issuance_table");
        if (issuance_table) issuance_table.setStyles(this.css.doc_layout_edition_issuance_table);
        /**
         * @summary 印发单位的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_edition_issuance_unit = this.contentNode.getElement(".doc_layout_edition_issuance_unit");
        if (this.layout_edition_issuance_unit) this.layout_edition_issuance_unit.setStyles(this.css.doc_layout_edition_issuance_unit);
        /**
         * @summary 印发时间的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_edition_issuance_date = this.contentNode.getElement(".doc_layout_edition_issuance_date");
        if (this.layout_edition_issuance_date) this.layout_edition_issuance_date.setStyles(this.css.doc_layout_edition_issuance_date);
    },
    loadSeal: function(){
        /**
         * @summary 模拟盖章的dom对象.
         * @member {MWF.xApplication.process.Xform.Documenteditor}
         */
        this.layout_seals = this.contentNode.getElements(".doc_layout_seal");
        this.layout_seals.each(function(node){
            // if (!node.get("src")){
                node.hide();
            // }else{
            //     node.show();
            //     node.setStyles({
            //         "border": "0",
            //         "border-radius": "0"
            //     });
            // }
        });
    },

    /**对正文进行模拟盖章（模板中必须有class为“doc_layout_seal”的img对象）
     * @summary 对正文进行模拟盖章，此方法只是进行模拟盖章，通过图片显示，并非专业盖章，不具备法律效应。
     * * @param src{String} 盖章图片的url.
     * @param position{integer} 要盖章的位置, 默认为0.
     * @example
     *  this.form.get("documenteditor").seal("../custom/img/seal.png", 0); //在第一个盖章位置进行模拟盖章
     */
    seal: function(src, position){
        var p = position || 0;
        if (this.layout_seals && this.layout_seals.length){
            if (this.layout_seals[p]){
                this.layout_seals[p].src = src;
                this.layout_seals[p].show();
                this.layout_seals[p].setStyles({
                    "border": "0",
                    "border-radius": "0",
                    "z-index": -1
                });
            }
            this.getSealData();
        }
    },
    _loadMeeting: function(){
        this.layout_meetingAttendArea = this.contentNode.getElement(".doc_layout_meeting_attend");
        this.layout_meetingAttendTitle = this.contentNode.getElement(".doc_layout_meeting_attend_title");
        this.layout_meetingAttendContent = this.contentNode.getElement(".doc_layout_meeting_attend_content");

        this.layout_meetingLeaveArea = this.contentNode.getElement(".doc_layout_meeting_leave");
        this.layout_meetingLeaveTitle = this.contentNode.getElement(".doc_layout_meeting_leave_title");
        this.layout_meetingLeaveContent = this.contentNode.getElement(".doc_layout_meeting_leave_content");

        this.layout_meetingSitArea = this.contentNode.getElement(".doc_layout_meeting_sit");
        this.layout_meetingSitTitle = this.contentNode.getElement(".doc_layout_meeting_sit_title");
        this.layout_meetingSitContent = this.contentNode.getElement(".doc_layout_meeting_sit_content");

        this.layout_meetingRecordArea = this.contentNode.getElement(".doc_layout_meeting_record");
        this.layout_meetingRecordTitle = this.contentNode.getElement(".doc_layout_meeting_record_title");
        this.layout_meetingRecordContent = this.contentNode.getElement(".doc_layout_meeting_record_content");
    },
    _loadCustom: function(){

        var nodes = this.contentNode.getElements(".doc_layout");
        nodes.each(function(node){
            var name = node.get("data-doc-layout");
            if (!this.customLayouts) this.customLayouts = [];
            this.customLayouts.push({
                "name": name,
                "node": node,
            });
            this[name] = node;
        }.bind(this));
    },
    _loadPageLayout: function(control){
        this._loadCopiesSecretPriority();
        this._loadRedHeader();

        if (this.json.fileup){
            this._loadFileNoUp();
        }else{
            this._loadFileNo();
        }
        if (!this.layout_fileno) this._loadFileNo();

        this._loadRedLine();
        this._loadSubject();

        this._loadMainSend();
        this._loadFiletext();
        this._loadAttachment();

        this._loadIssuance();

        this._loadAnnotation();

        this._loadAttachmentText()

        this._loadEdition();

        this.loadSeal();

        //会议纪要
        this._loadMeeting();

        //自定义
        this._loadCustom();



        this.reSetShow(control);
        this.reSetEdit();

        // 份数:          this.layout_copies
        // 密级:          this.layout_secret
        // 紧急程度:       this.layout_priority
        // 红头:          this.layout_redHeader
        // 上行文编号签发：  this.layout_fileNoUpTable
        // 文号:           this.layout_fileno
        // 签发:           this.layout_signerTitle
        // 签发人:         this.layout_signer
        // 文号：          this.layout_fileno
        // 红线：          this.layout_redLine
        // 标题：          this.layout_subject
        // 主送单位：       this.layout_mainSend
        // 正文：          this.layout_filetexts
        // 附件：          this.layout_attachmentTitle
        // 附件：          this.layout_attachment
        // 单位：          this.layout_issuanceUnit
        // 签发时间：       this.layout_issuanceDate
        // 附注：          this.layout_annotation
        // 抄送：          this.layout_copytoTitle
        // 抄送：          this.layout_copytoContent
        // 版记单位         this.layout_edition_issuance_unit
        // 版记日期         this.layout_edition_issuance_date
    },

    reSetShow: function(control){
        if (!control) control = this.getShowControl();
        var m = function(s){ return (control[s]) ? "show" : "hide"; }

        if (this.layout_copiesSecretPriority) this.layout_copiesSecretPriority[m("copiesSecretPriority")]();
        // control.copies = this._getShow("copies", "copiesShow", "copiesShowScript");
        // control.secret = this._getShow("secret", "secretShow", "secretShowScript");
        // control.priority = this._getShow("priority", "priorityShow", "priorityShowScript");
        var n = 0;
        if (!control.copies) n++;
        if (!control.secret) n++;
        if (!control.priority) n++;
        if (this.layout_copiesSecretPriority_blank){
            this.layout_copiesSecretPriority_blank.empty();
            while (n>0){
                this.layout_copiesSecretPriority_blank.appendHTML("<p class=\"MsoNormal\"><span style='font-size:16.0pt'>&nbsp;</span></p>");
                n--;
            }
        }

        if (this.layout_copies) this.layout_copies[m("copies")]();
        if (this.layout_secret) this.layout_secret[m("secret")]();
        if (this.layout_priority) this.layout_priority[m("priority")]();

        if (this.layout_redHeader) this.layout_redHeader[m("redHeader")]();
        if (this.layout_redLine) this.layout_redLine[m("redLine")]();

        if (this.layout_fileNoUpTable) this.layout_fileNoUpTable[m("signer")]();
        if (this.layout_filenoArea) this.layout_filenoArea[(!control.signer) ? "show" : "hide"]();


        if (this.layout_signerTitle) this.layout_signerTitle[m("signer")]();
        if (this.layout_signer) this.layout_signer[m("signer")]();


        if (this.layout_fileno) this.layout_fileno[m("fileno")]();
        if (this.layout_subject) this.layout_subject[m("subject")]();
        if (this.layout_mainSend) this.layout_mainSend[m("mainSend")]();
        if (this.layout_attachmentTable) this.layout_attachmentTable[m("attachment")]();
        if (this.layout_issuanceUnit) this.layout_issuanceUnit[m("issuanceUnit")]();
        if (this.layout_issuanceDate) this.layout_issuanceDate[m("issuanceDate")]();


        if (this.layout_issuanceUnit && this.layout_issuanceDate){
            var table = this.layout_issuanceUnit.getParent("table")
            if (table && !table.hasClass("doc_layout_headIssuance")) {
                var unitWidth = o2.getTextSize(this.layout_issuanceUnit.get("text"), {
                    "font-size": "16pt",
                    "font-family": "'Times New Roman',仿宋",
                    "letter-spacing": "-0.4pt"
                }).x;
                var dateWidth = o2.getTextSize(this.layout_issuanceDate.get("text"), {
                    "font-size": "16pt",
                    "font-family": "'Times New Roman',仿宋",
                    "letter-spacing": "-0.4pt"
                }).x;

                if (table.hasClass("doc_layout_issuanceV2")){
                    if (unitWidth<=dateWidth){
                        //日期右空四字，单位相对与日期居中
                        var flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                        if (flagTd) flagTd.setStyle("width", "64pt");
                        flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                        if (flagTd) flagTd.setStyle("width", "64pt");

                        var dateP = this.layout_issuanceDate.getParent("p");
                        if (dateP){
                            dateP.setStyle("text-align", "right");
                            var span = dateP.getElement("span.space");
                            if (span) span.destroy();
                        }
                    }else{
                        var flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                        if (flagTd) flagTd.setStyle("width", "32pt");
                        flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                        if (flagTd) flagTd.setStyle("width", "32pt");

                        var dateP = this.layout_issuanceDate.getParent("p");
                        var dateP = this.layout_issuanceDate.getParent("p");
                        if (dateP){
                            dateP.setStyle("text-align", "left");
                            var span = dateP.getElement("span.space");
                            if (!span) new Element("span.space", { "html": "&#x3000;&#x3000;" }).inject(dateP, "top");
                        }
                    }
                }else{
                    if (unitWidth <= dateWidth) {
                        //日期右空四字，单位相对与日期居中
                        var flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                        if (flagTd) {
                            var pt = 16*4;  //空四字
                            flagTd.setStyle("width", "" + pt + "pt");

                            flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                            if (flagTd) flagTd.setStyle("width", "" + pt + "pt");
                        }
                        //var dateTd = this.layout_issuanceDate.getParent("td");
                        var unitTd = this.layout_issuanceUnit.getParent("td");
                        unitTd.setStyle("width", dateWidth);
                        var p = this.layout_issuanceUnit.getParent("p");
                        if (p) p.setStyle("text-align", "center");
                    } else {
                        var flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                        if (flagTd) flagTd.setStyle("width", "32pt");

                        var unitTd = this.layout_issuanceUnit.getParent("td");
                        unitTd.setStyle("width", "auto");

                        flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                        if (flagTd) flagTd.setStyle("width", "64pt");
                        var p = this.layout_issuanceDate.getParent("p");
                        if (p) p.setStyle("text-align", "right");
                    }
                }
            }
        }

        if (this.layout_annotation) this.layout_annotation[m("annotation")]();

        if ((!control.copyto || !this.layout_copytoContent) && (!control.copyto2 || !this.layout_copyto2Content)  && (!control.editionUnit || !this.layout_edition_issuance_unit) && (!control.editionDate || !this.layout_edition_issuance_date)){
            if (this.layout_editionArea) this.layout_editionArea.hide();
        }else{
            if (this.layout_copytoContent){
                if (!this.layout_copytoContentTr) this.layout_copytoContentTr = this.layout_copytoContent.getParent("tr");
                if (!this.layout_copytoContentTrP) this.layout_copytoContentTrP = this.layout_copytoContentTr.getParent();
            }
            if (this.layout_copyto2Content){
                if (!this.layout_copyto2ContentTr) this.layout_copyto2ContentTr = this.layout_copyto2Content.getParent("tr");
                if (!this.layout_copyto2ContentTrP) this.layout_copyto2ContentTrP = this.layout_copyto2ContentTr.getParent();
            }
            if (!this.copyToOrder){
                this.copyToOrder = "unknow"
                if (this.layout_copytoContentTr && this.layout_copyto2ContentTr){   //需要知道顺序
                    if (this.layout_copytoContentTrP && this.layout_copyto2ContentTrP && this.layout_copytoContentTrP==this.layout_copyto2ContentTrP){
                        var n = this.layout_copytoContentTrP.getFirst();
                        while (n && n!=this.layout_copytoContentTr && n!=this.layout_copyto2ContentTr){
                            n = n.getNext();
                        }
                        if (n==this.layout_copytoContentTr){
                            this.copyToOrder = "copyto";
                        }
                        if (n==this.layout_copyto2ContentTr){
                            this.copyToOrder = "copyto2";
                        }
                    }
                }
            }

            if ((!control.copyto || !this.layout_copytoContent) && (!control.copyto2 || !this.layout_copyto2Content) ){
                if (this.layout_edition){
                    if (this.layout_copytoContentTr) this.layout_copytoContentTr.dispose();
                    if (this.layout_copyto2ContentTr) this.layout_copyto2ContentTr.dispose();
                    // if (this.layout_edition) this.layout_edition.getElement("tr").getElements("td")[0].setStyles({
                    //     "border-top": "solid windowtext 1.5pt",
                    //     "mso-border-top-alt": "solid windowtext 1pt"
                    // });
                }
            }else if (!control.copyto || !this.layout_copytoContent){
                if (this.layout_copytoContentTr) this.layout_copytoContentTr.dispose();
                if (this.layout_copyto2ContentTr){
                    try{
                        this.layout_copyto2ContentTr.inject(this.layout_copyto2ContentTrP, "top");
                    }catch (e){
                        this.layout_copyto2ContentTrP.appendHTML(this.layout_copyto2ContentTr.outerHTML, "top");
                    }
                }
                //if (this.layout_copyto2Content) this.layout_edition.getElement("tr").destroy();
                // if (this.layout_edition) this.layout_edition.getElement("tr").getElements("td").setStyles({
                //     "border-top": "solid windowtext 1.5pt",
                //     "mso-border-top-alt": "solid windowtext 1pt"
                // });
            }else if (!control.copyto2 || !this.layout_copyto2Content) {
                if (this.layout_copyto2ContentTr) this.layout_copyto2ContentTr.dispose();
                // if (this.layout_copytoContentTr) this.layout_copytoContentTr.inject(this.layout_copytoContentTrP, "top");
                if (this.layout_copytoContentTr){
                    try{
                        this.layout_copytoContentTr.inject(this.layout_copytoContentTrP, "top");
                    }catch (e){
                        this.layout_copytoContentTrP.appendHTML(this.layout_copytoContentTr.outerHTML, "top");
                    }
                }
                // if (this.layout_edition) this.layout_edition.getElement("tr").getElements("td").setStyles({
                //     "border-bottom": "solid windowtext 0.75pt",
                //     "mso-border-bottom-alt": "solid windowtext 0.75pt"
                // });
            }else{
                if (this.copyToOrder == "copyto2"){
                    // if (this.layout_copytoContentTr) this.layout_copytoContentTr.inject(this.layout_copytoContentTrP, "top");
                    // if (this.layout_copyto2ContentTr) this.layout_copyto2ContentTr.inject(this.layout_copyto2ContentTrP, "top");
                    if (this.layout_copytoContentTr){
                        try{
                            this.layout_copytoContentTr.inject(this.layout_copytoContentTrP, "top");
                        }catch (e){
                            this.layout_copytoContentTrP.appendHTML(this.layout_copytoContentTr.outerHTML, "top");
                        }
                    }
                    if (this.layout_copyto2ContentTr){
                        try{
                            this.layout_copyto2ContentTr.inject(this.layout_copyto2ContentTrP, "top");
                        }catch (e){
                            this.layout_copyto2ContentTrP.appendHTML(this.layout_copyto2ContentTr.outerHTML, "top");
                        }
                    }

                }else{
                    // if (this.layout_copyto2ContentTr) this.layout_copyto2ContentTr.inject(this.layout_copyto2ContentTrP, "top");
                    // if (this.layout_copytoContentTr) this.layout_copytoContentTr.inject(this.layout_copytoContentTrP, "top");
                    if (this.layout_copyto2ContentTr){
                        try{
                            this.layout_copyto2ContentTr.inject(this.layout_copyto2ContentTrP, "top");
                        }catch (e){
                            this.layout_copyto2ContentTrP.appendHTML(this.layout_copyto2ContentTr.outerHTML, "top");
                        }
                    }
                    if (this.layout_copytoContentTr){
                        try{
                            this.layout_copytoContentTr.inject(this.layout_copytoContentTrP, "top");
                        }catch (e){
                            this.layout_copytoContentTrP.appendHTML(this.layout_copytoContentTr.outerHTML, "top");
                        }
                    }
                }
            }

            if ((!control.editionUnit || !this.layout_edition_issuance_unit) && (!control.editionDate || !this.layout_edition_issuance_date)){
                if (this.layout_editionArea && (this.contentNode.getElement(".doc_layout_edition_issuance_date") || this.contentNode.getElement(".doc_layout_edition_issuance_unit"))){
                    var trs = this.layout_editionArea.getElement("table").rows;
                    trs.item(trs.length-1).destroy();
                    // trs = this.layout_editionArea.getElement("table").rows;
                    // var tr = trs.item(trs.length-1);
                    // if (tr){
                    //     tr.getElements("td").setStyles({
                    //         "border-bottom": "solid windowtext 1.5pt",
                    //         "mso-border-bottom-alt": "solid windowtext 1pt"
                    //     });
                    // }
                }
            }
            if (this.layout_editionArea && (this.layout_edition_issuance_date || this.layout_edition_issuance_unit)){
                trs = this.layout_editionArea.getElement("table").rows;
                for (var i=0; i<trs.length; i++){
                    var tds = trs.item(i).cells;
                    for (var n=0; n<tds.length; n++){
                        var td = tds.item(n);
                        var tdClass = td.get("class");
                        var tdClassList = (tdClass) ? tdClass.split(/\s+/g) : [];

                        if (tdClassList.indexOf("line_top_thin_bottom_thick") != -1) tdClassList = tdClassList.erase("line_top_thin_bottom_thick");
                        if (tdClassList.indexOf("line_top_thick_bottom_thin") != -1) tdClassList = tdClassList.erase("line_top_thick_bottom_thin");
                        if (tdClassList.indexOf("line_top_thick_bottom_thick") != -1) tdClassList = tdClassList.erase("line_top_thick_bottom_thick");

                        if (tdClassList.indexOf("line_top_thin_bottom_thin") == -1) tdClassList.unshift("line_top_thin_bottom_thin");

                        // td.setStyles({
                        //     "border-top": "solid windowtext 0.75pt",
                        //     "mso-border-top-alt": "solid windowtext 0.75pt",
                        //     "border-bottom": "solid windowtext 0.75pt",
                        //     "mso-border-bottom-alt": "solid windowtext 0.75pt",
                        // });
                        if (i==0 && i!=(trs.length-1)){
                            if (tdClassList.indexOf("line_top_thin_bottom_thin") != -1) tdClassList = tdClassList.erase("line_top_thin_bottom_thin");
                            tdClassList.unshift("line_top_thick_bottom_thin");
                            // td.setStyles({
                            //     "border-top": "solid windowtext 1.5pt",
                            //     "mso-border-top-alt": "solid windowtext 1pt"
                            // });
                        }else if (i==0 && i==(trs.length-1)){
                            if (tdClassList.indexOf("line_top_thin_bottom_thin") != -1) tdClassList = tdClassList.erase("line_top_thin_bottom_thin");
                            tdClassList.unshift("line_top_thick_bottom_thick");
                        }else if (i!=0 && i==(trs.length-1)){
                            if (tdClassList.indexOf("line_top_thin_bottom_thin") != -1) tdClassList = tdClassList.erase("line_top_thin_bottom_thin");
                            tdClassList.unshift("line_top_thin_bottom_thick");
                        }
                        // if (i==(trs.length-1)){
                        //     if (tdClassList.indexOf("line_bottom_thin") != -1) tdClassList = tdClassList.erase("line_bottom_thin");
                        //     if (tdClassList.indexOf("line_bottom_thick") == -1) tdClassList.push("line_bottom_thick");
                        //     // td.setStyles({
                        //     //     "border-bottom": "solid windowtext 1.5pt",
                        //     //     "mso-border-bottom-alt": "solid windowtext 1pt"
                        //     // });
                        // }

                        tdClass = tdClassList.join(" ");
                        td.set("class", tdClass);
                    }
                }
            }

            var coptyToTitleNode = (this.layout_copytoTitle || this.layout_copyto2Title);
            if (coptyToTitleNode){
                var editionTable = coptyToTitleNode.getParent("table");
                if (editionTable) if (editionTable.get("data-compute-style")=="y"){
                    var rows = editionTable.rows;
                    for (var i=0; i<rows.length; i++){
                        var cell = rows[i].cells[0];

                        var tmp = cell.getElement(".doc_layout_edition_issuance_unit");
                        if (!tmp) tmp = cell.getElement(".doc_layout_edition_issuance_date");
                        if (!tmp){
                            var text = cell.get("text").trim();
                            var l = 14*text.length;
                            var wl = 19*text.length;
                            cell.setStyles({
                                "max-width": ""+l+"pt",
                                "min-width": ""+l+"pt",
                                "width": ""+wl+"pt"
                            });
                        }
                    }
                }
            }



            if (this.layout_editionArea) this.layout_editionArea.show();
            if (this.layout_copytoTitle) this.layout_copytoTitle[m("copyto")]();
            if (this.layout_copytoContent) this.layout_copytoContent[m("copyto")]();
            if (this.layout_copyto2Title) this.layout_copyto2Title[m("copyto2")]();
            if (this.layout_copyto2Content) this.layout_copyto2Content[m("copyto2")]();

            if (this.layout_edition_issuance_unit) this.layout_edition_issuance_unit[m("editionUnit")]();
            if (this.layout_edition_issuance_date) this.layout_edition_issuance_date[m("editionDate")]();
        }

        if (this.layout_meetingAttendArea) this.layout_meetingAttendArea[m("meetingAttend")]();
        if (this.layout_meetingLeaveArea) this.layout_meetingLeaveArea[m("meetingLeave")]();
        if (this.layout_meetingSitArea) this.layout_meetingSitArea[m("meetingSit")]();
        if (this.layout_meetingRecordArea) this.layout_meetingRecordArea[m("meetingRecord")]();

        // this.layout_annotation[m("annotation")]();
        // this.layout_annotation[m("annotation")]();
        // this.layout_annotation[m("annotation")]();
    },
    reSetEdit: function(control){
        //未进行数据绑定时，可允许编辑
        if (!control) var control = this.getEditControl();
        if (this.layout_subject){
            if (!this.json.subjectValueData && this.json.subjectValueType=="data"){
                this.layout_subject.set("contenteditable", control.subject);
                // this.layout_subject.addEvent("blur", function(){
                //     this.getData();
                // }.bind(this))
                this.layout_subject.addEvent("blur", function(e){
                    var subject = this.layout_subject.get("text");
                    if (!subject){
                        this.layout_subject.set("html", this.data.subject);
                        this.form.app.notice(MWF.xApplication.process.Xform.LP.subjectEmpty, "error", this.layout_subject, {"x": "center","y":"top"}, {"x": 0,"y":60});
                        e.preventDefault();
                        e.stopPropagation();
                    }else{
                        if (this.json.subjectEditBindFormData){
                            this.form.Macro.environment.data[this.json.subjectEditBindFormData]=subject;
                        }
                        this.getData();
                    }
                }.bind(this));
            }
        }

        if (this.layout_issuanceUnit){
            if (!this.json.issuanceUnitValueData && this.json.issuanceUnitValueType=="data"){
                this.layout_issuanceUnit.set("contenteditable", control.issuanceUnit);
                // this.layout_issuanceUnit.addEvent("blur", function(){
                //     this.getData();
                // }.bind(this))

                this.layout_issuanceUnit.addEvent("blur", function(e){
                    var issuanceUnit = this.layout_issuanceUnit.get("text");
                    if (!issuanceUnit){
                        this.layout_issuanceUnit.set("html", this.data.issuanceUnit);
                        this.form.app.notice(MWF.xApplication.process.Xform.LP.issuanceUnitEmpty, "error", this.layout_issuanceUnit, {"x": "center","y":"top"}, {"x": 0,"y":60});
                        e.preventDefault();
                        e.stopPropagation();
                    }else{
                        this.getData();
                    }
                }.bind(this));
            }
        }
        if (this.layout_filetext){
            // if (this.allowEdit) {
            //     if (!this.loadFileTextEditFun) this.loadFileTextEditFun = this._switchReadOrEditInline.bind(this);
            //     this.layout_filetext.removeEvent("click", this.loadFileTextEditFun);
            //     this.layout_filetext.addEvent("click", this.loadFileTextEditFun);
            // }
        }
        if (this.layout_attachmentText){
            if (control.attachmentText) {
                if (!this.loadAttachmentTextEditFun) this.loadAttachmentTextEditFun = this.loadAttachmentTextEdit.bind(this);
                this.layout_attachmentText.removeEvent("click", this.loadAttachmentTextEditFun);
                this.layout_attachmentText.addEvent("click", this.loadAttachmentTextEditFun);
                if (!this.data.attachmentText){
                    this.layout_attachmentText.set("text", MWF.xApplication.process.Xform.LP.documentEditor.attachmentInfor);
                }
            }
        }


        // this.layout_subject.addEvent("keydown", function(e){
        //     if (this.json.subjectValueType=="data" && this.json.subjectValueData){
        //         // var v = e.target.get("HTML");
        //         // this.form.businessData.data[this.json.subjectValueData] = v
        //         var module = this.form.all[this.json.subjectValueData];
        //         if (module){
        //             var bindFun = module.node.retrieve(this.json.id+"bindFun");
        //             module.node
        //         }
        //     }
        // }.bind(this));
    },
    loadAttachmentTextEdit: function(){
        this._createEditor("inline", this.layout_attachmentText, this.data.attachmentText, "attachmentTextEditor", function(){
            this.layout_attachmentText.removeEvent("click", this.loadAttachmentTextEditFun);
            var text = this.layout_attachmentText.get("text");
            text = text.replace(/\u3000*/g, "");
            if (!text || text==MWF.xApplication.process.Xform.LP.documentEditor.attachmentInfor){
                this.layout_attachmentText.empty();
                this["attachmentTextEditor"].insertHtml("<div aria-label=\"分页符\" class=\"cke_pagebreak\" contenteditable=\"false\" data-cke-display-name=\"pagebreak\" data-cke-pagebreak=\"1\" style=\"page-break-after: always\" title=\"分页符\"></div>" +
                    "<div style=\"font-family:黑体;font-size:16pt;\">附件1</div>" +
                    "<div><span>　</span></div>" +
                    "<div style=\"font-family: 方正小标宋简体; font-size: 22pt; text-align: center;\">附件标题</div>" +
                    "<div><span>　</span></div>" +
                    "<div>　　附件内容</div>");
            }
        }.bind(this));
    },

    _loadUserInterface: function(callback){
        this.node.empty();
        this.node.setStyles(this.form.css.documentEditorNode);
        this.pages = [];

        this.allowEdit = this._isAllowEdit();
        this.allowPrint = this._isAllowPrint();
        this.allowHistory = this._isAllowHistory();
        this.allowHandwrittenApproval = this._isAllowHandwrittenApproval();
        this.toolNode = new Element("div", {"styles": this.css.doc_toolbar}).inject(this.node);
        this.contentNode = new Element("div#doc_content", {"styles": this.css.doc_content}).inject(this.node);

        if (!this.form.isLoaded){
            this.form.addEvent("afterModulesLoad", function(){this.loadDocumentEditor(callback);}.bind(this));
        }else{
            this.loadDocumentEditor(callback);
        }

    },
    loadDocumentEditor: function(callback){
        this._loadToolbars();
        this._loadFiletextPage(function(){
            if (this.options.pageShow!=="double"){
                this._singlePage();
            }else{
                this._doublePage();
            }

            // this.form.addEvent("beforeProcess", function(){
            //     this.resetData();
            //     if (this.checkSaveNewEdition()) this.saveNewDataEdition();
            //     this.notSaveResetData = true;
            // }.bind(this));
            this.form.addEvent("beforeSave", function(){
                this.resetData();
                this.checkSaveNewEdition();
            }.bind(this));

            // this.form.addEvent("beforeProcess", function(){
            //     this.checkSaveNewHistroy();
            // }.bind(this));

            if (this.json.toWord=="y"){
                if (this.json.toWordTrigger=="open") this.docToWord();
                //if (this.json.toWordTrigger=="save")  this.form.addEvent("beforeSave", this.docToWord.bind(this));
                //if (this.json.toWordTrigger=="submit")  this.form.addEvent("beforeProcess", this.docToWord.bind(this));
                if (this.json.toWordTrigger=="save") {
                    if (!this.form.toWordSaveList) this.form.toWordSaveList = [];
                    this.form.toWordSaveList.push(this);
                }

                if (this.json.toWordTrigger=="submit") {
                    if (!this.form.toWordSubmitList) this.form.toWordSubmitList = [];
                    this.form.toWordSubmitList.push(this);
                }
            }
            //if (!layout.mobile) this.loadSideToolbar();

            o2.load("../o2_lib/diff-match-patch/diff_match_patch.js");

            if (this.form.businessData.data["$work"]){
                var id = this.form.businessData.data["$work"].job;
                o2.Actions.load("x_processplatform_assemble_surface").DocumentVersionAction.listWithJobCategory(id, this.json.id, function(json){
                    this.historyDocumentList = json.data;
                    if (this.historyDocumentList.length){
                        o2.Actions.load("x_processplatform_assemble_surface").DocumentVersionAction.get(this.historyDocumentList[this.historyDocumentList.length-1].id, function(json){
                            var data = JSON.parse(json.data.data);
                            this.originaHistoryData = data.data;
                        }.bind(this));
                    }
                }.bind(this));
            }


            if (callback) callback();
        }.bind(this));

        if (!this.form.documenteditorList) this.form.documenteditorList=[];
        this.form.documenteditorList.push(this);
    },

    getFiletextText: function(data){
        var div = new Element("div", {
            "html": data
        });
        var text = div.get("text");
        div.destroy();
        return text;
    },
    checkSaveNewEdition: function(callback){
        if (!this.allowEdit || !this.data.filetext || this.data.filetext == this.json.defaultValue.filetext) return false;
        if (this.form.businessData.work){
            var originaData = this.form.businessData.originalData[this.json.id];
            var editionData = {"category": this.json.id};

            if (!originaData || !originaData.filetext || !this.originaHistoryData){
                //保存原始版本
                this.originaHistoryData = {"data": this.data.filetext, "v": "6"};
                editionData.data = JSON.stringify({"data": this.data.filetext, "v": "6"});
            }else if (originaData.filetext!=this.data.filetext){
                //保存历史版本
                var data = this.getFiletextText(this.data.filetext);
                var earlyData = this.getFiletextText(originaData.filetext);
                //var data = this.data.filetext;
                //var earlyData = originaData.filetext;
                var dmp = new diff_match_patch();
                var diff_d = dmp.diff_main(earlyData, data);
                dmp.diff_cleanupSemantic(diff_d);
                var patch_list = dmp.patch_make(earlyData, data, diff_d);
                var d = {
                    "patchs": dmp.patch_toText(patch_list),
                    "data": this.data.filetext,
                    "v": "6"
                };
                editionData.data = JSON.stringify(d);
            }else{
                return false;
            }
            o2.Actions.load("x_processplatform_assemble_surface").DocumentVersionAction.create(this.form.businessData.work.id, editionData, function(json){
                //originaData.filetext = this.data.filetext;
                if (callback) callback();
            }.bind(this));
        }
    },
    checkSaveNewHistroy: function(){
        var p = o2.Actions.load("x_processplatform_assemble_surface").DocumentRevisionAction.getLast(this.form.businessData.work.job, this.json.id);
        p.then(function(json){
            if (!json.data || json.data.data!=this.data.filetext){
                var data = {
                    "category": this.json.id,
                    "data":this.data.filetext
                }
                return o2.Actions.load("x_processplatform_assemble_surface").DocumentRevisionAction.create(this.form.businessData.work.id, data);
            }
        }.bind(this));
        return p;
    },

    resetToolbarEvent: function(node){
        if (Browser.ie11){
            if (!this.waitLocation){
                this.waitLocation = window.setTimeout(function(){
                    this.resizeToolbar(node);
                    this.waitLocation = false;
                }.bind(this), 1000);
            }
        }else{
            this.resizeToolbar(node);
        }
    },
    resizeToolbar: function(node){
        if (this.toolbarNode){
            var p = this.toolNode.getPosition(node || this.scrollNode);
            var size = this.toolNode.getSize();
            var pl = this.toolbarNode.getStyle("padding-left").toInt();
            var pr = this.toolbarNode.getStyle("padding-right").toInt();
            var x = size.x-pl-pr;

            //var pNode = this.toolNode.getOffsetParent();

            var paddingTop = (this.isFullScreen) ? 0 : (node || this.form.node).getStyle("padding-top");
            try {
                paddingTop = paddingTop.toInt();
            }catch (e) {
                paddingTop = 0;
            }

            if (p.y<paddingTop && this.toolNode.offsetParent){
                this.toolbarNode.inject(node || this.scrollNode);
                this.toolbarNode.setStyles({
                    "position": "absolute",
                    "width": ""+x+"px",
                    "z-index": 200,
                    "top": paddingTop+"px",
                    "left": ""+p.x+"px"
                });
            }else{
                this.toolbarNode.inject(this.toolNode);
                this.toolbarNode.setStyles({"position": "static", "width": "auto"});
            }
        }
    },
    resizeSidebar: function(){
        if (this.sidebarNode){
            var fileTextNode = this.contentNode.getElement("div.doc_layout_filetext");
            if (fileTextNode){
                this.sidebarNode.position({
                    relativeTo: fileTextNode,
                    position: 'topLeft',
                    edge: 'topRight',
                    offset: {"x": -20, "y": 60}
                });

                var p = fileTextNode.getPosition(this.form.app.content);
                var ptop = fileTextNode.getPosition(this.node);
                //if ((p.y+s.y)<0) this.sidebarNode.setStyle("top", p.y+s.y);

                if (p.y<0){
                    var top = ptop.y-p.y+200;
                    this.sidebarNode.setStyle("top", top);
                }
                // var p = fileTextNode.getPosition();
                // this.sidebarNode.setStyle("top", p.y);
            }
        }
    },
    loadSideToolbar: function(){
        if (this.allowEdit){
            if (this.pages.length){
                var fileTextNode = this.pages[0].getElement("div.doc_layout_filetext");
                if (fileTextNode){
                    this.sidebarNode = new Element("div", {"styles": this.css.doc_sidebar}).inject(this.node);
                    this.resizeSidebar();

                    this.scrollNode = this.sidebarNode.getParentSrcollNode();
                    if (this.scrollNode){
                        this.scrollNode.addEvent("scroll", function(){
                            this.resizeSidebar();
                        }.bind(this));
                    }

                    html = "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/editdoc.png\" title=\""+MWF.xApplication.process.Xform.LP.editdoc+"\" MWFButtonAction=\"_switchReadOrEditInline\" MWFButtonText=\""+MWF.xApplication.process.Xform.LP.editdoc+"\"></span>";

                    this.sidebarNode.set("html", html);

                    MWF.require("MWF.widget.Toolbar", function() {
                        this.sideToolbar = new MWF.widget.Toolbar(this.sidebarNode, {"style": "documentEdit_side"}, this);
                        this.sideToolbar.load();
                    }.bind(this));

                }
            }
        }
    },
    _returnScale: function(){
        this.isScale = false;
        this.scale = 0;
        this.contentNode.setStyles({
            "transform":"scale(1)",
        });

        if (this.pages.length){
            this.pages.each(function(page){
                page.setStyles({
                    "transform":"scale(1)",
                });
            });
        }
        this.node.setStyles({
            "height": "auto"
        });
    },
    _checkScale: function(offset){
        offset = 0;
        if (this.pages.length){
            //var pageSize = this.pages[0].getSize();
            var pageSize_x = this.options.docPageFullWidth
            var contentSize = this.contentNode.getSize();
            var contentWidth = (offset) ? contentSize.x-20-offset : contentSize.x-20;
            if (contentWidth<pageSize_x){
                this.isScale = true;
                var scale = (contentWidth)/pageSize_x;
                this.scale = scale;
                this.zoom();
                this.resetNodeSize();
            }
        }
    },
    zoom: function(scale){
        if (scale) this.scale = scale;

        if (this.zoomSelectAction){
            for (var i=0; i<this.zoomSelectAction.options.length; i++){
                var option = this.zoomSelectAction.options[i];
                if (Math.abs(this.scale-option.value.toFloat())<0.05){
                    option.set("selected", true);
                    break;
                }
            }
        }

        var w = this.node.getSize().x;
        if (this.history && this.history.historyListAreaNode) w = w-this.history.historyListAreaNode.getComputedSize().totalWidth-2;
        w = w/this.scale;
        this.contentNode.setStyles({
            "transform":"scale("+this.scale+")",
            "transform-origin": "0px 0px",
            "overflow": "auto",
            "width": ""+w+"px"
        });

        if (this.filetextEditor && this.filetextEditor.element) {
            this.filetextEditor.element.$.store("scale", this.scale);
        }
    },

    _switchReadOrEdit: function(){
        if (this.editMode){
            this._readFiletext();
            // if (this.allowEdit) {
            //     var button = this.toolbar.childrenButton[0];
            //     button.setText((layout.mobile) ? MWF.xApplication.process.Xform.LP.editdoc_mobile : MWF.xApplication.process.Xform.LP.editdoc);
            //     button.picNode.getElement("img").set("src", "../x_component_process_Xform/$Form/default/icon/editdoc.png");
            //     //this.getFullWidthFlagNode().dispose();
            // }
            this.editMode = false;
        }else{
            this._editFiletext();
            // if (this.allowEdit) {
            //     var button = this.toolbar.childrenButton[0];
            //     button.setText((layout.mobile) ? MWF.xApplication.process.Xform.LP.editdocCompleted_mobile : MWF.xApplication.process.Xform.LP.editdocCompleted);
            //     button.picNode.getElement("img").set("src", "../x_component_process_Xform/$Form/default/icon/editdoc_completed.png");
            //     //this.toolbar.node.inject(this.getFullWidthFlagNode());
            //
            // }
            this.editMode = true;
        }
    },
    _switchReadOrEditInline: function(){
        if (this.editMode){
            this._readFiletext();
            this.editMode = false;
        }else{
            this._editFiletext("inline");
            //if (this.loadFileTextEditFun) this.layout_filetext.removeEvent("click", this.loadFileTextEditFun);
            this.editMode = true;
        }
        //this._switchButtonText();
    },
    // _switchButtonText: function(){
    //     var text = (layout.mobile) ? MWF.xApplication.process.Xform.LP.editdoc_mobile : MWF.xApplication.process.Xform.LP.editdoc;
    //     var img = "editdoc.png";
    //     if (this.editMode){
    //         text = (layout.mobile) ? MWF.xApplication.process.Xform.LP.editdocCompleted_mobile : MWF.xApplication.process.Xform.LP.editdocCompleted;
    //         img = "editdoc_completed.png";
    //     }
    //
    //     if (!layout.mobile && this.sideToolbar && this.sideToolbar.childrenButton[0]) {
    //         var button = this.sideToolbar.childrenButton[0];
    //         button.setText(text);
    //         button.picNode.getElement("img").set("src", "../x_component_process_Xform/$Form/default/icon/"+img);
    //     }
    //     if (this.toolbar && this.toolbar.childrenButton[0]){
    //         button = this.toolbar.childrenButton[0];
    //         button.setText(text);
    //         button.picNode.getElement("img").set("src", "../x_component_process_Xform/$Form/default/icon/"+img);
    //     }
    // },
    editFiletext: function(){
        if (!this.editMode && this.allowEdit){
            this._editFiletext("inline");
            //if (this.loadFileTextEditFun) this.layout_filetext.removeEvent("click", this.loadFileTextEditFun);
            this.editMode = true;
            //this._switchButtonText();
        }
    },
    // getFullWidthFlagNode: function(){
    //     if (!this.fullWidthFlagNode){
    //         this.fullWidthFlagNode = new Element("span", {
    //             "styles": {
    //                 "line-height": "26px",
    //                 "color": "#999999",
    //                 "font-size": "12px"
    //             },
    //             "text": MWF.xApplication.process.Xform.LP.fullWidth
    //         });
    //     }
    //     return this.fullWidthFlagNode;
    // },
    _printDoc: function(e,el){
        e.disable();
        var scale = this.scale;
        this.toWord(function(data, filename){
            if (filename){
                o2.saveAs(data, filename);
            }else{
                if (this.form.businessData.work && !this.form.businessData.work.completedTime){
                    this.form.workAction.getAttachmentStream(data.id, this.form.businessData.work.id);
                }else{
                    this.form.workAction.getWorkcompletedAttachmentStream(data.id, ((this.form.businessData.workCompleted) ? this.form.businessData.workCompleted.id : this.form.businessData.work.id));
                }
            }
            this.scaleTo(scale);
            e.enable();
        }.bind(this), "", null, true);
    },
    _handwrittenApproval: function(){

    },
    _historyDoc: function(){
        debugger;
        this._readFiletext();
        this.editMode = false;

        this.getHistory(function(){
            //this.history.play();
        }.bind(this));
        this.historyMode = true;
    },
    getHistory: function(callback){
        if (this.history){
            this.history.active(function(){
                if (callback) callback();
            });
        }else{
            MWF.xDesktop.requireApp("process.Xform", "widget.DocumentHistory", function(){
                this.history = new MWF.xApplication.process.Xform.widget.DocumentHistory(this);
                this.history.load(function(){
                    if (callback) callback();
                });
            }.bind(this));
        }
    },


    htmlToText: function(html){
        var tmpdiv = new Element("div", {"html": html});
        var text = tmpdiv.get("text");
        tmpdiv.destroy();
        return text;
    },


    _readFiletext: function(){
        //this._returnScale();
        //this.zoom(1);
        var scale = this.scale;
        if (this.filetextEditor) this.filetextEditor.destroy();
        if (this.filetextScrollNode){
            if (this.reLocationFiletextToolbarFun){
                debugger;
                this.filetextScrollNode.removeEvent("scroll", this.reLocationFiletextToolbarFun);
                //this.form.app.removeEvent("resize", this.reLocationFiletextToolbarFun);
                this.reLocationFiletextToolbarFun = null;
            }
            this.filetextScrollNode = null;
        }
        if (this.filetextToolbarNode) this.filetextToolbarNode = null;

        this.layout_filetext.setAttribute('contenteditable', false);
        this.data = this.getData();
        // debugger;
        if (!this.data.filetext){
            //this.data.filetext = this.json.defaultValue.filetext;
            this.layout_filetext.set("html", this.json.defaultValue.filetext);
        }
        //this._checkSplitPage(this.pages[0]);
        this._repage();
        this.scaleTo(scale);
    },
    _editFiletext: function(inline){
        debugger;
        // this._returnScale();
        // this.zoom(1);
        // this._singlePage();
        //this.pages = [];
        //this.contentNode.empty();
        //this._createPage(function(control){
            //this._loadPageLayout(control);

            // var docData = this._getBusinessData();
            // if (!docData) docData = this._getDefaultData();
            if (this.data.filetext == this.json.defaultValue.filetext) this.data.filetext = "　　";
            this.setData(this.data);

            //this._checkScale();
            this.node.setStyles({
                "height":"auto"
            });

        // o2.load("../o2_lib/htmleditor/ckeditor4161/ckeditor.js", function() {
        //     CKEDITOR.disableAutoInline = true;
        //     this.layout_filetext.setAttribute('contenteditable', true);
        //     editor = CKEDITOR.inline(this.layout_filetext);
        //     editor.on("instanceReady", function(e){
        //         e.editor.focus();
        //     }.bind(this));
        // }.bind(this));

        this._createEditor(inline);
        // alert("ok")
        //}.bind(this));
    },
    _createEditor: function(inline, node, data, editorName, callback){
        if (this.allowEdit){
            this.loadCkeditorFiletext(function(e){
                //e.editor.focus();
                // var text = (data || this.data.filetext).replace(/\u3000*/g, "");
                // if (!text){
                //     var range = e.editor.createRange();
                //     range.moveToElementEditEnd(e.editor.editable());
                //
                //     range.select();
                //     range.scrollIntoView();
                // }else{
                //     e.editor.getSelection().scrollIntoView();
                // }
                //e.editor.getSelection().scrollIntoView();

                // var text = (data || this.data.filetext).replace(/\u3000*/g, "");
                // if (!text){
                //     var range = e.editor.createRange();
                //     range.moveToElementEditEnd(e.editor.editable());
                //
                //     range.select();
                //     range.scrollIntoView();
                // }else{
                //     e.editor.getSelection().scrollIntoView();
                // }
                // e.editor.getSelection().scrollIntoView();
                //
                //this.getFiletextToolber();
                //this.filetextToolbarNode.inject(this.layout_filetext.getOffsetParent());

                //this.locationFiletextToolbar(editorName);

                if (callback) callback();
            }.bind(this), inline, node, editorName);
        }
    },
    getFiletextToolber: function(editorName){
        if (editorName){
            if (this[editorName]) {
                if (!this[editorName+"ToolbarNode"]) {
                    // var className = "cke_editor_" + this[editorName].name;
                    // var toolbarNode = $$("." + className)[0];

                    var className = "cke_" + this[editorName].name;
                    var toolbarNode = $(className);

                    this[editorName+"ToolbarNode"] = toolbarNode;
                }
            }
        }else{
            if (this.filetextEditor) {
                if (!this.filetextToolbarNode) {
                    // var className = "cke_editor_" + this.filetextEditor.name;
                    // var filetextToolbarNode = $$("." + className)[0];

                    var className = "cke_" + this.filetextEditor.name;
                    var filetextToolbarNode = $(className);
                    this.filetextToolbarNode = filetextToolbarNode;

                    //filetextToolbarNode.destroy();
                }
            }
        }

    },


    reLocationFiletextToolbarEvent: function(editorName){
        if (Browser.ie11){
            o2.defer(this.reLocationFiletextToolbar, 500, this, [editorName]);
            // if (this.waitLocationFiletext) window.clearTimeout(this.waitLocationFiletext);
            // this.waitLocationFiletext = window.setTimeout(function(){
            //     this.reLocationFiletextToolbar(editorName);
            //     this.waitLocationFiletext = false;
            // }.bind(this), 500);
            // if (!this.waitLocationFiletext){
            //     this.waitLocationFiletext = window.setTimeout(function(){
            //         this.reLocationFiletextToolbar(editorName);
            //         this.waitLocationFiletext = false;
            //     }.bind(this), 1000);
            // }
        }else{
            this.reLocationFiletextToolbar(editorName)
        }
    },

    reLocationFiletextToolbar: function(editorName){
        this.getFiletextToolber(editorName);
        var toolbarNode = (editorName) ? this[editorName+"ToolbarNode"] : this.filetextToolbarNode;
        var editor = (editorName) ? this[editorName] : this.filetextEditor;
        var node = (editorName) ? this.layout_attachmentText : this.layout_filetext;

        debugger;
        //if (editorName)

        if (toolbarNode){
            if (!this.filetextScrollNode){
                var scrollNode = this.contentNode;
                while (scrollNode){
                    if (scrollNode.getStyle("overflow")=="auto" || scrollNode.getStyle("overflow-y")=="auto"){
                        var transform;
                        if (window.getComputedStyle){
                            transform = window.getComputedStyle(this.contentNode).transform;
                        }else{
                            transform = currentStyle.transform
                        }
                        transform = transform.substring(transform.indexOf("(")+1);
                        transform = transform.substring(0, transform.indexOf(")"));
                        var scaleList = transform.split(/,\s*/g);
                        var scaleY = scaleList[3];
                        var scale = (scaleY || 1).toFloat();

                        if ((scrollNode.getScrollSize().y*scale-1)>scrollNode.getSize().y){
                            break;
                        }
                    }
                    scrollNode = scrollNode.getParent();
                }
                this.filetextScrollNode = scrollNode;
            }
            var h = toolbarNode.getSize().y;
            var position = node.getPosition();
            var size = node.getSize();
            var contentSize = this.filetextScrollNode.getSize();

            if (layout.userLayout && layout.userLayout.scale && layout.userLayout.scale!==1){
                var x = editor.editable().$.getPosition().x;
                toolbarNode.setStyle("left", ""+x+"px");
            }
            toolbarNode.setStyle("min-width", "530px");


            if (position.y<0 && size.y+position.y+h<contentSize.y){
                var tp = this.toolbar.node.getPosition();
                var tsy = this.toolbar.node.getSize().y;
                var h = tp.y+tsy;
                toolbarNode.setStyle("top", ""+h+"px");
            }else if (position.y-h<0){
                var tp = this.toolbar.node.getPosition();
                var tsy = this.toolbar.node.getSize().y;
                var h = tp.y+tsy;
                toolbarNode.setStyle("top", ""+h+"px");
            }else{
                var p = node.getPosition().y-h;
                toolbarNode.setStyle("top", "" + p + "px");
            }
        }
    },
    locationFiletextToolbar: function(editorName){
        // this.getFiletextToolber(editorName);
        // var toolbarNode = (editorName) ? this[editorName+"ToolbarNode"] : this.filetextToolbarNode;
        //
        // toolbarNode.inject(this.scrollNode, "bottom");
        // toolbarNode.setStyles({
        //     "position": "absolute",
        //     "top": "40px"
        // });

        this.reLocationFiletextToolbar(editorName);

        var toolbarNode = (editorName) ? this[editorName+"ToolbarNode"] : this.filetextToolbarNode;

        if (toolbarNode) {
            var scrollNode = this.contentNode;
            while (scrollNode){
                if (scrollNode.getStyle("overflow")=="auto" || scrollNode.getStyle("overflow-y")=="auto"){
                    var transform;
                    if (window.getComputedStyle){
                        transform = window.getComputedStyle(this.contentNode).transform;
                    }else{
                        transform = currentStyle.transform
                    }
                    transform = transform.substring(transform.indexOf("(")+1);
                    transform = transform.substring(0, transform.indexOf(")"));
                    var scaleList = transform.split(/,\s*/g);
                    var scaleY = scaleList[3];
                    var scale = (scaleY || 1).toFloat();

                    if ((scrollNode.getScrollSize().y*scale-1)>scrollNode.getSize().y){
                        break;
                    }
                }
                scrollNode = scrollNode.getParent();
            }
            if (scrollNode){
                this.filetextScrollNode = scrollNode
                if (editorName){
                    if (this.reLocationAttachmentTextToolbarFun) this.filetextScrollNode.removeEvent("scroll", this.reLocationAttachmentTextToolbarFun);
                    if (!this.reLocationAttachmentTextToolbarFun) this.reLocationAttachmentTextToolbarFun = function(){
                        this.reLocationFiletextToolbarEvent(editorName);
                    }.bind(this);
                    this.filetextScrollNode.addEvent("scroll", this.reLocationAttachmentTextToolbarFun);
                }else{
                    if (this.reLocationFiletextToolbarFun) this.filetextScrollNode.removeEvent("scroll", this.reLocationFiletextToolbarFun);
                    if (!this.reLocationFiletextToolbarFun) this.reLocationFiletextToolbarFun = this.reLocationFiletextToolbarEvent.bind(this);
                    this.filetextScrollNode.addEvent("scroll", this.reLocationFiletextToolbarFun);
                }
            }
        }
    },

    _isAllowEdit:function(){
        if (this.readonly) return false;
        if (this.json.allowEdit=="n") return false;
        if (this.json.allowEdit=="s"){
            if (this.json.allowEditScript && this.json.allowEditScript.code){
                return !!this.form.Macro.exec(this.json.allowEditScript.code, this);
            }
        }
        return true;
    },
    _isAllowPrint: function(){
        if (this.json.allowPrint=="n") return false;
        if (this.json.allowPrint=="s"){
            if (this.json.allowPrintScript && this.json.allowPrintScript.code){
                return !!this.form.Macro.exec(this.json.allowPrintScript.code, this);
            }
        }
        return true;
    },
    _isAllowHistory: function(){
        if (this.json.allowHistory=="n") return false;
        if (this.json.allowHistory=="s"){
            if (this.json.allowHistoryScript && this.json.allowHistoryScript.code){
                return !!this.form.Macro.exec(this.json.allowHistoryScript.code, this);
            }
        }
        return true;
    },
    _isAllowHandwrittenApproval: function(){
        if (this.json.allowHandwrittenApproval=="n") return false;
        if (this.json.allowHandwrittenApprovalScript=="s"){
            if (this.json.allowHandwrittenApprovalScript && this.json.allowHandwrittenApprovalScript.code){
                return !!this.form.Macro.exec(this.json.allowHandwrittenApprovalScript.code, this);
            }
        }
        return true;
    },

    _getEdit: function(name, typeItem, scriptItem){
        switch (this.json[typeItem]) {
            case "y":
                return true;
            case "n":
                return false;
            case "s":
                if (this.json[scriptItem] && this.json[scriptItem].code){
                    return !!this.form.Macro.exec(this.json[scriptItem].code, this);
                }
                return true;
        }
    },
    loadCkeditorStyle: function(node){
        if (node){
            o2.load("ckeditor", function(){
                //CKEDITOR.disableAutoInline = true;
                node.setAttribute('contenteditable', true);
                var editor = CKEDITOR.inline(this.layout_filetext, this._getEditorConfig());
                this.filetextEditor.on("instanceReady", function(e){
                    if (callback) callback(e);
                }.bind(this));
            }.bind(this));
        }
    },


    _loadToolbars: function(){
        var html ="";
        var editdoc, printdoc, history, handwrittenApproval, fullscreen=MWF.xApplication.process.Xform.LP.fullScreen;

        if (layout.mobile){
            editdoc = MWF.xApplication.process.Xform.LP.editdoc_mobile;
            printdoc = MWF.xApplication.process.Xform.LP.printdoc_mobile;
            history = MWF.xApplication.process.Xform.LP.history_mobile;
            handwrittenApproval = MWF.xApplication.process.Xform.LP.handwrittenApproval_mobile;
        }else{
            editdoc = MWF.xApplication.process.Xform.LP.editdoc;
            printdoc = MWF.xApplication.process.Xform.LP.printdoc;
            history = MWF.xApplication.process.Xform.LP.history;
            handwrittenApproval = MWF.xApplication.process.Xform.LP.handwrittenApproval;
        }
        // if (this.allowEdit){
        //     //html += "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/editdoc.png\" title=\""+MWF.xApplication.process.Xform.LP.editdoc+"\" MWFButtonAction=\"_switchReadOrEdit\" MWFButtonText=\""+MWF.xApplication.process.Xform.LP.editdoc+"\"></span>";
        //     html += "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/editdoc.png\" title=\""+editdoc+"\" MWFButtonAction=\"_switchReadOrEditInline\" MWFButtonText=\""+editdoc+"\"></span>";
        //     //html += "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/headerdoc.png\" title=\""+MWF.xApplication.process.Xform.LP.headerdoc+"\" MWFButtonAction=\"_redheaderDoc\" MWFButtonText=\""+MWF.xApplication.process.Xform.LP.headerdoc+"\"></span>";
        // }
        if (this.allowPrint){
            html += "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/print.png\" title=\""+printdoc+"\" MWFButtonAction=\"_printDoc\" MWFButtonText=\""+printdoc+"\"></span>";
        }
        if (this.allowHistory){
           html += "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/versions.png\" title=\""+history+"\" MWFButtonAction=\"_historyDoc\" MWFButtonText=\""+history+"\"></span>";
        }
        if (this.allowHandwrittenApproval){
            html += "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/versions.png\" title=\""+handwrittenApproval+"\" MWFButtonAction=\"_handwrittenApproval\" MWFButtonText=\""+handwrittenApproval+"\"></span>";
        }
        if (this.json.canFullScreen!=="n"){
            html += "<span MWFnodetype=\"MWFToolBarButton\" MWFButtonImage=\"../x_component_process_Xform/$Form/default/icon/fullscreen.png\" title=\""+fullscreen+"\" MWFButtonAction=\"fullScreen\" MWFButtonText=\""+fullscreen+"\"></span>";
        }

        // if (this.json.fullWidth=="y"){
        //     html += "<span style='line-height: 26px; color: #999999; font-size: 12px'>已启用半角空格自动转换为全角空格，如需输入半角空格，请使用：SHIFT+空格</span>"
        // }
        this.toolbarNode = new Element("div", {"styles": this.css.doc_toolbar_node}).inject(this.toolNode);
        this.toolbarNode.set("html", html);

        MWF.require("MWF.widget.Toolbar", function() {
            this.toolbar = new MWF.widget.Toolbar(this.toolbarNode, {"style": "documentEdit"}, this);
            this.toolbar.load();
        }.bind(this));

        if (!layout.mobile){
            this.scrollNode = this.toolbarNode.getParentSrcollNode();
            if (this.scrollNode){
                this.scrollNode.addEvent("scroll", function(){
                    this.resetToolbarEvent();
                }.bind(this));
            }
        }

        //if (this.json.canDoublePage!=="n" && !layout.mobile){
            this.doublePageAction = new Element("div", {"styles": this.css.doc_toolbar_doublePage, "text": MWF.xApplication.process.Xform.LP.doublePage}).inject(this.toolbarNode);
            this.doublePageAction.addEvent("click", function(){
                if (this.options.pageShow!=="double"){
                    this._doublePage();
                }else{
                    this.options.pageShow="single";
                    this.reload();
                    //this._singlePage();
                }
            }.bind(this));
            if (this.json.canDoublePage==="n" || layout.mobile) this.doublePageAction.hide();
        //}

        this.zoomActionArea =  new Element("div", {"styles": {"float": "right", "margin-right": "10px"}}).inject(this.toolbarNode);
        if (this.json.isScale !== "y") this.zoomActionArea.hide();
        this.zoomAddAction = new Element("div", {
            "styles": {
                "float": "right",
                "margin-top": "3px",
                "height": "20px",
                "width": "20px",
                "text-align": "center",
                "line-height": "20px",
                "border": "1px solid #cccccc",
                "background-color": "#ffffff",
                "margin-left": "5px"
            },
            "text": "+"
        }).inject(this.zoomActionArea);

        this.zoomSelectAction = new Element("select", {
            "styles": {
                "float": "right",
                "margin-top": "3px",
                "height": "20px",
                "width": "60px",
                "text-align": "center",
                "line-height": "20px",
                "border": "1px solid #cccccc",
                "background-color": "#ffffff",
                "margin-left": "5px"
            },
            "text": "100%"
        }).inject(this.zoomActionArea);

        this.zoomSubAction = new Element("div", {
            "styles": {
                "float": "right",
                "margin-top": "3px",
                "height": "20px",
                "width": "20px",
                "text-align": "center",
                "line-height": "20px",
                "border": "1px solid #cccccc",
                "background-color": "#ffffff",
                "margin-left": "5px"
            },
            "text": "-"
        }).inject(this.zoomActionArea);



        // this.zoomSelectAction =  new Element("select", {"styles": {"float": "right"}}).inject(this.toolbarNode);
        var options = "<option value='2'>200%</option> " +
            "<option value='1.95'>195%</option>" +
            "<option value='1.9'>190%</option>" +
            "<option value='1.85'>185%</option>" +
            "<option value='1.8'>180%</option>" +
            "<option value='1.75'>175%</option>" +
            "<option value='1.7'>170%</option>" +
            "<option value='1.65'>165%</option>" +
            "<option value='1.6'>160%</option>" +
            "<option value='1.55'>155%</option>" +
            "<option value='1.5'>150%</option> " +
            "<option value='1.45'>145%</option>" +
            "<option value='1.4'>140%</option>" +
            "<option value='1.35'>135%</option>" +
            "<option value='1.3'>130%</option>" +
            "<option value='1.25'>125%</option>" +
            "<option value='1.2'>120%</option>" +
            "<option value='1.15'>115%</option>" +
            "<option value='1.1'>110%</option>" +
            "<option value='1.05'>105%</option>" +
            "<option value='1' selected>100%</option>" +
            "<option value='0.95'>95%</option>" +
            "<option value='0.90'>90%</option>" +
            "<option value='0.85'>85%</option>" +
            "<option value='0.80'>80%</option>" +
            "<option value='0.75'>75%</option>" +
            "<option value='0.70'>70%</option>" +
            "<option value='0.65'>65%</option>" +
            "<option value='0.6'>60%</option>" +
            "<option value='0.55'>55%</option>" +
            "<option value='0.5'>50%</option>";
        this.zoomSelectAction.set("html", options);
        this.zoomSelectAction.addEvent("change", function(e){
            this.scaleTo(e.target.options[e.target.selectedIndex].value);
            o2.UD.putData("documenteditorScale", {"scale": this.scale});
            this.documenteditorScale = this.scale;
        }.bind(this));

        this.zoomAddAction.addEvent("click", function(){

            var i = (this.scale/0.05).toInt();
            if (i*0.05<this.scale) i++;
            var v = i*0.05;
            //var v = this.zoomSelectAction.options[this.zoomSelectAction.selectedIndex].value.toFloat();
            v = v+0.05;
            if (v<0.5) v = 0.5;
            if (v>2) v = 2;
            this.scaleTo(v);
            o2.UD.putData("documenteditorScale", {"scale": this.scale});
            this.documenteditorScale = this.scale;
        }.bind(this));
        this.zoomSubAction.addEvent("click", function(){
            var i = (this.scale/0.05).toInt();
            if (i*0.05<this.scale) i++;
            var v = i*0.05;
            //var v = this.zoomSelectAction.options[this.zoomSelectAction.selectedIndex].value.toFloat();
            v = v-0.05;
            if (v<0.5) v = 0.5;
            if (v>2) v = 2;
            this.scaleTo(v);
            o2.UD.putData("documenteditorScale", {"scale": this.scale});
            this.documenteditorScale = this.scale;
        }.bind(this));
    },
    fullScreen: function(bt){
        var text = bt.node.get("text");
        var content = this.form.app.content;

        var stopFun = function(e){ e.stopPropagation(); };
        if (text===MWF.xApplication.process.Xform.LP.returnScreen){
            this.form.node.getParent().show();
            this.node.inject(this.positionNode, "before");
            this.positionNode.destroy();

            // var styles = content.retrieve("tmpStyles");
            // content.setStyles({
            //     "position": styles.position,
            //     "overflow": styles.overflow
            // });
            //this.node.setStyles(this.css.returnScreen);
            this.node.setStyle("min-height", "");
            this.fireEvent("returnScreen");
            bt.setText(MWF.xApplication.process.Xform.LP.fullScreen);

            // this.fullScreenScrollNode = this.node.getOffsetParent().getFirst().getParentSrcollNode();
            // if (this.fullScreenScrollNode){
            //     if (this.fullScreenScrollResizeToolbarFun) this.fullScreenScrollNode.removeEvent("scroll", this.fullScreenScrollResizeToolbarFun);
            // }

            //this.node.removeEvent("wheel", stopFun);
            this.isFullScreen = false;
            this.resizeToolbar();
        }else{
            // this.positionNode = new Element("div").inject(this.node, "after");
            // this.node.inject(content, "top");
            // this.form.node.hide();

            this.positionNode = new Element("div").inject(this.node, "after");
            this.node.inject(this.scrollNode, "top");
            this.form.node.getParent().hide();

            // var position = content.getStyle("poaition");
            // var overflow = content.getStyle("overflow");
            // content.store("tmpStyles", {"position": position, "overflow": overflow});
            // content.setStyles({
            //     "position": "relative",
            //     "overflow": "auto"
            // });
            //this.node.setStyles(this.css.fullScreen);
            this.node.setStyle("min-height", "100%");
            this.fireEvent("fullScreen");

            // this.fullScreenScrollNode = this.node.getOffsetParent().getFirst().getParentSrcollNode();
            // if (this.fullScreenScrollNode){
            //     this.fullScreenScrollResizeToolbarFun = function(){this.resizeToolbar(this.fullScreenScrollNode);}.bind(this);
            //     this.fullScreenScrollResizeToolbarFun();
            //     this.fullScreenScrollNode.addEvent("scroll", this.fullScreenScrollResizeToolbarFun);
            // }

            bt.setText(MWF.xApplication.process.Xform.LP.returnScreen);

            this.isFullScreen = true;
            //this.node.addEvent("wheel", stopFun);
            this.resizeToolbar();
        }
        this.reload();
    },
    /**缩放文件内容
     * @param scale{Number} 缩放的比率
     * @example
     * this.form.get("fieldId").scaleTo(0.5);
    */
    scaleTo: function(scale){
        this._returnScale();
        this.scale = scale;
        this.zoom();
        //var w = this.contentNode.getSize().x*this.scale;
        var w = this.contentNode.offsetWidth*this.scale;
        //if (layout.userLayout && layout.userLayout.scale) w = w*layout.userLayout.scale;
        var count = 1;
        var docPageFullWidth = (this.scale) ? this.scale*this.options.docPageFullWidth : this.options.docPageFullWidth;
        //if (layout.userLayout && layout.userLayout.scale) docPageFullWidth = docPageFullWidth*layout.userLayout.scale;
        var pageWidth = count * docPageFullWidth;
        var margin = (w-pageWidth)/(count+1);
        if (this.isScale){
            margin = "10";
        }
        if (this.scale) margin = margin/this.scale;
        if (margin < 10){
            var offset = 10-margin;
            margin = 10;
            this.contentNode.scrollTo(offset, 0);
        }
        this.pages.each(function(page, i){
            page.setStyles({
                "float": "left",
                "margin-left": ""+margin+"px"
            });
        });
        this.resetNodeSize();
    },

    _repage: function(delay){
        if (this.options.pageShow!=="double"){
            this._singlePage();
        }else{
            this._doublePage();
        }
        if (delay){
            if (!this.form.isLoaded){
                this.form.addEvent("afterLoad", this._checkScale.bind(this));
            }else{
                this._checkScale();
            }
        }else{
            this._checkScale();
        }
    },
    _singlePage: function(){
        //if (this.editMode) this._readFiletext();

        var scale = this.singlePageZoom || 1;
        if( this.singlePageZoom && this.singlePageZoom.toInt() != 1 ){
            this.isScale = true;
            this.scale = this.singlePageZoom;
            this.singlePageZoom = null;
        }

        this.zoom(scale);
        this._checkScale();

        var w = this.contentNode.getSize().x;
        var count = 1;
        var docPageFullWidth = (this.scale) ? this.scale*this.options.docPageFullWidth : this.options.docPageFullWidth;
        //var docPageFullWidth = this.options.docPageFullWidt;

        var pageWidth = count * docPageFullWidth;
        var margin = (w-pageWidth)/(count+1);

        if (this.isScale){
            margin = "10";
        }
        if (this.scale) margin = margin/this.scale;
        this.pages.each(function(page, i){
            page.setStyles({
                "float": "left",
                "margin-left": ""+margin+"px"
            });
        });

        this.resetNodeSize();
        // this.pages.each(function(page){
        //     page.setStyle("float", "none");
        // });
        this.resizeSidebar();
        this.options.pageShow="single";
        this.doublePageAction.set("text", MWF.xApplication.process.Xform.LP.doublePage);
    },
    resetNodeSize: function(){
        //var contentSize = this.contentNode.getSize();
        var contentHeight = this.contentNode.offsetHeight;
        var toolbarSize = this.toolNode.getSize();
        contentHeight = contentHeight*(this.scale || 1);
        var h = contentHeight+toolbarSize.y+20;
        //h = h - contentSize.y*(1-this.scale);

        this.node.setStyles({
            "height":""+h+"px"
        });
        this.resizeSidebar();
    },
    createWaitSplitPage: function(){
        this.node.mask({
            "style": {
                "background-color": "#cccccc",
                "opacity": 0.3
            }
        });

        this.waitSplitPageNode = new Element("div", {"styles": this.form.css.waitSplitPageNode, "text": MWF.xApplication.process.Xform.LP.computePage}).inject(this.node);
        this.waitSplitPageNode.position({
            "relativeTo": this.node,
            "position": "topRight",
            "edge": "topRight",
            "offset": {
                "x": -10,
                "y": 45
            }
        });

        //this.form.notice(MWF.xApplication.process.Xform.LP.computePage, "info", this.node);
    },
    clearWaitSplitPage: function(){
        this.node.unmask();
        if (this.waitSplitPageNode) this.waitSplitPageNode.destroy();
        this.waitSplitPageNode = null;
    },

    _doublePage: function(){
        if (this.editMode) this._switchReadOrEditInline();

        if( this.zoomSelectAction ){
            this.singlePageZoom = ( this.zoomSelectAction.options[this.zoomSelectAction.selectedIndex].value ).toFloat();
        }

        this.zoom(1);
        this.createWaitSplitPage();
        window.setTimeout(function(){
            this._checkSplitPage(this.pages[0]);

            this.zoom(1);
            var w = this.contentNode.getSize().x;
            var toPageWidth = (w-100)/2;
            scale = toPageWidth/this.options.docPageFullWidth;
            if (scale<1) this.zoom(scale);

            var docPageFullWidth = (this.scale) ? this.scale*this.options.docPageFullWidth : this.options.docPageFullWidth;
            //var docPageFullWidth = this.options.docPageFullWidth;

            var w = this.contentNode.getSize().x;
            var count = (w/docPageFullWidth).toInt();
            var pages = this.contentNode.getElements(".doc_layout_page");
            count = Math.min(pages.length, count);

            var pageWidth = count * docPageFullWidth;
            var margin = (w-pageWidth)/(count+1);
            if (this.scale) margin = margin/(this.scale);
            this.pages.each(function(page, i){
                page.setStyles({
                    "float": "left",
                    "margin-left": ""+margin+"px"
                });
            });
            // this.pages.each(function(page, i){
            //     if ((i % 2)===0){
            //         page.setStyle("float", "left");
            //     }else{
            //         page.setStyle("float", "right");
            //     }
            // });
            this.resetNodeSize();

            this.options.pageShow="double";
            this.doublePageAction.set("text", MWF.xApplication.process.Xform.LP.singlePage);

            this.resizeSidebar();
            this.clearWaitSplitPage();

            this.pages.forEach(function(page, i){
                var s = i+1;
                var pageNumberNode = new Element("div", {
                    "html": "<span>—</span><span> "+s+" </span><span>—</span>",
                    "styles": {
                        "right": "0",
                        "bottom": "-60px",
                        "margin-top": "10px",
                        "position": "absolute"
                    }
                }).inject(page.getFirst());


            }.bind(this));

        }.bind(this), 1000);
    },
    _getDefaultData: function(){
        return Object.clone(this.json.defaultValue);
        //return Object.clone(MWF.xApplication.process.Xform.LP.documentEditor);
    },

    _loadFiletextPage: function(callback){
        this.data = this._getBusinessData();
        if (!this.data) this.data = this._getDefaultData();
        this._computeData(true);

        this._createPage(function(control){
            this._loadPageLayout(control);
            
            // this.data = this._getBusinessData();
            // if (!this.data) this.data = this._getDefaultData();

            this.setData(this.data);
            // this._checkSplitPage(this.pages[0]);
            //this._repage(true);
            //this.loadCkeditorFiletext();

            if (!this.readonly){
                //if (this.json.allowEditFiletext!==false) this.loadCkeditorFiletext();
                // if (this.json.allowEditRedheader) this.loadCkeditorRedheader();
                // if (this.json.allowEditSubject) this.loadCkeditorSubject();
                // if (this.json.allowEditMainSend) this.loadCkeditorMainSend();
                // if (this.json.allowEditFileNo) this.loadCkeditorFileNo();
                // if (this.json.allowEditSigner) this.loadCkeditorSigner();
                // if (this.json.allowEditAttachment) this.loadCkeditorAttachment();
            }

            if (!this.editMode && this.allowEdit && !this.historyMode){
                this._editFiletext("inline");
                //if (this.loadFileTextEditFun) this.layout_filetext.removeEvent("click", this.loadFileTextEditFun);
                this.editMode = true;
            }


            if (callback) callback();
        }.bind(this));
    },


    _getEditorConfig: function(editorName){
        // var mathElements = [
        //     'math',
        //     'maction',
        //     'maligngroup',
        //     'malignmark',
        //     'menclose',
        //     'merror',
        //     'mfenced',
        //     'mfrac',
        //     'mglyph',
        //     'mi',
        //     'mlabeledtr',
        //     'mlongdiv',
        //     'mmultiscripts',
        //     'mn',
        //     'mo',
        //     'mover',
        //     'mpadded',
        //     'mphantom',
        //     'mroot',
        //     'mrow',
        //     'ms',
        //     'mscarries',
        //     'mscarry',
        //     'msgroup',
        //     'msline',
        //     'mspace',
        //     'msqrt',
        //     'msrow',
        //     'mstack',
        //     'mstyle',
        //     'msub',
        //     'msup',
        //     'msubsup',
        //     'mtable',
        //     'mtd',
        //     'mtext',
        //     'mtr',
        //     'munder',
        //     'munderover',
        //     'semantics',
        //     'annotation',
        //     'annotation-xml'
        // ];

        //CKEDITOR.plugins.addExternal('ckeditor_wiris', 'https://ckeditor.com/docs/ckeditor4/4.13.0/examples/assets/plugins/ckeditor_wiris/', 'plugin.js');

        var editorConfig = {
            qtRows: 20, // Count of rows
            qtColumns: 20, // Count of columns
            qtBorder: '1', // Border of inserted table
            qtWidth: '95%', // Width of inserted table
            qtStyle: { 'border-collapse' : 'collapse' },
            qtClass: 'documenteditor_table'+this.form.json.id+this.json.id, // Class of table
            qtCellPadding: '0', // Cell padding table
            qtCellSpacing: '0', // Cell spacing table
            qtPreviewBorder: '4px double black', // preview table border
            qtPreviewSize: '4px', // Preview table cell size
            qtPreviewBackground: '#c8def4', // preview table background (hover)

            language: o2.language,

            // format_tags: '标题一;标题二;标题三;标题四;正文', // entries is displayed in "Paragraph format"
            format_tags: '标题一;标题二;正文(标题三,四)', // entries is displayed in "Paragraph format"
            'format_标题一': {
                name: '标题一(三号黑体)',
                element: 'div',
                styles: {
                    'font-family': '黑体',
                    'font-size': '16pt'
                }
            },
            'format_标题二': {
                name: '标题二(三号楷体)',
                element: 'div',
                styles: {
                    'font-family': '楷体',
                    'font-size': '16pt'
                }
            },
            // 'format_标题三': {
            //     name: '标题三',
            //     element: 'div',
            //     styles: {
            //         'font-family': '仿宋',
            //         'font-size': '16pt'
            //     }
            // },
            // 'format_标题四': {
            //     name: '标题四',
            //     element: 'div',
            //     styles: {
            //         'font-family': '仿宋',
            //         'font-size': '16pt'
            //     }
            // },
            'format_正文(标题三,四)': {
                name: '正文(标题三,四)',
                element: 'div',
                styles: {
                    'font-family': '仿宋',
                    'font-size': '16pt'
                }
            }


        };
        editorConfig.toolbarGroups = [
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
            { name: 'forms', groups: [ 'forms' ] },
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
            { name: 'links', groups: [ 'links' ] },
            { name: 'insert', groups: [ 'insert' ] },
            { name: 'styles', groups: [ 'styles' ] },
            { name: 'colors', groups: [ 'colors' ] },
            { name: 'tools', groups: [ 'tools' ] },
            { name: 'others', groups: [ 'others' ] },
            { name: 'about', groups: [ 'about' ] }
        ];
        //editorConfig.extraPlugins = "ecnet,colordialog,tableresize,quicktable,mathjax,ckeditor_wiris";
        //editorConfig.extraPlugins = "ecnet,colordialog,quicktable,tableresize,eqneditor";
        //editorConfig.extraPlugins = "tableresize,quicktable";
        editorConfig.extraPlugins = "quicktable,tableresize";

        //editorConfig.mathJaxLib = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
        //editorConfig.removeButtons = 'NumberedList,Source,Save,NewPage,Preview,Print,Templates,Paste,PasteFromWord,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Bold,Italic,Underline,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,BulletedList,Outdent,Indent,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Image,Flash,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,TextColor,BGColor,Maximize,ShowBlocks,About,Styles,Font,FontSize';
        editorConfig.removeButtons = 'EasyImageUpload,ExportPdf,Source,Save,NewPage,Preview,Print,Templates,Paste,PasteFromWord,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Bold,Italic,Underline,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Image,Flash,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,TextColor,BGColor,Maximize,ShowBlocks,About,Styles,Font,FontSize';
        //editorConfig.removeButtons = 'Source,Save,NewPage,Preview,Print,Templates,Paste,PasteFromWord,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Bold,Italic,Underline,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Flash,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,TextColor,BGColor,Maximize,ShowBlocks,About,Styles,Font,FontSize';
        //editorConfig.extraAllowedContent = mathElements.join(' ') + '(*)[*]{*};img[data-mathml,data-custom-editor,role](Wirisformula)';

        editorConfig.pasteFromWordRemoveFontStyles = false;
        editorConfig.pasteFromWordRemoveStyles = false;

        //editorConfig.removeButtons = 'NewPage,Templates,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Bold,Italic,Underline,Strike,Subscript,Superscript,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Image,Flash,HorizontalRule,Smiley,SpecialChar,Iframe,Styles,Font,FontSize,TextColor,BGColor,ShowBlocks,About';
        editorConfig.removePlugins = ['magicline','cloudservices','easyimage', 'exportpdf'];
        editorConfig.enterMode = CKEDITOR.ENTER_DIV;
        editorConfig.pasteFilter = "plain-text";
        // editorConfig.extraPlugins = ['ecnet','mathjax'];
        // editorConfig.removePlugins = ['magicline'];
        // editorConfig.mathJaxLib = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML';
debugger;
        if (this.json.ckeditConfigOptions && this.json.ckeditConfigOptions.code){
            var o = this.form.Macro.exec(this.json.ckeditConfigOptions.code, this);
            if (o) editorConfig = Object.merge(editorConfig, o);
        }

        if (editorName){
            editorConfig.removeButtons = editorConfig.removeButtons.split(/,\s*/).erase("PageBreak").join(",");
            var tags = editorConfig.format_tags.split(/;\s*/);
            if (tags.indexOf("附件标题")==-1){
                editorConfig.format_tags = "附件标题"+((editorConfig.format_tags) ? ";" : "")+editorConfig.format_tags;
            }
            if (tags.indexOf("附件序号")==-1){
                editorConfig.format_tags = "附件序号"+((editorConfig.format_tags) ? ";" : "")+editorConfig.format_tags;
            }
            if (!editorConfig["format_附件序号"]) editorConfig["format_附件序号"] = {
                name: '附件序号',
                element: 'div',
                styles: {
                    'font-family': '黑体',
                    'font-size': '16pt'
                }
            };
            if (!editorConfig["format_附件标题"]) editorConfig["format_附件标题"] = {
                name: '附件标题',
                element: 'div',
                styles: {
                    'font-family': '方正小标宋简体',
                    'font-size': '22pt',
                    'text-align': 'center'
                }
            }
        }

        return editorConfig;
    },

    _checkSplitPage: function(pageNode){
        if (this.layout_edition)  this.layout_edition.setStyles({ "position": "static"});
        var contentNode = pageNode.getFirst();
        if (contentNode.getSize().y>this.options.docPageHeight){
            this._splitPage(pageNode);
        }
        var i = pageNode.get("data-pagecount").toInt();

        if (i && this.pages.length-1>=i){
            this._checkSplitPage(this.pages[i]);
        }
        if (this.layout_edition)  this.layout_edition.setStyles({ "position": "absolute", "bottom": "0px" });
    },

    _splitFiletextNodeOneWord:function(lnode, nextPageNode){
        var text = lnode.textContent;
        var len = text.length;
        var left = text.substring(0, len-1);
        var right = text.substring(len-1, len);
        lnode.textContent = left;
        nextPageNode.textContent = right+nextPageNode.textContent;
        //nextPageNode.appendText(right, "top");
    },
    _splitFiletext: function(node, nextPageNode, nextFiletextNode, pageNode){
        var contentNode = pageNode.getFirst();
        var lnode = node.lastChild;
        if (!lnode){
            if (node.parentNode) node.parentNode.removeChild(node);
            //node.remove();
        }else{
            while (contentNode.getSize().y>this.options.docPageHeight && lnode) {
                var tmpnode = lnode.previousSibling;
                var nodeType = lnode.nodeType;
                if (!nextPageNode) nextPageNode = nextFiletextNode;

                if (nodeType == Node.ELEMENT_NODE) {
                    if (lnode.tagName == "table") {
                        lnode.inject(nextPageNode);
                    } else if (lnode.tagName == "BR") {
                        if (lnode.parentNode) lnode.parentNode.removeChild(lnode);
                    } else {
                        var id = lnode.get("data-pagePart");
                        if (!id){
                            id = (new o2.widget.UUID()).toString();
                            lnode.set("data-pagePart", id);
                        }
                        var tmpNode = nextPageNode.getFirst();
                        if (tmpNode && tmpNode.get("data-pagePart")==id){
                            nextPageNode = tmpNode;
                        }else{
                            nextPageNode = lnode.clone(false).inject(nextPageNode, "top");
                        }
                        //var subnode = lnode.getLast();
                        this._splitFiletext(lnode, nextPageNode, nextFiletextNode, pageNode);
                        if (!lnode.firstChild) if (lnode.parentNode) lnode.parentNode.removeChild(lnode);
                        nextPageNode = nextPageNode.getParent();
                    }
                } else if (nodeType == Node.TEXT_NODE) {
                    var nextPageTextNode = nextPageNode.insertBefore(document.createTextNode(""), nextPageNode.firstChild);
                    while ((contentNode.getSize().y > this.options.docPageHeight) && lnode.textContent) {
                        //console.log(contentNode.getSize().y);
                        this._splitFiletextNodeOneWord(lnode, nextPageTextNode)
                    }
                    if (!lnode.textContent) if (lnode.parentNode) lnode.parentNode.removeChild(lnode); //lnode.remove();
                } else {
                    //lnode.remove();
                    if (lnode.parentNode) lnode.parentNode.removeChild(lnode);
                }

                lnode = tmpnode;
            }
            if (!node.lastChild) if (node.parentNode) node.parentNode.removeChild(node); //node.remove();
        }
        //this._checkSplitPage(pageNode);
    },

    _splitPage: function(pageNode){
        var contentNode = pageNode.getFirst();
        var blockNodes = pageNode.getElements(".doc_block");
        if (blockNodes.length){
            var blockNode = blockNodes[blockNodes.length-1];
            var idx = this.pages.indexOf(pageNode);
            if (this.pages.length<=idx+1) this._createNewPage();
            var nextPage = this.pages[idx+1];
            if (blockNode.hasClass("doc_layout_filetext")){

                var filetextNode = nextPage.getElement(".doc_layout_filetext");
                if (!filetextNode){
                    filetextNode = new Element("div.doc_layout_filetext").inject(nextPage.getFirst(), "top");
                    //filetextNode.setAttribute('contenteditable', true);
                }
                if (!filetextNode.hasClass("doc_block"))filetextNode.addClass("doc_block");
                //var nextEditor = filetextNode.retrieve("editor");

                var node = blockNode;

                var nextPageNode = filetextNode;
                this._splitFiletext(node, nextPageNode, filetextNode, pageNode);

            }else{
                blockNode.inject(nextPage.getFirst(), "top");
                //var contentNode = pageNode.getFirst();
                if (contentNode.getSize().y>this.options.docPageHeight){
                    this._splitPage(pageNode);
                }
            }
        }
    },

    transWidth: function(node){
        if (!node) return '';
        while (node){
            if (node.nodeType==3){
                node.nodeValue = node.nodeValue.replace(/\x20/g, "　");
            }else if (node.nodeType==8){
                //nothing
            }else{
                this.transWidth(node.firstChild);
            }
            node = node.nextSibling;
        }
    },
    insertFullWidth: function(node, txt){
        if (!node) return '';
        while (node){
            if (node.nodeType==3){
                node.nodeValue = txt+node.nodeValue;
                return true;
            }else if (node.nodeType==8){
                //nothing
            }else{
                var flag = this.insertFullWidth(node.firstChild, txt);
                if (flag) return true;
            }
            node = node.nextSibling;
        }
    },

    loadCkeditorFiletext: function(callback, inline, node, editorName){
        if (node || this.layout_filetext){
            o2.load("../o2_lib/htmleditor/ckeditor4161/ckeditor.js", function(){
                CKEDITOR.disableAutoInline = true;
                (node || this.layout_filetext).setAttribute('contenteditable', true);

                if (inline){
                    editor = CKEDITOR.inline(node || this.layout_filetext, this._getEditorConfig(editorName));
                }else{
                    editor = CKEDITOR.replace(node || this.layout_filetext, this._getEditorConfig(editorName));
                }
                this[(editorName || "filetextEditor")] = editor;

                editor.on("instanceReady", function(e){
                    var　v = e.editor.editable().$.get("text");
                    if (!v || v=="　　") e.editor.setData(this.json.defaultValue.filetext);
                    if (callback) callback(e);
                }.bind(this));

                editor.on( 'focus', function( e ) {
                    window.setTimeout(function(){
                        // this.reLocationFiletextToolbar(editorName);
                        this.locationFiletextToolbar(editorName);
                    }.bind(this), 10);
                    var　v = e.editor.editable().$.get("text");
                    if (!v || v==this.json.defaultValue.filetext){
                        e.editor.setData("　　");
                        e.editor.focus();
                        var range = e.editor.createRange();
                        range.moveToElementEditEnd(e.editor.editable());
                        range.select();
                    }
                }.bind(this) );

                editor.on( 'blur', function( e ) {
                    if (!!editorName) this.getAttachmentTextData();
                    var　v = e.editor.editable().$.get("text");
                    if (!v || v=="　　") e.editor.setData(this.json.defaultValue.filetext);
                }.bind(this) );

                editor.on( 'loaded', function( e ) {
                    editor.element.$.store("module", this);
                    editor.element.$.store("scale", this.scale);
                }.bind(this) );

                editor.on( 'afterPaste', function( e ) {

                }.bind(this));
                editor.on( 'afterPasteFromWord', function( e ) {

                }.bind(this));

                editor.on( 'paste', function( e ) {
                    var html = e.data.dataValue;
                    //if (this.json.fullWidth=="y") html = html.replace(/\x20/g, "　");
                    var rexbr = /\<br\>|\<br \/\>|\<br\/\>/g;
                    var rexp = /\<p\>/g;
                    if (rexbr.test(html) && !rexp.test(html)){
                        var ps = html.split(/\<br\>|\<br \/\>|\<br\/\>/g);
                        html = "";
                        ps.each(function(p){
                            html = html + "<p>"+p+"</p>";
                        });
                    }

                    var tmp = new Element("div")
                    tmp.set("html", html);

                    var pList = tmp.getElements("p");
                    pList.each(function(p, i){
                        //if (Browser.name=="ie"){
                        if (this.json.fullWidth!=="n") this.transWidth(p);
                        if (!p.getParent("table")){
                            var text = p.get("text");
                            var rex = /^\u3000*/;
                            var m = text.match(rex);
                            var l = (m[0]) ? Math.max((2-m[0].length), 0): 2;
                            var txt = "";
                            // for (var i=0; i<l; i++) txt+="　";
                            // this.insertFullWidth(p.getFirst(), txt);
                            for (var i=0; i<l; i++) p.appendText("　","top");
                        }
                        //}else{
                        //    var textIndent = p.getStyle("text-indent");
                        //    if (textIndent.toInt()) p.appendText("　　","top");
                        //}
                    }.bind(this));

                    var tableList = tmp.getElements("table");
                    if (tableList && tableList.length){
                        var w = (node || this.layout_filetext).offsetWidth.toFloat()-2;
                        tableList.each(function(table){
                            var twstyle = table.getStyle("width");
                            var tws = (twstyle) ? (twstyle.toFloat() || 0) : 0;
                            var twatt = table.get("width");
                            var twa = (twatt) ? (twatt.toFloat() || 0) : 0;
                            var tw = Math.max(tws, twa);
                            if (tw===0 || tw>w){
                                table.setStyle("width", ""+w+"px");
                            }
                        });
                        tableList.setStyles({
                            "margin-left": "",
                            "margin-right": "",
                            "word-break": "break-all"
                        });
                    }
                    var tdList = tmp.getElements("td");
                    tdList.each(function(td){
                        var tbw_top = td.getStyle("border-top-width").toFloat() || 0;
                        var tbw_bottom = td.getStyle("border-bottom-width").toFloat() || 0;
                        var tbw_left = td.getStyle("border-left-width").toFloat() || 0;
                        var tbw_right = td.getStyle("border-right-width").toFloat() || 0;

                        td.setStyles({
                            "border-top-width": (tbw_top/2)+"px",
                            "border-bottom-width": (tbw_bottom/2)+"px",
                            "border-left-width": (tbw_left/2)+"px",
                            "border-right-width": (tbw_right/2)+"px",
                        });
                    });

                    e.data.dataValue = tmp.get("html");
                    tmp.destroy();
                    this.fireEvent("paste");
                }.bind(this) );

                editor.on( 'afterPaste', function( e ) {
                    this.resetNodeSize();
                    this.fireEvent("afterPaste");
                }.bind(this) );

                editor.on( 'change', function( e ) {
                    var h = document.documentElement.scrollTop;
                    var scrollNode = this.contentNode;
                    while (scrollNode && (scrollNode.getScrollSize().y<=scrollNode.getSize().y || (scrollNode.getStyle("overflow")!=="auto" &&  scrollNode.getStyle("4-y")!=="auto"))){
                        scrollNode = scrollNode.getParent();
                    }
                    if (scrollNode){
                        var top = scrollNode.scrollTop.toFloat();
                        scrollNode.scrollTop = h+top;
                    }
                    document.documentElement.scrollTop = 0;
                    if (!!editorName) this.getAttachmentTextData();

                    o2.defer(this.resetNodeSize, 500, this);
                }.bind(this) );



                editor.on( 'insertElement', function( e ) {
                    if (e.data.$.tagName.toString().toLowerCase()=="table"){
                        e.data.$.setStyles({
                            "margin-left": "",
                            "margin-right": "",
                            "word-break": "break-all"
                        });
                    }

                    var tr = e.data.$.getElement("tr");
                    if (tr){
                        var tds = tr.getElements("td");
                        if (tds && tds.length){
                            var p = 100/tds.length;
                            tds.setStyle("width", ""+p+"%");
                        }
                    }
                }.bind(this) );

                if (this.json.textIndent!=="n"){
                    (node || this.layout_filetext).addEvent("keyup", function(ev){
                        if (ev.code==13) editor.insertText("　　");
                    }.bind(this));
                }
                if (this.json.fullWidth!=="n"){
                    editor.addCommand( 'insertHalfSpace', {
                        exec: function( editor ) {
                            editor.insertText(" ");
                        }
                    } );
                    editor.setKeystroke( CKEDITOR.SHIFT + 32, 'insertHalfSpace' );

                    editor.on("key", function(e){
                        if (this.json.fullWidth!=="n") if (e.data.keyCode==32){
                            e.editor.insertText("　");
                            e.cancel();
                        }
                    }.bind(this));
                }


            }.bind(this));
        }
    },
    _loadEvents: function(editorConfig){
        Object.each(this.json.events, function(e, key){
            if (e.code){
                this.editor.on(key, function(event){
                    return this.form.Macro.fire(e.code, this, event);
                }.bind(this), this);
            }
        }.bind(this));

    },

    _bindFieldChange: function(name,dataItem, dom){
        var field = this.form.all[this.json[dataItem]];
        if (field){
            var bindFun = function(){
                this._computeItemFieldData(name, dataItem);
                //if (this.data[name]){
                if (this[dom]){
                            if (dom=="layout_redHeader" ||dom=="layout_issuanceUnit" || dom=="layout_meetingAttendContent" || dom=="layout_meetingLeaveContent" || dom=="layout_meetingSitContent" || dom=="layout_meetingRecordContent" || dom=="layout_signer") {
                                this[dom].set("html", this.filterHtml(this.data[name] || ""));
                            }else if (dom=="layout_subject"){
                                this[dom].set("html", (this.data[name] || ""));
                            }else if (dom=="layout_attachment"){
                                this.setAttachmentData();
                            }else if (dom=="layout_annotation"){
                                var annotation = this.data[name];
                                if (annotation){
                                    if (annotation.substring(0, 1)!=="（") annotation = "（"+annotation;
                                    if (annotation.substring(annotation.length-1, annotation.length)!=="）") annotation = annotation+"）";
                                    this[dom].set("text", annotation);
                                }else{
                                    this[dom].set("text", "");
                                }
                            }else{
                                this[dom].set("text", this.data[name]|| "");
                    }
                }

                this.reSetShow();
                //}
            }.bind(this);
            field.node.store(this.json.id+"bindFun", bindFun);
            field.addModuleEvent("change", bindFun);
        }
    },
    _computeItemFieldData: function(name, dataItem, dataItemNode){
        var v = "";
        var module = (dataItemNode) ? this.form.all[dataItemNode] : this.form.all[this.json[dataItem]];
        if (module && module.getData) v = module.getData();
        if (!v) v = (dataItemNode) ? this.form.businessData.data[dataItemNode] : this.form.businessData.data[this.json[dataItem]];

        if (v){
            var t = o2.typeOf(v);
            switch (t) {
                case "string":
                    switch (name) {
                        case "issuanceDate":
                        case "editionDate":
                            var d = new Date(v);

                            if (d.isValid() && d.getFullYear()!=1970){
                                var y = d.getFullYear();
                                var m = d.getMonth();
                                var day = d.getDate();
                                m = m +1;
                                var lp = MWF.xApplication.process.Xform.LP;
                                this.data[name] = ""+y+lp.year+m+lp.month+day+lp.date;
                            }else{
                                this.data[name] = v;
                            }
                            //this.data[name] = (new Date(v).isValid()) ? Date.parse(v).format("％Y年％m月％d％日") : v;
                            break;
                        case "mainSend":
                            this.data[name] = v + "：";
                            break;
                        case "copyto":
                        case "copyto2":
                            var flag = (v.substring(v.length-1, v.length)=="。");
                            this.data[name] = v + ((flag) ? "" : "。");
                            break;
                        default:
                            if (name==="subject") v = o2.txt(v);
                            this.data[name] = v;
                    }
                    break;
                case "array":
                    var strs = [];
                    var strLength = 0;
                    v.each(function(value){
                        if (o2.typeOf(value)=="object" && value.distinguishedName){
                            if (value.name.length>strLength) strLength = value.name.length;
                            strs.push(value.name);
                        }else{
                            if (value.length>strLength) strLength = value.length;
                            strs.push(value.toString());
                        }
                    });
                    //if (strs.length){
                    switch (name) {
                        case "attachment":
                            // this.data[name] = strs.map(function(n, i){ var j = i+1; return j+"、"+n}).join("<br>");
                            var atts = strs.map(function(a){
                                return (a.indexOf(".")!=-1) ? a.substring(0, a.lastIndexOf(".")) : a;
                            });
                            this.data[name] = atts;
                            break;
                        case "issuanceDate":
                        case "editionDate":
                            var tmpStrs = strs.map(function(n, i){
                                var d = Date.parse(n);
                                if (d.isValid() && d.getFullYear()!=1970){
                                    var y = d.getFullYear();
                                    var m = d.getMonth();
                                    var day = d.getDate();
                                    m = m +1;
                                    var lp = MWF.xApplication.process.Xform.LP;
                                    return ""+y+lp.year+m+lp.month+day+lp.date;
                                }else{
                                    return n;
                                }
                                //return () ? d.format("%Y年%m月%d日") : n;
                            });
                            this.data[name] = tmpStrs.join("，");
                            break;
                        case "signer":
                            var signers = "";
                            strs.each(function(name, i){
                                while (name.length<strLength){ name = name+"　";}
                                //signers.push(name);
                                if (i % 2==0){
                                    signers = signers+name+"　";
                                }else{
                                    signers = signers+name+"<br>";
                                }
                            });

                            this.data[name] = signers;
                            break;
                        case "mainSend":
                            this.data[name] = strs.join("，") + "：";
                            break;
                        case "copyto":
                        case "copyto2":
                            this.data[name] = strs.join("，") + "。";
                            break;
                        default:
                            this.data[name] = strs.join("，");
                    }
                    //}
                    break;
                default:
                    this.data[name] = v.toString();
            }
        }else{
            this.data[name] = this.json.defaultValue[name];
        }
    },
    computeData: function(){
        this._computeData(false);
        this.setData(this.data);
    },
    _computeItemData: function(name, typeItem, dataItem, scriptItem, ev, dom){
        switch (this.json[typeItem]) {
            case "data":
                if (this.json[dataItem]){
                    if (ev) this._bindFieldChange(name, dataItem, dom);
                    this._computeItemFieldData(name, dataItem);
                }
                break;
            case "script":
                if (this.json[scriptItem] && this.json[scriptItem].code){
                    var v = this.form.Macro.exec(this.json[scriptItem].code, this);
                    this.data[name] = v;
                    if (name=="attachment"){
                        //this.data[name] = (typeOf(v)=="array") ? v.map(function(n, i){ var j = i+1; return j+"、"+n}).join("<br>") : v;
                        this.data[name] = (typeOf(v)=="array") ? v : [v];
                    }
                    if (name=="signer"){
                        var strs = [];
                        var strLength = 0;
                        if (o2.typeOf(v)!=="array") v = [v];
                        v.each(function(value){
                            if (o2.typeOf(value)=="object" && value.distinguishedName){
                                if (value.name.length>strLength) strLength = value.name.length;
                                strs.push(value.name);
                            }else{
                                if (value.length>strLength) strLength = value.length;
                                strs.push(value.toString());
                            }
                        });
                        var signers = "";
                        strs.each(function(name, i){
                            while (name.length<strLength){ name = name+"　";}
                            //signers.push(name);
                            if (i % 2==0){
                                signers = signers+name+"　";
                            }else{
                                signers = signers+name+"<br>";
                            }
                        });

                        this.data[name] = signers;
                    }
                    if (name=="issuanceDate" || name=="editionDate"){
                        var d = Date.parse(v);
                        if (d.isValid() && d.getFullYear()!=1970){
                            var y = d.getFullYear();
                            var m = d.getMonth();
                            var day = d.getDate();
                            m = m +1;
                            var lp = MWF.xApplication.process.Xform.LP;
                            this.data[name] = ""+y+lp.year+m+lp.month+day+lp.date;
                        }else{
                            this.data[name] = v;
                        }
                        //this.data[name] = (d.isValid() && d.getFullYear()!=1970) ? d.format("%Y年%m月%d日") : v;
                    }
                }
                break;
        }
    },

    _computeCustomItemData: function(name, field, ev){
        //if (this.json.customFields[l.name]){
            if (ev) this._bindCustomFieldChange(name, field, name);
            this._computeItemFieldData(name, null, field);
        //}
    },
    _bindCustomFieldChange: function(name, dataItem, dom){
        var field = this.form.all[dataItem];
        if (field){
            var bindFun = function(){
                this._computeItemFieldData(name, null, dataItem);
                //if (this.data[name]){
                if (this[dom]){

                    var value = this.data[name] || "";
                    var reg = new RegExp("\n","g");
                    var text = value.replace(reg,"<br/>");

                    if (dom=="layout_redHeader" || dom=="layout_issuanceUnit") {
                        this[dom].set("html", this.data[name] || "");
                    }else if (dom=="layout_subject"){
                        this[dom].set("html", (this.data[name] || ""));
                    }else if (dom=="layout_attachment"){
                        this.setAttachmentData();
                    }else{
                        this[dom].set("html", text|| "");
                    }
                }

                this.reSetShow();
                //}
            }.bind(this);
            field.node.store(this.json.id+"bindFun", bindFun);
            field.addModuleEvent("change", bindFun);
        }
    },

    _computeData: function(ev){
        this._computeItemData("copies", "copiesValueType", "copiesValueData", "copiesValueScript", ev, "layout_copies");
        this._computeItemData("secret", "secretValueType", "secretValueData", "secretValueScript", ev, "layout_secret");
        this._computeItemData("priority", "priorityValueType", "priorityValueData", "priorityValueScript", ev, "layout_priority");
        this._computeItemData("redHeader", "redHeaderValueType", "redHeaderValueData", "redHeaderValueScript", ev, "layout_redHeader");
        this._computeItemData("fileno", "filenoValueType", "filenoValueData", "filenoValueScript", ev, "layout_fileno");
        this._computeItemData("signer", "signerValueType", "signerValueData", "signerValueScript", ev, "layout_signer");
        this._computeItemData("subject", "subjectValueType", "subjectValueData", "subjectValueScript", ev, "layout_subject");
        this._computeItemData("mainSend", "mainSendValueType", "mainSendValueData", "mainSendValueScript", ev, "layout_mainSend");
        this._computeItemData("attachment", "attachmentValueType", "attachmentValueData", "attachmentValueScript", ev, "layout_attachment");
        this._computeItemData("issuanceUnit", "issuanceUnitValueType", "issuanceUnitValueData", "issuanceUnitValueScript", ev, "layout_issuanceUnit");
        this._computeItemData("issuanceDate", "issuanceDateValueType", "issuanceDateValueData", "issuanceDateValueScript", ev, "layout_issuanceDate");
        this._computeItemData("annotation", "annotationValueType", "annotationValueData", "annotationValueScript", ev, "layout_annotation");
        this._computeItemData("copyto", "copytoValueType", "copytoValueData", "copytoValueScript", ev, "layout_copytoContent");
        this._computeItemData("copyto2", "copyto2ValueType", "copyto2ValueData", "copyto2ValueScript", ev, "layout_copyto2Content");
        this._computeItemData("editionUnit", "editionUnitValueType", "editionUnitValueData", "editionUnitValueScript", ev, "layout_edition_issuance_unit");
        this._computeItemData("editionDate", "editionDateValueType", "editionDateValueData", "editionDateValueScript", ev, "layout_edition_issuance_date");

        this._computeItemData("meetingAttend", "meetingAttendValueType", "meetingAttendValueData", "meetingAttendValueScript", ev, "layout_meetingAttendContent");
        this._computeItemData("meetingLeave", "meetingLeaveValueType", "meetingLeaveValueData", "meetingLeaveValueScript", ev, "layout_meetingLeaveContent");
        this._computeItemData("meetingSit", "meetingSitValueType", "meetingSitValueData", "meetingSitValueScript", ev, "layout_meetingSitContent");
        this._computeItemData("meetingRecord", "meetingRecordValueType", "meetingRecordValueData", "meetingRecordValueScript", ev, "layout_meetingRecordContent");

        Object.each(this.json.customFields, function(field, k){
            this._computeCustomItemData(k, field,  ev);
        }.bind(this));

        // if (this.customLayouts){
        //     this.customLayouts.each(function(l){
        //         this._computeCustomItemData(l,  ev);
        //     }.bind(this))
        // }

    },

    _loadValue: function(){
        var data = this._getBusinessData();
    },

    /**重新计算公文编辑器的所有字段，当字段是脚本时可以使用该方法立即更新
     * @summary 重新计算公文编辑器的所有字段
     * @example
     * this.form.get("fieldId").reload();
     */
    reload: function(){
        this.resetData();
    },
    resetData: function(diffFiletext){
        if (this.editMode){ this._switchReadOrEditInline(); }

        this._computeData(false);

        this.pages = [];
        this.contentNode.empty();
        // if (this.allowEdit) this.toolbar.childrenButton[0].setText((layout.mobile) ? MWF.xApplication.process.Xform.LP.editdoc_mobile : MWF.xApplication.process.Xform.LP.editdoc);
        this.editMode = false;

        this._createPage(function(control){
            this._loadPageLayout(control);

            this.setData(this.data, diffFiletext);
            //this._checkSplitPage(this.pages[0]);

            this._repage();

            if (!this.editMode && this.allowEdit && !this.historyMode) {
                this._editFiletext("inline");
                //if (this.loadFileTextEditFun) this.layout_filetext.removeEvent("click", this.loadFileTextEditFun);
                this.editMode = true;
            }
        }.bind(this));
    },
    /**
     * @summary 判断公文编辑器的正文内容是否已经填写
     * @return {Boolean} 是否为空
     * @example
     * if( this.form.get("fieldId").isEmpty() ){
     *     this.form.notice('请填写正文内容')
     * }
     */
    isEmpty: function(){
        var data = this.getData();
        if( typeOf(data) !== "object" )return true;
        return !data.filetext || data.filetext===this.json.defaultValue.filetext;
    },
    /**
    * @summary 获取公文编辑器数据
     * @return {Object} 公文编辑器的数据
     * @example
     * var data = this.form.get("fieldId").getData();
    */
    getData: function(){
        //if (this.editMode){
        if (this.layout_copies) this.data.copies = this.layout_copies.get("text");
        if (this.layout_secret) this.data.secret = this.layout_secret.get("text");
        if (this.layout_priority) this.data.priority = this.layout_priority.get("text");
        if (this.layout_redHeader) this.data.redHeader = this.layout_redHeader.get("html");
        if (this.layout_fileno) this.data.fileno = this.layout_fileno.get("text");
        if (this.layout_signerTitle) this.data.signerTitle = this.layout_signerTitle.get("text");
        if (this.layout_signer) this.data.signer = this.layout_signer.get("html");
        if (this.layout_subject) this.data.subject = this.layout_subject.get("html");
        if (this.layout_mainSend) this.data.mainSend = this.layout_mainSend.get("text");
        if (this.editMode) {
            if (this.layout_filetext){
                var text = this.layout_filetext.get("text");
                text = text.replace(/\u3000*/g, "");
                if (text && text !==this.json.defaultValue.filetext){
                    this.data.filetext = this.layout_filetext.get("html");
                }else{
                    this.data.filetext = "";
                }
            }
        }
        this.getAttachmentTextData();

        if (this.layout_signer) this.data.signer = this.layout_signer.get("html");
        if (this.layout_attachmentTitle) this.data.attachmentTitle = this.layout_attachmentTitle.get("text");
        if (this.layout_attachment){
            this._computeItemData("attachment", "attachmentValueType", "attachmentValueData", "attachmentValueScript", false, "layout_attachment");
            // var atts = [];
            // var nodes = this.layout_attachment.getElements(".doc_layout_attachment_content_name");
            // if (nodes.length){
            //     nodes.each(function(node){
            //         atts.push(node.get("text"));
            //     });
            // }
            // this.data.attachment = atts;
        }
        if (this.layout_issuanceUnit) this.data.issuanceUnit = this.layout_issuanceUnit.get("html");
        if (this.layout_issuanceDate) this.data.issuanceDate = this.layout_issuanceDate.get("text");
        if (this.layout_annotation){
            var annotation = this.layout_annotation.get("text");
            if (annotation.substring(0,1)=="（") annotation = annotation.substring(1, annotation.length);
            if (annotation.substring(annotation.length-1, annotation.length)=="）") annotation = annotation.substring(0, annotation.length-1);
            this.data.annotation = annotation;
        }
        if (this.layout_copytoTitle) this.data.copytoTitle = this.layout_copytoTitle.get("text");
        if (this.layout_copytoContent) this.data.copyto = this.layout_copytoContent.get("text");
        if (this.layout_copyto2Title) this.data.copyto2Title = this.layout_copyto2Title.get("text");
        if (this.layout_copyto2Content) this.data.copyto2 = this.layout_copyto2Content.get("text");
        if (this.layout_edition_issuance_unit) this.data.editionUnit = this.layout_edition_issuance_unit.get("text");
        if (this.layout_edition_issuance_date) this.data.editionDate = this.layout_edition_issuance_date.get("text");

        if (this.layout_meetingAttendTitle) this.data.meetingAttendTitle = this.layout_meetingAttendTitle.get("text");
        if (this.layout_meetingLeaveTitle) this.data.meetingLeaveTitle = this.layout_meetingLeaveTitle.get("text");
        if (this.layout_meetingSitTitle) this.data.meetingSitTitle = this.layout_meetingSitTitle.get("text");

        if (this.layout_meetingAttendContent) this.data.meetingAttend = this.layout_meetingAttendContent.get("html");
        if (this.layout_meetingLeaveContent) this.data.meetingLeave = this.layout_meetingLeaveContent.get("html");
        if (this.layout_meetingSitContent) this.data.meetingSit = this.layout_meetingSitContent.get("html");
        if (this.layout_meetingRecordContent) this.data.meetingRecord = this.layout_meetingRecordContent.get("html");

        this.getSealData();

        if (this.customLayouts){
            this.customLayouts.each(function(l){
                this.data[l.name] = l.node.get("html");
            }.bind(this))
        }

        //}
        return this.data;
    },
    getAttachmentTextData: function(){
        if (this.layout_attachmentText && this.layout_attachmentText.get("contenteditable")=="true"){
            var text = this.layout_attachmentText.get("text");
            text = text.replace(/\u3000*/g, "");
            if (text && text !==MWF.xApplication.process.Xform.LP.documentEditor.attachmentInfor){
                this.data.attachmentText = this.layout_attachmentText.get("html");
            }else{
                this.data.attachmentText = "";
            }
        }
    },
    getSealData: function(){
        if (this.layout_seals && this.layout_seals.length) {
            this.data.seals = [];
            this.layout_seals.each(function(seal){
                this.data.seals.push(seal.get("src"));
            }.bind(this));
        }
    },
    setAttachmentData: function(){
        if (!this.attachmentTemplete){
            this.attachmentTemplete = this.layout_attachment.get("html");
        }
        this.layout_attachment.empty();
        if (this.data.attachment && !this.data.attachment.each){
            this.data.attachment = this.data.attachment.split(/,\s*/g);
        }


        if (this.data.attachment && this.data.attachment.length && this.data.attachment.each){
            //var tmpdiv = new Element("div", {"styles": {"display":"none"}}).inject(document.body);
            var tmpdiv = new Element("div");
            this.data.attachment.each(function(name, idx){
                tmpdiv.set("html", this.attachmentTemplete);
                var serialNode = tmpdiv.getElement(".doc_layout_attachment_content_serial");
                var nameNode = tmpdiv.getElement(".doc_layout_attachment_content_name");
                if (this.data.attachment.length>1){
                    if (serialNode){
                        serialNode.set("text", idx+1);
                        serialNode.getNext().set("text", ".");
                    }
                }else{
                    if (serialNode){
                        serialNode.set("text", "");
                        serialNode.getNext().set("text", "");
                    }
                }
                if (nameNode) nameNode.set("text", name);
                var html = tmpdiv.get("html");
                tmpdiv.empty();
                this.layout_attachment.appendHTML(html);
            }.bind(this));
            tmpdiv.destroy();
        }
    },
    setAttachmentText: function(data){
        this.layout_attachmentText.empty();
        if (data.attachmentText){
            this.layout_attachmentText.set("html", data.attachmentText);
        }else{
            if (this._getEdit("attachmentText", "attachmentTextEdit", "attachmentTextEditScript")){
                this.layout_attachmentText.set("text", MWF.xApplication.process.Xform.LP.documentEditor.attachmentInfor);
            }
        }
    },

    filterHtml: function(html){
        var content = html.replace(/(?:<script[\s\S]*?)(?:(?:<\/script>)|(?:\/>))/gmi, "");
        // content = content.replace(/(?<=[\"\'])javascript\:(?=.*")/gmi, "");
        //content = content.replace(/(?<=\s)on\w*|src|href(?=\=[\"\'])/gmi, function(match){
        content = content.replace(/\son\w*|src|href(?=\=[\"\'])/gmi, function(match){
            return "data-"+match;
        });
        return content;
    },

    /**设置公文编辑器数据
     * @param {Object} data
     * @example
     * var data = this.form.get("fieldId").getData();
     * data.filetext = "测试内容";
     * this.form.get("fieldId").setData(data);
    */
    setData: function(data, diffFiletext){
        if (data){
            this.data = data;
            // this.data["$json"] = this.json;
            this._setBusinessData(data);
            if (this.layout_copies){
                if (data.copies){
                    this.layout_copies.set("text", data.copies || " ");
                }else{
                    this.layout_copies.set("html", "<span>&nbsp</span>");
                }
            }
            if (this.layout_secret){
                if (data.secret){
                    this.layout_secret.set("text", data.secret || " ");
                }else{
                    this.layout_secret.set("html", "<span>&nbsp</span>");
                }
            }
            if (this.layout_priority){
                if (data.priority){
                    this.layout_priority.set("text", data.priority || " ");
                }else{
                    this.layout_priority.set("html", "<span>&nbsp</span>");
                }
            }


            if (this.layout_redHeader) this.layout_redHeader.set("html", data.redHeader || "");
            if (this.layout_fileno) this.layout_fileno.set("text", data.fileno || " ");
            if (this.layout_signerTitle) this.layout_signerTitle.set("text", data.signerTitle || " ");
            if (this.layout_signer) this.layout_signer.set("html", data.signer || " ");
            if (this.layout_subject) this.layout_subject.set("html", data.subject || " ");
            if (this.layout_mainSend) this.layout_mainSend.set("text", data.mainSend || " ");
            if (diffFiletext) {
                this.layout_filetext.set("html", diffFiletext);
            }else if (this.layout_filetext){
                //this.layout_filetext.set("placeholder", this.json.defaultValue.filetext);
                this.layout_filetext.set("html", data.filetext || "　　");

                var tableList = this.layout_filetext.getElements("table");
                if (tableList && tableList.length){
                    // var w = this.layout_filetext.offsetWidth;
                    // tableList.setStyle("width", ""+w+"px");
                    tableList.setStyles({
                        "margin-left": "",
                        "margin-right": "",
                        "word-break": "break-all"
                    });
                }
            }
            if (this.layout_signer) this.layout_signer.set("html", data.signer || "");
            if (this.layout_attachmentTitle) this.layout_attachmentTitle.set("text", data.attachmentTitle || " ");

            if (this.layout_attachment){
                this.setAttachmentData();
            }
            if (this.layout_attachmentText){
                this.setAttachmentText(data);
            }

            if (this.layout_issuanceUnit) this.layout_issuanceUnit.set("html", data.issuanceUnit || " ");
            if (this.layout_issuanceDate) this.layout_issuanceDate.set("text", data.issuanceDate || " ");
            if (this.layout_annotation){
                var annotation = data.annotation;
                if (annotation){
                    if (annotation.substring(0, 1)!=="（") annotation = "（"+annotation;
                    if (annotation.substring(annotation.length-1, annotation.length)!=="）") annotation = annotation+"）";
                    this.layout_annotation.set("text", annotation);
                }else{
                    this.layout_annotation.set("text", "");
                }
            }
            if (this.layout_copytoTitle) this.layout_copytoTitle.set("text", data.copytoTitle || " ");
            if (this.layout_copytoContent) this.layout_copytoContent.set("text", data.copyto || " ");
            if (this.layout_copyto2Title) this.layout_copyto2Title.set("text", data.copyto2Title || " ");
            if (this.layout_copyto2Content) this.layout_copyto2Content.set("text", data.copyto2 || " ");
            if (this.layout_edition_issuance_unit) this.layout_edition_issuance_unit.set("text", data.editionUnit || " ");
            if (this.layout_edition_issuance_date) this.layout_edition_issuance_date.set("text", data.editionDate || " ");

            if (this.layout_meetingAttendTitle) this.layout_meetingAttendTitle.set("text", data.meetingAttendTitle || this.json.defaultValue.meetingAttendTitle || " ");
            if (this.layout_meetingLeaveTitle) this.layout_meetingLeaveTitle.set("text", data.meetingLeaveTitle || this.json.defaultValue.meetingLeaveTitle || " ");
            if (this.layout_meetingSitTitle) this.layout_meetingSitTitle.set("text", data.meetingSitTitle || this.json.defaultValue.meetingSitTitle || " ");

            if (this.layout_meetingAttendContent) this.layout_meetingAttendContent.set("html", this.filterHtml(data.meetingAttend || " "));
            if (this.layout_meetingLeaveContent) this.layout_meetingLeaveContent.set("html", this.filterHtml(data.meetingLeave || " "));
            if (this.layout_meetingSitContent) this.layout_meetingSitContent.set("html", this.filterHtml(data.meetingSit || " "));
            if (this.layout_meetingRecordContent) this.layout_meetingRecordContent.set("html", this.filterHtml(data.meetingRecord || " "));

            if (this.layout_seals){
                if (data.seals && data.seals.length){
                    data.seals.each(function(src, i){
                        if (this.layout_seals[i] && src){
                            this.layout_seals[i].src = src;
                            this.layout_seals[i].show();
                            this.layout_seals[i].setStyles({
                                "border": "0",
                                "border-radius": "0",
                                "z-index": -1
                            });
                        }
                    }.bind(this));
                }
            }

            if (this.customLayouts){
                this.customLayouts.each(function(l){
                    var value = this.data[l.name] || "";
                    var reg = new RegExp("\n","g");
                    var text = value.replace(reg,"<br/>");

                    l.node.set("html",text || "　");
                }.bind(this))
            }

            if (this.layout_issuanceUnit && this.layout_issuanceDate ){
                var table = this.layout_issuanceUnit.getParent("table")
                if (table && !table.hasClass("doc_layout_headIssuance")){
                    var unitWidth = o2.getTextSize(this.layout_issuanceUnit.get("text"), {
                        "font-size":"16pt",
                        "font-family":"'Times New Roman',仿宋",
                        "letter-spacing": "-0.2pt"
                    }).x;
                    var dateWidth = o2.getTextSize(this.layout_issuanceDate.get("text"), {
                        "font-size":"16pt",
                        "font-family":"'Times New Roman',仿宋",
                        "letter-spacing": "-0.2pt"
                    }).x;

                    if (table.hasClass("doc_layout_issuanceV2")){
                        if (unitWidth<=dateWidth){
                            //日期右空四字，单位相对与日期居中
                            var flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                            if (flagTd) flagTd.setStyle("width", "64pt");
                            flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                            if (flagTd) flagTd.setStyle("width", "64pt");

                            var dateP = this.layout_issuanceDate.getParent("p");
                            if (dateP){
                                dateP.setStyle("text-align", "right");
                                var span = dateP.getElement("span.space");
                                if (span) span.destroy();
                            }
                        }else{
                            var flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                            if (flagTd) flagTd.setStyle("width", "32pt");
                            flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                            if (flagTd) flagTd.setStyle("width", "32pt");

                            var dateP = this.layout_issuanceDate.getParent("p");
                            if (dateP){
                                dateP.setStyle("text-align", "left");
                                var span = dateP.getElement("span.space");
                                if (!span) new Element("span.space", { "html": "&#x3000;&#x3000;" }).inject(dateP, "top");
                            }
                        }
                    }else{
                        if (unitWidth<=dateWidth){
                            //日期右空四字，单位相对与日期居中
                            var flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                            if (flagTd) {
                                var pt = 16*4;  //空四字
                                flagTd.setStyle("width", "" + pt + "pt");

                                flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                                if (flagTd) flagTd.setStyle("width", "" + pt + "pt");
                            }
                            //var dateTd = this.layout_issuanceDate.getParent("td");
                            var unitTd = this.layout_issuanceUnit.getParent("td");
                            unitTd.setStyle("width", dateWidth);
                            var p = this.layout_issuanceUnit.getParent("p");
                            if (p) p.setStyle("text-align", "center");
                        }else{
                            var flagTd = this.layout_issuanceUnit.getParent("td").getNext("td");
                            if (flagTd) flagTd.setStyle("width", "32pt");

                            var unitTd = this.layout_issuanceUnit.getParent("td");
                            unitTd.setStyle("width", "auto");

                            flagTd = this.layout_issuanceDate.getParent("td").getNext("td");
                            if (flagTd) flagTd.setStyle("width", "64pt");
                            var p = this.layout_issuanceDate.getParent("p");
                            if (p) p.setStyle("text-align", "right");
                        }
                    }
                }
            }
            var coptyToTitleNode = (this.layout_copytoTitle || this.layout_copyto2Title);
            if (coptyToTitleNode){
                var editionTable = coptyToTitleNode.getParent("table");
                if (editionTable) if (editionTable.get("data-compute-style")=="y"){
                    var rows = editionTable.rows;
                    for (var i=0; i<rows.length; i++){
                        var cell = rows[i].cells[0];

                        var tmp = cell.getElement(".doc_layout_edition_issuance_unit");
                        if (!tmp) tmp = cell.getElement(".doc_layout_edition_issuance_date");
                        if (!tmp){
                            var text = cell.get("text").trim();
                            var l = 14*text.length;
                            var wl = 19*text.length;
                            cell.setStyles({
                                "max-width": ""+l+"pt",
                                "min-width": ""+l+"pt",
                                "width": ""+wl+"pt"
                            });
                        }

                    }
                }
            }
        }
    },
    createErrorNode: function(text){
        var node = new Element("div");
        var iconNode = new Element("div", {
            "styles": {
                "width": "20px",
                "height": "20px",
                "float": "left",
                "background": "url("+"../x_component_process_Xform/$Form/default/icon/error.png) center center no-repeat"
            }
        }).inject(node);
        var textNode = new Element("div", {
            "styles": {
                "line-height": "20px",
                "margin-left": "20px",
                "color": "red",
                "word-break": "keep-all"
            },
            "text": text
        }).inject(node);
        return node;
    },

    notValidationMode: function(text){
        if (!this.isNotValidationMode){
            this.isNotValidationMode = true;
            this.node.store("borderStyle", this.node.getStyles("border-left", "border-right", "border-top", "border-bottom"));
            this.node.setStyle("border", "1px solid red");

            this.errNode = this.createErrorNode(text).inject(this.node, "after");
            this.showNotValidationMode(this.node);
        }
    },
    showNotValidationMode: function(node){
        var p = node.getParent("div");
        if (p){
            if (p.get("MWFtype") == "tab$Content"){
                if (p.getParent("div").getStyle("display")=="none"){
                    var contentAreaNode = p.getParent("div").getParent("div");
                    var tabAreaNode = contentAreaNode.getPrevious("div");
                    var idx = contentAreaNode.getChildren().indexOf(p.getParent("div"));
                    var tabNode = tabAreaNode.getLast().getFirst().getChildren()[idx];
                    tabNode.click();
                    p = tabAreaNode.getParent("div");
                }
            }
            this.showNotValidationMode(p);
        }
    },
    validationMode: function(){
        if (this.isNotValidationMode){
            this.isNotValidationMode = false;
            this.node.setStyles(this.node.retrieve("borderStyle"));
            if (this.errNode){
                this.errNode.destroy();
                this.errNode = null;
            }
        }
    },

    validationConfigItem: function(routeName, data){
        var flag = (data.status=="all") ? true: (routeName == data.decision);
        if (flag){
            var n = this.getData();
            var v = (data.valueType=="value") ? n : n.length;
            switch (data.operateor){
                case "isnull":
                    if (!v){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "notnull":
                    if (v){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "gt":
                    if (v>data.value){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "lt":
                    if (v<data.value){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "equal":
                    if (v==data.value){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "neq":
                    if (v!=data.value){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "contain":
                    if (v.indexOf(data.value)!=-1){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "notcontain":
                    if (v.indexOf(data.value)==-1){
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
            }
        }
        return true;
    },
    validationConfig: function(routeName, opinion){
        if (this.json.validationConfig){
            if (this.json.validationConfig.length){
                for (var i=0; i<this.json.validationConfig.length; i++) {
                    var data = this.json.validationConfig[i];
                    if (!this.validationConfigItem(routeName, data)) return false;
                }
            }
            return true;
        }
        return true;
    },
    /**
     * @summary 根据组件的校验设置进行校验。
     *  @param {String} [routeName] - 可选，路由名称.
     *  @example
     *  if( !this.form.get('fieldId').validation() ){
     *      return false;
     *  }
     *  @return {Boolean} 是否通过校验
     */
    validation: function(routeName, opinion){
        if (!this.validationConfig(routeName, opinion))  return false;

        if (!this.json.validation) return true;
        if (!this.json.validation.code) return true;

        this.currentRouteName = routeName;
        var flag = this.form.Macro.exec(this.json.validation.code, this);
        this.currentRouteName = "";

        if (!flag) flag = MWF.xApplication.process.Xform.LP.notValidation;
        if (flag.toString()!="true"){
            this.notValidationMode(flag);
            return false;
        }
        return true;
    },
    removeDisplayNone: function(node){
        var n = node.getFirst();
        while (n){
            if (n.getStyle("display")=="none" || (this.json.toWordSeal=="n" && n.hasClass("doc_layout_seal"))){
                var tmp = n.getNext();
                n.destroy();
                n = tmp;
            }else{
                n = this.removeDisplayNone(n);
                n = n.getNext();
            }
        }
        return node;
    },
    /**将公文编辑器内容以html形式输出
     * @return {String}
     * @example
     * var html = this.form.get("fieldId").getDocumentHtml();
    */
    getDocumentHtml: function(){
        var docNode = this.contentNode.getFirst().getFirst();
        var filetextNode = docNode.getElement(".doc_layout_filetext");
        var tables = filetextNode.getElements("table");
        tables.each(function(table){
            var tableWidth = table.offsetWidth;
            table.set("data-o2-width", tableWidth);

            // var tr = table.getElement("tr");
            // if (tr){
            table.getElements("td").each(function(td){
                var tdx = td.offsetWidth;
                var p = (tdx/tableWidth)*100;
                td.set("data-o2-width", tdx);
            });
            //}
        });

        var tmpNode = this.contentNode.getFirst().getFirst().clone(true);
        var htmlNode = tmpNode.getLast();
        htmlNode = this.removeDisplayNone(htmlNode);
        var nodes = tmpNode.querySelectorAll("[data-w-style]");
        if (nodes.length){
            for (var i=0; i<nodes.length; i++){
                var n = nodes.item(i);
                wStyle = n.dataset["wStyle"];
                var styles = wStyle.split(/\s*\;\s*/g);
                styles.each(function(style){
                    if (style){
                        try{
                            s = style.split(/\s*\:\s*/g);
                            n.setStyle(s[0], s[1]);
                        }catch(e) {}
                    }
                });
            }
        }

        var filetextNode = tmpNode.getElement(".doc_layout_filetext");
        filetextNode.getElements("td").setStyle("width", "");
        //var tables = filetextNode.getElements("table");

        var tables = tmpNode.querySelectorAll("table[data-o2-width]");
        for (var i=0; i<tables.length; i++){
            tables[i].setStyle("width", tables[i].dataset["o2Width"]+"px");
        }

        var tds = tmpNode.querySelectorAll("td[data-o2-width]");
        for (var i=0; i<tds.length; i++){
            tds[i].setStyle("width", tds[i].dataset["o2Width"]+"px");
        }

        var htmlStr = tmpNode.get("html");
        tmpNode.destroy();
        return "<html xmlns:v=\"urn:schemas-microsoft-com:vml\"><head><meta charset=\"UTF-8\" /></head><body>"+htmlStr+"</body></html>";
    },
    /**
     * @summary 将公文编辑器转换成附件，转换的文件名和格式等信息与配置有关
     * @param {Function} [callback] 转换后的回调方法，参数是附件数据.
     * @param {string} [name] - 如果为空或者不传，转换的文件名和格式等信息与配置有关.
     * @example
     * this.form.get("fieldId").toWord( function(attachmentData){
     *     //attachmentData 转换后的附件数据
     * })
    */
    toWord: function(callback, name, cb, notSave){
        var docNmae = name || "";
        if (!docNmae){
            try{
                docNmae = this.json.toWordFilename || this.form.businessData.data.subject || this.form.businessData.data["$work"].title
            }catch (e) {}
        }
        var toEdit = false;
        if (this.editMode){
            toEdit = true;
            this._readFiletext();
        }
        //this._returnScale();
        this.zoom(1);

        this.pages = [];
        this.contentNode.empty();
        this._createPage(function(control){
            this._loadPageLayout(control);
            this.setData(this.data);
            this._checkScale();
            this.node.setStyles({
                "height":"auto"
            });
        }.bind(this), function(){
            if (!this.data.attachmentText && this.layout_attachmentText){
                this.layout_attachmentText.set("text", "");
            }

            var fileName = docNmae || this.json.toWordFilename || "$doc";
            var n = fileName.lastIndexOf(".");

            if (this.json.wordConversionType==="service"){
                if (n==-1) fileName = fileName+".doc";
                var content = encodeURIComponent(this.getDocumentHtml());

                var body = {
                    "fileName": fileName,
                    "site": this.json.toWordSite || "$doc",
                    "content": content
                };
                this.toWordServiceService(body, callback, cb);
                // o2.Actions.get("x_processplatform_assemble_surface").docToWord(this.form.businessData.work.id, body, function(json){
                //     if (this.form.businessData.workCompleted){
                //         o2.Actions.get("x_processplatform_assemble_surface").getAttachmentWorkcompleted(json.data.id, this.form.businessData.workCompleted.id,function(attjson){
                //             if (callback) callback(attjson.data);
                //             this.showToWord(attjson.data);
                //         }.bind(this));
                //     }else{
                //         o2.Actions.get("x_processplatform_assemble_surface").getAttachment(json.data.id, this.form.businessData.work.id,function(attjson){
                //             if (callback) callback(attjson.data);
                //             this.showToWord(attjson.data);
                //         }.bind(this));
                //     }
                //     if (cb) cb();
                // }.bind(this));
            }else{
                if (n==-1) fileName = fileName+".docx";
                var content = this.getDocumentHtml();
                o2.xDesktop.requireApp("process.Xform", "widget.OOXML", function(){
                    (new o2.OOXML.WML({
                        "protection": (this.json.wordConversionEncryption===true),
                        "firstPageNumber": (this.json.firstPageNumber!==false)
                    })).load(content).then(function(oo_content){

                        if (!notSave) {
                            oo_content.name = fileName
                            var formData = new FormData();
                            formData.append("site", this.json.toWordSite || "$doc");
                            formData.append("fileName", fileName);
                            formData.append('file', oo_content);


                            this.toWordOOXMLService(formData, oo_content, callback, cb);
                            // o2.Actions.get("x_processplatform_assemble_surface").V2UploadWorkOrWorkCompleted(this.form.businessData.work.id, formData, oo_content, function (json) {
                            //     if (this.form.businessData.workCompleted) {
                            //         o2.Actions.get("x_processplatform_assemble_surface").getAttachmentWorkcompleted(json.data.id, this.form.businessData.workCompleted.id, function (attjson) {
                            //             if (callback) callback(attjson.data);
                            //             this.showToWord(attjson.data);
                            //         }.bind(this));
                            //     } else {
                            //         o2.Actions.get("x_processplatform_assemble_surface").getAttachment(json.data.id, this.form.businessData.work.id, function (attjson) {
                            //             if (callback) callback(attjson.data);
                            //             this.showToWord(attjson.data);
                            //         }.bind(this));
                            //     }
                            //     if (cb) cb();
                            // }.bind(this));
                        }else{
                            if (callback) callback(oo_content, fileName);
                            if (cb) cb();
                        }

                    }.bind(this));
                }.bind(this));
            }

            if (!toEdit){
                this._readFiletext();
            }else{
                this._createEditor("inline");
            }
        }.bind(this));
    },
    toWordServiceService: function(body, callback, cb){
        if (this.toWordServiceServiceProcessing){
            if (!this.toWordServiceServiceProcessList) this.toWordServiceServiceProcessList = [];
            this.toWordServiceServiceProcessList.push({
                body: body,
                callback: callback,
                cb: cb
            });
            return false;
        }

        this.toWordServiceServiceProcessing = true;

        o2.Actions.get("x_processplatform_assemble_surface").docToWord(this.form.businessData.work.id, body, function(json){
            if (this.form.businessData.workCompleted){
                o2.Actions.get("x_processplatform_assemble_surface").getAttachmentWorkcompleted(json.data.id, this.form.businessData.workCompleted.id,function(attjson){
                    if (callback) callback(attjson.data);
                    this.showToWord(attjson.data);
                }.bind(this));
            }else{
                o2.Actions.get("x_processplatform_assemble_surface").getAttachment(json.data.id, this.form.businessData.work.id,function(attjson){
                    if (callback) callback(attjson.data);
                    this.showToWord(attjson.data);
                }.bind(this));
            }
            if (cb) cb();
            this.toWordServiceServiceProcessing = false;
            if (this.toWordServiceServiceProcessList &&  this.toWordServiceServiceProcessList.length){
                var o = this.toWordServiceServiceProcessList.shift();
                this.toWordServiceService(o.body, o.callback, o.cb);
            }
        }.bind(this), function(){
            this.toWordServiceServiceProcessing = false;
            if (this.toWordServiceServiceProcessList &&  this.toWordServiceServiceProcessList.length){
                var o = this.toWordServiceServiceProcessList.shift();
                this.toWordServiceService(o.body, o.callback, o.cb);
            }
        });
    },
    toWordOOXMLService: function(formData, oo_content, callback, cb){
        if (this.toWordOOXMLServiceProcessing){
            if (!this.toWordOOXMLServiceProcessList) this.toWordOOXMLServiceProcessList = [];
            this.toWordOOXMLServiceProcessList.push({
                formData: formData,
                oo_content: oo_content,
                callback: callback,
                cb: cb
            });
            return false;
        }

        this.toWordOOXMLServiceProcessing = true;
        o2.Actions.get("x_processplatform_assemble_surface").V2UploadWorkOrWorkCompleted(this.form.businessData.work.id, formData, oo_content, function (json) {
            if (this.form.businessData.workCompleted) {
                o2.Actions.get("x_processplatform_assemble_surface").getAttachmentWorkcompleted(json.data.id, this.form.businessData.workCompleted.id, function (attjson) {
                    if (callback) callback(attjson.data);
                    this.showToWord(attjson.data);
                }.bind(this));
            } else {
                o2.Actions.get("x_processplatform_assemble_surface").getAttachment(json.data.id, this.form.businessData.work.id, function (attjson) {
                    if (callback) callback(attjson.data);
                    this.showToWord(attjson.data);
                }.bind(this));
            }
            if (cb) cb();
            this.toWordOOXMLServiceProcessing = false;
            if (this.toWordOOXMLServiceProcessList &&  this.toWordOOXMLServiceProcessList.length){
                var o = this.toWordOOXMLServiceProcessList.shift();
                this.toWordOOXMLService(o.formData, o.oo_content, o.callback, o.cb);
            }
        }.bind(this), function(){
            this.toWordOOXMLServiceProcessing = false;
            if (this.toWordOOXMLServiceProcessList &&  this.toWordOOXMLServiceProcessList.length){
                var o = this.toWordOOXMLServiceProcessList.shift();
                this.toWordOOXMLService(o.formData, o.oo_content, o.callback, o.cb);
            }
        }.bind(this));
    },
    docToWord: function(callback){
        try {
            var flag = true;
            if (this.json.toWordConditionScript && this.json.toWordConditionScript.code){
                flag = !!this.form.Macro.exec(this.json.toWordConditionScript.code, this);
            }
            if (flag){
                this.toWord(null, "", callback);
            }else{
                if (callback) callback();
            }
        }catch(e){
            console.error(e);
            if (callback) callback();
        };
    },
    showToWord: function(att_word){
        var site = this.json.toWordSite || "$doc";
        var attModule = this.form.all[site];
        if (attModule){
            var atts = [];
            attModule.attachmentController.attachments.each(function(att){
                if (att.data.name!==att_word.name){
                    atts.push(att.data)
                }
            }.bind(this));

            attModule.attachmentController.clear();

            atts.each(function (att) {
                //if (att.site===this.json.id || (this.json.isOpenInOffice && this.json.officeControlName===att.site)) this.attachmentController.addAttachment(att);
                if ((att.site === attModule.json.id) && att.name!==att_word.name) attModule.attachmentController.addAttachment(att);
            }.bind(this));
            // attModule.attachmentController.reloadAttachments();
            attModule.attachmentController.addAttachment(att_word);
        }
    }
});
