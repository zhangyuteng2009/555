o2.widget = o2.widget || {};
o2.widget.Calendar = o2.Calendar = new Class({
	Implements: [Options, Events],
	Extends: o2.widget.Common,
	options: {
		"style": "default",
		"path": o2.session.path+"/widget/$Calendar/" ,

		"defaultView": "day", //day, month, year
		"baseDate": new Date(),
		"secondEnable" : false,
		"timeSelectType" : "slider",
		"isTime": false,
		"isMulti": false,
		"before": null,
		"after": null,
		"timeOnly": false,
		"yearOnly" : false,
		"monthOnly": false,
		"defaultDate": new Date(),

		"beforeCurrent": true,
		"clearEnable": true,

		"range": false,
		"rangeNodes": [],
		"rangeRule": "asc",  //asc + ,  des -
		"target": null
	},
	initialize: function(node, options){
		Locale.use("zh-CHS");
		this.setOptions(options);
		this.options.defaultTime = ""+this.options.baseDate.getHours()+":"+this.options.baseDate.getMinutes()+":"+this.options.baseDate.getSeconds();

		this.path = o2.session.path+"/widget/$Calendar/";
		this.cssPath = o2.session.path+"/widget/$Calendar/"+this.options.style+"/css.wcss";

		this._loadCss();
		//	this.options.containerPath = this.path+this.style+"/container.html";
		//	this.options.dayPath = this.path+this.style+"/day.html";
		//	this.options.monthPath = this.path+this.style+"/month.html";
		//	this.options.yearPath = this.path+this.style+"/year.html";
		//	this.options.timePath = this.path+this.style+"/time.html";

		if (!this.options.format){
			if (this.options.isTime){
				//this.options.format = Locale.get("Date").shortDate + " " + Locale.get("Date").shortTime;
				if(this.options.timeOnly){
					this.options.format="%H:%M";
				}
				else{
					this.options.format = Locale.get("Date").shortDate + " " + "%H:%M";
				}
			}else{
				this.options.format = Locale.get("Date").shortDate;
			}
		}

		this.options.containerPath = this.options.path+this.options.style+"/container.html";
		this.options.dayPath = this.options.path+this.options.style+"/day.html";
		this.options.monthPath = this.options.path+this.options.style+"/month.html";
		this.options.yearPath = this.options.path+this.options.style+"/year.html";
		this.options.timePath = this.options.path+this.options.style+"/time.html";

		this.today = new Date();

		this.currentView = this.options.defaultView;

		this.node = $(node);

		this.visible = false;



		this.container = this.createContainer();


		this.container.inject((this.options.target) || $(document.body));

		this.contentTable = this.createContentTable();
		this.contentTable.inject(this.contentDateNode);

		this.addEvents();
		this.container.set({
			styles: {
				"display": "none",
				"opacity": 1
			}
		});
		this.fireEvent("init");

		//this.move = true;
		//this.containerDrag = new Drag.Move(this.container);

		if( layout.mobile ){
			this.maskNode = new Element("div.maskNode",{
				styles : {
					"width": "100%",
					"height": "100%",
					"opacity": 0.6,
					"position": "absolute",
					"background-color": "#CCC",
					"top": "0px",
					"left": "0px",
					"z-index" : 150,
					"-webkit-user-select": "none",
					"-moz-user-select": "none",
					"user-select" : "none"
				},
				events : {
					"touchmove" : function(ev){
						ev.stopPropagation();
						ev.preventDefault();
					}
				}
			}).inject((this.options.target) || $(document.body));
			this.container.addEvents({
				"touchmove" : function(ev){
					ev.stopPropagation();
					ev.preventDefault();
				},
				"touchend" : function(ev){
					ev.stopPropagation();
					//ev.preventDefault();
				}
			})
		}

	},
	addEvents: function(){
		this.node.addEvent("focus", function(){
			this.show();
		}.bind(this));
		this.node.addEvent("click", function(){
			this.show();
		}.bind(this));

		this.prevNode.addEvent("click", function(){
			this.getPrev();
		}.bind(this));

		this.nextNode.addEvent("click", function(){
			this.getNext();
		}.bind(this));

		this.currentTextNode.addEvent("click", function(){
			this.changeView();
		}.bind(this));

		if( !layout.mobile ){
			this.titleNode.addEvent("mousedown", function(){
				this.move();
			}.bind(this));
			this.titleNode.addEvent("mouseup", function(){
				this.unmove();
			}.bind(this));
		}

		document.addEvent('mousedown', this.outsideClick.bind(this));
	},

	move: function(){
		this.containerDrag = new Drag.Move(this.container, {
			"onDrag": function(e){
				if (this.iframe){
					var p = this.container.getPosition();
					this.iframe.setStyles({
						"top": ""+p.y+"px",
						"left": ""+p.x+"px"
					});
				}
			}.bind(this)
		});
	},
	unmove: function(){
		this.container.removeEvents("mousedown");
		this.titleNode.addEvent("mousedown", function(){
			this.move();
		}.bind(this));
	},

	changeView: function(){
		var view = "day";
		switch (this.currentView) {
			case "day" :
				this.changeViewToMonth();
				break;
			case "month" :
				this.changeViewToYear();
				break;
			case "year" :
				if( this.options.yearOnly ){
					break;
				}else if( this.options.monthOnly ){
					this.changeViewToMonth();
				}else{
					this.changeViewToDay();
				}
				break;
			case "time" :
				this.changeViewToDay();
				//this.changeViewToDay();
				break;
			default :
			//nothing;
		}
	},
	changeViewToMonth: function(year){
		this.currentView = "month";

		if (!this.contentMonthTable){
			this.contentMonthTable = this.createContentTable();
			this.contentMonthTable.inject(this.contentDateNode);
		}
		if (this.contentTable) this.contentTable.setStyle("display", "none");
		if (this.contentYearTable) this.contentYearTable.setStyle("display", "none");
		if (this.contentTimeTable) this.contentTimeTable.setStyle("display", "none");
		//	if (this.contentMonthTable) this.contentMonthTable.setStyle("display", "block");
		if (this.contentMonthTable) this.contentMonthTable.setStyle("display", "table");

		var year = (year!=undefined) ? year : this.currentTextNode.retrieve("year");
		var month = this.currentTextNode.retrieve("month");

		this.showMonth(year, month);
		this.fireEvent("changeViewToMonth");
	},
	changeViewToYear: function(year){
		this.currentView = "year";

		if (!this.contentYearTable){
			this.contentYearTable = this.createContentTable();
			this.contentYearTable.inject(this.contentDateNode);
		}
		if (this.contentTable) this.contentTable.setStyle("display", "none");
		if (this.contentMonthTable) this.contentMonthTable.setStyle("display", "none");
		if (this.contentTimeTable) this.contentTimeTable.setStyle("display", "none");
		//	if (this.contentYearTable) this.contentYearTable.setStyle("display", "block");
		if (this.contentYearTable) this.contentYearTable.setStyle("display", "table");

		this.showYear(year);
		this.fireEvent("changeViewToYear");
	},
	changeViewToDay: function(year, month){
		this.currentView = "day";

		if (!this.contentTable){
			this.contentTable = this.createContentTable();
			this.contentTable.inject(this.contentDateNode);
		}

		if (this.contentMonthTable) this.contentMonthTable.setStyle("display", "none");
		if (this.contentYearTable) this.contentYearTable.setStyle("display", "none");
		if (this.contentTimeTable) this.contentTimeTable.setStyle("display", "none");
		//	if (this.contentTable) this.contentTable.setStyle("display", "block");
		if (this.contentTable) this.contentTable.setStyle("display", "table");

		this.showDay(year, month);

		this.showMonthYearButton();

		this.fireEvent("changeViewToDay");
	},
	hideMonthYearButton : function(){
		if(this.clearButton_month){
			this.clearButton_month.hide();
		}
	},
	showMonthYearButton : function(){
		if( this.options.clearEnable && this.buttonArea && !this.clearButton_month ){
			this.container.setStyle("height","auto");
			this.clearButton_month = new Element("div", {"text": o2.LP.widget.clear }).inject(this.buttonArea);
			this.clearButton_month.addEvent("click", function(){
				var t = this.node.get("value");
				this.node.set("value", "");
				if( t )this.fireEvent("change");
				this.fireEvent("clear");
				this.hide();
			}.bind(this));
			this.clearButton_month.setStyles(this.css.calendarMonthActionButton);
		}
		if(this.clearButton_month){
			this.clearButton_month.show();
		}
	},
	getNext: function(){
		switch (this.currentView) {
			case "time" :
				this.getNextDate();
				break;
			case "day" :
				this.getNextDay();
				break;
			case "month" :
				this.getNextMonth();
				break;
			case "year" :
				this.getNextYear();
				break;
			default :
			//nothing
		}
	},

	getPrev: function(){
		switch (this.currentView) {
			case "time" :
				this.getPrevDate();
				break;
			case "day" :
				this.getPrevDay();
				break;
			case "month" :
				this.getPrevMonth();
				break;
			case "year" :
				this.getPrevYear();
				break;
			default :
			//nothing
		}
	},
	getNextDate: function(){
		var date = this.currentTextNode.retrieve("date");
		// var year = this.currentTextNode.retrieve("year");
		// var month = this.currentTextNode.retrieve("month");
		// month--;
		// var day = this.currentTextNode.retrieve("day");
		// var date = new Date(year, month, day);
		date.increment("day", 1);
		this._setTimeTitle(null, date);
	},
	getPrevDate: function(){
		var date = this.currentTextNode.retrieve("date");
		date.increment("day", -1);
		this._setTimeTitle(null, date);
	},
	getNextDay: function(){
		var year = this.currentTextNode.retrieve("year");
		var month = this.currentTextNode.retrieve("month");
		month--;
		var date = new Date(year, month, 1);
		date.increment("month", 1);

		var thisYear = date.getFullYear();
		var thisMonth = date.getMonth();

		this._setDayTitle(null, thisYear, thisMonth);
		this._setDayDate(null,thisYear, thisMonth);

		this.fireEvent("changeViewToDay");
	},

	getPrevDay: function(){
		var year = this.currentTextNode.retrieve("year");
		var month = this.currentTextNode.retrieve("month");
		month--;
		var date = new Date(year, month, 1);
		date.increment("month", -1)

		var thisYear = date.getFullYear();
		var thisMonth = date.getMonth();

		this._setDayTitle(null, thisYear, thisMonth);
		this._setDayDate(null,thisYear, thisMonth);
		this.fireEvent("changeViewToDay");
	},

	getNextMonth: function(){
		var year = this.currentTextNode.retrieve("year");
		var date = new Date(year, 1, 1);
		date.increment("year", 1)

		var thisYear = date.getFullYear();

		this.showMonth(thisYear);
		this.fireEvent("changeViewToMonth");
	},
	getPrevMonth: function(){
		var year = this.currentTextNode.retrieve("year");
		var date = new Date(year, 1, 1);
		date.increment("year", -1)

		var thisYear = date.getFullYear();

		this.showMonth(thisYear);
		this.fireEvent("changeViewToMonth");
	},
	getNextYear: function(){
		var year = this.currentTextNode.retrieve("year");
		var date = new Date(year, 1, 1);
		date.increment("year", this.yearLength)

		var thisYear = date.getFullYear();

		this.showYear(thisYear);
		this.fireEvent("changeViewToYear");
	},
	getPrevYear: function(){
		var year = this.currentTextNode.retrieve("year");
		var date = new Date(year, 1, 1);

		date.increment("year", 0-this.yearLength)

		var thisYear = date.getFullYear();

		this.showYear(thisYear);
		this.fireEvent("changeViewToYear");
	},

	outsideClick: function(e) {
		if(this.visible) {
			var elementCoords = this.container.getCoordinates();
			var targetCoords  = this.node.getCoordinates();
			var page = e.page;
			if (layout.userLayout && layout.userLayout.scale && layout.userLayout.scale!==1){
				page.x = page.x/layout.userLayout.scale;
				page.y = page.y/layout.userLayout.scale;
			}
			if(((page.x < elementCoords.left || page.x > (elementCoords.left + elementCoords.width)) ||
				(page.y < elementCoords.top || page.y > (elementCoords.top + elementCoords.height))) &&
				((page.x < targetCoords.left || page.x > (targetCoords.left + targetCoords.width)) ||
					(page.y < targetCoords.top || page.y > (targetCoords.top + targetCoords.height))) ) this.hide();
		}
	},

	hide: function(){
		if (this.visible){
//			if (!this.morph){
//				this.morph = new Fx.Morph(this.container, {"duration": 200});
//			}
			this.visible = false;
			//		this.changeViewToDay();
//			this.morph.start({"opacity": 0}).chain(function(){
			this.container.setStyle("display", "none");
			if (this.iframe) this.iframe.destroy();
			if (layout.desktop.offices){
				Object.each(layout.desktop.offices, function(office){
					office.show();
				});
			}
			if( this.maskNode ){
				this.maskNode.hide();
			}
//			}.bind(this));
			this.fireEvent("hide");
		}
	},
	show: function(){
		if (!this.visible){
			var dStr = this.node.get("value");
			if (dStr && Date.isValid(dStr)){
				this.options.baseDate = Date.parse(dStr.substr(0,10));
			}
			if(this.options.timeOnly){
				this.currentView = "time";
			}
			else{
				this.currentView = this.options.defaultView;
			}

			switch (this.currentView) {
				case "day" :
					this.changeViewToDay();
					break;
				case "month" :
					//this.showMonth();
					this.changeViewToMonth();
					break;
				case "year" :
					if( this.options.yearOnly ){
						this.changeViewToYear()
					}else{
						this.showYear();
					}
					break;
				case "time" :
					//this.showTime(this.options.baseDate);
					this.changeViewToTime(this.options.defaultDate);
					//this.changeViewToTime(this.options.baseDate);
					break;
				default :
					this.showDay();
			}

//			if (!this.morph){
//				this.morph = new Fx.Morph(this.container, {"duration": 200});
//			}
			this.container.setStyle("display", "block");

			this.setPosition();
			// var p = this.container.getPosition();
			// var s = this.container.getSize();
			// var zidx = this.container.getStyle("z-index");
			// this.iframe = new Element("iframe", {"styles":{
			//     "border": "0px",
			//     "margin": "0px",
			//     "padding": "0px",
			//     "opacity": 0,
			// "z-index": (zidx) ? zidx-1 : 0,
			// "top": ""+p.y+"px",
			//     "left": ""+p.x+"px",
			//     "width": ""+s.x+"px",
			//     "height": ""+s.y+"px",
			// "position": "absolute"
			// }}).inject(this.container, "before");

			if (layout.desktop.offices){
				Object.each(layout.desktop.offices, function(office){
					if (this.container.isOverlap(office.officeNode)){
						office.hide();
					}
				}.bind(this));
			}
			if( this.maskNode ){
				this.maskNode.show();
			}

//			this.morph.start({"opacity": 1}).chain(function(){
			this.visible = true;
//			}.bind(this));
			this.fireEvent("show");
		}
	},
	setPosition: function(){
		if (this.container.position && (!layout || !layout.userLayout || !layout.userLayout.scale || layout.userLayout.scale===1) ){
			var postY = "bottom";
			var postX = "left";
			this.container.position({
				relativeTo: this.node,
				position: 'bottomLeft',
				edge: 'upperLeft'
			});
			//               var offsetPNode = this.node.getOffsetParent();

			var cp = this.container.getPosition(this.options.target || null);
			var cSize = this.container.getSize();
			//var fp = (this.options.target) ? this.options.target.getPosition() : $(document.body).getPosition()
			var fsize = (this.options.target) ? this.options.target.getSize() : $(document.body).getSize();

			//if (cp.y+cSize.y>fsize.y+fp.y){
			if (cp.y+cSize.y>fsize.y){
				// this.container.position({
				// 	relativeTo: this.node,
				// 	position: 'upperLeft',
				// 	edge: 'bottomLeft'
				// });
				postY = "upper";
			}

			if( cp.x+cSize.x>fsize.x ){
				postX = "right";
			}

			if( postY === "upper" && postX === "left" ){
				this.container.position({
					relativeTo: this.node,
					position: 'upperLeft',
					edge: 'bottomLeft'
				});
			}else if( postX === "right" ){
				if( postY === "bottom" ){
					this.container.position({
						relativeTo: this.node,
						position: 'bottomRight',
						edge: 'upperRight'
					});
				}else{
					this.container.position({
						relativeTo: this.node,
						position: 'upperRight',
						edge: 'bottomRight'
					});
				}
			}
			this.postY = postY;
			this.postX = postX;
		}else{
			var p = this.node.getPosition(this.options.target || null);
			var size = this.node.getSize();
			var containerSize = this.container.getSize();
			var bodySize = (this.options.target) ? this.options.target.getSize() : $(document.body).getSize(); //$(document.body).getSize();

			var left = p.x;
			if ((left + containerSize.x + 40) > bodySize.x){
				left = bodySize.x - containerSize.x - 40;
			}

			var top = p.y+size.y+2;
			if( top + containerSize.y > bodySize.y ){
				top = bodySize.y - containerSize.y ;
			}

			this.container.setStyle("top", top);
			this.container.setStyle("left", left);

		}
	},
	showYear: function(year){
		var thisYear = (year!=undefined) ? year : this.options.baseDate.getFullYear();

		var date = new Date(thisYear, 1, 1);
		date.increment("year", -2);
		var beginYear = date.getFullYear();
		date.increment("year", this.yearLength-1);
		var endYear = date.getFullYear();

		this._setYearTitle(null, beginYear, endYear, thisYear);
		this._setYearDate(null, beginYear, endYear, thisYear);

		this.showMonthYearButton();

		//	if (!this.move){
		//		this.move = true;
		//		this.containerDrag = new Drag.Move(this.container);
		//	}
	},
	_setYearTitle:function(node, beginYear, endYear, thisYear){
		var thisNode = node || this.currentTextNode;
		thisNode.set("text", beginYear+"-"+endYear);
		thisNode.store("year", thisYear);
	},
	_setYearDate: function(table, beginYear, endYear, year){
		var yearTable = table || this.contentYearTable;

		var thisYear = (year!=undefined) ? year : this.options.baseDate.getFullYear();

		var tbody = yearTable.getElement("tbody");
		var tds = tbody.getElements("td");

		tds.each(function(item, idx){
			var y = beginYear+idx;
			item.set("text", y);
			item.store("year", y);
			if (y==this.options.baseDate.getFullYear()){
				item.addClass("current_"+this.options.style);
			}else{
				item.removeClass("current_"+this.options.style);
			}
		}.bind(this));
	},
	showMonth: function(year, month){
		var thisYear = (year!=undefined) ? year : this.options.baseDate.getFullYear();
		var thisMonth = (month!=undefined) ? month : this.options.baseDate.getMonth();

		this._setMonthTitle(null, thisYear, thisMonth);
		this._setMonthDate(null, thisYear, thisMonth);

		this.showMonthYearButton();

		//	if (!this.move){
		//		this.move = true;
		//		this.containerDrag = new Drag.Move(this.container);
		//	}
	},
	_setMonthTitle:function(node, year){
		var thisYear = (year!=undefined) ? year : this.options.baseDate.getFullYear();
		var thisNode = node || this.currentTextNode;
		thisNode.set("text", thisYear);
		thisNode.store("year", thisYear);
	},
	_setMonthDate: function(table, year, month){
		//var months = Locale.get("Date").months;
		var months = o2.LP.widget.months;
		var monthTable = table || this.contentMonthTable;

		var thisYear = (year!=undefined) ? year : this.options.baseDate.getFullYear();
		var thisMonth = (month!=undefined) ? month : this.options.baseDate.getMonth();

		var tbody = monthTable.getElement("tbody");
		var tds = tbody.getElements("td");

		tds.each(function(item, idx){
			item.set("text", months[idx].substr(0,2));
			item.store("year", thisYear);
			item.store("month", idx);
			if ((thisYear==this.options.baseDate.getFullYear()) && (idx==this.options.baseDate.getMonth())){
				item.addClass("current_"+this.options.style);
			}else{
				item.removeClass("current_"+this.options.style);
			}
		}.bind(this));
	},

	showDay: function(year, month){
		this._setDayTitle(null, year, month);
		this._setDayWeekTitleTh();
		this._setDayDate(null, year, month);

		//	if (!this.move){
		//		this.move = true;
		//		this.containerDrag = new Drag.Move(this.container);
		//	}
	},
	_setDayTitle: function(node, year, month){
		var thisYear = (year!=undefined) ? year : this.options.baseDate.getFullYear();
		var thisMonth = (month!=undefined) ? month : this.options.baseDate.getMonth();
		thisMonth++;

		var text = thisYear+ o2.LP.widget.year +thisMonth+ o2.LP.widget.month;
		var thisNode = node || this.currentTextNode;
		thisNode.set("text", text);

		thisNode.store("year", thisYear);
		thisNode.store("month", thisMonth);
	},
	_setDayDate: function(table, year, month){
		var dayTable = table || this.contentTable;
		var baseDate = this.options.baseDate;
		if ((year!=undefined) && (month!=undefined)){
			baseDate = new Date();
			baseDate.setDate(1);
			baseDate.setFullYear(year);
			baseDate.setMonth(month);
		}

		var tbody = dayTable.getElement("tbody");
		var tds = tbody.getElements("td");

		var firstDate = baseDate.clone();
		firstDate.setDate(1);
		var day = firstDate.getDay();

		var tmpDate = firstDate.clone();
		for (var i=day-1; i>=0; i--){
			tmpDate.increment("day", -1);
			tds[i].set("text", tmpDate.getDate());
			tds[i].addClass("gray_"+this.options.style);
			tds[i].setStyles(this.css["gray_"+this.options.style]);
			tds[i].store("dateValue", tmpDate.toString())
		}

		for (var i=day; i<tds.length; i++){
			tds[i].set("text", firstDate.getDate());
			if (firstDate.toString() == this.options.baseDate.toString()){
				tds[i].addClass("current_"+this.options.style);
				tds[i].setStyles(this.css["current_"+this.options.style]);
				tds[i].removeClass("past_"+this.options.style);
				tds[i].removeClass("gray_"+this.options.style);
				tds[i].setStyle("border", "1px solid #FFF");
			}else if (firstDate.getMonth()!=baseDate.getMonth()){
				tds[i].addClass("gray_"+this.options.style);
				tds[i].setStyles(this.css["gray_"+this.options.style]);
				tds[i].removeClass("current_"+this.options.style);
				tds[i].removeClass("past_"+this.options.style);
				tds[i].setStyle("border", "1px solid #FFF");
			}else{
				tds[i].setStyles(this.css["normal_"+this.options.style]);
				tds[i].removeClass("current_"+this.options.style);
				tds[i].removeClass("gray_"+this.options.style);
				tds[i].removeClass("past_"+this.options.style);
				tds[i].setStyle("border", "1px solid #FFF");
			}
			var tmp = firstDate.clone();
			if (tmp.clearTime().toString() == this.today.clearTime().toString()){
				tds[i].addClass("today_"+this.options.style);
				tds[i].removeClass("past_"+this.options.style);
				tds[i].setStyles(this.css["today_"+this.options.style]);
				tds[i].setStyle("border", "0px solid #AAA");
			}
			if (tmp.diff(this.today)>0){
				if (this.css["past_"+this.options.style]) tds[i].setStyles(this.css["past_"+this.options.style]);
				tds[i].addClass("past_"+this.options.style);
			}


			tds[i].store("dateValue", firstDate.toString())
			firstDate.increment("day", 1);
		}
	},

	changeViewToTime: function(date){
		this.currentView = "time";

		if (!this.contentTimeTable){
			this.contentTimeTable = this.createContentTable();
			this.contentTimeTable.inject(this.contentDateNode);
		}
		if (this.contentTable) this.contentTable.setStyle("display", "none");
		if (this.contentYearTable) this.contentYearTable.setStyle("display", "none");
		if (this.contentMonthTable) this.contentMonthTable.setStyle("display", "none");
		if (this.contentTimeTable) this.contentTimeTable.setStyle("display", "block");
		//	if (this.contentTimeTable) this.contentTimeTable.setStyle("display", "table");

		var thisDate = date || this.options.baseDate;

		this.showTime(thisDate);

		this.hideMonthYearButton();
	},

	showTime: function(date){
		var thisHour = (date || this.options.baseDate).getHours();
		var thisMinutes = (date || this.options.baseDate).getMinutes();
		var thisSeconds = (date || this.options.baseDate).getSeconds();
		// var times = this.options.defaultTime.split(":");
		//
		// var thisHour = (times[0]) ? times[0] : "0";
		// var thisMinutes = (times[1]) ? times[1] : "0";
		// var thisSeconds = (times[2]) ? times[2] : "0";

		this._setTimeTitle(null, date);

		if( this.options.style.indexOf("mobile") > -1 ){
			this._setTimeDate_mobile(null, thisHour, thisMinutes, thisSeconds);
		}else{
			this._setTimeDate(null, thisHour, thisMinutes, thisSeconds);
		}


		//	if (this.move){
		//		this.move = false;
		//		this.container.removeEvents("mousedown");
		//	}
	},

	_setTimeTitle: function(node, date){
		var thisDate = date || this.options.baseDate;
		var thisNode = node || this.currentTextNode;

		var y = thisDate.getFullYear();
		var m = thisDate.getMonth()+1;
		var d = thisDate.getDate();
		var text = "" + y + o2.LP.widget.year + m + o2.LP.widget.month + d + o2.LP.widget.date;

		if (this.options.timeOnly){
			thisNode.hide();
			if (this.prevNode) this.prevNode.hide();
			if (this.nextNode) this.nextNode.hide();
		}
		thisNode.set("text", text);
		thisNode.store("date", date);
	},
	_setTimeDate_mobile: function(node, h, m, s){
		var _self = this;

		this.itmeHNode = this.contentTimeTable.getElement(".MWF_calendar_time_h");
		this.itmeMNode = this.contentTimeTable.getElement(".MWF_calendar_time_m");
		this.itmeSNode = this.contentTimeTable.getElement(".MWF_calendar_time_s");


		this.showActionNode = this.contentTimeTable.getElement(".MWF_calendar_action_show");

		var calendar = this;

		if( !this.hMobileSelect ){
			for( var i=0; i<24; i++ ){
				new Element("div",{
					"text" : this.addZero(i, 2 ),
					"styles" : this.css.calendarTimeSelectItem_mobile
				}).inject( this.itmeHNode );
			}
			this.selectedHour = this.addZero(h, 2 );
			this.hMobileSelect = new o2.Calendar.MobileSelect( this.itmeHNode.getParent(), {
				"lineHeight" : 40,
				"itemSize" : 24,
				"itemIndex" : parseInt(h),
				"onChange": function(value){
					this.selectedHour = this.addZero(value, 2 );
					//this.showHNode.set("text", this.addZero(i, 2 ));
					//this.itmeHNode.getFirst().set("text", this.addZero(i, 2 ));
				}.bind(this)
			});
			this.hMobileSelect.load();
		}

		if( !this.mMobileSelect ) {
			for (var i = 0; i < 60; i++) {
				new Element("div", {
					"text": this.addZero(i, 2),
					"styles": this.css.calendarTimeSelectItem_mobile
				}).inject(this.itmeMNode);
			}
			this.selectedMinute = this.addZero(m, 2);
			this.mMobileSelect = new o2.Calendar.MobileSelect(this.itmeMNode.getParent(), {
				"lineHeight": 40,
				"itemSize": 60,
				"itemIndex": parseInt(m),
				"onChange": function (value) {
					this.selectedMinute = this.addZero(value, 2);
					//this.showHNode.set("text", this.addZero(i, 2 ));
					//this.itmeHNode.getFirst().set("text", this.addZero(i, 2 ));
				}.bind(this)
			});
			this.mMobileSelect.load();
		}

		if(this.options.secondEnable ){
			if(!this.sMobileSelect){
				for( var i=0; i<60; i++ ){
					new Element("div",{
						"text" : this.addZero(i, 2 ),
						"styles" : this.css.calendarTimeSelectItem_mobile
					}).inject( this.itmeSNode );
				}
				this.selectedSecond = this.addZero(s, 2 );
				this.sMobileSelect = new o2.Calendar.MobileSelect( this.itmeSNode.getParent(), {
					"lineHeight" : 40,
					"itemSize" : 60,
					"itemIndex" : parseInt(s),
					"onChange": function(value){
						this.selectedSecond = this.addZero(value, 2 );
						//this.showHNode.set("text", this.addZero(i, 2 ));
						//this.itmeHNode.getFirst().set("text", this.addZero(i, 2 ));
					}.bind(this)
				});
				this.sMobileSelect.load();
			}
		}else{
			this.itmeSNode.hide();

		}


		if( this.options.secondEnable ){
			this.contentTimeTable.getElements(".calendarTimeWheel_mobile").setStyle("width","33.3%");
		}else{
			this.contentTimeTable.getElements(".calendarTimeWheel_mobile").setStyle("width","50%");
		}

		if( this.options.secondEnable && this.showSNode ){
			this.showSNode.set("text", this.addZero( s.toInt(), 2) );
		}

		if (!this.okButton){
			this.okButton = new Element("button", {"text": o2.LP.widget.ok }).inject(this.showActionNode);
			this.okButton.addEvent("click", function(){
				this._selectTime();
				this.hide();
			}.bind(this));
			this.okButton.setStyles(this.css.calendarActionShowButton_mobile_ok);
		}

		if (!this.clearButton && this.options.clearEnable){
			this.clearButton = new Element("button", {"text": o2.LP.widget.clear }).inject(this.showActionNode);
			this.clearButton.addEvent("click", function(){
				var t = this.node.get("value");
				this.node.set("value", "");
				if( t )this.fireEvent("change");
				this.fireEvent("clear");
				this.hide();
			}.bind(this));
			this.clearButton.setStyles(this.css.calendarActionShowButton_mobile_cancel);
		}
	},
	_setTimeDate: function(node, h, m, s){
		if( !this.options.secondEnable ){
			var div = this.contentTimeTable.getElement(".MWF_calendar_time_s");
			if( div )div.hide();
			div = this.contentTimeTable.getElement(".MWF_calendar_time_show_s");
			if( div )div.hide();
		}
		this.itmeHNode = this.contentTimeTable.getElement(".MWF_calendar_time_h_slider");
		this.itmeMNode = this.contentTimeTable.getElement(".MWF_calendar_time_m_slider");
		this.itmeSNode = this.contentTimeTable.getElement(".MWF_calendar_time_s_slider");


		this.timeShowNode = this.contentTimeTable.getElement(".MWF_calendar_time_show");

		this.timeShowNode.addEvent("click", function(){
			this._selectTime();
		}.bind(this));

		this.showHNode = this.contentTimeTable.getElement(".MWF_calendar_time_show_h");
		this.showMNode = this.contentTimeTable.getElement(".MWF_calendar_time_show_m");
		this.showSNode = this.contentTimeTable.getElement(".MWF_calendar_time_show_s");

		this.showActionNode = this.contentTimeTable.getElement(".MWF_calendar_action_show");

		var calendar = this;

		if ( COMMON.Browser.Platform.isMobile ){
			//this.itmeHNode.empty();
			//this.itmeHNode.removeClass("calendarTimeSlider");
			//this.itmeHNode.setStyles(this.css.calendarTimeSliderNoStyle);
			//var sel = new Element("select").inject(this.itmeHNode);
			//for (i=0; i<=23; i++){
			//	var v = (i<10) ? "0"+i: i;
			//	var o = new Element("option", {
			//		"value": v,
			//		"text": v
			//	}).inject(sel);
			//	if (h==i) o.set("selected", true);
			//}
			//sel.addEvent("change", function(){
			//	calendar.showHNode.set("text", this.options[this.selectedIndex].get("value"));
			//});
			//this.showHNode.set("text", sel.options[sel.selectedIndex].get("value"));
			//
			//this.itmeMNode.empty();
			//this.itmeMNode.removeClass("calendarTimeSlider");
			//this.itmeMNode.setStyles(this.css.calendarTimeSliderNoStyle);
			//sel = new Element("select").inject(this.itmeMNode);
			//for (i=0; i<=59; i++){
			//	var v = (i<10) ? "0"+i: i;
			//	var o = new Element("option", {
			//		"value": v,
			//		"text": v
			//	}).inject(sel);
			//	if (m==i) o.set("selected", true);
			//}
			//sel.addEvent("change", function(){
			//	calendar.showMNode.set("text", this.options[this.selectedIndex].get("value"));
			//});
			//this.showMNode.set("text", sel.options[sel.selectedIndex].get("value"));
		}else{

			if(this.options.timeSelectType === "select"){

				this.itmeHNode = this.contentTimeTable.getElement(".MWF_calendar_time_h").empty();
				this.itmeMNode = this.contentTimeTable.getElement(".MWF_calendar_time_m").empty();
				this.itmeSNode = this.contentTimeTable.getElement(".MWF_calendar_time_s").empty();

				new Element("span",{"text": o2.LP.widget.hour + "："}).inject(this.itmeHNode);
				this.itmeSelectHNode = new Element("select").inject(this.itmeHNode);
				for( var i=0; i<24; i++ ){
					new Element("option",{
						"text" : this.addZero(i, 2 ),
						"value" : this.addZero(i, 2 ),
						"styles" : this.css.calendarTimeSelectItem_mobile
					}).inject( this.itmeSelectHNode );
				}
				this.itmeSelectHNode.set("value",this.addZero( h.toInt(), 2));
				this.itmeSelectHNode.addEvent("change",function(){
					this.showHNode.set("text", this.itmeSelectHNode.get("value") );
				}.bind(this));

				new Element("span",{"text":o2.LP.widget.minute + "："}).inject(this.itmeMNode);
				this.itmeSelectMNode = new Element("select").inject(this.itmeMNode);
				for( var i=0; i<60; i++ ){
					new Element("option",{
						"text" : this.addZero(i, 2 ),
						"value" : this.addZero(i, 2 ),
						"styles" : this.css.calendarTimeSelectItem_mobile
					}).inject( this.itmeSelectMNode );
				}
				this.itmeSelectMNode.set("value",this.addZero( m.toInt(), 2));
				this.itmeSelectMNode.addEvent("change",function(){
					this.showMNode.set("text", this.itmeSelectMNode.get("value") );
				}.bind(this));

				if( this.options.secondEnable && this.itmeSNode ){
					new Element("span",{"text":o2.LP.widget.second + "："}).inject(this.itmeSNode);
					this.itmeSelectSNode = new Element("select").inject(this.itmeSNode);
					for( var i=0; i<60; i++ ){
						new Element("option",{
							"text" : this.addZero(i, 2 ),
							"value" : this.addZero(i, 2 ),
							"styles" : this.css.calendarTimeSelectItem_mobile
						}).inject( this.itmeSelectSNode );
					}
					this.itmeSelectSNode.set("value",this.addZero( s.toInt(), 2));
					this.itmeSelectSNode.addEvent("change",function(){
						this.showSNode.set("text", this.itmeSelectSNode.get("value") );
					}.bind(this));
				}


			}else {
				var hSlider = new Slider(this.itmeHNode, this.itmeHNode.getFirst(), {
					range: [0, 23],
					initialStep: h.toInt(),
					onChange: function(value){
						var tmp = (value.toInt().toString());
						if (tmp.length<2){
							tmp = "0"+tmp
						}
						this.showHNode.set("text", tmp);
						this.itmeHNode.getFirst().set("text", tmp);
					}.bind(this)
				});
				this.itmeHNode.getFirst().set("text", h);

				var mSlider = new Slider(this.itmeMNode, this.itmeMNode.getFirst(), {
					range: [0, 59],
					initialStep: m.toInt(),
					onChange: function(value){
						var tmp = (value.toInt().toString());
						if (tmp.length<2){
							tmp = "0"+tmp
						}
						this.showMNode.set("text", tmp);
						this.itmeMNode.getFirst().set("text", tmp);
					}.bind(this)
				});
				this.itmeMNode.getFirst().set("text", m);

				if( this.options.secondEnable && this.itmeSNode ){
					var sSlider = new Slider(this.itmeSNode, this.itmeSNode.getFirst(), {
						range: [0, 59],
						initialStep: parseInt(s),
						onChange: function(value){
							var tmp = (value.toInt().toString());
							if (tmp.length<2){
								tmp = "0"+tmp
							}
							this.showSNode.set("text", tmp);
							this.itmeSNode.getFirst().set("text", tmp);
						}.bind(this)
					});
					this.itmeSNode.getFirst().set("text", s);
				}
			}

		}
		this.showHNode.set("text", this.addZero( h.toInt(), 2) );
		this.showMNode.set("text", this.addZero( m.toInt(), 2));
		if( this.options.secondEnable && this.showSNode ){
			this.showSNode.set("text", this.addZero( s.toInt(), 2) );
		}

		if (!this.okButton){
			this.okButton = new Element("button", {"text": o2.LP.widget.ok}).inject(this.showActionNode);
			this.okButton.addEvent("click", function(){
				this._selectTime();
				this.hide();
			}.bind(this));
			this.okButton.setStyles(this.css.calendarActionShowButton);
		}

		if (!this.clearButton && this.options.clearEnable){
			this.clearButton = new Element("button", {"text": o2.LP.widget.clear }).inject(this.showActionNode);
			this.clearButton.addEvent("click", function(){
				var t = this.node.get("value");
				this.node.set("value", "");
				if( t )this.fireEvent("change");
				this.fireEvent("clear");
				this.hide();
			}.bind(this));
			this.clearButton.setStyles(this.css.calendarActionShowButton);
		}
	},
	addZero : function( str, length ){
		var zero = "";
		str = str.toString();
		for( var i=0; i<length; i++ ){
			zero = zero + "0";
		}
		var s = zero + str;
		return s.substr(s.length - length, length );
	},
	_selectTime: function(){
		var date = this.currentTextNode.retrieve("date");

		var h = this.selectedHour || this.showHNode.get("text");
		var m = this.selectedMinute || this.showMNode.get("text");
		date.setHours(h);
		date.setMinutes(m);

		if( this.options.secondEnable && ( this.selectedSecond || this.showSNode) ){
			var s = this.selectedSecond || this.showSNode.get("text");
			date.setSeconds(s);
		}

		if (!this.options.beforeCurrent){
			var now = new Date();
			if (date.getTime()-now.getTime()<0){
				alert( o2.LP.widget.dateGreaterThanCurrentNotice );
				this.node.focus();
				return false;
			}
		}

		var dv = date.format(this.options.format);

		if (this.fireEvent("queryComplate", [dv, date])){
			var t = this.node.get("value");

			this.options.defaultTime = ""+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

			this.node.set("value", dv);
			//	this.node.focus();
			this.hide();
			if (t!=dv) this.fireEvent("change", [dv, date, t]);
			this.fireEvent("complate", [dv, date]);
		}
	},
	_selectDate: function(dateStr){
		if( this.options.yearOnly ){
			dateStr = dateStr+"-1-1"
		}else if( this.options.monthOnly ){
			dateStr = dateStr+"-1"
		}
		var date = new Date(dateStr);
		this.options.baseDate = date;
		var dv = date.format(this.options.format);
		if (this.options.isTime){
			this.changeViewToTime(date);
		}else{
			if (!this.options.beforeCurrent){
				var now = new Date();
				date.setHours(23,59,59);
				if (date.getTime()-now.getTime()<0){
					alert( o2.LP.widget.dateGreaterThanCurrentNotice );
					this.node.focus();
					return false;
				}
			}
			if (this.fireEvent("queryComplate", [dv, date])){
				var t = this.node.get("value");
				this.node.set("value", dv);
				this.hide();
				if (t!=dv) this.fireEvent("change", [dv, date, t]);
				this.fireEvent("complate", [dv, date, t]);
			}
		}
	},

	_setDayWeekTitleTh: function(table){
		var dayTable = table || this.contentTable;

		var thead = dayTable.getElement("thead");
		var cells = thead.getElements("th");

		if (this.css.calendarDaysContentTh) cells.setStyles(this.css.calendarDaysContentTh);

		//var days_abbr = Locale.get("Date").days_abbr;
		var days_abbr = o2.LP.widget.days_abbr;
		cells.each(function(item, idx){
			item.set("text", days_abbr[idx]);
		});
		return cells;
	},

	createContainer: function(){
		var div = null;
		var request = new Request.HTML({
			url: this.options.containerPath,
			method: "GET",
			async: false,
			onSuccess: function(responseTree, responseElements, responseHTML, responseJavaScript){
				div = responseTree[0];
			}
		});
		request.send();

		//this.containerNode = div.getElement(".MWF_calendar_container");
		this.titleNode = div.getElement(".MWF_calendar_title");
		this.prevNode = div.getElement(".MWF_calendar_prev");
		this.currentNode = div.getElement(".MWF_calendar_current");
		this.currentTextNode = div.getElement(".MWF_calendar_currentText");
		this.nextNode = div.getElement(".MWF_calendar_next");
		this.contentNode = div.getElement(".MWF_calendar_content");
		this.contentDateNode = div.getElement(".MWF_calendar_content_date");
		this.contentTimeNode = div.getElement(".MWF_calendar_content_time");
		this.buttonArea = div.getElement(".MWF_calendar_button_area");
		this.bottomNode = div.getElement(".MWF_calendar_bottom");

		div.setStyles(this.css.container);
		this.titleNode.setStyles(this.css.dateTitle);
		this.prevNode.setStyles(this.css.datePrev);
		this.currentNode.setStyles(this.css.dateCurrent);
		this.currentTextNode.setStyles(this.css.dateCurrentText);
		this.nextNode.setStyles(this.css.dateNext);
		this.contentNode.setStyles(this.css.calendarContent);
		if(this.buttonArea)this.buttonArea.setStyles(this.css.buttonArea);
		this.bottomNode.setStyles(this.css.dateBottom);

		return div;
	},

	createContentTable: function(){
		var table = null;
		var request = new Request.HTML({
			url: this.options[this.currentView+"Path"],
			method: "GET",
			async: false,
			onSuccess: function(responseTree, responseElements, responseHTML, responseJavaScript){
				table = responseTree[0];
			}
		});
		request.send();

		var tbody = table.getElement("tbody");
		if (tbody){
			var tds = tbody.getElements("td");

			var calendar = this;
			tds.addEvent("click", function(){
				switch (calendar.currentView) {
					case "day" :
						calendar._selectDate(this.retrieve("dateValue"), this);
						break;
					case "month" :
						debugger;
						if( calendar.options.monthOnly ){
							calendar._selectDate(this.retrieve("year")+"-"+( this.retrieve("month").toInt() + 1 ), this);
						}else{
							calendar.changeViewToDay(this.retrieve("year"), this.retrieve("month"));
						}
						break;
					case "year" :
						if( calendar.options.yearOnly ){
							calendar._selectDate(this.retrieve("year"), this);
						}else{
							calendar.changeViewToMonth(this.retrieve("year"));
						}
						break;
					case "time" :
						//nothing
						break;
					default :
					//nothing;
				}

			});


			switch (this.currentView) {
				case "day" :
					if (!table.display) table.display="";
					if (!table.style.display) table.style.display="";

					table.setStyles(this.css.calendarDaysContent);
					tds.setStyles(this.css.calendarDaysContentTd);
					break;

				case "month" :
					table.setStyles(this.css.calendarMonthsContent);
					tds.setStyles(this.css.calendarMonthsContentTd);
					break;
				case "year" :
					this.yearLength = tds.length;
					table.setStyles(this.css.calendarYearsContent);
					tds.setStyles(this.css.calendarYearsContentTd);
					break;
				case "time" :
					if( this.options.style.indexOf("mobile") > -1 ){

						var nodes = table.getElements(".calendarTimeContent_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeContent_mobile);

						nodes = table.getElements(".calendarTimeFixWidthNode_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeFixWidthNode_mobile);

						nodes = table.getElements(".calendarTimeWheels_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeWheels_mobile);

						nodes = table.getElements(".calendarTimeWheel_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeWheel_mobile);

						nodes = table.getElements(".calendarTimeSelectContainer_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSelectContainer_mobile);

						nodes = table.getElements(".calendarTimeSelectLine_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSelectLine_mobile);

						nodes = table.getElements(".calendarTimeShadowMask_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeShadowMask_mobile);

						var node = table.getElement(".MWF_calendar_action_show");
						if (node){
							node.setStyles(this.css.calendarActionShow);
							//var buttons = node.getElements("button");
							//buttons.setStyles(this.css.calendarActionShowButton);
						}

					}else{
						var nodes = table.getElements(".calendarTimeArea");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeArea);

						nodes = table.getElements(".calendarTimeSlider");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSlider);

						nodes = table.getElements(".calendarTimeSliderKnob");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSliderKnob);

						nodes = table.getElements(".calendarTimeShow");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeShow);

						nodes = table.getElements(".calendarTimeShowItem");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeShowItem);

						var node = table.getElement(".MWF_calendar_action_show");
						if (node){
							node.setStyles(this.css.calendarActionShow);
							var buttons = node.getElements("button");
							buttons.setStyles(this.css.calendarActionShowButton);
						}

					}

					break;
				default :
				//nothing;
			}


			tds.addEvent("mouseover", function(){
				this.setStyle("border", "1px solid #999999");
			});
			tds.addEvent("mouseout", function(){
				this.setStyle("border", "1px solid #FFF");
			});
		}else{
			switch (this.currentView) {
				case "day" :
					table.setStyles(this.css.calendarDaysContent);
					tds.setStyles(this.css.calendarDaysContentTd);
					break;
				case "month" :
					table.setStyles(this.css.calendarMonthsContent);
					tds.setStyles(this.css.calendarMonthsContentTd);
					break;
				case "year" :
					this.yearLength = tds.length;
					table.setStyles(this.css.calendarYearsContent);
					tds.setStyles(this.css.calendarYearsContentTd);
					break;
				case "time" :
					if( this.options.style.indexOf("mobile") > -1 ){
						var nodes = table.getElements(".calendarTimeContent_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeContent_mobile);

						nodes = table.getElements(".calendarTimeFixWidthNode_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeFixWidthNode_mobile);

						nodes = table.getElements(".calendarTimeWheels_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeWheels_mobile);

						nodes = table.getElements(".calendarTimeWheel_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeWheel_mobile);

						nodes = table.getElements(".calendarTimeSelectContainer_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSelectContainer_mobile);

						nodes = table.getElements(".calendarTimeSelectLine_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSelectLine_mobile);

						nodes = table.getElements(".calendarTimeShadowMask_mobile");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeShadowMask_mobile);

						var node = table.getElement(".MWF_calendar_action_show");
						if (node){
							node.setStyles(this.css.calendarActionShow);
							//var buttons = node.getElements("button");
							//buttons.setStyles(this.css.calendarActionShowButton);
						}
					}else{
						var nodes = table.getElements(".calendarTimeArea");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeArea);

						nodes = table.getElements(".calendarTimeSlider");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSlider);

						nodes = table.getElements(".calendarTimeSliderKnob");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeSliderKnob);

						nodes = table.getElements(".calendarTimeShow");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeShow);

						nodes = table.getElements(".calendarTimeShowItem");
						if (nodes.length) nodes.setStyles(this.css.calendarTimeShowItem);

						var node = table.getElement(".MWF_calendar_action_show");
						if (node){
							node.setStyles(this.css.calendarActionShow);
							var buttons = node.getElements("button");
							buttons.setStyles(this.css.calendarActionShowButton);
						}
					}

					break;
				default :
				//nothing;
			}

		}

		return table;
	}

});


o2.Calendar.MobileSelect = new Class({
	Implements: [Options, Events],
	options: {
		"lineHeight" : 40, //每个item的高度
		"itemSize" : 0, //item数量
		"ratio" : 1, //滑动距离倍率
		"itemIndex" : 0
	},
	initialize: function (wheelNode, options) {
		this.setOptions( options );
		this.wheelNode = wheelNode;
		this.sliderNode = wheelNode.getFirst();
	},
	load : function(){
		var _this = this;
		this.curDistance = 0;
		this.sliderNode.style.transform = "translate3d(0px, 80px, 0px)";
		this.wheelNode.addEventListener('touchstart', function () {
			_this.touch(event);
		}, false);
		this.wheelNode.addEventListener('touchend', function () {
			_this.touch(event);
		}, false);
		this.wheelNode.addEventListener('touchmove', function () {
			_this.touch(event);
		}, false);
		this.locatePostion( this.options.itemIndex );
	},
	touch: function (ev) {
		var sliderNode = this.sliderNode;
		ev = ev || window.event;
		switch (ev.type) {
			case "touchstart":
				this.startTime = new Date();
				this.startY = event.touches[0].clientY;
				this.oldMoveY = this.startY;
				break;
			case "touchend":
				this.moveEndY = event.changedTouches[0].clientY;

				this.overTime = new Date();
				var speed = (this.moveEndY - this.startY) / ( this.overTime - this.startTime );
				var ratio = 1;
				if( Math.abs(speed) > 0.7 ){
					ratio = 5;
				}else if( Math.abs(speed) < 0.2 ){
					ratio = 0.7
				}

				this.offsetSum = ( this.moveEndY - this.startY ) * this.options.ratio * ratio;
				this.updateCurDistance();
				this.curDistance = this.fixPosition(this.curDistance);
				this.movePosition( this.curDistance );
				this.oversizeBorder = - ( this.options.itemSize - 3) * this.options.lineHeight;
				if (this.curDistance + this.offsetSum > 2 * this.options.lineHeight) {
					this.curDistance = 2 * this.options.lineHeight;
					setTimeout(function () {
						this.movePosition( this.curDistance );
					}.bind(this), 100);
				} else if (this.curDistance + this.offsetSum < this.oversizeBorder) {
					this.curDistance = this.oversizeBorder;
					setTimeout(function () {
						this.movePosition( this.curDistance );
					}.bind(this), 100);
				}
				this.fireEvent( "change", [this.getCurIndex()] );
				break;
			case "touchmove":
				ev.preventDefault();
				this.moveY = event.touches[0].clientY;
				this.overTime = new Date();
				var speed = (this.moveY - this.oldMoveY) / ( this.overTime - this.oldOverTime );
				var ratio = 1;
				if( Math.abs(speed) > 0.7 ){
					ratio = 5;
				}else if( Math.abs(speed) < 0.2 ){
					ratio = 0.7
				}

				this.offset = ( this.moveY - this.oldMoveY ) * this.options.ratio * ratio;
				this.updateCurDistance();
				this.curDistance = this.curDistance + this.offset;
				this.movePosition( this.curDistance );
				this.oldMoveY = this.moveY;
				this.oldOverTime = this.overTime;
				break;
		}
	},
	calcDistance: function (index) {
		return 2 * this.options.lineHeight - index * this.options.lineHeight;
	},
	setCurDistance: function ( index ) {
		this.curDistance = this.calcDistance( index );
		this.movePosition( this.curDistance );
	},
	fixPosition: function (distance) {
		return -(this.getIndex(distance) - 2) * this.options.lineHeight;
	},
	getCurIndex : function(){
		return this.getIndex( this.curDistance );
	},
	getIndex: function (distance) {
		return Math.round((2 * this.options.lineHeight - distance) / this.options.lineHeight);
	},
	movePosition: function ( distance) {
		this.sliderNode.style.webkitTransform = 'translate3d(0,' + distance + 'px, 0)';
		this.sliderNode.style.transform = 'translate3d(0,' + distance + 'px, 0)';
	},
	locatePostion: function ( index ) {
		this.curDistance = this.calcDistance(index);
		this.movePosition( this.curDistance );
	},
	updateCurDistance: function () {
		this.curDistance = parseInt(this.sliderNode.style.transform.split(',')[1]);
	},
	getDistance: function () {
		return parseInt(this.sliderNode.style.transform.split(',')[1]);
	}
});
