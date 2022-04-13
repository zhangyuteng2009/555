package com.x.program.center.jaxrs.module;

import com.x.base.core.project.exception.LanguagePromptException;

class ExceptionDisable extends LanguagePromptException {

	private static final long serialVersionUID = 9107373129400635015L;

	ExceptionDisable() {
		super("没有启用连接到注册服务器功能.");
	}
}
