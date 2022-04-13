package com.x.cms.assemble.control.jaxrs.data;

import com.x.base.core.project.exception.LanguagePromptException;

class ExceptionArrayData extends LanguagePromptException {

	private static final long serialVersionUID = -665095222445791960L;

	ExceptionArrayData( ) {
		super("更新的数据不能为数组.");
	}
}
