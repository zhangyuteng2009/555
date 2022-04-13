o2.xDesktop.requireApp("process.Xform", "$Elinput", null, false);
/** @class Elcascader 基于Element UI的级联选择框组件。
 * @o2cn 级联选择框
 * @example
 * //可以在脚本中获取该组件
 * //方法1：
 * var input = this.form.get("name"); //获取组件
 * //方法2
 * var input = this.target; //在组件事件脚本中获取
 * @extends MWF.xApplication.process.Xform.$Module
 * @o2category FormComponents
 * @o2range {Process|CMS|Portal}
 * @hideconstructor
 * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|Element UI Cascader 级联选择器}
 */
MWF.xApplication.process.Xform.Elcascader = MWF.APPElcascader =  new Class(
    /** @lends o2.xApplication.process.Xform.Elcascader# */
    {
    Implements: [Events],
    Extends: MWF.APP$Elinput,
    options: {
        "moduleEvents": ["load", "queryLoad", "postLoad"],
        /**
         * 当获得焦点时触发。this.event[0]指向Event
         * @event MWF.xApplication.process.Xform.Elcascader#focus
         * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|级联选择框的Cascader Events章节}
         */
        /**
         * 当失去焦点时触发。this.event[0]指向Event
         * @event MWF.xApplication.process.Xform.Elcascader#blur
         * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|级联选择框的Cascader Events章节}
         */
        /**
         * 当选中节点变化时触发。this.event[0]为选中节点的值
         * @event MWF.xApplication.process.Xform.Elcascader#change
         * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|级联选择框的Cascader Events章节}
         */
        /**
         * 下拉框出现/隐藏时触发。this.event[0]的值：出现则为 true，隐藏则为 false
         * @event MWF.xApplication.process.Xform.Elcascader#visible-change
         * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|级联选择框的Cascader Events章节}
         */
        /**
         * 在多选模式下，移除Tag时触发。this.event[0]为移除的Tag对应的节点的值
         * @event MWF.xApplication.process.Xform.Elcascader#remove-tag
         * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|级联选择框的Cascader Events章节}
         */
        /**
         * 当展开节点发生变化时触发。this.event[0]指向各父级选项值组成的数组
         * @event MWF.xApplication.process.Xform.Elcascader#expand-change
         * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|级联选择框的Cascader Events章节}
         */
        /**
         * 过滤函数调用之前的钩子函数。this.event[0]指向value参数：如果该函数的返回值是 false 或者是一个被拒绝的Promise，那么接下来的过滤便不会执行。
         * @event MWF.xApplication.process.Xform.Elcascader#before-filter
         * @see {@link https://element.eleme.cn/#/zh-CN/component/cascader|级联选择框的Cascader Events章节}
         */
        "elEvents": ["focus", "blur", "change", "visible-change", "remove-tag", "expand-change", "before-filter"]
    },
    // _loadNode: function(){
    //     if (this.isReadonly()) this.json.disabled = true;
    //     this._loadNodeEdit();
    // },
    _appendVueData: function(){
        this.form.Macro.environment.data.check(this.json.id);
        this.json[this.json.id] = this._getBusinessData();

        if (!this.json.options) this.json.options = [];
        if (!this.json.clearable) this.json.clearable = false;
        if (!this.json.size) this.json.size = "";
        if (!this.json.popperClass) this.json.popperClass = "";
        if (this.json.showAllLevels!==false) this.json.showAllLevels = true;
        if (!this.json.separator) this.json.separator = "/";
        if (!this.json.disabled) this.json.disabled = false;
        if (!this.json.description) this.json.description = "";
        if (!this.json.filterable) this.json.filterable = false;
        if (!this.json.collapseTags) this.json.collapseTags = false;
        if (!this.json.props) this.json.props = {};

        if (!this.json.props.expandTrigger) this.json.props.expandTrigger = "click";
        if (!this.json.props.multiple) this.json.props.multiple = false;
        if (this.json.props.emitPath!==false) this.json.props.emitPath = true;
        if (!this.json.props.lazy) this.json.props.lazy = false;
        if (!this.json.props.lazyLoad) this.json.props.lazyLoad = null;
        if (!this.json.props.value) this.json.props.value = "value";
        if (!this.json.props.label) this.json.props.label = "label";
        if (!this.json.props.children) this.json.props.children = "children";
        if (!this.json.props.disabled) this.json.props.disabled = "disabled";
        if (!this.json.props.leaf) this.json.props.leaf = "leaf";

        this._loadOptions();

        //if (this.json.props.multiple===true) if (!this.json[this.json.id] || !this.json[this.json.id].length) this.json[this.json.id] = [];
        if (this.json.props.multiple===true) if (!this.json[this.json.$id] || !this.json[this.json.$id].length) this.json[this.json.$id] = [];
    },
    appendVueMethods: function(methods){
        if (this.json.filterMethod && this.json.filterMethod.code){
            var fn = this.form.Macro.exec(this.json.filterMethod.code, this);
            methods.$filterMethod = function(){
                fn.apply(this, arguments);
            }.bind(this);
        }
        if (this.json.lazyLoadScript && this.json.lazyLoadScript.code){
            var fn = this.form.Macro.exec(this.json.lazyLoadScript.code, this);
            this.json.props.lazyLoad = function(){
                fn.apply(this, arguments);
            }.bind(this);
        }
        if (this.json.beforeFilter && this.json.beforeFilter.code){
            var fn = this.form.Macro.exec(this.json.beforeFilter.code, this);
            methods.$beforeFilter = function(){
                fn.apply(this, arguments);
            }.bind(this);
        }
    },

    _setOptionsWithCode: function(code){
        var v = this.form.Macro.exec(code, this);
        if (v.then){
            v.then(function(o){
                if (o2.typeOf(o)==="array"){
                    this.json.options = o;
                    this.json.$options = o;
                }
            }.bind(this));
        }else if (o2.typeOf(v)==="array"){
            this.json.options = v;
            this.json.$options = v;
        }
    },
    _loadOptions: function(){
        if (this.json.itemsScript && this.json.itemsScript.code)  this._setOptionsWithCode(this.json.itemsScript.code);
    },
    _createElementHtml: function(){

        if (!this.json.options) this.json.options = [];
        if (!this.json.clearable) this.json.clearable = false;
        if (!this.json.size) this.json.size = "";
        if (!this.json.popperClass) this.json.popperClass = "";
        if (this.json.showAllLevels!==false) this.json.showAllLevels = true;
        if (!this.json.separator) this.json.separator = "/";
        if (!this.json.disabled) this.json.disabled = false;
        if (!this.json.description) this.json.description = "";
        if (!this.json.filterable) this.json.filterable = false;
        if (!this.json.props) this.json.props = {};

        var html = "<el-cascader ";
        html += " v-model=\""+this.json.$id+"\"";
        html += " :clearable=\"clearable\"";
        html += " :size=\"size\"";
        html += " :filterable=\"filterable\"";
        html += " :disabled=\"disabled\"";
        html += " :placeholder=\"description\"";
        html += " :options=\"options\"";
        html += " :collapse-tags=\"collapseTags\"";
        html += " :show-all-levels=\"showAllLevels\"";
        html += " :separator=\"separator\"";
        html += " :popper-class=\"popperClass\"";
        html += " :props=\"props\"";

        if (this.json.filterMethod && this.json.filterMethod.code){
            html += " :filter-method=\"$filterMethod\"";
        }
        if (this.json.beforeFilter && this.json.beforeFilter.code){
            html += " :before-filter=\"$beforeFilter\"";
        }

        this.options.elEvents.forEach(function(k){
            html += " @"+k+"=\"$loadElEvent_"+k.camelCase()+"\"";
        });

        if (this.json.elProperties){
            Object.keys(this.json.elProperties).forEach(function(k){
                if (this.json.elProperties[k]) html += " "+k+"=\""+this.json.elProperties[k]+"\"";
            }, this);
        }

        if (this.json.elStyles) html += " :style=\"elStyles\"";
        html += ">";

        if (this.json.vueSlot) html += this.json.vueSlot;

        html += "</el-cascader >";
        return html;
    },
    //__setReadonly: function(data){},
    getCheckedNodes: function(leafOnly){
        return (this.vm) ? this.vm.getCheckedNodes(leafOnly) : null;
    },
    __setReadonly: function(data){
        if (this.isReadonly()){
            this._loadOptions();
            Promise.resolve(this.json.options).then(function(options){
                if (data){
                    var text = this.__getOptionsText(options, data);
                    this.node.set("text", text);
                }
            }.bind(this));
        }
    },
    __getOptionsText: function(options, values){
        debugger;
        if (!!this.json.props.multiple){
            var text = [];
            values.forEach(function(v){
                text = text.concat(this.__getOptionsTextValue(options, v));
            }.bind(this));
            return text.join(",")
        }else{
            return this.__getOptionsTextValue(options, values).join(",");
        }
    },
    __getOptionsTextValue: function(options, values, prefix, prefixLabel){
        var text = [];
        var v = values.join("/");
        options.forEach(function(op){
            var opValue = (prefix) ? prefix + "/" + op[this.json.props.value] : op[this.json.props.value];
            var opLabel = (prefixLabel) ? prefixLabel + "/" + op[this.json.props.label] : op[this.json.props.label];
            if (opValue == v) {
                text.push(opLabel);
            }else if (v.startsWith(opValue) && op[this.json.props.children] && op[this.json.props.children].length){
                text = text.concat(this.__getOptionsTextValue(op[this.json.props.children], values, opValue, opLabel));
            }
        }.bind(this));
        if (!this.json.showAllLevels){
            return text.map(function(t){
                return t.substring(t.indexOf("/")+1, t.length);
            });
        }else{
            return text;
        }
    }
}); 
