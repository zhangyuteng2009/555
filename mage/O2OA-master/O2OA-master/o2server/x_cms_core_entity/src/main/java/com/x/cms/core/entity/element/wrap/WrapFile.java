package com.x.cms.core.entity.element.wrap;

import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.cms.core.entity.element.File;

public class WrapFile extends File {

	private static final long serialVersionUID = -4796891325524967094L;

	public static WrapCopier<File, WrapFile> outCopier = WrapCopierFactory.wo(File.class, WrapFile.class, null,
			JpaObject.FieldsInvisible);

	public static WrapCopier<WrapFile, File> inCopier = WrapCopierFactory.wi(WrapFile.class, File.class, null,
			JpaObject.FieldsUnmodifyExcludeId);

}