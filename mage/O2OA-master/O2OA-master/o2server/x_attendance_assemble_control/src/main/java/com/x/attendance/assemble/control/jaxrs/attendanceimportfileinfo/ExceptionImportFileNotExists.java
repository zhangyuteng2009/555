package com.x.attendance.assemble.control.jaxrs.attendanceimportfileinfo;

import com.x.base.core.project.exception.PromptException;

class ExceptionImportFileNotExists extends PromptException {

	private static final long serialVersionUID = 1859164370743532895L;

	public ExceptionImportFileNotExists( String id ) {
		super("指定的人员考勤数据导入文件信息不存在.ID:" + id );
	}
}
