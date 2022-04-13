package com.x.processplatform.assemble.surface.jaxrs.snap;

import org.apache.commons.lang3.BooleanUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.assemble.surface.WorkControl;
import com.x.processplatform.core.entity.content.Work;

class ActionTypeAbandoned extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionTypeAbandoned.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String workId) throws Exception {
		String job = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			Work work = emc.find(workId, Work.class);
			if (null == work) {
				throw new ExceptionEntityNotExist(workId, Work.class);
			}
			WoControl control = business.getControl(effectivePerson, work, WoControl.class);
			if (BooleanUtils.isNotTrue(control.getAllowDelete())) {
				throw new ExceptionAccessDenied(effectivePerson, work);
			}
			job = work.getJob();
		}

		Wo wo = ThisApplication.context().applications()
				.getQuery(effectivePerson.getDebugger(), x_processplatform_service_processing.class,
						Applications.joinQueryUri("snap", "work", workId, "type", "abandoned"), job)
				.getData(Wo.class);
		ActionResult<Wo> result = new ActionResult<>();
		result.setData(wo);
		return result;

	}

	public static class Wo extends WoId {

		private static final long serialVersionUID = -2577413577740827608L;

	}

	public static class WoControl extends WorkControl {
	}

}
