package com.x.processplatform.assemble.surface.jaxrs.data;

import org.apache.commons.lang3.BooleanUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.WorkCompletedControl;
import com.x.processplatform.core.entity.content.Data;
import com.x.processplatform.core.entity.content.WorkCompleted;

class ActionGetWithWorkCompletedPath3 extends BaseAction {

	ActionResult<JsonElement> execute(EffectivePerson effectivePerson, String id, String path0, String path1,
			String path2, String path3) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<JsonElement> result = new ActionResult<>();
			Business business = new Business(emc);
			WorkCompleted workCompleted = emc.find(id, WorkCompleted.class);
			if (null == workCompleted) {
				throw new ExceptionEntityNotExist(id, WorkCompleted.class);
			}
			WoControl control = business.getControl(effectivePerson, workCompleted, WoControl.class);
			if (BooleanUtils.isNotTrue(control.getAllowVisit())) {
				throw new ExceptionWorkCompletedAccessDenied(effectivePerson.getDistinguishedName(),
						workCompleted.getTitle(), workCompleted.getId());
			}
			if (BooleanUtils.isTrue(workCompleted.getMerged())) {
				Data data =  workCompleted.getProperties().getData();
				Object o = data.find(new String[] { path0, path1, path2, path3 });
				result.setData(gson.toJsonTree(o));
			} else {
				result.setData(this.getData(business, workCompleted.getJob(), path0, path1, path2, path3));
			}
			return result;
		}
	}

	public static class WoControl extends WorkCompletedControl {
	}
}
