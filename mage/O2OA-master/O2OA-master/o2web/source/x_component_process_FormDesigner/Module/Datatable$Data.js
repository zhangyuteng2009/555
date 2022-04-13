MWF.xApplication.process.FormDesigner.Module = MWF.xApplication.process.FormDesigner.Module || {};
MWF.xDesktop.requireApp("process.FormDesigner", "Module.$Container", null, false);
MWF.xApplication.process.FormDesigner.Module.Datatable$Data = MWF.FCDatatable$Data = new Class({
	Extends: MWF.FCTable$Td,
	Implements: [Options, Events],
	options: {
        "propertyPath": "../x_component_process_FormDesigner/Module/Datatable$Data/datatable$Data.html",
		"actions": [
		    {
		    	"name": "insertCol",
		    	"icon": "insertCol1.png",
		    	"event": "click",
		    	"action": "insertCol",
		    	"title": MWF.LP.process.formAction.insertCol
		    },
		    {
		    	"name": "deleteCol",
		    	"icon": "deleteCol1.png",
		    	"event": "click",
		    	"action": "deleteCol",
		    	"title": MWF.LP.process.formAction.deleteCol
		    }
		],
		"allowModules": ["textfield", "number", "personfield", "orgfield", "org", "calendar", "textarea", "select", "radio", "checkbox", "combox", "image", "label",
			"htmleditor", "tinymceeditor", "button","imageclipper", "address", "attachment", "elinput", "elcheckbox", "elselect", "elautocomplete", "elnumber", "elradio", "elcascader",
			"elswitch", "elslider", "eltime", "eldate", "eldatetime", "elrate"]
	},
	
	initialize: function(form, options){
		this.setOptions(options);
		
		this.path = "../x_component_process_FormDesigner/Module/Datatable$Data/";
		this.cssPath = "../x_component_process_FormDesigner/Module/Datatable$Data/"+this.options.style+"/css.wcss";

		this._loadCss();
		this.moduleType = "container";
		this.moduleName = "datatable$Data";
		
		this.Node = null;
		this.form = form;
	},

    setAllStyles: function(){
        Object.each(this.json.styles, function(value, key){
            var reg = /^border\w*/ig;
            if (!key.test(reg)){
                if (key) this.node.setStyle(key, value);
            }
        }.bind(this));
        this.setPropertiesOrStyles("properties");
        this.reloadMaplist();
    },

	load : function(json, node, parent){
		this.json = json;
		this.node= node;
		this.node.store("module", this);
		this.node.setStyles(this.css.moduleNode);
		
		if (!this.json.id){
			var id = this._getNewId(parent.json.id);
			this.json.id = id;
		}
		
		node.set({
			"MWFType": "datatable$Data",
			"id": this.json.id
		});

		if (!this.form.json.moduleList[this.json.id]){
			this.form.json.moduleList[this.json.id] = this.json;
		}
		this._initModule();
		this._loadTreeNode(parent);
		this.form.parseModules(this, this.node);
		
		this.parentContainer = this.treeNode.parentNode.module;
        this._setEditStyle_custom("id");
        this.checkSequence();
        this.json.moduleName = this.moduleName;

		if( this.json.isShow === false ){
			this._switchShow();
		}
	},
    _setEditStyle_custom: function(name, obj, oldValue) {
        if (name == "cellType") this.checkSequence(obj, oldValue);
    },

	_preprocessingModuleData: function(){
		this.node.clearStyles();
		//if (this.initialStyles) this.node.setStyles(this.initialStyles);
		this.json.recoveryStyles = Object.clone(this.json.styles);

		if (this.json.recoveryStyles) Object.each(this.json.recoveryStyles, function(value, key){
			if ((value.indexOf("x_processplatform_assemble_surface")!=-1 || value.indexOf("x_portal_assemble_surface")!=-1)){
				//需要运行时处理
			}else{
				this.node.setStyle(key, value);
				delete this.json.styles[key];
			}
		}.bind(this));
	},
	_recoveryModuleData: function(){
		if (this.json.recoveryStyles) this.json.styles = this.json.recoveryStyles;
		this.json.recoveryStyles = null;
	},
    setCustomStyles: function(){
		this._recoveryModuleData();

        var border = this.node.getStyle("border");
        this.node.clearStyles();
        this.node.setStyles(this.css.moduleNode);

        if (this.initialStyles) this.node.setStyles(this.initialStyles);
        this.node.setStyle("border", border);

        Object.each(this.json.styles, function(value, key){
            var reg = /^border\w*/ig;
            if (!key.test(reg)){
                this.node.setStyle(key, value);
            }
        }.bind(this));

		this.setCustomNodeStyles(this.node, this.parentContainer.json.contentStyles);

		if( this.json.isShow === false ){
			this._switchShow();
		}
	},
    checkSequence: function(obj, oldValue){
        if ((this.json.cellType == "sequence") && (oldValue != "sequence")){
            if (this.treeNode.firstChild){
                var _self = this;
                var module = this.treeNode.firstChild.module;
                this.form.designer.confirm("warn", module.node, MWF.APPFD.LP.notice.changeToSequenceTitle, MWF.APPFD.LP.notice.changeToSequence, 300, 120, function(){

                    module.destroy();
                    this.close();

                    if (!_self.sequenceNode){
                        _self.node.empty();
                        _self.sequenceNode = new Element("div", {"styles": _self.css.sequenceNode, "text": "(N)", "MWFType1": "MWFTemp"}).inject(_self.node);
                    }

                }, function(){
                    _self.json.cellType = "content";
                    obj.checked = false;

                    this.close();
                }, null);
            }else{
                if (!this.sequenceNode){
                    this.node.empty();
                    this.sequenceNode = new Element("div", {"styles": this.css.sequenceNode, "text": "(N)", "MWFType1": "MWFTemp"}).inject(this.node);
                }
            }
        }else if (oldValue == "sequence") {
        }else{
            if (this.sequenceNode){
                this.sequenceNode.destroy();
                this.sequenceNode = null;
            }
        }
    },
	_dragIn: function(module){
		if (this.json.cellType == "sequence"){ //this.treeNode.firstChild ||
			this.parentContainer._dragIn(module);
		}else{
			if (this.options.allowModules.indexOf(module.moduleName)!=-1){

				this.parentContainer._dragOut(module);

				// if (!this.Component) module.inContainer = this;
				// module.parentContainer = this;
				// module.nextModule = null;
				// this.node.setStyles({"border": "1px solid #ffa200"});
				// var copyNode = module._getCopyNode();
				// copyNode.inject(this.node);

				module.onDragModule = this;
				if (!this.Component) module.inContainer = this;
				module.parentContainer = this;
				module.nextModule = null;

				this.node.setStyles({"border": "1px solid #ffa200"});

				if (module.controlMode){
					if (module.copyNode) module.copyNode.hide();
				}else{
					var copyNode = module._getCopyNode(this);
					copyNode.show();
					copyNode.inject(this.node);
				}
			}else{
				this.parentContainer._dragIn(module);
			}
		}
	},
	
	_showActions: function(){
		if (this.actionArea){
			this._setActionAreaPosition();
			this.actionArea.setStyle("display", "block");
		}
	},
	_insertCol: function(){
		var cols = $("MWFInsertColNumber").get("value");
		var positionRadios = document.getElementsByName("MWFInsertColPosition");
		var position = "before";
		for (var i=0; i<positionRadios.length; i++){
			if (positionRadios[i].checked){
				position = positionRadios[i].value;
				break;
			}
		}
		
		var tr = this.node.getParent("tr");
		var table = tr.getParent("table");
		
		var colIndex = this.node.cellIndex;
		var titleTr = table.rows[0];
		var dataTr = table.rows[1];
		
		var baseTh = titleTr.cells[colIndex];
		for (var m=1; m<=cols; m++){
			var newTh = new Element("th").inject(baseTh, position);
			this.form.getTemplateData("Datatable$Title", function(data){
				var moduleData = Object.clone(data);
				var thElement = new MWF.FCDatatable$Title(this.form);
				thElement.load(moduleData, newTh, this.parentContainer);
				this.parentContainer.elements.push(thElement);
			}.bind(this));
		}
		
		var baseTd = dataTr.cells[colIndex];
		for (var n=1; n<=cols; n++){
			var newTd = new Element("td").inject(baseTd, position);
			this.form.getTemplateData("Datatable$Data", function(data){
				var moduleData = Object.clone(data);
				var tdContainer = new MWF.FCDatatable$Data(this.form);
				tdContainer.load(moduleData, newTd, this.parentContainer);
				this.parentContainer.containers.push(tdContainer);
			}.bind(this));
		}
		
		this.unSelected();
		this.selected();
		
	},
	_deleteCol: function(){
		var tr = this.node.getParent("tr");
		var table = tr.getParent("table");
		var colIndex = this.node.cellIndex;
		
		var titleTr = table.rows[0];
		var dataTr = table.rows[1];
		
		if (tr.cells.length<=1){
			this.parentContainer.destroy();
		}else{
			var deleteTh = titleTr.cells[colIndex];
			var deleteTd = dataTr.cells[colIndex];

			var thModule = deleteTh.retrieve("module");
			if (thModule){
				thModule.parentContainer.elements.erase(thModule);
				thModule.destroy();
			}
			
			var tdModule = deleteTd.retrieve("module");
			if (tdModule){
				tdModule.parentContainer.containers.erase(tdModule);
				tdModule.destroy();
			}
			
		}
	},
	_switchShow : function (isShow) {
		if( typeOf(isShow) === "boolean" ){
			this.json.isShow = isShow;
		}else{
			isShow = this.json.isShow !== false ;
		}
		this.node.setStyle("opacity", isShow ? "1" : "0.3");
	}
	
});
