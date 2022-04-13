MWF.xApplication.Selector = MWF.xApplication.Selector || {};
MWF.xDesktop.requireApp("Selector", "Person", null, false);
MWF.xApplication.Selector.Identity = new Class({
    Extends: MWF.xApplication.Selector.Person,
    options: {
        "style": "default",
        "count": 0,
        "title": "",
        "units": [],
        "values": [],
        "dutys": [],
        "zIndex": 1000,
        "expand": false,
        "noUnit" : false,
        "include" : [], //增加的可选项
        "exclude" : [], //排除的可选项
        "resultType" : "", //可以设置成个人，那么结果返回个人
        "expandSubEnable" : true, //是否允许展开下一层,
        "selectAllEnable" : true,  //分类是否允许全选下一层
    },
    setInitTitle: function(){
        this.setOptions({"title": MWF.xApplication.Selector.LP.selectIdentity});
    },
    _init : function(){
        this.selectType = "identity";
        this.className = "Identity";
    },
    loadSelectItems : function(){
        this.itemsMap = {};
        // this.selectedItemsMap = {}; //所有已选项按dn或id

        if( this.options.disabled ){
            this.afterLoadSelectItem();
            return;
        }

        this._loadSelectItems();

        if( this.isCheckStatusOrCount() ) {
            this.loadingCount = "wait";
            this.loadCount();
        }
    },
    _loadSelectItems: function(addToNext){
        var afterLoadSelectItemFun = this.afterLoadSelectItem.bind(this);
        if( this.options.resultType === "person" ){
            if( this.titleTextNode ){
                this.titleTextNode.set("text", MWF.xApplication.Selector.LP.selectPerson );
            }else{
                this.options.title = MWF.xApplication.Selector.LP.selectPerson;
            }
        }
        if(this.options.noUnit){
            this.loadInclude(afterLoadSelectItemFun);
        }else if (this.options.units.length){
            var loadUnitSuccess = function () {
                this.unitLoaded = true;
                if( this.includeLoaded ){
                    afterLoadSelectItemFun();
                }
            }.bind(this);
            var loadUnitFailure = loadUnitSuccess;

            this.loadInclude( function () {
                this.includeLoaded = true;
                if( this.unitLoaded ){
                    afterLoadSelectItemFun();
                }
            }.bind(this));

            var unitList = [];
            for( var i=0 ; i<this.options.units.length; i++ ){
                var unit = this.options.units[i];
                if( typeOf( unit ) === "string" ){
                    unitList.push(unit);
                }else if( typeOf(unit)==="object"){
                    unitList.push( unit.distinguishedName || unit.unique || unit.levelName || unit.id);
                }
            }

            o2.Actions.load("x_organization_assemble_express").UnitAction.listObject( {"unitList" : unitList} , function (json) {
                if (json.data.length){
                    json.data.each( function(data){
                        var category = this._newItemCategory("ItemUnitCategory", data, this, this.itemAreaNode );
                        this.subCategorys.push(category);
                        this.subCategoryMap[data.levelName] = category;
                    }.bind(this));
                }
                loadUnitSuccess();
            }.bind(this), loadUnitFailure );

        }else{

            var load = function ( topUnit ) {
                topUnit.each(function(data){
                    if( !this.isExcluded( data ) ){
                        var category = this._newItemCategory("ItemUnitCategory", data, this, this.itemAreaNode);
                        this.subCategorys.push( category );
                        this.subCategoryMap[data.levelName] = category;
                    }
                }.bind(this));

                // this.unitLoaded = true;
                // if( this.includeLoaded ){
                afterLoadSelectItemFun();
                // }
            }.bind(this);

            if( this.topUnitObj ){
                load( this.topUnitObj );
            }else{
                this.orgAction.listTopUnit(function(json){
                    load( json.data );
                }.bind(this));
            }
        }
    },
    loadInclude: function(afterLoadFun) {
        if (!this.includeObject){
            this.includeObject = new MWF.xApplication.Selector.Identity.Include(this, this.itemAreaNode, {
                "include": this.options.include, //增加的可选项
                "resultType": this.options.resultType, //可以设置成个人，那么结果返回个人
                "expandSubEnable": this.options.expandSubEnable, //是否允许展开下一层
                "onAfterLoad" : afterLoadFun
            });
        }
        this.includeObject.load();
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
    _newItemCategory: function(type, data, selector, item, level, category, delay, notActive){
        return new MWF.xApplication.Selector.Identity[type](data, selector, item, level, category, delay, notActive)
    },

    _listItem : function( filterType, callback, failure, key ){
        if( this.options.noUnit ){
            this.includeObject.listByFilter( filterType,  key, function( array ){
                var json = {"data" : array} ;
                if (callback) callback.apply(this, [json]);
            }.bind(this))
        }else{
            var action = filterType === "key" ? "listIdentityByKey" : "listIdentityByPinyin";
            if ( this.options.units.length ){
                key = this.getLikeKey( key, this.options.units );
                this.orgAction[action](function(json){ //搜若units内的组织
                    this.includeObject.listByFilter( filterType, key, function( array ){
                        json.data = array.concat( json.data || [] );
                        if (callback) callback.apply(this, [json]);
                    }.bind(this));
                }.bind(this), failure, key);
            }else{  //搜索所有人
                this.orgAction[action](function(json){
                    if (callback) callback.apply(this, [json]);
                }.bind(this), failure, key);
            }
        }
    },

    _listItemByKey: function(callback, failure, key){
        this._listItem( "key", callback, failure, key );
    },

    _getItem: function(callback, failure, id, async){
        this.orgAction.getIdentity(function(json){
            if (callback) callback.apply(this, [json]);
        }.bind(this), failure, ((typeOf(id)==="string") ? id : id.distinguishedName), async);
    },
    _newItemSelected: function(data, selector, item, selectedNode, delay){
        return new MWF.xApplication.Selector.Identity.ItemSelected(data, selector, item, selectedNode, delay)
    },
    _listItemByPinyin: function(callback, failure, key){
        this._listItem( "pinyin", callback, failure, key );
    },
    _newItem: function(data, selector, container, level, category, delay){
        return new MWF.xApplication.Selector.Identity.Item(data, selector, container, level, category, delay);
    },
    _newItemSearch: function(data, selector, container, level){
        return new MWF.xApplication.Selector.Identity.SearchItem(data, selector, container, level);
    },
    getLikeKey : function( key, unitObjects ){
        var unitObjects = unitObjects || [];
        var units = [];
        unitObjects.each(function(u){
            if (typeOf(u)==="string"){
                units.push(u);
            }
            if (typeOf(u)==="object"){
                units.push(u.distinguishedName);
            }
        });
        var keyObj = { "key": key, "unitList": units };

        if( !this.dutyDnList ){
            var dutyDnList = [];
            var dutyNameList = [];
            ( this.options.dutys || [] ).each(function(d){
                if (typeOf(d)==="string"){
                    var ds = d.split("@");
                    if( ds[ ds.length - 1].toUpperCase() === "UD" ){
                        dutyDnList.push( d )
                    }else{
                        dutyNameList.push( d );
                    }
                }
                if (typeOf(d)==="object"){
                    if( d.distinguishedName ){
                        dutyDnList.push(d.distinguishedName);
                    }else if( d.name ){
                        dutyNameList.push(d.name);
                    }
                }
            });
            if( dutyNameList.length ){
                o2.Actions.get("x_organization_assemble_express").listDutyWithName( { nameList : dutyNameList }, function(json){
                    if( json.data && json.data.unitDutyList ){
                        dutyDnList = dutyDnList.concat( json.data.unitDutyList )
                    }
                }.bind(this), null, false);
            }
            this.dutyDnList = dutyDnList;
        }
        if( this.dutyDnList.length )keyObj.unitDutyList = this.dutyDnList;

        return units.length ? keyObj : key;
    },

    loadCount: function(){

        var unitList = [];
        var groupList = [];

        var parseInclude = function () {
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
        }.bind(this);

        var check = function () {
            this.loadingCount = "ready";
            this.checkCountAndStatus();
            this.loadingCount = "done";
        }.bind(this);

        if (this.options.noUnit) {
            parseInclude();
            this._loadUnitAndGroupCount(unitList, groupList, check);
        } else if (this.options.units.length) {
            parseInclude();
            this.options.units.each(function (u) {
                unitList.push(typeOf(u) === "string" ? u : (u.distinguishedName || u.unique || u.levelName || u.id))
            }.bind(this));
            this._loadUnitAndGroupCount(unitList, groupList, check);
        } else {
            this.orgAction.listTopUnit(function (json) {
                this.topUnitObj = json.data;
                this.topUnitObj.each(function (u) {
                    unitList.push(u.distinguishedName)
                }.bind(this));
                this._loadUnitAndGroupCount(unitList, groupList, check);
            }.bind(this))
        }
    },
    _loadUnitAndGroupCount: function(unitList, groupList, callback){

        if( !this.groupLevelNameListMap )this.groupLevelNameListMap = {};
        if( !this.groupAllLevelNameListMap )this.groupAllLevelNameListMap = {};

        this.hasGroupCategory = groupList && groupList.length > 0;

        var unitLoaded, groupLoaded, selectedIdentityLoaded, excludeIdentityLoaded;
        var unitTree, groupTree;
        this.unitExcludedIdentityCount = {};
        this.groupExcludedIdentityCount = {};
        this.unitSelectedIdentityCount = {};
        this.groupSelectedIdentityCount = {};

        var caculate = function () {
            if (unitLoaded && groupLoaded && selectedIdentityLoaded && excludeIdentityLoaded) {
                this.caculateNestedSubCount(unitTree, groupTree, function () {

                    if(callback)callback();

                }.bind(this))

            }
        }.bind(this);

        this.getIdentityCountMap(this.options.values, groupList && groupList.length > 0, function (result) {
            this.unitSelectedIdentityCount = result.unitMap;
            this.groupSelectedIdentityCount = result.groupMap;
            selectedIdentityLoaded = true;
            caculate();
        }.bind(this));

        this.getIdentityCountMap(this.options.exclude, groupList && groupList.length > 0, function (result) {
            this.unitExcludedIdentityCount = result.unitMap;
            this.groupExcludedIdentityCount = result.groupMap;
            excludeIdentityLoaded = true;
            caculate();
        }.bind(this));

        if (unitList && unitList.length > 0) {
            o2.Actions.load("x_organization_assemble_express").UnitAction.listWithUnitTree({"unitList": unitList}, function (json) {
                unitTree = json.data;
                unitLoaded = true;
                caculate();
            }.bind(this))
        } else {
            unitLoaded = true;
            caculate();
        }

        if (groupList && groupList.length > 0) {
            o2.Actions.load("x_organization_assemble_express").GroupAction.listWithGroupTree({"groupList": groupList}, function (json) {
                groupTree = json.data;
                groupLoaded = true;
                caculate();
            }.bind(this))
        } else {
            groupLoaded = true;
            caculate();
        }
    },
    getIdentityCountMap : function( identityList, byGroup, callback ){
        var result = {
            unitMap : {},
            groupMap : {}
        };
        if( byGroup ){
            this.listIdentityObjectWithGroup( identityList, function ( identityObjectList, groupLevelNameList ) {
                identityObjectList.each(function (id) {
                    if (id && id.unitLevelName) {
                        result.unitMap[id.unitLevelName] = (result.unitMap[id.unitLevelName] || 0) + 1;
                    }
                }.bind(this));
                groupLevelNameList.each(function(g){
                    result.groupMap[g] = (result.groupMap[g] || 0) + 1;
                })
                if( callback )callback( result );
            })
        }else{
            this.listIndentityObjectWithoutGroup( identityList, function ( identityObjectList ) {
                identityObjectList.each(function (id) {
                    if (id && id.unitLevelName) {
                        result.unitMap[id.unitLevelName] = (result.unitMap[id.unitLevelName] || 0) + 1;
                    }
                }.bind(this));
                if( callback )callback( result );
            })
        }
    },
    listIndentityObjectWithoutGroup : function( identityList, callback ){
        var list = [];
        identityList.each( function (d) {
            if( typeOf( d ) === "object"){
                if( !d.unitLevelName || !d.distinguishedName )list.push( d.distinguishedName || d.id || d.unique )
            }else{
                list.push( d )
            }
        });
        if( list.length > 0 ){
            o2.Actions.load("x_organization_assemble_express").IdentityAction.listObject({ identityList : list }, function (json) {
                var map = {};
                json.data.each( function (d) { map[ d.matchKey ] =  d; });
                var identityObjectList = [];
                identityList.each( function (d) {
                    var key = typeOf( d ) === "object" ? ( d.distinguishedName || d.unique || d.id ) : d;
                    identityObjectList.push( map[key] ? map[key] : d );
                });
                if( callback )callback( identityObjectList );
            }.bind(this))
        }else{
            if( callback )callback( identityList );
        }
    },

    listIdentityObjectWithGroup: function(identityList, callback){
        if( identityList.length === 0 ){
            if( callback )callback( [], [] );
            return;
        }
        var list = identityList.map( function (d) {
            return typeOf( d ) === "object" ? (d.distinguishedName || d.unique || d.id ) : d;
        });
        o2.Actions.load("x_organization_assemble_express").IdentityAction.listObject({
            identityList : list, referenceFlag: true, recursiveFlag: true
        }, function (json) {
            var groupLevelNameList = [];
            json.data.each(function (d) {
                d.woGroupList.each(function (group) {
                    if(group.identityList.contains(d.id)){
                        groupLevelNameList = groupLevelNameList.concat(this.caculateGroupLevelName(group, false));
                    }
                }.bind(this));
            }.bind(this));
            if (callback) callback(json.data, groupLevelNameList);
        }.bind(this))
    },
    caculateNestedSubCount: function(unitTree, groupTree, callback){
        if( !this.allUnitObject )this.allUnitObject = {};
        if( !this.allGroupObject )this.allGroupObject = {};
        if( !this.allGroupObjectByDn )this.allGroupObjectByDn = {};
        if( !this.allGrounUnitObject )this.allGrounUnitObject = {};

        if( groupTree && groupTree.length ){
            groupTree.each( function ( tree ) {
                this.caculateGroupNestedCount( tree );
            }.bind(this) );
        }

        if( unitTree && unitTree.length ){
            unitTree.each( function ( tree ) {
                if( !this.allUnitObject[ tree.levelName ] ){
                    this.caculateUnitNestedCount( tree );
                }
            }.bind(this) );
        }

        if( this.allGroupObject ){
            for( var k in this.allGroupObject ){
                var obj = this.allGroupObject[k];
                this.allGroupObjectByDn[ obj.distinguishedName ] = obj;
            }
        }

        if(callback)callback();
    },
    caculateGroupNestedCount : function( tree, parentLevelName ){
        if( this.isExcluded( tree ) )return;
        var groupLevelName = parentLevelName ? ( parentLevelName + "/" + tree.distinguishedName.split("@")[0] ) : tree.distinguishedName.split("@")[0];

        if(!this.allGrounUnitObject[groupLevelName]){
            this.allGrounUnitObject[groupLevelName] = tree;
            tree.groupUnitLevelName = groupLevelName;
        }

        if(!this.allGroupObject[ groupLevelName ]){
            this.allGroupObject[ groupLevelName ] = tree;
        }else{
            return;
        }

        // tree.subDirectIdentityCount
        var count = tree.subDirectIdentityCount;
        if( this.groupExcludedIdentityCount && this.groupExcludedIdentityCount[ groupLevelName ] ){
            count = (count || 0) - this.groupExcludedIdentityCount[ groupLevelName ];
        }

        var selectedCount = 0;
        if( this.groupSelectedIdentityCount && this.groupSelectedIdentityCount[ groupLevelName ] ){
            selectedCount = this.groupSelectedIdentityCount[ groupLevelName ];
        }

        var nameList = groupLevelName.split("/");
        var names = [];
        nameList.each( function (n) {
            names.push( n );
            var levelName = names.join("/");
            var groupObject = this.allGroupObject[levelName];
            if( groupObject ){
                groupObject.subNestedIdentityCount = (groupObject.subNestedIdentityCount || 0) + count;
                groupObject.selectedNestedIdentityCount = (groupObject.selectedNestedIdentityCount || 0) + selectedCount;
            }
        }.bind(this));

        tree.subGroups.each( function (group) {
            this.caculateGroupNestedCount( group, groupLevelName );
        }.bind(this));

        tree.subUnits.each( function (unit) {
            var flag = this.allUnitObject[ unit.levelName ];
            this.caculateUnitNestedCount( unit, groupLevelName, !!flag )
        }.bind(this))

    },

    caculateUnitNestedCount : function ( tree, groupLevelName, flag ) {
        if( this.isExcluded( tree ) )return;
        var count;
        var selectedCount;

        if(!groupLevelName)groupLevelName="";

        if(!this.allGrounUnitObject[groupLevelName+"/"+tree.levelName]){
            this.allGrounUnitObject[groupLevelName+"/"+tree.levelName] = tree;
            tree.groupUnitLevelName = groupLevelName+"/"+tree.levelName;
        }

        if(!this.allUnitObject[ tree.levelName ]){
            this.allUnitObject[ tree.levelName ] = tree;
            count = tree.subDirectIdentityCount;
            if( this.unitExcludedIdentityCount && this.unitExcludedIdentityCount[ tree.levelName ] ){
                count = (count || 0) - this.unitExcludedIdentityCount[ tree.levelName ];
            }

            selectedCount = 0;
            if( this.unitSelectedIdentityCount && this.unitSelectedIdentityCount[ tree.levelName ] ){
                selectedCount = this.unitSelectedIdentityCount[ tree.levelName ];
            }
        }else if( !flag ){
            return;
        }else{
            count = this.allUnitObject[ tree.levelName ].subNestedIdentityCount || 0;
            selectedCount = this.allUnitObject[ tree.levelName ].selectedNestedIdentityCount || 0;
        }

        if( groupLevelName ){
            var groupNameList = groupLevelName.split("/");
            var groupNames = [];
            groupNameList.each( function (n) {
                groupNames.push( n );
                var levelName = groupNames.join("/");
                var groupObject = this.allGroupObject[levelName];
                if( groupObject ){
                    groupObject.subNestedIdentityCount = (groupObject.subNestedIdentityCount || 0) + count;
                    groupObject.selectedNestedIdentityCount = (groupObject.selectedNestedIdentityCount || 0) + selectedCount;
                }
            }.bind(this));
        }

        if( !flag ){
            var nameList = tree.levelName.split("/");
            var names = [];
            nameList.each( function (n) {
                names.push( n );
                var levelName = names.join("/");
                var unitObject = this.allUnitObject[levelName];
                if( unitObject ){
                    unitObject.subNestedIdentityCount = (unitObject.subNestedIdentityCount || 0) + count;
                    unitObject.selectedNestedIdentityCount = (unitObject.selectedNestedIdentityCount || 0) + selectedCount;
                }
            }.bind(this));

            tree.subUnits.each( function (unit) {
                this.caculateUnitNestedCount( unit, groupLevelName )
            }.bind(this))
        }
    },

    getIdentityParentLevelNameList: function(itemData, callback){
        if( this.hasGroupCategory ){
            if( !itemData.parentLevelNameList ){
                o2.Actions.load("x_organization_assemble_express").IdentityAction.listObject({
                    identityList : [itemData.distinguishedName], referenceFlag: true, recursiveFlag:true
                }, function (json) {
                    json.data.each( function (d) {
                        var list = [];
                        var listWithIdentity = []; //身份直接所在群组

                        d.woGroupList.each(function (group) {
                            var gList = this.caculateGroupLevelName(group);
                            list = list.concat( gList );
                            if(group.identityList.contains(d.id))listWithIdentity = listWithIdentity.concat(gList);
                        }.bind(this));

                        var resultList = [itemData.unitLevelName];
                        if( this.allGrounUnitObject ){
                            list.each(function(lName){
                                if( this.allGrounUnitObject[ lName +"/"+ itemData.unitLevelName ] ){
                                    resultList.push(lName +"/"+ itemData.unitLevelName);
                                    if( listWithIdentity.contains(lName) )resultList.push(lName);
                                }else if( this.allGrounUnitObject[ lName ] ){
                                    resultList.push(lName);
                                }
                            }.bind(this));
                        }else{  //数量树没有加载完成的时候 ？？？可能有问题
                            list.each(function(lName){
                                var level1Name = lName.split("/")[0];
                                if( this.subCategoryMap[ level1Name ] ){
                                    resultList.push(lName +"/"+ itemData.unitLevelName);
                                    resultList.push(lName );
                                }
                            }.bind(this));
                        }
                        itemData.parentLevelNameList = resultList;
                        if( callback )callback(resultList);
                    }.bind(this))
                }.bind(this))
            }else{
                if( callback )callback(itemData.parentLevelNameList);
            }
        }else{
            if( callback )callback([itemData.unitLevelName]);
        }
    },
    //通过身份信息获取的group
    caculateGroupLevelName: function(g, flag){
        var levelNameMap = flag ? this.groupAllLevelNameListMap : this.groupLevelNameListMap;
        if( levelNameMap[g.distinguishedName] ){
            return levelNameMap[g.distinguishedName];
        }

        var levelNameList = [g.name];
        var map = {};
        map[g.id] = g;
        g.woSupGroupList.each(function(group){ map[group.id] = group; });

        var nest = function( supGroupName, groupList ){
            groupList.each(function(subGroupId){
                if( map[subGroupId] ){
                    var groupLevelName = supGroupName+"/"+map[subGroupId].name;
                    if(flag || map[subGroupId].name === g.name )levelNameList.push( groupLevelName );
                    nest(groupLevelName, map[subGroupId].groupList || []);
                }
            })
        };

        g.woSupGroupList.each(function(group){
            if(flag)levelNameList.push(group.name);
            nest( group.name, group.groupList )
        });

        levelNameList = levelNameList.unique();
        levelNameMap[g.distinguishedName] = levelNameList;
        return levelNameList;
    },
    addSelectedCount: function( itemOrItemSelected, count ){
        this._addSelectedCount(itemOrItemSelected, count);
    },
    _addSelectedCount: function( itemOrItemSelected, count ){
        var itemData = itemOrItemSelected.data;
        this.getIdentityParentLevelNameList(itemData, function (parentLevelNameList) {
            parentLevelNameList.each(function(parentLevelName){
                if(!parentLevelName)return;
                var list = parentLevelName.split("/");
                var nameList = [];
                var subCategoryMapList = [this.subCategoryMap];
                for (var j = 0; j < list.length; j++) {
                    nameList.push(list[j]);
                    var name = nameList.join("/");
                    var maplist = [];
                    subCategoryMapList.each(function(subCategoryMap){
                        if ( subCategoryMap[name] ) {
                            var category = subCategoryMap[name];
                            category._addSelectedCount(count);
                            maplist.push( category.subCategoryMap ) ;
                        }
                    });
                    subCategoryMapList = subCategoryMapList.concat(maplist);

                    if( this.loadingCount === "done" ){
                        var obj = this.allUnitObject[name];
                        if (obj) {
                            obj.selectedNestedIdentityCount = obj.selectedNestedIdentityCount + count;
                        }
                    }
                }
            }.bind(this));
        }.bind(this))
    },
    addToItemMap: function (data, item) {
        if(!this.itemsMap)return;
        if(data.distinguishedName){
            if(!this.itemsMap[data.distinguishedName]){
                this.itemsMap[data.distinguishedName] = [item];
            }else{
                this.itemsMap[data.distinguishedName].push(item);
            }
        }
    },
    addToSelectedItemsMap: function(data, selectedItem){
        if(!this.selectedItemsMap)this.selectedItemsMap = {};
        if( data.distinguishedName ){
            this.selectedItemsMap[data.distinguishedName] = selectedItem;
        }
    },
    deleteFromSelectedItemsMap: function(data){
        if(!this.selectedItemsMap)this.selectedItemsMap = {};
        if( data.distinguishedName && this.selectedItemsMap[data.distinguishedName] ){
            delete this.selectedItemsMap[data.distinguishedName];
        }
    },

});


MWF.xApplication.Selector.Identity.Item = new Class({
    Extends: MWF.xApplication.Selector.Person.Item,
    _getShowName: function(){
        return this.data.name;
    },
    _getTtiteText: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/personicon.png)");
    },
    getData: function(callback, isWait){
        if( this.selector.options.resultType === "person" ){
            var isPerson = false;
            if( this.data && this.data.distinguishedName ){
                var dn = this.data.distinguishedName;
                if( dn.substr(dn.length-1, 1).toLowerCase() === "p" )isPerson = true;
            }
            if( isPerson ) {
                if (callback) callback();
            }else if( this.data.woPerson ){
                this.data = this.data.woPerson;
                if (callback) callback();
            }else if( this.data.person ){
                this.selector.orgAction.getPerson(function(json){
                    this.data = json.data;
                    if (callback) callback();
                }.bind(this), null, this.data.person)
            }else{
                if (callback) callback();
            }
        }else{
            if( this.selector.options.ignorePerson || this.selector.options.storeRange === "simple" ){
                if(callback)callback();
                return;
            }
            if (!isWait && callback) callback();
            if (!this.data.woPerson && (!this.data.personDn || !this.data.personEmployee || !this.data.personUnique)){
                this.selector.orgAction.getPerson(function(json){
                    this.data.woPerson = json.data;
                    if (isWait && callback) callback();
                }.bind(this), null, this.data.person)
            }else{
                if (isWait && callback) callback();
            }
        }
    },
    checkSelectedSingle: function(){
        var isPerson = this.selector.options.resultType === "person";
        var selectedItem = this.selector.options.values.filter(function(item, index){
            if( isPerson ){
                if (typeOf(item)==="object") return (item.id && item.id === this.data.person) ||
                    ( item.person && item.person === this.data.id ) ||
                    ( this.data.distinguishedName && this.data.distinguishedName === item.distinguishedName);
                return false;
            }else{
                if (typeOf(item)==="object") return this.data.distinguishedName === item.distinguishedName;
                if (typeOf(item)==="string") return this.data.distinguishedName === item;
                return false;
            }
        }.bind(this));
        if (selectedItem.length){
            this.selectedSingle();
        }
    },
    checkSelected: function(){
        var isPerson = this.selector.options.resultType === "person";
        var selectedItem;
        if(isPerson || !this.selector.selectedItemsMap){
            selectedItem = this.selector.selectedItems.filter(function(item, index){
                if( isPerson ){
                    return ( item.data.id && item.data.id === this.data.person ) ||
                        ( item.data.person && item.data.person === this.data.id ) ||
                        ( item.data.distinguishedName && item.data.distinguishedName === this.data.distinguishedName );
                }else{
                    return item.data.distinguishedName === this.data.distinguishedName;
                }
            }.bind(this));
        }else{
            var sItem = this.selector.selectedItemsMap[this.data.distinguishedName];
            selectedItem = sItem ? [sItem] : [];
        }

        if (selectedItem.length){
            //selectedItem[0].item = this;
            selectedItem[0].addItem(this);
            this.selectedItem = selectedItem[0];
            this.setSelected();

            if( this.selector.options.selectAllRange === "all" && !this.selector.isCheckStatusOrCount() ){
                if(this.category && this.category._addSelectAllSelectedCount )this.category._addSelectAllSelectedCount( 1, true );
            }
        }
    }
});
MWF.xApplication.Selector.Identity.SearchItem = new Class({
    Extends: MWF.xApplication.Selector.Identity.Item,
    _getShowName: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    }
});

MWF.xApplication.Selector.Identity.ItemSelected = new Class({
    Extends: MWF.xApplication.Selector.Person.ItemSelected,
    getData: function(callback, isWait){
        if( this.selector.options.resultType === "person" ){
            var isPerson = false;
            if( this.data && this.data.distinguishedName ){
                var dn = this.data.distinguishedName;
                if( dn.substr(dn.length-1, 1).toLowerCase() === "p" )isPerson = true;
            }
            if( isPerson ){
                if (callback) callback();
            }else if( this.data.woPerson ){
                this.data = this.data.woPerson;
                if (callback) callback();
            }else if( this.data.person ){
                this.selector.orgAction.getPerson(function(json){
                    this.data = json.data;
                    if (callback) callback();
                }.bind(this), null, this.data.person )
            }else{
                if (callback) callback();
            }
        }else if (!this.data.woPerson && (!this.data.personDn || !this.data.personEmployee || !this.data.personUnique) ){
            if( this.selector.options.ignorePerson || this.selector.options.storeRange === "simple" ){
                if(callback)callback();
                return;
            }
            if (!isWait && callback) callback();
            if (this.data.person){
                this.selector.orgAction.getPerson(function(json){
                    this.data.woPerson = json.data;
                    if (isWait && callback) callback();
                }.bind(this), function(xhr, text, error){
                    var errorText = error;
                    if (xhr){
                        var json = JSON.decode(xhr.responseText);
                        if (json){
                            errorText = json.message.trim() || "request json error";
                        }else{
                            errorText = "request json error: "+xhr.responseText;
                        }
                    }
                    MWF.xDesktop.notice("error", {x: "right", y:"top"}, errorText);
                    if (isWait && callback) callback();
                }.bind(this), this.data.person)
            }else{
                MWF.xDesktop.notice("error", {x: "right", y:"top"}, MWF.SelectorLP.noPerson.replace(/{name}/g, this.data.name));
                if (isWait && callback) callback();
            }
        }else{
            if (callback) callback();
        }

    },
    _getShowName: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _getTtiteText: function(){
        return this.data.name+((this.data.unitLevelName) ? "("+this.data.unitLevelName+")" : "");
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/personicon.png)");
    },
    check: function(){
        var items;
        if (this.selector.items.length){
            var isPerson = this.selector.options.resultType === "person";
            if( this.selector.itemsMap ){
                items = this.selector.itemsMap[this.data.distinguishedName];
            }
            if( !items ){
                items = this.selector.items.filter(function(item, index){
                    if( isPerson ){
                        return (item.data.person && item.data.person === this.data.id) ||
                            ( item.data.id && item.data.id === this.data.person) ||
                            ( item.data.distinguishedName && item.data.distinguishedName === this.data.distinguishedName );
                    }else{
                        return item.data.distinguishedName === this.data.distinguishedName;
                    }
                }.bind(this));
            }
            this.items = items;
            if (items.length){
                items.each(function(item){
                    item.selectedItem = this;
                    item.setSelected();

                    if( this.selector.options.selectAllRange === "all" && !this.selector.isCheckStatusOrCount() ){
                        if(item.category && item.category._addSelectAllSelectedCount )item.category._addSelectAllSelectedCount( 1, true );
                    }

                }.bind(this));
            }
        }

        if( !this.isFromValues ){
            if( this.selector.isCheckStatusOrCount() ){
                this.selector.addSelectedCount(this, 1, items||[]);
            }
        }

        if( this.afterCheck )this.afterCheck();
    }
});

MWF.xApplication.Selector.Identity.ItemCategory = new Class({
    Extends: MWF.xApplication.Selector.Person.ItemCategory,
    createNode: function(){
        this.node = new Element("div", {
            "styles": this.selector.css.selectorItemCategory_department,
            "title" : this._getTtiteText()
        }).inject(this.container);
    },
    _addSelectAllSelectedCount : function( count, nested ){
        var c = ( this._getSelectAllSelectedCount() || 0 ) + count;
        this.selectedCount = c;
        this._checkCountAndStatus( c );
        if( nested && this.category && this.category._addSelectAllSelectedCount ){
            this.category._addSelectAllSelectedCount(count, nested);
        }
    },
    _getSelectAllSelectedCount: function(){
        if( typeOf(this.selectedCount) === "number" ){
            return this.selectedCount;
        }else{
            return 0;
        }
    },

    _addSelectedCount : function( count, nested ){ //增加数字并向上回溯
        if( this.selector.loadingCount === "done" ){
            var c = ( this._getSelectedCount() || 0 ) + count;
            this.selectedCount = c;
            this._checkCountAndStatus( c );
        }else{
            this.selectedCount_wait = (this.selectedCount_wait || 0) + count;
        }
        if( nested && this.category && this.category._addSelectedCount ){
            this.category._addSelectedCount(count, nested);
        }
    },
    _getShowName: function(){
        // if( this._getTotalCount && this._getSelectedCount ){
        //     return "" + this._getTotalCount() + "-" + this._getSelectedCount() + "-" + this.data.name ;
        // }else{
        return this.data.name;
        // }
    },
    _getTotalCount : function(){
        if( !this.selector.allUnitObject )return 0;
        var unit =  this.selector.allUnitObject[this.data.levelName];
        var count = unit ? unit.subNestedIdentityCount : 0;
        return count;
    },
    _getSelectedCount : function(){
        if( typeOf(this.selectedCount) === "number" )return this.selectedCount;
        if( !this.selector.allUnitObject )return 0;
        var unit =  this.selector.allUnitObject[this.data.levelName];
        var count = unit ? unit.selectedNestedIdentityCount : 0;
        this.selectedCount = count + (this.selectedCount_wait || 0);
        this.selectedCount_wait = 0;
        return this.selectedCount;
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/companyicon.png)");
    },
    _beforeSelectAll : function( _selectAllFun ){
        if( this.selector.options.ignorePerson || ( this.selector.options.storeRange === "simple" && this.selector.options.resultType !== "person") ){
            _selectAllFun();
            return;
        }
        //批量获取个人
        var object = {};
        if( this.selector.options.resultType === "person" ){
            this.subItems.each( function(item){
                var isPerson = false;
                if( item.data && item.data.distinguishedName ){
                    var dn = item.data.distinguishedName;
                    if( dn.substr(dn.length-1, 1).toLowerCase() === "p" )isPerson = true;
                }
                if( !isPerson && !item.data.woPerson && item.data.person ){
                    object[ item.data.person ] = item;
                }
            }.bind(this))
        }else{
            this.subItems.each( function (item) {
                if (!item.data.woPerson && item.data.person ){
                    object[ item.data.person ] = item;
                }
            }.bind(this))
        }
        var keys = Object.keys( object );
        if( keys.length > 0 ){
            o2.Actions.load("x_organization_assemble_express").PersonAction.listObject({"personList":keys}, function (json) {
                json.data.each( function ( p ){
                    if(object[ p.id ])object[ p.id ].data.woPerson = p;
                }.bind(this));
                _selectAllFun();
            })
        }else{
            _selectAllFun();
        }
    },
    clickItem: function( callback, notActive ){
        debugger;
        if (this._hasChild() && !this.loading){
            var firstLoaded = !this.loaded;
            this.loading = true;
            this.loadSub(function(){
                this.loading = false;
                if( !notActive ){
                    if( firstLoaded ){
                        if( !this.selector.isFlatCategory ){
                            if( this.subNotActive )this.activeSub();
                            this.children.setStyles({"display": "block", "height": "auto"});
                            this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_expand);
                            this.isExpand = true;
                        }
                        this.selector.fireEvent("expand", [this] );
                        // this.checkSelectAll();
                    }else{
                        var display = this.children.getStyle("display");
                        if (display === "none"){
                            if( this.subNotActive )this.activeSub();
                            this.children.setStyles({"display": "block", "height": "auto"});
                            this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_expand);
                            this.isExpand = true;
                            this.selector.fireEvent("expand", [this] );
                        }else{
                            this.children.setStyles({"display": "none", "height": "0px"});
                            this.actionNode.setStyles(this.selector.css.selectorItemCategoryActionNode_collapse);
                            this.isExpand = false;
                            this.selector.fireEvent("collapse", [this] );
                        }
                    }
                }
                if(callback)callback();
            }.bind(this), notActive);
        }
    },
    loadSub: function(callback, notActive){
        this._loadSub( function( firstLoad ) {
            if(callback)callback();
        }.bind(this), notActive)
    },
    _loadSub: function(callback, notActive){
        if(notActive)this.subNotActive = true;
        if (!this.loaded){
            var loadSubUnit = function () {
                if( this.selector.options.expandSubEnable && !this.categoryLoaded ){
                    o2.Actions.load("x_organization_assemble_express").UnitAction.listWithUnitSubDirectObject({
                            unitList: [this.data.distinguishedName],
                            countSubDirectUnit: true,
                            countSubDirectIdentity: true
                        },
                        function(json){
                            json.data.each(function(subData){
                                if( !this.selector.isExcluded( subData ) ) {
                                    if( subData && this.data.parentLevelName)subData.parentLevelName = this.data.parentLevelName +"/" + subData.name;
                                    var category = this.selector._newItemCategory("ItemUnitCategory", subData, this.selector, this.children, this.level + 1, this, false, notActive);
                                    this.subCategorys.push( category );
                                    this.subCategoryMap[subData.parentLevelName || subData.levelName] = category;
                                }
                            }.bind(this));
                            this.loaded = true;
                            if (callback) callback( true );
                        }.bind(this)
                    );
                }else{
                    this.loaded = true;
                    if (callback) callback( true );
                }
            }.bind(this);

            if( !this.itemLoaded ){
                this.selector.orgAction.listIdentityWithUnit(function(idJson){
                    idJson.data.each(function(idSubData){
                        if( !this.selector.isExcluded( idSubData ) ) {
                            var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this, notActive);
                            this.selector.items.push(item);
                            if(this.selector.addToItemMap)this.selector.addToItemMap(idSubData,item);
                            if(this.subItems)this.subItems.push( item );
                        }
                    }.bind(this));
                    loadSubUnit();
                }.bind(this), null, this.data.distinguishedName);
            }else{
                loadSubUnit();
            }

            // }
        }else{
            if (callback) callback( );
        }
    },
    _hasChild: function(){
        var uCount = (this.data.subDirectUnitCount) ? this.data.subDirectUnitCount : 0;
        var iCount = (this.data.subDirectIdentityCount) ? this.data.subDirectIdentityCount : 0;
        return uCount + iCount;
    },
    _hasChildCategory: function(){
        return (this.data.subDirectUnitCount) ? this.data.subDirectUnitCount : 0;
    },
    _hasChildItem: function(){
        return (this.data.subDirectIdentityCount) ? this.data.subDirectIdentityCount : 0;
    },
    afterLoad: function(){
        if (this.level===1) this.clickItem();
        if( this.selector.isCheckStatusOrCount() ) {
            if (this.selector.loadingCount === "done"){
                this.checkCountAndStatus();
            }
        }
    },

    //for flat category start
    clickFlatCategoryItem: function( callback, hidden ){
        if (this._hasChildItem()){
            var firstLoaded = !this.itemLoaded;
            this.loadItemChildren(function(){
                if( hidden ){
                    //alert("hidden")
                    this.children.setStyles({"display": "none", "height": "0px"});
                    this.node.setStyles( this.selector.css.flatCategoryItemNode );
                    this.isExpand = false;
                }else if( firstLoaded ){
                    this.children.setStyles({"display": "block", "height": "auto"});
                    this.node.setStyles( this.selector.css.flatCategoryItemNode_selected );
                    this.isExpand = true;
                }else{
                    var display = this.children.getStyle("display");
                    if (display === "none"){
                        this.children.setStyles({"display": "block", "height": "auto"});
                        this.node.setStyles( this.selector.css.flatCategoryItemNode_selected );
                        this.isExpand = true;
                    }else{
                        this.children.setStyles({"display": "none", "height": "0px"});
                        this.node.setStyles( this.selector.css.flatCategoryItemNode );
                        this.isExpand = false;
                    }
                }
                if(callback)callback();
            }.bind(this));
        }
    },
    loadCategoryChildren: function(callback){
        if (!this.categoryLoaded){
            if( this.selector.options.expandSubEnable ){
                o2.Actions.load("x_organization_assemble_express").UnitAction.listWithUnitSubDirectObject({
                        unitList: [this.data.distinguishedName],
                        countSubDirectUnit: true,
                        countSubDirectIdentity: true
                    },
                    function(json){
                        json.data.each(function(subData){
                            if( !this.selector.isExcluded( subData ) ) {
                                if( subData && this.data.parentLevelName)subData.parentLevelName = this.data.parentLevelName +"/" + subData.name;
                                var category = this.selector._newItemCategory("ItemUnitCategory", subData, this.selector, this.children, this.level + 1, this);
                                this.subCategorys.push( category );
                                this.subCategoryMap[subData.parentLevelName || subData.levelName] = category;
                            }
                        }.bind(this));
                        this.categoryLoaded = true;
                        if (callback) callback();
                    }.bind(this)
                );
                // this.selector.orgAction.listSubUnitDirect(function(json){
                //     json.data.each(function(subData){
                //         if( !this.selector.isExcluded( subData ) ) {
                //             if( subData && this.data.parentLevelName)subData.parentLevelName = this.data.parentLevelName +"/" + subData.name;
                //             var category = this.selector._newItemCategory("ItemUnitCategory", subData, this.selector, this.children, this.level + 1, this);
                //             this.subCategorys.push( category );
                //             this.subCategoryMap[subData.parentLevelName || subData.levelName] = category;
                //         }
                //     }.bind(this));
                //     this.categoryLoaded = true;
                //     if (callback) callback();
                // }.bind(this), null, this.data.distinguishedName);
            }else{
                if (callback) callback();
            }
        }else{
            if (callback) callback( );
        }
    },
    loadItemChildren: function(callback){
        if (!this.itemLoaded){
            // if (this.selector.options.dutys && this.selector.options.dutys.length){
            //     var ids = [];
            //     var object = {};
            //     this.selector.options.dutys.each(function(duty){
            //         this.selector.orgAction.listIdentityWidthUnitWithDutyName(this.data.distinguishedName, duty, function(json){
            //             if (json.data && json.data.length){
            //                 ids = ids.concat(json.data);
            //             }
            //         }.bind(this), null, false);
            //
            //         ids.each(function(idSubData){
            //             if( !this.selector.isExcluded( idSubData ) && !object[ idSubData.id || idSubData.distinguishedName ]) {
            //                 var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
            //                 this.selector.items.push(item);
            //                 if(this.subItems)this.subItems.push( item );
            //                 object[ idSubData.id || idSubData.distinguishedName ] = true;
            //             }
            //             this.itemLoaded = true;
            //         }.bind(this));
            //     }.bind(this));
            //     if (callback) callback();
            // }else{
            this.selector.orgAction.listIdentityWithUnit(function(idJson){
                idJson.data.each(function(idSubData){
                    if( !this.selector.isExcluded( idSubData ) ) {
                        var item = this.selector._newItem(idSubData, this.selector, this.children, this.level + 1, this);
                        this.selector.items.push(item);
                        if(this.selector.addToItemMap)this.selector.addToItemMap(idSubData,item);
                        if(this.subItems)this.subItems.push( item );
                    }
                    this.itemLoaded = true;
                }.bind(this));
                if (callback) callback();
            }.bind(this), null, this.data.distinguishedName);
            // }
        }else{
            if (callback) callback( );
        }
    }
    //for flat category end
});

MWF.xApplication.Selector.Identity.ItemUnitCategory = new Class({
    Extends: MWF.xApplication.Selector.Identity.ItemCategory
});

MWF.xApplication.Selector.Identity.ItemGroupCategory = new Class({
    Extends: MWF.xApplication.Selector.Identity.ItemCategory,
    createNode: function(){
        this.node = new Element("div", {
            "styles": this.selector.css.selectorItemCategory
        }).inject(this.container);
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/groupicon.png)");
    },
    _getTotalCount : function(){
        if( !this.selector.allGroupObjectByDn )return 0;
        var group = this.selector.allGroupObjectByDn[this.data.distinguishedName];
        var count = group ? group.subNestedIdentityCount : 0;
        return count;
    },
    _getSelectedCount : function(){
        if( typeOf(this.selectedCount) === "number" )return this.selectedCount;
        if( !this.selector.allGroupObjectByDn )return 0;
        var group = this.selector.allGroupObjectByDn[this.data.distinguishedName];
        var count = group ? group.selectedNestedIdentityCount : 0;
        this.selectedCount = count;
        return count;
    },

    loadSub: function(callback){
        if (!this.loaded){
            var personContainer, identityContainer, groupContainer, unitContainer;
            if( this.data.personList )personContainer = new Element("div").inject( this.children );
            if( this.data.identityList )identityContainer = new Element("div").inject( this.children );
            if( this.data.groupList )groupContainer = new Element("div").inject( this.children );
            if( this.data.unitList )unitContainer = new Element("div").inject( this.children );

            var personLoadedCount = 0;
            var identityLoadedCount = 0;
            var unitLoadedCount = 0;
            var groupLoadedCount = 0;

            var checkCallback = function( type, count ){
                var addCount = count || 1;
                if( !this.selector.options.expandSubEnable ){
                    if( type === "person" )personLoadedCount += addCount;
                    if( type === "identity" )identityLoadedCount += addCount;
                    if(
                        (!this.data.personList || this.data.personList.length === 0 || this.data.personList.length == personLoadedCount) &&
                        (!this.data.identityList || this.data.identityList.length === 0 || this.data.identityList.length == identityLoadedCount)
                    ){
                        this.loaded = true;
                        if (callback) callback();
                    }
                }else{
                    if( type === "person" )personLoadedCount += addCount;
                    if( type === "identity" )identityLoadedCount += addCount;
                    if( type === "unit" )unitLoadedCount += addCount;
                    if( type === "group" )groupLoadedCount += addCount;
                    if( ( !this.data.personList || this.data.personList.length === 0 || this.data.personList.length == personLoadedCount ) &&
                        ( !this.data.identityList || this.data.identityList.length === 0 || this.data.identityList.length == identityLoadedCount )&&
                        ( !this.data.unitList || this.data.unitList.length === 0 || this.data.unitList.length == unitLoadedCount ) &&
                        ( !this.data.groupList || this.data.groupList.length === 0 || this.data.groupList.length == groupLoadedCount ) ){
                        this.loaded = true;
                        if (callback) callback();
                    }
                }
            }.bind(this);

            checkCallback();

            if( this.data.identityList && this.data.identityList.length > 0 ){
                if( this.selector.options.resultType === "person" ) {
                    //根据身份id批量获取人员对象
                    o2.Actions.load("x_organization_assemble_express").PersonAction.listWithIdentityObject({
                        identityList : this.data.identityList
                    }, function (json) {
                        this.selector.includeObject.loadPersonItem( json, identityContainer, this.level + 1, this);
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this), function () {
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this))
                }else{
                    //根据身份id批量获取身份对象
                    o2.Actions.load("x_organization_assemble_express").IdentityAction.listObject({
                        identityList : this.data.identityList
                    }, function (json) {
                        this.selector.includeObject.loadIdentityItem( json, identityContainer, this.level + 1, this);
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this), function () {
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this))
                }
            }

            if( this.data.personList && this.data.personList.length > 0 ){
                if( this.selector.options.resultType === "person" ) {
                    //根据人员d批量获取人员对象
                    o2.Actions.load("x_organization_assemble_express").PersonAction.listObject({
                        personList : this.data.personList
                    }, function (json) {
                        this.selector.includeObject.loadPersonItem( json, personContainer, this.level + 1, this);
                        checkCallback("person", this.data.personList.length )
                    }.bind(this), function () {
                        checkCallback("person", this.data.personList.length )
                    }.bind(this))
                }else{
                    //根据人员id批量获取身份对象
                    o2.Actions.load("x_organization_assemble_express").IdentityAction.listWithPersonObject({
                        personList : this.data.personList
                    }, function (json) {
                        this.selector.includeObject.loadIdentityItem( json, personContainer, this.level + 1, this);
                        checkCallback("person", this.data.personList.length )
                    }.bind(this), function () {
                        checkCallback("person", this.data.personList.length )
                    }.bind(this))
                }
            }

            // ( this.data.personList || [] ).each( function(p){
            //     if( this.selector.options.resultType === "person" ){
            //         this.selector.orgAction.getPerson(function (json) {
            //             this.selector.includeObject.loadPersonItem(json, this.children, this.level + 1, this );
            //             checkCallback("person");
            //         }.bind(this), function(){ checkCallback("person") }, p );
            //     }else{
            //         this.selector.orgAction.listIdentityByPerson(function(json){
            //             this.selector.includeObject.loadIdentityItem(json, this.children, this.level + 1, this);
            //             checkCallback("person")
            //         }.bind(this), function(){ checkCallback("person") }, p );
            //     }
            // }.bind(this));

            //list 服务不能获取下级数量
            // if( this.selector.options.expandSubEnable ){
            //     o2.Actions.load("x_organization_assemble_express").UnitAction.listObject({
            //         unitList : this.data.unitList
            //     }, function (json) {
            //         this.selector.includeObject.loadUnitItem( json, this.children, this.level + 1, this);
            //         checkCallback("unit", this.data.unitList.length )
            //     }.bind(this), function () {
            //         checkCallback("unit", this.data.unitList.length )
            //     }.bind(this))
            //
            //
            //     o2.Actions.load("x_organization_assemble_express").GroupAction.listObject({
            //         groupList : this.data.groupList
            //     }, function (json) {
            //         this.selector.includeObject.loadGroupItem(json, this.children, this.level + 1, this);
            //         checkCallback("group", this.data.groupList.length )
            //     }.bind(this), function () {
            //         checkCallback("group", this.data.groupList.length )
            //     }.bind(this))
            // }


            if( this.selector.options.expandSubEnable ){
                ( this.data.unitList || [] ).each( function(u){
                    this.selector.orgAction.getUnit(function (json) {
                        if( json.data && this.data.parentLevelName)json.data.parentLevelName = this.data.parentLevelName +"/" + json.data.levelName;
                        this.selector.includeObject.loadUnitItem(json, unitContainer, this.level + 1, this);
                        checkCallback("unit");
                    }.bind(this), function(){ checkCallback("unit") }, u );
                }.bind(this));

                ( this.data.groupList || [] ).each( function(g){
                    this.selector.orgAction.getGroup(function (json) {
                        if( json.data && this.data.parentLevelName)json.data.parentLevelName = this.data.parentLevelName +"/" + json.data.name;
                        this.selector.includeObject.loadGroupItem(json, groupContainer, this.level + 1, this);
                        checkCallback("group");
                    }.bind(this), function(){ checkCallback("group") }, g );
                }.bind(this));
            }
        }else{
            if (callback) callback( );
        }
    },
    loadCategoryChildren: function(callback){
        if (!this.categoryLoaded){

            var groupContainer, unitContainer;
            if( this.data.groupList )groupContainer = new Element("div").inject( this.children );
            if( this.data.unitList )unitContainer = new Element("div").inject( this.children );

            var unitLoadedCount = 0;
            var groupLoadedCount = 0;

            var checkCallback = function( type, count ){
                var addCount = count || 1;
                if( !this.selector.options.expandSubEnable ){
                    this.categoryLoaded = true;
                }else{
                    if( type === "unit" )unitLoadedCount += addCount;
                    if( type === "group" )groupLoadedCount += addCount;
                    if( ( !this.data.unitList || this.data.unitList.length === 0 || this.data.unitList.length == unitLoadedCount ) &&
                        ( !this.data.groupList || this.data.groupList.length === 0 || this.data.groupList.length == groupLoadedCount ) ){
                        this.categoryLoaded = true;
                        if (callback) callback();
                    }
                }
            }.bind(this);

            checkCallback();

            //list 服务不能获取下级数量
            // if( this.selector.options.expandSubEnable ){
            //     o2.Actions.load("x_organization_assemble_express").UnitAction.listObject({
            //         unitList : this.data.unitList
            //     }, function (json) {
            //         this.selector.includeObject.loadUnitItem( json, this.children, this.level + 1, this);
            //         checkCallback("unit", this.data.unitList.length )
            //     }.bind(this), function () {
            //         checkCallback("unit", this.data.unitList.length )
            //     }.bind(this))
            //
            //
            //     o2.Actions.load("x_organization_assemble_express").GroupAction.listObject({
            //         groupList : this.data.groupList
            //     }, function (json) {
            //         this.selector.includeObject.loadGroupItem(json, this.children, this.level + 1, this);
            //         checkCallback("group", this.data.groupList.length )
            //     }.bind(this), function () {
            //         checkCallback("group", this.data.groupList.length )
            //     }.bind(this))
            // }

            if( this.selector.options.expandSubEnable ){
                ( this.data.unitList || [] ).each( function(u){
                    this.selector.orgAction.getUnit(function (json) {
                        if( json.data && this.data.parentLevelName)json.data.parentLevelName = this.data.parentLevelName +"/" + json.data.levelName;
                        this.selector.includeObject.loadUnitItem(json, unitContainer, this.level + 1, this);
                        checkCallback("unit");
                    }.bind(this), function(){ checkCallback("unit") }, u );
                }.bind(this));

                ( this.data.groupList || [] ).each( function(g){
                    this.selector.orgAction.getGroup(function (json) {
                        if( json.data && this.data.parentLevelName)json.data.parentLevelName = this.data.parentLevelName +"/" + json.data.name;
                        this.selector.includeObject.loadGroupItem(json, groupContainer, this.level + 1, this);
                        checkCallback("group");
                    }.bind(this), function(){ checkCallback("group") }, g );
                }.bind(this));
            }
        }else{
            if (callback) callback( );
        }
    },
    loadItemChildren: function(callback){
        if (!this.itemLoaded){

            var personContainer, identityContainer;
            if( this.data.personList )personContainer = new Element("div").inject( this.children );
            if( this.data.identityList )identityContainer = new Element("div").inject( this.children );

            var personLoadedCount = 0;
            var identityLoadedCount = 0;

            var checkCallback = function( type, count ){
                var addCount = count || 1;
                if( type === "person" )personLoadedCount += addCount;
                if( type === "identity" )identityLoadedCount += addCount;
                if(
                    (!this.data.personList || this.data.personList.length === 0 || this.data.personList.length == personLoadedCount) &&
                    (!this.data.identityList || this.data.identityList.length === 0 || this.data.identityList.length == identityLoadedCount)
                ){
                    this.itemLoaded = true;
                    if (callback) callback();
                }
            }.bind(this);

            checkCallback();

            if( this.data.identityList && this.data.identityList.length > 0 ){
                if( this.selector.options.resultType === "person" ) {
                    //根据身份id批量获取人员对象
                    o2.Actions.load("x_organization_assemble_express").PersonAction.listWithIdentityObject({
                        identityList : this.data.identityList
                    }, function (json) {
                        this.selector.includeObject.loadPersonItem( json, identityContainer, this.level + 1, this);
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this), function () {
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this))
                }else{
                    //根据身份id批量获取身份对象
                    o2.Actions.load("x_organization_assemble_express").IdentityAction.listObject({
                        identityList : this.data.identityList
                    }, function (json) {
                        this.selector.includeObject.loadIdentityItem( json, identityContainer, this.level + 1, this);
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this), function () {
                        checkCallback("identity", this.data.identityList.length )
                    }.bind(this))
                }
            }

            if( this.data.personList && this.data.personList.length > 0 ){
                if( this.selector.options.resultType === "person" ) {
                    //根据人员d批量获取人员对象
                    o2.Actions.load("x_organization_assemble_express").PersonAction.listObject({
                        personList : this.data.personList
                    }, function (json) {
                        this.selector.includeObject.loadPersonItem( json, personContainer, this.level + 1, this);
                        checkCallback("person", this.data.personList.length )
                    }.bind(this), function () {
                        checkCallback("person", this.data.personList.length )
                    }.bind(this))
                }else{
                    //根据人员id批量获取身份对象
                    o2.Actions.load("x_organization_assemble_express").IdentityAction.listWithPersonObject({
                        personList : this.data.personList
                    }, function (json) {
                        this.selector.includeObject.loadIdentityItem( json, personContainer, this.level + 1, this);
                        checkCallback("person", this.data.personList.length )
                    }.bind(this), function () {
                        checkCallback("person", this.data.personList.length )
                    }.bind(this))
                }
            }

            // ( this.data.personList || [] ).each( function(p){
            //     if( this.selector.options.resultType === "person" ){
            //         this.selector.orgAction.getPerson(function (json) {
            //             this.selector.includeObject.loadPersonItem(json, this.children, this.level + 1, this );
            //             checkCallback("person");
            //         }.bind(this), function(){ checkCallback("person") }, p );
            //     }else{
            //         this.selector.orgAction.listIdentityByPerson(function(json){
            //             this.selector.includeObject.loadIdentityItem(json, this.children, this.level + 1, this);
            //             checkCallback("person")
            //         }.bind(this), function(){ checkCallback("person") }, p );
            //     }
            // }.bind(this));
        }else{
            if (callback) callback( );
        }
    },
    _hasChild: function(){
        var uCount = (this.data.unitList) ? this.data.unitList.length : 0;
        var gCount = (this.data.groupList) ? this.data.groupList.length : 0;
        var pCount = (this.data.personList) ? this.data.personList.length : 0;
        var iCount = (this.data.identityList) ? this.data.identityList.length : 0;
        return uCount + gCount + pCount + iCount;
    },
    _hasChildCategory: function(){
        var uCount = (this.data.unitList) ? this.data.unitList.length : 0;
        var gCount = (this.data.groupList) ? this.data.groupList.length : 0;
        return uCount + gCount;
    },
    _hasChildItem: function(){
        var pCount = (this.data.personList) ? this.data.personList.length : 0;
        var iCount = (this.data.identityList) ? this.data.identityList.length : 0;
        return pCount + iCount;
    }
});

MWF.xApplication.Selector.Identity.ItemRoleCategory = new Class({
    Extends: MWF.xApplication.Selector.Person.ItemCategory,
    _getShowName: function(){
        return this.data.name;
    },
    _setIcon: function(){
        var style = this.selector.options.style;
        this.iconNode.setStyle("background-image", "url("+"../x_component_Selector/$Selector/"+style+"/icon/roleicon.png)");
    }
});

MWF.xApplication.Selector.Identity.Include = new Class({
    Implements: [Options, Events],
    options: {
        "include" : [], //增加的可选项
        "resultType" : "", //可以设置成个人，那么结果返回个人
        "expandSubEnable" : true //是否允许展开下一层
    },
    initialize: function(selector, itemAreaNode, options){
        this.setOptions(options);
        this.selector = selector;
        this.itemAreaNode = $(itemAreaNode);
        this.orgAction = MWF.Actions.get("x_organization_assemble_control");
    },
    load : function( callback ){
        if( !this.options.include || this.options.include.length === 0 ){
            this.fireEvent("afterLoad");
            if(callback)callback();
            return;
        }


        var count = 0;
        var checkCallback = function () {
            count++;
            if( count === this.options.include.length ){
                this.fireEvent("afterLoad");
                if(callback)callback();
            }
        }.bind(this);

        this.includeAreaNode = new Element( "div.includeAreaNode").inject( this.itemAreaNode, "top" );

        if( this.selector.isFlatCategory ){
            this.flatCategoryAreaNode = new Element( "div.includeFlatCategoryAreaNode").inject( this.selector.flatCategoryNode, "top" );
        }

        //this.includeIdentityAreaNode = new Element( "div").inject( this.includeAreaNode );
        //this.includePersonAreaNode = new Element( "div").inject( this.includeAreaNode );
        //this.includeUnitAreaNode = new Element( "div").inject( this.includeAreaNode );
        //this.includeGroupAreaNode = new Element( "div").inject( this.includeAreaNode );

        this.options.include.each( function( d ){
            var container = new Element("div").inject( this.includeAreaNode );

            var flatCategoryContainer;
            if( this.flatCategoryAreaNode ){
                flatCategoryContainer = new Element("div").inject( this.flatCategoryAreaNode );
            }


            if (typeOf(d)==="string"){
                var arr = d.split("@");
                var flag = arr[ arr.length - 1].toLowerCase();
                if( flag === "u" ){
                    this.orgAction.listUnitByKey(function(json){
                        this.loadUnitItem(json, container, null, null, flatCategoryContainer);
                        checkCallback();
                    }.bind(this), checkCallback, d);
                }else if( flag === "i" ) {
                    this.orgAction.listIdentityByKey(function (json) {
                        this.loadIdentityItem(json, container, null, null, true );
                        checkCallback();
                    }.bind(this), checkCallback, d);
                }else if( flag === "g" ){
                    this.orgAction.listGroupByKey(function(json){
                        json.data.each(function(d){ d.parentLevelName = d.name; });
                        this.loadGroupItem( json , container, null, null, flatCategoryContainer);
                        checkCallback();
                    }.bind(this), checkCallback, d);
                }else if( flag === "p" ){
                    if( this.options.resultType === "person" ){
                        this.orgAction.getPerson(function (json){
                            this.loadPersonItem( json , container, null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d);
                    }else{
                        // if( this.selector.options.onlyMajorIdentity ){
                        //     o2.Actions.load("x_organization_assemble_express").IdentityAction.listMajorWithPersonObject({"personList":[d]}, function (json) {
                        //         this.loadIdentityItem(json, container , null, null, true);
                        //         checkCallback();
                        //     }.bind(this), checkCallback)
                        // }else{
                        this.orgAction.listIdentityByPerson(function(json){
                            var obj;
                            if(json.data.length > 1 && this.selector.options.onlyMajorIdentity){
                                for(var i=0; i<json.data.length; i++){
                                    if( json.data[i].major ){
                                        obj = {"data": [json.data[i]]};
                                        break;
                                    }
                                }
                                if(!obj)obj = {"data": [json.data[0]]};
                            }
                            this.loadIdentityItem(obj || json, container , null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d);
                        // }
                    }
                }else{
                    if( this.options.resultType === "person" ){
                        this.orgAction.listPersonByKey(function (json) {
                            this.loadPersonItem( json , container, null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d);
                    }else{
                        this.orgAction.listIdentityByKey(function(json){
                            this.loadIdentityItem(json, container, null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d);
                    }
                }
            }else{
                var arr = d.distinguishedName.split("@");
                var flag = arr[ arr.length - 1].toLowerCase();
                if( flag === "u" ) {
                    this.orgAction.getUnit(function (json) {
                        this.loadUnitItem(json, container, null, null, flatCategoryContainer);
                        checkCallback();
                    }.bind(this), checkCallback, d.distinguishedName);
                }else if( flag === "i" ){
                    this.orgAction.getIdentity(function (json) {
                        this.loadIdentityItem(json, container, null, null, true);
                        checkCallback();
                    }.bind(this), checkCallback, d.distinguishedName);
                }else if( flag === "g" ){
                    this.orgAction.getGroup(function(json){
                        json.data.each(function(d){ d.parentLevelName = d.name; });
                        this.loadGroupItem( json , container, null, null, flatCategoryContainer);
                        checkCallback();
                    }.bind(this), checkCallback, d.distinguishedName, null, null, true);
                }else if( flag === "p" ){
                    if( this.options.resultType === "person" ){
                        this.orgAction.getPerson(function (json) {
                            this.loadPersonItem(json, container, null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d.distinguishedName);
                    }else{
                        this.orgAction.listIdentityByPerson(function(json){
                            this.loadIdentityItem(json, container, null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d.distinguishedName);
                    }
                }else{
                    if( this.options.resultType === "person" ){
                        this.orgAction.getPerson(function (json) {
                            this.loadPersonItem(json, container, null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d.distinguishedName);
                    }else{
                        this.orgAction.getIdentity(function (json) {
                            this.loadIdentityItem(json, container, null, null, true);
                            checkCallback();
                        }.bind(this), checkCallback, d.distinguishedName);
                    }
                }
                //var category = this._newItemCategory("ItemCategory", unit, this, this.itemAreaNode);
            }
        }.bind(this))
    },
    loadPersonItem : function( json, container, level, category, isIncludedPerson ){
        if( !json.data )return;
        var array = typeOf( json.data ) === "array" ? json.data : [json.data];
        array.each(function(data){
            if( !this.selector.isExcluded( data ) ) {

                if(!this.includePerson)this.includePerson = [];
                if(isIncludedPerson)this.includePerson.push( data.distinguishedName );

                if(!this.includePersonObject)this.includePersonObject = [];
                if(isIncludedPerson)this.includePersonObject.push( data );

                var item = this.selector._newItem(data, this.selector, container || this.includeAreaNode, level || 1, category);
                this.selector.items.push(item);
                if(this.selector.addToItemMap)this.selector.addToItemMap(data,item);
                if( category && category.subItems ){
                    category.subItems.push( item );
                }else if(this.selector.subItems){
                    this.selector.subItems.push( item )
                }
            }
        }.bind(this));
    },
    loadIdentityItem : function( json, container, level, category, isIncludedIdentity ){
        if( !json.data )return;
        var array = typeOf( json.data ) === "array" ? json.data : [json.data];
        array.each(function(data){
            if( !this.selector.isExcluded( data ) ) {

                if(!this.includeIdentity)this.includeIdentity = [];
                if(isIncludedIdentity)this.includeIdentity.push( data.distinguishedName );

                if(!this.includeIdentityObject)this.includeIdentityObject = [];
                if(isIncludedIdentity)this.includeIdentityObject.push( data );

                var item = this.selector._newItem(data, this.selector, container || this.includeAreaNode, level || 1, category);
                this.selector.items.push(item);
                if(this.selector.addToItemMap)this.selector.addToItemMap(data,item);
                if( category && category.subItems ){
                    category.subItems.push( item );
                }else if(this.selector.subItems){
                    this.selector.subItems.push( item )
                }
            }
        }.bind(this));
    },
    loadUnitItem : function( json, container, level, parentCategory, flatCategoryContainer ){
        if( !json.data )return;
        var array = typeOf( json.data ) === "array" ? json.data : [json.data];
        array.each(function(data){
            if( !this.selector.isExcluded( data ) ) {
                if(!this.includeUnit)this.includeUnit = [];
                this.includeUnit.push( data.distinguishedName );
                var category;
                if( flatCategoryContainer ){
                    category = this.selector._newItemCategory("ItemUnitCategory", data, this.selector,
                        container || this.includeAreaNode, level, parentCategory, true);
                    category.nodeContainer = flatCategoryContainer;
                    category.load();
                }else{
                    category = this.selector._newItemCategory("ItemUnitCategory", data, this.selector,
                        container || this.includeAreaNode, level, parentCategory);
                }
                if( parentCategory && parentCategory.subCategorys ){
                    parentCategory.subCategorys.push( category );
                    if(parentCategory.subCategoryMap)parentCategory.subCategoryMap[data.parentLevelName || data.levelName] = category;
                }else if(this.selector.subCategorys){
                    this.selector.subCategorys.push( category );
                    this.selector.subCategoryMap[data.parentLevelName || data.levelName] = category;
                }
            }
        }.bind(this));
    },
    loadGroupItem : function( json, container, level, parentCategory, flatCategoryContainer ){
        if( !json.data )return;
        var array = typeOf( json.data ) === "array" ? json.data : [json.data];
        array.each(function(data){
            if( !this.selector.isExcluded( data ) ) {
                if(!this.includeGroup)this.includeGroup = [];
                this.includeGroup.push( data.distinguishedName );
                var category;
                if( flatCategoryContainer ){
                    category = this.selector._newItemCategory("ItemGroupCategory", data, this.selector, container || this.includeAreaNode, level, parentCategory, true);
                    category.nodeContainer = flatCategoryContainer;
                    category.load();
                }else{
                    category = this.selector._newItemCategory("ItemGroupCategory", data, this.selector, container || this.includeAreaNode, level, parentCategory)
                }
                if( parentCategory && parentCategory.subCategorys ){
                    parentCategory.subCategorys.push( category );
                    if(parentCategory.subCategoryMap)parentCategory.subCategoryMap[data.parentLevelName || data.name] = category;
                }else if(this.selector.subCategorys){
                    this.selector.subCategorys.push( category );
                    this.selector.subCategoryMap[data.parentLevelName || data.name] = category;
                }
            }
        }.bind(this));
    },

    listByFilter : function( type, key, callback ){
        var arr1 = this.listByFilterPerson(key) || [];
        this.listByFilterUnitAndGroup( type, key, function(arr2){
            this.listByFilterGroup( type, key, function(arr3){
                if (callback) callback( arr1.concat( arr2 || [] ).concat( arr3 || [] ) );
            }.bind(this))
        }.bind(this))
    },
    listByFilterPerson : function( key ){
        var identitys = [];
        var persons = [];
        var keyString = typeOf( key )==="string" ? key.toLowerCase() : key.key.toLowerCase();
        if( this.includeIdentityObject && this.includeIdentityObject.length ){
            identitys = this.includeIdentityObject.filter( function(id) {
                return ( id.pinyin || "" ).indexOf(keyString) > -1 || (id.pinyinInitial || "").indexOf(keyString) > -1 || (id.distinguishedName || "").indexOf(keyString) > -1;
            })
        }
        if( this.includePersonObject && this.includePersonObject.length ){
            persons = this.includePersonObject.filter( function(id) {
                return ( id.pinyin || "" ).indexOf(keyString) > -1 || (id.pinyinInitial || "").indexOf(keyString) > -1 || (id.distinguishedName || "").indexOf(keyString) > -1;
            })
        }
        return identitys.concat( persons);
    },
    listByFilterGroup : function( type, key, callback ){
        //根据关键字获取群组内的人员，再转成身份
        var keyString = typeOf( key )==="string" ? key.toLowerCase() : key.key.toLowerCase();
        if( this.includeGroup && this.includeGroup.length ){
            var keyObject = { "key" : keyString, "groupList" : this.includeGroup };
            this.orgAction[ type === "pinyin" ? "listPersonByPinyin" : "listPersonByKey" ](function(json){
                if( this.options.resultType === "person" ){
                    if (callback) callback( json.data );
                }else{
                    var personList = (json.data || []).map( function(d){
                        return d.id
                    });
                    o2.Actions.get("x_organization_assemble_express").listIdentityWithPerson( { "personList" : personList }, function(js){
                        if (callback) callback(js.data);
                    }.bind(this), function(){
                        if (callback) callback();
                    }.bind(this))
                }
            }.bind(this), function(){
                if (callback) callback();
            }.bind(this), keyObject);
        }else{
            if (callback) callback();
        }
    },
    listByFilterUnitAndGroup : function( type, key, callback ){
        //根据关键字获取组织和群组内的身份
        var keyString = typeOf( key )==="string" ? key.toLowerCase() : key.key.toLowerCase();

        if ( (this.includeUnit && this.includeUnit.length) || (this.includeGroup && this.includeGroup.length) ){
            key = this.getUnitFilterKey( key, this.includeUnit, this.includeGroup );

            this.orgAction.listIdentityByKey(function(json){
                if (callback) callback(json.data);
            }.bind(this), function(){
                if (callback) callback();
            }, key);
        }else{
            if (callback) callback();
        }
    },
    getUnitFilterKey : function( key, unitObject, groupObject ){
        var unitObjects = unitObject || [];
        var units = [];
        unitObjects.each(function(u){
            if (typeOf(u)==="string"){
                units.push(u);
            }
            if (typeOf(u)==="object"){
                units.push(u.distinguishedName);
            }
        });

        var groupObjects = groupObject || [];
        var groups = [];
        groupObjects.each(function(g){
            if (typeOf(g)==="string"){
                groups.push(g);
            }
            if (typeOf(g)==="object"){
                groups.push(g.distinguishedName);
            }
        });
        if( !units.length && !groups.length ){
            return key;
        }else{
            var result = { "key": key };
            if( units.length )result.unitList = units;
            if( groups.length )result.groupList = groups;
            return result;
        }
        // return units.length ? {"key": key, "unitList": units, "groupList" : groups} : key;
    }
});

MWF.xApplication.Selector.Identity.Filter = new Class({
    Implements: [Options, Events],
    options: {
        "style": "default",
        "units": [],
        "resultType" : "" //可以设置成个人，那么结果返回个人
    },
    initialize: function(value, options){
        this.setOptions(options);
        this.value = value;
        this.orgAction = MWF.Actions.get("x_organization_assemble_control");
    },
    filter: function(value, callback){
        this.value = value;
        var key = this.value;
        if (this.options.units.length){
            var units = [];
            this.options.units.each(function(u){
                if (typeOf(u)==="string"){
                    units.push(u);
                }
                if (typeOf(u)==="object"){
                    units.push(u.distinguishedName);
                }
            });
            key = {"key": this.value, "unitList": units};
        }
        var data = null;
        this.orgAction.listIdentityByKey(function(json){
            data = json.data;
            if (callback) callback(data)
        }.bind(this), null, key);
    }
});
