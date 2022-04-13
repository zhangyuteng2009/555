package com.x.processplatform.service.processing.jaxrs.data;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.service.processing.Business;

class ActionUpdateWithJobPath1 extends BaseAction {

	private static final Logger LOGGER = LoggerFactory.getLogger(ActionUpdateWithJobPath1.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String job, String path0, String path1,
			JsonElement jsonElement) throws Exception {
		LOGGER.debug("{} access.", effectivePerson::getDistinguishedName);
		ActionResult<Wo> result = new ActionResult<>();

		String executorSeed = null;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			List<Work> works = emc.fetchEqual(Work.class, Arrays.asList(Work.job_FIELDNAME), Work.job_FIELDNAME, job);
			if (!works.isEmpty()) {
				executorSeed = job;
			} else {
				throw new ExceptionJobNotExist(job);
			}
		}

		Callable<Wo> callable = callable(job, path0, path1, jsonElement);

		Wo wo = ProcessPlatformExecutorFactory.get(executorSeed).submit(callable).get(300, TimeUnit.SECONDS);

		result.setData(wo);
		return result;
	}

	private Callable<Wo> callable(String job, String path0, String path1, JsonElement jsonElement) {
		return () -> {
			Wo wo = new Wo();
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Business business = new Business(emc);
				List<Work> works = emc.listEqual(Work.class, Work.job_FIELDNAME, job);
				if (!works.isEmpty()) {
					for (Work work : works) {
						/* 先更新title和serial,再更新DataItem,因为旧的DataItem中也有title和serial数据. */
						updateTitleSerial(business, work, jsonElement);
					}
					/* updateTitleSerial 和 updateData 方法内进行了提交 */
					updateData(business, works.get(0), jsonElement, path0, path1);
				}
				wo.setId(job);
			}
			return wo;
		};
	}

	public static class Wo extends WoId {

		private static final long serialVersionUID = -7831217351198031373L;

	}
}
