package com.x.cms.assemble.control.jaxrs.permission;

import com.x.base.core.project.exception.PromptException;

class ExceptionServiceLogic extends PromptException {

	private static final long serialVersionUID = 1859164370743532895L;

	ExceptionServiceLogic( String message ) {
		super( message );
	}
	
	public ExceptionServiceLogic( Throwable e, String message ) {
		super( message, e );
	}
}
