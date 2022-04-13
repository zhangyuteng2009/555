package com.x.processplatform.service.processing.jaxrs.snap;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.core.entity.content.Attachment;
import com.x.processplatform.core.entity.content.Read;
import com.x.processplatform.core.entity.content.ReadCompleted;
import com.x.processplatform.core.entity.content.Record;
import com.x.processplatform.core.entity.content.Review;
import com.x.processplatform.core.entity.content.Snap;
import com.x.processplatform.core.entity.content.TaskCompleted;
import com.x.processplatform.core.entity.content.WorkCompleted;
import com.x.processplatform.core.entity.content.WorkLog;
import com.x.processplatform.service.processing.Business;
import com.x.query.core.entity.Item;

class ActionTypeAbandonedWorkCompleted extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionTypeAbandonedWorkCompleted.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String workCompletedId) throws Exception {
		String job = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			WorkCompleted workCompleted = emc.find(workCompletedId, WorkCompleted.class);
			if (null == workCompleted) {
				throw new ExceptionEntityNotExist(workCompletedId, WorkCompleted.class);
			}
			job = workCompleted.getJob();
		}
		return ProcessPlatformExecutorFactory.get(job).submit(new CallableImpl(workCompletedId)).get(300,
				TimeUnit.SECONDS);
	}

	public class CallableImpl implements Callable<ActionResult<Wo>> {

		private String id;

		public CallableImpl(String id) {
			this.id = id;
		}

		public ActionResult<Wo> call() throws Exception {
			ActionResult<Wo> result = new ActionResult<>();
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Business business = new Business(emc);
				WorkCompleted workCompleted = emc.find(id, WorkCompleted.class);
				if (null == workCompleted) {
					throw new ExceptionEntityNotExist(id, WorkCompleted.class);
				}
				Snap snap = new Snap(workCompleted);
				List<Item> items = new ArrayList<>();
				List<TaskCompleted> taskCompleteds = new ArrayList<>();
				List<Read> reads = new ArrayList<>();
				List<ReadCompleted> readCompleteds = new ArrayList<>();
				List<Review> reviews = new ArrayList<>();
				List<WorkLog> workLogs = new ArrayList<>();
				List<Record> records = new ArrayList<>();
				List<Attachment> attachments = new ArrayList<>();
				snap.setProperties(snap(business, workCompleted.getJob(), items, workCompleted, taskCompleteds, reads,
						readCompleteds, reviews, workLogs, records, attachments));
				snap.setType(Snap.TYPE_ABANDONEDWORKCOMPLETED);
				emc.beginTransaction(Snap.class);
				emc.persist(snap, CheckPersistType.all);
				emc.commit();
				clean(business, items, workCompleted, taskCompleteds, reads, readCompleteds, reviews, workLogs, records,
						attachments);
				emc.commit();
				Wo wo = new Wo();
				wo.setId(snap.getId());
				result.setData(wo);
				return result;
			}
		}
	}

	public static class Wo extends WoId {

		private static final long serialVersionUID = -2577413577740827608L;

	}

}
