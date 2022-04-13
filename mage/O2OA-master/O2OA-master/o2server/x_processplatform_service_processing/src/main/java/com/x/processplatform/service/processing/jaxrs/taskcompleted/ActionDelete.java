package com.x.processplatform.service.processing.jaxrs.taskcompleted;

import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.base.core.project.annotation.ActionLogger;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.TaskCompleted;

class ActionDelete extends BaseAction {

	@ActionLogger
	private static Logger logger = LoggerFactory.getLogger(ActionDelete.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {

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
					emc.beginTransaction(TaskCompleted.class);
					List<TaskCompleted> os = emc.listEqualAndEqual(TaskCompleted.class, TaskCompleted.job_FIELDNAME,
							taskCompleted.getJob(), TaskCompleted.person_FIELDNAME, taskCompleted.getPerson());
					TaskCompleted latest = os.stream()
							.filter(o -> (!StringUtils.equals(o.getId(), taskCompleted.getId())))
							.sorted(Comparator
									.comparing(TaskCompleted::getStartTime, Comparator.nullsFirst(Date::compareTo))
									.reversed())
							.findFirst().orElse(null);
					if (null != latest) {
						latest.setLatest(true);
					}
					emc.remove(taskCompleted, CheckRemoveType.all);
					emc.commit();

					wo.setId(taskCompleted.getId());
				}
				return "";
			}
		};

		ProcessPlatformExecutorFactory.get(executorSeed).submit(callable).get(300, TimeUnit.SECONDS);

		result.setData(wo);
		return result;

	}

	public static class Wo extends WoId {
	}

}