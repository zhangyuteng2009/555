package com.x.portal.assemble.designer.jaxrs.page;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.portal.assemble.designer.Business;
import com.x.portal.core.entity.Page;
import com.x.portal.core.entity.Portal;

class ActionCreate extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ActionResult<Wo> result = new ActionResult<>();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Portal portal = emc.find(wi.getPortal(), Portal.class);
			if (!business.editable(effectivePerson, portal)) {
				throw new InsufficientPermissionException(effectivePerson.getDistinguishedName());
			}
			emc.beginTransaction(Page.class);
			Page page = Wi.copier.copy(wi);
			this.checkName(business, page);
			this.checkAlias(business, page);
			page.getProperties().setRelatedWidgetList(wi.getRelatedWidgetList());
			page.getProperties().setMobileRelatedWidgetList(wi.getMobileRelatedWidgetList());
			page.getProperties().setRelatedScriptMap(wi.getRelatedScriptMap());
			page.getProperties().setMobileRelatedScriptMap(wi.getMobileRelatedScriptMap());
			emc.persist(page, CheckPersistType.all);
			/** 更新首页 */
			if (this.isBecomeFirstPage(business, portal, page)) {
				emc.beginTransaction(Portal.class);
				portal.setFirstPage(page.getId());
			} else if (StringUtils.isEmpty(portal.getFirstPage())
					|| (null == emc.find(portal.getFirstPage(), Page.class))) {
				/* 如果是第一个页面,设置这个页面为当前页面 */
				emc.beginTransaction(Portal.class);
				portal.setFirstPage(page.getId());
			}
			emc.commit();
			CacheManager.notify(Page.class);
			CacheManager.notify(Portal.class);
			Wo wo = new Wo();
			wo.setId(page.getId());
			result.setData(wo);
			return result;
		}
	}

	public static class Wi extends Page {

		private static final long serialVersionUID = 6624639107781167248L;

		static WrapCopier<Wi, Page> copier = WrapCopierFactory.wi(Wi.class, Page.class, null,
				JpaObject.FieldsUnmodifyExcludeId);

		@FieldDescribe("关联Widget.")
		private List<String> relatedWidgetList = new ArrayList<>();

		@FieldDescribe("移动端关联Widget.")
		private List<String> mobileRelatedWidgetList = new ArrayList<>();

		@FieldDescribe("关联脚本.")
		private Map<String, String> relatedScriptMap = new LinkedHashMap<>();

		@FieldDescribe("移动端关联脚本.")
		private Map<String, String> mobileRelatedScriptMap = new LinkedHashMap<>();

		public List<String> getRelatedWidgetList() {
			return this.relatedWidgetList == null ? new ArrayList<>() : this.relatedWidgetList;
		}

		public List<String> getMobileRelatedWidgetList() {
			return this.mobileRelatedWidgetList == null ? new ArrayList<>() : this.mobileRelatedWidgetList;
		}

		public Map<String, String> getRelatedScriptMap() {
			return this.relatedScriptMap == null ? new LinkedHashMap<>() : this.relatedScriptMap;
		}

		public Map<String, String> getMobileRelatedScriptMap() {
			return this.mobileRelatedScriptMap == null ? new LinkedHashMap<>() : this.mobileRelatedScriptMap;
		}

		public void setRelatedWidgetList(List<String> relatedWidgetList) {
			this.relatedWidgetList = relatedWidgetList;
		}

		public void setMobileRelatedWidgetList(List<String> mobileRelatedWidgetList) {
			this.mobileRelatedWidgetList = mobileRelatedWidgetList;
		}

		public void setRelatedScriptMap(Map<String, String> relatedScriptMap) {
			this.relatedScriptMap = relatedScriptMap;
		}

		public void setMobileRelatedScriptMap(Map<String, String> mobileRelatedScriptMap) {
			this.mobileRelatedScriptMap = mobileRelatedScriptMap;
		}
	}

	public static class Wo extends WoId {

	}

}