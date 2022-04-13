package com.x.program.center.dingding;

import com.x.base.core.project.exception.LanguagePromptException;
import com.x.base.core.project.exception.PromptException;

class ExceptionDetailOrg extends LanguagePromptException {

	private static final long serialVersionUID = 4132300948670472899L;

	ExceptionDetailOrg(Integer retCode, String retMessage) {
		super("钉钉获取组织信息失败,错误代码:{},错误消息:{}.", retCode, retMessage);
	}
}
