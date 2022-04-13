package com.x.processplatform.service.processing.jaxrs.task;

import java.util.Date;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.BooleanUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Task;

class V2Pause extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(V2Pause.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {

		final String job;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Task task = emc.fetch(id, Task.class, ListTools.toList(Task.job_FIELDNAME));
			if (null == task) {
				throw new ExceptionEntityNotExist(id, Task.class);
			}
			job = task.getJob();
		}

		Callable<ActionResult<Wo>> callable = () -> {
			ActionResult<Wo> result = new ActionResult<>();
			Wo wo = new Wo();
			wo.setValue(false);
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Task task = emc.find(id, Task.class);
				if (null == task) {
					throw new ExceptionEntityNotExist(id, Task.class);
				}
				if (BooleanUtils.isNotTrue(task.getPause())) {
					emc.beginTransaction(Task.class);
					task.setPause(true);
					task.getProperties().setPauseStartTime(new Date());
					emc.commit();
					wo.setValue(true);
				}
			}
			result.setData(wo);
			return result;
		};

		return ProcessPlatformExecutorFactory.get(job).submit(callable).get(300, TimeUnit.SECONDS);

	}

	public static class Wo extends WrapBoolean {

		private static final long serialVersionUID = 2752464360851471911L;

	}

}