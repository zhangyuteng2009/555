package com.x.cms.assemble.control.jaxrs.document;

import com.x.base.core.project.exception.PromptException;

class ExceptionDocumentInfoProcess extends PromptException {

	private static final long serialVersionUID = 1859164370743532895L;

	ExceptionDocumentInfoProcess( Throwable e, String message ) {
		super( message, e );
	}
	
	ExceptionDocumentInfoProcess( String message ) {
		super( message);
	}
}
