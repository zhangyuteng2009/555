package com.x.processplatform.assemble.surface.jaxrs.work;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.core.entity.content.Work;

class ActionProcessing extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		Work work = null;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			work = emc.find(id, Work.class);
			if (null == work) {
				throw new ExceptionWorkNotExist(id);
			}
			emc.beginTransaction(Work.class);
			/* 标识数据被修改 */
			work.setDataChanged(true);
			emc.commit();
		}
		Wo wo = ThisApplication.context().applications()
				.putQuery(effectivePerson.getDebugger(), x_processplatform_service_processing.class,
						Applications.joinQueryUri("work", work.getId(), "processing"), null, work.getJob())
				.getData(Wo.class);
//		work = emc.find(id, Work.class);
//		if (null != work) {
//			wo.setId(work.getId());
//		}
		result.setData(wo);
		return result;
	}

	public static class Wo extends WoId {

	}

}