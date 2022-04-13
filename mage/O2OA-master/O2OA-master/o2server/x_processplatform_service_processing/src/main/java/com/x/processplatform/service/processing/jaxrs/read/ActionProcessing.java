package com.x.processplatform.service.processing.jaxrs.read;

import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.base.core.project.annotation.ActionLogger;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Read;
import com.x.processplatform.core.entity.content.ReadCompleted;
import com.x.processplatform.service.processing.Business;
import com.x.processplatform.service.processing.MessageFactory;

class ActionProcessing extends BaseAction {

	@ActionLogger
	private static Logger logger = LoggerFactory.getLogger(ActionProcessing.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {

		ActionResult<Wo> result = new ActionResult<>();
		Wo wo = new Wo();
		String executorSeed = null;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Read read = emc.fetch(id, Read.class, ListTools.toList(Read.job_FIELDNAME));
			if (null == read) {
				throw new ExceptionEntityNotExist(id, Read.class);
			}
			executorSeed = read.getJob();
		}

		Callable<String> callable = new Callable<String>() {
			public String call() throws Exception {
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					ActionResult<Wo> result = new ActionResult<>();
					Wo wo = new Wo();
					Business business = new Business(emc);
					Read read = emc.find(id, Read.class);
					if (null == read) {
						throw new ExceptionEntityNotExist(id, Read.class);
					}
					emc.beginTransaction(Read.class);
					emc.beginTransaction(ReadCompleted.class);
					Date now = new Date();
					Long duration = Config.workTime().betweenMinutes(read.getStartTime(), now);
					ReadCompleted readCompleted = new ReadCompleted(read, now, duration);
					List<ReadCompleted> exists = listExist(business, read);
					if (exists.isEmpty()) {
						emc.persist(readCompleted, CheckPersistType.all);
						MessageFactory.readCompleted_create(readCompleted);
					} else {
						for (ReadCompleted o : exists) {
							readCompleted.copyTo(o, JpaObject.FieldsUnmodify);
						}
					}
					emc.remove(read, CheckRemoveType.all);
					emc.commit();
					MessageFactory.read_to_readCompleted(readCompleted);

					wo.setId(read.getId());
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

	private List<ReadCompleted> listExist(Business business, Read read) throws Exception {
		return business.entityManagerContainer().listEqualAndEqual(ReadCompleted.class, ReadCompleted.job_FIELDNAME,
				read.getJob(), ReadCompleted.person_FIELDNAME, read.getPerson());
	}

}
