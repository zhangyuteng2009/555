MWF.require("MWF.widget.Common", null, false);
/** @classdesc $Module 组件类，此类为所有组件的父类。
 * @class
 * @o2category FormComponents
 * @hideconstructor
 * */
MWF.xApplication.process.Xform.$Module = MWF.APP$Module =  new Class(
    /** @lends MWF.xApplication.process.Xform.$Module# */
    {
    Implements: [Events],
    options: {
        /**
         * 组件加载前触发。queryLoad执行的时候，当前组件没有在form里注册，通过this.form.get("fieldId")不能获取到当前组件，需要用this.target获取。
         * @event MWF.xApplication.process.Xform.$Module#queryLoad
         * @event MWF.xApplication.process.Xform.$Module#queryLoad
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 组件加载时触发.
         * @event MWF.xApplication.process.Xform.$Module#load
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 组件加载后触发.
         * @event MWF.xApplication.process.Xform.$Module#postLoad
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        "moduleEvents": ["load", "queryLoad", "postLoad"]
    },
    initialize: function(node, json, form, options){
        /**
         * @summary 组件的节点，mootools封装过的Dom对象，可以直接使用原生的js和moootools方法访问和操作该对象。
         * @see https://mootools.net/core/docs/1.6.0/Element/Element
         * @member {Element}
         * @example
         *  //可以在脚本中获取该组件
         * var field = this.form.get("fieldId"); //获取组件对象
         * field.node.setStyle("font-size","12px"); //给节点设置样式
         */
        this.node = $(node);
        this.node.store("module", this);

        /**
         * @summary 组件的配置信息，比如id,类型,是否只读等等。可以在组件的queryLoad事件里修改该配置来对组件做一些改变。
         * @member {JsonObject}
         * @example
         *  //可以在脚本中获取该组件
         * var json = this.form.get("fieldId").json; //获取组件对象
         * var id = json.id; //获取组件的id
         * var type = json.type; //获取组件的类型，如Textfield 为文本输入组件，Select为下拉组件
         *
         * //在组件queryLoad事件里设置组件只读。
         * //当前组件的queryLoad事件运行时还没有在form里注册，通过this.form.get("fieldId")不能获取到当前组件，需要用this.target获取。
         * var json = this.target.json;
         * json.isReadonly = true; //设置组件为只读。
         */
        this.json = json;

        /**
         * @summary 组件的所在表单对象.
         * @member {MWF.xApplication.process.Xform.Form}
         * @example
         * var form = this.form.get("fieldId").form; //获取组件所在表单对象
         * var container = form.container; //获取表单容器
         */
        this.form = form;


        /**
         * 当前组件在数据表格或者数据模板中时，可以通过此属性获取所在行（条目）对象.
         * @member {MWF.xApplication.process.Xform.Datatemplate.Line|MWF.xApplication.process.Xform.DatatablePC.Line|MWF.xApplication.process.Xform.DatatableMobile.Line}
         * @example
         * //获取当前组件所在数据模板/数据表格的行（条目）对象
         * var line = this.target.parentLine;
         * //获取当前字段所在行下标
         * var index = line.getIndex();
         * //获取当前字段所在条目的subject字段的值
         * var data = line.getModule("subject").getData();
         * //设置当前字段所在条目的subject字段的值
         * line.getModule("subject").setData("test1");
         */
        this.parentLine = null;
    },
    /**
     * 当前组件在数据源组件中时，可以通过此方法获取所在的上级数据源/子数据源/子数项组件.
     * @param {String} [type] 需要获取的类型，"source"为表示数据源,"subSource"表示子数据源,"subSourceItem"表示子数据项组件。
     * 如果该参数省略，则获取离当前组件最近的上述组件。
     * @return {Source|SubSource|SubSourceItem}。
     * @example
     * var source = this.target.getSource(); //获取当前组件的所在子上级数据源/子数据源/子数项组件.
     * var data = source.data; //获取数据
     *
     * var source = this.form.get("fieldId").getSource("source"); //获取数据源组件
     * var data = source.data; //获取数据
     */
    getSource: function( type ){
        if( type ){
            var parent = this.node.getParent();
            while(parent && parent.get("MWFtype")!= type ){
                parent = parent.getParent();
            }
            return (parent) ? parent.retrieve("module") : null;
        }else{
            return this._getSource();
        }
    },
    _getSource: function(){
        var parent = this.node.getParent();
        while(parent && (
            parent.get("MWFtype")!="source" &&
            parent.get("MWFtype")!="subSource" &&
            parent.get("MWFtype")!="subSourceItem"
        )) parent = parent.getParent();
        return (parent) ? parent.retrieve("module") : null;
    },
    /**
     * @summary 隐藏组件.
     * @example
     * this.form.get("fieldId").hide(); //隐藏组件
     */
    hide: function(){
        var dsp = this.node.getStyle("display");
        if (dsp!=="none") this.node.store("mwf_display", dsp);
        this.node.setStyle("display", "none");
        if (this.iconNode) this.iconNode.setStyle("display", "none");
    },
    /**
     * @summary 显示组件.
     * @example
     * this.form.get("fieldId").show(); //显示组件
     */
    show: function(){
        var dsp = this.node.retrieve("mwf_display", dsp);
        this.node.setStyle("display", dsp);
        if (this.iconNode) this.iconNode.setStyle("display", "block");
    },
    load: function(){
        this._loadModuleEvents();
        if (this.fireEvent("queryLoad")){
            this._queryLoaded();
            this._loadUserInterface();
            this._loadStyles();
            this._loadDomEvents();
            //this._loadEvents();

            this._afterLoaded();
            this.fireEvent("postLoad");
            this.fireEvent("load");
        }
    },
    _loadUserInterface: function(){
        //	this.node = this.node;
    },

    _loadStyles: function(){
        if (this.json.styles) Object.each(this.json.styles, function(value, key){
            if ((value.indexOf("x_processplatform_assemble_surface")!=-1 || value.indexOf("x_portal_assemble_surface")!=-1 || value.indexOf("x_cms_assemble_control")!=-1)){
                var host1 = MWF.Actions.getHost("x_processplatform_assemble_surface");
                var host2 = MWF.Actions.getHost("x_portal_assemble_surface");
                var host3 = MWF.Actions.getHost("x_cms_assemble_control");
                if (value.indexOf("/x_processplatform_assemble_surface")!==-1){
                    value = value.replace("/x_processplatform_assemble_surface", host1+"/x_processplatform_assemble_surface");
                }else if (value.indexOf("x_processplatform_assemble_surface")!==-1){
                    value = value.replace("x_processplatform_assemble_surface", host1+"/x_processplatform_assemble_surface");
                }
                if (value.indexOf("/x_portal_assemble_surface")!==-1){
                    value = value.replace("/x_portal_assemble_surface", host2+"/x_portal_assemble_surface");
                }else if (value.indexOf("x_portal_assemble_surface")!==-1){
                    value = value.replace("x_portal_assemble_surface", host2+"/x_portal_assemble_surface");
                }
                if (value.indexOf("/x_cms_assemble_control")!==-1){
                    value = value.replace("/x_cms_assemble_control", host3+"/x_cms_assemble_control");
                }else if (value.indexOf("x_cms_assemble_control")!==-1){
                    value = value.replace("x_cms_assemble_control", host3+"/x_cms_assemble_control");
                }
                value = o2.filterUrl(value);
            }
            this.node.setStyle(key, value);
        }.bind(this));

        // if (["x_processplatform_assemble_surface", "x_portal_assemble_surface"].indexOf(root.toLowerCase())!==-1){
        //     var host = MWF.Actions.getHost(root);
        //     return (flag==="/") ? host+this.json.template : host+"/"+this.json.template
        // }
        //if (this.json.styles) this.node.setStyles(this.json.styles);
    },
    _loadModuleEvents : function(){
        Object.each(this.json.events, function(e, key){
            if (e.code){
                if (this.options.moduleEvents.indexOf(key)!==-1){
                    this.addEvent(key, function(event){
                        return this.form.Macro.fire(e.code, this, event);
                    }.bind(this));
                }
            }
        }.bind(this));
    },
    _loadDomEvents: function(){
        Object.each(this.json.events, function(e, key){
            if (e.code){
                if (this.options.moduleEvents.indexOf(key)===-1){
                    this.node.addEvent(key, function(event){
                        return this.form.Macro.fire(e.code, this, event);
                    }.bind(this));
                }
            }
        }.bind(this));
    },
    _loadEvents: function(){
        Object.each(this.json.events, function(e, key){
            if (e.code){
                if (this.options.moduleEvents.indexOf(key)!==-1){
                    this.addEvent(key, function(event){
                        return this.form.Macro.fire(e.code, this, event);
                    }.bind(this));
                }else{
                    this.node.addEvent(key, function(event){
                        return this.form.Macro.fire(e.code, this, event);
                    }.bind(this));
                }
            }
        }.bind(this));
    },
    addModuleEvent: function(key, fun){
        if (this.options.moduleEvents.indexOf(key)!==-1){
            this.addEvent(key, function(event){
                return (fun) ? fun(this, event) : null;
            }.bind(this));
        }else{
            this.node.addEvent(key, function(event){
                return (fun) ? fun(this, event) : null;
            }.bind(this));
        }
    },
    _getBusinessData: function(id){
        var v;
        if (this.json.section=="yes"){
            v = this._getBusinessSectionData(id);
        }else {
            if (this.json.type==="Opinion"){
                v = this._getBusinessSectionDataByPerson(id);
            }else{
                // return this.form.businessData.data[this.json.id] || "";
                var value = this.getBusinessDataById(null, id);
                return (o2.typeOf(value)!=="null") ? value : "";
                //return this.getBusinessDataById() || "";
            }
        }
        //if (o2.typeOf(v)==="string") v = o2.dtxt(v);
        return v;
    },
    _getBusinessSectionData: function(id){
        switch (this.json.sectionBy){
            case "person":
                return this._getBusinessSectionDataByPerson(id);
            case "unit":
                return this._getBusinessSectionDataByUnit(id);
            case "activity":
                return this._getBusinessSectionDataByActivity(id);
            case "splitValue":
                return this._getBusinessSectionDataBySplitValue(id);
            case "script":
                return this._getBusinessSectionDataByScript(((this.json.sectionByScript) ? this.json.sectionByScript.code : ""), id);
            default:
                // return this.form.businessData.data[this.json.id] || "";
                return this.getBusinessDataById(null, id) || "";
        }
    },
    _getBusinessSectionDataByPerson: function(id){
        this.form.sectionListObj[id||this.json.id] = layout.desktop.session.user.id;
        // var dataObj = this.form.businessData.data[this.json.id];
        var dataObj = this.getBusinessDataById(null, id);
        return (dataObj) ? (dataObj[layout.desktop.session.user.id] || "") : "";
    },
    _getBusinessSectionDataByUnit: function(id){
        this.form.sectionListObj[id || this.json.id] = "";
        // var dataObj = this.form.businessData.data[this.json.id];
        var dataObj = this.getBusinessDataById(null, id);
        if (!dataObj) return "";
        var key = (this.form.businessData.task) ? this.form.businessData.task.unit : "";
        if (key) this.form.sectionListObj[id||this.json.id] = key;
        return (key) ? (dataObj[key] || "") : "";
    },
    _getBusinessSectionDataByActivity: function(id){
        this.form.sectionListObj[id||this.json.id] = "";
        // var dataObj = this.form.businessData.data[this.json.id];
        var dataObj = this.getBusinessDataById(null, id);
        if (!dataObj) return "";
        var key = (this.form.businessData.work) ? this.form.businessData.work.activity : "";
        if (key) this.form.sectionListObj[id||this.json.id] = key;
        return (key) ? (dataObj[key] || "") : "";
    },
    _getBusinessSectionDataBySplitValue: function(id){
        this.form.sectionListObj[id||this.json.id] = "";
        // var dataObj = this.form.businessData.data[this.json.id];
        var dataObj = this.getBusinessDataById(null, id);
        if (!dataObj) return "";
        var key = (this.form.businessData.work) ? this.form.businessData.work.splitValue : "";
        if (key) this.form.sectionListObj[id||this.json.id] = key;
        return (key) ? (dataObj[key] || "") : "";
    },
    _getBusinessSectionDataByScript: function(code, id){
        this.form.sectionListObj[id||this.json.id] = "";
        // var dataObj = this.form.businessData.data[this.json.id];
        var dataObj = this.getBusinessDataById(null, id);
        if (!dataObj) return "";
        var key = this.form.Macro.exec(code, this);
        if (key) this.form.sectionListObj[id||this.json.id] = key;
        return (key) ? (dataObj[key] || "") : "";
    },
    _setEnvironmentData: function(v){
        if (this.json.section=="yes"){
            this._setEnvironmentSectionData(v);
        }else {
            if (this.json.type==="Opinion"){
                this._setEnvironmentSectionDataByPerson(v);
            }else{
                this.setEnvironmentDataById(v);
            }
        }
    },
    _setEnvironmentSectionData: function(v){
        switch (this.json.sectionBy){
            case "person":
                var key = layout.desktop.session.user.id;
                this._setEnvironmentSectionDataByKey(key, v);
                break;
            case "unit":
                var key = (this.form.businessData.task) ? this.form.businessData.task.unit : "";
                this._setEnvironmentSectionDataByKey(key, v);
                break;
            case "activity":
                var key = (this.form.businessData.work) ? this.form.businessData.work.activity : "";
                this._setEnvironmentSectionDataByKey(key, v);
                break;
            case "splitValue":
                var key = (this.form.businessData.work) ? this.form.businessData.work.splitValue : "";
                this._setEnvironmentSectionDataByKey(key, v);
                break;
            case "script":
                var key = this.form.Macro.exec(this.json.sectionByScript.code, this);
                this._setEnvironmentSectionDataByKey(key, v);
                break;
            default:
                this.setEnvironmentDataById(v);
        }
    },
    _setEnvironmentSectionDataByKey: function(key, v){
        if (key){
            var evdata = this.getBusinessDataById(this.form.Macro.environment.data);
            var evdata;
            if (!evdata){
                evdata = this.setEnvironmentDataById({});
            }
            if (!evdata.hasOwnProperty(key)){
                evdata.add(key, v);
            }else{
                evdata[key] = v;
            }
        }
    },
    setEnvironmentDataById: function(v){
        //对id类似于 xx..0..xx 的字段进行拆分
        var evdata = this.form.Macro.environment.data;
        if(this.json.id.indexOf("..") < 1){
            if (!evdata.hasOwnProperty(this.json.id)){
                evdata.add(this.json.id, v);
            }else{
                evdata[this.json.id] = v;
            }

        }else{
            var idList = this.json.id.split("..");
            idList = idList.map( function(d){ return d.test(/^\d+$/) ? d.toInt() : d; });

            //var data = this.form.businessData.data;
            var lastIndex = idList.length - 1;

            for(var i=0; i<=lastIndex; i++){
                var id = idList[i];
                if( !id && id !== 0 )return;

                if( i === lastIndex ){
                    if (!evdata.hasOwnProperty(id)){
                        evdata.add(id, v);
                    }else{
                        evdata[id] = v;
                    }
                }else{
                    var nexId = idList[i+1];
                    if(o2.typeOf(nexId) === "number"){ //下一个ID是数字
                        if( !evdata[id] && o2.typeOf(evdata[id]) !== "array" ){
                            evdata.add(id, []);
                        }
                        if( nexId > evdata[id].length ){ //超过了最大下标，丢弃
                            return;
                        }
                    }else{ //下一个ID是字符串
                        if( !evdata[id] || o2.typeOf(evdata[id]) !== "object"){
                            evdata.add(id, {});
                        }
                    }
                    evdata = evdata[id];
                }
            }
        }
        return evdata;
    },

    _setBusinessData: function(v, id){
        //if (o2.typeOf(v)==="string") v = o2.txt(v);
        if (this.json.section=="yes"){
            this._setBusinessSectionData(v, id);
        }else {
            if (this.json.type==="Opinion"){
                this._setBusinessSectionDataByPerson(v, id);
            }else{
                this.setBusinessDataById(v, id);
                if (this.json.isTitle) this.form.businessData.$work.title = v;
            }
        }
    },
    _setBusinessSectionData: function(v, id){
        switch (this.json.sectionBy){
            case "person":
                this._setBusinessSectionDataByPerson(v, id);
                break;
            case "unit":
                this._setBusinessSectionDataByUnit(v, id);
                break;
            case "activity":
                this._setBusinessSectionDataByActivity(v, id);
                break;
            case "splitValue":
                this._setBusinessSectionDataBySplitValue(v, id);
                break;
            case "script":
                this._setBusinessSectionDataByScript(this.json.sectionByScript.code, v, id);
                break;
            default:
                this.setBusinessDataById(v, id);
        }
    },
    _setBusinessSectionDataByPerson: function(v, id){
        var key = layout.desktop.session.user.id;
        this._setBusinessSectionDataByKey(key, v, id);
    },
    _setBusinessSectionDataByUnit: function(v, id){
        var key = (this.form.businessData.task) ? this.form.businessData.task.unit : "";
        this._setBusinessSectionDataByKey(key, v, id);
    },
    _setBusinessSectionDataByActivity: function(v, id){
        var key = (this.form.businessData.work) ? this.form.businessData.work.activity : "";
        this._setBusinessSectionDataByKey(key, v, id);
    },
    _setBusinessSectionDataBySplitValue: function(v, id){
        var key = (this.form.businessData.work) ? this.form.businessData.work.splitValue : "";
        this._setBusinessSectionDataByKey(key, v, id);
    },
    _setBusinessSectionDataByScript: function(code, v, id){
        var key = this.form.Macro.exec(code, this);
        this._setBusinessSectionDataByKey(key, v, id);
    },
    _setBusinessSectionDataByKey: function(key, v, id){
        if (key){
            var dataObj = this.getBusinessDataById(null, id);
            var evdata;
            if (!dataObj){
                dataObj = {};
                evdata = this.setBusinessDataById(dataObj, id);
            }
            dataObj[key] = v;
            if (evdata) evdata.check(key, v);
        }
    },
    getBusinessDataById: function(d, id){
        var data = d || this.form.businessData.data;
        var thisId = id || this.json.id;
        //对id类似于 xx..0..xx 的字段进行拆分
        if(thisId.indexOf("..") < 1){
            return data[thisId];
        }else{
            var idList = thisId.split("..");
            idList = idList.map( function(d){ return d.test(/^\d+$/) ? d.toInt() : d; });

            var lastIndex = idList.length - 1;

            for(var i=0; i<=lastIndex; i++){
                var id = idList[i];
                if( !id && id !== 0 )return null;
                if( ["object","array"].contains(o2.typeOf(data)) ){
                    if( i === lastIndex ){
                        return data[id];
                    }else{
                        data = data[id];
                    }
                }else{
                    return null;
                }
            }
        }
    },
    _checkEvdata: function(evdata, id, v){
        switch (o2.typeOf(evdata)){
            case "array":

                break;
            default:
                evdata.check(id, v);
        }
    },
    setBusinessDataById: function(v, id){
        //对id类似于 xx..0..xx 的字段进行拆分
        var evdata = this.form.Macro.environment.data;
        var data = this.form.businessData.data;
        var thisId = id || this.json.id;
        if(thisId.indexOf("..") < 1){
            data[thisId] = v;
            this._checkEvdata(evdata, thisId, v);
            //this.form.businessData.data[this.json.id] = v;
        }else{
            var idList = thisId.split("..");
            idList = idList.map( function(d){ return d.test(/^\d+$/) ? d.toInt() : d; });

            //var data = this.form.businessData.data;
            var lastIndex = idList.length - 1;

            for(var i=0; i<=lastIndex; i++){
                var id = idList[i];
                if( !id && id !== 0 )return;

                if( i === lastIndex ){
                    data[id] = v;
                    //evdata.check(id, v);
                    this._checkEvdata(evdata, id, v);
                }else{
                    var nexId = idList[i+1];
                    if(o2.typeOf(nexId) === "number"){ //下一个ID是数字
                        if( !data[id] && o2.typeOf(data[id]) !== "array" ){
                            data[id] = [];
                            //evdata.check(id, []);
                            this._checkEvdata(evdata, id, []);
                        }
                        if( nexId > data[id].length ){ //超过了最大下标，丢弃
                            return;
                        }
                    }else{ //下一个ID是字符串
                        if( !data[id] || o2.typeOf(data[id]) !== "object"){
                            data[id] = {};
                            //evdata.check(id, {});
                            this._checkEvdata(evdata, id, {});
                        }
                    }
                    data = data[id];
                    evdata = evdata[id];
                }
            }
        }
        return evdata;
    },

    _queryLoaded: function(){},
    _afterLoaded: function(){},

    setValue: function(){
    },
    focus: function(){
        this.node.focus();
    },

    _getModuleByPath: function( path ){
        /*
        注: 系统的数据中允许多层路径，id上通过..来区分层次：
        1、单层或者是最外层，填"fieldId"，表示表单上的直接组件。
        2、如果有多层数据模板，"./fieldId"表示和当前组件id同层次的组件，"../fieldId"表示和上一层组件同层次的组件，以此类推。
        3、如果有多层数据模板，也可通过"datatemplateId.*.datatemplateId2.*.fieldId"来表示全层次路径。datatemplateId表示第一层数据模板的id，datatemplateId2表示第二层的id。
         */
        if(!path)return;
        var idList = this.json.id.split("..");
        if( path.contains("*") ){ //允许path中包含*，替代当前path的层次
            var paths = path.split(".");
            for( var i=0; i<paths.length; i++ ){
                if( paths[i].contains("*") && idList[i] ){
                    var key = paths[i].replace("*", idList[i]);
                    key = this.form.Macro.exec("return "+key, this);
                    paths[i] = (key||"").toString();
                }
            }
            path = paths.join("..");
        }else if( path.contains("./") ){

            var lastName = path.substring(path.indexOf("./")+2, path.length);
            var level = (path.substring(0, path.indexOf("./"))+".").split(".").length-1; // /前面有几个.

            var idList_copy = Array.clone(idList);
            if( idList_copy.length > level*2 ){
                for( var i=0; i<level; i++ ){
                    idList_copy.pop();
                    if( i > 0)idList_copy.pop();
                }
                path = idList_copy.join("..")+".."+lastName;
            }else{
                idList_copy[idList_copy.length-1] = lastName;
                path = idList_copy.join("..")
            }
        }

        return this.form.all[path];
    }

});
