package com.x.processplatform.service.processing.jaxrs.task;

import java.util.Date;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.BooleanUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Task;

class V2Resume extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(V2Resume.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {

		final String job;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Task task = emc.fetch(id, Task.class, ListTools.toList(Task.job_FIELDNAME));
			if (null == task) {
				throw new ExceptionEntityNotExist(id, Task.class);
			}
			job = task.getJob();
		}

		return ProcessPlatformExecutorFactory.get(job).submit(new CallableImpl(id)).get(300, TimeUnit.SECONDS);

	}

	private class CallableImpl implements Callable<ActionResult<Wo>> {

		private String id;

		CallableImpl(String id) {
			this.id = id;
		}

		@Override
		public ActionResult<Wo> call() throws Exception {
			ActionResult<Wo> result = new ActionResult<>();
			Wo wo = new Wo();
			wo.setValue(false);
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Task task = emc.find(id, Task.class);
				if (null == task) {
					throw new ExceptionEntityNotExist(id, Task.class);
				}
				if (BooleanUtils.isTrue(task.getPause()) && (null != task.getProperties().getPauseStartTime())) {
					Date now = new Date();
					int workTimeMinutes = (int) Config.workTime()
							.betweenMinutes(task.getProperties().getPauseStartTime(), now);
					int minutes = (int) (now.getTime() - task.getProperties().getPauseStartTime().getTime())
							/ (1000 * 60);
					if (null == task.getProperties().getPauseWorkTimeMinutes()) {
						task.getProperties().setPauseWorkTimeMinutes(workTimeMinutes);
					} else {
						task.getProperties().setPauseWorkTimeMinutes(
								task.getProperties().getPauseWorkTimeMinutes() + workTimeMinutes);
					}
					if (null == task.getProperties().getPauseMinutes()) {
						task.getProperties().setPauseMinutes(minutes);
					} else {
						task.getProperties().setPauseMinutes(task.getProperties().getPauseMinutes() + minutes);
					}
					// 在原有的过期时间基础上延时workTimeMinutes
					if (null != task.getExpireTime()) {
						task.setExpireTime(Config.workTime().forwardMinutes(task.getExpireTime(), workTimeMinutes));
						task.setExpired(task.getExpireTime().before(now));
					}
					emc.beginTransaction(Task.class);
					task.setPause(false);
					emc.commit();
					wo.setValue(true);
				}
			}
			result.setData(wo);
			return result;
		}
	}

	public static class Wo extends WrapBoolean {

		private static final long serialVersionUID = -8246623997534427403L;

	}

}