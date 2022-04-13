package com.x.processplatform.assemble.surface.jaxrs.work;

import java.util.Objects;

import org.apache.commons.lang3.BooleanUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.element.ActivityType;
import com.x.processplatform.core.entity.element.Process;

class ActionCloseCheck extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		Wo wo = new Wo();

		Work work = null;
		Process process = null;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			work = emc.find(id, Work.class);
			if (null != work) {
				process = business.process().pick(work.getProcess());
			}
		}
		if ((null != work) && (null != process)) {
			wo.setDraft(this.draft(effectivePerson, work, process));
		} else {
			WoDraft woDraft = new WoDraft();
			woDraft.setValue(false);
			wo.setDraft(woDraft);
		}
		result.setData(wo);
		return result;
	}

	private WoDraft draft(EffectivePerson effectivePerson, Work work, Process process) throws Exception {
		WoDraft wo = new WoDraft();
		wo.setValue(false);
		if ((null != work) && (BooleanUtils.isFalse(work.getDataChanged()))
				&& (Objects.equals(ActivityType.manual, work.getActivityType()))) {
			if ((null != process) && (BooleanUtils.isTrue(process.getCheckDraft()))) {
				if (effectivePerson.isPerson(work.getCreatorPerson())) {
					ThisApplication.context().applications().deleteQuery(x_processplatform_service_processing.class,
							Applications.joinQueryUri("work", work.getId()), work.getJob()).getData(Wo.class);
					wo.setValue(true);
				}
			}
		}
		return wo;
	}

	public static class Wo extends GsonPropertyObject {

		@FieldDescribe("检查删除草稿结果")
		private WoDraft draft;

		public WoDraft getDraft() {
			return draft;
		}

		public void setDraft(WoDraft draft) {
			this.draft = draft;
		}

	}

	public static class WoDraft extends WrapBoolean {

	}

}