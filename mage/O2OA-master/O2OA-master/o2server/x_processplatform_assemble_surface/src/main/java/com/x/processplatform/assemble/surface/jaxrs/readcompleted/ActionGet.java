package com.x.processplatform.assemble.surface.jaxrs.readcompleted;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.ReadCompleted;

class ActionGet extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			ReadCompleted readCompleted = emc.find(id, ReadCompleted.class);
			if (null == readCompleted) {
				throw new ExceptionEntityNotExist(id, ReadCompleted.class);
			}
			if (!business.readable(effectivePerson, readCompleted)) {
				throw new ExceptionAccessDenied(effectivePerson, readCompleted);
			}
			Wo wo = Wo.copier.copy(readCompleted);
			result.setData(wo);
			return result;
		}
	}

	public static class Wo extends ReadCompleted {

		private static final long serialVersionUID = 2931315993254833082L;

		static WrapCopier<ReadCompleted, Wo> copier = WrapCopierFactory.wo(ReadCompleted.class, Wo.class, null,
				JpaObject.FieldsInvisible);
	}

}