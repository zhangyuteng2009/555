o2.xDesktop.requireApp("process.Xform", "$Elinput", null, false);
/** @class Eldatetime 基于Element UI的日期时间选择组件。
 * @o2cn 日期时间选择
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
 * @see {@link https://element.eleme.cn/#/zh-CN/component/datetime-picker|Element UI DateTimePicker 日期时间选择器}
 */
MWF.xApplication.process.Xform.Eldatetime = MWF.APPEldatetime =  new Class(
    /** @lends o2.xApplication.process.Xform.Eldatetime# */
    {
    Implements: [Events],
    Extends: MWF.APP$Elinput,
    options: {
        "moduleEvents": ["load", "queryLoad", "postLoad"],
        /**
         * 当 input 失去焦点时触发。this.event[0]指向组件实例
         * @event MWF.xApplication.process.Xform.Eldatetime#blur
         * @see {@link https://element.eleme.cn/#/zh-CN/component/datetime-picker|日期时间选择组件的Events章节}
         */
        /**
         * 当 input 获得焦点时触发。this.event[0]指向组件实例
         * @event MWF.xApplication.process.Xform.Eldatetime#focus
         * @see {@link https://element.eleme.cn/#/zh-CN/component/datetime-picker|日期时间选择组件的Events章节}
         */
        /**
         * 用户确认选定的值时触发。this.event[0]为组件绑定值；格式与绑定值一致，可受 value-format 控制
         * @event MWF.xApplication.process.Xform.Eldatetime#change
         * @see {@link https://element.eleme.cn/#/zh-CN/component/datetime-picker|日期时间选择组件的Events章节}
         */
        "elEvents": ["focus", "blur", "change"]
    },
    _queryLoaded: function(){
        var data = this._getBusinessData();
        if( ["datetimerange"].contains(this.json.selectType) ) {
            if (typeOf(data) === "string") this._setBusinessData([data, ""]);
        }else{
            if( typeOf(data) === "array" )this._setBusinessData(data[0] || "");
        }
    },
    _appendVueData: function(){
        if (!this.json.isReadonly) this.json.isReadonly = false;
        if (!this.json.disabled) this.json.disabled = false;
        if (!this.json.clearable) this.json.clearable = false;
        if (!this.json.disabled) this.json.disabled = false;
        if (!this.json.editable) this.json.editable = false;
        if (!this.json.size) this.json.size = "";
        if (!this.json.prefixIcon) this.json.prefixIcon = "";
        if (!this.json.description) this.json.description = "";
        if (!this.json.arrowControl) this.json.arrowControl = false;
        this.json.pickerOptions = {
            firstDayOfWeek: this.json.firstDayOfWeek.toInt()
        }
        if (this.json.disabledDate && this.json.disabledDate.code){
            this.json.pickerOptions.disabledDate = function(date){
                return this.form.Macro.fire(this.json.disabledDate.code, this, date);
            }.bind(this)
        }
        // if(this.json.selectableRange && this.json.selectableRange.code){
        //     this.json.pickerOptions.selectableRange = this.form.Macro.fire(this.json.selectableRange.code, this);
        // }
    },
    _createElementHtml: function() {
        var html = "<el-date-picker";
        html += " v-model=\""+this.json.$id+"\"";
        html += " :type=\"selectType\"";
        html += " :readonly=\"isReadonly\"";
        html += " :disabled=\"disabled\"";
        html += " :editable=\"editable\"";
        html += " :clearable=\"clearable\"";
        html += " :size=\"size\"";
        html += " :prefix-icon=\"prefixIcon\"";
        html += " :range-separator=\"rangeSeparator\"";
        html += " :start-placeholder=\"startPlaceholder\"";
        html += " :end-placeholder=\"endPlaceholder\"";
        html += " :value-format=\"format\"";
        html += " :format=\"format\"";
        html += " :picker-options=\"pickerOptions\"";
        html += " :arrow-control=\"arrowControl\"";
        // html += " :picker-options=\"{" +
            // ":firstDayOfWeek=firstDayOfWeek," +
            // ":disabledDate=\"disabledDateFun\""+
            // "}\"";

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

        html += "</el-date-picker>";
        return html;
    }
}); 
