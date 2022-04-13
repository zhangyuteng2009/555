package com.x.organization.assemble.personal.jaxrs.empower;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.DateTools;
import com.x.base.core.project.tools.StringTools;
import com.x.organization.core.entity.accredit.Empower;
import com.x.organization.core.entity.accredit.Empower_;

class ActionManagerListPaging extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, Integer page, Integer size, JsonElement jsonElement)
			throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			ActionResult<List<Wo>> result = new ActionResult<>();
			EntityManager em = emc.get(Empower.class);
			CriteriaBuilder cb = em.getCriteriaBuilder();
			CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
			Root<Empower> root = cq.from(Empower.class);
			Predicate p = cb.conjunction();
			if(effectivePerson.isManager()) {
				if (StringUtils.isNotEmpty(wi.getFromPerson())) {
					String key = "%" + StringTools.escapeSqlLikeKey(wi.getFromPerson()) + "%";
					p = cb.and(p, cb.like(root.get(Empower_.fromPerson), key, StringTools.SQL_ESCAPE_CHAR));
				}
			}else{
				p = cb.and(p, cb.equal(root.get(Empower_.fromPerson), effectivePerson.getDistinguishedName()));
			}
			if(DateTools.isDateTimeOrDate(wi.getStartTime())){
				p = cb.and(p, cb.greaterThan(root.get(Empower_.createTime), DateTools.parse(wi.getStartTime())));
			}
			if(DateTools.isDateTimeOrDate(wi.getEndTime())){
				p = cb.and(p, cb.lessThan(root.get(Empower_.createTime), DateTools.parse(wi.getEndTime())));
			}

			List<Wo> wos = emc.fetchDescPaging(Empower.class, Wo.copier, p, page, size,
					Empower.createTime_FIELDNAME);
			result.setData(wos);
			result.setCount(emc.count(Empower.class, p));
			return result;
		}
	}

	public static class Wo extends Empower {

		private static final long serialVersionUID = 4279205128463146835L;

		static WrapCopier<Empower, Wo> copier = WrapCopierFactory.wi(Empower.class, Wo.class, null,
				JpaObject.FieldsInvisible);

	}

	public class Wi extends GsonPropertyObject {

		@FieldDescribe("授权人")
		private String fromPerson;

		@FieldDescribe("(授权创建时间)开始时间yyyy-MM-dd HH:mm:ss")
		private String startTime;

		@FieldDescribe("(授权创建时间)结束时间yyyy-MM-dd HH:mm:ss")
		private String endTime;

		public String getFromPerson() {
			return fromPerson;
		}

		public void setFromPerson(String fromPerson) {
			this.fromPerson = fromPerson;
		}

		public String getStartTime() {
			return startTime;
		}

		public void setStartTime(String startTime) {
			this.startTime = startTime;
		}

		public String getEndTime() {
			return endTime;
		}

		public void setEndTime(String endTime) {
			this.endTime = endTime;
		}

	}

}
