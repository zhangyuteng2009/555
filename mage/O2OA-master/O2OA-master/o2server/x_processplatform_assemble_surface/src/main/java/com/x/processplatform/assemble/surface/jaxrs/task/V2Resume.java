package com.x.processplatform.assemble.surface.jaxrs.task;

import org.apache.commons.lang3.BooleanUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.express.service.processing.jaxrs.task.V2ResumeWo;

class V2Resume extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(V2Resume.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		String job = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			Task task = emc.find(id, Task.class);
			if (null == task) {
				throw new ExceptionEntityNotExist(id, Task.class);
			}
			if (!business.readable(effectivePerson, task)) {
				throw new ExceptionAccessDenied(effectivePerson, task);
			}
			if ((!BooleanUtils.isTrue(task.getPause())) || (null == task.getProperties().getPauseStartTime())) {
				throw new ExceptionAlreadyResume(task.getId());
			}
			job = task.getJob();
		}
		V2ResumeWo resp = ThisApplication.context().applications().getQuery(effectivePerson.getDebugger(),
				x_processplatform_service_processing.class, Applications.joinQueryUri("task", "v2", id, "resume"), job)
				.getData(V2ResumeWo.class);
		Wo wo = new Wo();
		wo.setValue(resp.getValue());
		result.setData(wo);
		return result;
	}

	public static class Wo extends WrapBoolean {

		private static final long serialVersionUID = 4257481488388740879L;

	}

}
