//package com.x.processplatform.assemble.surface.jaxrs.data;
//
//import com.google.gson.JsonElement;
//import com.x.base.core.container.EntityManagerContainer;
//import com.x.base.core.container.factory.EntityManagerContainerFactory;
//import com.x.base.core.project.Applications;
//import com.x.base.core.project.x_processplatform_service_processing;
//import com.x.base.core.project.exception.ExceptionEntityNotExist;
//import com.x.base.core.project.http.ActionResult;
//import com.x.base.core.project.http.EffectivePerson;
//import com.x.base.core.project.jaxrs.WoId;
//import com.x.base.core.project.logger.Logger;
//import com.x.base.core.project.logger.LoggerFactory;
//import com.x.processplatform.assemble.surface.Business;
//import com.x.processplatform.assemble.surface.ThisApplication;
//import com.x.processplatform.assemble.surface.WorkControl;
//import com.x.processplatform.core.entity.content.Work;
//
//class ActionUpdateWithWorkSection extends BaseAction {
//
//	private static Logger logger = LoggerFactory.getLogger(ActionUpdateWithWorkSection.class);
//
//	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id, JsonElement jsonElement) throws Exception {
//		ActionResult<Wo> result = new ActionResult<>();
//		Work work = null;
//		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
//			/** 防止提交空数据清空data */
//			if (null == jsonElement || (!jsonElement.isJsonObject())) {
//				throw new ExceptionNotJsonObject();
//			}
//			if (jsonElement.getAsJsonObject().entrySet().isEmpty()) {
//				throw new ExceptionEmptyData();
//			}
//			Business business = new Business(emc);
//			work = emc.find(id, Work.class);
//			if (null == work) {
//				throw new ExceptionEntityNotExist(id, Work.class);
//			}
//			if (!business.editable(effectivePerson, work)) {
//				throw new ExceptionWorkAccessDenied(effectivePerson.getDistinguishedName(), work.getTitle(),
//						work.getId());
//			}
//		}
//		Wo wo = ThisApplication.context().applications()
//				.putQuery(x_processplatform_service_processing.class,
//						Applications.joinQueryUri("data", "section", "work", work.getId()), jsonElement, work.getJob())
//				.getData(Wo.class);
//		result.setData(wo);
//		return result;
//	}
//
//	public static class Wo extends WoId {
//
//	}
//
//	public static class WoControl extends WorkControl {
//	}
//}
