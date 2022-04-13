MWF.xApplication.Attendance = MWF.xApplication.Attendance || {};

MWF.require("MWF.xAction.org.express.RestActions", null,false);
MWF.xDesktop.requireApp("Attendance", "lp."+MWF.language, null, false);
MWF.xDesktop.requireApp("Attendance", "Common", null, false);
MWF.xDesktop.requireApp("Attendance", "widget.Calendar", null, false);

MWF.xApplication.Attendance.MyIndex = new Class({
    Extends: MWF.widget.Common,
    Implements: [Options, Events],
    options: {
        "style": "default"
    },
    statusColor : {
        "normal" : "#4A90E2", //蓝色，正常
        "levelAsked":"#2BC497", //绿色，请假
        "late":"#F5A623", //黄色，迟到
        //"leaveEarly":"#fe8d03", //橙色，早退
        "noSign":"#FF8080", //粉红色,未签到
        "appealSuccess" : "#4FB2E3", //黄绿色，申诉通过
        //"lackOfTime" : "#dec674",//工时不足人次
        "abNormalDuty" : "#8B572A"//异常打卡人次
    },
    initialize: function(node, app, actions, options){
        this.setOptions(options);
        this.app = app;
        this.lp = app.lp;
        this.path = "../x_component_Attendance/$MyIndex/";
        this.cssPath = "../x_component_Attendance/$MyIndex/"+this.options.style+"/css.wcss";
        this._loadCss();

        this.actions = actions;
        this.node = $(node);

        this.holidayData = {};

        this.today = new Date();

        //this.preMonthDate = new Date();
        //this.preMonthDate.decrement("month", 1);

        this.setDate();

        this.todayDate = this.today.format( this.lp.dateFormatDay );
        this.todayHloidayName = "";
        this.todayIsWorkDay = false; //是否调修工作日

        this.userName = layout.desktop.session.user.distinguishedName;
    },
    setDate : function( date ){
        this.date = date || new Date(); //this.preMonthDate
        this.year = this.date.getFullYear().toString();
        var month = this.date.getMonth()+1;
        this.month = month.toString().length == 2 ? month : "0"+month;
        this.getCycleDate();

    },
    destroy: function(){
        this.node.empty();
    },
    reload: function(){
        this.node.empty();
        this.load();
    },
    load: function(){
        this.loadTitleNode();
        this.loadContent();
    },
    loadTitleNode : function(){
        var text = this.date.format(this.app.lp.dateFormatMonth);

        this.titleNode = new Element("div.titleNode",{
            "styles" : this.css.titleNode
        }).inject(this.node);

        this.titleRightNode = new Element("div.titleRightNode",{
            "styles" : this.css.titleRightNode
        }).inject(this.titleNode);

        //this.titleLeftArrowNode = new Element("div",{
        //    "styles" : this.css.titleLeftArrowNode
        //}).inject(this.titleRightNode);
        this.titleTextNode = new Element("div",{
            "styles" : this.css.titleTextNode,
            "text" : text
        }).inject(this.titleRightNode);
        this.titleTextNode.setStyles( {
            "cursor" : "default"
        } );
        //this.titleRightArrowNode = new Element("div",{
        //    "styles" : this.css.titleRightArrowNode
        //}).inject(this.titleRightNode);

        var cycleText = this.app.lp.cyclText.
        replace("{start}",this.cycleStartDate.format(this.app.lp.dateFormatMonthDayLocal)).
        replace("{end}",this.cycleEndDate.format(this.app.lp.dateFormatMonthDayLocal));
        this.titleCycleTextNode = new Element("div",{
            "styles" : this.css.titleCycleTextNode,
            "text" : cycleText
        }).inject(this.titleRightNode);

        this.titleScheduleIconNode = new Element("div",{
            "styles" : this.css.titleScheduleIconNode,
            "title" : this.lp.seeSchedule
        }).inject(this.titleRightNode);

        //this.titleLeftArrowNode.addEvents({
        //    "mouseover": function(){this.titleLeftArrowNode.setStyles(this.css.titleLeftArrowNode_over);}.bind(this),
        //    "mouseout": function(){this.titleLeftArrowNode.setStyles(this.css.titleLeftArrowNode);}.bind(this),
        //    "mousedown": function(){this.titleLeftArrowNode.setStyles(this.css.titleLeftArrowNode_down);}.bind(this),
        //    "mouseup": function(){this.titleLeftArrowNode.setStyles(this.css.titleLeftArrowNode_over);}.bind(this),
        //    "click": function(){this.changeMonthPrev();}.bind(this)
        //});
        //this.titleRightArrowNode.addEvents({
        //    "mouseover": function(){this.titleRightArrowNode.setStyles(this.css.titleRightArrowNode_over);}.bind(this),
        //    "mouseout": function(){this.titleRightArrowNode.setStyles(this.css.titleRightArrowNode);}.bind(this),
        //    "mousedown": function(){this.titleRightArrowNode.setStyles(this.css.titleRightArrowNode_down);}.bind(this),
        //    "mouseup": function(){this.titleRightArrowNode.setStyles(this.css.titleRightArrowNode_over);}.bind(this),
        //    "click": function(){this.changeMonthNext();}.bind(this)
        //});
        //this.titleTextNode.addEvents({
        //    "mouseover": function(){this.titleTextNode.setStyles(this.css.titleTextNode_over);}.bind(this),
        //    "mouseout": function(){this.titleTextNode.setStyles(this.css.titleTextNode);}.bind(this),
        //    "mousedown": function(){this.titleTextNode.setStyles(this.css.titleTextNode_down);}.bind(this),
        //    "mouseup": function(){this.titleTextNode.setStyles(this.css.titleTextNode_over);}.bind(this),
        //    "click": function(){this.changeMonthSelect();}.bind(this)
        //});
        this.titleScheduleIconNode.addEvents({
            "mouseover": function(){this.titleScheduleIconNode.setStyles(this.css.titleScheduleIconNode_over);}.bind(this),
            "mouseout": function(){this.titleScheduleIconNode.setStyles(this.css.titleScheduleIconNode);}.bind(this),
            "mousedown": function(){this.titleScheduleIconNode.setStyles(this.css.titleScheduleIconNode_down);}.bind(this),
            "mouseup": function(){this.titleScheduleIconNode.setStyles(this.css.titleScheduleIconNode_over);}.bind(this),
            "click": function(){this.showSchedule();}.bind(this)
        });
    },
    changeMonthPrev: function(){
        this.date.decrement("month", 1);
        this.setDate( this.date );
        var text = this.date.format(this.app.lp.dateFormatMonth);
        this.titleTextNode.set("text", text);
        this.reloadContent();
    },
    changeMonthNext: function(){
        this.date.increment("month", 1);
        this.setDate( this.date );
        var text = this.date.format(this.app.lp.dateFormatMonth);
        this.titleTextNode.set("text", text);
        this.reloadContent();
    },
    changeMonthSelect: function(){
        if (!this.monthSelector) this.createMonthSelector();
        this.monthSelector.show();
    },
    createMonthSelector: function(){
        this.monthSelector = new MWF.xApplication.Attendance.MonthSelector(this.date, this);
    },
    changeMonthTo: function(d){
        this.setDate( d );
        var text = this.date.format(this.app.lp.dateFormatMonth);
        this.titleTextNode.set("text", text);
        this.reloadContent();
    },
    getCycleDate : function(){
        this.actions.getCyclePerson( this.year, this.month, function( json ){
            json.data = json.data || [];
            this.cycleStartDateString = json.data.cycleStartDateString;
            this.cycleEndDateString = json.data.cycleEndDateString;
            this.cycleStartDate = new Date( this.cycleStartDateString );
            this.cycleEndDate = new Date( this.cycleEndDateString );

            this.cycleYearMonth = [];
            var start = new Date(this.cycleStartDate.getFullYear(), this.cycleStartDate.getMonth(), 1);
            while( start < this.cycleEndDate ){
                var year = start.getFullYear().toString();
                var month = start.getMonth()+1;
                month = month.toString().length === 2 ? month : "0"+month;

                start.increment("month", 1);
                this.cycleYearMonth.push( { year: year, month: month} )
            }

            this.isCrossMonth = (this.cycleStartDate.getMonth() != this.cycleEndDate.getMonth());

        }.bind(this), null, false )
    },
    getScheduleData : function( callback ){
        var data = {"personList": this.app.getNameFlag(this.userName)};
        this.app.orgActions.listUnitSupNestedWithPerson( data, function( json ){
            var unitList = json.data;
            var sortF = function( a, b ){
                return  b.level - a.level;
            };
            unitList.sort( sortF );
            var flag = true;
            for( var i = 0; i<unitList.length; i++ ){
                var unit = unitList[i];
                if( unit.level == 1 ){
                    this.actions.listScheduleByTopUnit( unit.distinguishedName, function( json ){
                        if( json.data ){
                            if(callback)callback(json.data);
                            flag = false;
                        }
                    }.bind(this), null, false)
                }else{
                    this.actions.listScheduleByUnit( unit.distinguishedName, function( json ){
                        if( json.data && json.data.length > 0 ){
                            if(callback)callback(json.data);
                            flag = false;
                        }
                    }.bind(this), null, false)
                }
                if( !flag )break;
            }
        }.bind(this), null, false );
        //this.actions.listUnitWithPerson( function( json ){
        //    debugger;
        //    var unitList = json.data;
        //    if( unitList.length > 0 ){
        //        this.actions.listScheduleByUnit( unitList[0].distinguishedName, function( json ){
        //            debugger;
        //            if( json.data && json.data.length > 0 ){
        //                if(callback)callback(json.data);
        //            }else{
        //                this.actions.listScheduleByTopUnit( json.data[0].topUnit, function( json ){
        //                    debugger;
        //                    if(callback)callback(json.data);
        //                }.bind(this))
        //            }
        //        }.bind(this))
        //    }else{
        //        if(callback)callback();
        //    }
        //}.bind(this), null, data, false)
    },
    showSchedule: function(  ){
        if( this.scheduleNode ){
            this.scheduleNode.setStyle("display","block");
            this.scheduleNode.position({
                relativeTo: this.titleScheduleIconNode,
                position: 'bottomLeft',
                edge: 'upperCenter',
                offset:{
                    x : -60,
                    y : 0
                }
            });
        }else{
            this.getScheduleData(function( data ){
                if( !data || data.length == 0 ){
                    this.app.notice( this.lp.unfindSchedule,"error");
                }else{
                    this.scheduleNode = new Element("div", {"styles": this.css.scheduleNode}).inject(this.node);
                    this.scheduleNode.position({
                        relativeTo: this.titleScheduleIconNode,
                        position: 'bottomLeft',
                        edge: 'upperCenter',
                        offset:{
                            x : -60,
                            y : 0
                        }
                    });
                    this.scheduleNode.addEvent("mousedown", function(e){e.stopPropagation();});
                    document.body.addEvent("mousedown", function(){ this.scheduleNode.setStyle("display","none")}.bind(this));
                    var d = data[0];
                    var table = new Element("table", {
                        "width" : "100%", "border" : "0", "cellpadding" : "5", "cellspacing" : "0",  "class" : "filterTable"
                    }).inject( this.scheduleNode );
                    var tr = new Element("tr").inject(table);
                    new Element("td",{ "text" : this.lp.scheduleTable , "styles" : this.css.scheduleTdHead, "colspan" : "2"  }).inject(tr);


                    var table = new Element("table", {
                        "width" : "100%", "border" : "0", "cellpadding" : "5", "cellspacing" : "0",  "class" : "filterTable"
                    }).inject( this.scheduleNode );
                    var tr = new Element("tr").inject(table);
                    new Element("td",{ "text" :  this.lp.schedule.workTime + "：" , "styles" : this.css.scheduleTdTitle  }).inject(tr);
                    new Element("td",{ "text" : d.onDutyTime || "" , "styles" : this.css.scheduleTdValue  }).inject(tr);
                    var tr = new Element("tr").inject(table);
                    new Element("td",{ "text" : this.lp.schedule.offTime +"：" , "styles" : this.css.scheduleTdTitle   }).inject(tr);
                    new Element("td",{ "text" : d.offDutyTime || ""  , "styles" : this.css.scheduleTdValue }).inject(tr);
                    var tr = new Element("tr").inject(table);
                    new Element("td",{ "text" : this.lp.schedule.lateTime + "：" , "styles" : this.css.scheduleTdTitle  }).inject(tr);
                    new Element("td",{ "text" : d.lateStartTime || ""  , "styles" : this.css.scheduleTdValue }).inject(tr);
                    var tr = new Element("tr").inject(table);
                    new Element("td",{ "text" : this.lp.schedule.leaveEarlyTime + "：" , "styles" : this.css.scheduleTdTitle  }).inject(tr);
                    new Element("td",{ "text" : d.leaveEarlyStartTime || "" , "styles" : this.css.scheduleTdValue }).inject(tr);
                    var tr = new Element("tr").inject(table);
                    new Element("td",{ "text" : this.lp.schedule.absenteeismTime+"：" , "styles" : this.css.scheduleTdTitle  }).inject(tr);
                    new Element("td",{ "text" : d.absenceStartTime || ""  , "styles" : this.css.scheduleTdValue }).inject(tr);

                }
            }.bind(this))
        }
    },
    reloadContent : function(){
        this.calendarArea.empty();
        this.statusColorArea.empty();
        this.pieChartArea.empty();
        this.lineChartArea.empty();
        this.loadData();
    },
    loadContent : function(){
        this.loadContentNode();
        this.loadData();
        // this.setNodeScroll();
        this.setContentSize();
    },
    reloadChart : function(){
        this.pieChartArea.empty();
        this.lineChartArea.empty();
        this.loadPieChart();
        this.loadLineChart();
    },
    loadContentNode: function(){
        this.elementContentNode = new Element("div.elementContentNode", {
            "styles": this.css.elementContentNode
        }).inject(this.node);
        this.app.addEvent("resize", function(){
            this.setContentSize();
            this.reloadChart();
        }.bind(this));

        this.elementContentListNode = new Element("div.elementContentListNode", {
            "styles": this.css.elementContentListNode
        }).inject(this.elementContentNode);

        this.topContentArea = new Element("div.topContentArea",{
            "styles" : this.css.topContentArea
        }).inject(this.elementContentListNode);

        this.calendarArea = new Element("div.calendarArea",{
            "styles" : this.css.calendarArea
        }).inject(this.topContentArea);


        this.middleContentArea = new Element("div.middleContentArea",{
            "styles" : this.css.middleContentArea
        }).inject(this.elementContentListNode);



        this.middleLeftArea = new Element("div.middleLeftArea",{
            "styles" : this.css.middleLeftArea
        }).inject(this.middleContentArea);

        this.middleLeftTitleArea = new Element("div.middleLeftTitleArea",{
            "styles" : this.css.middleLeftTitleArea,
            "text": this.lp.attendanceSummary
        }).inject(this.middleLeftArea);

        this.middleLeftContentArea = new Element("div.middleLeftContentArea",{
            "styles" : this.css.middleLeftContentArea
        }).inject(this.middleLeftArea);

        this.statusColorArea = new Element("div.statusColorArea",{
            "styles" : this.css.statusColorArea
        }).inject(this.middleLeftContentArea);

        this.pieChartArea = new Element("div.pieChartArea",{
            "styles" : this.css.pieChartArea
        }).inject(this.middleLeftContentArea);



        this.middleRightArea = new Element("div.middleRightArea",{
            "styles" : this.css.middleRightArea
        }).inject(this.middleContentArea);

        this.middleRightTitleArea = new Element("div.middleRightTitleArea",{
            "styles" : this.css.middleRightTitleArea,
            "text": this.lp.attendanceTrendChart
        }).inject(this.middleRightArea);

        this.middleRightContentArea = new Element("div.middleRightContentArea",{
            "styles" : this.css.middleRightContentArea
        }).inject(this.middleRightArea);


        this.lineChartArea = new Element("div.lineChartArea",{
            "styles" : this.css.lineChartArea
        }).inject(this.middleRightContentArea)

    },
    loadData : function(){
        // this.listDetailFilterUser( function( data ){
        this.listCycleDetailFileterUser( function(data){
            this.detailData = data || {};
            this.anaylyseDetail();
            this.loadStatusColorNode();
            this.loadPieChart();
            this.loadLineChart();
            this.loadHolidayData(function(){
                this.loadCalendarContent();
                //if(!this.titleInforNode)this.loadTitleInforNode();
            }.bind(this));
        }.bind(this), this.userName, this.year, this.month )
    },
    loadHolidayData : function( callback ){
        if( this.holidayData && this.holidayData[ this.year ] ) {
            //this.loadCalendarContent();
            if(callback)callback();
        }else{
            this.listHolidayFilter( function(data){
                var dates = {
                    workdays : [],
                    holidays : [],
                    names : []
                };
                data.each( function(d){
                    if( this.dateMap[d.configDate] ){
                        var m = this.dateMap[d.configDate];
                        if( d.configType === "Holiday" ){
                            m.isHoliday = true;
                            m.holidayName = d.configName;
                        }else if(d.configType === "Workday"){
                            m.isWorkday = true;
                            m.holidayName = d.configName;
                        }
                    }


                    if( !dates.names.contains(d.configName) ){
                        dates.names.push( d.configName )
                    }
                    if( !dates[d.configName] ){
                        dates[d.configName] = {};
                        dates[d.configName].holidays = [];
                        dates[d.configName].workdays = [];
                    }
                    if( d.configType == "Holiday" ){
                        if( d.configDate == this.todayDate ){
                            this.todayHloidayName = d.configName;
                        }
                        dates.holidays.push( d.configDate );
                        dates[d.configName].holidays.push( d.configDate )
                    }else{
                        if( d.configDate == this.todayDate ){
                            this.todayIsWorkDay = true;
                        }
                        dates.workdays.push( d.configDate );
                        dates[d.configName].workdays.push( d.configDate )
                    }
                }.bind(this));
                this.holidayData[this.year] = dates;

                if(callback)callback();
            }.bind(this), null, this.year)
        }
    },
    loadCalendarContent : function(){

        // this.calendarTitle = new Element("div.calendarTitle",{
        //    "styles" : this.css.calendarTitle
        // }).inject(this.calendarArea)

        this.canlendarToolbar = new Element("div.canlendarToolbar",{
            "styles" : this.css.canlendarToolbar
        }).inject(this.calendarArea);

        this.canlendarToolbarText = new Element("div",{
            "styles" : this.css.canlendarToolbarText,
            "text" : this.lp.index.attendanceCalendar
        }).inject(this.canlendarToolbar);

        this.calendarDate = this.date.clone();
        if( this.isCrossMonth ){

            this.calendarMonthNode = new Element("div",{
                "styles" : this.css.calendarMonthNode
            }).inject(this.canlendarToolbar);

            this.calendarRightArrowNode = new Element("div",{
                "styles" : this.css.calendarRightArrowNode
            }).inject(this.calendarMonthNode);

            this.calendarCurrentMonthNode = new Element("div",{
                "styles" : this.css.calendarCurrentMonthNode,
                "text" : (this.calendarDate.getMonth()+1)+this.app.lp.month
            }).inject(this.calendarMonthNode);

            this.calendarLeftArrowNode = new Element("div",{
                "styles" : this.css.calendarLeftArrowNode
            }).inject(this.calendarMonthNode);

            this.calendarLeftArrowNode.addEvents({
                //"mouseover": function(){this.calendarLeftArrowNode.setStyles(this.css.calendarLeftArrowNode_over);}.bind(this),
               // "mouseout": function(){this.calendarLeftArrowNode.setStyles(this.css.calendarLeftArrowNode);}.bind(this),
                //"mousedown": function(){this.calendarLeftArrowNode.setStyles(this.css.calendarLeftArrowNode_down);}.bind(this),
                //"mouseup": function(){this.calendarLeftArrowNode.setStyles(this.css.calendarLeftArrowNode_over);}.bind(this),
                "click": function(){this.changeCalendarMonthPrev();}.bind(this)
            });
            this.calendarRightArrowNode.addEvents({
                //"mouseover": function(){this.calendarRightArrowNode.setStyles(this.css.calendarRightArrowNode_over);}.bind(this),
                //"mouseout": function(){this.calendarRightArrowNode.setStyles(this.css.calendarRightArrowNode);}.bind(this),
                //"mousedown": function(){this.calendarRightArrowNode.setStyles(this.css.calendarRightArrowNode_down);}.bind(this),
                //"mouseup": function(){this.calendarRightArrowNode.setStyles(this.css.calendarRightArrowNode_over);}.bind(this),
                "click": function(){this.changeCalendarMonthNext();}.bind(this)
            });
            this.switchCalendarArrow( this.calendarDate );
        }


        //this.loadHolidayNode();

        this.calendarNode = new Element("div.calendarNode",{
            "styles" : this.css.calendarNode
        }).inject(this.calendarArea);

        this.calendar = new MWF.xApplication.Attendance.MyIndex.Calendar(this.calendarNode, this,
            {
                "holiday" :this.holidayData[this.year],
                "detail" :this.detailData,
                "eventData" : this.eventData,
                "dateMap": this.dateMap
            },
            {
                date : this.date,
                cycleStart : this.cycleStartDate,
                cycleEnd : this.cycleEndDate
            }
        );
        this.calendar.load();

        // this.calendar = new MWF.xApplication.Attendance.Calendar(this.calendarNode, this,
        //     {
        //         "holiday" :this.holidayData[this.year],
        //         "detail" :this.detailData,
        //         "eventData" : this.eventData
        //     },
        //     {
        //         date : this.date,
        //         cycleStart : this.cycleStartDate,
        //         cycleEnd : this.cycleEndDate
        //     }
        // );
        // this.calendar.load();

    },
    switchCalendarArrow : function( date ){
        var firstDate = new Date( date.getFullYear() , date.getMonth() , 1, 0, 0, 0 );
        if( firstDate <= this.cycleStartDate  ){
            this.calendarLeftArrowNode.setStyles( this.css.calendarLeftArrowNode_disable );
            this.calendarLeftDisable = true;
        }else{
            this.calendarLeftArrowNode.setStyles( this.css.calendarLeftArrowNode );
            this.calendarLeftDisable = false;
        }
        //alert( "firstDate="+firstDate.format("db") + "  " +"cycleStartDate="+ this.cycleStartDate.format("db"))

        var  lastDate = new Date( date.getFullYear(),date.getMonth()+1, 0, 23, 59, 59);
        if( lastDate >= this.cycleEndDate  ){
            this.calendarRightArrowNode.setStyles( this.css.calendarRightArrowNode_disable );
            this.calendarRightDisable = true;
        }else{
            this.calendarRightArrowNode.setStyles( this.css.calendarRightArrowNode );
            this.calendarRightDisable = false;
        }
    },
    changeCalendarMonthPrev: function(){
        if( this.calendarLeftDisable )return ;
        // jQuery(this.calendarNode).fullCalendar( 'prev' );
        this.calendarDate.decrement("month", 1);
        this.calendarCurrentMonthNode.set("text",(this.calendarDate.getMonth()+1)+ this.app.lp.month );
        this.switchCalendarArrow( this.calendarDate );

        this.calendar.date = this.calendarDate;
        this.calendar.reLoadCalendar();
    },
    changeCalendarMonthNext: function(){
        if( this.calendarRightDisable )return ;
        // jQuery(this.calendarNode).fullCalendar( 'next' );
        this.calendarDate.increment("month", 1);
        this.calendarCurrentMonthNode.set("text",(this.calendarDate.getMonth()+1)+this.app.lp.month);
        this.switchCalendarArrow( this.calendarDate );

        this.calendar.date = this.calendarDate;
        this.calendar.reLoadCalendar();

        //this.date.increment("month", 1);
        //this.setDate( this.date );
        //var text = this.date.format(this.app.lp.dateFormatMonth);
        //this.titleTextNode.set("text", text);
        //this.reloadContent();
    },
    listHolidayFilter : function( callback, name,year,month ){
        /*{'q_Year':'2016','q_Name':'五一劳动节','q_Month':'03'}*/
        var filter = {};
        if( name )filter.q_Name = name;
        if( year )filter.q_Year = year;
        if( month ){
            filter.q_Month =  month.toString().length == 2 ? month : "0"+month;
        }else{
            filter.q_Month = "(0)"
        }
        this.actions.listHolidayFilter( filter, function(json){
            if( callback )callback(json.data);
        }.bind(this))
    },
    loadHolidayNode : function() {
        this.holidayAreaNode = new Element("div.holidayAreaNode",{
            "styles" : this.css.holidayAreaNode
        }).inject(this.canlendarToolbar);

        this.holidayActionNode = new Element("div",{
            "styles" : this.css.holidayActionNode
        }).inject(this.holidayAreaNode);

        this.holidayActionTextNode = new Element("div",{
            "styles" : this.css.holidayActionTextNode,
            "text" : this.lp.holiday.holidaySchedule
        }).inject(this.holidayActionNode);

        this.holidayActionIconNode = new Element("div",{
            "styles" : this.css.holidayActionIconNode
        }).inject(this.holidayActionNode);

        this.holidayActionNode.addEvents({
            "mouseover": function(){this.holidayActionIconNode.setStyles(this.css.holidayActionIconNode_over);}.bind(this),
            "mouseout": function(){this.holidayActionIconNode.setStyles(this.css.holidayActionIconNode);}.bind(this),
            "click" : function( ev ){
                this.switchHoliday( ev.target );
                ev.stopPropagation();
            }.bind(this)
        })
    },
    switchHoliday: function( el ){
        var _self = this;
        var flag = false;

        if(this.holidayListNode ){
            if(this.holidayListNode.retrieve("year") == this.year){
                flag = true;
            }else{
                this.holidayListNode.destroy();
            }
        }
        if(flag){
            var parentNode = el.getParent();
            this.holidayListNode.inject(parentNode);
            if(  this.holidayListNode.getStyle("display") == "block" ){
                this.holidayListNode.setStyle("display","none");
            }else{
                this.holidayListNode.setStyle("display","block");
            }
        }else{
            var holidays = this.holidayData[this.year];
            var holidayListNode = this.holidayListNode = new Element("div",{
                "styles" :  this.css.holidayListNode
            });
            this.holidayListNode.store("year",this.year);
            this.app.content.addEvent("click",function(){
                _self.holidayListNode.setStyle("display","none");
            });
            holidays.names.each(function( n ){
                var holidayNode = new Element("div",{
                    "text" : n,
                    "styles" : this.css.holidayNode
                }).inject(holidayListNode);
                holidayNode.store("holidays", holidays[n].holidays );
                holidayNode.store("workdays", holidays[n].workdays );
                holidayNode.addEvents({
                    "mouseover" : function(){
                        this.setStyles(_self.css.holidayNode_over);
                    },
                    "mouseout" : function(){
                        this.setStyles(_self.css.holidayNode);
                    },
                    "click" : function(e){
                        _self.holidayListNode.setStyle("display","none");
                        var holidays = this.retrieve("holidays");
                        var workdays = this.retrieve("workdays");
                        this.setStyles(_self.css.holidayNode);
                        _self.changeMonthTo( new Date((holidays || workdays )[0]) );
                        //jQuery(_self.calendarNode).fullCalendar( 'gotoDate', (holidays || workdays )[0] );
                        e.stopPropagation();
                    }
                })
            }.bind(this));
            var parentNode = el.getParent();
            this.holidayListNode.inject(parentNode);
        }
    },
    loadStatusColorNode : function(){

        this.statusColorTable = new Element("table",{
            "styles" : this.css.statusColorTable
        }).inject(this.statusColorArea);

        for(var status in this.statusColor){

            var tr = new Element("tr",{
                "styles" : this.css.statusColorTr,
                "title": this.lp[status]
            }).inject(this.statusColorTable);

            var td = new Element("td").inject(tr);
            new Element("div",{
                "styles" : {
                    "margin-top": "8px",
                    "width": "14px",
                    "height": "14px",
                    "border-radius": "14px",
                    "background-color": this.statusColor[status]
                }
            }).inject(td);

            var td = new Element("td").inject(tr);
            new Element("div",{
                "styles" : {
                    "margin-top": "8px",
                    "min-width": "30px",
                    "padding-left": "4px",
                    "font-size": "14px",
                    "color": "#666"
                },
                "text": this.lp.statusText[status]
            }).inject(td);

            var td = new Element("td").inject(tr);
            new Element("div",{
                "styles" : {
                    "margin-top": "8px",
                    "min-width": "60px",
                    "padding-left": "4px",
                    "font-size": "12px",
                    "color": "#999"
                },
                "text": "("+this.totalData[status] + ""+ this.app.lp.day+")"
            }).inject(td);
        }

        // this.statusColorTable = new Element("table",{
        //     "styles" : this.css.statusColorTable
        // }).inject(this.statusColorArea);
        //
        // for(var status in this.statusColor){
        //
        //     var tr = new Element("tr",{
        //         "styles" : this.css.statusColorTr
        //     }).inject(this.statusColorTable);
        //     var td = new Element("td",{
        //         "styles" : this.css.statusColorTd
        //     }).inject(tr);
        //     td.setStyle("background-color",this.statusColor[status]);
        //
        //     var tr = new Element("tr",{
        //         "styles" : this.css.statusTextTr
        //     }).inject(this.statusColorTable);
        //     var td = new Element("td",{
        //         "styles" : this.css.statusTextTd,
        //         "text" : this.lp[status] +":"+this.totalData[status] + " "+ this.app.lp.day + ( this.rateData[status] ? "("+this.rateData[status]+")" : "" )
        //     }).inject(tr)
        // }
    },
    loadPieChart : function(){

        //this.pieChartTitle = new Element("div.pieChartTitle",{
        //    "styles" : this.css.pieChartTitle,
        //    "text" : this.lp.index.pieChart
        //}).inject(this.pieChartArea)

        this.pieChartNode = new Element("div.pieChartNode",{
            "styles" : this.css.pieChartNode
        }).inject(this.pieChartArea);

        this.pieChart = new MWF.xApplication.Attendance.Echarts(this.pieChartNode, this, this.totalData, this.css);
        this.pieChart.load();
    },
    loadLineChart : function(){


        //this.lineChartTitle = new Element("div.lineChartTitle",{
        //    "styles" : this.css.lineChartTitle,
        //    "text" : this.lp.index.lineChart
        //}).inject(this.lineChartArea)

        this.lineChartNode = new Element("div.lineChartNode",{
            "styles" : this.css.lineChartNode
        }).inject(this.lineChartArea);

        //this.lineChart = new MWF.xApplication.Attendance.Echarts(this.lineChartNode, this.app, this.actions, this.css, {"type":"line"});
        //this.lineChart.load();

        this.lineChart = new MWF.xApplication.Attendance.Echarts(this.lineChartNode, this, this.detailData, {
            "type":"line",
            "date":this.date,
            "cycleStart" : new Date( this.cycleStartDate.getFullYear(), this.cycleStartDate.getMonth(), this.cycleStartDate.getDate() ),
            "cycleEnd" : new Date( this.cycleEndDate.getFullYear(), this.cycleEndDate.getMonth(), this.cycleEndDate.getDate() )
        });
        this.lineChart.load();
    },
    listCycleDetailFileterUser: function(callback, name){
        debugger;
        var data = [];
        var loadCount = 0;
        var startTime = Date.parse( this.cycleStartDate.format("%Y-%m-%d") ).getTime();
        var endTime = Date.parse( this.cycleEndDate.format("%Y-%m-%d") ).getTime();
        this.cycleYearMonth.each(function(cycle){
            var filter = {};
            if( name )filter.q_empName = name;
            filter.cycleYear = cycle.year;
            filter.cycleMonth =  cycle.month;
            this.actions.listDetailFilterUser( filter, function(json){
                data = data.concat( json.data || [] );
                loadCount++;
                if( loadCount >= this.cycleYearMonth.length ){
                    data = data.filter( function (d) {
                        var time = Date.parse(d.recordDateString).getTime();
                        return (time >= startTime) && (time <= endTime);
                    }.bind(this));
                    data.sort( function( a, b ){
                        return parseInt( a.recordDateString.replace(/-/g,"") ) -  parseInt( b.recordDateString.replace(/-/g,"") );
                    });
                    if( callback )callback(data);
                }
            }.bind(this))
        }.bind(this))
    },
    listDetailFilterUser :function( callback, name, year, month ){
        //{'q_empName':'林玲','q_year':'2016','q_month':'03'}
        var filter = {};
        if( name )filter.q_empName = name;
        if( year )filter.cycleYear = year;
        if( month )filter.cycleMonth =  month.toString().length == 2 ? month : "0"+month;
        this.actions.listDetailFilterUser( filter, function(json){
            var data = json.data || [];
            data.sort( function( a, b ){
                return parseInt( a.recordDateString.replace(/-/g,"") ) -  parseInt( b.recordDateString.replace(/-/g,"") );
               //return  a.recordDateString - b.recordDateString
            });
            if( callback )callback(data);
        }.bind(this))
    },
    setContentSize: function(){
        var toolbarSize = this.toolbarNode ? this.toolbarNode.getSize() : {"x":0,"y":0};
        var titlebarSize = this.titleNode ? this.titleNode.getSize() : {"x":0,"y":0};
        var nodeSize = this.node.getSize();
        var pt = this.elementContentNode.getStyle("padding-top").toFloat();
        var pb = this.elementContentNode.getStyle("padding-bottom").toFloat();
        //var filterSize = this.filterNode.getSize();
        var filterConditionSize = this.filterConditionNode ? this.filterConditionNode.getSize() : {"x":0,"y":0};

        var height = nodeSize.y-toolbarSize.y-pt-pb-filterConditionSize.y-titlebarSize.y-10;
        this.elementContentNode.setStyle("height", ""+height+"px");

    },
    // setNodeScroll: function(){
    //     var _self = this;
    //     MWF.require("MWF.widget.ScrollBar", function(){
    //         new MWF.widget.ScrollBar(this.elementContentNode, {
    //             "indent": false,"style":"xApp_TaskList", "where": "before", "distance": 30, "friction": 4,	"axis": {"x": false, "y": true},
    //             "onScroll": function(y){
    //             }
    //         });
    //     }.bind(this));
    // },
    anaylyseDetail : function(){
        var events = [];
        var dateMap = {};
        this.dateMap = dateMap;
        var totals = {
            levelAsked : 0,
            noSign : 0,
            late : 0,
            appealSuccess : 0,
            //leaveEarly : 0,
            //lackOfTime : 0,
            abNormalDuty : 0,
            normal : 0
        };

        var setDateMap = function (d, type) {
            var map = dateMap[d.recordDateString] = {
                "on": d.onDutyTime,
                "off": d.offDutyTime,
                "detailId": d.id
            };
            if( type === "normal"){
                map.text = this.lp.statusText[type];
            }else if(type){
                map.text = this.lp.statusText[type];
                map.color = this.statusColor[type];
            }
            map.isWorkday = d.isWorkday;
            map.isHoliday = d.isHoliday;
        }.bind(this);

        this.detailData.each( function( d ){

            if( this.isAskForLevel(d,"am") || this.isAskForLevel(d,"pm") ){
                setDateMap( d, "levelAsked" );
            }else if( this.isAppealSuccess(d,"am") || this.isAppealSuccess(d,"pm")){
                setDateMap( d, "appealSuccess" );
            }else if( this.isAbsent(d,"am") || this.isAbsent(d,"pm")){
                setDateMap( d, "noSign" );
            }else if( this.isLate(d,"am") || this.isLate(d,"pm")) {
                setDateMap( d, "late" );
            }else if( this.isLackOfTime(d,"am") || this.isLackOfTime(d,"pm")){
                setDateMap( d, "lackOfTime" );
            }else if( this.isAbnormalDuty(d,"am") || this.isAbnormalDuty(d,"pm")){
                setDateMap( d, "abNormalDuty" );
            }else if( this.isHoliday(d, "am") || this.isHoliday(d, "pm")){
                setDateMap( d );
            }else if( this.isWeekend(d, "am") || this.isWeekend(d, "pm") ){
                setDateMap( d );
            }else{
                setDateMap( d, "normal" );
            }


            if( this.isAskForLevel(d,"am") ){
                events.push( {  text:this.lp.levelAsked, start: d.recordDateString,  backgroundColor :this.statusColor.levelAsked } );
                totals.levelAsked = totals.levelAsked + 0.5
            }else if( this.isAppealSuccess(d,"am")){
                events.push( {  text: this.lp.appealSuccess, start: d.recordDateString,  backgroundColor :this.statusColor.appealSuccess } );
                totals.appealSuccess = totals.appealSuccess + 0.5
            }else if( this.isAbsent(d,"am")){
                events.push( {  text: this.lp.noSign, start: d.recordDateString,  backgroundColor :this.statusColor.noSign } );
                totals.noSign = totals.noSign + 0.5
            }else if( this.isLate(d,"am")) {
                events.push({
                    text: this.lp.late + '，' + this.lp.signTime + '：' + d.onDutyTime, //+ "迟到时长" + d.lateTimeDuration,
                    start: d.recordDateString,
                    backgroundColor: this.statusColor.late
                });
                totals.late = totals.late + 0.5
            }else if( this.isLackOfTime(d,"am")){
                events.push( {  text: this.lp.lackOfTime + '，' + this.lp.signTime + '：' + d.onDutyTime, start: d.recordDateString,  backgroundColor :this.statusColor.lackOfTime } );
                totals.lackOfTime = totals.lackOfTime + 0.5
            }else if( this.isAbnormalDuty(d,"am")){
                events.push( {  text: this.lp.abNormalDuty + '，' + this.lp.signTime + '：' + d.onDutyTime, start: d.recordDateString,  backgroundColor :this.statusColor.abNormalDuty } );
                totals.abNormalDuty = totals.abNormalDuty + 0.5
            }else if( this.isHoliday(d, "am") ){
                return;
            }else if( this.isWeekend(d, "am") ){
                return;
            }else{
                totals.normal = totals.normal + 0.5;
                events.push( {  text: this.lp.normal + '，'+this.lp.signTime +'：' + d.onDutyTime, start: d.recordDateString,  backgroundColor :this.statusColor.normal } )
            }

            if( this.isAskForLevel(d,"pm") ){
                totals.levelAsked = totals.levelAsked + 0.5;
                events.push( {  text: this.lp.index.levelAsked, start: d.recordDateString,  backgroundColor :this.statusColor.levelAsked } )
            }else if( this.isAppealSuccess(d,"pm")){
                events.push( {  text: this.lp.appealSuccess, start: d.recordDateString,  backgroundColor :this.statusColor.appealSuccess } );
                totals.appealSuccess = totals.appealSuccess + 0.5;
            //}else if( this.isLeaveEarlier(d,"pm")) {
            //    events.push({
            //        text: '早退，打卡时间：' + d.offDutyTime, // + "早退时长" + d.leaveEarlierTimeDuration,
            //        start: d.recordDateString,
            //        backgroundColor: this.statusColor.leaveEarly
            //    })
            //    totals.leaveEarly = totals.leaveEarly + 0.5
            }else if( this.isAbsent(d,"pm")){
                    totals.noSign = totals.noSign + 0.5;
                    events.push( {  text: this.lp.index.absent, start: d.recordDateString,  backgroundColor :this.statusColor.noSign } )
           /* }else if( this.isLackOfTime(d,"pm")){
                events.push( {  text: this.lp.lackOfTime + '，' + this.lp.signTime + '：' + d.offDutyTime, start: d.recordDateString,  backgroundColor :this.statusColor.lackOfTime } );
                totals.lackOfTime = totals.lackOfTime + 0.5*/
            }else if( this.isAbnormalDuty(d,"pm")){
                events.push( {  text: this.lp.abNormalDuty + '，' + this.lp.signTime + '：' + d.offDutyTime, start: d.recordDateString,  backgroundColor :this.statusColor.abNormalDuty } );
                totals.abNormalDuty = totals.abNormalDuty + 0.5
            }else if( this.isHoliday(d, "pm") ){
                return;
            }else if( this.isWeekend(d, "pm") ){
                return;
            }else{
                if(!!d.offDutyTime){
                    totals.normal = totals.normal + 0.5;
                    events.push( {  text: this.lp.index.offDutyTime+ d.offDutyTime, start: d.recordDateString,  backgroundColor :this.statusColor.normal } )
                }

            }
        }.bind(this) );
        this.totalData = totals;

        var total = 0;
        for( var n in totals  ){
            total += totals[n];
        }
        this.rateData = {
            levelAsked : (!totals.levelAsked || !total) ? 0 : ((totals.levelAsked/total * 100).toFixed(2) + "%"),
            noSign : (!totals.noSign || !total) ? 0 : ((totals.noSign/total * 100).toFixed(2)  + "%"),
            late : (!totals.late || !total) ? 0 : ((totals.late/total * 100).toFixed(2) + "%"),
            //leaveEarly : (!totals.leaveEarly || !total) ? 0 : ((totals.leaveEarly/total* 100).toFixed(2)  + "%"),
            //lackOfTime : (!totals.lackOfTime || !total) ? 0 : ((totals.lackOfTime/total * 100).toFixed(2) + "%"),
            abNormalDuty : (!totals.abNormalDuty || !total) ? 0 : ((totals.abNormalDuty/total* 100).toFixed(2)  + "%"),
            normal : (!totals.normal || !total) ? 0 : ((totals.normal/total* 100).toFixed(2)  + "%"),
            appealSuccess  : (!totals.appealSuccess || !total) ? 0 : ((totals.appealSuccess/total * 100).toFixed(2)  + "%")
        };

        this.eventData = events;
    },
    isAppealSuccess : function( d, ap ){
        return d.appealStatus == 9
    },
    isAskForLevel : function( d , ap ){
        if( ap == "am" ){
            //d.selfHolidayDayTime == "全天" || d.selfHolidayDayTime == "上午"
            return  d.isGetSelfHolidays && ( ["全天","上午",this.app.lp.wholeDay, this.app.lp.am ].contains(d.selfHolidayDayTime) )
        }else{
            // return  d.isGetSelfHolidays && ( d.selfHolidayDayTime == "全天" || d.selfHolidayDayTime == "下午" )
            return  d.isGetSelfHolidays && ( ["全天","下午",this.app.lp.wholeDay, this.app.lp.pm ].contains(d.selfHolidayDayTime ) )
        }
    },
    isAbsent : function(d , ap ){
        if( ap == "am" ){
            // return  d.isAbsent && ( d.absentDayTime == "全天" || d.absentDayTime == "上午" )
            return  d.isAbsent && ["全天","上午",this.app.lp.wholeDay, this.app.lp.am ].contains(d.absentDayTime);
        }else{
            // return  d.isAbsent && ( d.absentDayTime == "全天" || d.absentDayTime == "下午" )
            return  d.isAbsent && ["全天","下午",this.app.lp.wholeDay, this.app.lp.pm ].contains(d.absentDayTime);
        }
    },
    isLate : function(d, ap ){
        return d.isLate
    },
    //isLeaveEarlier : function( d ){
    //    return d.isLeaveEarlier
    //},
    isWorkOvertime : function( d, ap){
        return d.isWorkOvertime
    },
    isLackOfTime : function( d, ap){
        return d.isLackOfTime
    },
    isAbnormalDuty : function(d , ap ){
        if( ap == "am" ){
            // return  d.isAbnormalDuty && ( d.abnormalDutyDayTime == "全天" || d.abnormalDutyDayTime == "上午" )
            return  d.isAbnormalDuty && ["全天","上午",this.app.lp.wholeDay, this.app.lp.am ].contains(d.abnormalDutyDayTime)
        }else{
            return  d.isAbnormalDuty && ["全天","下午",this.app.lp.wholeDay, this.app.lp.pm ].contains(d.abnormalDutyDayTime);
        }
    },
    isHoliday : function( d, ap ){
        if( ap == "am" ){
            return d.isHoliday && (!d.onDutyTime || d.onDutyTime == "")
        }else{
            return d.isHoliday && (!d.offDutyTime || d.offDutyTime == "")
        }
    },
    isWeekend  : function( d, ap ){
        if(d.isWorkday )return false;
        if( ap == "am" ){
            return d.isWeekend && (!d.onDutyTime || d.onDutyTime == "")
        }else{
            return d.isWeekend && (!d.offDutyTime || d.offDutyTime == "")
        }
    },
    toFixed: function (num, d) {
        var s=num+"";
        if(!d)d=0;
        if(s.indexOf(".")==-1)s+=".";
        s+=new Array(d+1).join("0");
        if(new RegExp("^(-|\\+)?(\\d+(\\.\\d{0,"+(d+1)+"})?)\\d*$").test(s)){
            var s="0"+RegExp.$2,pm=RegExp.$1,a=RegExp.$3.length,b=true;
            if(a==d+2){
                a=s.match(/\d/g);
                if(parseInt(a[a.length-1])>4){
                    for(var i=a.length-2;i>=0;i--){
                        a[i]=parseInt(a[i])+1;
                        if(a[i]==10){
                            a[i]=0;
                            b=i!=1;
                        }else break;
                    }
                }
                s=a.join("").replace(new RegExp("(\\d+)(\\d{"+d+"})\\d$"),"$1.$2");

            }if(b)s=s.substr(1);
            return (pm+s).replace(/\.$/,"");
        }return this+"";

    }

});


MWF.xApplication.Attendance.MyIndex.Calendar = new Class({
    Implements: [Options, Events],
    options: {
        date : "",
        cycleStart : "",
        cycleEnd : ""
    },
    initialize: function(container, view, data, options){
        // {
        //     "holiday" :this.holidayData[this.year],
        //     "detail" :this.detailData,
        //     "eventData" : this.eventData
        // }

        this.setOptions(options);
        this.view = view;
        this.css = this.view.css;
        this.container = container;
        this.app = this.view.app;
        this.data = data;
        this.date = this.options.date;
        this.today = new Date();
        this.days = {};
        this.weekBegin = 1;
    },
    load: function(){

        debugger;

        // this.titleNode = new Element("div", {"styles": this.css.calendarTitleNode}).inject(this.container);


        // this.scrollNode = new Element("div", {
        //     "styles":  this.app.inContainer ? this.css.scrollNode_inContainer : this.css.scrollNode
        // }).inject(this.container);

        this.contentWarpNode = new Element("div", {
            "styles": this.css.contentWarpNode
        }).inject(this.container);

        this.contentContainerNode = new Element("div",{
            "styles" : this.css.contentContainerNode
        }).inject(this.contentWarpNode);

        this.bodyNode = new Element("div", {
            "styles": this.css.contentNode
        }).inject(this.contentContainerNode);

        // this.setTitleNode();
        this.setBodyNode();

        this.resetBodySize();
        this.app.addEvent("resize", this.resetBodySize.bind(this));

    },
    resetBodySize: function(){
        var size = this.container.getSize();
        var titleSize = this.titleNode ? this.titleNode.getSize() : {x:0, y:0};
        var y = size.y-titleSize.y;

        if(this.scrollNode)this.scrollNode.setStyle("height", ""+y+"px");

        if (this.contentWarpNode){
            this.contentWarpNode.setStyles({
                "width": (size.x - 30) +"px"
            });
        }
    },
    // setTitleNode: function(){
    //     this.prevMonthNode =  new Element("div", {"styles": this.css.calendarPrevMonthNode}).inject(this.titleNode);
    //
    //     var text = this.date.format(this.app.lp.dateFormatMonth);
    //     this.titleTextNode = new Element("div", {"styles": this.css.calendarTitleTextNode, "text": text}).inject(this.titleNode);
    //
    //     this.nextMonthNode =  new Element("div", {"styles": this.css.calendarNextMonthNode}).inject(this.titleNode);
    //
    //     this.prevMonthNode.addEvents({
    //         "mouseover": function(){this.prevMonthNode.setStyles(this.css.calendarPrevMonthNode_over);}.bind(this),
    //         "mouseout": function(){this.prevMonthNode.setStyles(this.css.calendarPrevMonthNode);}.bind(this),
    //         "mousedown": function(){this.prevMonthNode.setStyles(this.css.calendarPrevMonthNode_down);}.bind(this),
    //         "mouseup": function(){this.prevMonthNode.setStyles(this.css.calendarPrevMonthNode_over);}.bind(this),
    //         "click": function(){this.changeMonthPrev();}.bind(this)
    //     });
    //     this.nextMonthNode.addEvents({
    //         "mouseover": function(){this.nextMonthNode.setStyles(this.css.calendarNextMonthNode_over);}.bind(this),
    //         "mouseout": function(){this.nextMonthNode.setStyles(this.css.calendarNextMonthNode);}.bind(this),
    //         "mousedown": function(){this.nextMonthNode.setStyles(this.css.calendarNextMonthNode_down);}.bind(this),
    //         "mouseup": function(){this.nextMonthNode.setStyles(this.css.calendarNextMonthNode_over);}.bind(this),
    //         "click": function(){this.changeMonthNext();}.bind(this)
    //     });
    //     this.titleTextNode.addEvents({
    //         "mouseover": function(){this.titleTextNode.setStyles(this.css.calendarTitleTextNode_over);}.bind(this),
    //         "mouseout": function(){this.titleTextNode.setStyles(this.css.calendarTitleTextNode);}.bind(this),
    //         "mousedown": function(){this.titleTextNode.setStyles(this.css.calendarTitleTextNode_down);}.bind(this),
    //         "mouseup": function(){this.titleTextNode.setStyles(this.css.calendarTitleTextNode_over);}.bind(this),
    //         "click": function(){this.changeMonthSelect();}.bind(this)
    //     });
    // },
    // changeMonthPrev: function(){
    //     this.date.decrement("month", 1);
    //     var text = this.date.format(this.app.lp.dateFormatMonth);
    //     this.titleTextNode.set("text", text);
    //     this.reLoadCalendar();
    // },
    // changeMonthNext: function(){
    //     this.date.increment("month", 1);
    //     var text = this.date.format(this.app.lp.dateFormatMonth);
    //     this.titleTextNode.set("text", text);
    //     this.reLoadCalendar();
    // },
    // changeMonthSelect: function(){
    //     if (!this.monthSelector) this.createMonthSelector();
    //     this.monthSelector.show();
    // },
    // createMonthSelector: function(){
    //     this.monthSelector = new MWF.xApplication.Meeting.MonthView.Calendar.MonthSelector(this.date, this);
    // },
    // changeMonthTo: function(d){
    //     this.date = d;
    //     var text = this.date.format(this.app.lp.dateFormatMonth);
    //     this.titleTextNode.set("text", text);
    //     this.reLoadCalendar();
    // },

    setBodyNode: function(){
        if( this.weekBegin == "1" ){
            var html = "<tr><th>"+this.app.lp.weeks.Mon+"</th><th>"+this.app.lp.weeks.Tues+"</th><th>"+this.app.lp.weeks.Wed+"</th>" +
                "<th>"+this.app.lp.weeks.Thur+"</th><th>"+this.app.lp.weeks.Fri+"</th><th>"+this.app.lp.weeks.Sat+"</th><th>"+this.app.lp.weeks.Sun+"</th></tr>";
        }else{
            var html = "<tr><th>"+this.app.lp.weeks.Sun+"</th><th>"+this.app.lp.weeks.Mon+"</th><th>"+this.app.lp.weeks.Tues+"</th><th>"+this.app.lp.weeks.Wed+"</th>" +
                "<th>"+this.app.lp.weeks.Thur+"</th><th>"+this.app.lp.weeks.Fri+"</th><th>"+this.app.lp.weeks.Sat+"</th></tr>";
        }
        html += "<tr><td valign='top'></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        html += "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        html += "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        html += "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        html += "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        html += "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        this.calendarTable = new Element("table", {
            "styles": this.css.calendarTable,
            "height": "100%",
            "border": "0",
            "cellPadding": "0",
            "cellSpacing": "0",
            "html": html
        }).inject(this.bodyNode);

        this.calendarTableTitleTr = this.calendarTable.getElement("tr");
        this.calendarTableTitleTr.setStyles(this.css.calendarTableTitleTr);
        var ths = this.calendarTableTitleTr.getElements("th");
        ths.setStyles(this.css.calendarTableTh);

        //var tds = this.calendarTable.getElements("td");
        //tds.setStyles(this.css.calendarTableCell);

        this.loadCalendar();
    },
    reLoadCalendar: function(){
        Object.each(this.days, function(day){
            day.destroy();
        }.bind(this));

        this.loadCalendar();
    },

    loadCalendar: function(){
        var date = this.date.clone();
        date.set("date", 1);
        var week = date.getDay();
        if( this.weekBegin == "1" ){
            var decrementDay = ((week-1)<0) ? 6 : week-1;
        }else{
            var decrementDay = week;
        }

        date.decrement("day", decrementDay);
        var tds = this.calendarTable.getElements("td");
        tds.each(function(td){
            this.loadDay(td, date);
            date.increment();
        }.bind(this));
    },
    loadDay: function(td, date){
        var type = "thisMonth";
        var m = date.get("month");
        var y = date.get("year");
        var d = date.get("date");
        var mm = this.date.get("month");
        var yy = this.date.get("year");
        var mmm = this.today.get("month");
        var yyy = this.today.get("year");
        var ddd = this.today.get("date");

        if ((m==mmm) && (y==yyy) && (d==ddd)){
            type = "today";
        }else if ((m==mm) && (y==yy)){
            type = "thisMonth";
        }else{
            type = "otherMonth";
        }

        debugger;

        var key = date.format(this.app.lp.dateFormat);
        var data = this.data.dateMap[date.format("%Y-%m-%d")] || {};
        this.days[key] = new MWF.xApplication.Attendance.MyIndex.Calendar.Day(td, date, this, type, data);
    },
    reload : function(){
        this.view.reload();
    },
    destroy: function(){
        Object.each(this.days, function(day){
            day.destroy();
        }.bind(this));
        this.container.empty();
    }

});

MWF.xApplication.Attendance.MyIndex.Calendar.Day = new Class({
    Implements: [Events],
    initialize: function(td, date, calendar, type, data){
        this.container = td;
        this.calendar = calendar;
        this.view = this.calendar.view;
        this.css = this.calendar.css;
        this.app = this.calendar.app;
        this.date = date.clone();
        this.key = this.date.format(this.app.lp.dateFormat);
        this.data = data;
        this.type = type; //today, otherMonth, thisMonth
        this.load();
    },
    load: function(){
        this.color = "#666";
        if(  this.type == "thisMonth" ){
        }else if( this.type == "otherMonth" ){
            this.color = "#ccc";
        }
        this.day = this.date.getDate();
        this.month = this.date.getMonth();
        this.year = this.date.getYear();

        this.node = new Element("div", {
            "styles" : this.css["calendarTableCell_"+this.type]
        }).inject( this.container );

        if( this.type === "today" && (this.calendar.date.format("%Y-%m-%d") !== this.date.format("%Y-%m-%d")) ){
            this.node.setStyle("opacity", "0.5");
        }

        if( this.data.color ){
            this.node.setStyle("border-left", "6px solid "+ this.data.color);
        }

        this.titleNode = new Element("div", {"styles": this.css["dayTitle_"+this.type]}).inject(this.node);
        if( !this.data.color ){
            this.titleNode.setStyle("border-left","5px solid #fff");
        }
        this.titleDayNode = new Element("div", {"styles": this.css["dayTitleDay_"+this.type], "text": this.day}).inject(this.titleNode);

        if ((new Date()).diff(this.date)>=0){
            this.titleNode.set("title", this.app.lp.titleNode);
            // this.titleNode.addEvent("click", function(){
            //     this.app.addMeeting(this.date);
            // }.bind(this));
        }

        // this.loadMeetings();

        if( this.data.isHoliday ){
            new Element("div", {
                "styles": {
                    "margin-top": "5px",
                    "margin-left": "10px",
                    "color": "#fff",
                    "font-weight": "bold",
                    "border-radius": "20px",
                    "height": "20px",
                    "width": "20px",
                    // "background-color": "#F23030",
                    "background-color": "#f49999",
                    "float": "left",
                    "line-height": "20px",
                    "text-align": "center",
                    "font-size" : "12px"
                },
                "text": this.app.lp.offDutyAbbrev,
                "title": this.data.holidayName || ""
            }).inject(this.titleNode)
        }else if( this.data.isWorkday ){
            new Element("div", {
                "styles": {
                    "margin-top": "5px",
                    "margin-left": "10px",
                    "color": "#fff",
                    "font-weight": "bold",
                    "border-radius": "20px",
                    "height": "20px",
                    "width": "20px",
                    "background-color": "#ccc",
                    "float": "left",
                    "line-height": "20px",
                    "text-align": "center",
                    "font-size" : "12px"
                },
                "text": this.app.lp.onDutyAbbrev,
                "title": this.data.holidayName || ""
            }).inject(this.titleNode)
        }

        if( this.data.text ){
            new Element("div", {
                "styles": {
                    "margin-right": "10px",
                    "color": "#999",
                    "float": "right",
                    "font-size" : "14px"
                },
                "text": this.data.text
            }).inject(this.titleNode)
        }

        this.contentNode = new Element("div", {"styles": this.css.dayContentNode}).inject(this.node);
        if( !this.data.color ){
            this.contentNode.setStyle("border-left","5px solid #fff");
        }
        if( this.data.on || this.data.off ){
            new Element("div", {
                "styles": {
                    "margin-left": "10px",
                    "margin-top": "10px",
                    "color": "#333",
                    "font-weight": "500",
                    "font-size" : "14px"
                },
                "text": this.getMintue(this.data.on) + "-" + this.getMintue(this.data.off)
            }).inject(this.contentNode)
        }

    },
    getMintue: function(str){
        var arr = (str || "").split(":");
        if( arr[1] ){
            return arr[0] + ":" + arr[1];
        }else{
            return arr[0]
        }
    },
    destroy: function(){

        this.node.destroy();
        this.titleNode = null;
        this.titleDayNode = null;
        this.contentNode = null;

        delete this.calendar.days[this.key];

        this.container.empty();
        MWF.release(this);
    },
    reload: function(){
        this.view.reload();
    }
});
