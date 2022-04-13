package com.x.processplatform.service.processing.jaxrs.work;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.executor.ProcessPlatformExecutorFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Read;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.content.WorkLog;
import com.x.processplatform.core.entity.element.Activity;
import com.x.processplatform.core.entity.element.Form;
import com.x.processplatform.core.express.service.processing.jaxrs.work.V2RerouteWi;
import com.x.processplatform.service.processing.Business;
import com.x.processplatform.service.processing.MessageFactory;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

class V2Reroute extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(V2Reroute.class);

	/**
	 * @param effectivePerson current person
	 */
	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id, JsonElement jsonElement) throws Exception {

		final String job;
		final Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Work work = emc.fetch(id, Work.class, ListTools.toList(Work.job_FIELDNAME));
			if (null == work) {
				throw new ExceptionEntityNotExist(id, Work.class);
			}
			job = work.getJob();
		}

		Callable<ActionResult<Wo>> callable = () -> {
			ActionResult<Wo> result = new ActionResult<>();
			Work work;
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Business business = new Business(emc);
				work = emc.find(id, Work.class);
				if (null == work) {
					throw new ExceptionEntityNotExist(id, Work.class);
				}
				Activity activity = business.element().getActivity(wi.getActivity());
				if (!StringUtils.equals(work.getProcess(), activity.getProcess())) {
					throw new ExceptionProcessNotMatch();
				}
				emc.beginTransaction(Work.class);
				emc.beginTransaction(Task.class);
				emc.beginTransaction(Read.class);
				emc.beginTransaction(WorkLog.class);
				// 重新设置表单
				setForm(business, work, activity);
				// 调度强制把这个标志设置为true,这样可以避免在拟稿状态就调度,系统认为是拟稿状态,默认不创建待办.
				work.setWorkThroughManual(true);
				work.setDestinationActivity(activity.getId());
				work.setDestinationActivityType(activity.getActivityType());
				work.setDestinationRoute("");
				work.setDestinationRouteName("");
				work.getProperties().setManualForceTaskIdentityList(new ArrayList<String>());
				if (ListTools.isNotEmpty(wi.getManualForceTaskIdentityList())) {
					work.getProperties().setManualForceTaskIdentityList(wi.getManualForceTaskIdentityList());
				}
				if (BooleanUtils.isTrue(wi.getMergeWork())) {
					/* 合并工作 */
					work.setSplitting(false);
					work.setSplitToken("");
					work.getSplitTokenList().clear();
					work.setSplitValue("");
					removeAllTask(business, work);
					redirectOtherRead(business, work);
					removeOtherWork(business, work);
					removeOtherWorkLog(business, work);
				} else {
					removeTask(business, work);
				}
				emc.check(work, CheckPersistType.all);
				emc.commit();
			}
			Wo wo = new Wo();
			wo.setValue(true);
			result.setData(wo);
			return result;
		};
		return ProcessPlatformExecutorFactory.get(job).submit(callable).get(300, TimeUnit.SECONDS);

	}

	private void setForm(Business business, Work work, Activity activity) throws Exception {
		if (StringUtils.isNotEmpty(activity.getForm())) {
			// 表单需要重新判断,如果是从模板或者复制过来的流程可能发生表单不存在的情况.
			Form form = business.entityManagerContainer().find(activity.getForm(), Form.class);
			if (null != form) {
				work.setForm(form.getId());
			}
		}
	}

	public static class Wi extends V2RerouteWi {

	}

	public static class Wo extends WrapBoolean {
	}

	private void removeTask(Business business, Work work) throws Exception {
		/* 删除可能的待办 */
		List<Task> os = business.entityManagerContainer().listEqual(Task.class, Task.work_FIELDNAME, work.getId());
		os.stream().forEach(o -> {
			try {
				business.entityManagerContainer().remove(o, CheckRemoveType.all);
				MessageFactory.task_delete(o);
			} catch (Exception e) {
				logger.error(e);
			}
		});
	}

	private void redirectOtherRead(Business business, Work work) throws Exception {
		business.entityManagerContainer()
				.listEqualAndNotEqual(Read.class, Read.job_FIELDNAME, work.getJob(), Read.work_FIELDNAME, work.getId())
				.stream().forEach(o -> {
					try {
						o.setWork(work.getId());
					} catch (Exception e) {
						logger.error(e);
					}
				});
	}

	private void removeAllTask(Business business, Work work) throws Exception {
		business.entityManagerContainer().listEqual(Task.class, Task.job_FIELDNAME, work.getJob()).stream()
				.forEach(o -> {
					try {
						business.entityManagerContainer().remove(o, CheckRemoveType.all);
						MessageFactory.task_delete(o);
					} catch (Exception e) {
						logger.error(e);
					}
				});
	}

	private void removeOtherWork(Business business, Work work) throws Exception {
		List<Work> os = business.entityManagerContainer().listEqualAndNotEqual(Work.class, Work.job_FIELDNAME,
				work.getJob(), JpaObject.id_FIELDNAME, work.getId());
		os.stream().forEach(o -> {
			try {
				business.entityManagerContainer().remove(o, CheckRemoveType.all);
				MessageFactory.work_delete(o);
			} catch (Exception e) {
				logger.error(e);
			}
		});
	}

	private void removeOtherWorkLog(Business business, Work work) throws Exception {
		List<WorkLog> os = business.entityManagerContainer().listEqualAndEqualAndNotEqual(WorkLog.class,
				WorkLog.job_FIELDNAME, work.getJob(), WorkLog.connected_FIELDNAME, false,
				WorkLog.fromActivity_FIELDNAME, work.getActivity());
		os.stream().forEach(o -> {
			try {
				business.entityManagerContainer().remove(o, CheckRemoveType.all);
			} catch (Exception e) {
				logger.error(e);
			}
		});
	}

}