MWF.xApplication.process = MWF.xApplication.process || {};
MWF.APPFD = MWF.xApplication.process.FormDesigner = MWF.xApplication.process.FormDesigner || {};
MWF.xApplication.cms.FormDesigner = MWF.xApplication.cms.FormDesigner || {};
MWF.CMSFD = MWF.xApplication.cms.FormDesigner;
MWF.CMSFD.options = {
	"multitask": true,
	"executable": false
};
//MWF.xDesktop.requireApp("cms.ColumnManager", "Actions.RestActions", null, false);
MWF.xDesktop.requireApp("cms.FormDesigner", "Module.Package", null, false);
MWF.xApplication.cms.FormDesigner.Main = new Class({
    Extends: MWF.xApplication.Common.Main,
	Implements: [Options, Events],
	options: {
		"style": "default",
        "template": "form.json",
        "templateId": "",
        "name": "cms.FormDesigner",
        "icon": "icon.png",
        "title": MWF.CMSFD.LP.title,
        "appTitle": MWF.CMSFD.LP.title,
        "id": "",
        "actions": null,
        "category": null,
        "processData": null,
        "mvcStyle": "style.css"
	},
	onQueryLoad: function(){
        this._loadCss();
        this.shortcut = true;
		if (this.status){
			this.options.id = this.status.id;
		}
		if (!this.options.id){
			this.options.desktopReload = false;
			this.options.title = this.options.title + "-"+MWF.CMSFD.LP.newForm;
		}
		this.actions = MWF.Actions.get("x_cms_assemble_control"); //new MWF.xApplication.cms.ColumnManager.Actions.RestActions();
		
		this.lp = MWF.xApplication.cms.FormDesigner.LP;
//		this.processData = this.options.processData;
	},


    loadApplication: function(callback){
        this.createNode();
        if (!this.options.isRefresh){
            this.maxSize(function(){
                this.openForm();
            }.bind(this));
        }else{
            this.openForm();
        }

        this.addKeyboardEvents();
        if (callback) callback();
    },
    addKeyboardEvents: function(){
        this.addEvent("copy", function(){
            this.copyModule();
        }.bind(this));
        this.addEvent("paste", function(){
            this.pasteModule();
        }.bind(this));
        this.addEvent("cut", function(){
            this.cutModule();
        }.bind(this));
        this.addEvent("keySave", function(e){
            this.keySave(e);
        }.bind(this));
        this.addEvent("keyDelete", function(e){
            this.keyDelete(e);
        }.bind(this));
    },
    keySave: function(e){
        if (this.shortcut) {
            if (this.form) this.saveForm();
            e.preventDefault();
        }
    },
    keyDelete: function(e){
        if (this.form){
            if (this.shortcut){
                if (this.form.currentSelectedModule){
                    var module = this.form.currentSelectedModule;
                    if (module.moduleType!="form" && module.moduleName.indexOf("$")==-1){
                        module["delete"](module.node);
                    }
                }
            }
        }
    },
    copyModule: function(){
        if (this.shortcut) {
            if (this.form) {
                //           if (this.form.isFocus){
                // if (!this.form.node.contains(document.activeElement)){
                //     return false;
                // }
                if (this.form.currentSelectedModule) {
                    var module = this.form.currentSelectedModule;
                    if (module.moduleType != "form" && module.moduleName.indexOf("$") == -1) {

                        this.form.fireEvent("queryGetFormData", [module.node]);
                        var html = module.getHtml();
                        var json = module.getJson();
                        this.form.fireEvent("postGetFormData", [module.node]);

                        MWF.clipboard.data = {
                            "type": "form",
                            "data": {
                                "html": html,
                                "json": json
                            }
                        };
                    } else {
                        MWF.clipboard.data = null;
                    }
                }
                //          }
            }
        }
    },
    cutModule: function(){
        if (this.shortcut) {
            if (this.form) {
                //          if (this.form.isFocus){
                if (this.form.currentSelectedModule) {
                    var module = this.form.currentSelectedModule;
                    if (module.moduleType != "form" && module.moduleName.indexOf("$") == -1) {
                        this.copyModule();
                        var _form = module.form;
                        module.destroy();_form.currentSelectedModule = null;
                        _form.selected();
                        _form = null;
                    }
                }
                //           }
            }
        }
    },
    pasteModule: function(){
        if (this.shortcut) {
            if (this.form) {
                if (MWF.clipboard.data) {
                    if (MWF.clipboard.data.type == "form") {
                        var html = MWF.clipboard.data.data.html;
                        var json = Object.clone(MWF.clipboard.data.data.json);
                        var tmpNode = Element("div", {
                            "styles": {"display": "none"},
                            "html": html
                        }).inject(this.content);
                        Object.each(json, function (moduleJson) {
                            var oid = moduleJson.id;
                            var id = moduleJson.id;
                            var idx = 1;
                            while (this.form.json.moduleList[id]) {
                                id = oid + "_" + idx;
                                idx++;
                            }

                            if (oid != id) {
                                moduleJson.id = id;
                                var moduleNode = tmpNode.getElementById(oid);
                                if (moduleNode) moduleNode.set("id", id);
                            }
                            this.form.json.moduleList[moduleJson.id] = moduleJson;
                        }.bind(this));
                        json = null;

                        var injectNode = this.form.node;
                        var where = "bottom";
                        var parent = this.form;
                        if (this.form.currentSelectedModule) {
                            var toModule = this.form.currentSelectedModule;
                            injectNode = toModule.node;
                            parent = toModule;

                            if (toModule.moduleType != "container" && toModule.moduleType != "form") {
                                where = "after";
                                parent = toModule.parentContainer;
                            }
                        }
                        var copyModuleNode = tmpNode.getFirst();
                        while (copyModuleNode) {
                            copyModuleNode.inject(injectNode, where);
                            var copyModuleJson = this.form.getDomjson(copyModuleNode);
                            module = this.form.loadModule(copyModuleJson, copyModuleNode, parent);
                            module._setEditStyle_custom("id");
                            module.selected();

                            copyModuleNode = tmpNode.getFirst();
                        }
                        tmpNode.destroy();
                        tmpNode = null;
                    }
                }
            }
        }
    },
    createNode: function(){
        this.content.setStyle("overflow", "hidden");
        this.node = new Element("div", {
            "styles": {"width": "100%", "height": "100%", "overflow": "hidden"}
        }).inject(this.content);
    },
    openForm: function(){
        this.initOptions();
        this.loadNodes();
        this.loadToolbar();
        this.loadFormNode();
        this.loadProperty();
        this.loadTools(function(){
            this.resizeNode();
            this.addEvent("resize", this.resizeNode.bind(this));
        }.bind(this));
        this.loadForm();

        MWF.require("MWF.widget.ScrollBar", function(){
            new MWF.widget.ScrollBar(this.propertyDomScrollArea, {
                "style":"default", "where": "before", "distance": 30, "friction": 4, "indent": false, "axis": {"x": false, "y": true}
            });
        }.bind(this));

        // if (this.toolbarContentNode){
        //     this.setScrollBar(this.toolbarContentNode, null, {
        //         "V": {"x": 0, "y": 0},
        //         "H": {"x": 0, "y": 0}
        //     });
        //     //this.setScrollBar(this.propertyDomScrollArea, "form_property", {
        //     //	"V": {"x": 0, "y": 0},
        //     //	"H": {"x": 0, "y": 0}
        //     //});
        //     MWF.require("MWF.widget.ScrollBar", function(){
        //         new MWF.widget.ScrollBar(this.propertyDomScrollArea, {
        //             "style":"default", "where": "before", "distance": 30, "friction": 4, "indent": false, "axis": {"x": false, "y": true}
        //         });
        //     }.bind(this));
        // }
    },
    initOptions: function(){
        this.toolsData = null;
        this.toolbarMode = "all";
        this.tools = [];
        this.toolGroups = [];
        this.toolbarDecrease = 0;

        this.designNode = null;
        this.form = null;
    },
    loadNodes: function(){
        this.toolbarNode = new Element("div", {
            "styles": this.css.toolbarNode,
            "events": {"selectstart": function(e){e.preventDefault();}}
        }).inject(this.node);
        this.propertyNode = new Element("div", {
            "styles": this.css.propertyNode
        }).inject(this.node);
        this.formNode = new Element("div", {
            "styles": this.css.formNode
        }).inject(this.node);

        if (this.options.style=="bottom") this.propertyNode.inject(this.formNode, "after");
    },

    //loadToolbar----------------------
    loadToolbar: function(){
        this.toolbarTitleNode = new Element("div", {
            "styles": this.css.toolbarTitleNode,
            "text": MWF.APPFD.LP.tools
        }).inject(this.toolbarNode);

        this.toolbarTitleActionNode = new Element("div", {
            "styles": this.css.toolbarTitleActionNode,
            "events": {
                "click": function(e){
                    this.switchToolbarMode();
                }.bind(this)
            }
        }).inject(this.toolbarNode);

        this.toolbarTitleCategoryActionNode = new Element("div", {
            "styles": this.css.toolbarTitleCategoryActionNode
        }).inject(this.toolbarNode);

        this.categoryActionMenu = new o2.xDesktop.Menu(this.toolbarTitleCategoryActionNode, {
            "event": "click", "style": "flatUser", "offsetX": 0, "offsetY": 0, "container": this.node,
            "onQueryShow": this.showCategoryMenu.bind(this)
        });
        this.categoryActionMenu.load();

        this.toolbarGroupContentNode = new Element("div", {"styles": this.css.toolbarGroupContentNode}).inject(this.toolbarNode);
        this.toolbarGroupContentNode.addEvent("selectstart", function(e){
            e.preventDefault();
            e.stopPropagation();
        });
    },

    showCategoryMenu: function(){
        this.categoryActionMenu.items.each(function(item){
            debugger;
            if (this.currentToolGroup && this.currentToolGroup.data.text==item.options.text){
                item.setDisable(true);
                var imgDiv = item.item.getFirst();
                var img = imgDiv.getElement("img");
                if (!img) img = new Element("img", {"styles": item.menu.css.menuItemImg}).inject(imgDiv);
                img.set("src", this.path+this.options.style+"/check.png");
            }else{
                item.setDisable(false);
                var imgDiv = item.item.getFirst();
                var img = imgDiv.getElement("img");
                if (img) img.destroy();
            }
        }.bind(this));
    },

    switchToolbarMode: function(){
        if (this.toolbarMode=="all"){
            var size = this.toolbarNode.getSize();
            this.toolbarDecrease = (size.x.toFloat())-60;

            this.tools.each(function(node){
                node.getLast().setStyle("display", "none");
            });
            this.toolbarTitleNode.set("text", "");

            this.toolbarNode.setStyle("width", "60px");

            var formMargin = this.formNode.getStyle("margin-left").toFloat();
            formMargin = formMargin - this.toolbarDecrease;

            this.formNode.setStyle("margin-left", ""+formMargin+"px");

            this.toolbarTitleActionNode.setStyles(this.css.toolbarTitleActionNodeRight);

			this.toolbarGroupContentNode.getElements(".o2formModuleTools").hide();

            this.toolbarMode="simple";
        }else{
            sizeX = 60 + this.toolbarDecrease;
            var formMargin = this.formNode.getStyle("margin-left").toFloat();
            formMargin = formMargin + this.toolbarDecrease;

            this.toolbarNode.setStyle("width", ""+sizeX+"px");
            this.formNode.setStyle("margin-left", ""+formMargin+"px");

            this.tools.each(function(node){
                node.getLast().setStyle("display", "block");
            });

            this.toolbarTitleNode.set("text", MWF.APPFD.LP.tools);

            this.toolbarTitleActionNode.setStyles(this.css.toolbarTitleActionNode);

            this.toolbarGroupContentNode.getElements(".o2formModuleTools").show();

            this.toolbarMode="all";
        }

    },

    //loadFormNode------------------------------
    loadFormNode: function(){
        this.formToolbarNode = new Element("div", {
            "styles": this.css.formToolbarNode
        }).inject(this.formNode);
        this.loadFormToolbar();

        this.formContentNode = new Element("div", {
            "styles": this.css.formContentNode
        }).inject(this.formNode);
        this.loadFormContent(function(){
            if (this.designDcoument) this.designDcoument.body.setStyles(this.css.designBody);
            if (this.designNode) this.designNode.setStyles(this.css.designNode);
        }.bind(this));
    },
    loaddesignerActionNode: function(){
        this.pcDesignerActionNode = this.formToolbarNode.getElement("#MWFFormPCDesignerAction");
        this.mobileDesignerActionNode = this.formToolbarNode.getElement("#MWFFormMobileDesignerAction");
        this.currentDesignerMode = "PC";

        this.pcDesignerActionNode.setStyles(this.css.designerActionNode_current);
        this.mobileDesignerActionNode.setStyles(this.css.designerActionNode);

        var iconNode = new Element("div", {"styles": this.css.designerActionPcIconNode}).inject(this.pcDesignerActionNode);
        iconNode = new Element("div", {"styles": this.css.designerActionMobileIconNode}).inject(this.mobileDesignerActionNode);

        var textNode = new Element("div", {"styles": this.css.designerActiontextNode, "text": "PC"}).inject(this.pcDesignerActionNode);
        textNode = new Element("div", {"styles": this.css.designerActiontextNode, "text": "Mobile"}).inject(this.mobileDesignerActionNode);

        this.pcDesignerActionNode.addEvent("click", function(){
            if (this.currentDesignerMode!="PC"){
                this.changeDesignerModeToPC();
            }
        }.bind(this));
        this.mobileDesignerActionNode.addEvent("click", function(){
            if (this.currentDesignerMode=="PC"){
                this.changeDesignerModeToMobile();
            }
        }.bind(this));
    },
    changeDesignerModeToPC: function(){
        this.pcDesignerActionNode.setStyles(this.css.designerActionNode_current);
        this.mobileDesignerActionNode.setStyles(this.css.designerActionNode);

        this.designMobileNode.setStyle("display", "none");
        this.designNode.setStyle("display", "block");

        if (this.form.currentSelectedModule){
            if (this.form.currentSelectedModule==this){
                return true;
            }else{
                this.form.currentSelectedModule.unSelected();
            }
        }
        if (this.form.propertyMultiTd){
            this.form.propertyMultiTd.hide();
            this.form.propertyMultiTd = null;
        }
        this.form.unSelectedMulti();

        if (this.form.designTabPageScriptAreaNode) this.form.designTabPageScriptAreaNode.hide();
        this.form = this.pcForm;

        if ((this.scriptPage && this.scriptPage.isShow) || this.scriptPanel){
            this.loadAllScript();
        }

        this.currentDesignerMode = "PC";
    },

    changeDesignerModeToMobile: function(){
        this.pcDesignerActionNode.setStyles(this.css.designerActionNode);
        this.mobileDesignerActionNode.setStyles(this.css.designerActionNode_current);

        this.designMobileNode.setStyle("display", "block");
        this.designNode.setStyle("display", "none");

        if (this.form.currentSelectedModule){
            if (this.form.currentSelectedModule==this){
                return true;
            }else{
                this.form.currentSelectedModule.unSelected();
            }
        }
        if (this.form.propertyMultiTd){
            this.form.propertyMultiTd.hide();
            this.form.propertyMultiTd = null;
        }
        this.form.unSelectedMulti();

        if (!this.mobileForm){
            this.mobileForm = new MWF.CMSFCForm(this, this.designMobileNode, {"mode": "Mobile"});
            if (!Object.keys(this.formMobileData.json.moduleList).length){
                this.formMobileData = Object.clone(this.formData);
            }
            this.mobileForm.load(this.formMobileData);
        }

        if (this.form.designTabPageScriptAreaNode) this.form.designTabPageScriptAreaNode.hide();
        this.form = this.mobileForm;

        if ((this.scriptPage && this.scriptPage.isShow) || this.scriptPanel){
            this.loadAllScript();
        }

        this.currentDesignerMode = "Mobile";
    },


    loadFormToolbar: function(callback){
        this.getFormToolbarHTML(function(toolbarNode){
            var spans = toolbarNode.getElements("span");
            spans.each(function(item, idx){
                var img = item.get("MWFButtonImage");
                if (img){
                    item.set("MWFButtonImage", this.path+""+this.options.style+"/formtoolbar/"+img);
                }
            }.bind(this));

            $(toolbarNode).inject(this.formToolbarNode);
            MWF.require("MWF.widget.Toolbar", function(){
                this.formToolbar = new MWF.widget.Toolbar(toolbarNode, {"style": "ProcessCategory"}, this);
                this.formToolbar.load();

                this.loaddesignerActionNode();

                if (callback) callback();
            }.bind(this));
        }.bind(this));
    },
    getFormToolbarHTML: function(callback){
        var toolbarUrl = this.path+this.options.style+"/formToolbars.html";
        var r = new Request.HTML({
            url: toolbarUrl,
            method: "get",
            onSuccess: function(responseTree, responseElements, responseHTML, responseJavaScript){
                var toolbarNode = responseTree[0];
                if (callback) callback(toolbarNode);
            }.bind(this),
            onFailure: function(xhr){
                this.notice("request processToolbars error: "+xhr.responseText, "error");
            }.bind(this)
        });
        r.send();
    },
    loadFormContent: function(callback){
        //var iframe = new Element("iframe#iframeaa", {
        //    "styles": {
        //        "width": "100%",
        //        "height": "100%"
        //    },
        //    //"src": "../x_component_process_FormDesigner/$Main/blank.html",
        //    "border": "0"
        //}).inject(this.formContentNode);

        //     window.setTimeout(function(){
        //         iframe.contentDocument.designMode = "on";
        //
        //
        //         var x = document.id("iframeaa");
        //         this.designNode = document.id(iframe.contentDocument.body, false, iframe.contentDocument);
        //         this.designNode.setStyle("margin", "0px");
        //         this.designNode.setStyles(this.css.designNode);

        MWF.require("MWF.widget.Tab", null, false);
        this.designTabNode = new Element("div").inject(this.formContentNode);
        this.designTab = new MWF.widget.Tab(this.designTabNode, {"style": "design"});
        this.designTab.load();
        this.designTabPageAreaNode = Element("div");

        this.designNode = new Element("div", {
            "styles": this.css.designNode
        }).inject(this.designTabPageAreaNode);
        //this.designContentNode = new Element("div", {
        //    "styles": {"overflow": "visible"}
        //}).inject(this.designNode);

        //MWF.require("MWF.widget.ScrollBar", function(){
        //    new MWF.widget.ScrollBar(this.designNode, {"distance": 100});
        //}.bind(this));


        this.designMobileNode = new Element("div", {
            "styles": this.css.designMobileNode
        }).inject(this.designTabPageAreaNode);

        //MWF.require("MWF.widget.ScrollBar", function(){
        //    new MWF.widget.ScrollBar(this.designMobileNode, {"distance": 50, "style": "xApp_mobileForm"});
        //}.bind(this));
        //    }.bind(this), 2000);

       this.designTabScriptAreaNode = Element("div", {"styles": this.css.designTabScriptAreaNode});

        this.designPage = this.designTab.addTab(this.designTabPageAreaNode, this.lp.design);
        this.scriptPage = this.designTab.addTab(this.designTabScriptAreaNode, this.lp.script);

        this.setScriptPageEvent();

        this.designPage.showTabIm();
        this.scriptPage.addEvent("postShow", function(){
            this.checkLoadAllScript();
            this.fireEvent("resize");
        }.bind(this));
        this.designPage.addEvent("postShow", function(){
            this.fireEvent("resize");
        }.bind(this));
    },
     createScriptPanel: function(p, s){
        MWF.require("MWF.widget.Panel", function(){
            this.scriptPanel = new MWF.widget.Panel(this.designTabScriptAreaNode, {
                "title": this.lp.script,
                "minLeft": "500",
                "minTop": "1",
                "style": "page",
                "target": this.content,
                "limitMove": false,
                "isClose": false,
                "width": s.x,
                "height": s.y,
                "top": p.y,
                "left": p.x,
                "onPostLoad": function(){
                    this.loadAllScript();
                    this.fireEvent("resize");
                }.bind(this),
                "onResize": function(){
                    this.fireEvent("resize");
                }.bind(this),
                "onDrag": function(el, e){
                    if (el.getStyle("top").toInt()<0) el.setStyle("top", "0px");
                    if (!this.scriptPage.tab.tabNodeContainer.isOutside(e)){
                        this.scriptPage.tabNode.show();
                        this.scriptPanel.container.setStyle("opacity", "0.5");
                    }else{
                        this.scriptPage.tabNode.hide();
                        this.scriptPanel.container.setStyle("opacity", "1");
                    }
                }.bind(this),
                "onCompleteMove": function(el, e){
                    if (!this.scriptPage.tab.tabNodeContainer.isOutside(e)){
                        this.scriptPage.tabNode.show();

                        this.designTabScriptAreaNode.inject(this.designTab.contentNodeContainer.getLast());
                        this.fireEvent("resize");
                        this.scriptPage.showTabIm();

                        this.scriptPanel.closePanel();
                        this.scriptPanel = null;
                    }
                }.bind(this)
            });
            this.scriptPanel.load();
        }.bind(this));
    },
    createScriptPageDragNode: function(e){
        var size = this.scriptPage.tab.contentNodeContainer.getSize();
        var position = this.scriptPage.tab.contentNodeContainer.getPosition(this.content);
        if (!this.scriptPageContentDrag){
            var dragNode = new Element("div", {"styles": this.css.scriptPageDragNode}).inject(this.content);

            this.scriptPageContentDrag = new Drag.Move(dragNode, {
                "droppables": [this.scriptPage.tab.tabNodeContainer],
                "onEnter": function(el, drop){
                    this.scriptPage.tabNode.show();
                    this.designTabScriptAreaNode.show();

                    // this.scriptPageContentDrag.stop();
                    // this.scriptPageContentDrag.detach();
                    this.scriptPageContentDrag = null;
                    dragNode.destroy();

                    this.scriptPageDrag.start(e);
                }.bind(this),
                "onComplete": function(el, e){
                    if (this.scriptPage.tab.tabNodeContainer.isOutside(e)){
                        this.createScriptPanel(dragNode.getPosition(this.content), dragNode.getSize());
                        this.designPage.showTabIm();
                    }
                    this.scriptPageContentDrag = null;
                    if (dragNode) dragNode.destroy();
                    this.designTabScriptAreaNode.show();
                }.bind(this)

            });
        }

        var tabPosition = this.scriptPage.tabNode.getPosition();
        var dx = e.page.x-tabPosition.x;
        var dy = e.page.y-tabPosition.y;

        this.scriptPage.tabNode.hide();
        this.designTabScriptAreaNode.hide();

        var w = size.x*0.7;
        var h = size.y*0.7;
        var x = position.x+dx;
        var y = position.y+dy-20;

        dragNode.setStyles({
            "width": ""+w+"px",
            "height": ""+h+"px",
            "top": ""+y+"px",
            "left": ""+x+"px"
        });
        this.scriptPageContentDrag.start(e);

    },
    setScriptPageEvent: function(){
        this.scriptPageDrag =  new Drag(this.scriptPage.tabNode, {
            "snap": 20,
            "onStart": function(el,e){
                el.setStyle("position", "static");
            },
            "onDrag": function(el,e){
                if (this.scriptPage.tab.tabNodeContainer.isOutside(e)){
                    this.scriptPageDrag.stop();
                    el.setStyle("left", "auto");
                    this.createScriptPageDragNode(e);
                }
            }.bind(this),
            "onComplete": function(el){
                el.setStyle("left", "auto");
                //el.setStyle("position", "relative");
            }.bind(this)
        });
    },
    checkLoadAllScript: function(){
        if (this.form){
            this.loadAllScript();
        }else{
            this.designPage.showTabIm();
        }
    },
    loadAllScript: function(){
        if (!this.form.designTabPageScriptAreaNode) this.form.designTabPageScriptAreaNode = Element("div", {"styles": this.css.designTabScriptPcAreaNode}).inject(this.designTabScriptAreaNode);
        this.form.designTabPageScriptAreaNode.show();

        if (!this.form.scriptDesigner){
            MWF.xDesktop.requireApp("cms.FormDesigner", "Script", function(){
                this.form.scriptDesigner = new MWF.xApplication.cms.FormDesigner.Script(this, this.form.designTabPageScriptAreaNode, this.form.json);
                // var moduleJson = this.pageData.json;
                // if (moduleJson.jsheader){
                //     if (moduleJson.jsheader.code){
                //
                //     }
                // }
            }.bind(this));
        }
    },
    reloadPropertyStyles: function(){
        //MWF.release(this.css);
        this.css = null;
        this.cssPath = "../x_component_"+this.options.name.replace(/\./g, "_")+"/$Main/"+this.options.style+"/css.wcss";
        this._loadCss();

        if (this.options.style=="bottom"){
            this.propertyNode.inject(this.formNode, "after");
            this.propertyTitleNode.setStyle("cursor", "row-resize");
            this.loadPropertyResizeBottom();

        }else{
            this.propertyNode.inject(this.formNode, "before");
            this.propertyTitleNode.setStyle("cursor", "default");
            if (this.propertyResizeBottom) this.propertyResizeBottom.detach();
        }

        this.formNode.clearStyles(false);
        this.formNode.setStyles(this.css.formNode);

        this.propertyNode.clearStyles(false);
        this.propertyNode.setStyles(this.css.propertyNode);

        this.propertyTitleNode.clearStyles(false);
        this.propertyTitleNode.setStyles(this.css.propertyTitleNode);

        this.propertyResizeBar.clearStyles(false);
        this.propertyResizeBar.setStyles(this.css.propertyResizeBar);

        this.propertyContentNode.clearStyles(false);
        this.propertyContentNode.setStyles(this.css.propertyContentNode);

        this.propertyDomContentArea.clearStyles(false);
        this.propertyDomContentArea.setStyles(this.css.propertyDomContentArea);

        this.propertyDomScrollArea.clearStyles(false);
        this.propertyDomScrollArea.setStyles(this.css.propertyDomScrollArea);

        this.propertyDomArea.clearStyles(false);
        this.propertyDomArea.setStyles(this.css.propertyDomArea);

        this.propertyContentArea.clearStyles(false);
        this.propertyContentArea.setStyles(this.css.propertyContentArea);

        this.propertyContentResizeNode.clearStyles(false);
        this.propertyContentResizeNode.setStyles(this.css.propertyContentResizeNode);

        this.propertyTitleActionNode.clearStyles(false);
        this.propertyTitleActionNode.setStyles(this.css.propertyTitleActionNode);

        this.resizeNode();
    },
    //loadProperty------------------------
    loadProperty: function(){
        this.propertyTitleActionNode = new Element("div", {
            "styles": this.css.propertyTitleActionNode
        }).inject(this.propertyNode);
        this.propertyTitleActionNode.addEvent("click", function(){
            this.options.style = (this.options.style=="default") ? "bottom" : "default";
            MWF.UD.putData("formDesignerStyle", {"style": this.options.style});
            this.reloadPropertyStyles();
        }.bind(this));

        this.propertyTitleNode = new Element("div", {
            "styles": this.css.propertyTitleNode,
            "text": MWF.APPFD.LP.property
        }).inject(this.propertyNode);
        if (this.options.style=="bottom"){
            this.propertyTitleNode.setStyle("cursor", "row-resize");
            this.loadPropertyResizeBottom();
        }

        this.propertyResizeBar = new Element("div", {
            "styles": this.css.propertyResizeBar
        }).inject(this.propertyNode);
        this.loadPropertyResize();

        this.propertyContentNode = new Element("div", {
            "styles": this.css.propertyContentNode
        }).inject(this.propertyNode);

        this.propertyDomContentArea = new Element("div", {
            "styles": this.css.propertyDomContentArea
        }).inject(this.propertyContentNode);

        this.propertyDomScrollArea = new Element("div", {
            "styles": this.css.propertyDomScrollArea
        }).inject(this.propertyDomContentArea);

        this.propertyDomArea = new Element("div", {
            "styles": this.css.propertyDomArea
        }).inject(this.propertyDomScrollArea);

        this.propertyDomPercent = 0.3;
        this.propertyContentResizeNode = new Element("div", {
            "styles": this.css.propertyContentResizeNode
        }).inject(this.propertyContentNode);

        this.propertyContentArea = new Element("div", {
            "styles": this.css.propertyContentArea
        }).inject(this.propertyContentNode);


        this.loadPropertyContentResize();
    },
    loadPropertyResizeBottom: function(){
        if (!this.propertyResizeBottom){
            this.propertyResizeBottom = new Drag(this.propertyTitleNode,{
                "snap": 1,
                "onStart": function(el, e){
                    var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
                    var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
                    el.store("position", {"x": x, "y": y});

                    var size = this.propertyNode.getSize();
                    el.store("initialWidth", size.x);
                    el.store("initialHeight", size.y);
                }.bind(this),
                "onDrag": function(el, e){
                    //   var x = e.event.x;
                    var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
                    var bodySize = this.content.getSize();
                    var position = el.retrieve("position");
                    var initialHeight = el.retrieve("initialHeight").toFloat();
                    var dy = position.y.toFloat()-y.toFloat();

                    var height = initialHeight+dy;
                    if (height> bodySize.y/1.5) height =  bodySize.y/1.5;
                    if (height<40) height = 40;

                    var percent = 1-(height/bodySize.y);
                    this.resizeNode(percent);

                    //var formNodeHeight = bodySize.y-height;
                    //this.formNode.setStyle("height", ""+formNodeHeight+"px");
                    //this.propertyNode.setStyle("height", ""+height+"px");
                }.bind(this)
            });
        }else{
            this.propertyResizeBottom.attach();
        }
    },
    loadPropertyResize: function(){
//		var size = this.propertyNode.getSize();
//		var position = this.propertyResizeBar.getPosition();
        this.propertyResize = new Drag(this.propertyResizeBar,{
            "snap": 1,
            "onStart": function(el, e){
                var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
                var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
                el.store("position", {"x": x, "y": y});

                var size = this.propertyNode.getSize();
                el.store("initialWidth", size.x);
            }.bind(this),
            "onDrag": function(el, e){
                var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
//				var y = e.event.y;
                var bodySize = this.content.getSize();
                var position = el.retrieve("position");
                var initialWidth = el.retrieve("initialWidth").toFloat();
                var dx = position.x.toFloat()-x.toFloat();

                var width = initialWidth+dx;
                if (width> bodySize.x/2) width =  bodySize.x/2;
                if (width<40) width = 40;
                this.formNode.setStyle("margin-right", width+1);
                this.propertyNode.setStyle("width", width);
            }.bind(this)
        });
    },
    propertyResizeDragTopBottom: function(el, e){
        var size = this.propertyContentNode.getSize();

        //			var x = e.event.x;
        var y = e.event.y;
        var position = el.retrieve("position");
        var dy = y.toFloat()-position.y.toFloat();

        var initialHeight = el.retrieve("initialHeight").toFloat();
        var height = initialHeight+dy;
        if (height<40) height = 40;
        if (height> size.y-40) height = size.y-40;

        this.propertyDomPercent = height/size.y;

        this.setPropertyContentResize();
    },
    propertyResizeDragLeftRight: function(el, e){
        var size = this.propertyContentNode.getSize();
        var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
        //var y = e.event.y;
        var position = el.retrieve("position");
        var dx = x.toFloat()-position.x.toFloat();

        var initialWidth = el.retrieve("initialWidth").toFloat();
        var width = initialWidth+dx;
        if (width<40) width = 40;
        if (width> size.x-40) width = size.x-40;

        this.propertyDomPercent = width/size.x;

        this.setPropertyContentResizeBottom();
    },
    loadPropertyContentResize: function(){
        this.propertyContentResize = new Drag(this.propertyContentResizeNode, {
            "snap": 1,
            "onStart": function(el, e){
                var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
                var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
                el.store("position", {"x": x, "y": y});

                var size = this.propertyDomContentArea.getSize();
                el.store("initialHeight", size.y);
                el.store("initialWidth", size.x);
            }.bind(this),
            "onDrag": function(el, e){
                if (this.options.style=="bottom"){
                    this.propertyResizeDragLeftRight(el, e);
                }else{
                    this.propertyResizeDragTopBottom(el, e);
                }
            }.bind(this)
        });
    },
    setPropertyContentResizeBottom: function(){
        var size = this.propertyContentNode.getSize();
        var resizeNodeSize = this.propertyContentResizeNode.getSize();
        var width = size.x-resizeNodeSize.x-6;

        var domWidth = this.propertyDomPercent*width;
        var contentMargin = domWidth+resizeNodeSize.x+6;

        this.propertyDomContentArea.setStyle("width", ""+domWidth+"px");
        this.propertyContentArea.setStyle("margin-left", ""+contentMargin+"px");
    },
    setPropertyContentResize: function(){
        var size = this.propertyContentNode.getSize();
        var resizeNodeSize = this.propertyContentResizeNode.getSize();
        var height = size.y-resizeNodeSize.y;

        var domHeight = this.propertyDomPercent*height;
        var contentHeight = height-domHeight;

        this.propertyDomContentArea.setStyle("height", ""+domHeight+"px");
        this.propertyDomScrollArea.setStyle("height", ""+domHeight+"px");
        this.propertyContentArea.setStyle("height", ""+contentHeight+"px");

        if (this.form){
            if (this.form.currentSelectedModule){
                if (this.form.currentSelectedModule.property){
                    var tab = this.form.currentSelectedModule.property.propertyTab;
                    if (tab){
                        var tabTitleSize = tab.tabNodeContainer.getSize();

                        tab.pages.each(function(page){
                            var topMargin = page.contentNodeArea.getStyle("margin-top").toFloat();
                            var bottomMargin = page.contentNodeArea.getStyle("margin-bottom").toFloat();

                            var tabContentNodeAreaHeight = contentHeight - topMargin - bottomMargin - tabTitleSize.y.toFloat()-15;
                            page.contentNodeArea.setStyle("height", tabContentNodeAreaHeight);
                        }.bind(this));

                    }
                }
            }
        }
    },

    //loadTools------------------------------
    loadTools: function(callback){
        o2.loadCss("../o2_lib/vue/element/index.css");
        this.getToolResource(function(){
            this.toolsGroupData.forEach(function(o){
                //var o = this.toolsGroupData[key];
                this.toolGroups.push(new MWF.xApplication.cms.FormDesigner.ToolsGroup(o, this, o.name === this.currentUserDefaultTool));
            }, this);

            if (callback) callback();
        }.bind(this));
    },
    getToolResource: function(callback){
	    var check = function () {
	        var list = this.toolsGroupData.filter(function(o){
                return o.name === this.currentUserDefaultTool
            }.bind(this));
	        if( list.length < 1 )this.currentUserDefaultTool = "default";
            callback();
        }.bind(this);
	    this.getGroups(function(){
            if(this.toolsGroupData && this.currentUserDefaultTool )check();
        }.bind(this));
        this.getDefaultTool(function(){
            if(this.toolsGroupData && this.currentUserDefaultTool )check();
        }.bind(this));
    },
    getGroups: function(callback){
        if (this.toolsGroupData){
            if (callback) callback();
        }else{
            var toolsGroupDataUrl = this.path+this.options.style+"/toolsGroup.json";
            o2.JSON.get(toolsGroupDataUrl, function(responseJSON){
                this.toolsGroupData = responseJSON;
                if (callback) callback();
            }.bind(this));
        }
    },
    getDefaultTool: function(callback){
	    if( typeOf(this.currentUserDefaultTool) === "string" ){
            if (callback) callback();
        }else{
            o2.UD.getDataJson("cmsTools", function (json) {
                this.currentUserDefaultTool = (json && json.defaultTool) || "default";
                if (callback) callback();
            }.bind(this));
        }
    },
    setDefaultTool: function(defaultTools, callback){
        o2.UD.getDataJson("cmsTools", function (json) {
            if(!json)json = {};
            json.defaultTool = defaultTools;
            o2.UD.putData("cmsTools", json, function () {
                if (callback) callback();
            }.bind(this));
        }.bind(this));
    },

    //resizeNode------------------------------------------------
    resizeNodeLeftRight: function(){
        var nodeSize = this.node.getSize();
        this.toolbarNode.setStyle("height", ""+nodeSize.y+"px");
        this.formNode.setStyle("height", ""+nodeSize.y+"px");
        this.propertyNode.setStyle("height", ""+nodeSize.y+"px");
        //nodeSize = {"x": nodeSize.x, "y": nodeSize.y*0.6};

        var formToolbarMarginTop = this.formToolbarNode.getStyle("margin-top").toFloat();
        var formToolbarMarginBottom = this.formToolbarNode.getStyle("margin-bottom").toFloat();
        var allFormToolberSize = this.formToolbarNode.getComputedSize();
        var y = nodeSize.y - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom;
        this.formContentNode.setStyle("height", ""+y+"px");

        var tabSize = this.designTab.tabNodeContainer.getComputedSize();
        var tabMarginTop = this.designTab.tabNodeContainer.getStyle("margin-top").toFloat();
        var tabMarginBottom = this.designTab.tabNodeContainer.getStyle("margin-bottom").toFloat();
        y = y-tabSize.totalHeight-tabMarginTop-tabMarginBottom;
        this.designTab.contentNodeContainer.setStyle("height", ""+y+"px");

        if (this.designNode){
            var designMarginTop = this.designNode.getStyle("margin-top").toFloat();
            var designMarginBottom = this.designNode.getStyle("margin-bottom").toFloat();
            //y = nodeSize.y - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom - designMarginTop - designMarginBottom;
            y = y - designMarginTop - designMarginBottom;
            this.designNode.setStyle("height", ""+y+"px");
        }


        var titleSize = this.toolbarTitleNode.getSize();
        var titleMarginTop = this.toolbarTitleNode.getStyle("margin-top").toFloat();
        var titleMarginBottom = this.toolbarTitleNode.getStyle("margin-bottom").toFloat();
        var titlePaddingTop = this.toolbarTitleNode.getStyle("padding-top").toFloat();
        var titlePaddingBottom = this.toolbarTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = nodeSize.y-y;
        //this.toolbarContentNode.setStyle("height", ""+y+"px");
        this.toolbarGroupContentNode.setStyle("height", ""+y+"px");
        var groupHeight = 0;
        // this.toolGroups.each(function(g){
        //     groupHeight += g.toolbarGroupTitleNode.getSize().y;
        // });
        var contentHeight = y-groupHeight-5;
        this.toolGroups.each(function(g){
            g.setContentHeight(contentHeight);
            //g.toolbarContentNode.setStyle("height", ""+contentHeight+"px");
        });


        titleSize = this.propertyTitleNode.getSize();
        titleMarginTop = this.propertyTitleNode.getStyle("margin-top").toFloat();
        titleMarginBottom = this.propertyTitleNode.getStyle("margin-bottom").toFloat();
        titlePaddingTop = this.propertyTitleNode.getStyle("padding-top").toFloat();
        titlePaddingBottom = this.propertyTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = nodeSize.y-y;
        this.propertyContentNode.setStyle("height", ""+y+"px");
        this.propertyResizeBar.setStyle("height", ""+y+"px");
    },
    resizeNodeTopBottom: function(percent){
        var nodeSize = this.node.getSize();
        this.toolbarNode.setStyle("height", ""+nodeSize.y+"px");

        var percentNumber = percent || 0.6;
        var designerHeight = nodeSize.y*percentNumber;
        var propertyHeight = nodeSize.y - designerHeight;

        this.formNode.setStyle("height", ""+designerHeight+"px");
        this.propertyNode.setStyle("height", ""+propertyHeight+"px");

        var formToolbarMarginTop = this.formToolbarNode.getStyle("margin-top").toFloat();
        var formToolbarMarginBottom = this.formToolbarNode.getStyle("margin-bottom").toFloat();
        var allFormToolberSize = this.formToolbarNode.getComputedSize();
        var y = designerHeight - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom;
        //    this.formContentNode.setStyle("height", ""+designerHeight+"px");

        var tabSize = this.designTab.tabNodeContainer.getComputedSize();
        var tabMarginTop = this.designTab.tabNodeContainer.getStyle("margin-top").toFloat();
        var tabMarginBottom = this.designTab.tabNodeContainer.getStyle("margin-bottom").toFloat();
        y = y-tabSize.totalHeight-tabMarginTop-tabMarginBottom;
        this.designTab.contentNodeContainer.setStyle("height", ""+y+"px");

        if (this.designNode){
            var designMarginTop = this.designNode.getStyle("margin-top").toFloat();
            var designMarginBottom = this.designNode.getStyle("margin-bottom").toFloat();
            //y = designerHeight - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom - designMarginTop - designMarginBottom;
            y = y - designMarginTop - designMarginBottom;
            this.designNode.setStyle("height", ""+y+"px");
        }

        var titleSize = this.toolbarTitleNode.getSize();
        var titleMarginTop = this.toolbarTitleNode.getStyle("margin-top").toFloat();
        var titleMarginBottom = this.toolbarTitleNode.getStyle("margin-bottom").toFloat();
        var titlePaddingTop = this.toolbarTitleNode.getStyle("padding-top").toFloat();
        var titlePaddingBottom = this.toolbarTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = nodeSize.y-y;
        //this.toolbarContentNode.setStyle("height", ""+y+"px");
        this.toolbarGroupContentNode.setStyle("height", ""+y+"px");
        var groupHeight = 0;
        // this.toolGroups.each(function(g){
        //     groupHeight += g.toolbarGroupTitleNode.getSize().y;
        // });
        var contentHeight = y-groupHeight-5;
        this.toolGroups.each(function(g){
            g.setContentHeight(contentHeight);
        });



        titleSize = this.propertyTitleNode.getSize();
        titleMarginTop = this.propertyTitleNode.getStyle("margin-top").toFloat();
        titleMarginBottom = this.propertyTitleNode.getStyle("margin-bottom").toFloat();
        titlePaddingTop = this.propertyTitleNode.getStyle("padding-top").toFloat();
        titlePaddingBottom = this.propertyTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = propertyHeight-y;
        this.propertyContentNode.setStyle("height", ""+y+"px");
        this.propertyResizeBar.setStyle("height", ""+y+"px");

        this.propertyDomContentArea.setStyle("height", ""+y+"px");
        this.propertyDomScrollArea.setStyle("height", ""+y+"px");

        this.propertyContentResizeNode.setStyle("height", ""+y+"px");
        this.propertyContentArea.setStyle("height", ""+y+"px");

        if (this.form){
            if (this.form.currentSelectedModule){
                if (this.form.currentSelectedModule.property){
                    var tab = this.form.currentSelectedModule.property.propertyTab;
                    if (tab){
                        var tabTitleSize = tab.tabNodeContainer.getSize();

                        tab.pages.each(function(page){
                            var topMargin = page.contentNodeArea.getStyle("margin-top").toFloat();
                            var bottomMargin = page.contentNodeArea.getStyle("margin-bottom").toFloat();

                            var tabContentNodeAreaHeight = y - topMargin - bottomMargin - tabTitleSize.y.toFloat()-15;
                            page.contentNodeArea.setStyle("height", tabContentNodeAreaHeight);
                        }.bind(this));

                    }
                }
            }
        }

    },

    resizeNode: function(percent){
        if (this.options.style=="bottom"){
            this.resizeNodeTopBottom(percent);
            this.setPropertyContentResizeBottom();
        }else{
            this.resizeNodeLeftRight(percent);
            this.setPropertyContentResize();
        }
    },

    //loadForm------------------------------------------
    loadForm: function(){

//		try{
        this.getFormData(function(){
            this.pcForm = new MWF.CMSFCForm(this, this.designNode);
            this.pcForm.load(this.formData);

            this.form = this.pcForm;
        }.bind(this));

//		}catch(e){
//			layout.notice("error", {x: "right", y:"top"}, e.message, this.designNode);
//		}


//		MWF.getJSON(COMMON.contentPath+"/res/js/testform.json", {
//			"onSuccess": function(obj){
//				this.form = new MWF.FCForm(this);
//				this.form.load(obj);
//			}.bind(this),
//			"onerror": function(text){
//				layout.notice("error", {x: "right", y:"top"}, text, this.designNode);
//			}.bind(this),
//			"onRequestFailure": function(xhr){
//				layout.notice("error", {x: "right", y:"top"}, xhr.responseText, this.designNode);
//			}
//		});
    },
    getFormData: function(callback){
        if (!this.options.id){
            if (this.options.templateId){
                this.loadNewFormDataFormTemplate(callback);
            }else{
                this.loadNewFormData(callback);
            }
        }else{
            this.loadFormData(callback);
        }
    },
    loadNewFormData: function(callback){
        var url = "../x_component_cms_FormDesigner/Module/Form/template/"+this.options.template;
        //MWF.getJSON("../x_component_process_FormDesigner/Module/Form/template.json", {
        MWF.getJSON(url, {
            "onSuccess": function(obj){
                this.formData = obj.pcData;
                this.formData.id="";
                this.formData.isNewForm = true;

                this.formMobileData = obj.mobileData;
                this.formMobileData.id="";
                this.formMobileData.isNewForm = true;
                if (callback) callback();
            }.bind(this),
            "onerror": function(text){
                this.notice(text, "error");
            }.bind(this),
            "onRequestFailure": function(xhr){
                this.notice(xhr.responseText, "error");
            }.bind(this)
        });
    },
    loadNewFormDataFormTemplate: function(callback){
        this.actions.getFormTemplate(this.options.templateId, function(form){
            if (form){

                this.formData = JSON.decode(MWF.decodeJsonString(form.data.data));
                this.formData.isNewForm = true;
                this.formData.json.id = "";

                if (form.data.mobileData){
                    this.formMobileData = JSON.decode(MWF.decodeJsonString(form.data.mobileData));
                    this.formMobileData.isNewForm = true;
                    this.formMobileData.json.id = "";
                }else{
                    this.formMobileData = Object.clone(this.formData);
                }

                if (callback) callback();

                //this.actions.getFormCategory(this.formData.json.formCategory, function(category){
                //	this.category = {"data": {"name": category.data.name, "id": category.data.id}};
                //	if (callback) callback();
                //}.bind(this));
            }
        }.bind(this));
    },
    loadFormData: function(callback){
        this.actions.getForm(this.options.id, function(form){
            if (form){
			    var formTemplete = null;
                MWF.getJSON("../x_component_cms_FormDesigner/Module/Form/template/form.json", {
                    "onSuccess": function(obj){ formTemplete = obj; }.bind(this)
                }, false);

                this.formData = JSON.decode(MWF.decodeJsonString(form.data.data));
                if (formTemplete.pcData){
				    Object.merge(formTemplete.pcData, this.formData);
                    Object.merge(this.formData, formTemplete.pcData);
                }
                this.formData.isNewForm = false;
                this.formData.json.id = form.data.id;

                if (form.data.mobileData){
                    this.formMobileData = JSON.decode(MWF.decodeJsonString(form.data.mobileData));

                    if (formTemplete.mobileData){
                        Object.merge(formTemplete.mobileData, this.formMobileData);
                        Object.merge(this.formMobileData, formTemplete.mobileData);
                    }

                    this.formMobileData.isNewForm = false;
                    this.formMobileData.json.id = form.data.id;
                }else{
                    this.formMobileData = Object.clone(this.formData);
                }


                this.setTitle(this.options.appTitle + "-"+this.formData.json.name);
                if(this.taskitem)this.taskitem.setText(this.options.appTitle + "-"+this.formData.json.name);
                this.options.appTitle = this.options.appTitle + "-"+this.formData.json.name;

                if (!this.application){
                    this.actions.getColumn(form.data.appId, function(json){
                        this.application = {"name": json.data.appName, "id": json.data.id};
                        if (callback) callback();
                    }.bind(this));
                }else{
                    if (callback) callback();
                }

                //this.actions.getFormCategory(this.formData.json.formCategory, function(category){
                //	this.category = {"data": {"name": category.data.name, "id": category.data.id}};
                //	if (callback) callback();
                //}.bind(this));
            }
        }.bind(this));
    },
    getFieldList: function(){
        //fieldTypes = ["calender", "checkbox", "datagrid", "htmledit", "number", "personfield", "radio", "select", "textarea", "textfield"];
        dataTypes = {
            "string": ["htmledit", "radio", "select", "textarea", "textfield"],
            "person": ["personfield", "readerfield","authorfield", "org", "reader","author"],
            "date": ["calender"],
            "number": ["number"],
            "array": ["checkbox"]
        };
        fieldList = [];
        this.pcForm.moduleList.each(function(moudle){
            var key = "";
            for (k in dataTypes){
                if (dataTypes[k].indexOf(moudle.moduleName.toLowerCase())!=-1){
                    key = k;
                    break;
                }
            }
            if (key){
                fieldList.push({
                    "name": moudle.json.id,
                    "dataType": key
                });
            }
        }.bind(this));
        return fieldList;
    },
    checkSubform: function(){
        var pcSubforms = [];
        if (this.pcForm){
            this.pcForm.data.json.subformList = [];
            this.pcForm.moduleList.each(function(module){
                if (module.moduleName==="subform"){
                    if (module.json.subformSelected && module.json.subformSelected!=="none" && module.json.subformType!=="script"){
                        if (this.pcForm.data.json.subformList.indexOf(module.json.subformSelected) === -1) this.pcForm.data.json.subformList.push(module.json.subformSelected);
                    }
                    if (module.regetSubformData()){
                        module.subformData.updateTime = "";
                        var moduleNames = module.getConflictFields();
                        if (moduleNames.length){
                            var o = {
                                "id": module.json.id,
                                "fields": moduleNames
                            };
                            pcSubforms.push(o);
                        }
                    }

                }
            }.bind(this));
        }
        var mobileSubforms = [];
        if (this.mobileForm){
            this.mobileForm.data.json.subformList = [];
            this.mobileForm.moduleList.each(function(module){
                if (module.moduleName==="subform"){
                    if (module.json.subformSelected && module.json.subformSelected!=="none" && module.json.subformType!=="script"){
                        if (this.mobileForm.data.json.subformList.indexOf(module.json.subformSelected) === -1) this.mobileForm.data.json.subformList.push(module.json.subformSelected);
                    }
                    if (module.regetSubformData()){
                        module.subformData.updateTime = "";
                        var moduleNames = module.getConflictFields();
                        if (moduleNames.length){
                            var o = {
                                "id": module.json.id,
                                "fields": moduleNames
                            };
                            mobileSubforms.push(o);
                        }
                    }
                }
            }.bind(this));
        }
        var txt = "";
        if (pcSubforms.length){
            var pctxt = "";
            pcSubforms.each(function(subform){
                pctxt += subform.id+" ( "+subform.fields.join(", ")+" ) <br>";
            });
            txt += this.lp.checkSubformPcInfor.replace("{subform}", pctxt);
        }
        if (mobileSubforms.length){
            var mobiletxt = "";
            mobileSubforms.each(function(subform){
                mobiletxt += subform.id+" ( "+subform.fields.join(", ")+" ) <br>";
            });
            txt += this.lp.checkSubformMobileInfor.replace("{subform}", mobiletxt);
        }
        return txt;
    },
    saveForm: function(){
        debugger;
        if (!this.isSave){
            var txt = this.checkSubform();
            if (txt){
                txt = this.lp.checkFormSaveError+txt;
                this.notice(txt, "error", this.form.node);
                return false;
            }

            var pcData, mobileData;
            if (this.pcForm){
                pcData = this.pcForm._getFormData();
                // pcData = this.pcForm.data;
            }
            if (this.mobileForm){
                mobileData = this.mobileForm._getFormData();
                // mobileData = this.mobileForm.data;
            }else{
                if (this.formMobileData) mobileData = this.formMobileData;
            }

            this.isSave = true;
            var fieldList = this.getFieldList();
            //this.actions.saveForm(pcData, mobileData, fieldList, function(responseJSON){  modify by cxy
            this.actions.saveForm(pcData, mobileData, fieldList, function(responseJSON){
                this.notice(MWF.APPFD.LP.notice["save_success"], "ok", null, {x: "left", y:"bottom"});
                if (!this.pcForm.json.name) this.pcForm.treeNode.setText("<"+this.json.type+"> "+this.json.id);
                this.pcForm.treeNode.setTitle(this.pcForm.json.id);
                this.pcForm.node.set("id", this.pcForm.json.id);

                if (this.mobileForm){
                    if (!this.mobileForm.json.name) this.mobileForm.treeNode.setText("<"+this.mobileForm.json.type+"> "+this.mobileForm.json.id);
                    this.mobileForm.treeNode.setTitle(this.mobileForm.json.id);
                    this.mobileForm.node.set("id", this.mobileForm.json.id+"_"+this.options.mode);
                }

                var name = this.pcForm.json.name;
                if (this.pcForm.data.isNewForm) this.setTitle(this.options.appTitle + "-"+name);
                this.pcForm.data.isNewForm = false;
                if (this.mobileForm) this.mobileForm.data.isNewForm = false;

                this.options.desktopReload = true;
                this.options.id = this.pcForm.json.id;

                //this.fireAppEvent("postSave"); //add by cxy
                if (this.pcForm) this.pcForm.fireEvent("postSave");
                if (this.mobileForm) this.mobileForm.fireEvent("postSave");
                this.fireEvent("postSave");

                this.isSave = false;

            }.bind(this), function(xhr, text, error){
                this.isSave = false;

                if (this.pcForm) this.pcForm.fireEvent("postSaveError");
                if (this.mobileForm) this.mobileForm.fireEvent("postSaveError");

                var errorText = error+":"+text;
                if (xhr) errorText = xhr.responseText;
                MWF.xDesktop.notice("error", {x: "right", y:"top"}, "request json error: "+errorText);
            }.bind(this));
        }else{
            MWF.xDesktop.notice("info", {x: "right", y:"top"}, this.lp.isSave);
        }

        //this.form.save(function(){
        //
        //	var name = this.form.json.name;
        //	if (this.form.data.isNewForm) this.setTitle(this.options.appTitle + "-"+name);
        //	this.form.data.isNewForm = false;
        //	this.options.desktopReload = true;
        //	this.options.id = this.form.json.id;
        //}.bind(this));
    },
    previewForm: function(){
        this.form.preview();
    },
    formExplode: function(){
        this.form.explode();
    },
    formImplode: function(){
        this.form.implode();
    },
    htmlImplode: function(){
        this.form.implodeHTML();
    },
    officeImplode: function(){
        this.form.implodeOffice();
    },
    recordStatus: function(){
        return {"id": this.options.id};
    },
    clearNoDomModule: function(){
	    var _self = this;
        this.confirm("warn", new Event(),  MWF.APPFD.LP.clearNoDomModuleTitle, MWF.APPFD.LP.clearNoDomModuleContent, 460, 120, function(){
            _self.form._clearNoDomModule();
            this.close();
        }, function(){
            this.close();
        });
    },
    onPostClose: function(){
        if (this.pcForm){
            MWF.release(this.pcForm.moduleList);
            MWF.release(this.pcForm.moduleNodeList);
            MWF.release(this.pcForm.moduleContainerNodeList);
            MWF.release(this.pcForm.moduleElementNodeList);
            MWF.release(this.pcForm.moduleComponentNodeList);
            MWF.release(this.pcForm);
        }
        if (this.mobileForm){
            MWF.release(this.mobileForm.moduleList);
            MWF.release(this.mobileForm.moduleNodeList);
            MWF.release(this.mobileForm.moduleContainerNodeList);
            MWF.release(this.mobileForm.moduleElementNodeList);
            MWF.release(this.mobileForm.moduleComponentNodeList);
            MWF.release(this.mobileForm);
        }
    },
    setTemplateFormNode: function(formNode){
        var html = "<table align=\"center\" width=\"100%\" height=\"90%\" border=\"0\" cellPadding=\"0\" cellSpacing=\"0\">" +
            "<tr><td colSpan=\"2\" style=\"height: 50px; line-height: 60px; text-align: center; font-size: 24px; font-weight: bold\">" +
            this.lp.saveTemplate+"</td></tr>" +

            "<tr><td style=\"height: 40px;\" width=\"80px\">" +this.lp.templateName+"</td><td>"+
            "<input value=\""+this.pcForm.json.name+"\" type=\"text\" style=\"width: 98%; height: 22px; border: 1px solid #cccccc\"/>"+"</td></tr>" +

            "<tr><td style=\"height: 40px;\">" +this.lp.templateCategory+"</td><td>"+
            "<select style=\"width: 30%; height: 24px; border: 1px solid #cccccc\"></select>"+
            "<input type=\"text\" style=\"width: 68%; height: 22px; border: 1px solid #cccccc\"/>"+"</td></tr>" +

            "<tr><td style=\"height: 40px;\">" +this.lp.templateDescription+"</td><td>"+
            "<textarea type=\"text\" style=\"width: 98%; height: 44px; border: 1px solid #cccccc\">"+this.pcForm.json.description+"</textarea>"+"</td></tr>" +

            "<tr><td colSpan=\"2\" id=\"form_templatePreview\">" +
            "<div style=\"position: relative; width: 180px; height: 180px; margin: 20px auto 0px auto;  overflow: hidden\"></div>" +
            "</td></tr>" +
            "</table>";

        formNode.set("html", html);
        var tds = formNode.getElements("td");
        var iconNode = tds[tds.length-1].getFirst();
        var previewNode = this.pcForm.node.clone();
        previewNode.setStyles({
            "transform-origin": "0px 0px",
            "transform": "scale(0.15,0.15)",
            "position": "absolute",
            "top": "0px",
            "left": "0px"
        }).inject(iconNode);
        return iconNode;
    },
    setCategorySelect: function(categorySelect){
        if (categorySelect){
            new Element("option", {"value": "$newCategory","text": this.lp.newCategory}).inject(categorySelect);
            this.actions.listFormTemplateCategory(function(json){
                json.data.each(function(category){
                    new Element("option", {"value": category.name,"text": category.name}).inject(categorySelect);
                }.bind(this));
            }.bind(this));
        }
    },
    setTemplateActions: function(markNode, areaNode, formNode, iconNode, nameNode, categorySelect, newCategoryNode, descriptionNode){
        var actionAreaNode= new Element("div", {
            "styles": this.css.templateActionNode
        }).inject(formNode);

        var cancelActionNode = new Element("div", {
            "styles": this.css.templateCancelActionNode,
            "text": this.lp.cancel,
            "events":{
                "click": function(){
                    markNode.destroy();
                    areaNode.destroy();
                }
            }
        }).inject(actionAreaNode);
        var saveActionNode = new Element("div", {
            "styles": this.css.templateSaveActionNode,
            "text": this.lp.save,
            "events":{
                "click": function(){
                    this.saveTemplate(markNode, areaNode, iconNode, nameNode, categorySelect, newCategoryNode, descriptionNode);
                }.bind(this)
            }
        }).inject(actionAreaNode);
    },
    saveTemplate: function(markNode, areaNode, iconNode, nameNode, categorySelect, newCategoryNode, descriptionNode){
        var pcData, mobileData;
        if (this.pcForm){
            pcData = this.pcForm._getFormData();
            //pcData = this.pcForm.data;
        }
        if (this.mobileForm){
            mobileData = this.mobileForm._getFormData();
            //mobileData = this.mobileForm.data;
        }

        var name = nameNode.get("value");
        var category = (categorySelect.options[categorySelect.selectedIndex].value=="$newCategory") ? newCategoryNode.get("value") : categorySelect.options[categorySelect.selectedIndex].value;
        var description = descriptionNode.get("value");
        if (!name){
            this.notice(MWF.APPFD.LP.notice["saveTemplate_inputName"], "error", nameNode, {x: "left", y:"top"});
            return false;
        }
        if (categorySelect.options[categorySelect.selectedIndex].value=="$newCategory" && !newCategoryNode.get("value")){
            this.notice(MWF.APPFD.LP.notice["saveTemplate_inputCategory"], "error", categorySelect, {x: "left", y:"top"});
            return false;
        }
        //var tds = formNode.getElements("td");
        //var iconNode = tds[tds.length-1].getFirst();

        var data = {
            "name": name,
            "category": category,
            "description": description,
            "outline": iconNode.get("html")
        };
        this.actions.addFormTemplate(pcData, mobileData, data, function(){
            this.notice(MWF.APPFD.LP.notice["saveTemplate_success"], "ok", null, {x: "left", y:"bottom"});
            markNode.destroy();
            areaNode.destroy();
        }.bind(this), function(xhr, text, error){
            var errorText = error+":"+text;
            if (xhr) errorText = xhr.responseText;
            MWF.xDesktop.notice("error", {x: "right", y:"top"}, "request json error: "+errorText);
        });
    },
    createTemplateSaveNode: function(){
        var markNode = new Element("div", {
            "styles": this.css.templateMarkNode,
            "events": {
                "mouseover": function(e){e.stopPropagation();},
                "mouseout": function(e){e.stopPropagation();}
            }
        }).inject(this.content);

        var areaNode = new Element("div", {
            "styles": this.css.templateAreaNode
        }).inject(this.content);

        var createNode = new Element("div", {
            "styles": this.css.templateInfoNode
        }).inject(areaNode);

        var formNode = new Element("div", {
            "styles": this.css.templateFormNode
        }).inject(createNode);

        var iconNode = this.setTemplateFormNode(formNode);

        var nodes = formNode.getElements("input");
        var nameNode = nodes[0];
        var newCategoryNode = nodes[1];
        var descriptionNode = formNode.getElement("textarea");
        var categorySelect = formNode.getElement("select");

        this.setCategorySelect(categorySelect);

        this.setTemplateActions(markNode, areaNode, formNode, iconNode, nameNode, categorySelect, newCategoryNode, descriptionNode);
    },
    saveFormAsTemplate: function(){
        if (!this.isSave){
            this.createTemplateSaveNode();
        }else{
            MWF.xDesktop.notice("info", {x: "right", y:"top"}, this.lp.isSave);
        }
    },
    styleBrush: function(status, bt){
        if (status==="on"){
            var module = this.form.currentSelectedModule;
            if (module && module.json.type!=="Form"){
                this.form.brushStyle = module.json.styles;
                if (module.json.inputStyles) this.form.brushInputStyle = Object.clone(module.json.inputStyles);
                this.brushCursor = new Element("div", {"styles": {
                    "position": "absolute",
                    "width": "16px",
                    "height": "16px",
                    "z-index": 20000,
                    "background": "url("+this.path+this.options.style+"/pageToolbar/wand.png)"
                }}).inject(this.content);
                this.brushCursorMoveFun = this.brushCursorMove.bind(this);
                this.contentPosition = this.content.getPosition();
                this.content.addEvent("mousemove", this.brushCursorMoveFun);

                //this.designNode.setStyle("cursor", "url(/"+this.path+this.options.style+"/pageToolbar/brush.png)");
            }else{
                bt.off();
            }
        }else{
            this.form.brushStyle = null;
            this.form.brushInputStyle = null;
            if (this.brushCursorMoveFun) this.content.removeEvent("mousemove", this.brushCursorMoveFun);
            if (this.brushCursor){
                this.brushCursor.destroy();
                this.brushCursor = null;
            }
        }
    },
    brushCursorMove: function(e){
        if (this.brushCursor){
            var x = e.page.x-this.contentPosition.x+10;
            var y = e.page.y-this.contentPosition.y+10;
            this.brushCursor.setStyles({
                "left": ""+x+"px",
                "top": ""+y+"px"
            });
        }
    }
});

MWF.xApplication.cms.FormDesigner.ToolsGroup = new Class({
    Implements: [Events],

    initialize: function(data, app, showing){
        this.data = data;
        this.app = app;
        this.css = this.app.css;
        this.tools = [];
        this.showing = showing;
        this.load();
    },
    load: function(){
        this.toolbarGroupNode = new Element("div", {
            "styles": this.css.toolbarGroupNode,
        }).inject(this.app.toolbarGroupContentNode);

        // this.toolbarGroupTitleNode = new Element("div", {
        //     "class": "mainColor_bg",
        //     "styles": this.css.toolbarGroupTitleNode,
        //     "text": this.data.text,
        //     "events": {
        //         "click": this.show.bind(this)
        //     }
        // }).inject(this.toolbarGroupNode);

        this.toolbarContentNode = new Element("div", {
            "styles": this.css.toolbarContentNode,
        }).inject(this.toolbarGroupNode);

        this.loadTools();

        if (this.toolbarContentNode){
            this.app.setScrollBar(this.toolbarContentNode, null, {
                "V": {"x": 0, "y": 0},
                "H": {"x": 0, "y": 0}
            }, function(scrollBar){
                this.scrollBar = scrollBar;
            }.bind(this));
        }

        this.toolbarContentNode.setStyle("height", "0px");
        this.toolbarContentNode.hide();




        var memuItem = this.app.categoryActionMenu.addMenuItem(this.data.text, "click", function(){this.show();}.bind(this));
        //memuItem.styleName = style.style;
        // var imgDiv = memuItem.item.getFirst();
        // var imgNode = new Element("div", {"styles": memuItem.menu.css.menuItemImg}).inject(imgDiv);
        // imgNode.setStyle("background-color", color);
    },
    setContentHeight: function(height){
        this.height = height;
        if (this.isShow){
            this.toolbarContentNode.setStyle("height", ""+this.height+"px");
        }
    },
    show: function( notSetDefault ){
        if (this.app.currentToolGroup != this){
            if (this.app.currentToolGroup) this.app.currentToolGroup.hide();
            // if (!this.morph){
            //     this.morph = new Fx.Morph(this.toolbarContentNode, {
            //         "duration": "100",
            //         transition: Fx.Transitions.Sine.easeOut
            //     });
            // }
            // this.toolbarContentNode.show();
            // this.morph.start({"height": [0, this.height]}).chain(function(){
            //     if (this.scrollBar && this.scrollBar.scrollVAreaNode) this.scrollBar.scrollVAreaNode.show();
            //     this.app.currentToolGroup = this;
            //     this.isShow = true;
            // }.bind(this));
            this.toolbarContentNode.show();
            this.toolbarContentNode.setStyle("height", this.height);
            if (this.scrollBar && this.scrollBar.scrollVAreaNode) this.scrollBar.scrollVAreaNode.show();
            this.app.currentToolGroup = this;
            this.isShow = true;

            if (this.app.toolbarMode=="all") this.app.toolbarTitleNode.set("text", this.data.text);
            if(!notSetDefault)this.app.setDefaultTool( this.data.name );
        }
    },
    hide: function(){
        if (this.app.currentToolGroup==this) this.app.currentToolGroup = null;
        // if (!this.morph){
        //     this.morph = new Fx.Morph(this.toolbarContentNode, {
        //         "duration": "100",
        //         transition: Fx.Transitions.Sine.easeOut
        //     });
        // }
        // this.isShow = false;
        // if (this.scrollBar && this.scrollBar.scrollVAreaNode) this.scrollBar.scrollVAreaNode.hide();
        // this.morph.start({
        //     "height": [this.height, 0]
        // }).chain(function(){
        //     this.toolbarContentNode.hide();
        // }.bind(this));

        this.toolbarContentNode.hide();
        if (this.scrollBar && this.scrollBar.scrollVAreaNode) this.scrollBar.scrollVAreaNode.hide();
        this.isShow = false;
    },

    loadTools: function(){
        var designer = this.app;
        var group = this;
        this.getTools(function(){
            Object.each(this.toolsData, function(value, key){
                var toolNode = new Element("div", {
                    "styles": this.css.toolbarToolNode,
                    "title": value.text,
                    "events": {
                        "mouseover": function(e){
                            try {
                                this.setStyles(designer.css.toolbarToolNodeOver);
                            }catch(e){
                                this.setStyles(designer.css.toolbarToolNodeOverCSS2);
                            };
                        },
                        "mouseout": function(e){
                            try {
                                this.setStyles(designer.css.toolbarToolNode);
                            }catch(e){};
                        },
                        "mousedown": function(e){
                            try {
                                this.setStyles(designer.css.toolbarToolNodeDown);
                            }catch(e){
                                this.setStyles(designer.css.toolbarToolNodeDownCSS2);
                            };
                        },
                        "mouseup": function(e){
                            try {
                                this.setStyles(designer.css.toolbarToolNodeUp);
                            }catch(e){
                                this.setStyles(designer.css.toolbarToolNodeUpCSS2);
                            };
                        }
                    }
                }).inject(this.toolbarContentNode);
                toolNode.store("toolClass", value.className);

                var iconNode = new Element("div", {
                    "styles": this.css.toolbarToolIconNode
                }).inject(toolNode);
                if (value.icon) iconNode.setStyle("background-image", "url("+this.app.path+this.app.options.style+"/icon/"+value.icon+")");
                if (value.fontIcon){
                    iconNode.addClass("mainColor_color");
                    iconNode.set("html", "<i class=\""+value.fontIcon+"\"></i>");
                }

                var textNode = new Element("div.o2formModuleTools", {
                    "styles": this.css.toolbarToolTextNode,
                    "text": value.text
                });
                textNode.inject(toolNode);

                toolNode.addEvent("mousedown", function(e){
                    var className = this.retrieve("toolClass");
                    designer.form.createModule(className, e, group.data.name);
                });

                this.tools.push(toolNode);
            }.bind(this));

            //if (this.data.name==="default") this.show();
            if( this.showing )this.show( true );
        }.bind(this));
    },

    getTools: function(callback){
        if (this.toolsData){
            if (callback) callback();
        }else{
            var toolsDataUrl = this.app.path+this.app.options.style+"/"+this.data.json;
            o2.JSON.get(toolsDataUrl, function(responseJSON){
                this.toolsData = responseJSON;

                if (!this.app.toolsData){
                    this.app.toolsData = this.toolsData;
                }else{
                    this.app.toolsData = Object.merge(this.app.toolsData, this.toolsData)
                }

                if (callback) callback();
            }.bind(this));
        }
    },
});
