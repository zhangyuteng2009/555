package com.x.processplatform.assemble.surface.jaxrs.readcompleted;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.DateTools;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.ReadCompleted;
import com.x.processplatform.core.entity.content.ReadCompleted_;
import org.apache.commons.lang3.BooleanUtils;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Date;
import java.util.List;

class ActionManageListWithDate extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String date)
			throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ActionResult<List<Wo>> result = new ActionResult<>();
			if (BooleanUtils.isTrue(business.canManageApplication(effectivePerson, null))) {
				if(DateTools.isDateTimeOrDate(date)){
					Date startTime = DateTools.floorDate(DateTools.parse(date), 0);
					Date endTime = DateTools.getAdjustTimeDay(startTime, 1, 0, 0, 0);
					List<ReadCompleted> os = this.list(business, startTime, endTime);
					List<Wo> wos = Wo.copier.copy(os);
					result.setData(wos);
					result.setCount((long)wos.size());
				}
			}
			return result;
		}
	}

	private List<ReadCompleted> list(Business business, Date startTime, Date endTime) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<ReadCompleted> cq = cb.createQuery(ReadCompleted.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		Predicate p = cb.conjunction();

		if (startTime != null) {
			p = cb.and(p, cb.greaterThanOrEqualTo(root.get(ReadCompleted_.createTime), startTime));
		}
		if (endTime != null) {
			p = cb.and(p, cb.lessThan(root.get(ReadCompleted_.createTime), endTime));
		}

		cq.select(root).where(p);
		return em.createQuery(cq).getResultList();
	}

	public static class Wo extends ReadCompleted {

		static WrapCopier<ReadCompleted, Wo> copier = WrapCopierFactory.wo(ReadCompleted.class, Wo.class,
				JpaObject.singularAttributeField(ReadCompleted.class, true, true), null);

	}

}
