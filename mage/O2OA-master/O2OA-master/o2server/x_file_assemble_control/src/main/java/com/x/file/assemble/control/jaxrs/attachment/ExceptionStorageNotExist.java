package com.x.file.assemble.control.jaxrs.attachment;

import com.x.base.core.project.exception.PromptException;

class ExceptionStorageNotExist extends PromptException {

	private static final long serialVersionUID = 4132300948670472899L;

	ExceptionStorageNotExist(String name) {
		super("无法找到存储器: {}.", name);
	}
}
