package com.x.processplatform.assemble.surface.jaxrs.snap;

import java.util.List;

import javax.persistence.criteria.Predicate;

import org.apache.commons.lang3.BooleanUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.assemble.surface.jaxrs.snap.ActionListMyFilterPaging.Wo;
import com.x.processplatform.core.entity.content.Snap;

class ActionManageListPrevFilter extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String id, Integer count, JsonElement jsonElement)
			throws Exception {
		Predicate p = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Business business = new Business(emc);
			if (BooleanUtils.isNotTrue(business.canManageApplication(effectivePerson, null))) {
				throw new ExceptionAccessDenied(effectivePerson);
			}
			p = manageFilter(business, wi);
		}
		return this.standardListPrev(Wo.copier, id, count, JpaObject.sequence_FIELDNAME, DESC, p);
	}

	public class Wi extends FilterWi {

	}

	public static class Wo extends RankWo {

		private static final long serialVersionUID = 2279846765261247910L;

		static WrapCopier<Snap, Wo> copier = WrapCopierFactory.wo(Snap.class, Wo.class,
				JpaObject.singularAttributeField(Snap.class, true, true), null);

	}

}
