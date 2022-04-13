package com.x.processplatform.assemble.surface.jaxrs.record;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.Record;
import com.x.processplatform.core.entity.content.Task;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

class ActionListWithJob extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionListWithJob.class);

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String job) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();

			Business business = new Business(emc);

			String workOrWorkCompleted = "";
			List<String> works = business.work().listWithJob(job);
			if(ListTools.isNotEmpty(works)){
				workOrWorkCompleted = works.get(0);
			}else{
				works = business.workCompleted().listWithJob(job);
				if(ListTools.isNotEmpty(works)){
					workOrWorkCompleted = works.get(0);
				}else{
					throw new ExceptionEntityNotExist(job);
				}
			}

			if (!business.readableWithWorkOrWorkCompleted(effectivePerson, workOrWorkCompleted,
					new ExceptionEntityNotExist(workOrWorkCompleted))) {
				throw new ExceptionAccessDenied(effectivePerson);
			}

			List<Wo> wos = emc.fetchEqual(Record.class, Wo.copier, Record.job_FIELDNAME, job);

			wos = wos.stream().sorted(Comparator.comparing(Wo::getOrder)).collect(Collectors.toList());

			for (Task task : emc.listEqual(Task.class, Task.job_FIELDNAME, job).stream()
					.sorted(Comparator.comparing(Task::getStartTime)).collect(Collectors.toList())) {
				Record record = this.taskToRecord(task);
				wos.add(Wo.copier.copy(record));
			}

			result.setData(wos);
			return result;
		}

	}

	private Record taskToRecord(Task task) {
		Record o = new Record();
		o.setType(Record.TYPE_CURRENTTASK);
		o.setFromActivity(task.getActivity());
		o.setFromActivityAlias(task.getActivityAlias());
		o.setFromActivityName(task.getActivityName());
		o.setFromActivityToken(task.getActivityToken());
		o.setFromActivityType(task.getActivityType());
		o.setPerson(task.getPerson());
		o.setIdentity(o.getIdentity());
		o.setUnit(task.getUnit());
		o.getProperties().setStartTime(task.getStartTime());
		o.getProperties().setEmpowerFromIdentity(task.getEmpowerFromIdentity());
		return o;
	}

	public static class Wo extends Record {

		private static final long serialVersionUID = -7666329770246726197L;

		static WrapCopier<Record, Wo> copier = WrapCopierFactory.wo(Record.class, Wo.class,
				JpaObject.singularAttributeField(Record.class, true, false), JpaObject.FieldsInvisible);

	}

}