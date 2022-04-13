package com.x.message.assemble.communicate.jaxrs.im;

import com.x.base.core.project.exception.PromptException;

class ExceptionGroupConversationEmptyMember extends PromptException {

	private static final long serialVersionUID = 4132300948670472899L;

	ExceptionGroupConversationEmptyMember() {
		super("群会话的成员列表不能为空或少于三个人.");
	}
}
