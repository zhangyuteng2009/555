layout = window.layout || {};
var locate = window.location;
layout.protocol = locate.protocol;
var href = locate.href;
if (href.indexOf("debugger") !== -1) layout.debugger = true;
layout.desktop = layout;
layout.session = layout.session || {};

o2.addReady(function () {
  o2.load(["../o2_lib/mootools/plugin/mBox.Notice.js", "../o2_lib/mootools/plugin/mBox.Tooltip.js"], { "sequence": true }, function () {
    MWF.loadLP("zh-cn");
    MWF.require("MWF.xDesktop.Layout", function () {
      MWF.require("MWF.xDesktop.Authentication", null, false);
      MWF.require("MWF.xDesktop.Common", null, false);

      (function () {
        layout.load = function () {
          var uri = href.toURI();
          var redirect = uri.getData("redirect");
          MWF.require("MWF.xDesktop.Actions.RestActions", function () {
            var action = new MWF.xDesktop.Actions.RestActions("", "x_organization_assemble_authentication", "");
            action.getActions = function (actionCallback) {
              this.actions = {
                "auth": { "uri": "/jaxrs/welink/code/{code}" }
              };
              if (actionCallback) actionCallback();
            };

            HWH5.getAuthCode().then(function (data) {
              console.log(data.code);
              action.invoke({
                "name": "auth",
                "async": true,
                "parameter": { "code": data.code },
                "success": function (json) {
                  layout.session.user = json.data;
                  if (redirect) {
                    history.replaceState(null, "page", redirect);
                    redirect.toURI().go();
                  } else {
                    history.replaceState(null, "page", "../x_desktop/appMobile.html?app=process.TaskCenter");
                    "appMobile.html?app=process.TaskCenter".toURI().go();
                  }
                }.bind(this),
                "failure": function (xhr, text, error) {
                  history.replaceState(null, "page", "../x_desktop/appMobile.html?app=process.TaskCenter");
                  "appMobile.html?app=process.TaskCenter".toURI().go();
                }.bind(this)
              });
            }).catch(function (error) {
              console.log('获取异常', error);
            });

           


            // action.invoke({
            //     "name": "info", "async": true, "data": { "url": href }, "success": function (json) {
            //         var _config = json.data;
            //         //document.all.testaaa.set("value", "0");
            //         dd.config({
            //             agentId: _config.agentid,
            //             corpId: _config.corpId,
            //             timeStamp: _config.timeStamp,
            //             nonceStr: _config.nonceStr,
            //             signature: _config.signature,
            //             jsApiList: ['runtime.info']
            //         });

            //         //document.all.testaaa.set("value", "1");
            //         // dd.biz.navigation.setTitle({
            //         //     title: ''
            //         // });
            //         // dd.runtime.info({
            //         //     onSuccess : function(info) {
            //         //         logger.e('runtime info: ' + JSON.stringify(info));
            //         //     },
            //         //     onFail : function(err) {
            //         //         logger.e('fail: ' + JSON.stringify(err));
            //         //     }
            //         // });
            //         //document.all.testaaa.set("value", "before");
            //         dd.runtime.permission.requestAuthCode({

            //             corpId: _config.corpId,
            //             onSuccess: function (info) {
            //                 action.invoke({
            //                     "name": "auth", "async": true, "parameter": { "code": info.code },
            //                     "success": function (json) {
            //                         //document.all.testaaa.set("value", "auth");
            //                         // "appMobile.html?app=process.TaskCenter".toURI().go();

            //                         if (redirect) {
            //                             history.replaceState(null, "page", redirect);
            //                             redirect.toURI().go();
            //                         } else {
            //                             history.replaceState(null, "page", "../x_desktop/appMobile.html?app=process.TaskCenter");
            //                             "appMobile.html?app=process.TaskCenter".toURI().go();
            //                         }

            //                     }.bind(this), "failure": function (xhr, text, error) {
            //                         history.replaceState(null, "page", "../x_desktop/appMobile.html?app=process.TaskCenter");
            //                         "appMobile.html?app=process.TaskCenter".toURI().go();
            //                     }.bind(this)
            //                 });
            //             }.bind(this),
            //             onFail: function (err) { }
            //         });


            //     }.bind(this), "failure": function (xhr, text, error) { }.bind(this)
            // });

          });
        };

        layout.isAuthentication = function () {
          layout.authentication = new MWF.xDesktop.Authentication({
            "onLogin": layout.load.bind(layout)
          });

          var returnValue = true;
          this.authentication.isAuthenticated(function (json) {
            this.user = json.data;
            layout.session.user = json.data;
          }.bind(this), function () {
            this.authentication.loadLogin(this.node);
            returnValue = false;
          }.bind(this));
          return returnValue;
        };

        layout.notice = function (content, type, target, where, offset) {
          if (!where) where = { "x": "right", "y": "top" };
          if (!target) target = this.content;
          if (!type) type = "ok";
          var noticeTarget = target || $(document.body);
          var off = offset;
          if (!off) {
            off = {
              x: 10,
              y: where.y.toString().toLowerCase() == "bottom" ? 10 : 10
            };
          }

          new mBox.Notice({
            type: type,
            position: where,
            move: false,
            target: noticeTarget,
            delayClose: (type == "error") ? 10000 : 5000,
            offset: off,
            content: content
          });
        };

        MWF.getJSON("res/config/config.json", function (config) {
          if (config.proxyCenterEnable){
            if (o2.typeOf(config.center)==="array"){
              config.center.forEach(function(c){
                c.port = window.location.port || 80;
              });
            }else{
              config.port = window.location.port || 80;
            }
          }
          layout.config = config;
          o2.tokenName = config.tokenName || "x-token";
          MWF.xDesktop.getServiceAddress(layout.config, function (service, center) {
            layout.serviceAddressList = service;
            layout.centerServer = center;
            layout.load();
          }.bind(this));
        });

      })();

    });
  });
});
