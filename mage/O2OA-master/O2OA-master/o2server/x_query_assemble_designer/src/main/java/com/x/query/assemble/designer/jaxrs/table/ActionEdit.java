package com.x.query.assemble.designer.jaxrs.table;

import java.util.Date;

import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.entity.dynamic.DynamicEntity;
import com.x.base.core.entity.dynamic.DynamicEntity.Field;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.gson.XGsonBuilder;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.tools.ListTools;
import com.x.query.assemble.designer.Business;
import com.x.query.core.entity.schema.Statement;
import com.x.query.core.entity.schema.Table;

class ActionEdit extends BaseAction {
	ActionResult<Wo> execute(EffectivePerson effectivePerson, String flag, JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			Table table = emc.flag(flag, Table.class);
			if (null == table) {
				throw new ExceptionEntityNotExist(flag, Table.class);
			}
			Wo wo = new Wo();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Wi.copier.copy(wi, table);

			this.check(effectivePerson, business, table);

			DynamicEntity dynamicEntity = XGsonBuilder.instance().fromJson(wi.getDraftData(), DynamicEntity.class);

			DynamicEntity existDynamicEntity = XGsonBuilder.instance().fromJson(table.getDraftData(),
					DynamicEntity.class);

			if (ListTools.isEmpty(dynamicEntity.getFieldList())) {
				throw new ExceptionFieldEmpty();
			}

			for (Field field : dynamicEntity.getFieldList()) {
				if (JpaObject.FieldsDefault.stream().filter(o -> StringUtils.equalsIgnoreCase(o, field.getName()))
						.count() > 0) {
					throw new ExceptionFieldName(field.getName());
				}
			}

			emc.beginTransaction(Table.class);
			table.setLastUpdatePerson(effectivePerson.getDistinguishedName());
			table.setLastUpdateTime(new Date());
			if(Table.STATUS_build.equals(table.getStatus())){
				table.setData(table.getDraftData());
			}else{
				table.setData("");
				table.setAlias(wi.getAlias());
				table.setName(wi.getName());
			}
			emc.check(table, CheckPersistType.all);
			emc.commit();
			CacheManager.notify(Table.class);
			CacheManager.notify(Statement.class);

			wo.setId(table.getId());
			result.setData(wo);
			return result;
		}
	}

	public static class Wo extends WoId {

	}

	public static class Wi extends Table {

		private static final long serialVersionUID = -5237741099036357033L;

		static WrapCopier<Wi, Table> copier = WrapCopierFactory.wi(Wi.class, Table.class, null,
				ListTools.toList(JpaObject.FieldsUnmodify, Table.creatorPerson_FIELDNAME,
						Table.lastUpdatePerson_FIELDNAME, Table.lastUpdateTime_FIELDNAME, Table.data_FIELDNAME,
						Table.status_FIELDNAME, Table.name_FIELDNAME, Table.alias_FIELDNAME));
	}
}
