package com.x.processplatform.assemble.surface.jaxrs.task;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.express.service.processing.jaxrs.task.WillWo;

class ActionWill extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionWill.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			Task task = emc.find(id, Task.class);
			if (null == task) {
				throw new ExceptionEntityNotExist(id, Task.class);
			}
			if (!business.readable(effectivePerson, task)) {
				throw new ExceptionAccessDenied(effectivePerson, task);
			}
			Wo wo = get(task);
			result.setData(wo);
			return result;
		}
	}

	private Wo get(Task task) throws Exception {
		return ThisApplication.context().applications().getQuery(x_processplatform_service_processing.class,
				Applications.joinQueryUri("task", task.getId(), "will"), task.getJob()).getData(Wo.class);
	}

	public static class Wo extends WillWo {

		private static final long serialVersionUID = 2279846765261247910L;

	}

}
