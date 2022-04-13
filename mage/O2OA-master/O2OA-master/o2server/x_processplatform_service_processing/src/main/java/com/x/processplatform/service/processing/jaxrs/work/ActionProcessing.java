package com.x.processplatform.service.processing.jaxrs.work;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.BooleanUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.log.SignalStackLog;
import com.x.processplatform.core.express.ProcessingAttributes;
import com.x.processplatform.service.processing.Processing;
import com.x.processplatform.service.processing.ThisApplication;

class ActionProcessing extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionProcessing.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id, JsonElement jsonElement) throws Exception {

		String job;

		Wi wi = this.convertToWrapIn(jsonElement, Wi.class);

		ActionResult<Wo> result = new ActionResult<>();

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {

			wi.setDebugger(effectivePerson.getDebugger());

			Work work = emc.find(id, Work.class);

			if (null == work) {
				throw new ExceptionEntityNotExist(id, Work.class);
			}

			job = work.getJob();

		}

		try {
			open(id, wi);
			Wo wo = ProcessPlatformExecutorFactory.get(job).submit(new CallableExecute(wi, id)).get(300,
					TimeUnit.SECONDS);
			persistSignalStack(id, job, wi);
			result.setData(wo);
			return result;
		} finally {
			close(id, wi);
		}
	}

	private void open(String id, Wi wi) {
		ThisApplication.getProcessingToProcessingSignalStack().open(id, wi.getSeries(), wi.getSignalStack());
	}

	private void close(String id, Wi wi) {
		ThisApplication.getProcessingToProcessingSignalStack().close(id, wi.getSeries());
	}

	private void persistSignalStack(String id, String job, Wi wi) throws Exception {
		if (BooleanUtils.isNotTrue(Config.processPlatform().getProcessingSignalPersistEnable())) {
			return;
		}
		new Thread(() -> {
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				emc.beginTransaction(SignalStackLog.class);
				SignalStackLog log = new SignalStackLog(id, job, wi.getSignalStack());
				emc.persist(log, CheckPersistType.all);
				emc.commit();
			} catch (Exception e) {
				logger.error(e);
			}
		}).start();
	}

	private class CallableExecute implements Callable<Wo> {
		private Wi wi;
		private String id;

		private CallableExecute(Wi wi, String id) {
			this.wi = wi;
			this.id = id;
		}

		public Wo call() throws Exception {
			Processing processing = new Processing(wi);
			processing.processing(id);
			Wo wo = new Wo();
			wo.setId(id);
			return wo;
		}
	}

	public static class Wi extends ProcessingAttributes {

		private static final long serialVersionUID = -7448961581565944869L;

	}

	public static class Wo extends WoId {

		private static final long serialVersionUID = 3933030965024291084L;
	}

}