MWF.xDesktop.requireApp("process.Xform", "$Module", null, false);
MWF.require("MWF.widget.AttachmentController", null, false);
MWF.xApplication.process.Xform.AttachmentController = new Class({
    Extends: MWF.widget.ATTER,
    "options": {
        "officeFiles": ["doc", "docx", "dotx", "dot", "xls", "xlsx", "xlsm", "xlt", "xltx", "pptx", "ppt", "pot", "potx", "potm", "pdf"],
        "allowPreviewExtension" : ["zip","pdf", "ofd", "png", "jpg", "bmp", "jpeg", "gif", "js", "css", "java", "json", "xml", "php", "html", "htm", "xhtml", "log", "md", "txt"],
        "checkTextEnable": true
    },
    checkAttachmentDeleteAction: function () {
        if (this.options.readonly) {
            this.setAttachmentsAction("delete", false);
            return false;
        }
        if (this.options.isDeleteOption !== "n") {
            if (this.attachments.length) {
                var user = layout.session.user.distinguishedName;

                for (var i = 0; i < this.attachments.length; i++) {
                    var flag = true;
                    var att = this.attachments[i];
                    if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;
                    if (this.options.isDeleteOption === "o") {

                        if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
                        if (att.data.person !== layout.desktop.session.user.distinguishedName) flag = false;

                    } else if (this.options.isDeleteOption === "a") {

                        if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
                        if (att.data.activity !== this.module.form.businessData.activity.id) flag = false;

                    } else if (this.options.isDeleteOption === "ao") {

                        if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
                        if ((att.data.activity !== this.module.form.businessData.activity.id) || (att.data.person !== layout.desktop.session.user.distinguishedName)) flag = false;

                    } else {
                        if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
                    }

                    if (flag) {
                        this.setAttachmentAction(att, "delete", true);
                    } else {
                        this.setAttachmentAction(att, "delete", false);
                    }
                }
            }

        } else {
            this.setAttachmentsAction("delete", false);
        }
    },
    checkDeleteAction: function () {

        this.checkAttachmentDeleteAction();

        if (this.options.readonly) {
            this.setActionDisabled(this.deleteAction);
            this.setActionDisabled(this.min_deleteAction);
            return false;
        }
        if (this.options.isDeleteOption !== "n") {
            if (this.selectedAttachments.length) {
                var user = layout.session.user.distinguishedName;
                var flag = true;
                if (this.options.isDeleteOption === "o") {
                    for (var i = 0; i < this.selectedAttachments.length; i++) {
                        var att = this.selectedAttachments[i];
                        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;
                        if (!att.data.control.allowEdit && att.data.person !== user) {
                            flag = false;
                            break;
                        }
                        if (att.data.person !== layout.desktop.session.user.distinguishedName) {
                            flag = false;
                            break;
                        }
                    }
                } else if (this.options.isDeleteOption === "a") {
                    for (var i = 0; i < this.selectedAttachments.length; i++) {
                        var att = this.selectedAttachments[i];
                        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;
                        if (!att.data.control.allowEdit && att.data.person !== user) {
                            flag = false;
                            break;
                        }
                        if (att.data.activity !== this.module.form.businessData.activity.id) {
                            flag = false;
                            break;
                        }
                    }
                } else if (this.options.isDeleteOption === "ao") {
                    for (var i = 0; i < this.selectedAttachments.length; i++) {
                        var att = this.selectedAttachments[i];
                        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;
                        if (!att.data.control.allowEdit && att.data.person !== user) {
                            flag = false;
                            break;
                        }
                        if ((att.data.activity !== this.module.form.businessData.activity.id) || (att.data.person !== layout.desktop.session.user.distinguishedName)) {
                            flag = false;
                            break;
                        }
                    }
                } else {
                    for (var i = 0; i < this.selectedAttachments.length; i++) {
                        var att = this.selectedAttachments[i];
                        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;
                        if (!att.data.control.allowEdit && att.data.person !== user) {
                            flag = false;
                            break;
                        }
                    }
                }

                if (flag) {
                    this.setActionEnabled(this.deleteAction);
                    this.setActionEnabled(this.min_deleteAction);
                } else {
                    this.setActionDisabled(this.deleteAction);
                    this.setActionDisabled(this.min_deleteAction);
                }
            } else {
                this.setActionDisabled(this.deleteAction);
                this.setActionDisabled(this.min_deleteAction);
            }
        } else {
            // if (!this.options.isDelete){
            this.setActionDisabled(this.deleteAction);
            this.setActionDisabled(this.min_deleteAction);
            // }else{
            //     if (this.selectedAttachments.length){
            //         this.setActionEnabled(this.deleteAction);
            //         this.setActionEnabled(this.min_deleteAction);
            //     }else{
            //         this.setActionDisabled(this.deleteAction);
            //         this.setActionDisabled(this.min_deleteAction);
            //     }
            // }
        }
    },
    checkPreviewAttAction: function () {
        if(layout.mobile){
            this.setActionDisabled(this.previewAttAction);
        } else if (!this.options.isPreviewAtt){
            this.setActionDisabled(this.previewAttAction);
            //this.setActionDisabled(this.min_downloadAction);
        }else{
            if (this.selectedAttachments.length){
                var flag = false;
                for (var i = 0; i < this.selectedAttachments.length; i++) {
                    var att = this.selectedAttachments[i];
                    if (this.options.allowPreviewExtension.contains(att.data.extension)) {
                        flag = true;
                        break;
                    }
                    if (["doc","docx","xls","xlsx","ppt","pptx"].contains(att.data.extension)) {
                        if(layout.config.previewOffice){
                            flag = true;
                            break;
                        }
                    }
                }
                if(flag){
                    this.setActionEnabled(this.previewAttAction);
                    //this.setActionEnabled(this.min_downloadAction);
                }

            }else{
                this.setActionDisabled(this.previewAttAction);
                //this.setActionDisabled(this.min_downloadAction);
            }
        }
    },
    isAttDeleteAvailable: function (att) {
        if (this.options.readonly) return false;
        if (this.options.toolbarGroupHidden.contains("edit")) return false;
        if (this.options.isDeleteOption === "n") return false;

        var user = layout.session.user.distinguishedName;
        var flag = true;

        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;

        if (this.options.isDeleteOption === "o") {

            if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
            if (att.data.person !== layout.desktop.session.user.distinguishedName) flag = false;

        } else if (this.options.isDeleteOption === "a") {

            if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
            if (att.data.activity !== this.module.form.businessData.activity.id) flag = false;

        } else if (this.options.isDeleteOption === "ao") {

            if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
            if ((att.data.activity !== this.module.form.businessData.activity.id) || (att.data.person !== layout.desktop.session.user.distinguishedName)) flag = false;

        } else {
            if (!att.data.control.allowEdit && att.data.person !== user) flag = false;
        }

        return flag;
    },
    openInOfficeControl: function (att, office) {
        if (office) {
            if (!office.openedAttachment || office.openedAttachment.id !== att.id) {
                office.save();
                if (this.module.form.businessData.workCompleted) {
                    MWF.Actions.get("x_processplatform_assemble_surface").getAttachmentWorkcompletedUrl(att.id, this.module.form.businessData.workCompleted.id, function (url) {
                        office.openedAttachment = { "id": att.id, "site": this.module.json.name, "name": att.name };
                        office.officeOCX.BeginOpenFromURL(url, true, this.readonly);
                    }.bind(this));
                } else {
                    MWF.Actions.get("x_processplatform_assemble_surface").getAttachmentUrl(att.id, this.module.form.businessData.work.id, function (url) {
                        office.openedAttachment = { "id": att.id, "site": this.module.json.name, "name": att.name };
                        office.officeOCX.BeginOpenFromURL(url, true, this.readonly);
                    }.bind(this));
                }
            }
        }
    },

    checkReplaceAction: function () {
        if (this.options.isReplaceHidden) return;
        if (this.options.readonly) {
            this.setActionDisabled(this.replaceAction);
            this.setActionDisabled(this.min_replaceAction);
            return false;
        }

        if (this.options.isReplaceOption !== "n") {
            if (this.selectedAttachments.length && this.selectedAttachments.length === 1) {

                var att = this.selectedAttachments[0];
                if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;

                var user = layout.session.user.distinguishedName;
                var flag = true;

                if (this.options.isReplaceOption === "o") {
                    flag = att.data.person === layout.desktop.session.user.distinguishedName;
                }
                if (this.options.isReplaceOption === "a") {
                    flag = att.data.activity === this.module.form.businessData.activity.id;
                }
                if (this.options.isReplaceOption === "ao") {
                    flag = (att.data.person === layout.desktop.session.user.distinguishedName && att.data.activity === this.module.form.businessData.activity.id);
                }
                if (flag && !att.data.control.allowEdit && att.data.person !== user) {
                    flag = false;
                }

                if (flag) {
                    this.setActionEnabled(this.replaceAction);
                    this.setActionEnabled(this.min_replaceAction);
                } else {
                    this.setActionDisabled(this.replaceAction);
                    this.setActionDisabled(this.min_replaceAction);
                }
            } else {
                this.setActionDisabled(this.replaceAction);
                this.setActionDisabled(this.min_replaceAction);
            }
        } else {
            // if (!this.options.isReplace){
            this.setActionDisabled(this.replaceAction);
            this.setActionDisabled(this.min_replaceAction);
            // }else{
            //     if (this.selectedAttachments.length && this.selectedAttachments.length===1){
            //         this.setActionEnabled(this.replaceAction);
            //         this.setActionEnabled(this.min_replaceAction);
            //     }else{
            //         this.setActionDisabled(this.replaceAction);
            //         this.setActionDisabled(this.min_replaceAction);
            //     }
            // }
        }
    },
    replaceAttachment: function (e, node) {
        var att = this.selectedAttachments[0].data;

        if (this.module.json.isOpenInOffice && this.module.json.officeControlName && (this.options.officeFiles.indexOf(att.extension) !== -1)) {
            var office = this.module.form.all[this.module.json.officeControlName];
            if (office) {
                if (this.min_closeOfficeAction) this.setActionEnabled(this.min_closeOfficeAction);
                if (this.closeOfficeAction) this.setActionEnabled(this.closeOfficeAction);
                this.openInOfficeControl(att, office);
            } else {
                if (this.selectedAttachments.length && this.selectedAttachments.length == 1) {
                    if (this.module) this.module.replaceAttachment(e, node, this.selectedAttachments[0]);
                }
            }
        } else {
            if (this.selectedAttachments.length && this.selectedAttachments.length == 1) {
                if (this.module) this.module.replaceAttachment(e, node, this.selectedAttachments[0]);
            }
        }
    },
    isAttReplaceAvailable: function (att) {
        if (this.options.readonly) return false;
        if (this.options.toolbarGroupHidden.contains("edit")) return false;

        if (this.options.isReplaceOption === "n") return false;

        var user = layout.session.user.distinguishedName;
        var flag = true;

        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;

        if (this.options.isReplaceOption === "o") {
            flag = att.data.person === layout.desktop.session.user.distinguishedName;
        }
        if (this.options.isReplaceOption === "a") {
            flag = att.data.activity === this.module.form.businessData.activity.id;
        }
        if (this.options.isReplaceOption === "ao") {
            flag = (att.data.person === layout.desktop.session.user.distinguishedName && att.data.activity === this.module.form.businessData.activity.id);
        }
        if (flag && !att.data.control.allowEdit && att.data.person !== user) {
            flag = false;
        }

        return flag;
    },


    //checkAttachmentOrderAction : function(){
    //    if (this.options.readonly){
    //        this.setAttachmentsAction("order", false );
    //        return false;
    //    }
    //    if (this.attachments.length){
    //        var user = layout.session.user.distinguishedName;
    //        for (var i=0; i<this.attachments.length; i++){
    //            var flag = true;
    //
    //            var att = this.attachments[i];
    //            if( !att.data.person && att.data.creatorUid )att.data.person = att.data.creatorUid;
    //
    //            if ((!att.data.control.allowControl || !att.data.control.allowEdit) && att.data.person!==user){
    //                flag = false;
    //            }
    //            if (flag){
    //                this.setAttachmentAction(att, "order", true );
    //            }else{
    //                this.setAttachmentAction(att, "order", false );
    //            }
    //        }
    //    }
    //},
    checkOrderAction: function () {
        //this.checkAttachmentOrderAction();
        if (this.options.readonly) {
            this.setActionDisabled(this.orderAction);
            this.setActionDisabled(this.min_orderAction);
            return false;
        }
        if (this.attachments.length && this.attachments.length > 1) {
            var flag = true;
            var user = layout.session.user.distinguishedName;
            for (var i = 0; i < this.attachments.length; i++) {
                var att = this.attachments[i];
                if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;
                if ((!att.data.control.allowControl && !att.data.control.allowEdit) && att.data.person !== user) { //|| !att.data.control.allowEdit
                    flag = false;
                    break;
                }
            }
            if (flag) {
                this.setActionEnabled(this.orderAction);
                this.setActionEnabled(this.min_orderAction);
            } else {
                this.setActionDisabled(this.orderAction);
                this.setActionDisabled(this.min_orderAction);
            }
            //this.setActionEnabled(this.min_deleteAction);
        } else {
            this.setActionDisabled(this.orderAction);
            this.setActionDisabled(this.min_orderAction);
            //this.setActionDisabled(this.min_deleteAction);
        }
    },
    isAttOrderAvailable: function (att) {
        if (this.options.readonly) return false;
        if (this.options.toolbarGroupHidden.contains("config")) return false;
        var user = layout.session.user.distinguishedName;
        var flag = true;

        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;

        if ((!att.data.control.allowControl || !att.data.control.allowEdit) && att.data.person !== user) {
            flag = false;
        }
        return flag;
    },

    createTopNode: function () {
        if (this.options.title) {
            if (!this.titleNode) this.titleNode = new Element("div", { "styles": this.css.titleNode, "text": this.options.title }).inject(this.node);
        }
        if (!this.topNode) {
            this.topNode = new Element("div", { "styles": this.css.topNode }).inject(this.node);
        } else {
            this.topNode.empty();
            this.editActionBoxNode = null;
            this.editActionsGroupNode = null;
            this.topNode.setStyle("display", "");
            if (this.isHiddenTop) {
                //this.container.setStyle("height", this.container.getSize().y + 45 );
                //this.node.setStyle("height", this.node.getSize().y + 45 );
                if (this.oldContentScrollNodeHeight && this.contentScrollNode) {
                    this.contentScrollNode.setStyle("min-height", this.oldContentScrollNodeHeight);
                    this.oldContentScrollNodeHeight = null;
                }
                this.isHiddenTop = false;
            }
        }
        var hiddenGroup = this.options.toolbarGroupHidden;
        if (hiddenGroup.contains("edit") && hiddenGroup.contains("read") && hiddenGroup.contains("list") &&
            hiddenGroup.contains("view") && hiddenGroup.contains("config") &&
            !(this.module.json.isOpenInOffice && this.module.json.officeControlName)
        ) {
            if (this.contentScrollNode) {
                this.oldContentScrollNodeHeight = this.contentScrollNode.getStyle("min-height");
                this.contentScrollNode.setStyle("min-height", this.node.getStyle("min-height"));
                this.topNode.setStyle("display", "none");
            }
            this.isHiddenTop = true;
        }
        if (!hiddenGroup.contains("edit")) this.createEditGroupActions();
        if (!hiddenGroup.contains("read")) this.createReadGroupActions();
        if (!hiddenGroup.contains("list")) this.createListGroupActions();
        if (this.module.json.isOpenInOffice && this.module.json.officeControlName) this.createOfficeGroupActions();

        if (!hiddenGroup.contains("config")) this.createConfigGroupActions();

        if (!hiddenGroup.contains("view")) this.createViewGroupActions();
        this.checkActions();
    },
    checkActions: function () {
        //    if (this.options.readonly){
        //        this.setReadonly();
        //    }else{
        this.checkUploadAction();
        this.checkDeleteAction();
        this.checkReplaceAction();
        this.checkPreviewAttAction();
        //this.checkOfficeAction();
        this.checkDownloadAction();
        this.checkSizeAction();

        this.checkConfigAction();
        this.checkOrderAction();

        this.checkListStyleAction();
        //    }
    },

    checkAttachmentConfigAction: function () {
        if (this.options.readonly) {
            this.setAttachmentsAction("config", false);
            return false;
        }
        if (this.attachments.length) {
            var user = layout.session.user.distinguishedName;
            for (var i = 0; i < this.attachments.length; i++) {
                var flag = true;

                var att = this.attachments[i];
                if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;

                if ((!att.data.control.allowControl) && att.data.person !== user) { // || !att.data.control.allowEdit
                    flag = false;
                }
                if (flag) {
                    this.setAttachmentAction(att, "config", true);
                } else {
                    this.setAttachmentAction(att, "config", false);
                }
            }
        }
    },
    checkConfigAction: function () {
        this.checkAttachmentConfigAction();
        if (this.options.readonly) {
            this.setActionDisabled(this.configAction);
            if (this.checkTextAction) this.setActionDisabled(this.checkTextAction);
            return false;
        }
        if (this.selectedAttachments.length) {
            var flag = true;
            var user = layout.session.user.distinguishedName;
            for (var i = 0; i < this.selectedAttachments.length; i++) {
                var att = this.selectedAttachments[i];
                if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;
                if ((!att.data.control.allowControl) && att.data.person !== user) { //|| !att.data.control.allowEdit
                    flag = false;
                    break;
                }
            }
            if (flag) {
                this.setActionEnabled(this.configAction);
            } else {
                this.setActionDisabled(this.configAction);
            }
            //this.setActionEnabled(this.min_deleteAction);
        } else {
            this.setActionDisabled(this.configAction);
            //this.setActionDisabled(this.min_deleteAction);
        }

        if (this.checkTextAction) {
            this.setActionDisabled(this.checkTextAction);
            if (this.selectedAttachments.length && this.selectedAttachments.length === 1) {
                var att = this.selectedAttachments[0];
                if (this.options.images.indexOf(att.data.extension.toLowerCase()) !== -1) {
                    this.setActionEnabled(this.checkTextAction);
                }
            }
        }
    },
    isAttConfigAvailable: function (att) {
        if (this.options.readonly) return false;
        if (this.options.toolbarGroupHidden.contains("config")) return false;
        var user = layout.session.user.distinguishedName;
        var flag = true;

        if (!att.data.person && att.data.creatorUid) att.data.person = att.data.creatorUid;

        if (!att.data.control.allowControl && att.data.person !== user) {
            flag = false;
        }
        return flag;
    },

    createEditGroupActions: function () {
        if (!this.editActionBoxNode) this.editActionBoxNode = new Element("div", { "styles": this.css.actionsBoxNode }).inject(this.topNode);
        if (!this.editActionsGroupNode) this.editActionsGroupNode = new Element("div", { "styles": this.css.actionsGroupNode }).inject(this.editActionBoxNode);
        this.uploadAction = this.createAction(this.editActionsGroupNode, "upload", o2.LP.widget.upload, function (e, node) {
            this.uploadAttachment(e, node);
        }.bind(this));

        this.deleteAction = this.createAction(this.editActionsGroupNode, "delete", o2.LP.widget["delete"], function (e, node) {
            this.deleteAttachment(e, node);
        }.bind(this));
        if(!layout.mobile){
            this.previewAttAction = this.createAction(this.editActionsGroupNode, "previewAtt", o2.LP.widget["previewAtt"], function (e, node) {
                this.previewAttachment(e, node);
            }.bind(this));
        }
        if (!this.options.isReplaceHidden) {
            this.replaceAction = this.createAction(this.editActionsGroupNode, "replace", o2.LP.widget.replace, function (e, node) {
                this.replaceAttachment(e, node);
            }.bind(this));
        }

        // this.officeAction = this.createAction(this.editActionsGroupNode, "office", o2.LP.widget.office, function(e, node){
        //     this.openInOfficeControl(e, node);
        // }.bind(this));

        if (!this.options.toolbarGroupHidden.contains("read")) this.editActionSeparateNode = this.createSeparate(this.editActionsGroupNode);
    },

    createConfigGroupActions: function () {
        this.configActionBoxNode = new Element("div", { "styles": this.css.actionsBoxNode }).inject(this.topNode);
        this.configActionsGroupNode = new Element("div", { "styles": this.css.actionsGroupNode }).inject(this.configActionBoxNode);

        this.configAction = this.createAction(this.configActionsGroupNode, "config", MWF.LP.widget.configAttachment, function (e, node) {
            this.configAttachment(e, node);
        }.bind(this));

        if (this.options.checkTextEnable) {
            this.checkTextAction = this.createAction(this.configActionsGroupNode, "check", MWF.LP.widget.checkOcrText, function (e, node) {
                this.checkImageTex(e, node);
            }.bind(this));
        }
        this.createSeparate(this.configActionsGroupNode);

        this.orderAction = this.createAction(this.configActionsGroupNode, "order", MWF.LP.widget.order, function (e, node) {
            this.orderAttachment(e, node);
        }.bind(this));

        if (this.configAction) this.setActionDisabled(this.configAction);
        if (this.checkTextAction) this.setActionDisabled(this.checkTextAction);
    },

    createOfficeGroupActions: function () {
        this.officeActionBoxNode = new Element("div", { "styles": this.css.actionsBoxNode }).inject(this.topNode);
        this.officeActionsGroupNode = new Element("div", { "styles": this.css.actionsGroupNode }).inject(this.officeActionBoxNode);

        this.closeOfficeAction = this.createAction(this.officeActionsGroupNode, "closeOffice", MWF.LP.widget.closeOffice, function (e, node) {
            this.closeAttachmentOffice(e, node);
        }.bind(this));
        if (this.closeOfficeAction) this.setActionDisabled(this.closeOfficeAction);
    },
    loadMinActions: function () {
        var hiddenGroup = this.options.toolbarGroupHidden;
        if (!hiddenGroup.contains("edit")) {
            this.min_uploadAction = this.createAction(this.minActionAreaNode, "upload", MWF.LP.widget.upload, function (e, node) {
                this.uploadAttachment(e, node);
            }.bind(this));

            this.min_deleteAction = this.createAction(this.minActionAreaNode, "delete", MWF.LP.widget["delete"], function (e, node) {
                this.deleteAttachment(e, node);
            }.bind(this));

            if (!this.options.isReplaceHidden) {
                this.min_replaceAction = this.createAction(this.minActionAreaNode, "replace", MWF.LP.widget.replace, function (e, node) {
                    this.replaceAttachment(e, node);
                }.bind(this));
            }
        }
        if (!hiddenGroup.contains("read")) {
            this.min_downloadAction = this.createAction(this.minActionAreaNode, "download", MWF.LP.widget.download
                , function (e, node) {
                    this.downloadAttachment(e, node);
                }.bind(this));
        }
        if (!hiddenGroup.contains("config")) {
            this.min_orderAction = this.createAction(this.minActionAreaNode, "order", MWF.LP.widget.order, function (e, node) {
                this.orderAttachment(e, node);
            }.bind(this));
        }

        if (this.module.json.isOpenInOffice && this.module.json.officeControlName) {
            this.min_closeOfficeAction = this.createAction(this.minActionAreaNode, "closeOffice", MWF.LP.widget.closeOffice, function (e, node) {
                this.closeAttachmentOffice(e, node);
            }.bind(this));
            if (this.min_closeOfficeAction) this.setActionDisabled(this.closeOfficeAction);
        }


        if (!hiddenGroup.contains("edit") || !hiddenGroup.contains("read")) {
            this.createSeparate(this.minActionAreaNode);
        }

        //this.createSeparate(this.configActionsGroupNode);

        if (this.options.isSizeChange) {
            //this.createSeparate(this.minActionAreaNode);
            if (!hiddenGroup.contains("view")) {
                this.sizeAction = this.createAction(this.minActionAreaNode, "max", MWF.LP.widget.min, function () {
                    this.changeControllerSize();
                }.bind(this));
            }
        }
    },
    closeAttachmentOffice: function () {
        var office = this.module.form.all[this.module.json.officeControlName];
        if (office) {
            office.openFile();
            if (this.min_closeOfficeAction) this.setActionDisabled(this.min_closeOfficeAction);
            if (this.closeOfficeAction) this.setActionDisabled(this.closeOfficeAction);
        }
    },
    configAttachment: function () {
        //this.fireEvent("delete", [attachment.data]);

        var lp = MWF.xApplication.process.Xform.LP;
        var css = this.module.form.css;
        var node = new Element("div", { "styles": css.attachmentPermissionNode }).inject(this.node);
        var attNames = new Element("div", { "styles": css.attachmentPermissionNamesNode }).inject(node);
        var attNamesTitle = new Element("div", { "styles": css.attachmentPermissionNamesTitleNode, "text": lp.attachmentPermissionInfo }).inject(attNames);
        var attNamesArea = new Element("div", { "styles": css.attachmentPermissionNamesAreaNode }).inject(attNames);

        if (this.selectedAttachments.length) {
            this.selectedAttachments.each(function (att) {
                var attNode = new Element("div", { "styles": css.attachmentPermissionAttNode, "text": att.data.name }).inject(attNamesArea);
            }.bind(this));
        }

        var editArea = new Element("div", { "styles": css.attachmentPermissionEditAreaNode }).inject(node);
        var title = new Element("div", { "styles": css.attachmentPermissionTitleNode, "text": lp.attachmentRead }).inject(editArea);
        var readInput = new Element("div", { "styles": css.attachmentPermissionInputNode }).inject(editArea);

        title = new Element("div", { "styles": css.attachmentPermissionTitleNode, "text": lp.attachmentEdit }).inject(editArea);
        var editInput = new Element("div", { "styles": css.attachmentPermissionInputNode }).inject(editArea);

        title = new Element("div", { "styles": css.attachmentPermissionTitleNode, "text": lp.attachmentController }).inject(editArea);
        var controllerInput = new Element("div", { "styles": css.attachmentPermissionInputNode }).inject(editArea);

        var dlg = o2.DL.open(Object.merge({
            "title": lp.attachmentPermission,
            "style": this.module.form.json.dialogStyle || "user",
            "isResize": false,
            "content": node,
            "buttonList": [
                {
                    "type": "ok",
                    "text": MWF.LP.process.button.ok,
                    "action": function () {
                        this.setAttachmentConfig(readInput, editInput, controllerInput);
                        dlg.close();
                    }.bind(this)
                },
                {
                    "type": "cancel",
                    "text": MWF.LP.process.button.cancel,
                    "action": function () { dlg.close(); }
                }
            ]
        }, (this.module.form.json.dialogOptions||{})));

        if (this.selectedAttachments.length === 1) {
            var data = this.selectedAttachments[0].data;

            var readUnitList = (data.readUnitList) || [];
            var readIdentityList = (data.readIdentityList) || [];
            var editUnitList = (data.editUnitList) || [];
            var editIdentityList = (data.editIdentityList) || [];
            var controllerUnitList = (data.controllerUnitList) || [];
            var controllerIdentityList = (data.controllerIdentityList) || [];

            readInput.setSelectPerson(this.module.form.app.content, Object.merge(Object.clone(this.module.form.json.selectorStyle || {}), {
                "types": ["unit", "identity"],
                "values": readUnitList.concat(readIdentityList).trim()
            }));
            editInput.setSelectPerson(this.module.form.app.content, Object.merge(Object.clone(this.module.form.json.selectorStyle || {}), {
                "types": ["unit", "identity"],
                "values": editUnitList.concat(editIdentityList).trim()
            }));
            controllerInput.setSelectPerson(this.module.form.app.content, Object.merge(Object.clone(this.module.form.json.selectorStyle || {}), {
                "types": ["unit", "identity"],
                "values": controllerUnitList.concat(controllerIdentityList).trim()
            }));
        } else {
            readInput.setSelectPerson(this.module.form.app.content, Object.merge(Object.clone(this.module.form.json.selectorStyle || {}), {
                "types": ["unit", "identity"]
            }));
            editInput.setSelectPerson(this.module.form.app.content, Object.merge(Object.clone(this.module.form.json.selectorStyle || {}), {
                "types": ["unit", "identity"]
            }));
            controllerInput.setSelectPerson(this.module.form.app.content, Object.merge(Object.clone(this.module.form.json.selectorStyle || {}), {
                "types": ["unit", "identity"]
            }));
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

            var loadedCount = 0;
            this.selectedAttachments.each(function (att) {
                att.data.readUnitList = readUnitList;
                att.data.readIdentityList = readIdentityList;
                att.data.editUnitList = editUnitList;
                att.data.editIdentityList = editIdentityList;
                att.data.controllerUnitList = controllerUnitList;
                att.data.controllerIdentityList = controllerIdentityList;

                o2.Actions.get("x_processplatform_assemble_surface").configAttachment(att.data.id, this.module.form.businessData.work.id, att.data, function () {
                    //刷新附件权限，以后要加一个刷新附件的功能
                    o2.Actions.load("x_processplatform_assemble_surface").AttachmentAction.getWithWorkOrWorkCompleted(att.data.id, this.module.form.businessData.work.id, function (json) {
                        var attachment = this.getAttachmentById( att.data.id );
                        if( attachment ){
                            attachment.data = json.data;

                            if( attachment.deleteAction && !this.isAttDeleteAvailable(attachment) ){
                                attachment.deleteAction.setStyle("display","none");
                            }

                            if( attachment.configAction && !this.isAttConfigAvailable(attachment) ){
                                attachment.configAction.setStyle("display","none");
                            }
                        }
                        loadedCount++;
                        if( loadedCount === this.selectedAttachments.length ){
                            this.checkActions();
                        }
                    }.bind(this))
                }.bind(this));
            }.bind(this));
        }
    },

    checkImageTex: function () {
        if (this.selectedAttachments.length && this.selectedAttachments.length == 1) {
            var att = this.selectedAttachments[0];
            var lp = MWF.xApplication.process.Xform.LP;
            var css = this.module.form.css;

            var node = new Element("div", { "styles": css.attachmentOCRNode }).inject(this.node);
            var previewNode = new Element("div", { "styles": css.attachmentOCRImageAreaNode }).inject(node);
            var imgNode = new Element("img", { "styles": css.attachmentOCRImageNode }).inject(previewNode);

            o2.Actions.get("x_processplatform_assemble_surface").getAttachmentUrl(att.data.id, this.module.form.businessData.work.id, function (url) {
                imgNode.set("src", o2.filterUrl(url));
            });

            var areaNode = new Element("div", { "styles": css.attachmentOCRInputAreaNode }).inject(node);
            var inputNode = new Element("textarea", { "styles": css.attachmentOCRInputNode }).inject(areaNode);

            var dlg = o2.DL.open({
                "title": lp.attachmentOCRTitle,
                "style": this.module.form.json.dialogStyle || "user",
                "isResize": false,
                "content": node,
                "buttonList": [
                    {
                        "type": "ok",
                        "text": MWF.LP.process.button.ok,
                        "action": function () {
                            this.setAttachmentOCR(inputNode, att);
                            dlg.close();
                        }.bind(this)
                    },
                    {
                        "type": "cancel",
                        "text": MWF.LP.process.button.cancel,
                        "action": function () { dlg.close(); }
                    }
                ]
            });
            if (att.data.ocr) {
                inputNode.set("text", att.data.ocr.text || "");
            } else {
                o2.Actions.get("x_processplatform_assemble_surface").getAttachmentOCR(att.data.id, this.module.form.businessData.work.id, function (json) {
                    att.data.ocr = json.data;
                    inputNode.set("text", json.data.text || "");
                }.bind(this))
            }

        }
    },
    setAttachmentOCR: function (inputNode, att) {
        var data = inputNode.get("text");
        if (!att.data.ocr) att.data.ocr = {};
        att.data.ocr.text = data;
        o2.Actions.get("x_processplatform_assemble_surface").setAttachmentOCR(att.data.id, this.module.form.businessData.work.id, {
            "text": data
        }, function () {
            this.module.form.app.notice("success", lp.attachmentOCR_saved, this.node);
        }.bind(this));
    },
    checkMoveAction: function (item) {
        if (item) {
            var actionArea = item.getFirst().getNext();
            var actionup = actionArea.getFirst().show();
            var actiondown = actionArea.getLast().show();

            tmp = item.getPrevious();
            if (!tmp) actionup.hide();

            tmp = item.getNext();
            if (!tmp) actiondown.hide();
        }
    },
    sortByNumber: function( attachments ){
        return attachments.sort(function (a1, a2) {
            if (!a2.data.orderNumber) return 1;
            if (!a1.data.orderNumber) return -1;
            return a1.data.orderNumber - a2.data.orderNumber;
        }.bind(this));
    },
    orderAttachment: function () {
        if (this.attachments.length) {
            // this.attachments = this.attachments.sort(function (a1, a2) {
            //     if (!a2.data.orderNumber) return 1;
            //     if (!a1.data.orderNumber) return -1;
            //     return a1.data.orderNumber - a2.data.orderNumber;
            // }.bind(this));
            this.attachments = this.sortByNumber(this.attachments);

            var lp = MWF.xApplication.process.Xform.LP;
            var css = this.module.form.css;
            var node = new Element("div", { "styles": css.attachmentOrderNode });
            var infoNode = new Element("div", { "styles": css.attachmentOrderInforNode, "text": lp.attachmentOrderInfo }).inject(node);
            var attrchmentsNode = new Element("div", { "styles": css.attachmentOrderAreaNode }).inject(node);

            var iconUrl = "../x_component_File/$Main/icon.json";
            var icons = null;
            o2.getJSON(iconUrl, function (json) {
                icons = json;
            }.bind(this), false, false);

            this.attachments.each(function (att, idx) {
                var iconName = icons[att.data.extension.toLowerCase()] || icons.unknow;
                var iconFolderUrl = "../x_component_File/$Main/default/file/" + iconName;

                var itemNode = new Element("div", { "styles": css.attachmentOrderItemNode }).inject(attrchmentsNode);
                itemNode.store("att", att);
                var icon = new Element("div", { "styles": css.attachmentOrderItemIconNode }).inject(itemNode);
                icon.setStyle("background-image", "url('" + iconFolderUrl + "')");

                var actionArea = new Element("div", { "styles": css.attachmentOrderItemActionNode }).inject(itemNode);
                var text = new Element("div", { "styles": css.attachmentOrderItemTextNode, "text": att.data.name }).inject(itemNode);

                var actionUp = new Element("div", { "styles": css.attachmentOrderItemActionUpNode, "text": lp.attachmentOrderUp }).inject(actionArea);
                var actionDown = new Element("div", { "styles": css.attachmentOrderItemActionDownNode, "text": lp.attachmentOrderDown }).inject(actionArea);
                if (idx == 0) actionUp.hide();
                if (idx == this.attachments.length - 1) actionDown.hide();

                actionUp.addEvent("click", function (e) {
                    var itemNode = e.target.getParent().getParent();
                    var upNode = itemNode.getPrevious();
                    if (upNode) {
                        itemNode.inject(upNode, "before");
                        this.checkMoveAction(upNode);
                    }
                    this.checkMoveAction(itemNode);
                    itemNode.highlight();
                    //itemNode.setStyle("background-color", "#faf9f1");
                }.bind(this));

                actionDown.addEvent("click", function (e) {
                    var itemNode = e.target.getParent().getParent();
                    var downNode = itemNode.getNext();
                    if (downNode) {
                        itemNode.inject(downNode, "after");
                        this.checkMoveAction(downNode);
                    }
                    this.checkMoveAction(itemNode);
                    itemNode.highlight();
                    // /itemNode.setStyle("background-color", "#faf9f1");
                }.bind(this));

                itemNode.addEvents({
                    "mouseover": function (e) { this.setStyle("background-color", "#f1f6fa"); },
                    "mouseout": function (e) { this.setStyle("background-color", "#ffffff"); }
                });

                //var droppables = attrchmentsNode.getChildren();

                new Drag(itemNode, {
                    "handle": icon,
                    "snap": 5,
                    "stopPropagation": true,
                    "preventDefault": true,
                    onStart: function (el, e) {
                        var itemNode = el;
                        itemNode.setStyle("background-color", "#f1f6fa");
                        var moveNode = itemNode.clone(true).setStyles(css.attachmentOrderItemNode).setStyles({
                            "background-color": "#faf9f1",
                            "opacity": 0.8,
                            "border": "1px dotted #333333"
                        }).inject(node);
                        moveNode.position({
                            "relativeTo": itemNode,
                            "position": 'upperLeft',
                            "edge": 'upperLeft'
                        });
                        moveNode.owner = itemNode;

                        var move = new Drag.Move(moveNode, {
                            "container": node,
                            "droppables": attrchmentsNode.getChildren(),
                            "onEnter": function (el, drop) {
                                moveNode.flagNode = new Element("div", { "styles": css.attachmentOrderFlagNode }).inject(drop, "before");
                            },
                            "onLeave": function (el, drop) {
                                if (moveNode.flagNode) moveNode.flagNode.destroy();
                            },
                            "onDrop": function (el, drop) {
                                if (moveNode.flagNode) {
                                    moveNode.owner.inject(moveNode.flagNode, "after");
                                    moveNode.flagNode.destroy();
                                    moveNode.owner.highlight();
                                    this.checkMoveAction(moveNode.owner);
                                    this.checkMoveAction(drop);
                                    this.checkMoveAction(attrchmentsNode.getLast());
                                    moveNode.destroy()
                                }
                            }.bind(this)
                        });
                        move.start(e);


                    }.bind(this),
                    enter: function (el) {
                        el.removeClass('dragging');
                    }
                });
                //itemNode.dragMove


            }.bind(this));

            var dlg = o2.DL.open(Object.merge({
                "title": lp.attachmentOrderTitle,
                "style": this.module.form.json.dialogStyle || "user",
                "isResize": false,
                "content": node,
                "width": "auto",
                "height": "auto",
                "buttonList": [
                    {
                        "type": "ok",
                        "text": MWF.LP.process.button.ok,
                        "action": function () {
                            this.sortAttachment(attrchmentsNode);
                            dlg.close();
                        }.bind(this)
                    },
                    {
                        "type": "cancel",
                        "text": MWF.LP.process.button.cancel,
                        "action": function () { dlg.close(); }
                    }
                ],
                "onPostLoad": function () {
                    var dlg = this;
                    dlg.node.setStyle("display", "block");

                    var size = {};
                    if (css.attachmentOrderNode) {
                        if (parseFloat(css.attachmentOrderNode.width).toString() !== "NaN") {
                            size.x = parseInt(css.attachmentOrderNode.width)
                        }
                        if (parseFloat(css.attachmentOrderNode.height).toString() !== "NaN") {
                            size.y = parseInt(css.attachmentOrderNode.height)
                        }
                    }

                    node.show();
                    var nodeSize = node.getSize();
                    dlg.content.setStyles({
                        "width": size.x || nodeSize.x,
                        "height": size.y || nodeSize.y
                    });
                    dlg.setContentSize();
                }
            },  (this.module.form.json.dialogOptions||{})));
        }
    },
    sortAttachment: function (node) {
        var nodes = node.getChildren();
        nodes.each(function (item, idx) {
            var att = item.retrieve("att", null);
            if (att) {
                att.data.orderNumber = idx;
                o2.Actions.load("x_processplatform_assemble_surface").AttachmentAction.changeOrderNumber(att.data.id, this.module.form.businessData.work.id, idx);
            }
        }.bind(this));
        this.attachments = this.attachments.sort(function (a1, a2) {
            if (!a2.data.orderNumber) return 1;
            if (!a1.data.orderNumber) return -1;
            return a1.data.orderNumber - a2.data.orderNumber;
        }.bind(this));

        this.reloadAttachments();
        this.fireEvent("order");
    }

});


/** @class Attachment 附件组件。
 * @o2cn 附件
 * @example
 * //可以在脚本中获取该组件
 * //方法1：
 * var attachment = this.form.get("name"); //获取组件
 * //方法2
 * var attachment = this.target; //在组件事件脚本中获取
 * @extends MWF.xApplication.process.Xform.$Module
 * @o2category FormComponents
 * @o2range {Process|CMS}
 * @hideconstructor
 */
MWF.xApplication.process.Xform.Attachment = MWF.APPAttachment = new Class(
    /** @lends MWF.xApplication.process.Xform.Attachment# */
{
    Extends: MWF.APP$Module,
    options: {
        /**
         * @event MWF.xApplication.process.Xform.Attachment#postLoad
         * @ignore
         */
        /**附件组件（this.target）加载前触发。
         * @event MWF.xApplication.process.Xform.Attachment#queryLoad
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**附件容器（this.target.attachmentController）初始化之前触发，可以通过this.event获取附件容器的选项。
         * @event MWF.xApplication.process.Xform.Attachment#queryLoadController
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**附件容器（this.target.attachmentController）初始化之后，加载之前触发。
         * @event MWF.xApplication.process.Xform.Attachment#loadController
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**附件容器（this.target.attachmentController）加载之后触发，但这时还未加载具体的附件。
         * @event MWF.xApplication.process.Xform.Attachment#postLoadController
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 附件组件（this.target）加载完成后触发。这时候附件容器和每个附件都已加载完成。
         * @event MWF.xApplication.process.Xform.Attachment#load
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 附件组件（this.target）加载完成后触发。这时候附件容器和每个附件都已加载完成。
         * @event MWF.xApplication.process.Xform.Attachment#afterLoad
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 附件上传前触发。本事件中可以通过this.event获取上传的文件数组
         * @event MWF.xApplication.process.Xform.Attachment#beforeUpload
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 附件上传后触发。本事件中可以通过this.event获取上传附件的数据
         * @event MWF.xApplication.process.Xform.Attachment#upload
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 删除附件前触发。本事件中可以通过this.event获取被删附件的数据
         * @event MWF.xApplication.process.Xform.Attachment#delete
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 删除附件后触发。本事件中可以通过this.event获取被删附件的数据
         * @event MWF.xApplication.process.Xform.Attachment#afterDelete
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 附件有变化的时候会被触发，包括上传、替换、删除、排序
         * @event MWF.xApplication.process.Xform.Attachment#change
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 下载附件后触发。本事件中可以通过this.event获取被下载附件对象
         * @event MWF.xApplication.process.Xform.Attachment#download
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 打开附件后触发。本事件中可以通过this.event获取被打开附件对象
         * @event MWF.xApplication.process.Xform.Attachment#open
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 选中附件后触发。本事件中可以通过this.event获取被选中的附件对象
         * @event MWF.xApplication.process.Xform.Attachment#select
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        /**
         * 取消选中附件后触发。本事件中可以通过this.event获取被取消选中的附件对象
         * @event MWF.xApplication.process.Xform.Attachment#unselect
         * @see {@link https://www.yuque.com/o2oa/ixsnyt/hm5uft#i0zTS|组件事件说明}
         */
        "moduleEvents": ["beforeUpload", "upload", "delete", "afterDelete", "load", "afterLoad", "change","download",
            "open", "queryLoad", "queryLoadController", "loadController", "postLoadController","select","unselect"]
    },

    initialize: function (node, json, form, options) {
        this.node = $(node);
        this.node.store("module", this);
        this.json = json;
        this.form = form;
        this.field = true;
        this.fieldModuleLoaded = false;
    },
    _loadUserInterface: function () {
        debugger;
        this.node.empty();
        if (this.form.businessData.work.startTime){
            this.loadAttachmentController();
            this.fireEvent("afterLoad");
        }
        this.fieldModuleLoaded = true;
    },
    reload: function(){
        this.node.empty();
        if (this.form.businessData.work.startTime){
            this.loadAttachmentController();
        }
    },
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
            "isPreviewAtt": (this.json.isPreviewAtt === "y" || this.json.isPreviewAtt === "true"),
            "isSizeChange": (this.json.isSizeChange === "y" || this.json.isSizeChange === "true"),
            "readonly": (this.json.readonly === "y" || this.json.readonly === "true" || this.json.isReadonly ),
            "availableListStyles": this.json.availableListStyles ? this.json.availableListStyles : ["list", "seq", "icon", "preview"],
            "isDeleteOption": this.json.isDelete,
            "isReplaceOption": this.json.isReplace,
            "toolbarGroupHidden": this.json.toolbarGroupHidden || [],
            "onOrder": function () {
                this.fireEvent("change");
            }.bind(this)
        };
        if (this.readonly) options.readonly = true;
        if (this.form.json.attachmentStyle) {
            options = Object.merge(options, this.form.json.attachmentStyle);
        }
        //this.attachmentController = new MWF.widget.ATTER(this.node, this, options);

        this.fireEvent("queryLoadController", [options]);

        /**
         * @summary 附件容器.
         * @member {MWF.xApplication.process.Xform.AttachmentController}
         * @example
         * var attachmentController = this.form.get("fieldId").attachmentController; //获取附件容器
         * var attachmentList = attachmentController.attachments; //获取所有的附件
         * var attachmentData = attachmentList[0].data; //获取第一个附件的数据
         */

        this.attachmentController = new MWF.xApplication.process.Xform.AttachmentController(this.node, this, options);

        this.fireEvent("loadController");

        this.attachmentController.load();

        this.fireEvent("postLoadController");

        this.form.businessData.attachmentList.each(function (att) {
            //if (att.site===this.json.id || (this.json.isOpenInOffice && this.json.officeControlName===att.site)) this.attachmentController.addAttachment(att);
            if (att.site === (this.json.site || this.json.id)) this.attachmentController.addAttachment(att);
        }.bind(this));
        this.setAttachmentBusinessData();
        //}.bind(this));
    },
    setAttachmentBusinessData: function () {
        if (this.attachmentController) {
            if (this.attachmentController.attachments.length) {
                var values = this.attachmentController.attachments.map(function (d) {
                    return d.data.name;
                });
                this._setBusinessData(values);
            } else {
                this._setBusinessData([]);
            }
        }
    },

    _loadEvents: function (editorConfig) {
        Object.each(this.json.events, function (e, key) {
            if (e.code) {
                if (this.options.moduleEvents.indexOf(key) !== -1) {
                    this.addEvent(key, function (event) {
                        return this.form.Macro.fire(e.code, this, event);
                    }.bind(this));
                } else {
                    this.node.addEvent(key, function (event) {
                        return this.form.Macro.fire(e.code, this, event);
                    }.bind(this));
                }
            }
        }.bind(this));

    },

    isEmpty : function(){
        var data = this.getData();
        if( typeOf(data) === "array" ){
            return data.length == 0
        }else{
            return !data;
        }
    },
    /**
     * @summary 获取当前组件所有附件的标题.如果没有附件返回null
     * @example
     * var getAttachmentNames = this.form.get("name").getData();
     * @return {StringArray|Null} 附件标题.
     */
    getData: function () {
        return (this.attachmentController) ? this.attachmentController.getAttachmentNames() : null;
    },
    createUploadFileNode: function (files) {
        debugger;
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
        this.attachmentController.doUploadAttachment({ "site": (this.json.site || this.json.id) }, this.form.workAction.action, "uploadAttachment", { "id": this.form.businessData.work.id }, null, function (o) {
            if (o.id) {
                this.form.workAction.getAttachment(o.id, this.form.businessData.work.id, function (json) {
                    if (json.data) {
                        if (!json.data.control) json.data.control = {};

                        this.form.businessData.attachmentList.push(json.data);

                        this.attachmentController.addAttachment(json.data, o.messageId);
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
                    var content = MWF.xApplication.process.Xform.LP.uploadMore;
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
    },
    uploadAttachment: function (e, node, files) {
        if (window.o2android && window.o2android.uploadAttachment) {
            window.o2android.uploadAttachment((this.json.site || this.json.id));
        } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.uploadAttachment) {
            window.webkit.messageHandlers.uploadAttachment.postMessage({ "site": (this.json.site || this.json.id) });
        } else {
            // if (!this.uploadFileAreaNode){
            this.createUploadFileNode(files);
            // }
            // this.fileUploadNode.click();
        }
    },
    deleteAttachments: function (e, node, attachments) {
        var names = [];
        attachments.each(function (attachment) {
            names.push(attachment.data.name);
        }.bind(this));

        // if ((window.o2 && window.o2.replaceAttachment) || (window.webkit && window.webkit.messageHandlers)){
        //     if (window.confirm(MWF.xApplication.process.Xform.LP.deleteAttachment+"( "+names.join(", ")+" )")){
        //         while (attachments.length){
        //             attachment = attachments.shift();
        //             this.deleteAttachment(attachment);
        //         }
        //     }
        // }else {
        // var tmpNode = new Element("div", {
        //     "styles": {
        //         "background-color": "#0000ff",
        //         "border-style": "solid",
        //         "border-color": "#fff",
        //         "border-width": "1",
        //         "box-shadow": "0px 0px 20px #999",
        //         "z-index": "20000",
        //         "overflow": "hidden",
        //         "font-size": "14px",
        //         "height": "160px",
        //         "padding": "0px",
        //         "width": "300px",
        //         "position": "absolute",
        //         "top": "50px",
        //         "left": "20px",
        //         "opacity": 1,
        //         "border-radius": "5px"
        //     }
        // }).inject(this.form.app.content);

        var _self = this;
        this.form.confirm("warn", e, MWF.xApplication.process.Xform.LP.deleteAttachmentTitle, MWF.xApplication.process.Xform.LP.deleteAttachment + "( " + names.join(", ") + " )", 300, 120, function () {
            while (attachments.length) {
                var attachment = attachments.shift();
                _self.deleteAttachment(attachment);
            }
            this.close();
        }, function () {
            this.close();
        }, null, null, this.form.json.confirmStyle);
    },
    previewAttachment: function (attachments) {
        var att = attachments[0];
        new MWF.xApplication.process.Xform.AttachmenPreview(att,this);
    },
    deleteAttachment: function (attachment) {
        this.fireEvent("delete", [attachment.data]);
        var id = attachment.data.id;
        this.form.workAction.deleteAttachment(attachment.data.id, this.form.businessData.work.id, function (josn) {
            this.attachmentController.removeAttachment(attachment);
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

    replaceAttachment: function (e, node, attachment) {
        if (window.o2android && window.o2android.replaceAttachment) {
            window.o2android.replaceAttachment(attachment.data.id, (this.json.site || this.json.id));
        } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.replaceAttachment) {
            window.webkit.messageHandlers.replaceAttachment.postMessage({ "id": attachment.data.id, "site": (this.json.site || this.json.id) });
        } else {
            var _self = this;
            this.form.confirm("warn", e, MWF.xApplication.process.Xform.LP.replaceAttachmentTitle, MWF.xApplication.process.Xform.LP.replaceAttachment + "( " + attachment.data.name + " )", 350, 120, function () {
                _self.replaceAttachmentFile(attachment);
                this.close();
            }, function () {
                this.close();
            }, null, null, this.form.json.confirmStyle);
        }
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
        this.attachmentController.doUploadAttachment({ "site": (this.json.site || this.json.id) }, this.form.workAction.action, "replaceAttachment",
            { "id": attachment.data.id, "workid": this.form.businessData.work.id }, null, function (o) {
                this.form.workAction.getAttachment(attachment.data.id, this.form.businessData.work.id, function (json) {
                    attachment.data = json.data;
                    attachment.reload();

                    this.fireEvent("change");

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
        //
        //     var files = this.fileReplaceNode.files;
        //     if (files.length){
        //         for (var i = 0; i < files.length; i++) {
        //             var file = files.item(i);
        //
        //             var formData = new FormData();
        //             formData.append('file', file);
        //         //    formData.append('site', this.json.id);
        //
        //             this.form.workAction.replaceAttachment(attachment.data.id, this.form.businessData.work.id ,function(o, text){
        //                 this.form.workAction.getAttachment(attachment.data.id, this.form.businessData.work.id, function(json){
        //                     attachment.data = json.data;
        //                     attachment.reload();
        //                     this.attachmentController.checkActions();
        //                 }.bind(this))
        //             }.bind(this), null, formData, file);
        //         }
        //     }
        // }.bind(this));
    },

    replaceAttachmentFile: function (attachment) {
        //if (!this.replaceFileAreaNode){
        this.createReplaceFileNode(attachment);
        // }
        // this.fileReplaceNode.click();
    },
    queryDownload : function( att ){
        if( this.json.events && this.json.events.queryDownload && this.json.events.queryDownload.code ){
            var flag = this.form.Macro.exec(this.json.events.queryDownload.code, att );
            if( flag === false ){
                return false
            }else{
                return true;
            }
        }else{
            return true;
        }
    },
    queryOpen : function( att ){
        if( this.json.events && this.json.events.queryOpen && this.json.events.queryOpen.code ){
            var flag = this.form.Macro.exec(this.json.events.queryOpen.code, att );
            if( flag === false ){
                return false
            }else{
                return true;
            }
        }else{
            return true;
        }
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
    addMessage: function(data) {
        if (layout.desktop.message) {
            var msg = {
                "subject": MWF.xApplication.process.Xform.LP.taskProcessed,
                "content": data
            };
            layout.desktop.message.addTooltip(msg);
            return layout.desktop.message.addMessage(msg);
        } else {
            if (this.app.inBrowser) {
                this.inBrowserDkg(data);
            }
        }
    },
    downloadAttachment: function (e, node, attachments) {
        if (this.form.businessData.work && !this.form.businessData.work.completedTime) {
            attachments.each(function (att) {
                if( !this.queryDownload( att ) )return;
                if (window.o2android && window.o2android.downloadAttachment) {
                    window.o2android.downloadAttachment(att.data.id);
                } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.downloadAttachment) {
                    window.webkit.messageHandlers.downloadAttachment.postMessage({ "id": att.data.id, "site": (this.json.site || this.json.id) });
                } else if (window.wx && window.__wxjs_environment === 'miniprogram' && this.checkMiniProgramFile(att.data.extension)) { //微信小程序
                    wx.miniProgram.navigateTo({
                        url: '../file/download?attId=' + att.data.id + '&type=work&work=' + this.form.businessData.work.id
                    });
                } else {
                    if (layout.mobile) {
                        //移动端 企业微信 钉钉 用本地打开 防止弹出自带浏览器 无权限问题
                        this.form.workAction.getAttachmentUrl(att.data.id, this.form.businessData.work.id, function (url) {
                            var xtoken = Cookie.read(o2.tokenName);
                            window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                        });
                    } else {
                        var ua = navigator.userAgent.toLowerCase();
                        if (ua.indexOf('dingtalk') >= 0) {
                            this.form.workAction.getAttachmentUrl(att.data.id, this.form.businessData.work.id, function (url) {
                                var xtoken = Cookie.read(o2.tokenName);
                                window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                            });
                        } else {
                            this.form.workAction.getAttachmentStream(att.data.id, this.form.businessData.work.id);
                        }
                        
                    }
                }
                this.fireEvent("download",[att])
            }.bind(this));
        } else {
            attachments.each(function (att) {
                if( !this.queryDownload( att ) )return;
                if (window.o2android && window.o2android.downloadAttachment) {
                    window.o2android.downloadAttachment(att.data.id);
                } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.downloadAttachment) {
                    window.webkit.messageHandlers.downloadAttachment.postMessage({ "id": att.data.id, "site": (this.json.site || this.json.id) });
                } else if (window.wx && window.__wxjs_environment === 'miniprogram' && this.checkMiniProgramFile(att.data.extension)) { //微信小程序
                    wx.miniProgram.navigateTo({
                        url: '../file/download?attId=' + att.data.id + '&type=work&workCompleted=' + this.form.businessData.workCompleted.id
                    });
                } else {
                    if (layout.mobile) {
                        //移动端 企业微信 钉钉 用本地打开 防止弹出自带浏览器 无权限问题
                        this.form.workAction.getAttachmentWorkcompletedUrl(att.data.id, this.form.businessData.workCompleted.id, function (url) {
                            var xtoken = Cookie.read(o2.tokenName);
                            window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                        });
                    } else {
                        var ua = navigator.userAgent.toLowerCase();
                        if (ua.indexOf('dingtalk') >= 0) {
                            this.form.workAction.getAttachmentWorkcompletedUrl(att.data.id, this.form.businessData.workCompleted.id, function (url) {
                                var xtoken = Cookie.read(o2.tokenName);
                                window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                            });
                        } else {
                            this.form.workAction.getWorkcompletedAttachmentStream(att.data.id, this.form.businessData.workCompleted.id);
                        }
                        
                    }
                }
                this.fireEvent("download",[att])
            }.bind(this));
        }
    },
    openAttachment: function (e, node, attachments) {
        if (this.form.businessData.work && !this.form.businessData.work.completedTime) {
            attachments.each(function (att) {
                if( !this.queryOpen( att ) )return;
                if (window.o2android && window.o2android.downloadAttachment) {
                    window.o2android.downloadAttachment(att.data.id);
                } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.downloadAttachment) {
                    window.webkit.messageHandlers.downloadAttachment.postMessage({ "id": att.data.id, "site": (this.json.site || this.json.id) });
                } else if (window.wx && window.__wxjs_environment === 'miniprogram' && this.checkMiniProgramFile(att.data.extension)) { //微信小程序
                    wx.miniProgram.navigateTo({
                        url: '../file/download?attId=' + att.data.id + '&type=work&work=' + this.form.businessData.work.id
                    });
                } else {
                    if (layout.mobile) {
                        //移动端 企业微信 钉钉 用本地打开 防止弹出自带浏览器 无权限问题
                        this.form.workAction.getAttachmentUrl(att.data.id, this.form.businessData.work.id, function (url) {
                            var xtoken = Cookie.read(o2.tokenName);
                            window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                        });
                    } else {
                        // 钉钉客户端
                        var ua = navigator.userAgent.toLowerCase();
                        if (ua.indexOf('dingtalk') >= 0) {
                            this.form.workAction.getAttachmentUrl(att.data.id, this.form.businessData.work.id, function (url) {
                                var xtoken = Cookie.read(o2.tokenName);
                                window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                            });
                        } else {
                            this.form.workAction.getAttachmentData(att.data.id, this.form.businessData.work.id);
                        }
                    }

                }
                this.fireEvent("open",[att])
            }.bind(this));
        } else {
            attachments.each(function (att) {
                if( !this.queryOpen( att ) )return;
                if (window.o2android && window.o2android.downloadAttachment) {
                    window.o2android.downloadAttachment(att.data.id);
                } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.downloadAttachment) {
                    window.webkit.messageHandlers.downloadAttachment.postMessage({ "id": att.data.id, "site": (this.json.site || this.json.id) });
                } else if (window.wx && window.__wxjs_environment === 'miniprogram' && this.checkMiniProgramFile(att.data.extension)) { //微信小程序
                    wx.miniProgram.navigateTo({
                        url: '../file/download?attId=' + att.data.id + '&type=work&workCompleted=' + this.form.businessData.workCompleted.id
                    });
                } else {

                    if (layout.mobile) {
                        //移动端 企业微信 钉钉 用本地打开 防止弹出自带浏览器 无权限问题
                        this.form.workAction.getAttachmentWorkcompletedUrl(att.data.id, ((this.form.businessData.workCompleted) ? this.form.businessData.workCompleted.id : this.form.businessData.work.id), function (url) {
                            var xtoken = Cookie.read(o2.tokenName);
                            window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                        });
                    } else {
                        // 钉钉客户端
                        var ua = navigator.userAgent.toLowerCase();
                        if (ua.indexOf('dingtalk') >= 0) {
                            this.form.workAction.getAttachmentWorkcompletedUrl(att.data.id, ((this.form.businessData.workCompleted) ? this.form.businessData.workCompleted.id : this.form.businessData.work.id), function (url) {
                                var xtoken = Cookie.read(o2.tokenName);
                                window.location = o2.filterUrl(url + "?"+o2.tokenName+"=" + xtoken);
                            });
                        }else {
                            this.form.workAction.getWorkcompletedAttachmentData(att.data.id, ((this.form.businessData.workCompleted) ? this.form.businessData.workCompleted.id : this.form.businessData.work.id));
                        }
                    }
                }
                this.fireEvent("open",[att])
            }.bind(this));
        }
        //this.downloadAttachment(e, node, attachment);
    },
    getAttachmentUrl: function (attachment, callback) {
        if (this.form.businessData.work && !this.form.businessData.work.completedTime) {
            this.form.workAction.getAttachmentUrl(attachment.data.id, this.form.businessData.work.id, callback);
        } else {
            this.form.workAction.getAttachmentWorkcompletedUrl(attachment.data.id, this.form.businessData.workCompleted.id, callback);
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
                "orderNumber": att.data.orderNumber,
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
    /**
     * @summary 为组件重新设置附件，该附件必须已经上传。
     *  @param data {Array}.
     *  <pre><code class='language-js'>[{
     *     "id": "56c4e86f-a4c8-4cc2-a150-1a0d2c5febcb",   //附件ID
     *     "name": "133203a2-92e6-4653-9954-161b72ddb7f9.png", //附件名称
     *     "extension": "png",                             //附件扩展名
     *     "length": 43864,                                //附件大小
     *     "person": "xx@huqi@P",                          //附件上传人
     *     "lastUpdateTime": "2018-09-27 15:50:34",        //最后的修改时间
     *     "lastUpdatePerson": "xx@huqi@P",                //最后的修改人
     *     "activity": "e31ad938-c495-45a6-8d77-b8a9b61a165b", //附件上传的活动ID
     *     "activityName": "申请人",                           //附件上传的活动名称
     *     "activityType": "manual",                           //附件上传的活动类型
     *     "site": "$mediaOpinion",                        //附件存储位置（一般用于区分附件在哪个表单元素中显示）
     *     "type": "image/png",                             //附件类型（contentType）
     *     "control": {}
     * }]</code></pre>
     */
    setData: function(data){
        this.attachmentController.clear();
        ( data || [] ).each(function (att) {
            var attachment = this.form.businessData.attachmentList.find(function(a){
                return a.id==att.id;
            });
            var attData = attachment || att;

            this.attachmentController.addAttachment(attData);
        }.bind(this));
        this.setAttachmentBusinessData();
    },
    createErrorNode: function (text) {
        var node = new Element("div");
        var iconNode = new Element("div", {
            "styles": {
                "width": "20px",
                "height": "20px",
                "float": "left",
                "background": "url(" + "../x_component_process_Xform/$Form/default/icon/error.png) center center no-repeat"
            }
        }).inject(node);
        var textNode = new Element("div", {
            "styles": {
                "line-height": "20px",
                "margin-left": "20px",
                "color": "red",
                "word-break": "keep-all"
            },
            "text": text
        }).inject(node);
        return node;
    },
    notValidationMode: function (text) {
        if (!this.isNotValidationMode) {
            this.isNotValidationMode = true;
            this.node.store("borderStyle", this.node.getStyles("border-left", "border-right", "border-top", "border-bottom"));
            this.node.setStyle("border", "1px solid red");

            this.errNode = this.createErrorNode(text).inject(this.node, "after");
            this.showNotValidationMode(this.node);
        }
    },
    showNotValidationMode: function (node) {
        var p = node.getParent("div");
        if (p) {
            if (p.get("MWFtype") == "tab$Content") {
                if (p.getParent("div").getStyle("display") == "none") {
                    var contentAreaNode = p.getParent("div").getParent("div");
                    var tabAreaNode = contentAreaNode.getPrevious("div");
                    var idx = contentAreaNode.getChildren().indexOf(p.getParent("div"));
                    var tabNode = tabAreaNode.getLast().getFirst().getChildren()[idx];
                    tabNode.click();
                    p = tabAreaNode.getParent("div");
                }
            }
            this.showNotValidationMode(p);
        }
    },
    validationMode: function () {
        if (this.isNotValidationMode) {
            this.isNotValidationMode = false;
            this.node.setStyles(this.node.retrieve("borderStyle"));
            if (this.errNode) {
                this.errNode.destroy();
                this.errNode = null;
            }
        }
    },
    validationConfigItem: function (routeName, data) {
        var flag = (data.status == "all") ? true : (routeName == data.decision);
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
    },
    validationConfig: function (routeName, opinion) {
        if (this.json.validationConfig) {
            if (this.json.validationConfig.length) {
                for (var i = 0; i < this.json.validationConfig.length; i++) {
                    var data = this.json.validationConfig[i];
                    if (!this.validationConfigItem(routeName, data)) return false;
                }
            }
            return true;
        }
        return true;
    },
    /**
     * @summary 根据组件的校验设置进行校验。
     *  @param {String} [routeName] - 可选，路由名称.
     *  @example
     *  if( !this.form.get('fieldId').validation() ){
     *      return false;
     *  }
     *  @return {Boolean} 是否通过校验
     */
    validation: function (routeName, opinion) {
        if (!this.validationConfig(routeName, opinion)) return false;

        if (!this.json.validation) return true;
        if (!this.json.validation.code) return true;

        this.currentRouteName = routeName;
        var flag = this.form.Macro.exec(this.json.validation.code, this);
        this.currentRouteName = "";

        if (!flag) flag = MWF.xApplication.process.Xform.LP.notValidation;
        if (flag.toString() != "true") {
            this.notValidationMode(flag);
            return false;
        }
        return true;
    }

});
MWF.xApplication.process.Xform.AttachmenPreview = new Class({
    Implements: [Options, Events],

    initialize : function(att,app ){
        this.att = att;
        this.app = app;
        this.load();
    },
    load:function(){

        var extension = this.att.data.extension;
        if(extension === "ofd"){
            //ofd预览暂时屏蔽ie，等兼容性改好了开启
            if(Browser.name!=="ie"){
                this.previewOfd();
            }
        }
        if(extension === "zip"){
            this.previewZip();
        }
        if(extension === "pdf"){
            this.previewPdf();
        }
        if(["doc","docx","xls","xlsx","ppt","pptx"].contains(extension)){
            this.previewOffice();
        }
        if(["png","jpg","bmp","jpeg","gif"].contains(extension)){
            this.previewImage();
        }
        if(extension === "js"){
            this.previewAce("javascript");
        }
        if(extension === "css"){
            this.previewAce("css");
        }
        if(extension === "java"){
            this.previewAce("java");
        }
        if(extension === "json"){
            this.previewAce("json");
        }
        if(extension === "xml"){
            this.previewAce("xml");
        }
        if(extension === "php"){
            this.previewAce("php");
        }
        if(["html","htm","xhtml"].contains(extension)){
            this.previewAce("html");
        }
        if(["log","md","txt"].contains(extension)){
            this.previewAce("text");
        }
    },
    previewZip: function () {
        debugger
        //zip压缩包预览
        var _self = this;
        var zipViewNode = new Element("div",{"text":"loadding..."});
        o2.load(["../o2_lib/jszip/jszip.min.js", "../o2_lib/jszip/jszip-utils.min.js"], function () {
            this.app.getAttachmentUrl(this.att, function (url) {
                o2.require("MWF.widget.Tree", function(){
                    var dlg = o2.DL.open({
                        "title": _self.att.data.name,
                        "width": "660px",
                        "height": "510px",
                        "mask": true,
                        "content": zipViewNode,
                        "container": null,
                        "positionNode": document.body,
                        "onQueryClose": function () {
                            zipViewNode.destroy();
                        },
                        "buttonList": [
                            {
                                "text": "关闭",
                                "action": function () {
                                    dlg.close();
                                }
                            }
                        ],
                        "onPostShow": function () {
                            dlg.reCenter();
                        },
                        "onPostLoad" : function(){

                        }
                    });
                }.bind(this));
                zipViewNode.empty();
                JSZipUtils.getBinaryContent(url, function (err, data) {
                    JSZip.loadAsync(data).then(function (zip) {
                        var nodeList = [];
                        zip.forEach(function (relativePath, zipEntry) {
                            nodeList.push(zipEntry.name);
                        });
                        var tree = new MWF.widget.Tree(zipViewNode, {"style":"form"});
                        var treeData = _pathToTree(nodeList);
                        tree.load(treeData);


                    });
                });

            }.bind(this));
        }.bind(this));
        function _pathToTree(pathList) {
            var pathJsonList = [];
            for (var i = 0; i < pathList.length; i++) {
                var chain = pathList[i].split("/");
                var currentNode = pathJsonList;
                for (var j = 0; j < chain.length; j++) {
                    if (chain[j] === "") {
                        break;
                    }
                    var wantedNode = chain[j];
                    var lastNode = currentNode;
                    for (var k = 0; k < currentNode.length; k++) {
                        if (currentNode[k].name == wantedNode) {
                            currentNode = currentNode[k].sub;
                            break;
                        }
                    }
                    if (lastNode == currentNode) {
                        var obj = {
                            key: pathList[i],
                            name: wantedNode,
                            title:wantedNode,
                            text:wantedNode,
                            sub: []
                        };
                        var newNode = (currentNode[k] = obj);
                        if (wantedNode.indexOf(".") > -1) {
                            obj.dir = false;
                            obj.icon = "file.png";
                            delete obj.sub;
                        } else {
                            obj.dir = true;
                            obj.expand = false;
                            currentNode = newNode.sub;
                            //delete obj.sub;
                        }
                    } else {
                        delete currentNode.sub;
                    }
                }
            }
            var nodes = [];

            var folder = {
                "title" : _self.att.name,
                "text" : _self.att.name,
                "sub" : []
            };
            pathJsonList.each(function(path){
                folder.sub.push(path);
            })
            _sortPath(folder, nodes);
            return nodes;
        }
        function _sortPath(pathJsonList, nodes) {
            var folderList = [];
            pathJsonList.sub.each(function (file) {
                if (file.dir) {
                    folderList.push(file);
                }
            });
            pathJsonList.sub.each(function (file) {
                if (!file.dir) {
                    folderList.push(file);
                }
            });
            folderList.each(function (file) {
                var node = {
                    text: file.name,
                    title: file.name,
                    expand : false
                };
                if (!file.dir) {
                    node.icon = "file.png";
                }
                nodes.push(node);
                if(file.sub && file.sub.length>0){
                    node.sub = [];
                    _sortPath(file,node.sub);
                }

            })
        }
    },
    previewPdf : function(){
        this.app.getAttachmentUrl(this.att, function (url) {
            window.open("../o2_lib/pdfjs/web/viewer.html?file=" + url)
        });
    },
    previewOffice : function(){
        var srv = layout.serviceAddressList["x_libreoffice_assemble_control"];
        var protocol = window.location.protocol;
        var module;
        if(this.att.data.activity){
            module = "processPlatform";
        }
        if(this.att.data.categoryId){
            module = "cms";
        }
        var url = protocol + "//" + srv.host+ ":"  + srv.port +  srv.context + "/jaxrs/office/doc/to/pdf/"+ module +"/" + this.att.data.id;
        window.open("../o2_lib/pdfjs/web/viewer.html?file=" + url);
    },
    previewOfd : function(){
        this.app.getAttachmentUrl(this.att,  function (url) {
            window.open("../o2_lib/ofdjs/index.html?file=" + url)
        });
    },
    previewImage : function(){
        this.app.getAttachmentUrl(this.att, function (url) {
            var imgNode = new Element("img",{"src":url,"alt":this.att.name}).inject(document.body).hide();
            o2.loadCss("../o2_lib/viewer/viewer.css", document.body,function(){
                o2.load("../o2_lib/viewer/viewer.js", function(){
                    this.viewer = new Viewer(imgNode,{
                        navbar : false,
                        toolbar : false,
                        hidden : function(){
                            imgNode.destroy();
                            this.viewer.destroy();
                        }.bind(this)
                    });
                    this.viewer.show();
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },
    previewAce:function(type){
        debugger
        this.app.getAttachmentUrl(this.att,  function (url) {
            o2.require("o2.widget.ace", null, false);
            var fileRequest = new Request({
                url: url,
                method: 'get',
                withCredentials: true,
                onSuccess: function(responseText){
                    var editorNode = new Element("div",{"style":"padding:10px"});
                    editorNode.set("text",responseText);

                    o2.widget.ace.load(function(){
                        o2.load("../o2_lib/ace/src-min-noconflict/ext-static_highlight.js", function(){
                            var highlight = ace.require("ace/ext/static_highlight");
                            highlight(editorNode, {mode: "ace/mode/"+ type , theme: "ace/theme/tomorrow", "fontSize": 30,"showLineNumbers":true});
                        }.bind(this));

                    }.bind(this));
                    var dlg = o2.DL.open({
                        "title": this.att.data.name,
                        "width": "960px",
                        "height": "610px",
                        "mask": true,
                        "content": editorNode,
                        "container": null,
                        "positionNode": document.body,
                        "onQueryClose": function () {
                            editorNode.destroy();
                        }.bind(this),
                        "buttonList": [
                            {
                                "text": "关闭",
                                "action": function () {
                                    dlg.close();
                                }.bind(this)
                            }
                        ],
                        "onPostShow": function () {
                            dlg.reCenter();
                        }.bind(this)
                    });
                }.bind(this),
                onFailure: function(){
                    console.log('text', 'Sorry, your request failed :(');
                }
            });
            fileRequest.send();
        }.bind(this));

    },
});
MWF.xApplication.process.Xform.AttachmentDg = MWF.APPAttachmentDg = new Class({
    Extends: MWF.APPAttachment,
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
                        "orderNumber": d.data.orderNumber,
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
