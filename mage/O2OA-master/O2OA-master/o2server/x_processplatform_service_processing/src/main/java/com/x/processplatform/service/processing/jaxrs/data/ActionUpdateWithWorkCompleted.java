package com.x.processplatform.service.processing.jaxrs.data;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.BooleanUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.annotation.ActionLogger;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.gson.XGsonBuilder;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.content.WorkCompleted;
import com.x.processplatform.service.processing.Business;
import com.x.processplatform.service.processing.jaxrs.data.ActionUpdateWithWork.Wo;

class ActionUpdateWithWorkCompleted extends BaseAction {

	@ActionLogger
	private static Logger logger = LoggerFactory.getLogger(ActionUpdateWithWorkCompleted.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id, JsonElement jsonElement) throws Exception {

		ActionResult<Wo> result = new ActionResult<>();
		Wo wo = new Wo();
		String executorSeed = null;

		// 防止提交空数据清空data
		if (null == jsonElement || (!jsonElement.isJsonObject())) {
			throw new ExceptionNotJsonObject();
		}

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			WorkCompleted workCompleted = emc.fetch(id, WorkCompleted.class,
					ListTools.toList(WorkCompleted.job_FIELDNAME));
			if (null == workCompleted) {
				throw new ExceptionEntityNotExist(id, WorkCompleted.class);
			}
			executorSeed = workCompleted.getJob();
		}

		Callable<ActionResult<Wo>> callable = new Callable<ActionResult<Wo>>() {
			public ActionResult<Wo> call() throws Exception {
				ActionResult<Wo> result = new ActionResult<>();
				Wo wo = new Wo();
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					Business business = new Business(emc);
					WorkCompleted workCompleted = emc.find(id, WorkCompleted.class);
					if (null == workCompleted) {
						throw new ExceptionEntityNotExist(id, WorkCompleted.class);
					}
					if (BooleanUtils.isTrue(workCompleted.getMerged())) {
						throw new ExceptionModifyMerged(workCompleted.getId());
					}

					JsonElement source = getData(business, workCompleted.getJob());

					JsonElement merge = XGsonBuilder.merge(jsonElement, source);

					/* 先更新title和serial,再更新DataItem,因为旧的DataItem中也有title和serial数据. */
					updateTitleSerial(business, workCompleted, merge);
					updateData(business, workCompleted, merge);
					/* updateTitleSerial 和 updateData 方法内进行了提交 */
					wo.setId(workCompleted.getId());
				}
				result.setData(wo);
				return result;
			}
		};

		ProcessPlatformExecutorFactory.get(executorSeed).submit(callable).get(300, TimeUnit.SECONDS);

		result.setData(wo);
		return result;
	}

	public static class Wo extends WoId {

	}

}
