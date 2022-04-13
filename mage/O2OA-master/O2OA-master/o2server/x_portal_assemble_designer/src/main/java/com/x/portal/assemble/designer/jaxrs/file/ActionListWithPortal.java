package com.x.portal.assemble.designer.jaxrs.file;

import java.util.List;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.ListTools;
import com.x.portal.assemble.designer.Business;
import com.x.portal.core.entity.File;
import com.x.portal.core.entity.Portal;

class ActionListWithPortal extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String portalFlag) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();
			Business business = new Business(emc);
			Portal portal = emc.flag(portalFlag, Portal.class);
			if (null == portal) {
				throw new ExceptionEntityNotExist(portalFlag, Portal.class);
			}
			if (!business.editable(effectivePerson, portal)) {
				throw new ExceptionAccessDenied(effectivePerson);
			}
			List<Wo> wos = emc.fetchEqual(File.class, Wo.copier, File.portal_FIELDNAME, portal.getId());
			wos = business.file().sort(wos);
			result.setData(wos);
			return result;
		}
	}

	public static class Wo extends File {

		private static final long serialVersionUID = -7495725325510376323L;

		public static WrapCopier<File, Wo> copier = WrapCopierFactory.wo(File.class, Wo.class, null,
				ListTools.toList(JpaObject.FieldsInvisible, File.data_FIELDNAME));

	}
}