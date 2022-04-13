package com.x.processplatform.service.processing.jaxrs.data;

import com.x.base.core.project.exception.PromptException;

import org.apache.commons.lang3.StringUtils;

class ExceptionDataNotExist extends PromptException {

	private static final long serialVersionUID = -665095222445791960L;

	ExceptionDataNotExist(String job, String[] paths) {
		super("data not exist job: {}, path: {}.", job, StringUtils.join(paths, "."));
	}
}
