// o2.require("o2.widget.Common", null, false);
// o2.require("o2.xDesktop.Common", null, false);
// o2.require("o2.xDesktop.Actions.RestActions", null, false);
// o2.require("o2.xDesktop.Authentication", null, false);

o2.require("o2.widget.PinYin", null, false);

o2.xDesktop.Default = new Class({
    Implements: [Options, Events],
    options: {
        "style": "blue",
        "index": "Homepage"
    },
    zoomOut: function(){
        if (!layout.userLayout.scale) layout.userLayout.scale = 1;
        layout.userLayout.scale = layout.userLayout.scale-0.1;
        if (layout.userLayout.scale<0.4) layout.userLayout.scale = 0.4;
        this.zoom();
    },
    zoomIn: function(){
        if (!layout.userLayout.scale) layout.userLayout.scale = 1;
        layout.userLayout.scale = layout.userLayout.scale+0.1;
        if (layout.userLayout.scale>5) layout.userLayout.scale = 5;
        this.zoom();
    },
    zoom: function(v){
        if (v){
            layout.userLayout.scale = v;
            if (layout.userLayout.scale<0.4) layout.userLayout.scale = 0.4;
            if (layout.userLayout.scale>5) layout.userLayout.scale = 5;
        }
        if (layout.userLayout.scale){
            var s = (1/layout.userLayout.scale)*100;
            var p = s+"%";
            document.id(document.documentElement).setStyles({
                "transform": "scale("+layout.userLayout.scale+")",
                "transform-origin": "0 0",
                "width": p,
                "height":p
            });
            this.fireEvent("resize");
            this.setZoomValue();
        }
    },
    setZoomValue: function(){
        if (!layout.userLayout.scale) layout.userLayout.scale = 1;
        var scaleP = Math.round(layout.userLayout.scale*100);
        if (this.zoomValueNode) this.zoomValueNode.set("text", scaleP+"%");
    },
    returnZoom: function(){
        this.zoom(1);
        if (this.zoomSlider){
            this.zoomSlider.set(100);
        }
    },
    zoomMenuShow: function(){
        this.sliderNode.show();
        this.sliderNode.set('tween', {duration: 100});
        this.sliderNode.tween('width', '160');

        if (!this.zoomSlider){
            if (!layout.userLayout.scale) layout.userLayout.scale = 1;
            this.sliderNode.addEvent("mousedown", function (e){
                e.stopPropagation();
                e.preventDefault();
            });

            this.zoomSlider = new Slider(this.zoomSliderNode, this.zoomSliderKnobNode, {
                range: [30, 300],
                wheel: false,
                snap: true,
                //mode: "vertical",

                steps: 27,
                initialStep: layout.userLayout.scale*100,
                onChange: function(step){
                    if (this.zoomValueNode) this.zoomValueNode.set("text", step+"%");
                }.bind(this),
                onComplete: function(step){
                    var scale = step/100;
                    this.zoom(scale);
                    this.zoomMenuHide();
                }.bind(this)
            });
        }

        this.hideZoom = this.zoomMenuHide.bind(this);
        this.desktopNode.addEvent("mousedown", this.hideZoom);
    },
    zoomMenuHide: function(){
        this.sliderNode.set('tween', {duration: 100});
        this.sliderNode.tween('width', '0');

        if (this.hideZoom) this.desktopNode.removeEvent("mousedown", this.hideZoom);
    },

    initialize: function(node, options){
        this.setOptions(options);
        this.type = "layout";
        this.path = o2.session.path+"/xDesktop/$Default/";
        this.node = $(node);
        this.node.empty();
        this.initData();
        this.zoom();
        //this.load();
    },
    initData: function(){
        this.apps = {};
        this.appArr = [];
        this.appCurrentList = [];
        this.lnks = [];
        this.currentApp = null;
        this.session = {};
        this.serviceAddressList = layout.serviceAddressList;
        this.centerServer = layout.centerServer;
        this.session.user = layout.session.user;

        var uri = new URI(window.location.href);
        var df = uri.getData("default") || "";
        this.noDefault = df.toString().toLowerCase()==="false";
        var appNames = uri.getData("app");
        var optionsStr = uri.getData("option");
        var options = (optionsStr) ? JSON.decode(optionsStr) : null;

        if (appNames){
            this.status = layout.userLayout;
            this.status.apps = {};
            this.status.apps[appNames] = options || {};
            this.status.apps[appNames].name = appNames;
            this.status.apps[appNames].appId = appNames;
            this.status.apps[appNames].isIndex = true;
            this.status.currentApp = appNames;
        }else{
            this.status = layout.userLayout;
        }
        if (this.status && this.status.flatStyle) this.options.style = this.status.flatStyle;
    },

    load: function(cb){
        this.loadLayout(function(){
            this.setEvent();
            if (!this.noDefault) this.loadDefaultPage();
            window.setTimeout(function(){
                var iconsPath = this.path+"icons.json";
                o2.JSON.get(iconsPath, function(json) {
                    this.iconsJson = json;
                    this.loadDefaultLnk();

                    this.loadStatus();

                    if (cb) cb();
                }.bind(this));

                this.openWebSocket();

                this.checkTaskBarSize();
                this.addEvent("resize", this.checkTaskBarSize.bind(this));

            }.bind(this), 0);

            this.loadMessageMenu();

            this.setZoomValue();

            this.fireEvent("load");
            MWF.require("MWF.xDesktop.shortcut");
        }.bind(this));
    },
    resizeHeight: function(){
        var y = this.menuNode.getSize().y;
        var y1 = this.startMenuNode.getParent().getSize().y;
        var o1 = this.startMenuNode.getParent().getStyles("border-top-width", "margin-top", "padding-top", "border-bottom-width", "margin-bottom", "padding-bottom");
        var y2 = this.settingNode.getParent().getSize().y;
        var o2 = this.settingNode.getParent().getStyles("border-top-width", "margin-top", "padding-top", "border-bottom-width", "margin-bottom", "padding-bottom");

        oy1 = o1["border-top-width"].toInt()+o1["margin-top"].toInt()+o1["padding-top"].toInt()+o1["border-bottom-width"].toInt()+o1["margin-bottom"].toInt()+o1["padding-bottom"].toInt();
        oy2 = o2["border-top-width"].toInt()+o2["margin-top"].toInt()+o2["padding-top"].toInt()+o2["border-bottom-width"].toInt()+o2["margin-bottom"].toInt()+o2["padding-bottom"].toInt();

        var height = y-y1-y2-oy1-oy2;
        this.lnkContentNode.setStyle("height", ""+height+"px");
    },
    checkTaskBarSize: function(){
        window.setTimeout(function(){
            var size = this.taskContentAreaNode.getSize();
            var contentSize = this.taskContentNode.getSize();
            if (size.y<contentSize.y){
                this.taskActionUp.show();
                this.taskActionDown.show();
            }else{
                this.taskActionUp.hide();
                this.taskActionDown.hide();
            }
        }.bind(this), 50);
    },
    checkTaskBarScrollTo: function(app){
        var currentApp = app || this.currentApp;
        if (currentApp && currentApp.taskitem){
            var size = this.taskContentAreaNode.getSize();
            var scroll = this.taskContentAreaNode.getScroll();
            var scrollSize = this.taskContentAreaNode.getScrollSize();
            var p = currentApp.taskitem.node.getPosition(this.taskContentNode);
            if (p.y!=scroll.y){
                var scrollTo = p.y;
                if (scrollTo<scrollSize.y-size.y){
                    this.taskActionDown.addClass("icon_down");
                    this.taskActionDown.removeClass("icon_down_gray");
                }else{
                    this.taskActionDown.removeClass("icon_down");
                    this.taskActionDown.addClass("icon_down_gray");
                }
                if (scrollTo<=0){
                    scrollTo = 0;
                    this.taskActionUp.removeClass("icon_up");
                    this.taskActionUp.addClass("icon_up_gray");
                }else{
                    this.taskActionUp.addClass("icon_up");
                    this.taskActionUp.removeClass("icon_up_gray");
                }
                this.taskContentAreaNode.scrollTo(0, p.y);
            }
        }
    },
    toolbarUp: function(){
        var size = this.taskContentAreaNode.getSize();
        var scroll = this.taskContentAreaNode.getScroll();
        var scrollSize = this.taskContentAreaNode.getScrollSize();
        var scrollTo = scroll.y-size.y;
        if (scrollTo<scrollSize.y-size.y){
            this.taskActionDown.addClass("icon_down");
            this.taskActionDown.removeClass("icon_down_gray");
        }
        if (scrollTo<=0){
            scrollTo = 0;
            this.taskActionUp.removeClass("icon_up");
            this.taskActionUp.addClass("icon_up_gray");
        }
        this.taskContentAreaNode.scrollTo(0,scrollTo);
    },
    toolbarDown: function(){
        var size = this.taskContentAreaNode.getSize();
        var scroll = this.taskContentAreaNode.getScroll();
        var scrollSize = this.taskContentAreaNode.getScrollSize();
        var scrollTo = scroll.y+size.y;
        if (scrollTo+size.y>=scrollSize.y){
            scrollTo=scrollSize.y-size.y;
            this.taskActionDown.removeClass("icon_down");
            this.taskActionDown.addClass("icon_down_gray");
        }
        if (scrollTo>0){
            this.taskActionUp.addClass("icon_up");
            this.taskActionUp.removeClass("icon_up_gray");
        }
        this.taskContentAreaNode.scrollTo(0, scrollTo);
    },


    loadLayout: function(callback){
        this.session.user.iconUrl = o2.filterUrl(o2.Actions.get("x_organization_assemble_control").getPersonIcon(this.session.user.id));

        var css = this.path+this.options.style+ ((o2.session.isMobile || layout.mobile) ? "/style-pc.css" : "/style-pc.css");
        var skinCss = this.path+this.options.style+ "/style-skin.css";
        var html = this.path+this.options.style+((o2.session.isMobile || layout.mobile) ? "/layout-pc.html" : "/layout-pc.html");

        this.node.loadAll({ "css": [css], "html": [html]}, {"bind": {"user": this.session.user}, "module": this},function(){
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function(){
                var reader  = new FileReader();
                reader.addEventListener("load", function () {
                    this.userInforNode.getFirst().setStyle("background-image", "url("+reader.result+")");
                }.bind(this), false);
                reader.readAsDataURL(oReq.response);
            }.bind(this));
            oReq.open("GET", this.session.user.iconUrl);
            oReq.setRequestHeader("authorization", layout.session.user.token);
            oReq.responseType = "blob";
            oReq.withCredentials = true;
            oReq.send();

            // var res = new Request({
            //     "url": this.session.user.iconUrl,
            //     method: "get",
            //     withCredentials: true,
            //     onSuccess: function(response,a,s,d){
            //
            //     }.bind(this)
            // });
            // res.setHeader("authorization", layout.session.user.token);
            // res.send();
debugger;
            this.sliderNode.getLast().set("title", o2.LP.desktop.returnZoom);

            this.node.loadCss(skinCss);
            if (callback) callback();
            // this.node.load(html, {
            //     "bind": {"user": this.session.user}
            // }, function(){});
        }.bind(this));
    },


    setEvent: function(){
        this.loadSkinMenu();
        this.loadUserMenu();

        window.onbeforeunload = function(e){
            if (!this.isLogout){
                if (this.apps["Note"]){
                    if (this.apps["Note"].notes){
                        this.apps["Note"].notes.each(function(note){
                            note.save();
                        });
                    }
                }
                if (!this.notRecordStatus) this.recordDesktopStatus();
                this.closeWebSocket();
                //if (this.socket && this.socket.webSocket) this.socket.close();
                this.fireEvent("unload");
                e = e || window.event;
                e.returnValue = o2.LP.desktop.notice.unload;
                return o2.LP.desktop.notice.unload;
            }
        }.bind(this);

        $(window).addEvent("resize", function(){
            this.fireEvent("resize");
        }.bind(this));

        this.resizeHeight();
        this.addEvent("resize", this.resizeHeight.bind(this));

        o2.require("o2.widget.ScrollBar", function(){
            this.appScrollBar = new o2.widget.ScrollBar(this.lnkContentNode, {
                "style":"hide", "where": "before", "indent": true, "distance": 100, "friction": 0,	"axis": {"x": false, "y": true}
            });
        }.bind(this));
    },

    loadDefaultPage: function(){
        //默认载入首页
        var app;
        if (layout.config.indexPage && layout.config.indexPage.enable && layout.config.indexPage.portal){
            appId = "portal.Portal"+layout.config.indexPage.portal;
            this.options.index = appId;
            //var options = {"portalId": layout.config.indexPage.portal, "pageId": layout.config.indexPage.page, "appId": appId};

            app = {
                "options": {"name": "portal.Portal", "portalId": layout.config.indexPage.portal, "pageId": layout.config.indexPage.page, "appId": appId},
                "close": function(){
                    this.taskitem.destroy();
                },
                "setCurrent": function(){
                    if (this.taskitem.textNode) this.taskitem.textNode.click();
                }
            };
            //layout.openApplication(null, "portal.Portal", options);
        }else{
            app = {
                "options": {"name": "Homepage", "appId": "Homepage", "title": o2.LP.desktop.homepage},
                "close": function(){
                    this.taskitem.destroy();
                },
                "setCurrent": function(){
                    if (this.taskitem.textNode) this.taskitem.textNode.click();
                }
            };
            //layout.openApplication(null, "Homepage");
        }

        taskitem = layout.desktop.createTaskItem(app);
        app.taskitem = taskitem;
        app.options.isIndex = true;
        this.apps[app.options.appId] = app;
        taskitem.textNode.click();
    },
    loadDefaultLnk: function(){
        if (this.status && this.status.flatLnks && this.status.flatLnks.length){

        }else{
            o2.JSON.get(this.path+"defaultLnk.json", function(defaultLnk){
                defaultLnk.each(function(lnkJson){
                    this.addLnk(lnkJson);
                }.bind(this));
            }.bind(this));
        }
    },
    loadMenuData: function(){
        debugger;
        this.menuData = this.status.menuData;
        o2.UD.getPublicData("clearCustomMenuDataFlag", function(data){
            if (data && !!data.id && data.id != this.status.clearCustomMenuDataFlag){
                this.status.menuData = null;
                this.menuData = null;
                this.status.clearCustomMenuDataFlag = data.id;
            }
            o2.UD.getPublicData("forceMainMenuData", function(fData){
                if (fData){
                    this.status.menuData=fData;
                    this.menuData = this.status.menuData;
                }else{
                    if (!this.status.menuData){
                        o2.UD.getPublicData("defaultMainMenuData", function(dData){
                            if (dData){
                                this.status.menuData=dData;
                                this.menuData = this.status.menuData;
                            }
                        }.bind(this));
                    }
                }
            }.bind(this));
        }.bind(this));
    },
    loadStatus: function(){
        if (this.status){
            this.loadMenuData();
            //this.menuData = this.status.menuData;
            var keys = Object.keys(this.status.apps);
            if (this.status.apps && keys.length){

                if (this.status.currentApp == "Note"){
                    var idx = keys.length-1;
                    while (idx>-1 && keys[idx]=="Note") idx--;
                    this.status.currentApp = (idx>-1) ? this.status.apps[keys[idx]].appId : "";
                }
                var currentTaskitem = null;
                Object.each(this.status.apps, function(appStatus, id){
                    var app = {
                        "options": appStatus,
                        "close": function(){
                            this.taskitem.destroy();
                        },
                        "setCurrent": function(){
                            if (this.taskitem.textNode) this.taskitem.textNode.click();
                        }
                    };
                    taskitem = layout.desktop.createTaskItem(app);
                    app.taskitem = taskitem;

                    this.apps[appStatus.appId] = app;
                    if ((this.status.currentApp === appStatus.appId)) currentTaskitem=taskitem;
                    if (appStatus.appId=="Note") app.setCurrent();
                }.bind(this));

                if (currentTaskitem) {
                    currentTaskitem.textNode.click();
                }

            }

            if (this.status.widgets){/* nothing to do */}

            if (this.status.flatLnks && this.status.flatLnks.length){
                this.status.flatLnks.each(function(lnkJson){
                    this.addLnk(lnkJson);
                }.bind(this));
            }
        }
    },
    addLnk: function(lnkData, targetLnk, position){
        var lnk = new o2.xDesktop.Default.Lnk(this, lnkData, targetLnk, position);
        if (targetLnk){
            var idx =  this.lnks.indexOf(targetLnk);
            if (position=="before"){
                this.lnks.splice(idx, 0, lnk);
            }else{
                this.lnks.splice(idx+1, 0, lnk);
            }

        }else{
            this.lnks.push(lnk);
        }
    },

    openWebSocket: function(){
        MWF.require("MWF.xDesktop.WebSocket", function(){
            this.socket = new MWF.xDesktop.WebSocket();
        }.bind(this));
    },
    closeWebSocket: function(){
        if (this.socket) this.socket.close();
    },

    //******* begin page skin ****************************************************
    loadSkinMenu: function(){
        if (!this.styleMenu){
            this.styleMenu = new o2.xDesktop.Menu(this.skinActionNode, {
                "event": "click", "style": "flatStyle", "offsetX": -10, "offsetY": 26, "container": this.node,
                "onQueryShow": this.showSkinMenu.bind(this),
                "onQueryHide": function(){
                    this.skinActionNode.removeClass("icon_skin_focus");
                    this.skinActionNode.removeClass("mainColor_bg");
                }.bind(this)
            });
            this.styleMenu.load();
            this.loadSkinMenuItems();
        }
    },
    showSkinMenu: function(){
        this.styleMenu.items.each(function(item){
            if (this.options.style==item.styleName){
                item.setDisable(true);
                if (item.text) item.text.setStyles({ "background": "url("+this.path+this.options.style+"/icons/icon_gouxuan.png) right center no-repeat" });
            }else{
                item.setDisable(false);
                if (item.text) item.text.setStyles({ "background": "transparent" });
            }
        }.bind(this));
        this.skinActionNode.addClass("icon_skin_focus");
        this.skinActionNode.addClass("mainColor_bg");
    },
    loadSkinMenuItems: function(){
        o2.JSON.get(this.path+"styles.json", function(json){
            json.each(function(style){
                var color = style.color;
                var memuItem = this.styleMenu.addMenuItem(style.title, "click", function(){this.changeLayoutSkin(style.style);}.bind(this));
                memuItem.styleName = style.style;
                var imgDiv = memuItem.item.getFirst();
                var imgNode = new Element("div", {"styles": memuItem.menu.css.menuItemImg}).inject(imgDiv);
                imgNode.setStyle("background-color", color);
            }.bind(this));
            this.styleMenu.addMenuLine();
            var img = o2.defaultPath+"/xDesktop/$Layout/default/preview.jpg";
            var memuItem = this.styleMenu.addMenuItem(o2.LP.desktop_style, "click", function(e){this.changeToDesktopStyle(e);}.bind(this), img);
            memuItem.styleName = "desktop";
        }.bind(this));
    },
    changeLayoutSkin: function(style){
        var skinCss = this.path+this.options.style+ "/style-skin.css";
        o2.removeCss(skinCss);
        this.options.style = style;
        skinCss = this.path+this.options.style+"/style-skin.css";
        this.node.loadCss(skinCss);
    },
    changeToDesktopStyle: function(e){
        //MWF.xDesktop.confirm("infor", e, o2.LP.desktop.changeViewTitle, {"html": o2.LP.desktop.changeView}, 500, 100, function(){
        //        this.close();
        var uri = new URI(window.location.href);
        uri.setData("view", "layout");
        uri.go();
        //     }, function(){
        //         this.close();
        //     }, null, null, "o2"
        // );
    },
    //******* end page skin ****************************************************

    //******* begin user menu ****************************************************
    loadUserMenu: function(){
        if (!this.userMenu){
            this.userMenu = new o2.xDesktop.Menu(this.userInforNode, {
                "event": "click", "style": "flatUser", "offsetX": 30, "offsetY":6, "container": this.node
                // "onQueryShow": this.showSkinMenu.bind(this),
                // "onQueryHide": function(){
                //     this.skinActionNode.removeClass("icon_skin_focus");
                //     this.skinActionNode.removeClass("mainColor_bg");
                // }.bind(this),
            });
            this.userMenu.load();
            this.loadUserMenuItems();
        }
    },
    loadUserMenuItems: function(){
        var img = this.path+this.options.style+"/icons/config.png";
        this.userMenu.addMenuItem(o2.LP.desktop.userConfig, "click", function(e){this.userConfig(e);}.bind(this), img);

        // var lpMenu = new o2.xDesktop.Menu(this.userInforNode, {
        //     "event": "click", "style": "flatUser", "offsetX": 30, "offsetY":6, "container": this.node
        // });
        //
        // img = this.path+"/lp/zh-cn.png";
        // var lp = this.userMenu.addMenuMenu(o2.LP.desktop.userLanguage, "click", function(e){this.userConfig(e);}.bind(this), img);

        this.userMenu.addMenuLine();

        img = this.path+this.options.style+"/icons/logout.png";
        this.userMenu.addMenuItem(o2.LP.desktop.logout, "click", function(){this.logout();}.bind(this), img);

        if (layout.config.enableSafeLogout) this.userMenu.addMenuItem(o2.LP.desktop.safeLogout, "click", function(e){this.safeLogout(e);}.bind(this), img);
    },
    userConfig: function(e){
        layout.openApplication(e, "Profile");
    },
    logout: function(){
        this.isLogout = true;
        if (!this.notRecordStatus){
            this.recordDesktopStatus(function(){
                (layout.authentication ||  new o2.xDesktop.Authentication()).logout();
            }.bind(this.layout));
        }else{
            (layout.authentication ||  new o2.xDesktop.Authentication()).logout();
        }
    },
    safeLogout: function(e){
        var _self = this;
        o2.xDesktop.confirm("warn", e, o2.LP.desktop.safeLogoutTitle, {"html": o2.LP.desktop.safeLogoutMessage}, 460, 100, function(){
            _self.isLogout = true;
            if (!_self.notRecordStatus){
                _self.recordDesktopStatus(function(){
                    (layout.authentication ||  new o2.xDesktop.Authentication()).safeLogout();
                }.bind(_self.layout));
            }else{
                (layout.authentication ||  new o2.xDesktop.Authentication()).safeLogout();
            }
        }, function(){
            this.close();
        });
    },
    //******* end user menu ****************************************************

    //******* begin search *****************************************************
    focusSearch: function(){
        this.searchBoxNode.addClass("layout_content_taskbar_area_search_box_focus");
        this.searchBoxNode.addClass("mainColor_border");
        this.searchIconNode.addClass("icon_search_focus");
    },
    blurSearch: function(){
        this.searchBoxNode.removeClass("layout_content_taskbar_area_search_box_focus");
        this.searchBoxNode.removeClass("mainColor_border");
        this.searchIconNode.removeClass("icon_search_focus");
    },
    searchInputKeyDown: function(e){
        if (this.searchInputNode.get("value")){
            this.searchClearNode.addClass("icon_clear");
        }else{
            this.searchClearNode.removeClass("icon_clear");
        }
        if (e.keyCode===13) this.doSearch();
    },
    clearSearch: function(){
        this.searchInputNode.set("value", "");
        this.searchClearNode.removeClass("icon_clear");
        this.clearSearchResult();
    },
    doSearch: function(){
        var key = this.searchInputNode.get("value");
        if (key){
            if (this.apps["Search"]){
                this.apps["Search"].input.setValue(key);
                this.apps["Search"].input.doSearch();
            }
            layout.openApplication(null,"Search", {"key": key});
        }
    },
    clearSearchResult: function(){
        //alert("clear search result");
        // @todo
    },
    //******* end search*******************************************************

    //******* begin record status *********************************************
    recordDesktopStatus: function(callback){
        Object.each(this.apps, function(app, id){
            if (!app.options.desktopReload){
                this.closeApp(app);
            }
        }.bind(this));
        var status = this.getLayoutStatusData();

        // if (navigator.sendBeacon) {
        //     var obj = this.personalAction.action.actions["putUserData"];
        //     var url = this.personalAction.action.address + obj.uri;
        //     url = url.replace("{name}", "layout");
        //     navigator.sendBeacon(url, status);
        // } else {
        try{
            o2.UD.putData("layout", status, function(){
                if (callback) callback();
            });
        }catch(e){};

        // }


    },
    getLayoutStatusData: function(){
        var status = {
            "viewMode": "Default",
            "style": this.status.style,
            "flatStyle": this.options.style,
            "styleType": this.status.styleType || "",
            "currentApp": (this.currentApp) ? this.currentApp.appId : "Homepage",
            "apps": {},
            "lnks": (this.status.lnks && o2.typeOf(this.status.lnks)==="array") ? this.status.lnks : [],
            //"lnks": [],
            "flatLnks": [],
            "widgets": {},
            "menuData": this.menuData,
            "scale": layout.userLayout.scale || 1,
            "clearCustomMenuDataFlag": this.status.clearCustomMenuDataFlag || "",
            "gotoWorkcenterConfirm": layout.userLayout.gotoWorkcenterConfirm || false
        };
        // this.appArr.each(function(app){
        //     if (app.options.appId!==this.options.index){
        //         var appStatus = this.getAppStatusData(app, app.appId);
        //         if (appStatus) status.apps[id] = appStatus;
        //     }
        // }.bind(this));
        Object.each(this.apps, function(app, id){
            if (app.options.appId!==this.options.index){
                var appStatus = this.getAppStatusData(app, id);
                if (appStatus) status.apps[id] = appStatus;
            }

            if (app.isIndex){
                if (!status.apps[id]) status.apps[id] = {};
                status.apps[id].isIndex = true;
            }
        }.bind(this));
        this.lnks.each(function(lnk){
            status.flatLnks.push(lnk.data);
            //status.flatLnks.push({"icon": lnk.icon, "color": lnk.color, "title": lnk.title,"par": lnk.par});
        });
        Object.each(this.widgets, function(widget, id){
            var widgetStatus = this.getWidgetStatusData(widget, id);
            if (widgetStatus) status.widgets[id] = widgetStatus;
        }.bind(this));
        return status;
    },
    getAppStatusData: function(app, id){
        var appStatus = null;
        if (app.window){
            if (app.options.desktopReload){
                appStatus ={
                    "appId": app.appId,
                    "name": app.options.name,
                    "style": app.options.style,
                    "title": app.options.title,
                    "window": {
                        //     //"size": app.window.node.getSize(),
                        //     "size": {"x": app.window.css.to.width.toFloat(), "y": app.window.css.to.height.toFloat()},
                        //     "position": {"x": app.window.css.to.left.toFloat(), "y": app.window.css.to.top.toFloat()},
                        //     "isMax": app.window.isMax,
                        //     "isHide": app.window.isHide,
                        //     "style": app.window.options.style
                    },
                    "app": null
                };
                if (app.recordStatus) appStatus.app = app.recordStatus();
            }
        }else{
            if (app.options){
                appStatus = app.options;
            }
        }
        return appStatus;
    },
    getWidgetStatusData: function(widget, id){
        var widgetStatus ={
            "name": widget.options.name,
            "appName": widget.options.appName,
            "position": widget.options.position,
            "widget": null
        };
        if (widget.recordStatus) widgetStatus.widget = widget.recordStatus();
        return widgetStatus;
    },

    //******* end record status ***********************************************

    //******* begin start menu ************************************************
    showStartMenu: function(){
        this.loadStartMenu(function(){
            if (!this.startMenu.isShow){
                this.startMenuNode.addClass("overColor_bg");
                this.startMenu.show();
            }
        }.bind(this));
    },
    loadStartMenu: function(callback){
        if (!this.startMenu){
            this.startMenu = new o2.xDesktop.Default.StartMenu(this);
            this.startMenu.addEvents({
                "onHide": function(){
                    this.startMenuNode.removeClass("overColor_bg");
                }.bind(this),
                "onLoad": function(){
                    if (callback) callback();
                }
            });
            this.startMenu.load();
        }else{
            if (this.startMenu.isLoaded) if (callback) callback();
        }
    },
    //******* end start menu **************************************************

    //******* begin message menu **********************************************
    showDesktopMessage: function(){
        if (!this.message){
            this.loadMessageMenu(function(){
                this.showMessage();
            }.bind(this));
        }else{
            this.showMessage();
        }
    },
    loadMessageMenu: function(callback){
        o2.require("o2.xDesktop.MessageV2", function(){
            this.message = new o2.xDesktop.MessageV2(this);
            this.message.addEvents({
                "onLoad": function(){ if (callback) callback(); }.bind(this),
                "onHide": function(){
                    this.msgActionNode.removeClass("icon_msg_focus");
                    this.msgActionNode.removeClass("mainColor_bg");
                }.bind(this),
            });
            this.message.load();

        }.bind(this));
    },
    showMessage: function(){
        if (!this.message.isShow){
            this.msgActionNode.addClass("icon_msg_focus");
            this.msgActionNode.addClass("mainColor_bg");
            this.message.show();
        }
    },
    //******* end message menu ************************************************

    //******* begin task item *************************************************
    createTaskItem: function(app){
        return new o2.xDesktop.Default.TaskItem(this, app);
    },
    //******* end task item ***************************************************

    closeApp: function(app, hasTaskitem) {
        var appId = app.appId;
        this.appCurrentList.erase(app);
        this.appArr.erase(app);
        this.apps[appId] = null;
        delete this.apps[appId];

        if (!hasTaskitem){
            var i = this.appCurrentList.length;
            if (i && this.appCurrentList[i-1]){
                this.appCurrentList[i-1].setCurrent();
            }else{
                var keys = Object.keys(this.apps);
                i = keys.length;
                if (i && this.apps[keys[i-1]] && this.apps[keys[i-1]].setCurrent){
                    this.apps[keys[i-1]].setCurrent();
                }else{
                    //if (app.appId!=="Homepage") layout.openApplication(null, "Homepage");
                    layout.openApplication(null, "Homepage");
                }
            }
            this.checkTaskBarSize();
            this.checkTaskBarScrollTo();
        }

    },
    refreshApp:function(app){
        if (app.window){
            var taskitem = app.taskitem;
            var appStatus ={
                "id": app.appId,
                "name": app.options.name,
                "style": app.options.style,
                "appId": app.appId
            };
            var status = (app.recordStatus) ? app.recordStatus() : null;

            app.close(true);
            layout.openApplication(null, appStatus.name, appStatus, status, false, taskitem);
            //this.openApplicationWithStatus(appStatus);
        }
    },
    getPageDesignerStyle: function(callback){
        if (!this.pageDesignerStyle){
            this.pageDesignerStyle = "default";
            MWF.UD.getData("pageDesignerStyle", function(json) {
                if (json.data) {
                    var styles = JSON.decode(json.data);
                    this.pageDesignerStyle = styles.style;
                }
                if (callback) callback();
            }.bind(this));
        }else{
            if (callback) callback();
        }
    },
    getFormDesignerStyle: function(callback){
        if (!this.formDesignerStyle){
            this.formDesignerStyle = "default";
            MWF.UD.getData("formDesignerStyle", function(json) {
                if (json.data) {
                    var styles = JSON.decode(json.data);
                    this.formDesignerStyle = styles.style;
                }
                if (callback) callback();
            }.bind(this));
        }else{
            if (callback) callback();
        }
    },

    createRefreshNode: function(){
        this.refreshNode = new Element("div.layout_refresh_node.icon_refresh").inject(this.desktopNode);
        this.refreshNode.set("morph", {
            "duration": 100,
            "transition": Fx.Transitions.Quart.easeOut
        });
        this.refreshNode.addEvent("click", function(){
            if (this.currentApp) this.currentApp.refresh();
            this.hideRefresh();
        }.bind(this));
    },
    showRefresh: function(){
        if (!this.refreshNodeShow){
            if (!this.refreshNode) this.createRefreshNode();
            var size = this.taskbarNode.getSize();
            var nodeSize = this.refreshNode.getSize();
            var top = size.y;
            var left = size.x/2-nodeSize.x/2;
            this.refreshNode.setStyles({
                "left": left,
                "top": 0-nodeSize.y,
                "opacity": 0
            });

            this.refreshNode.morph({
                "top": top,
                "left": left,
                "opacity": 0.9
            });
            this.refreshNodeShow = true;

            this.refreshTimeoutId = window.setTimeout(function(){
                this.hideRefresh();
            }.bind(this), 2000);
        }
    },
    hideRefresh: function(){
        if (this.refreshNodeShow){
            if (this.refreshNode){
                var size = this.taskbarNode.getSize();
                var nodeSize = this.refreshNode.getSize();
                var top = size.y;
                var left = size.x/2-nodeSize.x/2;
                this.refreshNode.morph({
                    "top": 0-nodeSize.y,
                    "left": left,
                    "opacity": 0
                });
                window.setTimeout(function(){
                    this.refreshNodeShow = false;
                }.bind(this), 100);
            }
        }
        if (this.refreshTimeoutId){
            window.clearTimeout(this.refreshTimeoutId);
            this.refreshTimeoutId = "";
        }
    }
});

o2.xDesktop.Default.StartMenu = new Class({
    Implements: [Events],

    initialize: function(layout){
        this.layout = layout;
        this.container = this.layout.startMenuArea;
        this.actionNode = this.layout.startMenuNode;
        this.isLoaded = false;
        this.isShow = false;
        this.isMorph = false;
        this.items = [];

        this.menuData = (this.layout.status && this.layout.status.menuData) ? this.layout.status.menuData : {
            "appList": [],
            "processList": [],
            "inforList": [],
            "queryList": []
        };

        this.itemTempletedHtml = "" +
            "   <div class='layout_start_item_iconArea'>" +
            "       <div class='layout_start_item_icon'></div>" +
            "   </div>" +
            "   <div class='layout_start_item_text'></div>"+
            "   <div class='layout_start_item_badge'></div>";
    },
    load: function(){
        var view = this.layout.path+this.layout.options.style+((o2.session.isMobile || layout.mobile) ? "/layout-menu-mobile.html" : "/layout-menu-pc.html");
        this.container.loadHtml(view, {"module": this}, function(){
            this.maskNode.setStyle("z-index", o2.xDesktop.zIndexPool.applyZindex());
            this.node.setStyle("z-index", o2.xDesktop.zIndexPool.applyZindex());
            this.layout.menuNode.setStyle("z-index", o2.xDesktop.zIndexPool.applyZindex());

            this.node.addEvent("mousedown", function(e){
                e.stopPropagation();
                e.preventDefault();
            });

            this.triangleNode = new Element("div.layout_menu_start_triangle").inject(this.layout.menuNode, "after");
            this.hideMessage = function(){ this.hide(); }.bind(this);
            this.fireEvent("load");
            this.layout.addEvent("resize", this.setSize.bind(this));
            this.loadTitle();
            this.loadLnks();

            this.isLoaded = true;
            this.fireEvent("load");
        }.bind(this));
    },
    resetMenuData: function(){
        if (!this.menuData) this.menuData = {
            "appList": [],
            "processList": [],
            "inforList": [],
            "queryList": []
        }
        var nodes = this.appContentNode.getChildren();
        var data = [];

        nodes.each(function(node){
            var item = node.retrieve("item");
            if (item){
                if (item.data.type==="group"){
                    var d = {
                        "id": item.data.id,
                        "name": item.data.name,
                        "type": item.data.type,
                        "itemDataList": []
                    }
                    if (item.data.itemDataList) item.data.itemDataList.each(function(i){
                        d.itemDataList.push(i);
                    });
                    data.push(d);
                }else{
                    data.push({
                        "id": item.data.id,
                        "name": item.data.name,
                        "type": item.data.type,
                    });
                }
            }
        }.bind(this));
        if (this.currentTab === this.appCategoryTab){
            this.menuData.appList = data;
        }else if (this.currentTab === this.processCategoryTab){
            this.menuData.processList = data;
        }else if (this.currentTab === this.inforCategoryTab){
            this.menuData.inforList = data;
        }else if (this.currentTab === this.queryCategoryTab){
            this.menuData.queryList = data;
        }
        this.layout.menuData = this.menuData;
    },
    setScroll: function(){
        o2.require("o2.widget.ScrollBar", function(){
            this.appScrollBar = new o2.widget.ScrollBar(this.appScrollNode, {
                "style":"xDesktop_Message", "where": "before", "indent": false, "distance": 100, "friction": 6,	"axis": {"x": false, "y": true}
            });
        }.bind(this));
    },
    loadTitle: function(){
        this.lnkTitleNode.set("text", o2.LP.desktop.lnkAppTitle);
        this.appCategoryTab = new Element("div.layout_start_tab", {"text": o2.LP.desktop.message.application}).inject(this.appTitleNode);
        this.processCategoryTab = new Element("div.layout_start_tab", {"text": o2.LP.desktop.message.process}).inject(this.appTitleNode);
        this.inforCategoryTab = new Element("div.layout_start_tab", {"text": o2.LP.desktop.message.infor}).inject(this.appTitleNode);
        this.queryCategoryTab = new Element("div.layout_start_tab", {"text": o2.LP.desktop.message.query}).inject(this.appTitleNode);

        this.refreshAreaNode =  new Element("div.layout_start_search", {"title": o2.LP.desktop.message.refreshMenu}).inject(this.appTitleNode);
        this.refreshNode = new Element("div.layout_start_search_icon").inject(this.refreshAreaNode);
        this.refreshNode.addClass("icon_startMenu_refresh");

        this.searchNode =  new Element("div.layout_start_search").inject(this.appTitleNode);
        this.searchIconNode = new Element("div.layout_start_search_icon").inject(this.searchNode);
        this.searchIconNode.addClass("icon_startMenu_search");

        var currentWidth = this.searchNode.getSize().x;
        this.searchNode.store("currentWidth", currentWidth);

        this.appCategoryTab.addEvent("click", function(){
            this.appTitleNode.getElements(".layout_start_tab").removeClass("mainColor_bg");
            this.appCategoryTab.addClass("mainColor_bg");
            this.currentTab = this.appCategoryTab;
            this.loadApplications();
        }.bind(this));

        this.processCategoryTab.addEvent("click", function(){
            this.appTitleNode.getElements(".layout_start_tab").removeClass("mainColor_bg");
            this.processCategoryTab.addClass("mainColor_bg");
            this.currentTab = this.processCategoryTab;
            this.loadProcesses();
        }.bind(this));

        this.inforCategoryTab.addEvent("click", function(){
            this.appTitleNode.getElements(".layout_start_tab").removeClass("mainColor_bg");
            this.inforCategoryTab.addClass("mainColor_bg");
            this.currentTab = this.inforCategoryTab;
            this.loadInfors();
        }.bind(this));

        this.queryCategoryTab.addEvent("click", function(){
            this.appTitleNode.getElements(".layout_start_tab").removeClass("mainColor_bg");
            this.queryCategoryTab.addClass("mainColor_bg");
            this.currentTab = this.queryCategoryTab;
            this.loadQuerys();
        }.bind(this));

        this.searchIconNode.addEvent("click", this.searchIconAction.bind(this));

        this.refreshNode.addEvent("click", function(e){
            var _self = this;
            MWF.xDesktop.confirm("infor", e, o2.LP.desktop.defaultMenuTitle, o2.LP.desktop.defaultMenuInfor, 420, 100, function(){
                    _self.defaultMenu();
                    this.close();
                }, function(){
                    this.close();
                }, null, null, "o2"
            );
        }.bind(this));
    },
    searchIconAction: function(){
        if (!this.isMorph){
            if (this.isSearch){
                this.doSearch();
            }else{
                this.loadSearch()
            }
        }
    },
    loadSearch: function(){
        this.isSearch = true;
        this.searchNode.addClass("mainColor_border");

        this.appCategoryTab.hide();
        this.processCategoryTab.hide();
        this.inforCategoryTab.hide();
        this.queryCategoryTab.hide();
        this.refreshAreaNode.hide();

        var size = this.appTitleNode.getSize();
        var pr = this.appTitleNode.getStyle("padding-right").toInt() || 0;
        var pl = this.appTitleNode.getStyle("padding-left").toInt() || 0;
        var margin = this.searchNode.getStyle("margin-right").toInt() || 0;

        var w = size.x-margin*2-pr-pl;

        this.isMorph = true;
        this.searchNode.set("morph", {"duration": 200});
        this.searchNode.morph({"width": ""+w+"px"});
        window.setTimeout(function(){
            this.isMorph = false;
        }.bind(this), 220);


        if (!this.searchClearNode){
            this.searchClearNode = new Element("div.layout_start_search_clear").inject(this.searchNode);
            this.searchClearNode.addClass("icon_clear");
            this.searchClearNode.addEvent("click", this.hideSearch.bind(this));
        }
        this.searchClearNode.show();

        if (!this.searchAreaNode)  this.searchAreaNode = new Element("div.layout_start_search_area").inject(this.searchNode);
        this.searchAreaNode.show();

        if (!this.searchInputNode){
            this.searchInputNode = new Element("input.layout_start_search_input", {"placeholder": o2.LP.searchKey}).inject(this.searchAreaNode);
            this.searchInputNode.addEvent("keydown", function(e){
                if (e.code==13) this.doSearch();
            }.bind(this));
        }
        this.searchInputNode.show();
        this.searchInputNode.focus();

        //this.searchNode.addClass("layout_start_search_load");
    },
    hideSearch: function(){
        if (this.isSearch){
            if (this.searchInputNode){
                this.searchInputNode.set("value", "");
                this.searchInputNode.hide();
            }
            if (this.searchAreaNode) this.searchAreaNode.hide();
            if (this.searchClearNode) this.searchClearNode.hide();

            this.isMorph = true;
            var currentWidth = this.searchNode.retrieve("currentWidth");
            this.searchNode.morph({"width": ""+currentWidth+"px"});
            window.setTimeout(function(){
                if (this.currentTab && this.isSearchResult) this.currentTab.click();
                this.searchNode.removeClass("mainColor_border");
                this.appCategoryTab.show();
                this.processCategoryTab.show();
                this.inforCategoryTab.show();
                this.queryCategoryTab.show();
                this.refreshAreaNode.show();
                this.isSearch = false;
                this.isMorph = false;
                this.isSearchResult = false;
            }.bind(this), 220);
        }
    },

    doSearch: function(){
        var key = this.searchInputNode.get("value").toLowerCase();
        if (key){
            this.isSearchResult = true;
            this.appContentNode.empty();

            this.searchApplicatins(key);
            this.searchProcesses(key);
            this.searchInfors(key);
            this.searchQuerys(key);
        }
    },
    searchApplicatins: function(value){
        // var user = this.layout.session.user;
        //         // var currentNames = [user.name, user.distinguishedName, user.id, user.unique];
        //         // if (user.roleList) currentNames = currentNames.concat(user.roleList);
        //         // if (user.groupList) currentNames = currentNames.concat(user.groupList);
        var user = this.layout.session.user;
        var currentNames = [user.name, user.distinguishedName, user.id, user.unique];
        if (user.roleList) currentNames = currentNames.concat(user.roleList);
        if (user.groupList) currentNames = currentNames.concat(user.groupList);

        //this.getCurrentName( function (currentNames) {
        if (this.layoutJson && this.layoutJson.length) this.layoutJson.each(function(v){
            if ( this.checkMenuItem(v, currentNames) ){
                if ((v.title.toPYFirst().toLowerCase().indexOf(value)!==-1) || (v.title.toPY().toLowerCase().indexOf(value)!==-1) || (v.title.indexOf(value)!==-1)){
                    this.createApplicationMenuItem(v);
                }
            }
        }.bind(this));

        if (this.componentJson && this.componentJson.length) this.componentJson.each(function(v){
            if ( this.checkMenuItem(v, currentNames) ){
                if ((v.title.toPYFirst().toLowerCase().indexOf(value)!==-1) || (v.title.toPY().toLowerCase().indexOf(value)!==-1) || (v.title.indexOf(value)!==-1)){
                    this.createApplicationMenuItem(v);
                }
            }
        }.bind(this));

        if (this.portalJson && this.portalJson.length) this.portalJson.each(function(v){
            if ((v.name.toPYFirst().toLowerCase().indexOf(value)!==-1) || (v.name.toPY().toLowerCase().indexOf(value)!==-1) || (v.name.indexOf(value)!==-1)){
                this.createPortalMenuItem(v);
            }
        }.bind(this));
        //})
    },
    searchProcesses: function(value){
        if (this.processJson && this.processJson.length) this.processJson.each(function(v){
            if ((v.name.toPYFirst().toLowerCase().indexOf(value)!==-1) || (v.name.toPY().toLowerCase().indexOf(value)!==-1) || (v.name.indexOf(value)!==-1)){
                this.createProcessMenuItem(v);
            }
        }.bind(this));
    },
    searchInfors: function(value){
        if (this.inforJson && this.inforJson.length) this.inforJson.each(function(v){
            if ((v.appName.toPYFirst().toLowerCase().indexOf(value)!==-1) || (v.appName.toPY().toLowerCase().indexOf(value)!==-1) || (v.appName.indexOf(value)!==-1)){
                this.createInforMenuItem(v);
            }
        }.bind(this));
    },
    searchQuerys: function(value){
        if (this.queryJson && this.queryJson.length) this.queryJson.each(function(v){
            if ((v.name.toPYFirst().toLowerCase().indexOf(value)!==-1) || (v.name.toPY().toLowerCase().indexOf(value)!==-1) || (v.name.indexOf(value)!==-1)){
                this.createQueryMenuItem(v);
            }
        }.bind(this));
    },

    loadGroup: function(callback){
        if( this.layout.session.user.groupList ){
            if(callback) callback()
        }else{
            o2.Actions.load("x_organization_assemble_express").GroupAction.listWithPerson({
                personList: [this.layout.session.user.unique],
                recursiveGroupFlag: true,
                referenceFlag: true,
                recursiveOrgFlag: true
            }, function (json) {
                this.layout.session.user.groupList = json.data.groupList || [];
                if(callback) callback()
            }.bind(this))
        }
    },
    loadJsons: function(callback){
        this.clearAppContentNode();

        this.loadLayoutApplications(function(json_layout){

            var componentAction = o2.Actions.get("x_component_assemble_control");
            var portalAction = o2.Actions.get("x_portal_assemble_surface");
            var processAction = o2.Actions.get("x_processplatform_assemble_surface");
            var inforAction = o2.Actions.get("x_cms_assemble_control");
            var queryAction = o2.Actions.get("x_query_assemble_surface");


            var iconsPath = this.layout.path+"icons.json";
            this.getIconsJson(function(){
                o2.Actions.invokeAsync([
                        {"action": componentAction, "name": "listComponent"},
                        {"action": portalAction, "name": "listApplication"},
                        {"action": processAction, "name": "listApplication"},
                        {"action": inforAction, "name": "listColumn"},
                        {"action": queryAction, "name": "listQuery"},
                    ], {"success": function(json_component, json_portal, json_process, json_infor, json_query){
                            this.layoutJson = json_layout;
                            this.componentJson = json_component.data;
                            this.portalJson = json_portal.data;
                            this.processJson = json_process.data;
                            this.inforJson = json_infor.data;
                            this.queryJson = json_query.data;

                            if (callback) callback();

                        }.bind(this), "failure": function(){}}
                );

            }.bind(this));
        }.bind(this));

    },
    getIconsJson: function(callback){
        if (this.layout.iconsJson){
            if (callback) callback();
        }else{
            o2.JSON.get(iconsPath, function(json){
                this.layout.iconsJson = json;
                if (callback) callback();
            }.bind(this));
        }
    },

    setPosition: function(){
        //var size = this.container.getSize();
        var index = o2.xDesktop.zIndexPool.zIndex;
        var nodeSize = this.node.getSize();
        var left = 0-nodeSize.x;
        this.maskNode.setStyles({"left": ""+left+"px"});
        this.node.setStyles({"left": ""+left+"px"});
    },
    setSize: function(){

        if (this.appScrollBar && this.appScrollBar.scrollVNode) this.appScrollBar.scrollVNode.setStyle("margin-top", "0px");
        var isLnk = false;
        if (false && this.layout.lnks && this.layout.lnks.length){
            this.lnkAreaNode.show();
            this.lineNode.show();
            var h = 100*3;
            this.lnkScrollNode.setStyle("height", ""+h+"px");
            isLnk = true;
        }else{
            this.lnkAreaNode.hide();
            this.lineNode.hide();
        }

        var size = this.node.getSize();
        var lnkSizeY = (isLnk) ? this.lnkAreaNode.getSize().y : 0;
        var lineSizeY = (isLnk) ? this.lineNode.getSize().y : 0;
        var mt = (isLnk) ? (this.lineNode.getStyle("margin-top").toInt() || 0) : 0;
        var mb = (isLnk) ? (this.lineNode.getStyle("margin-bottom").toInt() || 0) : 0;
        var titleSize = this.appTitleNode.getSize();

        var y = size.y-lnkSizeY-lineSizeY-mt-mb-titleSize.y;
        this.appScrollNode.setStyle("height", ""+y+"px");
    },

    loadLnks: function(){
        // if (this.layout.lnks && this.layout.lnks.length){
        //     this.lnkAreaNode.show();
        //     this.lineNode.show();
        //     this.lnkContentNode.empty();
        //     this.createLnkMenuItem();
        // }else{
        this.lnkAreaNode.hide();
        this.lineNode.hide();
        //}
    },
    createLnkMenuItem: function(){
        //this.templetedHtml
    },
    clearAppContentNode: function(){
        this.appContentNode.empty();
        this.appContentNode.addClass("icon_loading");
    },

    loadApplications: function(callback){
        this.clearAppContentNode();

        // this.loadLayoutApplications(function(json_layout){
        //     var componentAction = o2.Actions.get("x_component_assemble_control");
        //     var portalAction = o2.Actions.get("x_portal_assemble_surface");
        //     o2.Actions.invokeAsync([
        //             {"action": componentAction, "name": "listComponent"},
        //             {"action": portalAction, "name": "listApplication"},
        //         ], {"success": function(json_component, json_portal){
        //                 this.loadApplicationsItem(json_layout, json_component.data, json_portal.data);
        //             }.bind(this), "failure": function(){}}
        //     );
        // }.bind(this));
        this.loadApplicationsItem(this.layoutJson, this.componentJson, this.portalJson);
    },
    loadLayoutApplications: function(callback){
        var url = this.layout.path+"applications.json";
        o2.getJSON(url, function(json){
            if (callback) callback(json);
        }.bind(this));
    },

    loadApplicationsItem: function(layoutJson, componentJson, portalJson){
        var user = this.layout.session.user;
        var currentNames = [user.name, user.distinguishedName, user.id, user.unique];
        if (user.roleList) currentNames = currentNames.concat(user.roleList);
        if (user.groupList) currentNames = currentNames.concat(user.groupList);

        var json_layout = Array.clone(layoutJson);
        var json_component = Array.clone(componentJson);
        var json_portal = Array.clone(portalJson);

        this.appContentNode.removeClass("icon_loading");

        var loadedApps = {};
        if (this.menuData && this.menuData.appList && this.menuData.appList.length){
            this.menuData.appList.each(function(app){
                if (app.type==="group"){
                    this.createGroupMenuItem(app);
                    app.itemDataList.each(function(a){
                        var d = json_layout.find(function(i){ return (i.id === a.id); });
                        if (d) json_layout.erase(d);

                        d = json_component.find(function(i){ return (i.id === a.id); });
                        if (d) json_component.erase(d);

                        d = json_portal.find(function(i){ return (i.id === a.id); });
                        if (d) json_portal.erase(d);

                    }.bind(this));
                }else {
                    var appData = null;
                    if (!appData && json_layout && json_layout.length) {
                        appData = json_layout.find(function (i) {
                            return (i.id === app.id);
                        });
                        if (appData) {
                            json_layout.erase(appData);
                            if (this.checkMenuItem(appData, currentNames)) this.createApplicationMenuItem(appData);
                        }
                    }
                    if (!appData && json_component && json_component.length) {
                        appData = json_component.find(function (i) {
                            return (i.id === app.id);
                        });
                        if (appData) {
                            json_component.erase(appData);
                            if (this.checkMenuItem(appData, currentNames)) this.createApplicationMenuItem(appData);
                        }
                    }
                    if (!appData && json_portal && json_portal.length) {
                        appData = json_portal.find(function (i) {
                            return (i.id === app.id);
                        });
                        if (appData) {
                            json_portal.erase(appData);
                            appData.type = "portal";
                            this.createPortalMenuItem(appData);
                        }
                    }
                }
            }.bind(this));
        }

        if (json_layout && json_layout.length) json_layout.each(function(value){
            if ( this.checkMenuItem(value, currentNames) ) this.createApplicationMenuItem(value);
        }.bind(this));

        if (json_component && json_component.length) json_component.each(function(value){
            if ( this.checkMenuItem(value, currentNames) ) this.createApplicationMenuItem(value);
        }.bind(this));

        // if (json_portal && json_portal.length) json_portal.each(function(value){
        //     this.createPortalMenuItem(value);
        // }.bind(this));

        if (json_portal && json_portal.length) json_portal.each(function(value){
            value.type = "portal";
            this.createPortalMenuItem(value);
        }.bind(this));
    },

    loadProcesses: function(){
        this.clearAppContentNode();
        // o2.Actions.get("x_processplatform_assemble_surface").listApplication(this.loadProcessesItem.bind(this));
        this.loadProcessesItem(this.processJson)
    },
    loadProcessesItem: function(list){
        this.appContentNode.removeClass("icon_loading");
        var json = Array.clone(list);

        if (this.menuData && this.menuData.processList && this.menuData.processList.length){
            this.menuData.processList.each(function(app){
                if (app.type==="group"){
                    this.createGroupMenuItem(app);
                    app.itemDataList.each(function(a){
                        var d = json.find(function(i){ return (i.id === a.id); });
                        if (d) json.erase(d);
                    }.bind(this));
                }else{
                    var appData = null;
                    if (!appData && json && json.length){
                        appData = json.find(function(i){ return (i.id === app.id); });
                        if (appData){
                            json.erase(appData);
                            appData.type = "process";
                            this.createProcessMenuItem(appData);
                        }
                    }
                }
            }.bind(this));
        }

        if (json && json.length) json.each(function(value){
            value.type = "process";
            this.createProcessMenuItem(value);
        }.bind(this));
    },

    loadInfors: function(){
        this.clearAppContentNode();
        //o2.Actions.get("x_cms_assemble_control").listColumn(this.loadInforsItem.bind(this));
        this.loadInforsItem(this.inforJson)
    },
    loadInforsItem: function(list){
        this.appContentNode.removeClass("icon_loading");
        var json = Array.clone(list);

        if (this.menuData && this.menuData.inforList && this.menuData.inforList.length){
            this.menuData.inforList.each(function(app){
                if (app.type==="group"){
                    this.createGroupMenuItem(app);
                    app.itemDataList.each(function(a){
                        var d = json.find(function(i){ return (i.id === a.id); });
                        if (d) json.erase(d);
                    }.bind(this));
                }else{
                    var appData = null;
                    if (!appData && json && json.length){
                        appData = json.find(function(i){ return (i.id === app.id); });
                        if (appData){
                            json.erase(appData);
                            appData.type = "cms";
                            this.createInforMenuItem(appData);
                        }
                    }
                }
            }.bind(this));
        }

        if (json && json.length) json.each(function(value){
            value.type = "cms";
            this.createInforMenuItem(value);
        }.bind(this));
    },

    loadQuerys: function(){
        this.clearAppContentNode();
        // o2.Actions.get("x_query_assemble_surface").listQuery(this.loadQuerysItem.bind(this));
        this.loadQuerysItem(this.queryJson)
    },
    loadQuerysItem: function(list){
        this.appContentNode.removeClass("icon_loading");
        var json = Array.clone(list);

        if (this.menuData && this.menuData.queryList && this.menuData.queryList.length){
            this.menuData.queryList.each(function(app){
                if (app.type==="group"){
                    this.createGroupMenuItem(app);
                    app.itemDataList.each(function(a){
                        var d = json.find(function(i){ return (i.id === a.id); });
                        if (d) json.erase(d);
                    }.bind(this));
                }else{
                    var appData = null;
                    if (!appData && json && json.length){
                        appData = json.find(function(i){ return (i.id === app.id); });
                        if (appData){
                            json.erase(appData);
                            appData.type = "query";
                            this.createQueryMenuItem(appData);
                        }
                    }
                }
            }.bind(this));
        }

        if (json && json.length) json.each(function(value){
            value.type = "query";
            this.createQueryMenuItem(value);
        }.bind(this));
    },

    checkMenuItem: function(value, currentNames){
        if( value.path === "AuditLog" && ["securityManager","auditManager"].isIntersect(currentNames) )return true;
        if (value.visible===false) return false;
        var isAllow = true;
        if (value.allowList) isAllow = (value.allowList.length) ? (value.allowList.isIntersect(currentNames)) : true;
        var isDeny = false;
        if (value.denyList) isDeny = (value.denyList.length) ? (value.denyList.isIntersect(currentNames)) : false;
        return ((!isDeny && isAllow) || o2.AC.isAdministrator());
    },
    createApplicationMenuItem: function(value){
        this.items.push(new o2.xDesktop.Default.StartMenu.Item(this, this.appContentNode, value));
    },
    createPortalMenuItem: function(value){
        this.items.push(new o2.xDesktop.Default.StartMenu.PortalItem(this, this.appContentNode, value));
    },
    createProcessMenuItem: function(value){
        this.items.push(new o2.xDesktop.Default.StartMenu.ProcessItem(this, this.appContentNode, value));
    },
    createInforMenuItem: function(value){
        this.items.push(new o2.xDesktop.Default.StartMenu.InforItem(this, this.appContentNode, value));
    },
    createQueryMenuItem: function(value){
        this.items.push(new o2.xDesktop.Default.StartMenu.QueryItem(this, this.appContentNode, value));
    },
    createGroupMenuItem: function(value){
        this.items.push(new o2.xDesktop.Default.StartMenu.GroupItem(this, this.appContentNode, value));
    },

    show: function(){
        if (!this.isMorph){
            this.isMorph = true;
            if (!this.morph){
                this.maskMorph = new Fx.Morph(this.maskNode, {
                    duration: "200",
                    transition: Fx.Transitions.Sine.easeOut
                });
                this.morph = new Fx.Morph(this.node, {
                    duration: "200",
                    transition: Fx.Transitions.Sine.easeOut
                });
            }

            this.maskNode.setStyles({"display": "block"});
            this.node.setStyles({"display": "block"});
            this.triangleNode.setStyles({"display": "block"});
            this.appAreaNode.setStyles({ "filter": "" });

            this.setSize();
            this.setPosition();

            var size = this.layout.menuNode.getSize();
            var left = size.x;

            var jsonLoaded = false, groupLoaded = false;
            var checkLoad = function () {
                if(jsonLoaded && groupLoaded){
                    (this.currentTab || this.appCategoryTab).click();
                }
            }.bind(this);

            this.loadJsons(function(){
                jsonLoaded = true;
                checkLoad();
            }.bind(this));

            this.loadGroup(function(){
                groupLoaded = true;
                checkLoad();
            }.bind(this));

            //this.loadContent();

            this.maskMorph.start({"left": ""+left+"px"});
            this.morph.start({"left": ""+left+"px"}).chain(function(){
                this.isShow = true;
                this.isMorph = false;
                this.layout.desktopNode.addEvent("mousedown", this.hideMessage);
                this.setScroll();
                this.fireEvent("show");
            }.bind(this));
        }
    },
    hide: function(callback){
        if (!this.isMorph){
            this.isMorph = true;
            if (!this.morph){
                this.maskMorph = new Fx.Morph(this.maskNode, {
                    duration: "200",
                    transition: Fx.Transitions.Sine.easeOut
                });
                this.morph = new Fx.Morph(this.node, {
                    duration: "200",
                    transition: Fx.Transitions.Sine.easeOut
                });
            }

            var nodeSize = this.node.getSize();
            var left = 0-nodeSize.x;

            // var position = this.node.getPosition();
            // var size = this.node.getSize();
            // var left = position.x+size.x;
            this.isSearchResult = false;
            this.hideSearch();

            this.lnkContentNode.empty();
            this.appContentNode.empty();
            this.groupMenuArea.empty();
            if (this.appScrollBar) this.appScrollBar.destroy();

            this.maskMorph.start({"left": ""+left+"px"}).chain(function(){
                this.maskNode.setStyle("display", "none");
                this.triangleNode.setStyles({"display": "none"});
            }.bind(this));
            this.morph.start({"left": ""+left+"px"}).chain(function(){
                this.node.setStyle("display", "none");
                this.isShow = false;
                this.isMorph = false;
                this.layout.desktopNode.removeEvent("mousedown", this.hideMessage);
                this.fireEvent("hide");
                if (callback) callback();
            }.bind(this));
        }
    },
    defaultMenu: function(){
        this.layout.menuData = null;
        if (this.layout.status) this.layout.status.menuData = null;
        this.menuData = null;
        this.hide();
    }
});

o2.xDesktop.Default.StartMenu.Item = new Class({
    initialize: function (menu, container, data, positionNode) {
        this.menu = menu;
        this.layout = this.menu.layout;
        this.data = data;
        this.container = $(container);
        this.load(positionNode);
        this.init();
    },
    load: function(positionNode){
        this.node = new Element("div.layout_start_item");
        if (positionNode){
            this.node.inject(positionNode, "before");
        }else{
            this.node.inject(this.container);
        }

        this.node.set("html", this.menu.itemTempletedHtml);
        this.iconAreaNode = this.node.getElement(".layout_start_item_iconArea");
        this.iconNode = this.node.getElement(".layout_start_item_icon");
        this.badgeNode = this.node.getElement(".layout_start_item_badge");
        this.textNode = this.node.getElement(".layout_start_item_text");
        this.loadIcon();
        this.loadBadge();
        this.loadText();
        this.setEvent();
        this.node.store("item", this);
        if (this.menu.data && this.menu.data.type==="group"){
            this.node.addClass("layout_start_item_sub");
        }
    },
    init: function(){},
    dragOver: function(){
        if (!this.overNode){
            this.overNode = new Element("div.layout_start_item_over").inject(this.container);
            this.overNode.addClass("mainColor_bg");
        }
        this.overNode.position({
            "relativeTo": this.iconAreaNode,
            "position": "leftTop",
            "edge": "leftTop",
            "offset": {
                "x": -6, "y":-6
            }
        });
        this.overNode.show();
    },
    dragOut: function(){
        if (this.overNode) this.overNode.hide();
    },
    loadIcon: function(){
        var icon;
        var bgcolor = "";
        if (this.data.path.substring(0, 4)==="@url"){
            if (this.data.iconPath){
                icon = this.data.iconPath;
            }else{
                if (this.layout.iconsJson["Url"] && this.layout.iconsJson["Url"].icon){
                    icon = this.layout.path+"appicons/"+this.layout.iconsJson["Url"].icon;
                    bgcolor = this.layout.iconsJson["Url"].color;
                }else{
                    icon = "../x_component_Setting/$Main/default/icon/site.png";
                    bgcolor = "";
                }
            }
        }else{
            if (this.layout.iconsJson[this.data.path] && this.layout.iconsJson[this.data.path].icon){
                icon = this.layout.path+"appicons/"+this.layout.iconsJson[this.data.path].icon;
                bgcolor = this.layout.iconsJson[this.data.path].color;
            }else{
                icon = "../x_component_"+this.data.path.replace(/\./g, "_")+"/$Main/"+this.data.iconPath;
                bgcolor = "";
            }
        }
        if (icon && bgcolor){
            this.iconNode.addClass("layout_start_item_icon_flat");
            this.iconNode.setStyle("background-color", bgcolor);
        }
        this.iconNode.setStyle("background-image", "url("+icon+")");
        this.icon = icon;
        this.bgcolor = bgcolor;
    },
    loadBadge: function(){
        this.badgeNode.set("title", o2.LP.desktop.addLnk).addClass("icon_add_red");
    },
    loadText: function(){
        if (this.data.path && this.data.path.indexOf("@url") !== 0 ){
            var appNames = this.data.path.split(".");
            var o = o2.xApplication;
            appNames.each(function(name){
                if (!o[name]) o[name] = {};
                o = o[name];
            });

            o2.xDesktop.requireApp(this.data.path, "lp." + o2.language, {
                "onSuccess": function(){
                    if (o.LP && o.LP.title) {
                        this.textNode.set("text", o.LP.title);
                    }else{
                        this.textNode.set("text", this.data.title || this.data.name);
                    }
                }.bind(this),
                "onFailure": function () {
                    this.textNode.set("text", this.data.title || this.data.name);
                }.bind(this)
            }, false);
        }else{
            this.textNode.set("text", this.data.title || this.data.name);
        }
    },
    setEvent: function(){
        this.node.addEvents({
            "mouseover": function(){ this.badgeNode.fade("in"); }.bind(this),
            "mouseout": function(){ this.badgeNode.fade("out"); }.bind(this),
            "click": function(e){
                //this.menu.hide(function(){
                this.open(e);
                //}.bind(this));
            }.bind(this)
        });

        this.badgeNode.addEvent("click", function(e){
            this.addLnk();
            e.stopPropagation();
        }.bind(this));

        this.makeLnk();
    },
    addLnk: function(dragTargetLnk, dragPosition){
        lnkdata = {
            "name": this.data.path,
            "title": this.data.title,
            "iconData": this.data.iconData || null,
            "icon": this.iconData || null,
            "appType": null,
            "options": null
        }
        this.layout.addLnk(lnkdata, dragTargetLnk, dragPosition);
    },
    open: function(e){
        this.menu.hide(function(){
            if (this.menu.menu){
                this.menu.menu.hide(function(){
                    layout.openApplication(e, this.data.path);
                }.bind(this));
            }else{
                layout.openApplication(e, this.data.path);
            }
        }.bind(this));
    },
    makeLnk: function(){
        var drag = new Drag(this.node, {
            "stopPropagation": true,
            "compensateScroll": true,
            "onStart": function(el, e){
                this.doDragMove(e);
                drag.stop();
            }.bind(this)
        });
    },
    getDragNode: function(){
        if (!this.dragNode){
            this.dragNode = new Element("div.layout_menu_lnk_item_drag")
                .setStyle("z-index", o2.xDesktop.zIndexPool.applyZindex())
                .inject(this.layout.node);

            var dragIconNode = this.iconNode.clone(true).inject(this.dragNode)
                .removeClass("layout_menu_lnk_item_icon")
                .addClass("layout_menu_lnk_item_icon_drag");
            if (this.bgcolor) dragIconNode.setStyle("background-color", this.bgcolor);
        }
        var p = this.iconNode.getPosition(this.dragNode.getOffsetParent());
        this.dragNode.show().setStyles({
            "left": ""+p.x+"px", "top": ""+p.y+"px"
        });
    },
    getMoveDroppables: function(){
        return [this.layout.lnkContentNode, this.menu.appContentNode];
    },
    doDragMove: function(e){
        this.getDragNode();

        var droppables = this.getMoveDroppables();
        if (this.menu.appContentNode.hasClass("layout_start_groupItem_menu_content")){
            this.onGroup = true;
        }
        //if (this.menu.maskGroupNode) droppables.push(this.menu.maskGroupNode);

        var drag = new Drag.Move(this.dragNode, {
            "stopPropagation": true,
            "compensateScroll": true,
            "droppables": droppables,
            "onStart": function(el){ this._drag_start(el); }.bind(this),
            "onDrag": function(dragging,e){ this._drag_drag(dragging, e); }.bind(this),
            "onEnter": function(dragging, inObj){ this._drag_enter(dragging, inObj); }.bind(this),
            "onLeave": function(dragging, obj){ this._drag_leave(dragging, obj); }.bind(this),
            "onDrop": function(dragging, inObj){ this._drag_drop(dragging, inObj); }.bind(this),
            "onCancel": function(dragging){ this._drag_cancel(dragging); }.bind(this),
            "onComplete": function(dragging, e){ this._drag_complete(dragging, e); }.bind(this),
        });
        drag.start(e);
        this.dragStatus == "remove";
    },
    _drag_start: function(el){
        this.isDrag = true;
        this.dragTargetLnk = null;
        this.dragPosition = "before";

        this.node.setStyle("opacity", 0.2);
        this.positionFlagNode = new Element("div", {"styles": {"display": "none"}}).inject(this.node, "after");
    },
    _drag_drag: function(dragging, e){
        if (this.dragStatus == "order"){
            if (this.layout.lnks && this.layout.lnks.length){
                var current = e.page.y;

                for (var i=0; i<this.layout.lnks.length; i++){
                    var lnk = this.layout.lnks[i];
                    var y = lnk.node.getSize().y;
                    var top = lnk.node.getPosition(this.layout.node).y;
                    var center = top+y/2;
                    var bottom = top+y;
                    if (top<=current && center>=current){
                        this.dragTargetLnk = lnk;
                        this.dragPosition = "before";
                        break;
                    }else if (center<=current && bottom>=current){
                        this.dragTargetLnk = lnk;
                        this.dragPosition = "after";
                        break;
                    }
                }
                if (!this.layout.positionNode) this.layout.positionNode = new Element("div.layout_menu_lnk_item_position")
                    .setStyle("z-index", o2.xDesktop.zIndexPool.applyZindex())
                    .inject(this.layout.node);
                this.layout.positionNode.show();

                if (!this.dragTargetLnk){
                    this.dragTargetLnk = this.layout.lnks[this.layout.lnks.length-1];
                    this.dragPosition = "after";
                }
                this.layout.positionNode.position({
                    relativeTo: this.dragTargetLnk.node,
                    position: (this.dragPosition=="before") ? 'topcenter' : 'bottomcenter',
                    edge: 'center'
                });
            }
        }
        if (this.dragStatus == "group"){
            if (!this.onGroup) this.checkDargOver(dragging);
            if (!this.overItem){
                this.checkDargPosition(dragging);
            }
        }
    },
    checkDargOver: function(dragging){
        var p = dragging.getPosition();
        var s = dragging.getSize();
        var x = p.x+s.x/2-1;
        var y = p.y+s.y/2-1;
        var ex = x+2;
        var ey = y+2;

        var overItem = null;
        this.menu.items.each(function(item){
            if (!item.isDrag){
                if (item.iconAreaNode.isInPointInRect(x,y,ex,ey)){
                    item.dragOver();
                    overItem = item;
                }else{
                    item.dragOut();
                }
            }
        });
        this.overItem = overItem;
    },
    checkDargPosition: function(dragging){
        var p = dragging.getPosition();
        var s = dragging.getSize();
        var rightP = { "x": p.x+s.x-2, "y": p.y+s.y/2-1, "ex": p.x+s.x, "ey": p.y+s.y/2+1 };
        var leftP = { "x": p.x, "y": p.y+s.y/2-1, "ex": p.x+2, "ey": p.y+s.y/2+1 };

        var moveFlag = false;
        for (var i = 0; i<this.menu.items.length; i++){
            var item = this.menu.items[i];
            if (!item.isDrag){
                if (item.iconAreaNode.isInPointInRect(rightP.x, rightP.y, rightP.ex, rightP.ey)){
                    moveFlag = true;
                    this.node.inject(item.node, "before");
                    break;
                }else if (item.iconAreaNode.isInPointInRect(leftP.x, leftP.y, leftP.ex, leftP.ey)){
                    moveFlag = true;
                    this.node.inject(item.node, "after");
                    break;
                }
            }
        }
        //if (!moveFlag) this.node.inject(this.menu.appContentNode);
    },

    _drag_enter: function(el, inObj){
        if (inObj.hasClass("layout_start_content_appContent") || inObj.hasClass("layout_start_groupItem_menu_content")){
            this.dragStatus = "group";
            this.node.setStyle("opacity", 0.2);
        }else{
            if (this.positionFlagNode) this.node.inject(this.positionFlagNode, "before");
            this.dragStatus = "order";
            this.node.setStyle("opacity", 1);
        }
    },
    _drag_leave: function(el, inObj){
        console.log("_drag_leave");
        if (inObj.hasClass("layout_start_content_appContent")){
            //this.node.inject(this.menu.appContentNode);
        }else if (inObj.hasClass("layout_start_groupItem_menu_content")){
            this.dragStatus = "ungroup";
            this.node.setStyle("opacity", 0);
        }else{
            this.dragStatus = "remove";
            if (this.layout.positionNode) this.layout.positionNode.hide();
        }
    },

    _drag_drop: function(dragging, inObj){
        if (this.dragStatus==="ungroup"){
            this.removeFormGroup();
        }else{
            if (this.dragStatus == "order" && this.dragTargetLnk && this.dragTargetLnk!=this){
                this.addLnk(this.dragTargetLnk, this.dragPosition);
            }else if (this.dragStatus == "group" && this.overItem && this.overItem!=this){
                this.overItem.dragOut();
                this.addGroup();
            }
            this.node.setStyle("opacity", 1);
        }
        this.menu.resetMenuData();
    },

    _drag_cancel: function(dragging){
        console.log("_drag_cancel");
        dragging.hide();
        if (this.layout.positionNode) this.layout.positionNode.hide();
        if (this.dragRemoveNode) this.dragRemoveNode.hide();
        this.node.setStyle("opacity", 1);
        this.isDrag = false;
        this.menu.resetMenuData();
    },

    _drag_complete: function(dragging) {
        this._drag_cancel(dragging);
        if (this.positionFlagNode) this.positionFlagNode.destroy();
        this.positionFlagNode = null;
    },
    removeFormGroup: function(){
        // this.menu.itemDataList.erase(this.data);
        // this.menu.items.erase(this);
        this.menu.data.itemDataList.erase(this.data);
        switch (this.data.type){
            case "portal":
                this.layout.startMenu.createPortalMenuItem(this.data);
                break;
            case "process":
                this.layout.startMenu.createProcessMenuItem(this.data);
                break;
            case "cms":
                this.layout.startMenu.createInforMenuItem(this.data);
                break;
            case "query":
                this.layout.startMenu.createQueryMenuItem(this.data);
                break;
            default:
                this.layout.startMenu.createApplicationMenuItem(this.data);

        }
        debugger;
        this.destroy();
        if (!this.menu.data.itemDataList.length){
            this.menu.hide(function(){
                this.menu.destroy();
            }.bind(this));
        }else{
            this.menu.resetSubItemIcon();
        }

    },
    addGroup: function(){
        debugger;
        if (this.overItem.data.type==="group"){
            this.overItem.addItem(this.data);
        }else{
            var v = {
                name: "Group",
                title: "Group",
                type: "group",
                visible: true
            }
            var group = new o2.xDesktop.Default.StartMenu.GroupItem(this.menu, this.container, v, this.overItem.node);
            group.addItem(this.overItem.data);
            group.addItem(this.data);
            this.menu.items.push(group);
            this.overItem.node.destroy();
            group.open(null, function(){
                group.editTitle();
            });
        }
        this.node.destroy();
        this.menu.resetMenuData();
    },
    destroy: function(){
        this.menu.items.erase(this);
        this.node.destroy();
    }
});

o2.xDesktop.Default.StartMenu.GroupItem = new Class({
    Extends: o2.xDesktop.Default.StartMenu.Item,
    loadIcon: function(){
        this.iconNode.addClass("layout_start_item_icon_group");
        this.iconNode.addClass("grayColor_bg");

        this.sunIconNodes = [];
        var node = new Element("div.layout_start_item_icon_group_sub").inject(this.iconNode);
        this.sunIconNodes.push(node);

        node = new Element("div.layout_start_item_icon_group_sub").inject(this.iconNode);
        this.sunIconNodes.push(node);

        node = new Element("div.layout_start_item_icon_group_sub").inject(this.iconNode);
        this.sunIconNodes.push(node);

        node = new Element("div.layout_start_item_icon_group_sub").inject(this.iconNode);
        this.sunIconNodes.push(node);
    },
    init: function(){
        this.itemTempletedHtml = this.menu.itemTempletedHtml;

        if (this.data.itemDataList && this.data.itemDataList.length){
            for (var i=0; i<Math.min(this.data.itemDataList.length, 4); i++){
                var icon = this.setSubItemIcon(this.data.itemDataList[i], this.sunIconNodes[i]);
            }
        }
    },
    resetSubItemIcon: function(){
        this.sunIconNodes.each(function(e){
            e.setStyle("background-image", "");
            e.setStyle("background-color", "");
        });
        if (this.data.itemDataList && this.data.itemDataList.length){
            for (var i=0; i<Math.min(this.data.itemDataList.length, 4); i++){
                var icon = this.setSubItemIcon(this.data.itemDataList[i], this.sunIconNodes[i]);
            }
        }
    },
    open: function(e, callback){
        if (!this.menuNode) this.createMenuNode();
        this.maskNode = new Element("div.layout_start_groupItem_menuMask").inject(this.menuNode, "before");
        this.maskNode.addEvent("click", function(e){
            this.hide();
        }.bind(this));
        this.maskGroupNode = this.maskNode;

        this.menuNode.show();

        var styles = this.getMenuNodeOpenDimensions();
        this.menuNode.morph.set("transition", Fx.Transitions.Quart.easeOut);
        this.menuNode.morph.start(styles).chain(function(){
            this.menuTitleNode.show();
            this.menuScrollNode.show();

            var s = this.menuNode.getSize();
            var ts = this.menuTitleNode.getSize();
            var h = s.y - ts.y;
            this.menuContentNode.setStyle("height", ""+h+"px");
            this.loadItems();
            if (callback) callback();
        }.bind(this));

        this.menu.appAreaNode.setStyles({ "filter": "blur(5px)" });
    },
    hide: function(callback){
        this.menuTitleNode.hide();
        this.menuScrollNode.hide();
        var styles = this.getMenuNodeCloseDimensions();
        this.menuNode.morph.set("transition", Fx.Transitions.Quart.easeIn);
        this.menuNode.morph.start(styles).chain(function(){
            if (this.maskNode) this.maskNode.destroy();
            if (this.menuNode) this.menuNode.hide();
            if (callback) callback();
        }.bind(this));
        this.menu.appAreaNode.setStyles({ "filter": "" });
    },
    loadItems: function(){
        if (!this.items) this.items = [];
        this.data.itemDataList.each(function(data){
            var item = this.items.find(function(i){
                return i.data.id == data.id;
            });
            if (!item){
                switch (data.type){
                    case "portal":
                        this.items.push(new o2.xDesktop.Default.StartMenu.PortalItem(this, this.menuContentNode, data));
                        break;
                    case "process":
                        this.items.push(new o2.xDesktop.Default.StartMenu.ProcessItem(this, this.menuContentNode, data));
                        break;
                    case "cms":
                        this.items.push(new o2.xDesktop.Default.StartMenu.InforItem(this, this.menuContentNode, data));
                        break;
                    case "query":
                        this.items.push(new o2.xDesktop.Default.StartMenu.QueryItem(this, this.menuContentNode, data));
                        break;
                    default:
                        this.items.push(new o2.xDesktop.Default.StartMenu.Item(this, this.menuContentNode, data));
                }
            }
        }.bind(this));
    },
    getMenuNodeOpenDimensions: function(){
        var size = this.menu.appAreaNode.getSize();
        var w = size.x*0.94;
        var h = size.y*0.7;
        var x = (size.x*(1-0.94))/2;
        var y = (size.y*(1-0.7))/2;
        return {"width":w, "height": h, "left": x, "top": y}
    },
    getMenuNodeCloseDimensions: function(){
        var size = this.iconNode.getSize();
        var position = this.iconNode.getPosition(this.menu.node);
        return {"width":size.x, "height": size.y, "left": position.x, "top": position.y}
    },
    createMenuNode: function(){
        this.menuNode = new Element("div.layout_start_groupItem_menu").inject(this.menu.groupMenuArea);
        this.menuNode.addClass("grayColor_bg");
        this.menuTitleNode = new Element("div.layout_start_groupItem_menu_title").inject(this.menuNode);
        this.menuTitleNode.set("text", this.data.name);

        this.menuScrollNode = new Element("div.layout_start_groupItem_menu_scroll").inject(this.menuNode);
        this.menuContentNode = new Element("div.layout_start_groupItem_menu_content").inject(this.menuScrollNode);
        this.appContentNode = this.menuContentNode;

        this.menuNode.position({
            "relativeTo": this.iconNode,
            "position": "upperLeft",
            "edge": "upperLeft"
        });
        this.menuNode.morph = new Fx.Morph(this.menuNode, {
            "duration": 200,
            "transition": Fx.Transitions.Quart.easeOut
        });
        this.menuTitleNode.addEvent("click", function(){
            var input = this.menuTitleNode.getElement("input");
            if (!input) this.editTitle();
        }.bind(this));

        o2.require("o2.widget.ScrollBar", function(){
            this.appScrollBar = new o2.widget.ScrollBar(this.menuContentNode, {
                "style":"xDesktop_Message", "where": "before", "indent": false, "distance": 100, "friction": 6,	"axis": {"x": false, "y": true}
            });
        }.bind(this));
    },
    destroy: function(){
        this.menu.items.erase(this);
        this.node.destroy();
        this.menuNode.destroy();
    },
    editTitle: function(){
        this.menuTitleNode.empty();
        this.editotTitleNode = new Element("input.layout_start_groupItem_menu_title_edit", {"type": "text"}).inject(this.menuTitleNode);
        this.editotTitleNode.set("value", this.data.name);
        this.editotTitleNode.focus();

        this.editotTitleNode.addEvent("blur", function(){
            var name = this.editotTitleNode.get("value");
            if (name) this.data.name = name;
            this.data.title = this.data.name;
            this.menuTitleNode.empty();
            this.menuTitleNode.set("text", this.data.name);
            this.loadText();
        }.bind(this));
    },

    addItem: function(data){
        if (!this.data.itemDataList) this.data.itemDataList = [];
        if (this.data.itemDataList.length<4){
            this.setSubItemIcon(data, this.sunIconNodes[this.data.itemDataList.length]);
        }
        this.data.itemDataList.push(data);
    },
    setSubItemIcon: function(data, node){
        switch (data.type){
            case "process":
                this.setAppSubItemIcon(node, data.icon, "processDefault", "../x_component_process_ApplicationExplorer/$Main/default/icon/application.png");
                break;
            case "portal":
                this.setAppSubItemIcon(node, data.icon, "portalDefault", "../x_component_portal_PortalExplorer/$Main/default/icon/application.png");
                break;
            case "cms":
                this.setAppSubItemIcon(node, data.icon, "cmsDefault", "../x_component_cms_Index/$Main/default/icon/column.png");
                break;
            case "query":
                this.setAppSubItemIcon(node, data.icon, "queryDefault", "../x_component_query_Query/$Main/appicon.png");
                break;
            default:
                this.setDefaultSubItemIcon(data, node);
        }
    },
    setAppSubItemIcon: function(node, iconData, defaultIcon, defaultUrl){
        var icon = "";
        var bgcolor = "";
        if (iconData){
            icon = "data:image/png;base64,"+iconData+"";
            bgcolor = "";
            node.addClass("layout_start_item_icon_group_subIcon");
        }else{
            var p = defaultIcon;
            if (this.layout.iconsJson[p] && this.layout.iconsJson[p].icon){
                icon = this.layout.path+"appicons/"+this.layout.iconsJson[p].icon;
                bgcolor = this.layout.iconsJson[p].color;
            }else{
                icon = defaultUrl;
                bgcolor = "";
            }
        }
        if (icon && bgcolor) node.setStyle("background-color", bgcolor);
        node.setStyle("background-image", "url("+icon+")");
    },
    setDefaultSubItemIcon: function(data, node){
        var icon;
        var bgcolor = "";
        if (data.path.substring(0, 4)==="@url"){
            if (data.iconPath){
                icon = data.iconPath;
            }else{
                if (this.layout.iconsJson["Url"] && this.layout.iconsJson["Url"].icon){
                    icon = this.layout.path+"appicons/"+this.layout.iconsJson["Url"].icon;
                    bgcolor = this.layout.iconsJson["Url"].color;
                }else{
                    icon = "../x_component_Setting/$Main/default/icon/site.png";
                    bgcolor = "";
                }
            }
        }else{
            if (this.layout.iconsJson[data.path] && this.layout.iconsJson[data.path].icon){
                icon = this.layout.path+"appicons/"+this.layout.iconsJson[data.path].icon;
                bgcolor = this.layout.iconsJson[data.path].color;
            }else{
                icon = "../x_component_"+data.path.replace(/\./g, "_")+"/$Main/"+data.iconPath;
                bgcolor = "";
            }
        }
        if (icon && bgcolor){
            node.setStyle("background-color", bgcolor);
        }
        node.setStyle("background-image", "url("+icon+")");
    },

    resetMenuData: function(){
        debugger;
        var nodes = this.menuContentNode.getChildren(".layout_start_item");
        var data = [];

        nodes.each(function(node){
            var item = node.retrieve("item");
            if (item){
                data.push(item.data);
            }
        }.bind(this));
        this.data.itemDataList = data;
    }
});


o2.xDesktop.Default.StartMenu.PortalItem = new Class({
    Extends: o2.xDesktop.Default.StartMenu.Item,
    loadIcon: function(){
        var icon = "";
        var bgcolor = "";
        if (this.data.icon){
            icon = "data:image/png;base64,"+this.data.icon+"";
        }else{
            var p = "portalDefault";
            if (this.layout.iconsJson[p] && this.layout.iconsJson[p].icon){
                icon = this.layout.path+"appicons/"+this.layout.iconsJson[p].icon;
                bgcolor = this.layout.iconsJson[p].color;
            }else{
                icon = "../x_component_portal_PortalExplorer/$Main/default/icon/application.png";
                bgcolor = "";
            }
        }
        if (icon && bgcolor){
            this.iconNode.addClass("layout_start_item_icon_flat");
            this.iconNode.setStyle("background-color", bgcolor);
        }
        this.iconNode.setStyle("background-image", "url("+icon+")");
        this.icon = icon;
    },
    loadText: function(){
        this.textNode.set("text", this.data.name);
    },
    addLnk: function(dragTargetLnk, dragPosition){
        var options = {"portalId": this.data.id, "appId": "portal.Portal"+this.data.id};
        lnkdata = {
            "name": "portal.Portal",
            "title": this.data.name,
            "iconData": (this.data.icon) || "",
            "icon": null,
            "appType": "portal",
            "options": options
        }
        this.layout.addLnk(lnkdata, dragTargetLnk, dragPosition);
    },

    open: function(e){
        var options = {"portalId": this.data.id, "appId": "portal.Portal"+this.data.id};
        this.menu.hide(function(){
            if (this.menu.menu){
                this.menu.menu.hide(function(){
                    layout.openApplication(e, "portal.Portal", options);
                }.bind(this));
            }else{
                layout.openApplication(e, "portal.Portal", options);
            }
        }.bind(this));
    }
    // makeLnk: function(){
    //     //@todo
    //     // this.node.makeLnk({
    //     //     "par": {"icon": this.icon, "color": this.color, "title": this.data.title, "par": this.data.path},
    //     // });
    // }
});
o2.xDesktop.Default.StartMenu.ProcessItem = new Class({
    Extends: o2.xDesktop.Default.StartMenu.PortalItem,
    loadIcon: function(){
        var icon = "";
        var bgcolor = "";
        if (this.data.icon){
            icon = "data:image/png;base64,"+this.data.icon+"";
            bgcolor = "";
        }else{
            var p = "processDefault";
            if (this.layout.iconsJson[p] && this.layout.iconsJson[p].icon){
                icon = this.layout.path+"appicons/"+this.layout.iconsJson[p].icon;
                bgcolor = this.layout.iconsJson[p].color;
            }else{
                icon = "../x_component_process_ApplicationExplorer/$Main/default/icon/application.png";
                bgcolor = "";
            }
        }
        if (icon && bgcolor){
            this.iconNode.addClass("layout_start_item_icon_flat");
            this.iconNode.setStyle("background-color", bgcolor);
        }
        this.iconNode.setStyle("background-image", "url("+icon+")");
        this.icon = icon;
    },
    addLnk: function(dragTargetLnk, dragPosition){
        var options = {"id": this.data.id, "appId": "process.Application"+this.data.id};
        lnkdata = {
            "name": "process.Application",
            "title": this.data.name,
            "iconData": (this.data.icon) || "",
            "icon": null,
            "appType": "process",
            "options": options
        }
        this.layout.addLnk(lnkdata, dragTargetLnk, dragPosition);
    },
    open: function(e){
        var options = {"id": this.data.id, "appId": "process.Application"+this.data.id};
        this.menu.hide(function(){
            if (this.menu.menu){
                this.menu.menu.hide(function(){
                    layout.openApplication(e, "process.Application", options);
                }.bind(this));
            }else{
                layout.openApplication(e, "process.Application", options);
            }
        }.bind(this));
    }
    // makeLnk: function(){
    //     //@todo
    //     // this.node.makeLnk({
    //     //     "par": {"icon": this.icon, "color": this.color, "title": this.data.title, "par": this.data.path},
    //     // });
    // }
});
o2.xDesktop.Default.StartMenu.InforItem = new Class({
    Extends: o2.xDesktop.Default.StartMenu.PortalItem,
    loadIcon: function(){
        var icon = "";
        var bgcolor = "";
        if (this.data.appIcon){
            icon = "data:image/png;base64,"+this.data.appIcon+"";
            bgcolor = "";
        }else{
            var p = "cmsDefault";
            if (this.layout.iconsJson[p] && this.layout.iconsJson[p].icon){
                icon = this.layout.path+"appicons/"+this.layout.iconsJson[p].icon;
                bgcolor = this.layout.iconsJson[p].color;
            }else{
                icon = "../x_component_cms_Index/$Main/default/icon/column.png";
                bgcolor = "";
            }
        }
        if (icon && bgcolor){
            this.iconNode.addClass("layout_start_item_icon_flat");
            this.iconNode.setStyle("background-color", bgcolor);
        }
        this.iconNode.setStyle("background-image", "url("+icon+")");
        this.icon = icon;
    },
    loadText: function(){
        this.textNode.set("text", this.data.appName);
    },
    addLnk: function(dragTargetLnk, dragPosition){
        lnkdata = {
            "name": "cms.Module",
            "title": this.data.appName,
            "iconData": (this.data.appIcon) || "",
            "icon": null,
            "appType": "cms",
            "options": {"columnData": this.data, "appId": "cms.Module"+this.data.id}
        }
        this.layout.addLnk(lnkdata, dragTargetLnk, dragPosition);
    },
    open: function(e){
        this.menu.hide(function(){
            if (this.menu.menu){
                this.menu.menu.hide(function(){
                    layout.openApplication(e, "cms.Module", {"columnData": this.data, "appId": "cms.Module"+this.data.id});
                }.bind(this));
            }else{
                layout.openApplication(e, "cms.Module", {"columnData": this.data, "appId": "cms.Module"+this.data.id});
            }
        }.bind(this));
    }
    // makeLnk: function(){
    //     //@todo
    //     // this.node.makeLnk({
    //     //     "par": {"icon": this.icon, "color": this.color, "title": this.data.title, "par": this.data.path},
    //     // });
    // }
});
o2.xDesktop.Default.StartMenu.QueryItem = new Class({
    Extends: o2.xDesktop.Default.StartMenu.PortalItem,
    loadIcon: function(){
        var icon = "";
        var bgcolor = "";
        if (this.data.icon){
            icon = "data:image/png;base64,"+this.data.icon+"";
            bgcolor = "";
        }else{
            var p = "queryDefault";
            if (this.layout.iconsJson[p] && this.layout.iconsJson[p].icon){
                icon = this.layout.path+"appicons/"+this.layout.iconsJson[p].icon;
                bgcolor = this.layout.iconsJson[p].color;
            }else{
                icon = "../x_component_query_Query/$Main/appicon.png";
                bgcolor = "";
            }

        }
        if (icon && bgcolor){
            this.iconNode.addClass("layout_start_item_icon_flat");
            this.iconNode.setStyle("background-color", bgcolor);
        }
        this.iconNode.setStyle("background-image", "url("+icon+")");
        this.icon = icon;
    },
    addLnk: function(){
        lnkdata = {
            "name": "query.Query",
            "title": this.data.name,
            "iconData": (this.data.icon)||"",
            "icon": null,
            "appType": "query",
            "options": {"id": this.data.id, "appId": "query.Query"+this.data.id}
        }
        this.layout.addLnk(lnkdata, dragTargetLnk, dragPosition);
    },
    open: function(e){
        this.menu.hide(function(){
            if (this.menu.menu){
                this.menu.menu.hide(function(){
                    layout.openApplication(e, "query.Query", {"id": this.data.id, "appId": "query.Query"+this.data.id});
                }.bind(this));
            }else{
                layout.openApplication(e, "query.Query", {"id": this.data.id, "appId": "query.Query"+this.data.id});
            }
        }.bind(this));
    }
    // makeLnk: function(){
    //     //@todo
    //     // this.node.makeLnk({
    //     //     "par": {"icon": this.icon, "color": this.color, "title": this.data.title, "par": this.data.path},
    //     // });
    // }
});

o2.xDesktop.Default.TaskItem = new Class({
    initialize: function(desktop, app){
        this.desktop = desktop;
        this.container = this.desktop.taskContentNode;
        this.app = app;
        this.load();
    },
    load: function(){
        this.node = new Element("div.layout_content_taskbar_item").inject(this.container);
        this.iconNode = new Element("div");
        this.closeNode = new Element("div.layout_content_taskbar_item_icon", {"title": o2.LP.widget.close}).inject(this.node);
        this.closeNode.addClass("icon_close");
        if (this.app.options.appId==this.desktop.options.index){
            this.closeNode.hide();
            this.noCloseNode = true;
        }

        this.refreshNode = new Element("div.layout_content_taskbar_item_refresh", {"title": o2.LP.widget.refresh}).inject(this.node);;
        this.refreshNode.addClass("icon_refresh");
        this.refreshNode.addClass("animation_taskItemLoading");

        this.actionNode = new Element("div.layout_content_taskbar_item_action").inject(this.node);;
        this.actionNode.addClass("icon_taskitem_down");

        this.textNode = new Element("div.layout_content_taskbar_item_text").inject(this.node);;
        this.setText(this.app.options.title);

        //this.desktop.checkTaskBarSize();

        this.setEvent();
        this.unSelected();
    },
    setEvent: function(){
        this.textNode.addEvents({
            "click": function(){
                if (this.desktop.currentApp!=this.app){
                    if (!this.app.window){
                        this.desktop.apps[this.app.options.appId] = null;
                        layout.openApplication(null, this.app.options.name, this.app.options, this.app.options.app, false, this, false);
                    }else{
                        this.app.setCurrent();
                    }
                }else{
                    //   this.app.refresh();
                }
            }.bind(this),
            "dblclick": function(){
                this.app.openInNewBrowser((this.app.options.appId==this.desktop.options.index));
            }.bind(this)
        });
        this.closeNode.addEvents({
            "mouseover": function(){
                //    if (!this.layout.currentApp || this.layout.currentApp.taskitem!=this) this.node.setStyles(this.layout.css.taskItemNode_over);
            }.bind(this),
            "mouseout": function(){
                //    if (!this.layout.currentApp || this.layout.currentApp.taskitem!=this) this.node.setStyles(this.layout.css.taskItemNode);
            }.bind(this),
            "click": function(){
                if (!this.app.window){
                    this.desktop.apps[this.app.options.appId] = null;
                    delete this.desktop.apps[this.app.options.appId];
                    this.destroy();
                }else{
                    this.app.close();
                }
            }.bind(this)
        });
        this.refreshNode.addEvents({
            "mouseover": function(){
                //    if (!this.layout.currentApp || this.layout.currentApp.taskitem!=this) this.node.setStyles(this.layout.css.taskItemNode_over);
            }.bind(this),
            "mouseout": function(){
                //    if (!this.layout.currentApp || this.layout.currentApp.taskitem!=this) this.node.setStyles(this.layout.css.taskItemNode);
            }.bind(this),
            "click": function(){
                this.app.refresh();
            }.bind(this)
        });

        this.loadTaskItemMenu();

        if (this.desktop && this.desktop.checkTaskBarSize) this.desktop.checkTaskBarSize();
    },
    loadTaskItemMenu: function(){
        if (!this.taskitemMenu){
            this.taskitemMenu = new o2.xDesktop.Menu(this.actionNode, {
                "event": "click", "style": "flatUser", "offsetX": -10, "offsetY":6, "container": this.node
            });
            this.taskitemMenu.load();
            this.loadTaskItemMenuItems();
        }
    },
    loadTaskItemMenuItems: function(){
        var img = this.desktop.path+this.desktop.options.style+"/icons/menu_refresh.png";
        this.taskitemMenu.addMenuItem(o2.LP.desktop.refresh, "click", function(e){this.app.refresh(e);}.bind(this), img);

        this.taskitemMenu.addMenuLine();

        //img = this.path+this.options.style+"/icons/logout.png";
        if (this.app.options.appId!==this.desktop.options.index){
            img = this.desktop.path+this.desktop.options.style+"/icons/menu_openInWindow.png";
            this.taskitemMenu.addMenuItem(o2.LP.desktop.openInBrowser, "click", function(e){this.app.openInNewBrowser();}.bind(this), img);

            img = this.desktop.path+this.desktop.options.style+"/icons/menu_close.png";
            this.taskitemMenu.addMenuItem(o2.LP.desktop.close, "click", function(){
                if (!this.app.window){
                    this.desktop.apps[this.app.options.appId] = null;
                    delete this.desktop.apps[this.app.options.appId];
                    this.destroy();
                }else{
                    this.app.close();
                }
            }.bind(this), img);
        }

        img = this.desktop.path+this.desktop.options.style+"/icons/menu_closeall.png";
        this.taskitemMenu.addMenuItem(o2.LP.desktop.closeAll, "click", function(){
            var keys = Array.clone(Object.keys(this.desktop.apps));
            keys.each(function(key){
                if (!layout.desktop.apps[key].isIndex && !layout.desktop.apps[key].options.isIndex) layout.desktop.apps[key].close();
            }.bind(this));
            keys = null;
        }.bind(this), img);

        img = this.desktop.path+this.desktop.options.style+"/icons/menu_closeother.png";
        this.taskitemMenu.addMenuItem(o2.LP.desktop.closeOther, "click", function(){
            var keys = Array.clone(Object.keys(this.desktop.apps));
            keys.each(function(key){
                if (!this.desktop.apps[key].isIndex &&
                    !this.desktop.apps[key].options.isIndex &&
                    this.desktop.apps[key].options.appId!=this.app.options.appId) this.desktop.apps[key].close();
            }.bind(this));
            keys = null;
        }.bind(this), img);
    },

    setText: function(str){
        this.textNode.set("text", str || this.app.options.title);
    },
    unSelected: function(){
        this.node.removeClass("mainColor_bg");
        if (!this.noCloseNode) {
            this.closeNode.addClass("icon_close");
            this.closeNode.removeClass("icon_close_focus");
            //this.closeNode.hide();
        }
        if (this.refreshNode) this.refreshNode.hide();
        if (this.actionNode) this.actionNode.hide();
    },
    selected: function(){
        this.node.addClass("mainColor_bg");
        if (!this.noCloseNode){
            this.closeNode.removeClass("icon_close");
            this.closeNode.addClass("icon_close_focus");
            //this.closeNode.show();
        }
        this.desktop.checkTaskBarScrollTo(this.app);
        //this.refreshNode.show();
        if (this.actionNode) this.actionNode.show();


    },
    destroy: function(){
        this.iconNode.destroy();
        this.node.destroy();
        if (this.desktop && this.desktop.checkTaskBarSize) this.desktop.checkTaskBarSize();
        if (this.app.options && this.app.options.appId) delete this.desktop.apps[this.app.options.appId];
        o2.release(this);
    },
    setTaskitemSize: function(){
        this.desktop.checkTaskBarSize();
        this.desktop.checkTaskBarScrollTo();
    }
});

o2.xDesktop.Default.Lnk = new Class({
    initialize: function(layout, data, targetLnk, position){
        this.layout = layout;
        this.container = this.layout.lnkAreaNode;
        this.data = data;
        this.load(targetLnk, position);
    },
    load: function(targetLnk, position){
        this.node = new Element("div.layout_menu_lnk_item");
        if (targetLnk){
            if (!position) position = "before";
            this.node.inject(targetLnk.node, position);
        }else{
            this.node.inject(this.container);
        }
        this.iconNode = new Element("div.layout_menu_lnk_item_icon").inject(this.node);
        this.textNode = new Element("div.layout_menu_lnk_item_text", {"text": this.data.title}).inject(this.node);
        this.actionNode = new Element("div.layout_menu_lnk_item_action", {"title": o2.LP.desktop.deleteLnk}).inject(this.node);
        this.actionNode.addClass("icon_off_light");

        this.getIcon(function (icon) {
            this.iconNode.setStyle("background-image", "url("+icon+")");
            this.setEvent();
        }.bind(this));


    },
    setEvent: function(){
        this.node.addEvents({
            "click": function(){
                if (this.data.name=="Homepage"){
                    var name = this.data.name;
                    var options = this.data.options;

                    if (layout.config.indexPage && layout.config.indexPage.enable && layout.config.indexPage.portal){
                        name = "portal.Portal";
                        var appId = "portal.Portal"+layout.config.indexPage.portal;
                        options = {"name": "portal.Portal", "portalId": layout.config.indexPage.portal, "pageId": layout.config.indexPage.page, "appId": appId};
                    }
                    layout.openApplication(null, name, options);
                }else{
                    layout.openApplication(null, this.data.name, this.data.options);
                }
            }.bind(this),
            "mouseover": function(){
                this.actionNode.fade("in");
                this.node.addClass("overColor_bg");
                this.textNode.fade("in");
            }.bind(this),
            "mouseout": function(){
                this.actionNode.fade("out");
                this.node.removeClass("overColor_bg");
                this.textNode.fade("out");
            }.bind(this)
        });
        this.actionNode.addEvents({
            "click": function(e){
                this.destroy();
                e.stopPropagation();
            }.bind(this),
            "mouseover": function(){
                this.actionNode.addClass("layout_menu_lnk_item_action_shadow");
            }.bind(this),
            "mouseout": function(){
                this.actionNode.removeClass("layout_menu_lnk_item_action_shadow");
            }.bind(this)
        });
        var drag = new Drag(this.node, {
            "stopPropagation": true,
            "compensateScroll": true,
            "onStart": function(el, e){
                this.doDragMove(e);
                drag.stop();
            }.bind(this)
        });
    },
    getDragNode: function(){
        if (!this.dragNode){
            this.dragNode = new Element("div.layout_menu_lnk_item_drag")
                .setStyle("z-index", o2.xDesktop.zIndexPool.applyZindex())
                .inject(this.layout.node);

            var dragIconNode = this.iconNode.clone(true).inject(this.dragNode)
                .removeClass("layout_menu_lnk_item_icon")
                .addClass("layout_menu_lnk_item_icon_drag");

            var p = (this.data.appType) ? this.data.appType+"Default" : this.data.name;
            if (this.layout.iconsJson[p] && this.layout.iconsJson[p].color){
                dragIconNode.setStyle("background-color", this.layout.iconsJson[p].color)
            }
            this.dragRemoveNode = new Element("div.layout_menu_lnk_item_icon_drag_del").inject(this.dragNode)
                .addClass("icon_remove_badge")
                .hide();
        }
        var ps = this.iconNode.getPosition(this.dragNode.getOffsetParent());
        this.dragNode.show().setStyles({
            "left": ""+ps.x+"px", "top": ""+ps.y+"px"
        });
    },
    doDragMove: function(e){
        this.getDragNode();
        var drag = new Drag.Move(this.dragNode, {
            "stopPropagation": true,
            "compensateScroll": true,
            "droppables": [this.container.getParent()],
            "onStart": function(){ this._drag_start(); }.bind(this),
            "onDrag": function(dragging,e){ this._drag_drag(dragging, e); }.bind(this),
            "onEnter": function(dragging, inObj){ this._drag_enter(dragging, inObj); }.bind(this),
            "onLeave": function(dragging, obj){ this._drag_leave(dragging, obj); }.bind(this),
            "onDrop": function(dragging, inObj){ this._drag_drop(dragging, inObj); }.bind(this),
            "onCancel": function(dragging){ this._drag_cancel(dragging); }.bind(this),
            "onComplete": function(dragging, e){ this._drag_complete(dragging, e); }.bind(this),
        });
        drag.start(e);
        this.dragStatus = "order";
    },
    _drag_start: function(){
        this.node.addClass("overColor_bg");
        this.node.addClass("opacity50");
        this.dragTargetLnk = null;
        this.dragPosition = "before";
    },
    _drag_drag: function(dragging, e){
        if (this.dragStatus == "order"){
            if (this.layout.lnks && this.layout.lnks.length){
                var current = e.page.y;

                for (var i=0; i<this.layout.lnks.length; i++){
                    var lnk = this.layout.lnks[i];
                    var y = lnk.node.getSize().y;
                    var top = lnk.node.getPosition(this.layout.node).y;
                    var center = top+y/2;
                    var bottom = top+y;
                    if (top<=current && center>=current){
                        this.dragTargetLnk = lnk;
                        this.dragPosition = "before";
                        break;
                    }else if (center<=current && bottom>=current){
                        this.dragTargetLnk = lnk;
                        this.dragPosition = "after";
                        break;
                    }
                }
                if (!this.layout.positionNode) this.layout.positionNode = new Element("div.layout_menu_lnk_item_position")
                    .setStyle("z-index", o2.xDesktop.zIndexPool.applyZindex())
                    .inject(this.layout.node);
                this.layout.positionNode.show();

                if (!this.dragTargetLnk){
                    this.dragTargetLnk = this.layout.lnks[this.layout.lnks.length-1];
                    this.dragPosition = "after";
                }
                this.layout.positionNode.position({
                    relativeTo: this.dragTargetLnk.node,
                    position: (this.dragPosition=="before") ? 'topcenter' : 'bottomcenter',
                    edge: 'center'
                });
            }
        }
    },

    _drag_enter: function(){
        this.dragStatus = "order";
        if (this.dragRemoveNode) this.dragRemoveNode.hide();
    },
    _drag_leave: function(){
        this.dragStatus = "remove";
        if (this.dragRemoveNode) this.dragRemoveNode.show();
        if (this.layout.positionNode) this.layout.positionNode.hide();
    },

    _drag_drop: function(dragging, inObj){
        if (this.dragStatus == "order" && this.dragTargetLnk && this.dragTargetLnk!=this){
            this.node.inject(this.dragTargetLnk.node, this.dragPosition);
            this.layout.lnks.erase(this);
            var idx =  this.layout.lnks.indexOf(this.dragTargetLnk);
            if (this.dragPosition=="before"){
                this.layout.lnks.splice(idx, 0, this);
            }else{
                this.layout.lnks.splice(idx+1, 0, this);
            }
        }
    },

    _drag_cancel: function(dragging){
        dragging.hide();
        if (this.node) {
            this.node.removeClass("overColor_bg");
            this.node.removeClass("opacity50");
        }
        if (this.layout.positionNode) this.layout.positionNode.hide();
        if (this.dragRemoveNode) this.dragRemoveNode.hide();
    },

    _drag_complete: function(dragging){
        if (this.dragStatus == "remove"){
            this.destroy();
        }else{
            this._drag_cancel(dragging);
        }
    },

    destroy: function(){
        this.layout.lnks.erase(this);
        if (this.dragNode) this.dragNode.destroy();
        //if (this.positionNode) this.positionNode.destroy();
        this.node.destroy();
        o2.release(this);
    },

    getIcon: function( callback ){
        if (this.data.icon) return this.data.icon;

        var icon;
        if (this.data.name.substring(0, 4)==="@url"){
            if (this.data.iconData){
                icon = "data:image/png;base64,"+this.data.iconData+"";
            }else if (this.data.iconPath){
                icon = this.data.iconPath;
            }else {
                o2.Actions.load("x_component_assemble_control").ComponentAction.get(this.data.title, function(json){
                    if (json.data && json.data.iconData){
                        icon = "data:image/png;base64,"+json.data.iconData+"";
                    }else if (json.data && json.data.iconPath){
                        icon = json.data.iconPath;
                    }else if (this.layout.iconsJson["Url"] && this.layout.iconsJson["Url"].icon) {
                        icon = this.layout.path + "appicons/" + this.layout.iconsJson["Url"].icon;
                    } else {
                        icon = this.layout.path + "appicons/url.png";
                    }
                    if(callback)callback(icon)
                }.bind(this), function(){
                    if (this.layout.iconsJson["Url"] && this.layout.iconsJson["Url"].icon) {
                        icon = this.layout.path + "appicons/" + this.layout.iconsJson["Url"].icon;
                    } else {
                        icon = this.layout.path + "appicons/url.png";
                    }
                    if(callback)callback(icon)
                }.bind(this))
            }
        }else{
            if (this.data.iconData){
                icon = "data:image/png;base64,"+this.data.iconData+"";
            }else if (this.data.iconPath){
                icon = this.data.iconPath;
            }else{
                var p = (this.data.appType) ? this.data.appType+"Default" : this.data.name;
                if (this.layout.iconsJson[p] && this.layout.iconsJson[p].icon){
                    icon = this.layout.path+"appicons/"+this.layout.iconsJson[p].icon;
                }else{
                    icon = "../x_component_"+this.data.name.replace(/\./g, "_")+"/$Main/appicon.png";
                }
            }
            if(callback)callback(icon)
        }
        return icon;
    }
});


o2.xDesktop.zIndexPool = {
    zIndex: 102,
    applyZindex: function(){
        var i = this.zIndex;
        this.zIndex = this.zIndex+2;
        return i;
    }
};
