package com.x.program.center.qiyeweixin;

import com.x.base.core.project.exception.LanguagePromptException;
import com.x.base.core.project.exception.PromptException;

class ExceptionListUser extends LanguagePromptException {

	private static final long serialVersionUID = 4132300948670472899L;

	ExceptionListUser(Integer retCode, String retMessage) {
		super("政务钉钉获取组织成员失败,错误代码:{},错误消息:{}.", retCode, retMessage);
	}
}
