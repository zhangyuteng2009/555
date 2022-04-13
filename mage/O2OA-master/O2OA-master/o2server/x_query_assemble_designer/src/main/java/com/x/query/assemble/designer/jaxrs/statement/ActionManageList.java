package com.x.query.assemble.designer.jaxrs.statement;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.query.assemble.designer.Business;
import com.x.query.core.entity.schema.Statement;

import java.util.List;

class ActionManageList extends BaseAction {
	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();
			Business business = new Business(emc);
			if (!business.controllable(effectivePerson)) {
				throw new ExceptionAccessDenied(effectivePerson.getDistinguishedName());
			}
			List<Wo> wos = emc.fetchAll(Statement.class, Wo.copier);
			wos = business.statement().sort(wos);
			result.setData(wos);
			return result;
		}
	}

	public static class Wo extends Statement {
		private static final long serialVersionUID = -5813230977177728059L;
		static WrapCopier<Statement, Wo> copier = WrapCopierFactory.wo(Statement.class, Wo.class,
				JpaObject.singularAttributeField(Statement.class, true, true), JpaObject.FieldsInvisible);
	}
}
