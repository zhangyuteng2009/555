package com.x.processplatform.assemble.surface.jaxrs.data;

import com.google.gson.JsonElement;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.assemble.surface.WorkControl;

class ActionUpdateWithJobPath7 extends BaseAction {

	private static final Logger LOGGER = LoggerFactory.getLogger(ActionUpdateWithJobPath7.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String job, String path0, String path1, String path2,
			String path3, String path4, String path5, String path6, String path7, JsonElement jsonElement)
			throws Exception {
		LOGGER.debug("{} access.", effectivePerson::getDistinguishedName);
		ActionResult<Wo> result = new ActionResult<>();
		checkUpdateWithJob(effectivePerson, job, jsonElement);
		Wo wo = ThisApplication.context().applications().putQuery(x_processplatform_service_processing.class,
				Applications.joinQueryUri("data", "job", job, path0, path1, path2, path3, path4, path5, path6, path7),
				jsonElement, job).getData(Wo.class);
		result.setData(wo);
		return result;
	}

	public static class Wo extends WoId {

		private static final long serialVersionUID = -2942168134266650614L;

	}

	public static class WoControl extends WorkControl {

		private static final long serialVersionUID = -4623079643959758023L;
	}
}
