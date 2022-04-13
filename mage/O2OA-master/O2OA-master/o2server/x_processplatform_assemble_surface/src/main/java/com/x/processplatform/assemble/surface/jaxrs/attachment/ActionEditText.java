package com.x.processplatform.assemble.surface.jaxrs.attachment;

import java.util.Arrays;

import org.apache.commons.lang3.BooleanUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.Applications;
import com.x.base.core.project.x_processplatform_service_processing;
import com.x.base.core.project.annotation.ActionLogger;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.ThisApplication;
import com.x.processplatform.assemble.surface.WorkControl;
import com.x.processplatform.core.entity.content.Attachment;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.element.Application;
import com.x.processplatform.core.entity.element.Process;

class ActionEditText extends BaseAction {

	@ActionLogger
	private static Logger logger = LoggerFactory.getLogger(ActionEditText.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id, String workId, JsonElement jsonElement)
			throws Exception {

		ActionResult<Wo> result = new ActionResult<>();
		Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
		Attachment attachment = null;

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			Work work = emc.find(workId, Work.class);
			/** 判断work是否存在 */
			if (null == work) {
				throw new ExceptionEntityNotExist(workId, Work.class);
			}
			attachment = emc.find(id, Attachment.class);
			if (null == attachment) {
				throw new ExceptionEntityNotExist(id, Attachment.class);
			}
			WoControl control = business.getControl(effectivePerson, work, WoControl.class);
			if (BooleanUtils.isNotTrue(control.getAllowSave())) {
				throw new ExceptionAccessDenied(effectivePerson, work);
			}
			Application application = business.application().pick(work.getApplication());
			Process process = business.process().pick(work.getProcess());
			if (!business.controllerable(effectivePerson, application, process, attachment)) {
				throw new ExceptionAccessDenied(effectivePerson, attachment);
			}
//			WoControl control = business.getControl(effectivePerson, work, WoControl.class);
//			if (BooleanUtils.isNotTrue(control.getAllowSave())) {
//				throw new ExceptionWorkAccessDenied(effectivePerson.getDistinguishedName(), work.getTitle(),
//						work.getId());
//			}
//			Application application = business.application().pick(work.getApplication());
//			Process process = business.process().pick(work.getProcess());
//			if (business.controllerable(business, effectivePerson, application, process, attachment)) {
//				throw new ExceptionAccessDenied(effectivePerson, attachment);
//			}
//			emc.beginTransaction(Attachment.class);
//			Wi.copier.copy(wi, attachment);
//			emc.check(attachment, CheckPersistType.all);
//			emc.commit();
//			Wo wo = new Wo();
//			wo.setId(attachment.getId());
//			result.setData(wo);
//			return result;
		}

		Wo wo = ThisApplication.context().applications()
				.putQuery(effectivePerson.getDebugger(), x_processplatform_service_processing.class,
						Applications.joinQueryUri("attachment", attachment.getId(), "text"), wi, attachment.getJob())
				.getData(Wo.class);
		result.setData(wo);
		return result;
	}

	public static class Wi extends Attachment {

		private static final long serialVersionUID = 4243967432624425952L;

		static WrapCopier<Wi, Attachment> copier = WrapCopierFactory.wi(Wi.class, Attachment.class,
				Arrays.asList(Attachment.text_FIELDNAME), null);

	}

	public static class Wo extends WoId {

	}

	public static class WoControl extends WorkControl {

	}

}
