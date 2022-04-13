package com.x.organization.assemble.authentication.jaxrs.sso;

import com.x.base.core.project.exception.LanguagePromptException;

class ExceptionEmptyCredential extends LanguagePromptException {

	private static final long serialVersionUID = 4132300948670472899L;
	public static String defaultMessage = "名称为空.";

	ExceptionEmptyCredential() {
		super(defaultMessage);
	}
}
