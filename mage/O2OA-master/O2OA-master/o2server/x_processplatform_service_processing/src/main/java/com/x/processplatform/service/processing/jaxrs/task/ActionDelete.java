package com.x.processplatform.service.processing.jaxrs.task;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.service.processing.MessageFactory;

class ActionDelete extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {

		String executorSeed = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {

			Task task = emc.fetch(id, Task.class, ListTools.toList(Task.job_FIELDNAME));

			if (null == task) {
				throw new ExceptionEntityNotExist(id, Task.class);
			}

			executorSeed = task.getJob();
		}
		Callable<ActionResult<Wo>> callable = () -> {
			ActionResult<Wo> result = new ActionResult<>();
			Wo wo = new Wo();
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Task task = emc.find(id, Task.class);
				if (null == task) {
					throw new ExceptionEntityNotExist(id, Task.class);
				}
				Work work = emc.find(task.getWork(), Work.class);
				if (null == work) {
					throw new ExceptionEntityNotExist(task.getWork(), Work.class);
				}
				emc.beginTransaction(Task.class);
				emc.beginTransaction(Work.class);
				emc.remove(task, CheckRemoveType.all);
				work.getManualTaskIdentityList().remove(task.getIdentity());
				emc.commit();
				MessageFactory.task_delete(task);
				wo.setId(task.getId());
				result.setData(wo);
				return result;
			}
		};

		return ProcessPlatformExecutorFactory.get(executorSeed).submit(callable).get(300, TimeUnit.SECONDS);

	}

	public static class Wo extends WoId {
	}

}