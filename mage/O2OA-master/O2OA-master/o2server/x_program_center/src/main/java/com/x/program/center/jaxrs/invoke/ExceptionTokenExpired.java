package com.x.program.center.jaxrs.invoke;

import com.x.base.core.project.exception.LanguagePromptException;
import com.x.base.core.project.exception.PromptException;

class ExceptionTokenExpired extends LanguagePromptException {

	private static final long serialVersionUID = 4132300948670472899L;

	ExceptionTokenExpired() {
		super("token超时.");
	}
}
