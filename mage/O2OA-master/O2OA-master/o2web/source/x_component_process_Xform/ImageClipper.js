MWF.xDesktop.requireApp("process.Xform", "$Module", null, false);
/** @class ImageClipper 图片编辑组件。
 * @o2cn 图片编辑组件
 * @example
 * //可以在脚本中获取该组件
 * //方法1：
 * var imageClipper = this.form.get("name"); //获取组件
 * //方法2
 * var imageClipper = this.target; //在组件事件脚本中获取
 * @extends MWF.xApplication.process.Xform.$Module
 * @o2category FormComponents
 * @o2range {Process|CMS}
 * @hideconstructor
 */
MWF.xApplication.process.Xform.ImageClipper = MWF.APPImageClipper =  new Class(
    /** @lends MWF.xApplication.process.Xform.ImageClipper# */
    {
	Implements: [Events],
	Extends: MWF.APP$Module,
    options: {
        "moduleEvents": ["change", "load", "queryLoad", "postLoad"]
    },
    initialize: function(node, json, form, options){
        this.node = $(node);
        this.node.store("module", this);
        this.json = json;
        this.form = form;
        this.field = true;
        this.fieldModuleLoaded = false;
    },
    _loadUserInterface: function(){
	    debugger;
        this.field = true;
        this.node.empty();
        var data = this._getBusinessData();
        if( data ){
            var img = new Element("img",{
                src : MWF.xDesktop.getImageSrc( data )
            });
            if (layout.mobile || COMMON.Browser.Platform.isMobile) {
                img.setStyles({
                    "max-width": "90%"
                })
            }else if( this.json.clipperType == "size" ){
                var width = ( this.json.imageWidth ) ? this.json.imageWidth.toInt() : 600;
                var height = ( this.json.imageHeight ) ? this.json.imageHeight.toInt() : 500;
                if( width && height ){
                    img.setStyles({
                        width : width+"px",
                        height : height+"px"
                    })
                }
            }
            if(this.json.imageStyles)img.setStyles(this.json.imageStyles);
            img.inject( this.node );
        }
        if( this.readonly || this.json.isReadonly )return;

        var divBottom = new Element("div").inject( this.node );
        var button = new Element("button").inject(divBottom);
        button.set({
			//"id": this.json.id,
			"text": this.json.name || this.json.id,
			"styles": this.form.css.buttonStyles,
			"MWFType": this.json.type
        });
        button.addEvent("click", function(){
            this.validationMode();
            var d = this._getBusinessData();
            if (layout.mobile){
                o2.imageClipperCallback = function( str ){
                    var data = JSON.parse( str );
                    this.setData( data ? data.fileId : "", true );
                    this.validation();
                    o2.imageClipperCallback = null;
                }.bind(this);
                // 兼容cms编辑表单
                var referencetype = "processPlatformJob";
                if(this.form.businessData.work && this.form.businessData.work.referencetype) {
                    referencetype = this.form.businessData.work.referencetype
                }
                var jsonString = JSON.stringify({
                    "mwfId" : this.json.id,
                    "callback" : "o2.imageClipperCallback",
                    "referencetype": referencetype,
                    "reference": this.form.businessData.work.job
                });
                if( window.o2android && window.o2android.uploadImage2FileStorage ){
                    window.o2android.uploadImage2FileStorage(jsonString)
                }else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.uploadImage2FileStorage){
                    window.webkit.messageHandlers.uploadImage2FileStorage.postMessage(jsonString);
                }else {
                    this.selectImage( d, function(data){
                        this.setData( data ? data.id : "", true );
                        this.validation();
                    }.bind(this));
                }
            }else{
                this.selectImage( d, function(data){
                    this.setData( data ? data.id : "", true );
                    this.validation();
                }.bind(this));
            }
        }.bind(this));
        this.fieldModuleLoaded = true;
	},
    getTextData : function(){
        var value = this._getBusinessData() || "";
        return {"value": [value], "text": [value]};
    },
    /**
     * @summary 判断组件值是否为空.
     * @example
     * if( this.form.get('fieldId').isEmpty() ){
     *     this.form.notice('请上传图片', 'warn');
     * }
     * @return {Boolean} 值是否为空.
     */
    isEmpty : function(){
        return !this.getData();
    },
    /**
     * 获取上传的图片ID。
     * @summary 获取上传的图片ID。
     * @example
     * var id = this.form.get('fieldId').getData(); //获取上传的图片id
     * var url = MWF.xDesktop.getImageSrc( id ); //获取图片的url
     */
    getData: function( data ){
        return this._getBusinessData() || "";
    },
    setData: function( data, fireChange ){
        var old = this.getData();
        this._setBusinessData(data);
        var img = this.node.getElements("img");
        if( img && img.length )img.destroy();
        if( !data ){
            if (fireChange && old!==data) this.fireEvent("change");
            return;
        }
        var img = new Element("img",{
            src : MWF.xDesktop.getImageSrc( data )
        }).inject( this.node, "top" );
        if (layout.mobile || COMMON.Browser.Platform.isMobile) {
            img.setStyles({
                "max-width": "90%"
            })
        }else if( this.json.clipperType == "size" ){
            var width = (this.json.imageWidth) ? this.json.imageWidth.toInt() : 600;
            var height = (this.json.imageHeight) ? this.json.imageHeight.toInt() : 500;
            if (width && height) {
                img.setStyles({
                    width: width + "px",
                    height: height + "px"
                })
            }
        }
        if(this.json.imageStyles)img.setStyles(this.json.imageStyles);
        if (fireChange && old!==data) this.fireEvent("change");
    },

    selectImage: function(d, callback){
        var clipperType = this.json.clipperType || "unrestricted";
        var ratio = 1;
        var description = "";
        var maxSize = 800;
        if( clipperType == "unrestricted" ){
            ratio = 0;
        }else if( clipperType == "size" ){
            var width = (this.json.imageWidth) ? this.json.imageWidth.toInt() : 600;
            var height = (this.json.imageHeight) ? this.json.imageHeight.toInt() : 500;
            ratio = width / height;
            maxSize = Math.max( width, height );
            if( !isNaN( width ) && !isNaN( height )  ){
                description = MWF.LP.widget.pictureSize.replace(/{width}/g, width).replace(/{height}/g, height);
            }
        }else if( clipperType == "ratio" ){
            ratio = this.json.imageRatio || 1;
            description = MWF.LP.widget.pictureRatio.replace(/{ratio}/g, ratio);
        }
        MWF.xDesktop.requireApp("process.Xform", "widget.ImageClipper", function(){
            this.imageClipper = new MWF.xApplication.process.Xform.widget.ImageClipper(this.form.app, {
                "style": "default",
                "aspectRatio" : ratio,
                "description" : description,
                "imageUrl" : d ? MWF.xDesktop.getImageSrc( d ) : "",
                "reference" : this.form.businessData.work.job,
                "referenceType": "processPlatformJob",
                "resultMaxSize" : maxSize,
                "onChange" : function(){
                    callback( { src : this.imageClipper.imageSrc, id : this.imageClipper.imageId } );
                }.bind(this)
            });
            this.imageClipper.load();
        }.bind(this));
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
            if (!this.node.isIntoView()) this.node.scrollIntoView();
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
    }
	
}); 