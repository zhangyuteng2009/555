package com.x.query.assemble.designer.jaxrs.reveal;

import java.util.List;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.query.assemble.designer.Business;
import com.x.query.core.entity.Reveal;

class ActionListPrev extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionListPrev.class);

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String id, Integer count) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			logger.debug(effectivePerson, "id:{}, count:{}.", id, count);
			Business business = new Business(emc);
			if (!business.controllable(effectivePerson)) {
				throw new ExceptionAccessDenied(effectivePerson.getDistinguishedName());
			}
			ActionResult<List<Wo>> result = new ActionResult<>();
			result = this.standardFetchAttributeListPrev(emc, Wo.copier, id, count,  JpaObject.sequence_FIELDNAME, null, null, null, null,
					null, null, null, true, DESC);
			return result;
		}
	}

	public static class Wo extends Reveal {

		private static final long serialVersionUID = 2886873983211744188L;

		static WrapCopier<Reveal, Wo> copier = WrapCopierFactory.wo(Reveal.class, Wo.class,
				JpaObject.singularAttributeField(Reveal.class, true, true), null);

		@FieldDescribe("排序号")
		private Long rank;

		public Long getRank() {
			return rank;
		}

		public void setRank(Long rank) {
			this.rank = rank;
		}

	}
}
