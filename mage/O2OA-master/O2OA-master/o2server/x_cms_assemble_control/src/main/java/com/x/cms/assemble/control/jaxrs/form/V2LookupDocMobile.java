package com.x.cms.assemble.control.jaxrs.form;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.cms.assemble.control.Business;
import com.x.cms.core.entity.CategoryInfo;
import com.x.cms.core.entity.Document;
import com.x.cms.core.entity.element.Form;
import com.x.cms.core.entity.element.FormProperties;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.zip.CRC32;

class V2LookupDocMobile extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(V2LookupDocMobile.class);

	private Form form = null;
	private Form readForm = null;
	private Wo wo = new Wo();

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String docId) throws Exception {

		ActionResult<Wo> result = new ActionResult<>();

		this.getDocForm(docId);

		String formId = "";
		String readFormId = "";
		if (null != this.form) {
			formId = form.getId();
			this.wo.setFormId(formId);
		}
		if (null != this.readForm) {
			readFormId = readForm.getId();
			this.wo.setReadFormId(readFormId);
		}
		if(StringUtils.isNotEmpty(formId) || StringUtils.isNotEmpty(readFormId)){
			CacheKey cacheKey = new CacheKey(this.getClass(), formId, readFormId);
			Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
			if (optional.isPresent()) {
				this.wo = (Wo) optional.get();
			} else {
				List<String> list = new ArrayList<>();
				if (null != this.form) {
					CompletableFuture<List<String>> relatedFormFuture = this.relatedFormFuture(this.form.getProperties());
					CompletableFuture<List<String>> relatedScriptFuture = this
							.relatedScriptFuture(this.form.getProperties());
					list.add(this.form.getId() + this.form.getUpdateTime().getTime());
					list.addAll(relatedFormFuture.get(10, TimeUnit.SECONDS));
					list.addAll(relatedScriptFuture.get(10, TimeUnit.SECONDS));
				}
				if (null != this.readForm && !formId.equals(readFormId)) {
					CompletableFuture<List<String>> relatedFormFuture = this.relatedFormFuture(this.readForm.getProperties());
					CompletableFuture<List<String>> relatedScriptFuture = this
							.relatedScriptFuture(this.readForm.getProperties());
					list.add(this.readForm.getId() + this.readForm.getUpdateTime().getTime());
					list.addAll(relatedFormFuture.get(10, TimeUnit.SECONDS));
					list.addAll(relatedScriptFuture.get(10, TimeUnit.SECONDS));
				}
				list = list.stream().sorted().collect(Collectors.toList());
				CRC32 crc = new CRC32();
				crc.update(StringUtils.join(list, "#").getBytes());
				this.wo.setCacheTag(crc.getValue() + "");
				CacheManager.put(cacheCategory, cacheKey, wo);
			}
		}
		result.setData(wo);
		return result;
	}

	private void getDocForm(String docId) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			Document document = emc.fetch(docId, Document.class, ListTools.toList(JpaObject.id_FIELDNAME, Document.form_FIELDNAME,
					Document.readFormId_FIELDNAME, Document.categoryId_FIELDNAME));
			if (null != document) {
				String formId = document.getForm();
				String readFormId = document.getReadFormId();
				if(StringUtils.isNotBlank(formId)) {
					this.form = business.getFormFactory().pick(formId);
				}
				if (null == this.form) {
					CategoryInfo categoryInfo = business.getCategoryInfoFactory().pick(document.getCategoryId());
					if (null != categoryInfo) {
						formId = categoryInfo.getFormId();
						this.form = business.getFormFactory().pick(formId);
					}
				}
				if(StringUtils.isNotBlank(readFormId)) {
					if(readFormId.equals(formId)){
						this.readForm = this.form;
					}else {
						this.readForm = business.getFormFactory().pick(readFormId);
					}
				}
				if (null == this.readForm) {
					CategoryInfo categoryInfo = business.getCategoryInfoFactory().pick(document.getCategoryId());
					if (null != categoryInfo) {
						readFormId = categoryInfo.getReadFormId();
						this.readForm = business.getFormFactory().pick(readFormId);
					}
				}
			}
		}
	}

	private CompletableFuture<List<String>> relatedFormFuture(FormProperties properties) {
		return CompletableFuture.supplyAsync(() -> {
			List<String> list = new ArrayList<>();
			if (ListTools.isNotEmpty(properties.getMobileRelatedFormList())) {
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					Business business = new Business(emc);
					Form f;
					for (String id : properties.getMobileRelatedFormList()) {
						f = emc.fetch(id, Form.class, ListTools.toList(JpaObject.id_FIELDNAME, JpaObject.updateTime_FIELDNAME));
						if (null != f) {
							list.add(f.getId() + f.getUpdateTime().getTime());
						}
					}
				} catch (Exception e) {
					logger.error(e);
				}
			}
			return list;
		});
	}

	private CompletableFuture<List<String>> relatedScriptFuture(FormProperties properties) {
		return CompletableFuture.supplyAsync(() -> {
			List<String> list = new ArrayList<>();
			if ((null != properties.getMobileRelatedScriptMap()) && (properties.getMobileRelatedScriptMap().size() > 0)) {
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					Business business = new Business(emc);
					list = convertScriptToCacheTag(business, properties.getMobileRelatedScriptMap());
				} catch (Exception e) {
					logger.error(e);
				}
			}
			return list;
		});
	}

	public static class Wo extends AbstractWo {

		private static final long serialVersionUID = -955543425744298907L;

		private String formId;

		private String readFormId;

		private String cacheTag;

		public String getFormId() {
			return formId;
		}

		public void setFormId(String formId) {
			this.formId = formId;
		}

		public String getReadFormId() {
			return readFormId;
		}

		public void setReadFormId(String readFormId) {
			this.readFormId = readFormId;
		}

		public String getCacheTag() {
			return cacheTag;
		}

		public void setCacheTag(String cacheTag) {
			this.cacheTag = cacheTag;
		}

	}

}
