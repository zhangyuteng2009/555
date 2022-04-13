package com.x.processplatform.service.processing.jaxrs.record;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.core.entity.content.Record;

class ActionDelete extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionDelete.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {

		final Bag bag = new Bag();

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Record record = emc.find(id, Record.class);
			if (null == record) {
				throw new ExceptionEntityNotExist(id, Record.class);
			}
			bag.job = record.getJob();
		}

		Callable<ActionResult<Wo>> callable = new Callable<ActionResult<Wo>>() {
			public ActionResult<Wo> call() throws Exception {
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					Record record = emc.find(id, Record.class);
					emc.beginTransaction(Record.class);
					emc.remove(record, CheckRemoveType.all);
					emc.commit();
					ActionResult<Wo> result = new ActionResult<>();
					Wo wo = new Wo();
					wo.setId(record.getId());
					result.setData(wo);
					return result;
				}
			}
		};

		return ProcessPlatformExecutorFactory.get(bag.job).submit(callable).get(300, TimeUnit.SECONDS);

	}

	public static class Bag {
		String job;
	}

	public static class Wi extends Record {

		private static final long serialVersionUID = 4179509440650818001L;

		static WrapCopier<Wi, Record> copier = WrapCopierFactory.wi(Wi.class, Record.class, null,
				JpaObject.FieldsUnmodify);

	}

	public static class Wo extends WoId {

	}

}