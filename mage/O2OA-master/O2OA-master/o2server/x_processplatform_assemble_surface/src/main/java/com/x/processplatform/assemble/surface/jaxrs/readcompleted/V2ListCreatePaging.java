package com.x.processplatform.assemble.surface.jaxrs.readcompleted;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.Read;
import com.x.processplatform.core.entity.content.Read_;

class V2ListCreatePaging extends V2Base {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, Integer page, Integer size, JsonElement jsonElement)
			throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Business business = new Business(emc);
			EntityManager em = emc.get(Read.class);
			CriteriaBuilder cb = em.getCriteriaBuilder();
			CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
			Root<Read> root = cq.from(Read.class);
			Predicate p = cb.equal(root.get(Read_.creatorPerson), effectivePerson.getDistinguishedName());
			p = cb.and(p, this.toFilterPredicate(effectivePerson, business, wi));
			List<Wo> wos = emc.fetchDescPaging(Read.class, Wo.copier, p, page, size, Read.sequence_FIELDNAME);
			result.setData(wos);
			result.setCount(emc.count(Read.class, p));
			this.relate(business, result.getData(), wi);
			return result;
		}
	}

	public static class Wi extends RelateFilterWi {

	}

	public static class Wo extends AbstractWo {
		private static final long serialVersionUID = -4773789253221941109L;
		static WrapCopier<Read, Wo> copier = WrapCopierFactory.wo(Read.class, Wo.class,
				JpaObject.singularAttributeField(Read.class, true, false), JpaObject.FieldsInvisible);
	}
}
