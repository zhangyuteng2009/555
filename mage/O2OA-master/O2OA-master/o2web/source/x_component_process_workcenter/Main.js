MWF.xApplication.process.workcenter.options.multitask = false;
MWF.xApplication.process.workcenter.Main = new Class({
	Extends: MWF.xApplication.Common.Main,
	Implements: [Options, Events],

	options: {
		"style1": "default",
		"style": "default",
		"name": "process.workcenter",
		"mvcStyle": "style.css",
		"icon": "icon.png",
		"title": MWF.xApplication.process.workcenter.LP.title
	},
	onQueryLoad: function(){
		this.lp = MWF.xApplication.process.workcenter.LP;
		this.action = o2.Actions.load("x_processplatform_assemble_surface");
	},
	loadApplication: function(callback){
		var url = this.path+this.options.style+"/view/view.html";
		this.content.loadHtml(url, {"bind": {"lp": this.lp}, "module": this}, function(){
			this.setLayout();
			this.loadCount();
			var list = (this.status) ? (this.status.navi || "task") : "task";
			this.loadList(list);
			if (callback) callback();
		}.bind(this));
	},
	setLayout: function(){
		var items = this.content.getElements(".menuItem");
		items.addEvents({
			"mouseover": function(){this.addClass("menuItem_over")},
			"mouseout": function(){this.removeClass("menuItem_over")},
			"click": function(){}
		});
	},
	createCountData: function(){
		var _self = this;
		if (!this.countData){
			this.countData = {"data": {}};
			var createDefineObject = function(p){
				return {
					"get": function(){return this.data[p]},
					"set": function(v){
						this.data[p] = v;
						_self[p+"CountNode"].set("text", v);
					}
				}
			};
			var o = {
				"task": createDefineObject("task"),
				"taskCompleted": createDefineObject("taskCompleted"),
				"read": createDefineObject("read"),
				"readCompleted": createDefineObject("readCompleted"),
				"draft": createDefineObject("draft"),
			};
			MWF.defineProperties(this.countData, o);
		}
	},
	loadCount: function(){
		this.createCountData();

		this.action.WorkAction.countWithPerson(layout.session.user.id).then(function(json){
			this.countData.task = json.data.task;
			this.countData.taskCompleted = json.data.taskCompleted;
			this.countData.read = json.data.read;
			this.countData.readCompleted = json.data.readCompleted;

			// this.pageData = Object.assign(this.pageData, json.data);
			// this.taskCountNode.set("text", json.data.task);
			// this.taskCompletedCountNode.set("text", json.data.taskCompleted);
			// this.readCountNode.set("text", json.data.read);
			// this.readCompletedCountNode.set("text", json.data.readCompleted);
		}.bind(this));
		this.action.DraftAction.listMyPaging(1,1, {}).then(function(json){
			this.countData.draft = json.size;
			// this.pageData = Object.assign(this.pageData, {"draft": json.size});
			// this.draftCountNode.set("text", json.size);
		}.bind(this));
	},
	loadList: function(type){
		if (this.currentMenu) this.setMenuItemStyleDefault(this.currentMenu);
		this.setMenuItemStyleCurrent(this[type+"MenuNode"]);
		this.currentMenu = this[type+"MenuNode"];

		if (this.currentList) this.currentList.hide();
		this.showSkeleton();
		this._loadListContent(type);
		this.loadCount();
		//if (this.currentList) this.currentList.loadPage();
	},
	showSkeleton: function(){
		if (this.skeletonNode) this.skeletonNode.inject(this.listContentNode);
	},
	hideSkeleton: function(){
		if (this.skeletonNode) this.skeletonNode.dispose();
	},
	_loadListContent: function(type){
		var list = this[(type+"-list").camelCase()];
		if (!list){
			list = new MWF.xApplication.process.workcenter[type.capitalize()+"List"](this, { "onLoadData": this.hideSkeleton.bind(this) });
			this[(type+"-list").camelCase()] = list;
		}
		list.init();
		list.load();
		this.currentList = list;
	},
	setMenuItemStyleDefault: function(node){
		node.removeClass("mainColor_bg_opacity");
		node.getFirst().removeClass("mainColor_color");
		node.getLast().removeClass("mainColor_color");
	},
	setMenuItemStyleCurrent: function(node){
		node.addClass("mainColor_bg_opacity");
		node.getFirst().addClass("mainColor_color");
		node.getLast().addClass("mainColor_color");
	},
	getApplicationIcon: function(application){
		var icon = (this.appIcons) ? this.appIcons[application] : null;
		if (!icon) {
			return this.action.ApplicationAction.getIcon(application).then(function(json){
				if (json.data){
					debugger;
					if (!this.appIcons) this.appIcons = {};
					this.appIcons[application] = json.data;
					return json.data;
				}
				return {
					"icon": "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEgElEQVR4Xu1aPXMTSRB9vUaGQqs6iCgi4Bfgq7I2lqWrSwgQMQHyPzAJIeguvOT4BxbBxYjgkquTrFiiCvkXYCKKCFMSFEjs9tWsrEKWvTtfuyvXrTbd6ZnuN69fz842IecP5Tx+rAFYMyDnCKxTYBUE4MrWta9UuLu49hWeHlJveJy1P6kzQAT7eWPzPgN1MFeI6FpckMx8DKIeAe2iP3mVNiipADALuvAIQAOgLbtd5SGAVtGfvkgDjMQB+Fz1ngXgPdlO64IimOGAnhe7/d90bePGJwbAuOY9AqMJwu0kHTwzF+MIhKbb6b9IYh1rAATdxxub+yRyPMOHgbbrT3Zt08IKgHGlvIUN7NvnuSlyPISPXbc3EDph9BgDMPplu4KAXiad67pRhFXD4Qelf1/3dG3FeCMARPDEzoHJgmnZMAU7JiBoAyBozw4OVr3zy0AKJlCAHd100ALgpL4frC7nZfzhYdGf7ugIoxYAo5r3Mmu1l4V8hglAu9TpP1C1UwZgXC03QLSvOvFKxzHvut1BS8UHDQC8t6kfclQ8VhnDOHK7/TsqQ5UAGFW9JhGeqUy4PIZu3AR/eG9iChtbcPDY7b5+LltYCkB40nMKb01U/9Kv93D5yVN8++N3fP/nb5kvp97b2IqJRFVwg+kdmSBKARhXt/dAzp9a3gOYBzC30wHBxvaUnwoskANQK7/RLXvLAeiAYGN7dpN46HYGP8dtXiwAJ5cZH3V2X+Tt1b/akSZxTIgKfj7Zl4d1bT0p+pPrcWkQC4Bp6ZMFch4IJjZKGyMpibEAjGpem4D7SgstDdIJSGesri8MvCp1+pGf6vEAVMsfTdR/7qRKYGKsqBRRj454njeHqAal7uB61PzxKVDzWBfx5fEyEOLmtw1+Prfb6UfGGfnCRACjgjEBIanghU9GACT9za8DQpLBh4eimLuCSAYkDYBwRAWEpINfA3BRGKCy+zonRh1xNkqB3IugQHic5zIoABjVyscE+kmHbotjZbQXgpf6QQj8qdQZRP6QXR+F43Y39x9DJkL4v/ocDoWw6g1BONXNIdMEm0sNG9szfjEO3W4/tj9BfiOU9yux2e/vwpFJNbC52LSxDY+/4E+uP71tfSkalsM8X4vP82pc9URnxi1Z/l+I94x3brev1Kki1YAfAOT819jsZGh+R5gVM2R3gMt+KDMgFBbR/uZs9nTLYlbBg3FYDCYVmfAt+qMFQHguEA0SG+iZVIU0gRCqTz4qqTZIzANI47bIFpzMWmQWQQBTe9VMEDsP4rpJf5CIRTsFFncqbJNzqLUyTWAcIuCGLu2tNGCZqieNki3TP0im1Bdq7/qTho7gnbeWFQNOsUG00IBEq2y6hyXGO4Cbqi0wMoATA+DHgWl7j4maSWtDqPIsApd3fciCTjQFzltsdl641ACchrU+iDxH0CoG31u2dE81BaJQn4FRqDNRXRylZMwIVR3UI+Z2MZi20wg6dQaoUDDsNV54TMuYylpxYxLXAFuHsrZfA5A14hdtvTUDLtqOZO1P7hnwH8CljF98DV13AAAAAElFTkSuQmCC",
					"iconHue": "#4e82bd"
				};
			}.bind(this), function(){
				return {
					"icon": "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEgElEQVR4Xu1aPXMTSRB9vUaGQqs6iCgi4Bfgq7I2lqWrSwgQMQHyPzAJIeguvOT4BxbBxYjgkquTrFiiCvkXYCKKCFMSFEjs9tWsrEKWvTtfuyvXrTbd6ZnuN69fz842IecP5Tx+rAFYMyDnCKxTYBUE4MrWta9UuLu49hWeHlJveJy1P6kzQAT7eWPzPgN1MFeI6FpckMx8DKIeAe2iP3mVNiipADALuvAIQAOgLbtd5SGAVtGfvkgDjMQB+Fz1ngXgPdlO64IimOGAnhe7/d90bePGJwbAuOY9AqMJwu0kHTwzF+MIhKbb6b9IYh1rAATdxxub+yRyPMOHgbbrT3Zt08IKgHGlvIUN7NvnuSlyPISPXbc3EDph9BgDMPplu4KAXiad67pRhFXD4Qelf1/3dG3FeCMARPDEzoHJgmnZMAU7JiBoAyBozw4OVr3zy0AKJlCAHd100ALgpL4frC7nZfzhYdGf7ugIoxYAo5r3Mmu1l4V8hglAu9TpP1C1UwZgXC03QLSvOvFKxzHvut1BS8UHDQC8t6kfclQ8VhnDOHK7/TsqQ5UAGFW9JhGeqUy4PIZu3AR/eG9iChtbcPDY7b5+LltYCkB40nMKb01U/9Kv93D5yVN8++N3fP/nb5kvp97b2IqJRFVwg+kdmSBKARhXt/dAzp9a3gOYBzC30wHBxvaUnwoskANQK7/RLXvLAeiAYGN7dpN46HYGP8dtXiwAJ5cZH3V2X+Tt1b/akSZxTIgKfj7Zl4d1bT0p+pPrcWkQC4Bp6ZMFch4IJjZKGyMpibEAjGpem4D7SgstDdIJSGesri8MvCp1+pGf6vEAVMsfTdR/7qRKYGKsqBRRj454njeHqAal7uB61PzxKVDzWBfx5fEyEOLmtw1+Prfb6UfGGfnCRACjgjEBIanghU9GACT9za8DQpLBh4eimLuCSAYkDYBwRAWEpINfA3BRGKCy+zonRh1xNkqB3IugQHic5zIoABjVyscE+kmHbotjZbQXgpf6QQj8qdQZRP6QXR+F43Y39x9DJkL4v/ocDoWw6g1BONXNIdMEm0sNG9szfjEO3W4/tj9BfiOU9yux2e/vwpFJNbC52LSxDY+/4E+uP71tfSkalsM8X4vP82pc9URnxi1Z/l+I94x3brev1Kki1YAfAOT819jsZGh+R5gVM2R3gMt+KDMgFBbR/uZs9nTLYlbBg3FYDCYVmfAt+qMFQHguEA0SG+iZVIU0gRCqTz4qqTZIzANI47bIFpzMWmQWQQBTe9VMEDsP4rpJf5CIRTsFFncqbJNzqLUyTWAcIuCGLu2tNGCZqieNki3TP0im1Bdq7/qTho7gnbeWFQNOsUG00IBEq2y6hyXGO4Cbqi0wMoATA+DHgWl7j4maSWtDqPIsApd3fciCTjQFzltsdl641ACchrU+iDxH0CoG31u2dE81BaJQn4FRqDNRXRylZMwIVR3UI+Z2MZi20wg6dQaoUDDsNV54TMuYylpxYxLXAFuHsrZfA5A14hdtvTUDLtqOZO1P7hnwH8CljF98DV13AAAAAElFTkSuQmCC",
					"iconHue": "#4e82bd"
				};
			});
		}else{
			return icon;
		}
	},
	firstPage: function(){
		if (this.currentList) this.currentList.firstPage();
	},
	lastPage: function(){
		if (this.currentList) this.currentList.lastPage();
	},
	prevPage: function(){
		if (this.currentList) this.currentList.prevPage();
	},
	nextPage: function(){
		if (this.currentList) this.currentList.nextPage();
	},
	getFilterData: function(){
		var type = this.currentList.options.type.capitalize();
		var action = type+"Action";
		return this.action[action].filterAttribute().then(function(json){return json.data});
	},
	showFilter: function(e){
		//console.log(this.filterDlg);
		if (this.filterDlg) return;
		var node = e.target;
		var p = node.getPosition(this.content);
		var size = node.getSize();
		var y = p.y+size.y+10;
		var x = p.x-600+size.x;
		var fx = p.x+size.x;

		var filterContent = new Element("div");
		var url = this.path+this.options.style+"/view/dlg/filter.html";
		this.getFilterData().then(function(data){
			this.currentList.filterAttribute = data;
			filterContent.loadHtml(url, {"bind": {"lp": this.lp, "type": this.options.type, "data": data, filter: this.currentList.filterList}, "module": this})
		}.bind(this));

		var _self = this;
		var closeFilterDlg = function(){
			_self.filterDlg.close();
		}
		this.filterDlg = o2.DL.open({
			"mask": false,
			"title": "",
			"style": "user",
			"isMove": false,
			"isResize": false,
			"isTitle": false,
			"content": filterContent,
			"maskNode": this.content,
			"top": y,
			"left": x,
			"fromTop": y,
			"fromLeft": fx,
			"width": 600,
			"height": 550,
			"duration": 100,
			// "onQueryClose": function(){
			// 	document.body.removeEvent("mousedown", closeFilterDlg);
			// },
			"onPostClose": function(){
				document.body.removeEvent("mousedown", closeFilterDlg);
				_self.filterDlg = null;
			},
			"buttonList": [
				{
					"type": "ok",
					"text": MWF.LP.process.button.ok,
					"action": function (d, e) {
						_self.doFilter();
					}.bind(this)
				},
				{
					"type": "cancel",
					"text": MWF.LP.process.button.reset,
					"action": function () {
						debugger;
						_self.resetFilter();
						this.filterDlg.close();
					}.bind(this)
				}
			],

		});
		this.filterDlg.node.addEvent("mousedown", function(e){
			e.stopPropagation();
		});
		document.body.addEvent("mousedown", closeFilterDlg);
	},
	selectFilterItem: function(name, value, category, e){
		var node = e.target;
		// var value = node.dataset.value;
		// var category = node.dataset.category;

		if (!this.currentList.filterList) this.currentList.filterList = {};
		if (!this.currentList.filterList[category]) this.currentList.filterList[category] = [];
		if (!this.currentList.filterNameList) this.currentList.filterNameList = {};
		if (!this.currentList.filterNameList[category]) this.currentList.filterNameList[category] = [];
		var findedIdx = this.currentList.filterList[category].indexOf(value);

		if (findedIdx===-1){
			node.addClass("mainColor_bg");
			this.currentList.filterList[category].push(value);
			this.currentList.filterNameList[category].push(name)
		}else{
			node.removeClass("mainColor_bg");
			this.currentList.filterList[category].splice(findedIdx, 1);
			this.currentList.filterNameList[category].splice(findedIdx, 1);
		}
	},
	resetFilter: function(){
		this.currentList.page = 1;
		this.currentList.filterList = {};
		this.currentList.filterNameList = {};
		this.currentList.refresh();
	},
	doFilter: function(){
		debugger;
		var key = this.filterDlg.content.getElement("input").get("value");
		if (key) {
			if (!this.currentList.filterList) this.currentList.filterList = {};
			if (!this.currentList.filterNameList) this.currentList.filterNameList = {};
			this.currentList.filterList.key = key;
			this.currentList.filterNameList.key = [key];
		}
		this.currentList.page = 1;
		this.currentList.refresh();
		this.filterDlg.close();
	},
	inputFilter: function(e){
		if (e.keyCode==13) this.doFilter();
	},

	getStartData: function(){
		var p1 = this.action.ApplicationAction.listWithPersonComplex().then(function(json){return json.data});
		var p2 = new Promise(function(resolve){
			o2.UD.getDataJson("taskCenter_startTop", function(data){
				resolve(data);
			});
		});
		return Promise.all([p1, p2]);
	},
	closeStartProcess: function(e){
		e.target.getParent(".st_area").destroy();
		this.appNode.show();
	},
	startProcess: function(){
		var startContent = new Element("div.st_area");
		var url = this.path+this.options.style+"/view/dlg/start.html";
		this.getStartData().then(function(data){
			startContent.loadHtml(url, {"bind": {"lp": this.lp, "data": {"app": data[0], "topApp": data[1]}}, "module": this});
		}.bind(this));

		this.appNode.hide();
		startContent.inject(this.content);
	},
	loadStartProcessList: function(e, data){
		var node = e.target;
		var url = this.path+this.options.style+"/view/dlg/processList.html";
		node.loadHtml(url, {"bind": {"lp": this.lp, "data": data}, "module": this});
	},

	startAppItemOver: function(e, data){
		var node = e.target;
		while (node && !node.hasClass("st_appListItem")){ node = node.getParent();}
		if (node) node.addClass("menuItem_over");
	},
	startAppItemOut: function(e, data){
		var node = e.target;
		while (node && !node.hasClass("st_appListItem")){ node = node.getParent();}
		if (node) node.removeClass("menuItem_over");
	},
	startAppItemClick: function(e, data){
		var node = e.target;

		this.clearStartAppSelected(e);
		while (node && !node.hasClass("st_appListItem")){ node = node.getParent();}
		node.addClass("mainColor_bg_opacity");

		var appData = (data.app) ? data : {"app": [data]};
		this.reloadStartProcessList(node, appData);
	},
	clearStartAppSelected: function(e){
		var node = e.target.getParent(".st_menu").getElement(".mainColor_bg_opacity");
		if (node) node.removeClass("mainColor_bg_opacity");
	},
	reloadStartProcessList: function(node, data){
		var processListNode = node.getParent(".st_processContent").getElement(".st_processList").empty();
		var url = this.path+this.options.style+"/view/dlg/processList.html";
		processListNode.loadHtml(url, {"bind": {"lp": this.lp, "data": data}, "module": this});
	},
	startProcessSearch: function(e, data){
		if (e.keyCode===13){
			var key = e.target.get("value");
			if (key){
				var name = this.lp.searchProcessResault.replace("{key}", key);
				var processList = [];
				data.app.forEach(function(app){
					app.processList.forEach(function(process){
						if (process.name.indexOf(key)!==-1){
							processList.push(process);
						}
					});
				});
				this.clearStartAppSelected(e);
				e.target.getParent(".st_search").addClass("mainColor_bg_opacity");
				this.reloadStartProcessList(e.target, {"app": [{"name": name, processList: processList}]});
			}else{
				this.clearStartProcessSearch(e);
			}
		}
	},
	clearStartProcessSearch: function(e){
		var pnode = e.target.getParent(".st_processContent");
		pnode.getElement(".st_all").click();
		pnode.getElement("input").set("value", "");
	},
	loadItemIcon: function(application, e){
		var node = e.currentTarget;
		Promise.resolve(this.getApplicationIcon(application)).then(function(icon){
			if (icon.icon){
				node.setStyle("background-image", "url(data:image/png;base64,"+icon.icon+")");
			}else{
				node.setStyle("background-image", "url("+"../x_component_process_ApplicationExplorer/$Main/default/icon/application.png)");
			}
		});
	},
	startProcessItemOver: function(e){
		var node = e.target;
		while (node && !node.hasClass("st_processItem")){ node = node.getParent();}
		if (node){
			node.addClass("menuItem_over");
			node.removeClass("mainColor_bg");
		}
	},
	startProcessItemOut: function(e){
		var node = e.target;
		while (node && !node.hasClass("st_processItem")){ node = node.getParent();}
		if (node){
			node.removeClass("menuItem_over");
			node.removeClass("mainColor_bg");
		}
	},
	startProcessItemDown: function(e){
		var node = e.target;
		while (node && !node.hasClass("st_processItem")){ node = node.getParent();}
		if (node){
			node.removeClass("menuItem_over");
			node.addClass("mainColor_bg");
		}
	},
	startProcessItemUp: function(e){
		var node = e.target;
		while (node && !node.hasClass("st_processItem")){ node = node.getParent();}
		if (node){
			node.addClass("menuItem_over");
			node.removeClass("mainColor_bg");
		}
	},
	startProcessItemClick: function(e, data){
		MWF.xDesktop.requireApp("process.TaskCenter", "ProcessStarter", function(){
			var starter = new MWF.xApplication.process.TaskCenter.ProcessStarter(data, this, {
				"onStarted": function(workdata, title, processName){
					this.afterStartProcess(workdata, title, processName, data);
					this.closeStartProcess(e);
				}.bind(this)
			});
			starter.load();
		}.bind(this));
	},
	recordProcessData: function(data){
		debugger;
		MWF.UD.getDataJson("taskCenter_startTop", function(json){
			if (!json || !json.length) json = [];
			var recordProcess = null;
			data.lastStartTime = new Date();
			var earlyProcessIdx = 0;
			var flag = true;
			for (var i=0; i<json.length; i++){
				var process = json[i];
				if (process.id === data.id) recordProcess = process;
				if (flag){
					if (!process.lastStartTime){
						earlyProcessIdx = i;
						flag = false;
					}else{
						if (new Date(process.lastStartTime)<new Date(json[earlyProcessIdx].lastStartTime)){
							earlyProcessIdx = i;
						}
					}
				}
			}
			if (recordProcess) {
				recordProcess.lastStartTime = new Date();
				recordProcess.count = (recordProcess.count || 0)+1;
				recordProcess.applicationName = data.applicationName;
			}else{
				if (json.length<10){
					data.count = 1;
					//data.applicationName = this.applicationData.name;
					json.push(data);
				}else{
					json.splice(earlyProcessIdx, 1);
					data.count = 1;
					//data.applicationName = this.applicationData.name;
					json.push(data);
				}
			}
			MWF.UD.putData("taskCenter_startTop", json);
		}.bind(this));
	},
	afterStartProcess: function(data, title, processName, processdata){
		this.recordProcessData(processdata);
		if (data.work){
			this.startProcessDraft(data, title, processName);
		}else{
			this.startProcessInstance(data, title, processName);
		}
	},
	startProcessDraft: function(data, title, processName){
		var work = data.work;
		var options = {"draft": work, "appId": "process.Work"+(new o2.widget.UUID).toString(), "desktopReload": false,
			"onPostClose": function(){
				if (this.currentList.refresh) this.currentList.refresh();
			}.bind(this)
		};
		this.desktop.openApplication(null, "process.Work", options);
	},
	startProcessInstance: function(data, title, processName){
		var workInfors = [];
		var currentTask = [];
		data.each(function(work){
			if (work.currentTaskIndex !== -1) currentTask.push(work.taskList[work.currentTaskIndex].work);
			workInfors.push(this.getStartWorkInforObj(work));
		}.bind(this));

		if (currentTask.length===1){
			var options = {"workId": currentTask[0], "appId": "process.Work"+currentTask[0],
				"onPostClose": function(){
					if (this.currentList.refresh) this.currentList.refresh();
				}.bind(this)
			};
			this.desktop.openApplication(null, "process.Work", options);

			if (layout.desktop.message) this.createStartWorkResault(workInfors, title, processName, false);
		}else{
			if (layout.desktop.message) this.createStartWorkResault(workInfors, title, processName, true);
		}
	},
	getStartWorkInforObj: function(work){
		var users = [];
		var currentTask = "";
		work.taskList.each(function(task, idx){
			users.push(task.person+"("+task.department + ")");
			if (work.currentTaskIndex===idx) currentTask = task.id;
		}.bind(this));
		return {"activity": work.fromActivityName, "users": users, "currentTask": currentTask};
	},
	createStartWorkResault: function(workInfors, title, processName, isopen){
		var content = "";
		workInfors.each(function(infor){
			var users = [];
			infor.users.each(function(uname){
				users.push(MWF.name.cn(uname));
			});

			content += "<div><b>"+this.lp.nextActivity+"<font style=\"color: #ea621f\">"+infor.activity+"</font>, "+this.lp.nextUser+"<font style=\"color: #ea621f\">"+users.join(", ")+"</font></b>";
			if (infor.currentTask && isopen){
				content += "&nbsp;&nbsp;&nbsp;&nbsp;<span value=\""+infor.currentTask+"\">"+this.lp.deal+"</span></div>";
			}else{
				content += "</div>";
			}
		}.bind(this));

		var msg = {
			"subject": this.lp.processStarted,
			"content": "<div>"+this.lp.processStartedMessage+"“["+processName+"]"+title+"”</div>"+content
		};
		var tooltip = layout.desktop.message.addTooltip(msg);
		var item = layout.desktop.message.addMessage(msg);

		this.setStartWorkResaultAction(tooltip);
		this.setStartWorkResaultAction(item);
	},
	setStartWorkResaultAction: function(item){
		var node = item.node.getElements("span.dealStartedWorkAction");
		var _self = this;
		node.addEvent("click", function(e){
			var options = {"taskId": this.get("value"), "appId": this.get("value"),
				"onPostClose": function(){
					if (_self.currentList.refresh) _self.currentList.refresh();
				}
			};
			_self.app.desktop.openApplication(e, "process.Work", options);
		});
	},
	recordStatus: function(){
		return {"navi": this.currentList.options.type};
	},
});

MWF.xApplication.process.workcenter.List = new Class({
	Implements: [Options, Events],
	options: {
		"itemHeight": 60,
		"view": "list.html",
		"type": "task"
	},
	initialize: function (app, options) {
		this.setOptions(options);
		this.app = app;
		this.content = app.listContentNode;
		this.bottomNode = app.listBottomNode;
		this.pageNode = app.pageNumberAreaNode;
		this.filterNode = app.filterItemArea;
		this.lp = this.app.lp;
		this.action = o2.Actions.load("x_processplatform_assemble_surface");
		this.init();
		//this.load();
	},
	init: function(){
		this.listHeight = this.content.getSize().y;
		this.size = (this.listHeight/this.options.itemHeight).toInt()
		this.page = 1;
		this.totalCount = this.app.countData.task;
		this.filterList = {};
		this.filterNameList = {};
	},
	startProcess: function(){
		this.app.startProcess();
	},
	setLayout: function(){

	},
	load: function(){
		this.total = null;
		var _self = this;
		this.loadFilterFlag();
		this.app.filterActionNode.show();
		this.selectedTaskList = [];
		this.loadData().then(function(data){
			_self.hide();
			_self.loadPage();
			_self.loadItems(data);
		});
	},
	refresh: function(){
		this.hide();
		this.load();
		// this.loadPage();
		this.app.loadCount();
	},
	loadFilterFlag: function(){
		this.filterNode.empty();
		var filterItemHtml = "<div class='ft_filterItem'>" +
			"<div class='ft_filterItemTitle mainColor_color'>{{$.title}}:</div>" +
			"<div class='ft_filterItemName'>{{$.name}}</div>"+
			"<icon class='o2icon-clear ft_filterItemDel' data-key='{{$.key}}' data-name='{{$.name}}'/>"+
			"</div>";
		var _self = this;
		this.lp.filterCategoryShortList.forEach(function(list){
			if (_self.filterNameList && _self.filterNameList[list.key] && _self.filterNameList[list.key].length){
				_self.filterNameList[list.key].forEach(function(i){
					var html = o2.bindJson(filterItemHtml, {"title": list.name, "name": i, "key": list.key});
					_self.filterNode.appendHTML(html);
				});
			}
		});
		this.filterNode.getElements(".ft_filterItemDel").addEvent("click", this.clearFilterItem.bind(this));
	},
	clearFilterItem: function(e){
		debugger;
		var node = e.target;
		var key = node.dataset.key;
		var name = node.dataset.name;
		if (this.filterNameList && this.filterNameList[key]){
			var findedIdx = this.filterNameList[key].indexOf(name);
			this.filterNameList[key].splice(findedIdx, 1);

			if (this.filterList && this.filterList[key]){
				if (this.filterList[key].splice){
					this.filterList[key].splice(findedIdx, 1);
				}else{
					delete this.filterList[key];
				}
			}
			this.page = 1;
			this.refresh();
		}
	},
	hide: function(){
		if (this.node) this.node.destroy();
	},
	loadPage: function(){
		var totalCount = this.total || this.app.countData[this.options.type];
		var pages = totalCount/this.size;
		var pageCount = pages.toInt();
		if (pages !== pageCount) pageCount = pageCount+1;
		this.pageCount = pageCount;

		var size = this.bottomNode.getSize();
		var maxPageSize = size.x*0.8;
		maxPageSize = maxPageSize - 80*2-24*2-10*3;
		var maxPageCount = (maxPageSize/34).toInt();

		this.loadPageNode(pageCount, maxPageCount);
	},
	loadPageNode: function(pageCount, maxPageCount){
		var pageStart = 1;
		var pageEnd = pageCount;
		if (pageCount>maxPageCount){
			var halfCount = (maxPageCount/2).toInt();
			pageStart = Math.max(this.page-halfCount, 1);
			pageEnd = pageStart+maxPageCount-1;
			pageEnd = Math.min(pageEnd, pageCount);
			pageStart = pageEnd - maxPageCount+1;
		}
		this.pageNode.empty();
		var _self = this;
		for (var i=pageStart; i<=pageEnd; i++){
			var node = new Element("div.pageItem", {
				"text": i,
				"events": { "click": function(){_self.gotoPage(this.get("text"));} }
			}).inject(this.pageNode);
			if (i==this.page) node.addClass("mainColor_bg");
		}
	},
	nextPage: function(){
		this.page++;
		if (this.page>this.pageCount) this.page = this.pageCount;
		this.gotoPage(this.page);
	},
	prevPage: function(){
		this.page--;
		if (this.page<1) this.page = 1;
		this.gotoPage(this.page);
	},
	firstPage: function(){
		this.gotoPage(1);
	},
	lastPage: function(){
		this.gotoPage(this.pageCount);
	},
	gotoPage: function(page){
		this.page = page;
		this.hide();
		this.app.showSkeleton();
		this.load();
		//this.loadPage();
	},

	loadData: function(){
		var _self = this;
		return this.action.TaskAction.listMyFilterPaging(this.page, this.size, this.filterList||{}).then(function(json){
			_self.fireEvent("loadData");
			//if (_self.total!==json.size) _self.countNode.set("text", json.size);
			_self.total = json.count;
			return json.data;
		}.bind(this));
	},
	loadItems: function(data){
		var url = this.app.path+this.app.options.style+"/view/"+this.options.view;
		this.content.loadHtml(url, {"bind": {"lp": this.lp, "type": this.options.type, "data": data}, "module": this}, function(){
			this.node = this.content.getFirst();
		}.bind(this));
	},

	overTaskItem: function(e){
		e.currentTarget.addClass("listItem_over");
	},
	outTaskItem: function(e){
		e.currentTarget.removeClass("listItem_over");
	},
	openTask: function(e, data){
		o2.api.form.openWork(data.work, "", data.title, {
			"onPostClose": function(){
				if (this.refresh) this.refresh();
			}.bind(this)
		});
	},
	loadItemIcon: function(application, e){
		this.app.loadItemIcon(application, e);
	},
	loadItemFlag: function(e, data){
		var node = e.currentTarget;
		var iconNode = node.getElement(".listItemFlag");
		var expireNode = node.getElement(".listItemExpire");

		if (data.completed){
			iconNode.setStyle("background-image", "url("+"../x_component_process_workcenter/$Main/default/icons/pic_ok.png)");
			return true;
		}

		var start = new Date().parse(data.startTime);
		var now = new Date();
		if (now.getTime()-start.getTime()<86400000){
			iconNode.setStyle("background-image", "url("+"../x_component_process_workcenter/$Main/default/icons/pic_new.png)");
		}

		if (data.expireTime){
			var d1 = Date.parse(data.expireTime);
			var d2 = Date.parse(data.createTime);


			var time1 = d2.diff(now, "second");
			var time2 = now.diff(d1, "second");
			var time3 = d2.diff(d1, "second");
			var n = time1/time3;

			var img = "";
			var text = this.lp.expire1;
			text = text.replace(/{time}/g, data.expireTime);
			if (n<0.5){
				img = "1.png";
			}else if (n<0.75){
				img = "2.png";
			}else if (n<1){
				text = this.lp.expire2.replace(/{time}/g, data.expireTime);
				img = "3.png";
				iconNode.setStyle("background-image", "url("+"../x_component_process_workcenter/$Main/default/icons/pic_jichao.png)");
			}else if (n<2){
				text = this.lp.expire3.replace(/{time}/g, data.expireTime);
				img = "4.png";
				iconNode.setStyle("background-image", "url("+"../x_component_process_workcenter/$Main/default/icons/pic_yichao.png)");
			}else{
				text = this.lp.expire3.replace(/{time}/g, data.expireTime);
				img = "5.png";
				iconNode.setStyle("background-image", "url("+"../x_component_process_workcenter/$Main/default/icons/pic_yanchao.png)");
			}
			expireNode.setStyle("background-image", "url(../"+this.app.path+this.app.options.style+"/icons/"+img+")");
			expireNode.set("title", text);
		}
	},
	getFormData: function(data){
		var action = this.action;
		var formPromise = action.FormAction[((layout.mobile) ? "V2LookupWorkOrWorkCompletedMobile" : "V2LookupWorkOrWorkCompleted")](data.work).then(function(json){
			var formId = json.data.id;
			if (json.data.form){
				return json.form;
			}else{
				return action.FormAction[((layout.mobile) ? "V2GetMobile": "V2Get")](formId).then(function(formJson){
					return formJson.data.form;
				});
			}
		}).then(function(form){
			var formText = (form) ? MWF.decodeJsonString(form.data) : "";
			return (formText) ? JSON.decode(formText): null;
		});

		var taskPromise = action.TaskAction.get(data.id).then(function(json){
			return json.data;
		});

		return Promise.all([formPromise, taskPromise]);
	},
	editTask: function(e, data, action){
		this.getFormData(data).then(function(dataArr){
			var form = dataArr[0];
			var task = dataArr[1];
			if (form.json.submitFormType === "select") {
				this.processWork_custom();
			} else if (form.json.submitFormType === "script") {
				this.processWork_custom();
			} else {
				if (form.json.mode == "Mobile") {
					setTimeout(function () {
						this.processWork_mobile();
					}.bind(this), 100);
				} else {
					this.processWork_pc(task, form, action);
				}
			}
		}.bind(this));
	},
	processWork_pc: function(task, form, action) {
		var _self = this;

		var setSize = function (notRecenter) {
			var dlg = this;
			if (!dlg || !dlg.node) return;
			dlg.node.setStyle("display", "block");
			var size = processNode.getSize();
			dlg.content.setStyles({
				"height": size.y,
				"width": size.x
			});

			var s = dlg.setContentSize();
			if (!notRecenter) dlg.reCenter();
		}

		var processNode = new Element("div.processNode").inject(this.content);
		this.setProcessNode(task, form, processNode, "process", function (processor) {
			this.processDlg = o2.DL.open({
				"title": this.lp.process,
				"style": form.json.dialogStyle || "user",
				"isResize": false,
				//"isClose": false,
				"content": processNode,
				"maskNode": this.app.content,
				"positionHeight": 800,
				"maxHeight": 800,
				"maxHeightPercent": "98%",
				"minTop": 5,
				"width": "auto", //processNode.retrieve("width") || 1000, //600,
				"height": "auto", //processNode.retrieve("height") || 401,
				"buttonList": [
					{
						"type": "ok",
						"text": MWF.LP.process.button.ok,
						"action": function (d, e) {
							if (this.processor) this.processor.okButton.click();
						}.bind(this)
					},
					{
						"type": "cancel",
						"text": MWF.LP.process.button.cancel,
						"action": function () {
							this.processDlg.close();
							if (this.processor) this.processor.destroy();
							_self.app.content.unmask();
						}.bind(this)
					}
				],
				"onPostLoad": function () {
					processor.options.mediaNode = this.content;
					setSize.call(this)
				}
			});

		}.bind(this), function () {
			if (this.processDlg) setSize.call(this.processDlg, true)
		}.bind(this), "", action);
	},
	setProcessNode: function (task, form, processNode, style, postLoadFun, resizeFun, defaultRoute, action) {
		var _self = this;
		MWF.xDesktop.requireApp("process.Work", "Processor", function () {
			var mds = [];
			var innerNode;
			if (layout.mobile) {
				innerNode = new Element("div").inject(processNode);
			}
			this.processor = new MWF.xApplication.process.Work.Processor(innerNode || processNode, task, {
				"style": (layout.mobile) ? "mobile" : (style || "default"),
				"tabletWidth": form.json.tabletWidth || 0,
				"tabletHeight": form.json.tabletHeight || 0,
				"onPostLoad": function () {
					if (postLoadFun) postLoadFun(this);
					_self.fireEvent("afterLoadProcessor", [this]);
				},
				"onResize": function () {
					if (resizeFun) resizeFun();
				},
				"onCancel": function () {
					processNode.destroy();
					_self.app.content.unmask();
					delete this;
				},
				"onSubmit": function (routeName, opinion, medias, appendTaskIdentityList, processorOrgList, callbackBeforeSave) {
					if (!medias || !medias.length) {
						medias = mds;
					} else {
						medias = medias.concat(mds)
					}
					var method = action || "submitTask";
					_self[method](routeName, opinion, medias, task);
				}
			});
		}.bind(this));
	},
	submitTask: function(routeName, opinion, medias, task){
		if (!opinion) opinion = routeName;

		task.routeName = routeName;
		task.opinion = opinion;

		var mediaIds = [];
		if (medias.length){
			medias.each(function(file){
				var formData = new FormData();
				formData.append("file", file);
				formData.append("site", "$mediaOpinion");
				this.action.AttachmentAction.upload(task.work, formData, file, function(json){
					mediaIds.push(json.data.id);
				}.bind(this), null, false);
			}.bind(this));
		}
		if (mediaIds.length) task.mediaOpinion = mediaIds.join(",");

		this.action.TaskAction.processing(task.id, task, function(json){
			if (this.processor) this.processor.destroy();
			if (this.processDlg) this.processDlg.close();
			this.app.content.unmask();
			this.refresh();
			this.addMessage(json.data, task);
		}.bind(this));
	},
	getMessageContent: function (data, task, maxLength, titlelp) {
		var content = "";
		var lp = this.lp;
		if (data.completed) {
			content += lp.workCompleted;
		} else {
			if (data.occurSignalStack) {
				if (data.signalStack && data.signalStack.length) {
					var activityUsers = [];
					data.signalStack.each(function (stack) {
						var idList = [];
						if (stack.splitExecute) {
							idList = stack.splitExecute.splitValueList || [];
						}
						if (stack.manualExecute) {
							idList = stack.manualExecute.identities || [];
						}
						var count = 0;
						var ids = [];
						idList.each( function(i){
							var cn = o2.name.cn(i);
							if( !ids.contains( cn ) ){
								ids.push(cn)
							}
						});
						if (ids.length > 8) {
							count = ids.length;
							ids = ids.slice(0, 8);
						}
						ids = o2.name.cns(ids);

						var t = "<b>" + lp.nextActivity + "</b><span style='color: #ea621f'>" + stack.name + "</span>；<b>" + lp.nextUser + "</b><span style='color: #ea621f'>" + ids.join(",") + "</span> <b>" + ((count) ? "," + lp.next_etc.replace("{count}", count) : "") + "</b>";
						activityUsers.push(t);
					}.bind(this));
					content += activityUsers.join("<br>");
				} else {
					content += lp.processTaskCompleted;
				}
			} else {
				if (data.properties.nextManualList && data.properties.nextManualList.length) {
					var activityUsers = [];
					data.properties.nextManualList.each(function (a) {
						var ids = [];
						a.taskIdentityList.each(function (i) {
							var cn = o2.name.cn(i);
							if( !ids.contains( cn ) ){
								ids.push(cn)
							}
						});
						var t = "<b>" + lp.nextActivity + "</b><span style='color: #ea621f'>" + a.activityName + "</span>；<b>" + lp.nextUser + "</b><span style='color: #ea621f'>" + ids.join(",") + "</span>";
						activityUsers.push(t);
					});
					content += activityUsers.join("<br>");
				} else {
					if (data.arrivedActivityName) {
						content += lp.arrivedActivity + data.arrivedActivityName;
					} else {
						content += lp.processTaskCompleted;
					}

				}
			}
		}
		var title = task.title;
		if (maxLength && title.length > maxLength) {
			title = title.substr(0, maxLength) + "...";
		}
		return "<div>" + (titlelp || lp.taskProcessedMessage) + "“" + title + "”</div>" + content;
	},
	addMessage: function (data, task, notShowBrowserDkg) {
		if (layout.desktop.message) {
			var msg = {
				"subject": this.lp.taskProcessed,
				"content": this.getMessageContent(data, task, 0, this.lp.taskProcessedMessage)
			};
			layout.desktop.message.addTooltip(msg);
			return layout.desktop.message.addMessage(msg);
		} else {
			// if (this.app.inBrowser && !notShowBrowserDkg) {
			// 	this.inBrowserDkg(this.getMessageContent(data, 0, this.lp.taskProcessedMessage));
			// }
		}
	},

	selectTask: function(e, data){
		if (e.currentTarget.get("disabled").toString()!="true"){
			var itemNode = e.currentTarget.getParent(".listItem");
			var iconNode = e.currentTarget.getElement(".selectFlagIcon");

			if (itemNode){
				if (itemNode.hasClass("mainColor_bg_opacity")){
					itemNode.removeClass("mainColor_bg_opacity");
					iconNode.removeClass("o2icon-xuanzhong");
					iconNode.removeClass("selectFlagIcon_select");
					iconNode.removeClass("mainColor_color");
					this.unSelectedTask(data);
					this.showBatchAction();
				}else{
					itemNode.addClass("mainColor_bg_opacity");
					iconNode.addClass("o2icon-xuanzhong");
					iconNode.addClass("selectFlagIcon_select");
					iconNode.addClass("mainColor_color");
					this.selectedTask(data);
					this.showBatchAction(itemNode);
				}
				this.checkSelectTask();
			}
		}
	},
	checkSelectTask: function(){
		var _self = this;
		var nodes = this.app.listContentNode.getElements(".selectFlagArea");
		if (this.selectedTaskList && this.selectedTaskList.length){
			var data = this.selectedTaskList[0];
			nodes.each(function(node){
				var t = node.retrieve("task");
				if (t.activity !== data.activity){
					node.set("disabled", true);
					node.set("title", _self.lp.cannotSelectBatch);
					node.addClass("selectFlagArea_disabled");
				}
			});

		}else{
			nodes.set("disabled", false);
			nodes.set("title", this.lp.selectBatch);
			nodes.removeClass("selectFlagArea_disabled");
		}

	},
	showBatchAction: function(itemNode){
		if (this.selectedTaskList && this.selectedTaskList.length){
			if (!itemNode){
				var nodes = this.app.listContentNode.getElements(".listItem.mainColor_bg_opacity");
				if (nodes && nodes.length){
					itemNode = nodes[nodes.length-1];
				}
			}
			if (itemNode){
				this.batchAction.show();
				this.batchAction.position({
					"relativeTo": itemNode,
					"position": "centerBottom",
					"edge": "centerTop",
					"offset": {"y": 10}
				});
			}else{
				this.batchAction.hide();
			}
		}else{
			this.batchAction.hide();
		}
	},
	selectedTask: function(data){
		delete data._;
		if (!this.selectedTaskList) this.selectedTaskList = [];
		var idx = this.selectedTaskList.findIndex(function(t){
			return t.id == data.id;
		});
		if (idx===-1) this.selectedTaskList.push(data);
	},
	unSelectedTask: function(data){
		delete data._;
		if (!this.selectedTaskList) this.selectedTaskList = [];
		var idx = this.selectedTaskList.findIndex(function(t){
			return t.id == data.id;
		});
		if (idx!==-1) this.selectedTaskList.splice(idx, 1);
	},
	bindSelectData: function(e, data){
		delete data._;
		e.currentTarget.store("task", data);
	},
	batchProcessTask: function(e){
		if (this.selectedTaskList && this.selectedTaskList.length){
			var data = this.selectedTaskList[0];
			this.editTask(e, data, "batchSubmitTask")
		}
	},
	batchSubmitTask: function(routeName, opinion, medias){
		if (this.selectedTaskList && this.selectedTaskList.length){
			var p = [];
			this.selectedTaskList.forEach(function(task){
				if (!opinion) opinion = routeName;

				task.routeName = routeName;
				task.opinion = opinion;

				var mediaIds = [];
				if (medias.length){
					medias.each(function(file){
						var formData = new FormData();
						formData.append("file", file);
						formData.append("site", "$mediaOpinion");
						this.action.AttachmentAction.upload(task.work, formData, file, function(json){
							mediaIds.push(json.data.id);
						}.bind(this), null, false);
					}.bind(this));
				}
				if (mediaIds.length) task.mediaOpinion = mediaIds.join(",");

				p.push(this.action.TaskAction.processing(task.id, task, function(json){
					if (this.processor) this.processor.destroy();
					if (this.processDlg) this.processDlg.close();
					this.addMessage(json.data, task);
				}.bind(this)));
			}.bind(this));
			Promise.all(p).then(function(){
				this.app.content.unmask();
				this.refresh();
			}.bind(this));
		}
	},
});
MWF.xApplication.process.workcenter.TaskList = new Class({
	Extends: MWF.xApplication.process.workcenter.List
});
MWF.xApplication.process.workcenter.ReadList = new Class({
	Extends: MWF.xApplication.process.workcenter.List,
	options: {
		"itemHeight": 60,
		"type": "read"
	},
	loadData: function(){
		var _self = this;
		return this.action.ReadAction.listMyFilterPaging(this.page, this.size, this.filterList||{}).then(function(json){
			_self.fireEvent("loadData");
			_self.total = json.count;
			return json.data;
		}.bind(this));

		// var _self = this;
		// return this.action.ReadAction.listMyPaging(this.page, this.size).then(function(json){
		// 	_self.fireEvent("loadData");
		// 	_self.total = json.size;
		// 	return json.data;
		// }.bind(this));
	},
	loadItemFlag: function(e, data){
		var node = e.currentTarget;
		var iconNode = node.getElement(".listItemFlag");

		if (data.completed){
			iconNode.setStyle("background-image", "url("+"../x_component_process_workcenter/$Main/default/icons/pic_ok.png)");
			return true;
		}
		var start = new Date().parse(data.startTime);
		var now = new Date();
		if (now.getTime()-start.getTime()<86400000){
			iconNode.setStyle("background-image", "url("+"../x_component_process_workcenter/$Main/default/icons/pic_new.png)");
		}
	},
	setReadCompleted: function(e, data){
		if (data.item) data = data.item;
		var _self = this;
		var text = this.lp.setReadedConfirmContent.replace("{title}", data.title );
		var url = this.app.path+this.app.options.style+"/view/dlg/read.html";
		o2.loadHtml(url, {"bind": {"lp": this.lp, "readedConfirmContent": text}, "module": this}, function(o){
			var html = o2.bindJson(o[0].data, {"lp": this.lp, "readedConfirmContent": text});
			var p = o2.dlgPosition(e, this.app.content, 550, 260)
			var readDlg = o2.DL.open({
				"title": this.lp.setReadedConfirmTitle,
				"style": "user",
				"isResize": false,
				"height": "260",
				"width": "550",
				"top": p.y,
				"left": p.x,
				"fromTop": p.fromy,
				"fromLeft": p.fromx,
				"html": html,
				"maskNode": this.app.content,
				"minTop": 5,
				"buttonList": [
					{
						"type": "ok",
						"text": MWF.LP.process.button.ok,
						"action": function () {
							debugger;
							var opinion = this.content.getElement("textarea").get("value");
							_self.setReadAction(data, opinion);
							this.close();
						}
					},
					{
						"type": "cancel",
						"text": MWF.LP.process.button.cancel,
						"action": function () {
							this.close();
						}
					}
				]
			});
		}.bind(this));
	},
	setReadAction: function(data, opinion){
		this.action.ReadAction.processing(data.id, {"opinion": opinion}, function(){
			if (this.infoDlg) this.infoDlg.close();
			this.refresh();
		}.bind(this));
	},

	getReference: function(data){
		return this.action.ReadAction.reference(data.id).then(function(json){
			json.data.item = json.data.read;
			return json.data;
		});
	},
	openWorkInfo: function(e, data){
		// var p = e.target.getPosition(this.app.content);
		var infoContent = new Element("div");
		var url = this.app.path+this.app.options.style+"/view/dlg/processInfo.html";

		var _self = this;
		this.getReference(data).then(function(data){
			//data.workLog = json.data;
			infoContent.loadHtml(url, {"bind": {"lp": _self.lp, "type": _self.options.type, "data": data}, "module": _self});
		});
		this.infoDlg = o2.DL.open({
			// "top": p.y,
			// "left": p.x,
			"title": this.lp.processInfo,
			"style": "user",
			"isResize": true,
			"content": infoContent,
			"maskNode": this.app.content,
			"width": 800,
			"height": 720
		});
	},
	attachShowPersonLog: function(e, data){
		var inforNode = new Element("div.pf_workLogInfor");
		var html = "<div>"+o2.name.cn(data.person)+"</div>";
		if (data.completedTime){
			html += "<div>"+this.lp.opinion+": "+(data.opinion || data.routeName)+"</div>";
			html += "<div>"+this.lp.time+": "+data.completedTime.substring(0,16)+"</div>";
		}else{
			html += "<div style='color:red'>"+this.lp.processing+"</div>";
			html += "<div>"+this.lp.starttime+": "+data.startTime.substring(0,16)+"</div>";
		}
		inforNode.set("html", html);

		if (!Browser.Platform.ios){
			new mBox.Tooltip({
				content: inforNode,
				setStyles: {content: {padding: 15, lineHeight: 20}},
				attach: e.target,
				transition: 'flyin'
			});
		}
	},
	openWork: function(e, data){
		o2.api.form.openWork(data.id, "", data.title);
	},
	openJob: function(e, data){
		debugger;
		o2.api.form.openJob(data.item.job);
	},
	closeMoerLogPanel: function(logNode){
		if (logNode){
			logNode.removeClass("mainColor_bg_opacity");
			var workLogPanel = logNode.retrieve("workLogPanel");
			if (workLogPanel) workLogPanel.closePanel();
			logNode.store("workLogPanel", null);
		}
	},
	moreWorkLog: function(e, data){
		var logNode = e.target.getParent(".pf_logItem");
		this.closeMoerLogPanel(this.currentLogNode);

		var _self = this;
		var moreLogNode = new Element("div");
		var url = this.app.path+this.app.options.style+"/view/dlg/moreWorkLog.html";
		moreLogNode.loadHtml(url, {"bind": {"lp": _self.lp, "type": _self.options.type, "data": data}, "module": _self});

		var targetNode = e.target.getParent(".processInfoContent").getElement(".pf_workListArea");
		o2.require("o2.widget.Panel", function(){
			workLogPanel = new o2.widget.Panel(moreLogNode, {
				"style": "flat",
				"title": "",
				"width": 300,
				"height": 540,
				"isMove": false,
				"isClose": true,
				"isMax": false,
				"isExpand": false,
				"isResize": false,
				"target": targetNode,
				"duration": 0,
				"onPostLoad": function(){
					_self.currentLogNode = logNode.addClass("mainColor_bg_opacity");
				},
				"onQueryClose": function(){
					var node = _self.currentLogNode;
					_self.currentLogNode = null;
					if (node) _self.closeMoerLogPanel(node);

				}
			});
			logNode.store("workLogPanel", workLogPanel);
			workLogPanel.logNode = logNode;
			workLogPanel.load();
		});
	}
});
MWF.xApplication.process.workcenter.TaskCompletedList = new Class({
	Extends: MWF.xApplication.process.workcenter.ReadList,
	options: {
		"itemHeight": 60,
		"type": "taskCompleted"
	},
	getReference: function(data){
		return this.action.TaskCompletedAction.getReference(data.id).then(function(json){
			json.data.item = json.data.taskCompleted;
			return json.data;
		});
	},
	loadData: function(){
		var _self = this;
		return this.action.TaskCompletedAction.listMyFilterPaging(this.page, this.size, this.filterList||{}).then(function(json){
			_self.fireEvent("loadData");
			_self.total = json.count;
			return json.data;
		}.bind(this));
		// var _self = this;
		// return this.action.TaskCompletedAction.listMyPaging(this.page, this.size).then(function(json){
		// 	_self.fireEvent("loadData");
		// 	_self.total = json.size;
		// 	return json.data;
		// }.bind(this));
	}
});
MWF.xApplication.process.workcenter.ReadCompletedList = new Class({
	Extends: MWF.xApplication.process.workcenter.ReadList,
	options: {
		"itemHeight": 60,
		"type": "readCompleted"
	},
	getReference: function(data){
		return this.action.ReadCompletedAction.getReference(data.id).then(function(json){
			json.data.item = json.data.readCompleted;
			return json.data;
		});
	},
	loadData: function(){
		var _self = this;
		return this.action.ReadCompletedAction.listMyFilterPaging(this.page, this.size, this.filterList||{}).then(function(json){
			_self.fireEvent("loadData");
			_self.total = json.count;
			return json.data;
		}.bind(this));
		// var _self = this;
		// return this.action.ReadCompletedAction.listMyPaging(this.page, this.size).then(function(json){
		// 	_self.fireEvent("loadData");
		// 	_self.total = json.size;
		// 	return json.data;
		// }.bind(this));
	}
});
MWF.xApplication.process.workcenter.DraftList = new Class({
	Extends: MWF.xApplication.process.workcenter.ReadList,
	options: {
		"itemHeight": 60,
		"type": "draft"
	},
	loadData: function(){
		// var _self = this;
		// return this.action.DraftAction.listMyFilterPaging(this.page, this.size, this.filterList||{}).then(function(json){
		// 	_self.fireEvent("loadData");
		// 	_self.total = json.count;
		// 	return json.data;
		// }.bind(this));
		this.app.filterActionNode.hide();
		var _self = this;
		return this.action.DraftAction.listMyPaging(this.page, this.size, {}).then(function(json){
			_self.fireEvent("loadData");
			_self.total = json.size;
			return json.data;
		}.bind(this));
	},
	openTask: function(e, data){
		var options = {"draftId": data.id, "appId": "process.Work"+data.id,
			"onPostClose": function(){
				if (this.refresh) this.refresh();
			}.bind(this)
		};
		this.app.desktop.openApplication(e, "process.Work", options);
	}
});
