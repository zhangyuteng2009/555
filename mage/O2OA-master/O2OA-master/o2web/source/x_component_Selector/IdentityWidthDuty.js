MWF.xApplication.Selector = MWF.xApplication.Selector || {};
MWF.xDesktop.requireApp("Selector", "Identity", null, false);
MWF.xApplication.Selector.IdentityWidthDuty = new Class({
    Extends: MWF.xApplication.Selector.Identity,
    options: {
        "style": "default",
        "count": 0,
        "title": "",
        "dutys": [],
        "units": [],
        "values": [],
        "zIndex": 1000,
        "expand": false,
        "noUnit" : false,
        "include" : [], //增加的可选项
        "resultType" : "", //可以设置成个人，那么结果返回个人
        "expandSubEnable": true,
        "selectAllEnable" : true, //分类是否允许全选下一层
        "exclude" : [],
        "selectType" : "identity"
    },
    setInitTitle: function(){
        this.setOptions({"title": MWF.xApplication.Selector.LP.selectIdentity});
    },
    _init : function(){
        this.selectType = "identity";
        this.className = "IdentityWidthDuty"
    },
    loadSelectItems: function(addToNext){
        this.loadingCountDuty = "wait";
        this.allUnitObjectWithDuty = {};
        var afterLoadSelectItemFun = this.afterLoadSelectItem.bind(this);
        if( this.options.disabled ){
            this.afterLoadSelectItem();
            return;
        }

        if( this.options.resultType === "person" ){
            if( this.titleTextNode ){
                this.titleTextNode.set("text", MWF.xApplication.Selector.LP.selectPerson );
            }else{
                this.options.title = MWF.xApplication.Selector.LP.selectPerson;
            }
        }
        if (this.options.dutys.length){
            var dutyLoaded = 0;

            var loadDutySuccess = function () {
                dutyLoaded++;
                if( dutyLoaded === this.options.dutys.length ){
                    this.dutyLoaded = true;
                    if( this.includeLoaded ){
                        afterLoadSelectItemFun();
                    }
                }
            }.bind(this);

            this.loadInclude( function () {
                this.includeLoaded = true;
                if( this.dutyLoaded ){
                    afterLoadSelectItemFun();
                }
            }.bind(this));

            var loadDuty = function () {
                if( this.isCheckStatusOrCount() ){
                    this.loadingCountDuty = "ready";
                    this.checkLoadingCount();
                }
                this.options.dutys.each(function(duty){
                    var data = {"name": duty, "id":duty};
                    var category = this._newItemCategory("ItemCategory",data, this, this.itemAreaNode);
                    this.subCategorys.push(category);
                    this.allUnitObjectWithDuty[data.name] = category;
                    loadDutySuccess();
                }.bind(this));
            }.bind(this);

            if( this.options.units.length === 0 ){
                loadDuty();
            }else{
                var unitList = [];
                this.options.units.each(function(u) {
                    var unitName = typeOf(u) === "string" ? u : (u.distinguishedName || u.unique || u.levelName || u.id);
                    if (unitName)unitList.push( unitName )
                });

                debugger;

                if( !this.options.expandSubEnable ){
                    this.allUnitNames = unitList;
                    loadDuty();
                }else{
                    var unitObjectList = [];
                    var loadNestedUnit = function(){
                        MWF.Actions.get("x_organization_assemble_express").listUnitSubNested({"unitList": unitList }, function(json1){
                            var unitNames = [];
                            //排序
                            if( this.options.units.length === 1 ){
                                // unitNames = unitList.concat( json1.data );
                                unitNames = Array.clone(unitList);
                                for( var i=0; i<json1.data.length; i++ ){
                                    if( !unitNames.contains(json1.data[i].distinguishedName) ){
                                        unitNames.push( json1.data[i].distinguishedName );
                                    }
                                }
                            }else{
                                unitObjectList.each( function ( u ) {
                                    unitNames.push( u.distinguishedName || u.unique || u.levelName || u.id );
                                    for( var i=0; i<json1.data.length; i++ ){
                                        if( json1.data[i].levelName.indexOf(u.levelName) > -1 ){
                                            unitNames.push( json1.data[i].distinguishedName );
                                        }
                                    }
                                })
                            }
                            this.allUnitNames = unitNames;
                            loadDuty();
                        }.bind(this), null);
                    }.bind(this);


                    var flag = false; //需要获取层次名用于排序
                    if( this.options.units.length === 1 ){
                        loadNestedUnit();
                    }else{
                        this.options.units.each(function(u) {
                            if (typeOf(u) === "string" ) {
                                u.indexOf("/") === -1 ? (flag = true) : unitObjectList.push( { levelName : u } );
                            } else {
                                u.levelName ? unitObjectList.push( u ) : (flag = true);
                            }
                        });
                        if( flag ){ //需要获取层次名来排序
                            o2.Actions.load("x_organization_assemble_express").UnitActions.listObject( function (json) {
                                unitObjectList = json.data || [];
                                loadNestedUnit();
                            }.bind(this) )
                        }else{
                            loadNestedUnit();
                        }
                    }
                }
            }
        }

        if( this.isCheckStatusOrCount() ) {
            this.loadingCountInclude = "wait";
            this.loadIncludeCount();
        }
    },

    search: function(){
        var key = this.searchInput.get("value");
        if (key){
            this.initSearchArea(true);
            var createdId = this.searchInItems(key) || [];
            if( this.options.include && this.options.include.length ){
                this.includeObject.listByFilter( "key", key, function( array ){
                    array.each( function(d){
                        if( !createdId.contains( d.distinguishedName ) ){
                            if( !this.isExcluded( d ) ) {
                                this._newItem( d, this, this.itemSearchAreaNode);
                            }
                        }
                    }.bind(this))
                }.bind(this))
            }
        }else{
            this.initSearchArea(false);
        }
    },
    listPersonByPinyin: function(node){
        this.searchInput.focus();
        var pinyin = this.searchInput.get("value");
        pinyin = pinyin+node.get("text");
        this.searchInput.set("value", pinyin);
        this.search();
    },

    checkLoadSelectItems: function(){
        if (!this.options.units.length){
            this.loadSelectItems();
        }else{
            this.loadSelectItems();
        }
    },

    _scrollEvent: function(y){
        return true;
    },
    _getChildrenItemIds: function(){
        return null;
    },
    _newItemCategory: function(type, data, selector, item, level, category, delay){
        return new MWF.xApplication.Selector.IdentityWidthDuty[type](data, selector, item, level, category, delay)
    },

    _listItemByKey: function(callback, failure, key){
        if (this.options.units.length) key = {"key": key, "unitList": this.options.units};
        this.orgAction.listIdentityByKey(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, key);
    },
    _getItem: function(callback, failure, id, async){
        this.orgAction.getIdentity(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, ((typeOf(id)==="string") ? id : id.distinguishedName), async);
    },
    _newItemSelected: function(data, selector, item, selectedNode){
        return new MWF.xApplication.Selector.IdentityWidthDuty.ItemSelected(data, selector, item, selectedNode)
    },
    _listItemByPinyin: function(callback, failure, key){
        if (this.options.units.length) key = {"key": key, "unitList": this.options.units};
        this.orgAction.listIdentityByPinyin(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, key);
    },
    _newItem: function(data, selector, container, level, category, delay){
        return new MWF.xApplication.Selector.IdentityWidthDuty.Item(data, selector, container, level, category, delay);
    },
    _newItemSearch: function(data, selector, container, level){
        return new MWF.xApplication.Selector.IdentityWidthDuty.SearchItem(data, selector, container, level);
    },
    uniqueIdentityList: function(list){
        var items = [], map = {};
        (list||[]).each(function(d) {
            if (d.distinguishedName || d.unique) {
                if ((!d.distinguishedName || !map[d.distinguishedName]) && (!d.unique || !map[d.unique])) {
                    items.push(d);
                    map[d.distinguishedName] = true;
                    map[d.unique] = true;
                }
            } else {
                items.push(d);
            }
        })
        return items;
    },
    loadIncludeCount: function(){

        var unitList = [];
        var groupList = [];

        if (this.options.include.length > 0) {
            this.options.include.each(function (d) {
                var dn = typeOf(d) === "string" ? d : d.distinguishedName;
                var flag = dn.split("@").getLast().toLowerCase();
                if (flag === "u") {
                    unitList.push(dn);
                } else if (flag === "g") {
                    groupList.push(dn)
                }
            })
        }

        if(unitList.length || groupList.length){
            this._loadUnitAndGroupCount(unitList, groupList, function () {
                this.loadingCountInclude = "ready";
                this.checkLoadingCount();
            }.bind(this));
        }else{
            this.loadingCountInclude = "ignore";
            this.checkLoadingCount();
        }
    },
    checkLoadingCount: function(){
        if(this.loadingCountDuty === "ready" && this.loadingCountInclude === "ready"){
            this.checkCountAndStatus();
            this.loadingCount = "done";
        }else if(this.loadingCountDuty === "ready" && this.loadingCountInclude === "ignore"){
            this.loadingCount = "done";
        }
    },
    addSelectedCount: function( itemOrItemSelected, count, items ){
        if( this.loadingCountInclude === "ignore" ){
            this._addSelectedCountWithDuty(itemOrItemSelected, count, items);
        }else{
            this._addSelectedCountWithDuty(itemOrItemSelected, count, items);
            this._addSelectedCount(itemOrItemSelected, count);
        }

    },
    _addSelectedCountWithDuty: function( itemOrItemSelected, count, items ){
        var itemData = itemOrItemSelected.data;
        debugger;
        items.each(function(item){
            if(item.category && item.category._addSelectedCount && item.category.className === "ItemCategory"){
                item.category._addSelectedCount( count );
            }
        }.bind(this));
    },
    //_listItemNext: function(last, count, callback){
    //    this.action.listRoleNext(last, count, function(json){
    //        if (callback) callback.apply(this, [json]);
    //    }.bind(this));
    //}
});
MWF.xApplication.Selector.IdentityWidthDuty.Item = new Class({
    Extends: MWF.xApplication.Selector.Identity.Item,
    _getShowName: function(){
        return this.data.name;
    },
    _getTtiteText: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/personicon.png)");
    }
});
MWF.xApplication.Selector.IdentityWidthDuty.SearchItem = new Class({
    Extends: MWF.xApplication.Selector.Identity.Item,
    _getShowName: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    }
});

MWF.xApplication.Selector.IdentityWidthDuty.ItemSelected = new Class({
    Extends: MWF.xApplication.Selector.Identity.ItemSelected,
    _getShowName: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _getTtiteText: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/personicon.png)");
    }
});

MWF.xApplication.Selector.IdentityWidthDuty.ItemCategory = new Class({
    Extends: MWF.xApplication.Selector.Identity.ItemCategory,
    createNode: function(){
        this.className = "ItemCategory";
        this.node = new Element("div", {
            "styles": this.selector.css.selectorItemCategory_department,
            "title" : this._getTtiteText()
        }).inject(this.container);
    },
    _getShowName: function(){
        return this.data.name;
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/companyicon.png)");
    },
    _addSelectAllSelectedCount: function(){
        var count = this._getSelectedCount();
        this._checkCountAndStatus(count);
    },

    _addSelectedCount : function(){
        if( this.selector.loadingCount === "done" ){
            var count = this._getSelectedCount();
            this._checkCountAndStatus(count);
        }
    },
    _getTotalCount : function(){
        return this.subItems.length;
    },
    _getSelectedCount : function(){
        var list = this.subItems.filter( function (item) { return item.isSelected; });
        return list.length;
    },
    loadSub : function(callback){
        this._loadSub( function( firstLoad ) {
            if(firstLoad){
                if( this.selector.isCheckStatusOrCount() ){
                    // var count = this._getSelectedCount();
                    // this.checkCountAndStatus(count);
                    if( this.selector.loadingCount === "done" ){
                        this.checkCountAndStatus();
                    }
                }
            }
            if(callback)callback();
        }.bind(this))
    },
    _loadSub: function(callback){
        if (!this.loaded  && !this.loadingsub){
            this.loadingsub = true;

            if (this.selector.options.units.length){
                var data = {
                    "name":this.data.name,
                    "unit":"",
                    "unitList" : this.selector.allUnitNames
                };

                MWF.Actions.get("x_organization_assemble_express").getDuty(data, function(json){
                    var list = this.selector.uniqueIdentityList(json.data);
                    list.each(function(idSubData){
                        if( !this.selector.isExcluded( idSubData ) ) {
                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
                            this.selector.items.push(item);
                            if(this.subItems)this.subItems.push( item );
                        }
                    }.bind(this));

                    if (!this.loaded) {
                        this.loaded = true;
                        this.loadingsub = false;
                        this.itemLoaded = true;
                        if (callback) callback( true );
                    }

                }.bind(this), null, false);

                // if (this.selector.options.units.length){
                //     var action = MWF.Actions.get("x_organization_assemble_express");
                //     var data = {"name":this.data.name, "unit":""};
                //     var count = this.selector.options.units.length;
                //     var i = 0;
                //
                //     if (this.selector.options.expandSubEnable) {
                //         this.selector.options.units.each(function(u){
                //             var unitName = "";
                //             if (typeOf(u)==="string"){
                //                 unitName = u;
                //             }else{
                //                 unitName = u.distinguishedName || u.unique || u.id || u.levelName
                //             }
                //             if (unitName){
                //                 var unitNames;
                //                 action.listUnitNameSubNested({"unitList": [unitName]}, function(json){
                //                     unitNames = json.data.unitList;
                //                 }.bind(this), null, false);
                //
                //                 unitNames.push(unitName);
                //                 if (unitNames && unitNames.length){
                //                     data.unitList = unitNames;
                //                     action.getDuty(data, function(json){
                //                         json.data.each(function(idSubData){
                //                             if( !this.selector.isExcluded( idSubData ) ) {
                //                                 var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
                //                                 this.selector.items.push(item);
                //                                 if(this.subItems)this.subItems.push( item );
                //                             }
                //                         }.bind(this));
                //                     }.bind(this), null, false);
                //                 }
                //             }
                //
                //             i++;
                //             if (i>=count){
                //                 if (!this.loaded) {
                //                     this.loaded = true;
                //                     this.loadingsub = false;
                //                     this.itemLoaded = true;
                //                     if (callback) callback();
                //                 }
                //             }
                //         }.bind(this));
                //     }else{
                //         this.selector.options.units.each(function(u){
                //             if (typeOf(u)==="string"){
                //                 data.unit = u;
                //             }else{
                //                 data.unit = u.distinguishedName || u.unique || u.id || u.levelName
                //             }
                //             action.getDuty(data, function(json){
                //                 json.data.each(function(idSubData){
                //                     if( !this.selector.isExcluded( idSubData ) ) {
                //                         var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
                //                         this.selector.items.push(item);
                //                         if(this.subItems)this.subItems.push( item );
                //                     }
                //                 }.bind(this));
                //                 i++;
                //                 if (i>=count){
                //                     if (!this.loaded) {
                //                         this.loaded = true;
                //                         this.loadingsub = false;
                //                         this.itemLoaded = true;
                //                         if (callback) callback();
                //                     }
                //                 }
                //             }.bind(this));
                //         }.bind(this));
                //     }

            }else{
                this.selector.orgAction.listIdentityWithDuty(function(json){
                    var list = this.selector.uniqueIdentityList(json.data);
                    list.each(function(idSubData){
                        if( !this.selector.isExcluded( idSubData ) ) {
                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
                            this.selector.items.push(item);
                            if(this.subItems)this.subItems.push( item );
                        }
                    }.bind(this));
                    this.loaded = true;
                    this.loadingsub = false;
                    if (callback) callback( true );
                }.bind(this), null, this.data.name);
            }
        }else{
            if (callback) callback( );
        }
    },
    loadCategoryChildren: function(callback){
        this.loadSub(callback);
        this.categoryLoaded = true;
        //if (callback) callback();
    },
    loadItemChildren: function(callback){
        this.loadSub(callback);
    },
    _hasChild: function(){
        return true;
    },
    _hasChildCategory: function(){
        return true;
    },
    _hasChildItem: function(){
        return true;
    }

});

MWF.xApplication.Selector.IdentityWidthDuty.ItemUnitCategory = new Class({
    Extends: MWF.xApplication.Selector.Identity.ItemUnitCategory,
    loadSub: function(callback){
        if (!this.loaded){
            this.selector.orgAction.listIdentityWithUnit(function(idJson){
                if( !this.itemLoaded ){
                    var list = this.selector.uniqueIdentityList(idJson.data);
                    list.each(function(idSubData){
                        if( !this.selector.isExcluded( idSubData ) ) {
                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
                            this.selector.items.push(item);
                            if(this.subItems)this.subItems.push( item );
                        }
                    }.bind(this));
                    this.itemLoaded = true;
                }

                if( !this.selector.options.expandSubEnable ){
                    this.loaded = true;
                    if (callback) callback();
                }

                if( this.selector.options.expandSubEnable ){
                    this.selector.orgAction.listSubUnitDirect(function(json){
                        json.data.each(function(subData){
                            if( !this.selector.isExcluded( subData ) ) {
                                if( subData && this.data.parentLevelName)subData.parentLevelName = this.data.parentLevelName +"/" + subData.name;
                                var category = this.selector._newItemCategory("ItemUnitCategory", subData, this.selector, this.children, this.level + 1, this);
                                this.subCategorys.push( category );
                                this.subCategoryMap[subData.parentLevelName || subData.levelName] = category;
                            }
                        }.bind(this));
                        this.loaded = true;
                        if (callback) callback();
                    }.bind(this), null, this.data.distinguishedName);
                }
            }.bind(this), null, this.data.distinguishedName);
        }else{
            if (callback) callback( );
        }
    },
    loadCategoryChildren: function(callback){
        if (!this.categoryLoaded){
            this.loadSub(callback);
            this.categoryLoaded = true;
            this.itemLoaded = true;
            //if( this.selector.options.expandSubEnable ){
            //    this.selector.orgAction.listSubUnitDirect(function(json){
            //        json.data.each(function(subData){
            //            if( !this.selector.isExcluded( subData ) ) {
            //                var category = this.selector._newItemCategory("ItemUnitCategory", subData, this.selector, this.children, this.level + 1, this);
            //                this.subCategorys.push( category );
            //            }
            //        }.bind(this));
            //        this.categoryLoaded = true;
            //        if (callback) callback();
            //    }.bind(this), null, this.data.distinguishedName);
            //}else{
            //    if (callback) callback();
            //}
        }else{
            if (callback) callback( );
        }
    },
    loadItemChildren: function(callback){
        if (!this.itemLoaded){
            this.selector.orgAction.listIdentityWithUnit(function(idJson){
                var list = this.selector.uniqueIdentityList(idJson.data);
                list.each(function(idSubData){
                    if( !this.selector.isExcluded( idSubData ) ) {
                        var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
                        this.selector.items.push(item);
                        if(this.subItems)this.subItems.push( item );
                    }
                }.bind(this));
                if (callback) callback();
            }.bind(this), null, this.data.distinguishedName);
            this.itemLoaded = true;
        }else{
            if (callback) callback( );
        }
    }
});

MWF.xApplication.Selector.IdentityWidthDuty.ItemGroupCategory = new Class({
    Extends: MWF.xApplication.Selector.Identity.ItemGroupCategory
});

MWF.xApplication.Selector.IdentityWidthDuty.Filter = new Class({
    Implements: [Options, Events],
    options: {
        "style": "default",
        "units": [],
        "dutys": []
    },
    initialize: function(value, options){
        this.setOptions(options);
        this.value = value;
        this.orgAction = MWF.Actions.get("x_organization_assemble_control");
    },
    getList: function(callback){
        if (false && this.list){
            if (callback) callback();
        }else{
            this.list = [];

            MWF.require("MWF.widget.PinYin", function(){
                this.options.dutys.each(function(duty){
                    if (this.options.units.length){
                        var action = MWF.Actions.get("x_organization_assemble_express");
                        var data = {"name":duty, "unit":""};
                        this.options.units.each(function(u){
                            if (typeOf(u)==="string"){
                                data.unit = u;
                            }else{
                                data.unit = u.distinguishedName || u.unique || u.levelName || u.id
                            }
                            action.getDuty(data, function(json){
                                json.data.each(function(d){
                                    d.pinyin = d.name.toPY().toLowerCase();
                                    d.firstPY = d.name.toPYFirst().toLowerCase();
                                    this.list.push(d);
                                }.bind(this));
                            }.bind(this), null, false);
                        }.bind(this));
                    }else{
                        this.orgAction.listIdentityWithDuty(function(json){
                            json.data.each(function(d){
                                d.pinyin = d.name.toPY().toLowerCase();
                                d.firstPY = d.name.toPYFirst().toLowerCase();
                                this.list.push(d);
                            }.bind(this));
                        }.bind(this), null, duty, false);
                    }
                }.bind(this));
                if (callback) callback();

            }.bind(this));
        }
    },
    filter: function(value, callback){
        this.value = value;
        this.getList(function(){
            var data = this.list.filter(function(d){
                var text = d.name+"#"+d.pinyin+"#"+d.firstPY;
                return (text.indexOf(this.value)!=-1);
            }.bind(this));
            if (callback) callback(data);
        }.bind(this));
    }
});
