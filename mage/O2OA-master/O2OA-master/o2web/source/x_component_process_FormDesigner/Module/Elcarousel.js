MWF.xApplication.process.FormDesigner.Module = MWF.xApplication.process.FormDesigner.Module || {};
MWF.xDesktop.requireApp("process.FormDesigner", "Module.$ElElement", null, false);
MWF.xApplication.process.FormDesigner.Module.Elcarousel = MWF.FCElcarousel = new Class({
	Extends: MWF.FC$ElElement,
	Implements: [Options, Events],
	options: {
		"style": "default",
		"propertyPath": "../x_component_process_FormDesigner/Module/Elcarousel/elcarousel.html"
	},

	_initModuleType: function(){
		this.className = "Elcarousel";
		this.moduleType = "element";
		this.moduleName = "elcarousel";
	},
	_createElementHtml: function(){

		var html = "<el-carousel";
		html += " height="+ (this.json.height ? (this.json.height+"px") : "");
		html += " initial-index=1";
		html += " indicator-position=\"outside\"";
		html += " arrow=\"always\"";
		html += " interval=30000";
		html += " :type=\"carouselType\"";
		html += " loop";
		html += " :direction=\"direction\"";
		// html += " :initial-index=\"initialIndex\"";
		// html += " :trigger=\"trigger\"";
		// html += " :autoplay=\"autoplay\"";
		// html += " :interval=\"interval\"";
		// html += " :indicator-position=\"indicatorPosition\"";
		// html += " :arrow=\"arrow\"";
		// html += " :type=\"carouselType\"";
		// html += " :loop=\"loop\"";
		// html += " :direction=\"direction\"";

		if (this.json.elProperties){
			Object.keys(this.json.elProperties).forEach(function(k){
				if (this.json.elProperties[k]) html += " "+k+"=\""+this.json.elProperties[k]+"\"";
			}, this);
		}

		html += " :style=\"elStyles\">";

		if (this.json.vueSlot){
			html += this.json.vueSlot;
		}else{
			var lineHeight = this.json.height ? ( "line-height:"+this.json.height + "px;") : "";
			html += "<el-carousel-item v-for='item in 3' :key='item'>";
			html += 	"<div style=\"text-align: center;"+lineHeight+"\">"+this.json.id+"</div>";
			html += "</el-carousel-item>";
		}

		html += "</el-carousel>";

		return html;
	},
	_createCopyNode: function(){
		this.copyNode = new Element("div", {
			"styles": this.css.moduleNodeShow
		});
		this.copyNode.addEvent("selectstart", function(){
			return false;
		});
	},
	_getCopyNode: function(){
		if (!this.copyNode) this._createCopyNode();
		// this.copyNode.setStyle("display", "inline-block");
		return this.copyNode;
	},
	_setEditStyle_custom: function(name){
		switch (name){
			case "name": this.setPropertyName(); break;
			case "id":
			case "height":
			case "vueSlot":
				if (this.isPropertyLoaded) if (this.vm) this.resetElement(); break;
			default: break;
		}
	},
	setPropertyName: function(){
		// if (this.json.name){
		// 	var input = this.node.getElement("input");
		// 	if (input) input.set("value", this.json.name);
		// }
	},
	setPropertyId: function(){
		// if (!this.json.name){
		// 	var input = this.node.getElement("input");
		// 	if (input) input.set("value", this.json.id);
		// }
	}
});
