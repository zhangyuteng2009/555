package com.x.query.assemble.surface.jaxrs.table;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.dynamic.DynamicEntity;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.query.assemble.surface.Business;
import com.x.query.core.entity.schema.Table;

class ActionRowDelete extends BaseAction {
	ActionResult<Wo> execute(EffectivePerson effectivePerson, String tableFlag, String id) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Table table = emc.flag(tableFlag, Table.class);
			Business business = new Business(emc);
			if (null == table) {
				throw new ExceptionEntityNotExist(tableFlag, Table.class);
			}
			if (!business.editable(effectivePerson, table)) {
				throw new ExceptionAccessDenied(effectivePerson, table);
			}
			DynamicEntity dynamicEntity = new DynamicEntity(table.getName());
			@SuppressWarnings("unchecked")
			Class<? extends JpaObject> cls = (Class<JpaObject>) Class.forName(dynamicEntity.className());
			JpaObject o = emc.find(id, cls);
			Wo wo = new Wo();
			wo.setValue(false);
			if (null != o) {
				emc.beginTransaction(cls);
				emc.remove(o);
				emc.commit();
				wo.setValue(true);
			}
			result.setData(wo);
			return result;
		}
	}

	public static class Wo extends WrapBoolean {

	}

}