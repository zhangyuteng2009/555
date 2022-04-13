package com.x.file.assemble.control.jaxrs.folder;

import com.x.base.core.project.exception.PromptException;

class ExceptionAccessDenied extends PromptException {

	private static final long serialVersionUID = 7750207007061165350L;

	ExceptionAccessDenied(String person) {
		super("用户: {}, 由于权限不足访问被拒绝.", person);
	}
}
