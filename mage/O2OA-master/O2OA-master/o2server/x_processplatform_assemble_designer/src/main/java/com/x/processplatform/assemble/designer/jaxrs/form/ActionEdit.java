package com.x.processplatform.assemble.designer.jaxrs.form;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.assemble.designer.Business;
import com.x.processplatform.assemble.designer.ThisApplication;
import com.x.processplatform.core.entity.element.Application;
import com.x.processplatform.core.entity.element.Form;
import com.x.processplatform.core.entity.element.FormField;
import com.x.processplatform.core.entity.element.FormVersion;

class ActionEdit extends BaseAction {
	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id, JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Business business = new Business(emc);
			Form form = emc.find(id, Form.class);
			if (null == form) {
				throw new ExceptionFormNotExist(id);
			}
			Application application = emc.find(form.getApplication(), Application.class);
			if (null == application) {
				throw new ExceptionApplicationNotExist(wi.getApplication());
			}
			if (!business.editable(effectivePerson, application)) {
				throw new ExceptionApplicationAccessDenied(effectivePerson.getDistinguishedName(),
						application.getName(), application.getId());
			}

			/* 先删除FormField */
			List<String> formFieldIds = business.formField().listWithForm(form.getId());
			emc.beginTransaction(FormField.class);
			for (FormField o : emc.list(FormField.class, formFieldIds)) {
				emc.remove(o);
			}
			List<FormField> formFields = WiFormField.copier.copy(wi.getFormFieldList());
			for (FormField o : formFields) {
				o.setApplication(application.getId());
				o.setForm(form.getId());
				emc.persist(o, CheckPersistType.all);
			}
			emc.commit();
			emc.beginTransaction(Form.class);
			Wi.copier.copy(wi, form);
			form.setId(id);
			form.setApplication(application.getId());
			// FormProperties properties = new FormProperties();
//			properties.setRelatedFormList(wi.getRelatedFormList());
//			properties.setMobileRelatedFormList(wi.getMobileRelatedFormList());
//			properties.setRelatedScriptMap(wi.getRelatedScriptMap());
//			properties.setMobileRelatedScriptMap(wi.getMobileRelatedScriptMap());
			// form.setP!!!roperties(properties);
			form.getProperties().setRelatedFormList(wi.getRelatedFormList());
			form.getProperties().setMobileRelatedFormList(wi.getMobileRelatedFormList());
			form.getProperties().setRelatedScriptMap(wi.getRelatedScriptMap());
			form.getProperties().setMobileRelatedScriptMap(wi.getMobileRelatedScriptMap());
			emc.check(form, CheckPersistType.all);
			emc.commit();
			CacheManager.notify(Form.class);
			/* 保存历史版本 */
			ThisApplication.formVersionQueue.send(new FormVersion(form.getId(), jsonElement));
			Wo wo = new Wo();
			wo.setId(form.getId());
			result.setData(wo);
			return result;
		}
	}

	public static class Wo extends WoId {
	}

	public static class Wi extends Form {

		private static final long serialVersionUID = 4289841165185269299L;

		static WrapCopier<Wi, Form> copier = WrapCopierFactory.wi(Wi.class, Form.class, null, ListTools
				.toList(JpaObject.FieldsUnmodify, Form.lastUpdatePerson_FIELDNAME, Form.lastUpdateTime_FIELDNAME));

		@FieldDescribe("字段")
		private List<WiFormField> formFieldList = new ArrayList<>();

		@FieldDescribe("关联表单")
		private List<String> relatedFormList = new ArrayList<>();

		@FieldDescribe("移动端关联表单")
		private List<String> mobileRelatedFormList = new ArrayList<>();

		@FieldDescribe("关联脚本.")
		private Map<String, String> relatedScriptMap = new LinkedHashMap<>();

		@FieldDescribe("移动端关联脚本.")
		private Map<String, String> mobileRelatedScriptMap = new LinkedHashMap<>();

		public List<WiFormField> getFormFieldList() {
			return formFieldList;
		}

		public void setFormFieldList(List<WiFormField> formFieldList) {
			this.formFieldList = formFieldList;
		}

		public List<String> getRelatedFormList() {
			return relatedFormList;
		}

		public void setRelatedFormList(List<String> relatedFormList) {
			this.relatedFormList = relatedFormList;
		}

		public List<String> getMobileRelatedFormList() {
			return mobileRelatedFormList;
		}

		public void setMobileRelatedFormList(List<String> mobileRelatedFormList) {
			this.mobileRelatedFormList = mobileRelatedFormList;
		}

		public Map<String, String> getRelatedScriptMap() {
			return relatedScriptMap;
		}

		public void setRelatedScriptMap(Map<String, String> relatedScriptMap) {
			this.relatedScriptMap = relatedScriptMap;
		}

		public Map<String, String> getMobileRelatedScriptMap() {
			return mobileRelatedScriptMap;
		}

		public void setMobileRelatedScriptMap(Map<String, String> mobileRelatedScriptMap) {
			this.mobileRelatedScriptMap = mobileRelatedScriptMap;
		}

	}

	public static class WiFormField extends FormField {

		private static final long serialVersionUID = -4951139918340180031L;

		static WrapCopier<WiFormField, FormField> copier = WrapCopierFactory.wi(WiFormField.class, FormField.class,
				null, JpaObject.FieldsUnmodify);
	}
}
