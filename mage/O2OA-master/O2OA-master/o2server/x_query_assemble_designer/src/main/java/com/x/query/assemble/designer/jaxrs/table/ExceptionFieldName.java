package com.x.query.assemble.designer.jaxrs.table;

import com.x.base.core.project.exception.LanguagePromptException;

class ExceptionFieldName extends LanguagePromptException {

	private static final long serialVersionUID = -9089355008820123519L;

	ExceptionFieldName(String name) {
		super("字段名不可用:{}.", name);
	}
}
