o2.widget = o2.widget || {};

o2.xDesktop.requireApp("Template", "widget.ColorPicker", null, false);
o2.widget.Tablet = o2.Tablet = new Class({
    Implements: [Options, Events],
    Extends: o2.widget.Common,
    options: {
        "style": "default",
        "path": o2.session.path+"/widget/$Tablet/",

        "contentWidth" : 0, //绘图区域宽度，不制定则基础 this.node的宽度
        "contentHeight" : 0, //绘图区域高度，不制定则基础 this.node的高度 - 操作条高度

        "lineWidth" : 1, //铅笔粗细
        "eraserRadiusSize": 10, //橡皮大小
        "color" : "#000000", //画笔颜色

        tools : [
            "save", "|",
            "undo",
            "redo", "|",
            "eraser", //橡皮
            "input", //输入法
            "pen", "|", //笔画
            "eraserRadius",
            "size",
            "color", "|",
            "image",
            "imageClipper", "|",
            "reset",
            "cancel"
        ],
        "toolHidden": [],
        "description" : "", //描述文字
        "imageSrc": "",

        "eraserEnable": true,
        "inputEnable": false,


        "action" : null, //uploadImage方法的上传服务，可选，如果不设置，使用公共图片服务
        "method": "", //使用action 的方法
        "parameter": {}, //action 时的url参数

        "data": null, //formdata 的data
        "reference": "",  //uploadImage方法的使用 使用公共图片服务上传时的参数
        "referenceType" : "", //使用公共图片服务上传时的参数, 目前支持 processPlatformJob, processPlatformForm, portalPage, cmsDocument, forumDocument
        "resultMaxSize" : 0, //使用 reference 时有效

        "rotateWithMobile": true
    },
    initialize: function(node, options, app){
        this.node = node;
        this.app = app;

        this.reset();

        this.setOptions(options);

        if( !this.options.toolHidden )this.options.toolHidden = [];

        if( !this.options.eraserEnable ){
            this.options.toolHidden.push("eraser");
            this.options.toolHidden.push("eraserRadius");
        }

        if( !this.options.inputEnable ){
            this.options.toolHidden.push("input");
        }

        this.path = this.options.path || (o2.session.path+"/widget/$Tablet/");
        this.cssPath = this.path + this.options.style+"/css.wcss";

        this.lp = {
            "save" : o2.LP.widget.save,
            "reset" : o2.LP.widget.empty,
            "undo" : o2.LP.widget.undo,
            "redo" : o2.LP.widget.redo,
            "eraser": o2.LP.widget.eraser,
            "input": o2.LP.widget.input,
            "pen": o2.LP.widget.pen,
            "eraserRadius": o2.LP.widget.eraserRadius,
            "size" : o2.LP.widget.thickness,
            "color" : o2.LP.widget.color,
            "image" : o2.LP.widget.insertImage,
            "imageClipper" : o2.LP.widget.imageClipper,
            "cancel": o2.LP.widget.cancel
        };

        this._loadCss();
        this.fireEvent("init");
    },
    load: function(  ){
        if( layout.mobile && this.options.rotateWithMobile ){
            this.rotate = true;
        }
        //存储当前表面状态数组-上一步
        this.preDrawAry = [];
        //存储当前表面状态数组-下一步
        this.nextDrawAry = [];
        //中间数组
        this.middleAry = [];

        this.mode = "writing"; //writing表示写状态，erasing表示擦除状态, inputing表示输入法

        this.container = new Element("div.container", {
            styles :  this.css.container
        }).inject(this.node);

        if( this.rotate ){ //强制横屏显示
            this.detectOrient();
        }

        this.loadToolBar();

        this.contentNode = new Element("div.contentNode", { styles :  this.css.contentNode}).inject(this.container);
        this.contentNode.addEvent("selectstart", function(e){
            e.preventDefault();
            e.stopPropagation();
        });

        this.loadDescription();

        this.setContentSize();

        if( this.checkBroswer() ){
            this.loadContent();
        }

        //this.imageNode = new Element("img",{
        //}).inject(this.contentNode);
        //this.imageNode.setStyles({
        //    "display" : "none"
        //});

        if( this.app ){
            this.resizeFun = this.setContentSize.bind(this);
            this.app.addEvent( "resize", this.resizeFun );
        }

    },
    loadDescription : function(){
        if( this.options.description ){
            this.descriptionNode = new Element("div",{
                "styles": this.css.descriptionNode,
                "text": this.options.description
            }).inject( this.container )
        }
    },
    setContentSize : function(){
        this.computeContentSize();
        this.contentNode.setStyle("width", this.contentWidth );
        this.contentNode.setStyle("height", this.contentHeight );

        if(this.canvasWrap){
            this.canvasWrap.setStyles({
                width : this.contentWidth+"px",
                height : this.contentHeight+"px"
            });
        }

        if( this.canvas ){
            var d = this.ctx.getImageData(0,0,this.canvas.clientWidth,this.canvas.clientHeight);
            this.canvas.set("width", this.contentWidth );
            this.canvas.set("height", this.contentHeight );
            this.ctx.putImageData(d,0,0);
        }
    },
    computeContentSize: function(){
        var toolbarSize,descriptionSize, m1,m2,m3;
        var nodeSize = this.node.getSize();
        if( this.rotate && this.transform > 0 ){
            this.contentWidth = this.options.contentHeight ||  nodeSize.y;
            if( this.contentWidth < 150 )this.contentWidth = 150;

            if( this.options.contentWidth ){
                this.contentHeight = this.options.contentWidth;
            }else{
                toolbarSize = this.toolbarNode ? this.toolbarNode.getSize() : { x : 0, y : 0 };
                descriptionSize = this.descriptionNode ? this.descriptionNode.getSize() : { x : 0, y : 0 };
                m1 = this.getOffsetX(this.toolbarNode);
                m2 = this.getOffsetX(this.descriptionNode);
                m3 = this.getOffsetX(this.contentNode);
                this.contentOffSetX = toolbarSize.x + descriptionSize.x + m1 + m2 + m3;
                this.contentHeight = nodeSize.x - toolbarSize.x - descriptionSize.x - m1 - m2 - m3;
            }
            if( this.contentHeight < 100 )this.contentHeight = 100;
        }else{
            this.contentWidth = this.options.contentWidth ||  nodeSize.x;
            if( this.contentWidth < 100 )this.contentWidth = 100;

            if( this.options.contentHeight ){
                this.contentHeight = this.options.contentHeight;
            }else{
                toolbarSize = this.toolbarNode ? this.toolbarNode.getSize() : { x : 0, y : 0 };
                descriptionSize = this.descriptionNode ? this.descriptionNode.getSize() : { x : 0, y : 0 };
                m1 = this.getOffsetY(this.toolbarNode);
                m2 = this.getOffsetY(this.descriptionNode);
                m3 = this.getOffsetY(this.contentNode);
                this.contentHeight = nodeSize.y - toolbarSize.y - descriptionSize.y - m1 - m2 - m3;
            }
            if( this.contentHeight < 150 )this.contentHeight = 150;
        }
    },
    getOffsetY : function(node){
        if( !node )return 0;
        return (node.getStyle("margin-top").toInt() || 0 ) +
            (node.getStyle("margin-bottom").toInt() || 0 ) +
            (node.getStyle("padding-top").toInt() || 0 ) +
            (node.getStyle("padding-bottom").toInt() || 0 )+
            (node.getStyle("border-top-width").toInt() || 0 ) +
            (node.getStyle("border-bottom-width").toInt() || 0 );
    },
    getOffsetX : function(node){
        if( !node )return 0;
        return (node.getStyle("margin-left").toInt() || 0 ) +
            (node.getStyle("margin-right").toInt() || 0 ) +
            (node.getStyle("padding-left").toInt() || 0 ) +
            (node.getStyle("padding-right").toInt() || 0 )+
            (node.getStyle("border-left-width").toInt() || 0 ) +
            (node.getStyle("border-right-width").toInt() || 0 );
    },
    loadToolBar: function(){
        if( layout.mobile ){ //this.rotate && this.transform > 0
            this.toolbar = new o2.widget.Tablet.ToolbarMobile( this );
            this.toolbar.load();
        }else{
            this.toolbarNode = new Element("div.toolbar", {
                "styles" : this.css.toolbar
            }).inject(this.container);

            this.toolbar = new o2.widget.Tablet.Toolbar( this , this.toolbarNode  );
            this.toolbar.load();
        }
    },
    storeToPreArray : function(){
        //当前绘图表面状态
        var preData= this.ctx.getImageData(0,0,this.contentWidth,this.contentHeight);
        //当前绘图表面进栈
        this.preDrawAry.push(preData);
    },
    storeToMiddleArray : function(){
        //当前绘图表面状态
        var preData= this.ctx.getImageData(0,0,this.contentWidth,this.contentHeight);
        if( this.nextDrawAry.length==0){
            //当前绘图表面进栈
            this.middleAry.push(preData);
        }else{
            this.middleAry=[];
            this.middleAry=this.middleAry.concat(this.preDrawAry);
            this.middleAry.push(preData);
            this.nextDrawAry=[];
            this.toolbar.enableItem("redo");
        }

        if(this.preDrawAry.length){
            this.toolbar.enableItem("undo");
            this.toolbar.enableItem("reset");
        }
    },
    loadContent : function( ){
        debugger;
        var _self = this;

        this.canvasWrap = new Element("div.canvasWrap", { styles :  this.css.canvasWrap}).inject(this.contentNode);
        this.canvasWrap.setStyles({
            width : this.contentWidth+"px",
            height : this.contentHeight+"px"
        });
        if( !this.rotate ){
            this.canvasWrap.setStyle("position", "relative");
        }

        this.canvas = new Element("canvas", {
            width : this.contentWidth,
            height : this.contentHeight
        }).inject( this.canvasWrap );

        this.ctx = this.canvas.getContext("2d");

        if( this.options.imageSrc ){
            var img = new Element("img", {
                "crossOrigin": "",
                "src": this.options.imageSrc,
                "events": {
                    "load": function () {
                        _self.ctx.drawImage(this, 0, 0);
                        var preData=_self.ctx.getImageData(0,0,_self.contentWidth,_self.contentHeight);
                        _self.middleAry.push(preData);
                        _self.toolbar.enableItem("reset");
                    }
                }
            })

        }else{
            var preData=this.ctx.getImageData(0,0,this.contentWidth,this.contentHeight);
            this.middleAry.push(preData);
        }

        this.canvas.ontouchstart = this.canvas.onmousedown = function(ev){
            var flag;
            if( this.currentInput ){
                this.currentInput.readMode();
                this.currentInput = null;
                flag = true;
            }
            if( this.mode === "inputing" ){
                if(flag)return;
                this.doInput(ev)
            }else{
                this.doWritOrErase(ev)
            }
        }.bind(this)
    },
    doInput: function(event){
        if( !this.inputList )this.inputList = [];
        debugger;
        var x,y;
        if(event.touches){
            var touch=event.touches[0];
            x=touch.clientX;
            y=touch.clientY;
        }else{
            x=event.clientX;
            y=event.clientY;
        }

        var coordinate =  this.canvasWrap.getCoordinates();
        x = x - coordinate.left;
        y = y- coordinate.top;

        this.currentInput = new o2.widget.Tablet.Input( this, this.canvasWrap , {
            top: y,
            left: x,
            onPostOk : function(){
                // var coordinate =  mover.getCoordinage();
                // this.storeToPreArray();
                // this.ctx.drawImage(imageNode, coordinate.left, coordinate.top, coordinate.width, coordinate.height);
                // this.storeToMiddleArray();
                //
                // if(this.globalCompositeOperation)this.ctx.globalCompositeOperation = this.globalCompositeOperation;
                // this.globalCompositeOperation = null;
            }.bind(this),
            onPostCancel: function(){
                // if(this.globalCompositeOperation)this.ctx.globalCompositeOperation = this.globalCompositeOperation;
                // this.globalCompositeOperation = null;
            }.bind(this),
        });
        this.currentInput.load();
        this.inputList.push( this.currentInput );
    },
    doWritOrErase: function(ev){
        var _self = this;
        var ev = ev || event;
        var ctx = this.ctx;
        var canvas = this.canvas;
        var container = this.contentNode;
        var position = this.canvasWrap.getPosition();
        var doc = $(document);

        if( this.mode === "erasing" ) {
            ctx.lineCap = "round";　　//设置线条两端为圆弧
            ctx.lineJoin = "round";　　//设置线条转折为圆弧
            ctx.lineWidth = this.currentEraserRadius || this.options.eraserRadiusSize;
            ctx.globalCompositeOperation = "destination-out";
        }else{
            //ctx.strokeStyle="#0000ff" 线条颜色; 默认 #000000
            if( this.options.color )ctx.strokeStyle= this.currentColor || this.options.color; // 线条颜色; 默认 #000000
            if( this.options.lineWidth  )ctx.lineWidth= this.currentWidth || this.options.lineWidth; //默认1 像素
            ctx.lineCap = "butt";　　//设置线条两端为平直的边缘
            ctx.lineJoin = "miter";　　//设置线条转折为圆弧
            ctx.globalCompositeOperation = "source-over";
        }

        ctx.beginPath();

        var x , y;
        if(this.rotate && _self.transform > 0){
            var clientY = ev.type.indexOf('touch') !== -1 ? ev.touches[0].clientY : ev.clientY;
            var clientX = ev.type.indexOf('touch') !== -1 ? ev.touches[0].clientX : ev.clientX;
            var newX = clientY;
            var newY = _self.canvas.height - clientX; //y轴旋转偏移 // - parseInt(_self.transformOrigin)
        }else{
            x = ev.clientX-position.x;
            y = ev.clientY-position.y
        }


        ctx.moveTo(x, y);
        if( this.mode === "erasing" ){
            ctx.arc(x, y, 1, 0, 2*Math.PI);
            ctx.fill();
        }

        this.storeToPreArray();

        var mousemove = function(ev){
            var mx , my;
            if(_self.rotate && _self.transform > 0){
                mx = ev.client.y;
                my = _self.canvas.height - ev.client.x //y轴旋转偏移 //  - + parseInt(_self.transformOrigin);
            }else{
                mx = ev.client.x - position.x;
                my = ev.client.y - position.y;
            }

            ctx.lineTo(mx, my);
            ctx.stroke();
        };
        doc.addEvent( "mousemove", mousemove );
        doc.addEvent( "touchmove", mousemove );

        var mouseup = function(ev){
            //document.onmousemove = document.onmouseup = null;
            doc.removeEvent("mousemove", mousemove);
            doc.removeEvent("mouseup", mouseup);
            doc.removeEvent("touchmove", mousemove);
            doc.removeEvent("touchend", mouseup);

            this.storeToMiddleArray();

            ctx.closePath();
        }.bind(this);
        doc.addEvent("mouseup", mouseup);
        doc.addEvent("touchend", mouseup);
        //document.onmouseup = function(ev){
        //    document.onmousemove = document.onmouseup = null;
        //    ctx.closePath();
        //}
    },
    detectOrient: function(){
        // 利用 CSS3 旋转 对根容器逆时针旋转 90 度
        var size = $(document.body).getSize();
        var width = size.x,
            height = size.y,
            styles = {};

        if( width >= height ){ // 横屏
            this.transform = 0;
            this.transformOrigin = 0;
            styles = {
                "width": width+"px",
                "height": height+"px",
                "webkit-transform": "rotate(0)",
                "transform": "rotate(0)",
                "webkit-transform-origin": "0 0",
                "transform-origin": "0 0"
            }
        }
        else{ // 竖屏
            this.options.lineWidth = 1.5;
            this.transform = 90;
            this.transformOrigin = width / 2;
            styles = {
                "width": height+"px",
                "height": width+"px",
                "webkit-transform": "rotate(90deg)",
                "transform": "rotate(90deg)",
                "webkit-transform-origin": ( this.transformOrigin + "px " + this.transformOrigin + "px"),
                "transform-origin": ( this.transformOrigin + "px " + this.transformOrigin + "px")
            }
        }
        this.container.setStyles(styles);
    },
    uploadImage: function(  success, failure  ){
        var image = this.getImage( null, true );
        if( image ){
            if( this.options.action ){
                this.action = (typeOf(this.options.action)=="string") ? o2.Actions.get(action).action : this.options.action;
                this.action.invoke({
                    "name": this.options.method,
                    "async": true,
                    "data": this.getFormData( image ),
                    "file": image,
                    "parameter": this.options.parameter,
                    "success": function(json){
                        success(json)
                    }.bind(this)
                });
            }else if( this.options.reference && this.options.referenceType ){
                //公共图片上传服务
                var maxSize = this.options.resultMaxSize;
                o2.xDesktop.uploadImageByScale(
                    this.options.reference,
                    this.options.referenceType,
                    maxSize,
                    this.getFormData( image ),
                    image,
                    success,
                    failure
                );
            }
        }else{
        }
    },
    getFormData : function( image ){
        if( !image )image = this.getImage();
        var formData = new FormData();
        formData.append('file', image, this.fileName );
        if( this.options.data ){
            Object.each(this.options.data, function(v, k){
                formData.append(k, v)
            });
        }
        return formData;
    },
    getImage : function( base64Code, ignoreResultSize ){
        var src = base64Code || this.getBase64Code( ignoreResultSize);
        src=window.atob(src);

        var ia = new Uint8Array(src.length);
        for (var i = 0; i < src.length; i++) {
            ia[i] = src.charCodeAt(i);
        }

        return new Blob([ia], {type: this.fileType });
    },
    getBase64Code : function( ignoreResultSize ){
        var ctx = this.ctx;
        var canvas = this.canvas;

        this.drawInput();

        //var container = this.contentNode;
        //var size = this.options.size;
        if( !ignoreResultSize && this.options.resultMaxSize ){

            var width, height;
            width = Math.min( this.contentWidth , this.options.resultMaxSize);
            height = ( width / this.contentWidth) * this.contentHeight;

            var src=canvas.toDataURL( this.fileType );
            src=src.split(',')[1];
            src = 'data:'+ this.fileType +';base64,' + src;

            var tmpImageNode = new Element("img", {
                width : this.contentWidth,
                height : this.contentHeight,
                src : src
            });
            var tmpCanvas = new Element("canvas", {
                width : width,
                height : height
            }).inject( this.contentNode );
            var tmpCtx = tmpCanvas.getContext("2d");

            tmpCtx.drawImage(tmpImageNode,0,0, this.contentWidth,this.contentHeight,0,0,width,height);

            var tmpsrc= tmpCanvas.toDataURL( this.fileType );
            tmpsrc=tmpsrc.split(',')[1];

            tmpImageNode.destroy();
            tmpCanvas.destroy();
            tmpCtx = null;

            if(!tmpsrc){
                return "";
            }else{
                return tmpsrc
            }
        }else{
            var src=canvas.toDataURL( this.fileType );
            src=src.split(',')[1];

            if(!src){
                return "";
            }else{
                return src
            }
        }
    },
    getBase64Image: function( base64Code, ignoreResultSize ){
        if( !base64Code )base64Code = this.getBase64Code( ignoreResultSize );
        if( !base64Code )return null;
        return 'data:'+ this.fileType +';base64,' + base64Code;
    },
    drawInput: function(){
        if( this.inputList )this.inputList.each(function (input) {
            input.draw();
        })
    },
    close : function(){
        if( this.inputList ){
            this.inputList.each(function (input) {
                input.close( true );
            })
        }
        this.container.destroy();
        delete this;
    },
    checkBroswer : function(){
        if( window.Uint8Array && window.HTMLCanvasElement && window.atob && window.Blob){
            this.available = true;
            return true;
        }else{
            this.available = false;
            this.container.set("html", "<p>"+o2.LP.widget.explorerNotSupportFeatures+"</p><ul><li>canvas</li><li>Blob</li><li>Uint8Array</li><li>FormData</li><li>atob</li></ul>");
            return false;
        }
    },
    isBlank: function(){
        var canvas = this.canvas;
        var blank = new Element("canvas", {
            width : canvas.width,
            height : canvas.height
        });
        // var blank = document.createElement('canvas');//系统获取一个空canvas对象
        // blank.width = canvas.width;
        // blank.height = canvas.height;
        return canvas.toDataURL() == blank.toDataURL(); //比较值相等则为空
    },
    save : function(){
        var base64code = this.getBase64Code();
        var imageFile = this.getImage( base64code );
        var base64Image = this.getBase64Image( base64code );
        this.fireEvent("save", [ base64code, base64Image, imageFile]);
    },
    reset : function( itemNode ){
        this.fileName = "untitled.png";
        this.fileType = "image/png";
        if( this.ctx ){
            var canvas = this.canvas;
            this.ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
        }
        this.fireEvent("reset");
    },
    undo : function( itemNode ){
        if(this.preDrawAry.length>0){
            var popData=this.preDrawAry.pop();
            var midData=this.middleAry[this.preDrawAry.length+1];
            this.nextDrawAry.push(midData);
            this.ctx.putImageData(popData,0,0);
        }

        this.toolbar.setAllItemsStatus();
    },
    redo : function( itemNode ){
        if(this.nextDrawAry.length){
            var popData=this.nextDrawAry.pop();
            var midData=this.middleAry[this.middleAry.length-this.nextDrawAry.length-2];
            this.preDrawAry.push(midData);
            this.ctx.putImageData(popData,0,0);
        }
        this.toolbar.setAllItemsStatus();
    },
    size : function( itemNode ){
        if( !this.sizeSelector ){
            this.sizeSelector = new o2.widget.Tablet.SizePicker(this.container, itemNode, null, {}, {
                "onSelect": function (width) {
                    this.currentWidth = width;
                }.bind(this)
            });
        }
    },
    color : function( itemNode ){
        if( !this.colorSelector ){
            this.colorSelector = new o2.xApplication.Template.widget.ColorPicker( this.container, itemNode, null, {}, {
                "lineWidth" : 1,
                "onSelect": function (color) {
                    this.currentColor = color;
                }.bind(this)
            });
        }
    },
    getImageSize : function(naturalWidth, naturalHeight ){
        var ratio = naturalWidth / naturalHeight;
        var ww = this.contentWidth,
            wh = this.contentHeight;
        var flag = ( naturalWidth / parseInt(ww) ) > ( naturalHeight / parseInt(wh) );
        if( flag ){
            var width = Math.min( naturalWidth, parseInt( ww )  );
            return { width : width,  height : width / ratio }
        }else{
            var height = Math.min( naturalHeight, parseInt( wh )  );
            return { width : height * ratio,  height : height }
        }
    },
    parseFileToImage : function( file, callback ){
        var imageNode = new Element("img");

        var onImageLoad = function(){
            var nh = imageNode.naturalHeight,
                nw = imageNode.naturalWidth;
            if( isNaN(nh) || isNaN(nw) || nh == 0 || nw == 0 ){
                setTimeout( function(){ onImageLoad(); }.bind(this), 100 );
            }else{
                _onImageLoad();
            }
        };

        var _onImageLoad = function(){

            var nh = imageNode.naturalHeight,
                nw = imageNode.naturalWidth;
            var size = this.getImageSize( nw, nh );
            imageNode.setStyles({
                width : size.width,
                height : size.height
            });

            var mover = new o2.widget.Tablet.ImageMover( this, imageNode, this.canvasWrap , {
                onPostOk : function(){
                    var coordinate =  mover.getCoordinates();
                    this.storeToPreArray();
                    this.ctx.drawImage(imageNode, coordinate.left, coordinate.top, coordinate.width, coordinate.height);
                    this.storeToMiddleArray();

                    if(this.globalCompositeOperation)this.ctx.globalCompositeOperation = this.globalCompositeOperation;
                    this.globalCompositeOperation = null;
                }.bind(this),
                onPostCancel: function(){
                    if(this.globalCompositeOperation)this.ctx.globalCompositeOperation = this.globalCompositeOperation;
                    this.globalCompositeOperation = null;
                }.bind(this),
            });
            mover.load();


            if( callback )callback();
        }.bind(this);

        var reader=new FileReader();
        reader.onload=function(){
            imageNode.src=reader.result;
            reader = null;
            onImageLoad();
        }.bind(this);
        reader.readAsDataURL(file);
    },
    image : function( itemNode ){
        var uploadFileAreaNode = new Element("div");
        var html = "<input name=\"file\" type=\"file\" />"; //accept=\"images/*\"

        uploadFileAreaNode.set("html", html);

        var fileUploadNode = uploadFileAreaNode.getFirst();
        fileUploadNode.addEvent("change", function () {
            var file =  fileUploadNode.files[0];
            this.globalCompositeOperation = this.ctx.globalCompositeOperation;
            this.ctx.globalCompositeOperation = "source-over";
            this.parseFileToImage( file, function(){
                uploadFileAreaNode.destroy();
            })
        }.bind(this));
        fileUploadNode.click();
    },
    imageClipper : function( itemNode ){
        var clipper = new o2.widget.Tablet.ImageClipper(this.app, {
            "style": "default",
            "aspectRatio" : 0,
            "onOk" : function( img ){
                this.globalCompositeOperation = this.ctx.globalCompositeOperation;
                this.ctx.globalCompositeOperation = "source-over";
                this.parseFileToImage( img );
            }.bind(this)
        });
        clipper.load();
    },
    input: function( itemNode ){
        this.mode = "inputing";
        this.toolbar.enableItem("pen");
        this.toolbar.enableItem("eraser");
        this.toolbar.activeItem("input");
        this.toolbar.hideItem("eraserRadius");
        this.toolbar.hideItem("size");
        this.toolbar.hideItem("color");
    },
    eraser : function( itemNode ){
        this.mode = "erasing";
        this.toolbar.enableItem("pen");
        this.toolbar.activeItem("eraser");
        this.toolbar.showItem("eraserRadius");
        this.toolbar.hideItem("size");
        this.toolbar.hideItem("color");
        this.toolbar.enableItem("input");
    },
    eraserRadius : function( itemNode ){
        if( !this.eraserRadiusSelector ){
            this.eraserRadiusSelector = new o2.widget.Tablet.EraserRadiusPicker(this.container, itemNode, null, {}, {
                "onSelect": function (width) {
                    this.currentEraserRadius = width;
                }.bind(this)
            });
        }
    },
    pen : function( itemNode ){
        this.mode = "writing";
        this.toolbar.activeItem("pen");
        this.toolbar.enableItem("input");
        this.toolbar.enableItem("eraser");
        this.toolbar.hideItem("eraserRadius");
        this.toolbar.showItem("size");
        this.toolbar.showItem("color");
    },
    cancel: function(){
        var _self = this;
        this.reset();
        if( this.options.imageSrc ){
            var img = new Element("img", {
                "crossOrigin": "",
                "src": this.options.imageSrc,
                "events": {
                    "load": function () {
                        _self.ctx.drawImage(this, 0, 0);
                        var preData=_self.ctx.getImageData(0,0,_self.contentWidth,_self.contentHeight);
                        _self.middleAry.push(preData);
                        _self.toolbar.enableItem("reset");
                    }
                }
            })
        }
        this.fireEvent("cancel");
    }
});

o2.widget.Tablet.Toolbar = new Class({
    Implements: [Options, Events],
    initialize: function (tablet, container) {
        this.tablet = tablet;
        this.container = container;
        this.css = tablet.css;
        this.lp = this.tablet.lp;
        this.imagePath = o2.session.path+"/widget/$Tablet/"+ this.tablet.options.style +"/icon/";

        this.items = {};

        this.itemsEnableFun = {
            save : {
                enable : function(){ return true }
            },
            reset : {
                enable : function(){ return this.tablet.preDrawAry.length > 0}.bind(this)
            },
            undo : {
                enable : function(){ return this.tablet.preDrawAry.length > 0 }.bind(this)
            },
            redo : {
                enable : function(){ return this.tablet.nextDrawAry.length > 0 }.bind(this)
            },
            eraser : {
                enable : function(){ return true },
                active : function(){ return this.tablet.mode === "erasing" }.bind(this)
            },
            eraserRadius: {
                enable : function(){ return true },
                show : function(){ return this.tablet.mode === "erasing" }.bind(this)
            },
            input: {
                enable : function(){ return true },
                active : function(){ return this.tablet.mode === "inputing" }.bind(this)
            },
            pen: {
                enable : function(){ return true },
                active : function(){ return this.tablet.mode === "writing" }.bind(this)
            },
            size : {
                enable : function(){ return true },
                show : function(){ return this.tablet.mode === "writing" }.bind(this)
            },
            color : {
                enable : function(){ return true },
                show : function(){ return this.tablet.mode === "writing" }.bind(this)
            },
            image : {
                enable : function(){ return true }
            },
            imageClipper : {
                enable : function(){ return true }
            }
        }
    },
    getHtml : function(){
        var items;
        var tools = this.tablet.options.tools;
        if( tools ){
            items = tools;
        }else{
            items = [
                "save", "|",
                "reset", "|",
                "undo", "|",
                "redo", "|",
                "eraser", "|",
                "input", "|",
                "pen", "|",
                "eraserRadius","|",
                "size", "|",
                "color", "|",
                "image", "|",
                "imageClipper"
            ];
        }

        if( this.tablet.options.toolHidden.contains("eraser") && this.tablet.options.toolHidden.contains("input")){
            this.tablet.options.toolHidden.push("pen");
        }
        if( this.tablet.options.toolHidden.contains("eraser")){
            this.tablet.options.toolHidden.push("eraserRadius");
        }
        if( this.tablet.options.toolHidden.contains("input")){

        }



        items = items.filter(function(tool){
            return !this.tablet.options.toolHidden.contains(tool)
        }.bind(this));
        items = items.clean();

        for( var i=1; i<items.length; i++ ){
            if( items[i-1]==="|" && items[i]==="|")items[i-1] = null;
        }
        items = items.clean();

        var html = "";
        var style = "toolItem";
        items.each( function( item ){
            switch( item ){
                case "|":
                    html +=  "<div styles='" + "separator" + "'></div>";
                    break;
                case "save" :
                    html +=  "<div item='save' styles='" + style + "'>"+ this.lp.save +"</div>";
                    break;
                case "reset" :
                    html +=  "<div item='reset' styles='" + style + "'>"+ this.lp.reset  +"</div>";
                    break;
                case "undo" :
                    html +=  "<div item='undo' styles='" + style + "'>"+ this.lp.undo  +"</div>";
                    break;
                case "redo" :
                    html +=  "<div item='redo' styles='" + style + "'>"+ this.lp.redo  +"</div>";
                    break;
                case "eraser" :
                    html +=  "<div item='eraser' styles='" + style + "'>"+ this.lp.eraser  +"</div>";
                    break;
                case "eraserRadius" :
                    html +=  "<div item='eraserRadius' styles='" + style + "'>"+ this.lp.eraserRadius  +"</div>";
                    break;
                case "input" :
                    html +=  "<div item='input' styles='" + style + "'>"+ this.lp.input  +"</div>";
                    break;
                case "pen" :
                    html +=  "<div item='pen' styles='" + style + "'>"+ this.lp.pen  +"</div>";
                    break;
                case "size" :
                    html +=  "<div item='size' styles='" + style + "'>"+ this.lp.size  +"</div>";
                    break;
                case "color" :
                    html +=  "<div item='color' styles='" + style + "'>"+ this.lp.color  +"</div>";
                    break;
                case "image" :
                    html +=  "<div item='image' styles='" + style + "'>"+ this.lp.image  +"</div>";
                    break;
                case "imageClipper" :
                    html +=  "<div item='imageClipper' styles='" + style + "'>"+ this.lp.imageClipper  +"</div>";
                    break;
                case "cancel" :
                    html +=  "<div item='cancel' styles='toolRightItem'>"+ this.lp.cancel  +"</div>";
                    break;

            }
        }.bind(this));
        return html;
    },
    load: function () {
        var _self = this;
        var imagePath = this.imagePath;
        this.items = {};
        var html = this.getHtml();

        this.container.set("html", html);
        this.container.getElements("[styles]").each(function (el) {
            el.setStyles(_self.css[el.get("styles")]);
            var item =  el.get("item");
            if ( item ) {
                this.items[ item ] = el;
                el.setStyle("background-image","url("+ imagePath + item +"_normal.png)");
                el.addEvents({
                    mouseover : function(){
                        _self._setItemNodeActive(this.el);
                    }.bind({ item : item, el : el }),
                    mouseout : function(){
                        var active = false;
                        if( _self.itemsEnableFun[item] && _self.itemsEnableFun[item].active ){
                            active = _self.itemsEnableFun[item].active();
                        }
                        if(!active)_self._setItemNodeNormal(this.el);
                    }.bind({ item : item, el : el }),
                    click : function( ev ){
                        if( _self["tablet"][this.item] )_self["tablet"][this.item]( this.el );
                    }.bind({ item : item, el : el })
                });
                if( item == "color" || item == "size" || item == "eraserRadius" ){
                    if( _self["tablet"][item] )_self["tablet"][item]( el );
                }
            }
        }.bind(this));
        this.setAllItemsStatus();
        this.setAllItemsShow();
        this.setAllItemsActive();
    },
    setAllItemsShow : function(){
        for( var item in this.items ){
            var node = this.items[item];
            if( this.itemsEnableFun[item] && this.itemsEnableFun[item].show ){
                if( !this.itemsEnableFun[item].show() ){
                    this.hideItem( item );
                }
            }
        }
    },
    setAllItemsActive : function(){
        for( var item in this.items ){
            var node = this.items[item];
            if( this.itemsEnableFun[item] && this.itemsEnableFun[item].active ){
                if( this.itemsEnableFun[item].active() ){
                    this.activeItem( item );
                }
            }
        }
    },
    setAllItemsStatus : function(){
        for( var item in this.items ){
            var node = this.items[item];
            if( this.itemsEnableFun[item] ){
                if( this.itemsEnableFun[item].enable() ){
                    this.enableItem( item )
                }else{
                    this.disableItem( item );
                }
            }
        }
    },
    showItem: function( itemName ){
        var itemNode =  this.items[ itemName ];
        if(itemNode)itemNode.show();
    },
    hideItem: function( itemName ){
        var itemNode =  this.items[ itemName ];
        if(itemNode)itemNode.hide();
    },
    disableItem : function( itemName ){
        var itemNode =  this.items[ itemName ];
        if(itemNode){
            itemNode.store("status", "disable");
            this._setItemNodeDisable( itemNode, itemName );
        }
    },
    enableItem : function( itemName ){
        var itemNode =  this.items[ itemName ];
        if(itemNode) {
            itemNode.store("status", "enable");
            this._setItemNodeNormal(itemNode, itemName);
        }
    },
    activeItem: function( itemName ){
        var itemNode =  this.items[ itemName ];
        if(itemNode) {
            itemNode.store("status", "active");
            this._setItemNodeActive(itemNode, itemName);
        }
    },
    _setItemNodeDisable : function( itemNode ){
        var item = itemNode.get("item");
        if(item){
            itemNode.setStyles( this.css.toolItem_disable );
            itemNode.setStyle("background-image","url("+  this.imagePath+ item +"_disable.png)");
        }
    },
    _setItemNodeActive: function( itemNode ){
        if( itemNode.retrieve("status") == "disable" )return;
        var item = itemNode.get("item");
        if(item){
            itemNode.setStyles( this.css.toolItem_over );
            itemNode.setStyle("background-image","url("+  this.imagePath+ item +"_active.png)");
        }
    },
    _setItemNodeNormal: function( itemNode ){
        if( itemNode.retrieve("status") == "disable" )return;
        var item = itemNode.get("item");
        if(item){
            var style = itemNode.get("styles");
            itemNode.setStyles( this.css[style] );
            itemNode.setStyle("background-image","url("+  this.imagePath+ item +"_normal.png)");
        }
    }

});

o2.widget.Tablet.ToolbarMobile = new Class({
    Extends: o2.widget.Tablet.Toolbar,
    Implements: [Options, Events],
    load: function(){
        this.tablet.container.setStyle("position","relative");
        Array.each([{
            "name": "cancel", "text": this.lp.cancel
        },{
            "name": "save", "text": this.lp.save
        },{
            "name": "undo"
        },{
            "name": "redo"
        },{
            "name": "reset"
        }], function (item) {
            this.items[item.name] = new Element("div",{
                styles : this.css[item.name+"_mobile"],
                events: {
                    click: function () {
                        if( this.tablet[item.name] )this.tablet[item.name]( this.items[item.name] );
                    }.bind(this)
                }
            }).inject(this.tablet.container);
            if(item.text)this.items[item.name].set("text", item.text)
        }.bind(this));
        this.setAllItemsStatus();
    },
    _setItemNodeDisable : function( itemNode, itemName ){
        var item = itemNode.get("item");
        itemNode.setStyles( this.css[itemName+"_mobile_disable"] );
    },
    _setItemNodeActive: function( itemNode, itemName ){
        if( itemNode.retrieve("status") == "disable" )return;
        var item = itemNode.get("item");
        itemNode.setStyles( this.css[itemName+"_mobile_over"] );
    },
    _setItemNodeNormal: function( itemNode, itemName ){
        if( itemNode.retrieve("status") == "disable" )return;
        var item = itemNode.get("item");
        itemNode.setStyles( this.css[itemName+"_mobile"] );
    }

});

o2.xDesktop.requireApp("Template", "MTooltips", null, false);
o2.widget.Tablet.SizePicker = new Class({
    Implements: [Options, Events],
    Extends: MTooltips,
    options: {
        style : "default",
        axis: "y",      //箭头在x轴还是y轴上展现
        position : { //node 固定的位置
            x : "auto", //x 轴上left center right, auto 系统自动计算
            y : "auto" //y轴上top middle bottom,  auto 系统自动计算
        },
        //event : "click", //事件类型，有target 时有效， mouseenter对应mouseleave，click 对应 container 的  click
        nodeStyles : {
            "min-width" : "260px"
        },
        lineWidth : 1
    },
    initialize : function( container, target, app, data, options, targetCoordinates ){
        //可以传入target 或者 targetCoordinates，两种选一
        //传入target,表示触发tooltip的节点，本类根据 this.options.event 自动绑定target的事件
        //传入targetCoordinates，表示 出发tooltip的位置，本类不绑定触发事件
        if( options ){
            this.setOptions(options);
        }
        this.container = container;
        this.target = target;
        this.targetCoordinates = targetCoordinates;
        this.app = app;
        if(app)this.lp = app.lp;
        this.data = data;

        if( this.target ){
            this.setTargetEvents();
        }
    },
    _customNode : function( node ){
        this.range = [1, 30];
        this.ruleList = ["0.1","0.5","1","5","10", "15","20"];
        o2.UD.getDataJson("sizePicker", function(json) {
            this._loadContent(json);
        }.bind(this));
    },
    changeValue: function(value){
        if( value < 10 ){
            this.lineWidth = (value / 10)
        }else{
            this.lineWidth = value - 9;
        }
        this.drawPreview( this.lineWidth );
        this.fireEvent("select", this.lineWidth )
    },
    reset: function(){
        this.lineWidth = this.options.lineWidth || 1;
        var step;
        if( this.lineWidth < 1 ){
            step = this.lineWidth * 10
        }else{
            step = this.lineWidth + 9
        }
        this.slider.set( parseInt( step ) );
        this.drawPreview( this.lineWidth );
        this.fireEvent("select", this.lineWidth )
    },
    _loadContent: function(json){
        this.rulerContainer = new Element("div",{
            styles : {
                "margin-left": " 23px",
                "margin-right": " 1px",
                "width" : "228px"
            }
        }).inject(this.node);


        this.rulerTitleContainer = new Element("div",{
            styles : { "overflow" : "hidden" }
        }).inject( this.rulerContainer );
        this.ruleList.each( function( rule ){
            new Element("div", {
                text : rule,
                styles : {
                    width : "32px",
                    float : "left",
                    "text-align" : "center"
                }
            }).inject( this.rulerTitleContainer )
        }.bind(this));

        this.rulerContentContainer = new Element("div",{
            styles : { "overflow" : "hidden" }
        }).inject( this.rulerContainer );
        new Element("div", {
            styles : {
                width : "14px",
                height : "10px",
                "text-align" : "center",
                float : "left",
                "border-right" : "1px solid #aaa"
            }
        }).inject( this.rulerContentContainer );
        this.ruleList.each( function( rule, i ){
            if( i == this.ruleList.length - 1 )return;
            new Element("div", {
                styles : {
                    width : "32px",
                    height : "10px",
                    "text-align" : "center",
                    float : "left",
                    "border-right" : "1px solid #aaa"
                }
            }).inject( this.rulerContentContainer )
        }.bind(this));


        this.silderContainer = new Element("div", {
            "height" : "25px",
            "line-height" : "25px",
            "margin-top" : "4px"
        }).inject( this.node );

        this.sliderArea = new Element("div", {styles : {
                "margin-top": "2px",
                "margin-bottom": "10px",
                "height": "10px",
                "overflow": " hidden",
                "margin-left": " 37px",
                "margin-right": " 15px",
                "border-top": "1px solid #999",
                "border-left": "1px solid #999",
                "border-bottom": "1px solid #E1E1E1",
                "border-right": "1px solid #E1E1E1",
                "background-color": "#EEE",
                "width" : "200px"
            }}).inject( this.silderContainer );
        this.sliderKnob = new Element("div", {styles : {
                "height": "8px",
                "width": " 8px",
                "background-color": "#999",
                "z-index": " 99",
                "border-top": "1px solid #DDD",
                "border-left": "1px solid #DDD",
                "border-bottom": "1px solid #777",
                "border-right": "1px solid #777",
                "cursor": "pointer"
            } }).inject( this.sliderArea );

        this.slider = new Slider(this.sliderArea, this.sliderKnob, {
            range: this.range,
            initialStep: 10,
            onChange: function(value){
               this.changeValue( value );
            }.bind(this)
        });

        var previewContainer = new Element("div").inject(this.node);
        new Element("div",{ text : o2.LP.widget.preview, styles : {
                "float" : "left",
                "margin-top" : "5px",
                "width" : "30px"
            }}).inject(this.silderContainer);
        this.previewNode = new Element("div", {
            styles : {
                "margin" : "0px 0px 0px 37px",
                "width" : "200px"
            }
        }).inject( this.node );
        this.canvas = new Element("canvas", {
            width : 200,
            height : 30
        }).inject( this.previewNode );
        this.ctx = this.canvas.getContext("2d");
        this.drawPreview();

        new Element("button", {
            text : o2.LP.widget.reset,
            type : "button",
            styles :{
                "margin-left" : "40px",
                "font-size" : "12px",
                "border-radius" : "3px",
                "cursor" : "pointer" ,
                "border" : "1px solid #ccc",
                "padding" : "5px 10px",
                "background-color" : "#f7f7f7"
            },
            events : {
                click : function(){
                    this.reset();
                }.bind(this)
            }
        }).inject( this.node );
    },
    drawPreview : function( lineWidth ){
        if( !lineWidth )lineWidth = this.options.lineWidth || 1;
        var canvas = this.canvas;
        var ctx = this.ctx;
        ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);

        var coordinates = this.previewNode.getCoordinates();
        var doc = $(document);
        ctx.strokeStyle="#000000"; //线条颜色; 默认 #000000
        //ctx.strokeStyle= this.currentColor || this.options.color; // 线条颜色; 默认 #000000
        ctx.lineWidth=  lineWidth ; //默认1 像素

        ctx.beginPath();
        //ctx.moveTo( (coordinates.bottom-coordinates.top - lineWidth ) / 2, coordinates.left);

        ctx.moveTo( 1 , 15 );

       ctx.lineTo( 200, 15  );
        ctx.stroke();
    }
});

o2.widget.Tablet.EraserRadiusPicker = new Class({
    Extends: o2.widget.Tablet.SizePicker,
    options: {
        lineWidth : 10
    },
    _customNode : function( node ){
        this.range = [1, 30];
        this.ruleList = ["1","5","10", "15","20","25","30"];
        o2.UD.getDataJson("eraserRadiusPicker", function(json) {
            this._loadContent(json);
        }.bind(this));
    },
    changeValue: function(value){
        this.lineWidth = value;
        this.drawPreview( this.lineWidth );
        this.fireEvent("select", this.lineWidth )
    },
    reset: function(){
        this.lineWidth = this.options.lineWidth || 10;
        var step = this.lineWidth;
        this.slider.set( parseInt( step ) );
        this.drawPreview( this.lineWidth );
        this.fireEvent("select", this.lineWidth )
    },
    drawPreview : function( lineWidth ){
        if( !lineWidth )lineWidth = this.options.lineWidth || 10;
        var canvas = this.canvas;
        var ctx = this.ctx;
        ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);

        ctx.strokeStyle="#000000"; //线条颜色; 默认 #000000
        ctx.lineCap = "round";　　//设置线条两端为圆弧
        ctx.lineJoin = "round";　　//设置线条转折为圆弧
        ctx.lineWidth=  lineWidth ;

        // ctx.moveTo(1, 15);
        // ctx.arc(30, 15, 1, 0, 2*Math.PI);
        // ctx.fill();

        ctx.strokeStyle="#000000";
        ctx.beginPath();
        ctx.lineTo( 28, 15  );
        ctx.stroke();

    }
});

MWF.require("MWF.widget.ImageClipper", null, false);
o2.widget.Tablet.ImageClipper = new Class({
    Implements: [Options, Events],
    Extends: MWF.widget.Common,
    options: {
        "imageUrl" : "",
        "resultMaxSize" : 700,
        "description" : "",
        "title": o2.LP.widget.imageClipper,
        "style": "default",
        "aspectRatio": 0
    },
    initialize: function(app, options){
        this.setOptions(options);
        this.app = app;
        this.path = "../x_component_process_Xform/widget/$ImageClipper/";
        this.cssPath = "../x_component_process_Xform/widget/$ImageClipper/"+this.options.style+"/css.wcss";
        this._loadCss();
    },

    load: function(data){
        this.data = data;

        var options = {};
        var width = "700";
        var height = "510";
        width = width.toInt();
        height = height.toInt();

        var size = (( this.app && this.app.content )  || $(document.body) ).getSize();
        var x = (size.x-width)/2;
        var y = (size.y-height)/2;
        if (x<0) x = 0;
        if (y<0) y = 0;
        if (layout.mobile){
            x = 20;
            y = 0;
        }

        var _self = this;
        MWF.require("MWF.xDesktop.Dialog", function() {
            var dlg = new MWF.xDesktop.Dialog({
                "title": this.options.title || "Select Image",
                "style": options.style || "user",
                "top": y,
                "left": x - 20,
                "fromTop": y,
                "fromLeft": x - 20,
                "width": width,
                "height": height,
                "html": "<div></div>",
                "maskNode": this.app ? this.app.content : $(document.body),
                "container": this.app ? this.app.content : $(document.body),
                "buttonList": [
                    {
                        "text": MWF.LP.process.button.ok,
                        "action": function () {
                            var img = _self.image.getResizedImage();
                            _self.fireEvent("ok", [img] );
                            this.close();
                        }
                    },
                    {
                        "text": MWF.LP.process.button.cancel,
                        "action": function () {
                            this.close();
                        }
                    }
                ],
                "onPostShow" : function(){
                    this.node.setStyle("z-index",1003);
                    this.content.setStyle("margin-left","20px");
                }
            });
            dlg.show();

            this.image = new MWF.widget.ImageClipper(dlg.content.getFirst(), {
                "description" : this.options.description,
                "resetEnable" : true
            });
            this.image.load(this.data);
        }.bind(this))
    }

});

o2.widget.Tablet.ImageMover = new Class({
    Implements: [Options, Events],
    options: {
        imageMinSize : 100
    },
    initialize: function(tablet, imageNode, relativeNode, options){
        this.setOptions(options);
        this.tablet = tablet;
        this.imageNode = imageNode;
        this.relativeNode = relativeNode;
        this.path = this.tablet.path + this.tablet.options.style + "/"
    },
    load: function(){
        this.maskNode = new Element("div.maskNode",{
            styles : {
                "width": "100%",
                "height": "100%",
                "opacity": 0.6,
                "position": "absolute",
                "background-color": "#CCC",
                "top": "0px",
                "left": "0px",
                "z-index" : 1002,
                "-webkit-user-select": "none",
                "-moz-user-select": "none",
                "user-select" : "none"
            }
        }).inject($(document.body));

        var coordinates = this.relativeNode.getCoordinates();

        this.node = new Element( "div", {
            styles : {
                "width" : coordinates.width,
                "height" : coordinates.height,
                "position" : "absolute",
                "top" : coordinates.top,
                "left" : coordinates.left,
                "background" : "rgba(255,255,255,0.5)",
                "z-index" : 1003,
                "-webkit-user-select": "none",
                "-moz-user-select": "none",
                "user-select" : "none"
            }
        }).inject($(document.body));

        this.dragNode = new Element("div",{
            styles : {
                "cursor" : "move"
            }
        }).inject( this.node );

        this.imageNode.inject( this.dragNode );

        //this.maskNode.ondragstart = function(){
        //    return false;
        //};
        //this.node.ondragstart = function(){
        //    return false;
        //};
        //this.imageNode.ondragstart = function(){
        //    return false;
        //};

        this.originalImageSize = this.imageNode.getSize();
        this.dragNode.setStyles({
            width : this.originalImageSize.x,
            height : this.originalImageSize.y
        });

        this.okNode = new Element("div",{
            styles : {
                "background" : "url("+ this.path + "icon/ok.png) no-repeat",
                "width" : "16px",
                "height" : "16px",
                "right" : "-20px",
                "top" : "5px",
                "position" : "absolute",
                "cursor" : "pointer"
            },
            events : {
                click : function(){
                    this.ok();
                    this.close();
                }.bind(this)
            }
        }).inject(this.dragNode);

        this.cancelNode = new Element("div",{
            styles : {
                "background" : "url("+ this.path + "icon/cancel.png) no-repeat",
                "width" : "16px",
                "height" : "16px",
                "right" : "-20px",
                "top" : "30px",
                "position" : "absolute",
                "cursor" : "pointer"
            },
            events : {
                click : function(){
                    this.fireEvent("postCancel");
                    this.close();
                }.bind(this)
            }
        }).inject(this.dragNode);

        this.drag = this.dragNode.makeDraggable({
            "container" : this.node,
            "handle": this.dragNode
        });


        this.resizeNode = new Element("div.resizeNode",{ styles :  {
            "cursor" : "nw-resize",
            "position": "absolute",
            "bottom": "0px",
            "right": "0px",
            "border" : "2px solid #52a3f5",
            "width" : "8px",
            "height" : "8px"
        }}).inject(this.dragNode);

        this.docBody = window.document.body;
        this.resizeNode.addEvents({
            "touchstart" : function(ev){
                this.drag.detach();
                this.dragNode.setStyle("cursor", "nw-resize" );
                this.docBody.setStyle("cursor", "nw-resize" );
                this.resizeMode = true;
                this.getOffset(ev);
                ev.stopPropagation();
            }.bind(this),
            "mousedown" : function(ev){
                this.drag.detach();
                this.dragNode.setStyle("cursor", "nw-resize" );
                this.docBody.setStyle("cursor", "nw-resize" );
                this.resizeMode = true;
                this.getOffset(ev);
                ev.stopPropagation();
            }.bind(this),
            "touchmove" : function(ev){
                if(!this.lastPoint)return;
                var offset= this.getOffset(ev);
                this.resizeDragNode( offset );
                ev.stopPropagation();
            }.bind(this),
            "mousemove" : function(ev){
                if(!this.lastPoint)return;
                var offset= this.getOffset(ev);
                this.resizeDragNode( offset );
                ev.stopPropagation();
            }.bind(this),
            "touchend" : function(ev){
                this.drag.attach();
                this.dragNode.setStyle("cursor", "move" );
                this.docBody.setStyle("cursor", "default" );
                this.resizeMode = false;
                this.lastPoint=null;
                ev.stopPropagation();
            }.bind(this),
            "mouseup" : function(ev){
                this.drag.attach();
                this.dragNode.setStyle("cursor", "move" );
                this.docBody.setStyle("cursor", "default" );
                this.resizeMode = false;
                this.lastPoint=null;
                ev.stopPropagation();
            }.bind(this)
        });

        this.bodyMouseMoveFun = this.bodyMouseMove.bind(this);
        this.docBody.addEvent("touchmove", this.bodyMouseMoveFun);
        this.docBody.addEvent("mousemove", this.bodyMouseMoveFun);

        this.bodyMouseEndFun = this.bodyMouseEnd.bind(this);
        this.docBody.addEvent("touchend", this.bodyMouseEndFun);
        this.docBody.addEvent("mouseup", this.bodyMouseEndFun);
    },
    bodyMouseMove: function(ev){
        if(!this.lastPoint)return;
        if( this.resizeMode ){
            var offset= this.getOffset(ev);
            this.resizeDragNode( offset );
        }
    },
    bodyMouseEnd: function(ev){
        this.lastPoint=null;
        if( this.resizeMode ){
            this.drag.attach();
            this.dragNode.setStyle("cursor", "move" );
            this.docBody.setStyle("cursor", "default" );
            this.resizeMode = false;
        }
    },
    resizeDragNode : function(offset){
        var x=offset.x;
        if( x == 0 )return;

        var	y=offset.y;
        if( y == 0 )return;



        var coordinates = this.dragNode.getCoordinates( this.node );
        var containerSize = this.node.getSize();
        var	top=coordinates.top,
            left=coordinates.left,
            width=containerSize.x,
            height=containerSize.y,
            ratio = this.originalImageSize.x / this.originalImageSize.y,
            w,
            h;

        //if( ratio ){
            if( Math.abs(x)/Math.abs(y) > ratio ){
                if( x+coordinates.width+left>width ){
                    return;
                }else{
                    w = x + coordinates.width;
                    h = w / ratio;
                    if( h+top > height ){
                        return;
                    }
                }
            }else{
                if(y+coordinates.height+top>height){
                    return;
                }else{
                    h = y+ coordinates.height;
                    w = h * ratio;
                }
                if( w+left > width ){
                    return;
                }
            }
        //}else{
        //    if( x+coordinates.width+left>width ){
        //        return;
        //    }else{
        //        w = x + coordinates.width
        //    }
        //    if(y+coordinates.height+top>height){
        //        return;
        //    }else{
        //        h = y+ coordinates.height;
        //    }
        //}

        var minWidth = this.options.imageMinSize;
        var minHeight = this.options.imageMinSize;
        w=w< minWidth ? minWidth:w;
        h=h< minHeight ? minHeight:h;

        this.dragNode.setStyles({
            width:w+'px',
            height:h+'px'
        });
        this.imageNode.setStyles({
            width:w+'px',
            height:h+'px'
        });
    },
    getOffset: function(event){
        event=event.event;
        var x,y;
        if(event.touches){
            var touch=event.touches[0];
            x=touch.clientX;
            y=touch.clientY;
        }else{
            x=event.clientX;
            y=event.clientY;
        }

        if(!this.lastPoint){
            this.lastPoint={
                x:x,
                y:y
            };
        }

        var offset={
            x:x-this.lastPoint.x,
            y:y-this.lastPoint.y
        };
        this.lastPoint={
            x:x,
            y:y
        };
        return offset;
    },
    getCoordinates : function(){
        return this.imageNode.getCoordinates( this.node );
    },
    ok : function(){
        this.fireEvent("postOk")
    },
    close : function(){
        this.docBody.removeEvent("touchmove",this.bodyMouseMoveFun);
        this.docBody.removeEvent("mousemove",this.bodyMouseMoveFun);
        this.docBody.removeEvent("touchend",this.bodyMouseEndFun);
        this.docBody.removeEvent("mouseup",this.bodyMouseEndFun);

        //this.backgroundNode.destroy();
        this.maskNode.destroy();
        this.node.destroy();

        delete this;
    }
});


o2.widget.Tablet.Input = new Class({
    Implements: [Options, Events],
    options: {
        minWidth: 100,
        minHeight: 30,
        width: 200,
        height: 60,
        top: 0,
        left: 0,
        isEditing: true,
        editable: true,
        text: ""
    },
    initialize: function (tablet, relativeNode, options) {
        this.setOptions(options);
        this.tablet = tablet;
        this.relativeNode = relativeNode;
        this.path = this.tablet.path + this.tablet.options.style + "/"
    },
    readMode: function(){
        if( this.textarea && !this.textarea.get("value") ){
            this.close();
            return;
        }
        this.options.isEditing = false;
        if(this.drag)this.drag.detach();
        if( this.dragNode )this.dragNode.hide(); //.setStyle("cursor","none");
        if( this.resizeNode )this.resizeNode.hide(); //.setStyle("cursor", "none" );
        if( this.cancelNode )this.cancelNode.hide();
        if( this.textareaWrap )this.textareaWrap.setStyle("border", "1px dashed transparent");
        this.node.setStyle("background" , "rgba(255,255,255,0)")
    },
    editMode: function(){
        if(this.tablet.currentInput)this.tablet.currentInput.readMode();
        this.tablet.currentInput = this;
        this.options.isEditing = true;
        if(this.drag)this.drag.attach();
        if( this.dragNode )this.dragNode.show(); //.setStyle("cursor","move");
        if( this.resizeNode )this.resizeNode.show(); //.setStyle("cursor", "nw-resize" );
        if( this.textareaWrap )this.textareaWrap.setStyle("border", "1px dashed red");
        if( this.cancelNode )this.cancelNode.show();
        this.node.setStyle("background" , "rgba(255,255,255,0.5)")
    },
    draw: function(){
        debugger;
        var text = this.textarea.get("value");
        var coordinates = this.textarea.getCoordinates( this.relativeNode );
        this.tablet.ctx.font = "14px \"Microsoft YaHei\", SimSun, 宋体, serif ";
        this.tablet.ctx.fillText(text, coordinates.left + 5, coordinates.top+15, coordinates.width);
        this.drawed = true;
    },
    load: function(){
        // var coordinates = this.relativeNode.getCoordinates();

        debugger;

        this.relativeCoordinates = this.relativeNode.getCoordinates();
        var top = this.options.top;
        if( top + this.options.height > this.relativeCoordinates.height ){
            top = this.relativeCoordinates.height - this.options.height;
            this.options.top = top;
        }
        var left = this.options.left;
        if( left + this.options.width > this.relativeCoordinates.width ){
            left = this.relativeCoordinates.width - this.options.width;
            this.options.left = left;
        }

        this.node = new Element( "div", {
            styles : {
                "width" : this.options.width+"px",
                "height" : this.options.height+"px",
                "position" : "absolute",
                "top" : top+"px",
                "left" : left+"px",
                "background" : "rgba(255,255,255,0.5)",
                "z-index" : 1003,
                "-webkit-user-select": "none",
                "-moz-user-select": "none",
                "user-select" : "none"
            }
        }).inject(this.relativeNode);


        this.dragNode = new Element("div",{
            styles : {
                "position": "absolute",
                "background": "transparent",
                "cursor" : "move",
                "top": "-10px",
                "right": "-10px",
                "bottom": "-10px",
                "left": "-10px",
                "z-index": 1003
            }
        }).inject( this.node );

        this.textareaWrap = new Element("div", {
            styles: {
                "position": "absolute",
                "border": "1px dashed red",
                "top": "0px",
                "left": "0px",
                "width": "calc( 100% - 2px )",
                "height": "calc( 100% - 2px )",
                "background": "transparent",
                "z-index": 1003
            }
        }).inject(this.node);
        this.textarea = new Element("textarea", {
            "styles": {
                "border": "0px",
                "width": "calc( 100% - 10px )",
                "height": "calc( 100% - 10px )",
                "vertical-align":"top",
                "background": "transparent",
                "resize": "none",
                "padding":"5px"
            },
            events: {
                focus: function () {
                    if( !this.options.isEditing )this.editMode();
                    this.tablet.input();
                }.bind(this)
            }
        }).inject( this.textareaWrap );

        this.drag = this.node.makeDraggable({
            "container" : this.relativeNode,
            "handle": this.dragNode
        });

        this.cancelNode = new Element("div",{
            styles : {
                "background" : "url("+ this.path + "icon/cancel2.png) no-repeat",
                "width" : "16px",
                "height" : "16px",
                "right" : "-8px",
                "top" : "-8px",
                "position" : "absolute",
                "cursor" : "pointer"
            },
            events : {
                click : function(){
                    this.fireEvent("postCancel");
                    this.tablet.currentInput = null;
                    this.close();
                }.bind(this)
            }
        }).inject(this.textareaWrap);


        this.resizeNode = new Element("div.resizeNode",{ styles :  {
                "cursor" : "nw-resize",
                "position": "absolute",
                "bottom": "-5px",
                "right": "-5px",
                "background-color" : "#52a3f5",
                "width" : "10px",
                "height" : "10px"
            }}).inject(this.textareaWrap);

        this.docBody = this.relativeNode; //window.document.body;
        this.resizeNode.addEvents({
            "touchstart" : function(ev){
                if( !this.options.isEditing )return;
                this.drag.detach();
                this.dragNode.setStyle("cursor", "nw-resize" );
                this.docBody.setStyle("cursor", "nw-resize" );
                this.relativeCoordinates = this.relativeNode.getCoordinates();
                this.resizeMode = true;
                // this.getOffset(ev);
                ev.stopPropagation();
            }.bind(this),
            "mousedown" : function(ev){
                if( !this.options.isEditing )return;
                this.drag.detach();
                this.dragNode.setStyle("cursor", "nw-resize" );
                this.docBody.setStyle("cursor", "nw-resize" );
                this.relativeCoordinates = this.relativeNode.getCoordinates();
                this.resizeMode = true;
                // this.getOffset(ev);
                ev.stopPropagation();
            }.bind(this),
            "touchmove" : function(ev){
                if( !this.resizeMode )return;
                var point = this.getLastPoint(ev);
                this.resizeDragNode( point );
                ev.stopPropagation();
            }.bind(this),
            "mousemove" : function(ev){
                if( !this.resizeMode )return;
                var point= this.getLastPoint(ev);
                this.resizeDragNode( point );
                ev.stopPropagation();
            }.bind(this),
            "touchend" : function(ev){
                this.drag.attach();
                this.dragNode.setStyle("cursor", "move" );
                this.docBody.setStyle("cursor", "default" );
                this.resizeMode = false;
                this.lastPoint=null;
                ev.stopPropagation();
            }.bind(this),
            "mouseup" : function(ev){
                this.drag.attach();
                this.dragNode.setStyle("cursor", "move" );
                this.docBody.setStyle("cursor", "default" );
                this.resizeMode = false;
                this.lastPoint=null;
                ev.stopPropagation();
            }.bind(this)
        });

        this.bodyMouseMoveFun = this.bodyMouseMove.bind(this);
        this.docBody.addEvent("touchmove", this.bodyMouseMoveFun);
        this.docBody.addEvent("mousemove", this.bodyMouseMoveFun);

        this.bodyMouseEndFun = this.bodyMouseEnd.bind(this);
        this.docBody.addEvent("touchend", this.bodyMouseEndFun);
        this.docBody.addEvent("mouseup", this.bodyMouseEndFun);

        window.setTimeout(function () {
            this.textarea.focus();
        }.bind(this), 100)
    },
    bodyMouseMove: function(ev){
        if(!this.lastPoint)return;
        if( this.resizeMode ){
            var point = this.getLastPoint(ev);
            this.resizeDragNode( point );
        }
    },
    bodyMouseEnd: function(ev){
        this.lastPoint=null;
        if( this.resizeMode ){
            this.drag.attach();
            this.dragNode.setStyle("cursor", "move" );
            this.docBody.setStyle("cursor", "default" );
            this.resizeMode = false;
        }
    },
    resizeDragNode : function(lastPoint){
        debugger;
        var x=lastPoint.x;
        if( x == 0 )return;

        var	y=lastPoint.y;
        if( y == 0 )return;

        var coordinates = this.node.getCoordinates();

        var	top=coordinates.top,
            left=coordinates.left,
            w,
            h;

       if( x > this.relativeCoordinates.right ){
           return;
       }else{
           w = x - left;
       }
       if( y  > this.relativeCoordinates.bottom){
           return;
       }else{
           h = y - top;
       }

        var minWidth = this.options.minWidth;
        var minHeight = this.options.minHeight;
        w=w< minWidth ? minWidth:w;
        h=h< minHeight ? minHeight:h;

        this.node.setStyles({
            width:w+'px',
            height:h+'px'
        });
    },
    getLastPoint: function(event){
        event=event.event;
        var x,y;
        if(event.touches){
            var touch=event.touches[0];
            x=touch.clientX;
            y=touch.clientY;
        }else{
            x=event.clientX;
            y=event.clientY;
        }
        this.lastPoint={
            x:x,
            y:y
        };
        return this.lastPoint;
    },
    getCoordinates : function(){
        return this.node.getCoordinates( this.relativeNode );
    },
    ok : function(){
        this.fireEvent("postOk")
    },
    close : function( flag ){
        if(!flag)this.tablet.inputList.erase(this);

        this.docBody.removeEvent("touchmove",this.bodyMouseMoveFun);
        this.docBody.removeEvent("mousemove",this.bodyMouseMoveFun);
        this.docBody.removeEvent("touchend",this.bodyMouseEndFun);
        this.docBody.removeEvent("mouseup",this.bodyMouseEndFun);

        //this.backgroundNode.destroy();
        this.node.destroy();

        delete this;
    }
})
