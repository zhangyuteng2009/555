package com.x.cms.assemble.control.jaxrs.queryview;

import com.x.base.core.project.exception.LanguagePromptException;

class ExceptionInsufficientPermissions extends LanguagePromptException {

	private static final long serialVersionUID = 1859164370743532895L;

	ExceptionInsufficientPermissions( String flag ) {
		super("视图操作权限不足。Flag:{}", flag );
	}
}
