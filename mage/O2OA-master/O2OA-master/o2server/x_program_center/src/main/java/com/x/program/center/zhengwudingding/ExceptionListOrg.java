package com.x.program.center.zhengwudingding;

import com.x.base.core.project.exception.LanguagePromptException;
import com.x.base.core.project.exception.PromptException;

class ExceptionListOrg extends LanguagePromptException {

	private static final long serialVersionUID = 4132300948670472899L;

	ExceptionListOrg(Integer retCode, String retMessage) {
		super("政务钉钉获取下级组织失败,错误代码:{},错误消息:{}.", retCode, retMessage);
	}
}
