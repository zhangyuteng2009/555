package com.x.processplatform.assemble.surface.jaxrs.review;

import java.util.List;

import javax.persistence.criteria.Predicate;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.Review;

class V2ListPaging extends V2Base {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, Integer page, Integer size, JsonElement jsonElement)
			throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ActionResult<List<Wo>> result = new ActionResult<>();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Predicate p = this.toFilterPredicate(effectivePerson, business, wi, null);
			List<Wo> wos = emc.fetchDescPaging(Review.class, Wo.copier, p, page, size, Review.sequence_FIELDNAME);
			result.setData(wos);
			result.setCount(emc.count(Review.class, p));
			this.relate(business, result.getData(), wi);
			return result;
		}
	}

	public static class Wi extends RelateFilterWi {

	}

	public static class Wo extends AbstractWo {
		private static final long serialVersionUID = -4773789253221941109L;
		static WrapCopier<Review, Wo> copier = WrapCopierFactory.wo(Review.class, Wo.class,
				JpaObject.singularAttributeField(Review.class, true, false), JpaObject.FieldsInvisible);
	}
}
