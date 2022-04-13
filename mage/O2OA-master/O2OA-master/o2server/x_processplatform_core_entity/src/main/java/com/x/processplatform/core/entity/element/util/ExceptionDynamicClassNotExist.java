package com.x.processplatform.core.entity.element.util;

import com.x.base.core.project.exception.PromptException;

class ExceptionDynamicClassNotExist extends PromptException {

	private static final long serialVersionUID = -5515077418025884395L;

	ExceptionDynamicClassNotExist(String className) {
		super("指定的类 {} 不存在.");
	}

}
