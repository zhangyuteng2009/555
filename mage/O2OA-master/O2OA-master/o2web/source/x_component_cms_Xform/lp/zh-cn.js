MWF.xApplication.process = MWF.xApplication.process || {};
MWF.xApplication.process.Xform = MWF.xApplication.process.Xform || {};
MWF.xDesktop.requireApp("process.Xform", "lp."+MWF.language, null, false);
MWF.xApplication.cms = MWF.xApplication.cms || {};
MWF.xApplication.cms.Xform = MWF.xApplication.cms.Xform || {};
MWF.xApplication.cms.Xform.LP = Object.merge({}, MWF.xApplication.process.Xform.LP, {
    "dataSaved": "数据保存成功",
    "documentPublished" : "发布成功" ,


    "noSelectRange": "无法确定选择范围",

    "begin": "起",
    "end": "止",
    "none": "无",

    "person": "人员名称",
    "department": "单位",
    "firstDate": "首次阅读时间",
    "readDate": "最近阅读时间",
    "readCount" : "阅读次数",
    "startTime": "收到时间",
    "completedTime": "处理时间",
    "opinion": "意见",

    "systemProcess": "系统处理",

    "deleteAttachmentTitle":"删除附件确认",
    "deleteAttachment": "是否确定要删除您选中的附件？",

    "replaceAttachmentTitle":"替换附件确认",
    "replaceAttachment": "是否确定要替换您选中的附件？",
    "uploadMore": "您最多只允许上传 {n} 个附件",
    "notValidation": "数据校验未通过",

    "deleteDocumentTitle": "删除文件确认",
    "deleteDocumentText": {"html": "<div style='color: red;'>注意：您正在删除此文档，删除后文档无法找回，您确认要删除此文件？</div>"},
    "documentDelete": "已经删除文件",

    "readerFieldNotice" : "不选则全员可见",

    "readedLogTitle" : "阅读记录",
    "readedCountText" : "共{person}人、{count}次阅读",
    "defaultReadedLogText" : "<font style='color:#00F;'>{person}</font>（{department}） 阅于<font style='color:#00F'>{date}</font>，共<font style='color:#00F'>{count}</font>次",

    "reply" : "评论",
    "commentTitle" : "评论区域",
    "commentCountText" : "共{count}次评论",

    "saveComment" : "发表评论",
    "saveCommentSuccess" : "发布评论成功",
    "deleteCommentTitle" : "删除评论确认",
    "deleteCommentText" : "删除评论后不能恢复，您确定要删除此评论？",
    "deleteCommentSuccess" : "删除评论成功",
    "commentFormTitle" : "编辑评论",
    "createCommentSuccess" : "创建评论成功",
    "updateSuccess" : "更新成功",
    "save" : "保存",

    "setTopTitle": "置顶确认",
    "setTopText": "确定将当前文档置顶？",
    "setTopSuccess": "置顶成功",
    "cancelTopTitle": "取消置顶确认",
    "cancelTopText": "确定将当前文档取消置顶？",
    "cancelTopSuccess": "取消置顶成功",

    "attachmentArea" : "附件区域",
    "selectAttachment" : "选择附件",

    "yesterday" : "昨天",
    "theDayBeforeYesterday" : "前天",
    "severalWeekAgo" : "{count}周前",
    "severalDayAgo" : "{count}天前",
    "severalHourAgo" : "{count}小时前",
    "severalMintuesAgo" : "{count}分钟前",
    "justNow" : "刚才",
    "form": {
        "close":"关闭",
        "closeTitle": "关闭文档",
        "edit": "编辑",
        "editTitle": "编辑文档",
        "save": "保存",
        "saveTitle": "保存文档",
        "publish": "发布",
        "publishTitle": "发布文档",
        "saveDraft": "保存草稿",
        "saveDraftTitle": "保存草稿",
        "popular": "设置热点",
        "popularTitle": "设置热点",
        "delete": "删除",
        "deleteTitle": "删除文档",
        "print": "打印",
        "printTitle": "打印文档",
        "setTop": "置顶",
        "setTopTitle": "对文档置顶",
        "cancelTop": "取消置顶",
        "cancelTopTitle": "取消对文档的置顶"
    }

    //"at" : "阅于",
    //"readdDocument" : "，",
    //"historyRead" : "共",
    //"times" : "次"
});
MWF.xApplication.cms.Xform["lp."+o2.language] = MWF.xApplication.cms.Xform.LP;