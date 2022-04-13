package com.x.processplatform.assemble.surface.jaxrs.taskcompleted;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.TaskCompleted;

class ActionGet extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionGet.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			TaskCompleted taskCompleted = emc.find(id, TaskCompleted.class);
			if (null == taskCompleted) {
				throw new ExceptionEntityNotExist(id, TaskCompleted.class);
			}
			if (!business.readable(effectivePerson, taskCompleted)) {
				throw new ExceptionAccessDenied(effectivePerson, taskCompleted);
			}
			Wo wo = Wo.copier.copy(taskCompleted);
			result.setData(wo);
			return result;
		}
	}

	public static class Wo extends TaskCompleted {

		private static final long serialVersionUID = 2279846765261247910L;

		static WrapCopier<TaskCompleted, Wo> copier = WrapCopierFactory.wo(TaskCompleted.class, Wo.class, null,
				JpaObject.FieldsInvisible);

	}

}
