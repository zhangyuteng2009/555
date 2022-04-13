package com.x.processplatform.service.processing.jaxrs.touch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapString;

class ActionTest extends BaseAction {

	private static final Logger LOGGER = LoggerFactory.getLogger(ActionTest.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, Long sleep) throws Exception {
		LOGGER.trace("!!!TRACE");
		LOGGER.debug("!!!DEBUG");
		LOGGER.info("!!!INFO");
		LOGGER.warn("!!!WARN");
		LOGGER.error("!!!ERROR");
		ActionResult<Wo> result = new ActionResult<>();
		Thread.sleep(sleep * 1000);
		Wo wo = new Wo();
		result.setData(wo);
		return result;
	}

	public static class Wo extends WrapString {

		private static final long serialVersionUID = 1L;

	}

}