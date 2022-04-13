package com.x.program.center.jaxrs.appstyle;

import com.x.base.core.project.exception.LanguagePromptException;
import com.x.base.core.project.exception.PromptException;

class ExceptionNameEmpty extends LanguagePromptException {

	private static final long serialVersionUID = -9089355008820123519L;

	ExceptionNameEmpty() {
		super("名称不能为空.");
	}
}
