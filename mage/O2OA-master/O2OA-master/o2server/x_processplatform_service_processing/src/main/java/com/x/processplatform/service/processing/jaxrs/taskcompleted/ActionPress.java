package com.x.processplatform.service.processing.jaxrs.taskcompleted;

import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.annotation.ActionLogger;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapStringList;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.DateTools;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.entity.content.TaskCompleted;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.service.processing.MessageFactory;

class ActionPress extends BaseAction {

	@ActionLogger
	private static Logger logger = LoggerFactory.getLogger(ActionPress.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id, String workId) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		Wo wo = new Wo();
		String executorSeed = null;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			TaskCompleted taskCompleted = emc.fetch(id, TaskCompleted.class,
					ListTools.toList(TaskCompleted.job_FIELDNAME));
			if (null == taskCompleted) {
				throw new ExceptionEntityNotExist(id, TaskCompleted.class);
			}
			executorSeed = taskCompleted.getJob();
		}

		Callable<String> callable = new Callable<String>() {
			public String call() throws Exception {
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					TaskCompleted taskCompleted = emc.find(id, TaskCompleted.class);
					if (null == taskCompleted) {
						throw new ExceptionEntityNotExist(id, TaskCompleted.class);
					}
					Work work = emc.find(workId, Work.class);
					if (null == work) {
						throw new ExceptionEntityNotExist(workId, Work.class);
					}

					List<Task> list = emc.listEqual(Task.class, Task.work_FIELDNAME, work.getId());

					for (Task task : list) {
						MessageFactory.task_press(task, taskCompleted.getPerson());
						wo.getValueList().add(task.getPerson());
					}

					emc.beginTransaction(TaskCompleted.class);
					if (!StringUtils.equals(taskCompleted.getPressActivityToken(), work.getActivityToken())) {
						taskCompleted.setPressTime(new Date());
						taskCompleted.setPressActivityToken(work.getActivityToken());
						taskCompleted.setPressCount(1);
					} else {
						if (taskCompleted.getPressCount()!=null && taskCompleted.getPressCount() > 0) {
							taskCompleted.setPressCount(taskCompleted.getPressCount() + 1);
							taskCompleted.setPressTime(new Date());
						} else {
							taskCompleted.setPressTime(new Date());
							taskCompleted.setPressActivityToken(work.getActivityToken());
							taskCompleted.setPressCount(1);
						}
					}
					emc.commit();
				}
				return "";
			}
		};

		ProcessPlatformExecutorFactory.get(executorSeed).submit(callable).get(300, TimeUnit.SECONDS);

		result.setData(wo);
		return result;

	}

	public static class Wo extends WrapStringList {
	}

}