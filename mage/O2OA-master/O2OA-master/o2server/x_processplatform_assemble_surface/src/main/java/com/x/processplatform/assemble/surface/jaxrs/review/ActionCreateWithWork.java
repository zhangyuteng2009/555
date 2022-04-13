package com.x.processplatform.assemble.surface.jaxrs.review;

import java.util.ArrayList;
import java.util.List;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.assemble.surface.WorkControl;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.content.WorkCompleted;

/**
 * 为指定的用户根据Work直接创建Review
 * 
 * @author zhour
 *
 */
class ActionCreateWithWork extends BaseAction {

	protected ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, JsonElement jsonElement)
			throws Exception {
		ActionResult<List<Wo>> result = new ActionResult<>();
		Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
		Work work = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			work = emc.find(wi.getWork(), Work.class);
			if (null == work) {
				throw new ExceptionEntityNotExist(wi.getWork(), WorkCompleted.class);
			}
			WoControl control = business.getControl(effectivePerson, work, WoControl.class);
			if (!control.getAllowVisit()) {
				throw new ExceptionAccessDenied(effectivePerson, work);
			}
			List<String> people = business.organization().person().list(wi.getPersonList());
			if (ListTools.isEmpty(people)) {
				throw new ExceptionPersonEmpty();
			}
		}
		List<Wo> wos = ThisApplication.context().applications()
				.postQuery(x_processplatform_service_processing.class,
						Applications.joinQueryUri("review", "create", "work"), wi, work.getJob())
				.getDataAsList(Wo.class);
		result.setData(wos);
		return result;
	}

	public static class Wi extends GsonPropertyObject {

		@FieldDescribe("流转中工作")
		private String work;

		@FieldDescribe("可阅读人员")
		private List<String> personList = new ArrayList<>();

		public List<String> getPersonList() {
			return personList;
		}

		public void setPersonList(List<String> personList) {
			this.personList = personList;
		}

		public String getWork() {
			return work;
		}

		public void setWork(String work) {
			this.work = work;
		}
	}

	public static class Wo extends WoId {
	}

	public static class WoControl extends WorkControl {
	}

}
