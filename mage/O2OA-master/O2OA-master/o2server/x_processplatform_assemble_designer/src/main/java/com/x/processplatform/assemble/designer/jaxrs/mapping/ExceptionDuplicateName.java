package com.x.processplatform.assemble.designer.jaxrs.mapping;

import com.x.base.core.project.exception.LanguagePromptException;

class ExceptionDuplicateName extends LanguagePromptException {

	private static final long serialVersionUID = -5515077418025884395L;

	ExceptionDuplicateName() {
		super("名称已存在.");
	}

}
