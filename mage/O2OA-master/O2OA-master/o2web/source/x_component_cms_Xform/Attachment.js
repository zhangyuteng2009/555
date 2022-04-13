MWF.xDesktop.requireApp("process.Xform", "Attachment", null, false);
//MWF.xDesktop.requireApp("cms.FormDesigner", "widget.AttachmentController", null, false);
MWF.xApplication.cms.Xform.AttachmentController = new Class({
    Extends: MWF.xApplication.process.Xform.AttachmentController,
    "options": {
        "checkTextEnable": false
    },
    openInOfficeControl: function (att, office) {
        if (office) {
            if (!office.openedAttachment || office.openedAttachment.id !== att.id) {
                office.save();
                MWF.Actions.get("x_cms_assemble_control").getAttachmentUrl(att.id, this.module.form.businessData.document.id, function (url) {
                    office.openedAttachment = { "id": att.id, "site": this.module.json.name, "name": att.name };
                    office.officeOCX.BeginOpenFromURL(url, true, this.readonly);
                }.bind(this));
            }
        }
    },
    setAttachmentConfig: function (readInput, editInput, controllerInput) {
        if (this.selectedAttachments.length) {
            var readList = readInput.retrieve("data-value");
            var editList = editInput.retrieve("data-value");
            var controllerList = controllerInput.retrieve("data-value");

            var readUnitList = [];
            var readIdentityList = [];
            var editUnitList = [];
            var editIdentityList = [];
            var controllerUnitList = [];
            var controllerIdentityList = [];

            if (readList) {
                readList.each(function (v) {
                    var vName = (typeOf(v) === "string") ? v : v.distinguishedName;
                    var len = vName.length;
                    var flag = vName.substring(len - 1, len);
                    if (flag === "U") readUnitList.push(vName);
                    if (flag === "I") readIdentityList.push(vName);
                });
            }
            if (editList) {
                editList.each(function (v) {
                    var vName = (typeOf(v) === "string") ? v : v.distinguishedName;
                    var len = vName.length;
                    var flag = vName.substring(len - 1, len);
                    if (flag === "U") editUnitList.push(vName);
                    if (flag === "I") editIdentityList.push(vName);
                });
            }
            if (controllerList) {
                controllerList.each(function (v) {
                    var vName = (typeOf(v) === "string") ? v : v.distinguishedName;
                    var len = vName.length;
                    var flag = vName.substring(len - 1, len);
                    if (flag === "U") controllerUnitList.push(vName);
                    if (flag === "I") controllerIdentityList.push(vName);
                });
            }

            this.selectedAttachments.each(function (att) {
                att.data.readUnitList = readUnitList;
                att.data.readIdentityList = readIdentityList;
                att.data.editUnitList = editUnitList;
                att.data.editIdentityList = editIdentityList;
                att.data.controllerUnitList = controllerUnitList;
                att.data.controllerIdentityList = controllerIdentityList;

                o2.Actions.get("x_cms_assemble_control").configAttachment(att.data.id, this.module.form.businessData.document.id, att.data);
            }.bind(this));
        }
    },
    sortByNumber: function( attachments ){
        return attachments.sort(function (a1, a2) {
            if (!a2.data.seqNumber) return 1;
            if (!a1.data.seqNumber) return -1;
            return a1.data.seqNumber - a2.data.seqNumber;
        }.bind(this));
    },
    sortAttachment: function (node) {
        var nodes = node.getChildren();
        nodes.each(function (item, idx) {
            var att = item.retrieve("att", null);
            if (att) {
                att.data.seqNumber = idx;
                o2.Actions.load("x_cms_assemble_control").FileInfoAction.changeSeqNumber(att.data.id, this.module.form.businessData.document.id, idx);
            }
        }.bind(this));
        this.attachments = this.attachments.sort(function (a1, a2) {
            if (!a2.data.seqNumber) return 1;
            if (!a1.data.seqNumber) return -1;
            return a1.data.seqNumber - a2.data.seqNumber;
        }.bind(this));

        this.reloadAttachments();
        this.fireEvent("order");
    }
});
MWF.xApplication.cms.Xform.Attachment = MWF.CMSAttachment = new Class({
    Extends: MWF.APPAttachment,

    _loadUserInterface: function () {
        this.node.empty();
        this.loadAttachmentController();
        this.fireEvent("load");
    },

    loadAttachmentController: function () {
        //MWF.require("MWF.widget.AttachmentController", function() {
        var options = {
            "style": this.json.style || "default",
            "title": MWF.xApplication.cms.Xform.LP.attachmentArea,
            "listStyle": this.json.listStyle || "icon",
            "size": this.json.size || "max",
            "resize": (this.json.resize === "y" || this.json.resize === "true"),
            "attachmentCount": this.json.attachmentCount || 0,
            "isUpload": (this.json.isUpload === "y" || this.json.isUpload === "true"),
            "isDelete": (this.json.isDelete === "y" || this.json.isDelete === "true"),
            "isReplace": (this.json.isReplace === "y" || this.json.isReplace === "true"),
            "isDownload": (this.json.isDownload === "y" || this.json.isDownload === "true"),
            "isPreviewAtt": (this.json.isPreviewAtt === "y" || this.json.isPreviewAtt === "true"),
            "isSizeChange": (this.json.isSizeChange === "y" || this.json.isSizeChange === "true"),
            "readonly": (this.json.readonly === "y" || this.json.readonly === "true" || this.json.isReadonly),
            "availableListStyles": this.json.availableListStyles ? this.json.availableListStyles : ["list", "seq", "icon", "preview"],
            "isDeleteOption": this.json.isDelete,
            "isReplaceOption": this.json.isReplace,
            "toolbarGroupHidden": this.json.toolbarGroupHidden || [],
            "onOrder": function () {
                this.fireEvent("change");
            }.bind(this)
            //"downloadEvent" : this.json.downloadEvent
        };
        if (this.readonly) options.readonly = true;
        if (this.form.json && this.form.json.attachmentStyle) {
            options = Object.merge(options, this.form.json.attachmentStyle);
        }

        this.fireEvent("queryLoadController", [options]);

        this.attachmentController = new MWF.xApplication.cms.Xform.AttachmentController(this.node, this, options);

        this.fireEvent("loadController");

        this.attachmentController.load();

        this.fireEvent("postLoadController");

        this.form.businessData.attachmentList.each(function (att) {
            if (att.site === (this.json.site || this.json.id)) this.attachmentController.addAttachment(att);
            //if (att.fileType.toLowerCase()==this.json.id.toLowerCase()) this.attachmentController.addAttachment(att);
        }.bind(this));
        this.setAttachmentBusinessData();
        //}.bind(this));
    },
    loadAttachmentSelecter: function (option, callback) {
        MWF.require("MWF.widget.AttachmentSelector", function () {
            var options = {
                //"style" : "cms",
                "title": MWF.xApplication.cms.Xform.LP.selectAttachment, //"选择附件",
                "listStyle": "icon",
                "selectType": "all",
                "size": "max",
                "attachmentCount": 0,
                "isUpload": true,
                "isDelete": true,
                "isReplace": true,
                "isDownload": true,
                "toBase64": true,
                "base64MaxSize": 800,
                "readonly": false
            };
            options = Object.merge(options, option);
            if (this.readonly) options.readonly = true;
            this.attachmentController = new MWF.widget.AttachmentSelector(this.node, this, options);
            this.attachmentController.load();

            this.postSelect = callback;

            this.form.businessData.attachmentList.each(function (att) {
                this.attachmentController.addAttachment(att);
            }.bind(this));
        }.bind(this));
    },
    selectAttachment: function (e, node, attachments) {
        //if( attachments.length > 0 ){
        //    this.form.documentAction.getAttachmentUrl(attachments[attachments.length-1].data.id, this.form.businessData.document.id, function(url){
        //        if(this.postSelect)this.postSelect( url )
        //    }.bind(this))
        //}
        if (attachments.length > 0) {
            var data = attachments[attachments.length - 1].data;
            this.form.documentAction.getAttachmentUrl(data.id, this.form.businessData.document.id, function (url) {
                if (this.attachmentController.options.toBase64) {
                    this.form.documentAction.getSubjectAttachmentBase64(data.id, this.attachmentController.options.base64MaxSize, function (json) {
                        var base64Code = json.data ? "data:image/png;base64," + json.data.value : null;
                        if (this.postSelect) this.postSelect(url, data, base64Code)
                    }.bind(this))
                } else {
                    if (this.postSelect) this.postSelect(url, data)
                }
            }.bind(this))
        }
    },
    createUploadFileNode: function (files) {
        var accept = "*";
        if (!this.json.attachmentExtType || (this.json.attachmentExtType.indexOf("other") != -1 && !this.json.attachmentExtOtherType)) {
        } else {
            accepts = [];
            var otherType = this.json.attachmentExtOtherType;
            this.json.attachmentExtType.each(function (v) {
                switch (v) {
                    case "word":
                        accepts.push(".doc, .docx, .dot, .dotx");
                        break;
                    case "excel":
                        accepts.push(".xls, .xlsx, .xlsm, .xlt, .xltx");
                        break;
                    case "ppt":
                        accepts.push(".pptx, .ppt, .pot, .potx, .potm");
                        break;
                    case "txt":
                        accepts.push(".txt");
                        break;
                    case "pic":
                        accepts.push(".bmp, .gif, .psd, .jpeg, .jpg, .png");
                        break;
                    case "pdf":
                        accepts.push(".pdf");
                        break;
                    case "zip":
                        accepts.push(".zip, .rar");
                        break;
                    case "audio":
                        accepts.push(".mp3, .wav, .wma, .wmv, .flac, .ape");
                        break;
                    case "video":
                        accepts.push(".avi, .mkv, .mov, .ogg, .mp4, .mpeg");
                        break;
                    case "other":
                        if (this.json.attachmentExtOtherType) accepts.push(this.json.attachmentExtOtherType);
                        break;
                }
            }.bind(this));
            accept = accepts.join(", ");
        }
        var size = 0;
        if (this.json.attachmentSize) size = this.json.attachmentSize.toFloat();
        debugger;
        this.attachmentController.doUploadAttachment({ "site": this.json.id }, this.form.documentAction.action, "uploadAttachment", { "id": this.form.businessData.document.id }, null, function (o) {
            if (o.id) {
                this.form.documentAction.getAttachment(o.id, this.form.businessData.document.id, function (json) {
                    if (json.data) {
                        if (!json.data.control) json.data.control = {};
                        this.attachmentController.addAttachment(json.data, o.messageId);
                        this.form.businessData.attachmentList.push(json.data);
                    }
                    this.attachmentController.checkActions();

                    this.setAttachmentBusinessData();
                    this.fireEvent("upload", [json.data]);
                    this.fireEvent("change");
                }.bind(this))
            }
            this.attachmentController.checkActions();
        }.bind(this), function (files) {
            if (files.length) {
                if ((files.length + this.attachmentController.attachments.length > this.attachmentController.options.attachmentCount) && this.attachmentController.options.attachmentCount > 0) {
                    var content = MWF.xApplication.cms.Xform.LP.uploadMore;
                    content = content.replace("{n}", this.attachmentController.options.attachmentCount);
                    this.form.notice(content, "error");
                    return false;
                }
            }
            this.fireEvent("beforeUpload", [files]);
            return true;
        }.bind(this), true, accept, size, function (o) { //错误的回调
            if (o.messageId && this.attachmentController.messageItemList) {
                var message = this.attachmentController.messageItemList[o.messageId];
                if( message && message.node )message.node.destroy();
            }
        }.bind(this), files);

        // this.uploadFileAreaNode = new Element("div");
        // var html = "<input name=\"file\" type=\"file\" multiple/>";
        // this.uploadFileAreaNode.set("html", html);
        //
        // this.fileUploadNode = this.uploadFileAreaNode.getFirst();
        // this.fileUploadNode.addEvent("change", function(){
        //     this.validationMode();
        //     var files = this.fileUploadNode.files;
        //     if (files.length){
        //         if ((files.length+this.attachmentController.attachments.length > this.attachmentController.options.attachmentCount) && this.attachmentController.options.attachmentCount>0){
        //             var content = MWF.xApplication.cms.Xform.LP.uploadMore;
        //             content = content.replace("{n}", this.attachmentController.options.attachmentCount);
        //             this.form.notice(content, "error");
        //         }else{
        //             for (var i = 0; i < files.length; i++) {
        //                 var file = files.item(i);
        //
        //                 var formData = new FormData();
        //                 formData.append('file', file);
        //                 formData.append('site', this.json.id);
        //                 //formData.append('folder', folderId);
        //
        //                 this.form.documentAction.uploadAttachment(this.form.businessData.document.id ,function(o, text){
        //                     if (o.id){
        //                         this.form.documentAction.getAttachment(o.id, this.form.businessData.document.id, function(json){
        //                             if (json.data){
        //                                 this.attachmentController.addAttachment(json.data);
        //                                 this.form.businessData.attachmentList.push(json.data);
        //                             }
        //                             this.attachmentController.checkActions();
        //
        //                             this.fireEvent("upload", [json.data]);
        //                         }.bind(this))
        //                     }
        //                     this.attachmentController.checkActions();
        //                 }.bind(this), null, formData, file);
        //             }
        //         }
        //     }
        // }.bind(this));
    },

    deleteAttachments: function (e, node, attachments) {
        var names = [];
        attachments.each(function (attachment) {
            names.push(attachment.data.name);
        }.bind(this));

        var _self = this;
        this.form.confirm("warn", e, MWF.xApplication.cms.Xform.LP.deleteAttachmentTitle, MWF.xApplication.cms.Xform.LP.deleteAttachment + "( " + names.join(", ") + " )", 300, 120, function () {
            while (attachments.length) {
                var attachment = attachments.shift();
                _self.deleteAttachment(attachment);
            }
            this.close();
        }, function () {
            this.close();
        }, null, null, this.form.json.confirmStyle);
    },
    deleteAttachment: function (attachment) {
        this.fireEvent("delete", [attachment.data]);
        var id = attachment.data.id;
        this.form.documentAction.deleteAttachment(attachment.data.id, function (json) {
            this.attachmentController.removeAttachment(attachment);
            //this.form.businessData.attachmentList.erase( attachment.data )
            this.attachmentController.checkActions();

            for( var i=0; i<this.form.businessData.attachmentList.length; i++ ){
                var attData = this.form.businessData.attachmentList[i];
                if( attData.id === id ){
                    this.form.businessData.attachmentList.erase(attData);
                    break;
                }
            }

            if (this.form.officeList) {
                this.form.officeList.each(function (office) {
                    if (office.openedAttachment) {
                        if (office.openedAttachment.id == id) {
                            office.loadOfficeEdit();
                        }
                    }
                }.bind(this));
            }
            this.setAttachmentBusinessData();
            this.fireEvent("afterDelete", [attachment.data]);
            this.fireEvent("change");
        }.bind(this));
    },

    createReplaceFileNode: function (attachment) {
        var accept = "*";
        if (!this.json.attachmentExtType || this.json.attachmentExtType.indexOf("other") != -1 && !this.json.attachmentExtOtherType) {
        } else {
            accepts = [];
            var otherType = this.json.attachmentExtOtherType;
            this.json.attachmentExtType.each(function (v) {
                switch (v) {
                    case "word":
                        accepts.push(".doc, .docx, .dot, .dotx");
                        break;
                    case "excel":
                        accepts.push(".xls, .xlsx, .xlsm, .xlt, .xltx");
                        break;
                    case "ppt":
                        accepts.push(".pptx, .ppt, .pot, .potx, .potm");
                        break;
                    case "txt":
                        accepts.push(".txt");
                        break;
                    case "pic":
                        accepts.push(".bmp, .gif, .psd, .jpeg, .jpg");
                        break;
                    case "pdf":
                        accepts.push(".pdf");
                        break;
                    case "zip":
                        accepts.push(".zip, .rar");
                        break;
                    case "audio":
                        accepts.push(".mp3, .wav, .wma, .wmv, .flac, .ape");
                        break;
                    case "video":
                        accepts.push(".avi, .mkv, .mov, .ogg, .mp4, .mpeg");
                        break;
                    case "other":
                        if (this.json.attachmentExtOtherType) accepts.push(this.json.attachmentExtOtherType);
                        break;
                }
            });
            accept = accepts.join(", ");
        }
        var size = 0;
        if (this.json.attachmentSize) size = this.json.attachmentSize.toFloat();
        this.attachmentController.doUploadAttachment({ "site": (this.json.site || this.json.id) }, this.form.documentAction.action, "replaceAttachment",
            { "id": attachment.data.id, "documentid": this.form.businessData.document.id }, null, function (o) {
                this.form.documentAction.getAttachment(attachment.data.id, this.form.businessData.document.id, function (json) {
                    if (!json.data.control) json.data.control = {};
                    attachment.data = json.data;
                    attachment.reload();

                    if (o.messageId && this.attachmentController.messageItemList) {
                        var message = this.attachmentController.messageItemList[o.messageId];
                        if( message && message.node )message.node.destroy();
                    }

                    this.attachmentController.checkActions();
                }.bind(this))
            }.bind(this), null, true, accept, size, function (o) { //错误的回调
                if (o.messageId && this.attachmentController.messageItemList) {
                    var message = this.attachmentController.messageItemList[o.messageId];
                    if( message && message.node )message.node.destroy();
                }
            }.bind(this));

        // this.replaceFileAreaNode = new Element("div");
        // var html = "<input name=\"file\" type=\"file\" multiple/>";
        // this.replaceFileAreaNode.set("html", html);
        //
        // this.fileReplaceNode = this.replaceFileAreaNode.getFirst();
        // this.fileReplaceNode.addEvent("change", function(){
        //     var files = this.fileReplaceNode.files;
        //     if (files.length){
        //         for (var i = 0; i < files.length; i++) {
        //             var file = files.item(i);
        //
        //             var formData = new FormData();
        //             formData.append('file', file);
        //             //    formData.append('site', this.json.id);
        //
        //             this.form.documentAction.replaceAttachment(attachment.data.id, this.form.businessData.document.id ,function(o, text){
        //                 this.form.documentAction.getAttachment(attachment.data.id, this.form.businessData.document.id, function(json){
        //                     attachment.data = json.data;
        //                     attachment.reload();
        //                     this.attachmentController.checkActions();
        //                 }.bind(this))
        //             }.bind(this), null, formData, file);
        //         }
        //     }
        // }.bind(this));
    },

    //小程序文件是否支持打开
    checkMiniProgramFile: function(ext) {
        var exts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf"];
        for(var i = 0; i < exts.length; i++){
            if(ext === exts[i]){
                return true;
            }
        }
        return false;
    },
    downloadAttachment: function (e, node, attachments) {
        if (this.form.businessData.document) {
            attachments.each(function (att) {
                if (window.o2android && window.o2android.downloadAttachment) {
                    window.o2android.downloadAttachment(att.data.id);
                } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.downloadAttachment) {
                    window.webkit.messageHandlers.downloadAttachment.postMessage({ "id": att.data.id, "site": this.json.id });
                } else if (window.wx && window.__wxjs_environment === 'miniprogram' && this.checkMiniProgramFile(att.data.extension)) { //微信小程序
                    wx.miniProgram.navigateTo({ 
                        url: '../file/download?attId=' + att.data.id + '&type=cms&documentId=' + this.form.businessData.document.id
                    });
                } else {
                    if (layout.mobile) {
                        //移动端 企业微信 钉钉 用本地打开 防止弹出自带浏览器 无权限问题
                        this.form.documentAction.getAttachmentUrl(att.data.id, this.form.businessData.document.id, function (url) {
                            var xtoken = Cookie.read(o2.tokenName);
                            window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                        });
                    } else {
                        this.form.documentAction.getAttachmentStream(att.data.id, this.form.businessData.document.id);
                    }
                }
                this.fireEvent("download",[att])
            }.bind(this));
        }
    },
    openAttachment: function (e, node, attachments) {
        if (this.form.businessData.document) {
            attachments.each(function (att) {
                if (window.o2android && window.o2android.downloadAttachment) {
                    window.o2android.downloadAttachment(att.data.id);
                } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.downloadAttachment) {
                    window.webkit.messageHandlers.downloadAttachment.postMessage({ "id": att.data.id, "site": this.json.id });
                } else if (window.wx && window.__wxjs_environment === 'miniprogram' && this.checkMiniProgramFile(att.data.extension)) { //微信小程序
                    wx.miniProgram.navigateTo({ 
                        url: '../file/download?attId=' + att.data.id + '&type=cms&documentId=' + this.form.businessData.document.id
                    });
                } else {
                    if (layout.mobile) {
                        //移动端 企业微信 钉钉 用本地打开 防止弹出自带浏览器 无权限问题
                        this.form.documentAction.getAttachmentUrl(att.data.id, this.form.businessData.document.id, function (url) {
                            var xtoken = Cookie.read(o2.tokenName);
                            window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                        });
                    } else {
                        this.form.documentAction.getAttachmentData(att.data.id, this.form.businessData.document.id);
                    }

                }
                this.fireEvent("open",[att])
            }.bind(this));
        }
        //this.downloadAttachment(e, node, attachment);
    },
    getAttachmentUrl: function (attachment, callback) {
        if (this.form.businessData.document) {
            this.form.documentAction.getAttachmentUrl(attachment.data.id, this.form.businessData.document.id, callback);
        }
    },
    getTextData: function(){
        var data = [];
        this.attachmentController.attachments.each(function(att){
            var o = {
                "id": att.data.id,
                "person": att.data.person,
                "creatorUid": att.data.creatorUid,
                "name": att.data.name,
                "seqNumber": att.data.seqNumber,
                "length": att.data.length,
                "extension": att.data.extension,
                "lastUpdateTime": att.data.lastUpdateTime,
                "activityName": att.data.activityName,
                "control" : att.data.control
            }
            data.push(o);
        });
        return data;
    },
    validationConfigItem: function (routeName, data) {
        var flag = (data.status == "all") ? true : (routeName == "publish");
        if (flag) {
            var n = this.getData() || [];
            var v = (data.valueType == "value") ? n : n.length;
            switch (data.operateor) {
                case "isnull":
                    if (!v) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "notnull":
                    if (v) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "gt":
                    if (v > data.value) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "lt":
                    if (v < data.value) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "equal":
                    if (v == data.value) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "neq":
                    if (v != data.value) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "contain":
                    if (v.indexOf(data.value) != -1) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
                case "notcontain":
                    if (v.indexOf(data.value) == -1) {
                        this.notValidationMode(data.prompt);
                        return false;
                    }
                    break;
            }
        }
        return true;
    }
});
MWF.xApplication.cms.Xform.AttachmentDg = MWF.CMSAttachmentDg = new Class({
    Extends: MWF.CMSAttachment,
    loadAttachmentController: function () {
        //MWF.require("MWF.widget.AttachmentController", function() {
        var options = {
            "style": this.json.style || "default",
            "title": MWF.xApplication.process.Xform.LP.attachmentArea,
            "listStyle": this.json.listStyle || "icon",
            "size": this.json.size || "max",
            "resize": (this.json.resize === "y" || this.json.resize === "true"),
            "attachmentCount": this.json.attachmentCount || 0,
            "isUpload": (this.json.isUpload === "y" || this.json.isUpload === "true"),
            "isDelete": (this.json.isDelete === "y" || this.json.isDelete === "true"),
            "isReplace": (this.json.isReplace === "y" || this.json.isReplace === "true"),
            "isDownload": (this.json.isDownload === "y" || this.json.isDownload === "true"),
            "isSizeChange": (this.json.isSizeChange === "y" || this.json.isSizeChange === "true"),
            "readonly": (this.json.readonly === "y" || this.json.readonly === "true" || this.json.isReadonly),
            "availableListStyles": this.json.availableListStyles ? this.json.availableListStyles : ["list", "seq", "icon", "preview"],
            "isDeleteOption": this.json.isDelete,
            "isReplaceOption": this.json.isReplace,
            "toolbarGroupHidden": this.json.toolbarGroupHidden || [],
            "ignoreSite": this.json.ignoreSite,
            "onOrder": function () {
                this.fireEvent("change");
            }.bind(this)
        };
        if (this.readonly) options.readonly = true;
        if (this.form.json.attachmentStyle) {
            options = Object.merge(options, this.form.json.attachmentStyle);
        }

        this.fireEvent("queryLoadController", [options]);

        this.attachmentController = new MWF.xApplication.process.Xform.AttachmentController(this.node, this, options);

        this.fireEvent("loadController");

        this.attachmentController.load();

        this.fireEvent("postLoadController");

        // var d = this._getBusinessData();
        // if (d) d.each(function (att) {
        //     this.attachmentController.addAttachment(att);
        // }.bind(this));
        if(this.json.ignoreSite) {
            ( this._getBusinessData() || [] ).each(function (att) {
                var flag = this.form.businessData.attachmentList.some(function (attData) {
                    return att.id === attData.id;
                }.bind(this));
                if(flag)this.attachmentController.addAttachment(att);
            }.bind(this));
        }else{
            this.form.businessData.attachmentList.each(function (att) {
                if (att.site === (this.json.site || this.json.id)) this.attachmentController.addAttachment(att);
            }.bind(this));
        }
        this.setAttachmentBusinessData();
    },
    setAttachmentBusinessData: function(){
        if (this.attachmentController) {
            if (this.attachmentController.attachments.length) {
                var values = this.attachmentController.attachments.map(function (d) {
                    return {
                        "control": d.data.control,
                        "name": d.data.name,
                        "id": d.data.id,
                        "person": d.data.person,
                        "creatorUid": d.data.creatorUid,
                        "seqNumber": d.data.seqNumber,
                        "length": d.data.length,
                        "extension": d.data.extension,
                        "lastUpdateTime": d.data.lastUpdateTime,
                        "activityName": d.data.activityName
                    };
                });
                this._setBusinessData(values);
            } else {
                this._setBusinessData([]);
            }
        }
    },
    uploadAttachment: function (e, node, files) {
        debugger;
        if (window.o2android && window.o2android.uploadAttachmentForDatagrid) {
            window.o2android.uploadAttachmentForDatagrid((this.json.site || this.json.id), this.json.id);
        } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.uploadAttachmentForDatagrid) {
            window.webkit.messageHandlers.uploadAttachmentForDatagrid.postMessage({ "site": (this.json.site || this.json.id) , "param":this.json.id});
        } else {
            // if (!this.uploadFileAreaNode){
            this.createUploadFileNode(files);
            // }
            // this.fileUploadNode.click();
        }
    },
    replaceAttachment: function (e, node, attachment) {
        if (window.o2android && window.o2android.replaceAttachmentForDatagrid) {
            window.o2android.replaceAttachmentForDatagrid(attachment.data.id, (this.json.site || this.json.id), this.json.id);
        } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.replaceAttachmentForDatagrid) {
            window.webkit.messageHandlers.replaceAttachmentForDatagrid.postMessage({ "id": attachment.data.id, "site": (this.json.site || this.json.id) , "param":this.json.id});
        } else {
            var _self = this;
            this.form.confirm("warn", e, MWF.xApplication.process.Xform.LP.replaceAttachmentTitle, MWF.xApplication.process.Xform.LP.replaceAttachment + "( " + attachment.data.name + " )", 350, 120, function () {
                _self.replaceAttachmentFile(attachment);
                this.close();
            }, function () {
                this.close();
            }, null, null, this.form.json.confirmStyle);
        }
    }
});
