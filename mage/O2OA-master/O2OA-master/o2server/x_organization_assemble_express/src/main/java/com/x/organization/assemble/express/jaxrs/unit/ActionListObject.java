package com.x.organization.assemble.express.jaxrs.unit;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;
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
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.organization.assemble.express.Business;
import com.x.organization.core.entity.Identity;
import com.x.organization.core.entity.Identity_;
import com.x.organization.core.entity.Unit;
import com.x.organization.core.entity.Unit_;

class ActionListObject extends BaseAction {
	private static Logger logger = LoggerFactory.getLogger(ActionListObject.class);

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		logger.debug(effectivePerson.getDistinguishedName());
		Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
		ActionResult<List<Wo>> result = new ActionResult<>();
		CacheKey cacheKey = new CacheKey(this.getClass(), wi.getUnitList());
		Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
		if (optional.isPresent()) {
			result.setData((List<Wo>) optional.get());
		} else {
			List<Wo> wos = this.list(wi);
			CacheManager.put(cacheCategory, cacheKey, wos);
			result.setData(wos);
		}
		return result;
	}

	public static class Wi extends GsonPropertyObject {

		private static final long serialVersionUID = 9140053706113645992L;
		@FieldDescribe("组织")
		private List<String> unitList = new ArrayList<>();

		public List<String> getUnitList() {
			return unitList;
		}

		public void setUnitList(List<String> unitList) {
			this.unitList = unitList;
		}

	}

	public static class Wo extends Unit {

		private static final long serialVersionUID = -7913547275132005308L;

		@FieldDescribe("匹配字段")
		private String matchKey;

		@FieldDescribe("直接下级组织数量")
		private Long subDirectUnitCount = 0L;

		@FieldDescribe("直接下级身份数量")
		private Long subDirectIdentityCount = 0L;

		static WrapCopier<Unit, Wo> copier = WrapCopierFactory.wo(Unit.class, Wo.class, null,
				ListTools.toList(JpaObject.FieldsInvisible, Unit.controllerList_FIELDNAME));

		public String getMatchKey() {
			return matchKey;
		}

		public void setMatchKey(String matchKey) {
			this.matchKey = matchKey;
		}

		public Long getSubDirectUnitCount() {
			return subDirectUnitCount;
		}

		public void setSubDirectUnitCount(Long subDirectUnitCount) {
			this.subDirectUnitCount = subDirectUnitCount;
		}

		public Long getSubDirectIdentityCount() {
			return subDirectIdentityCount;
		}

		public void setSubDirectIdentityCount(Long subDirectIdentityCount) {
			this.subDirectIdentityCount = subDirectIdentityCount;
		}

	}

	private List<Wo> list(Wi wi) throws Exception {
		List<Wo> wos = new ArrayList<>();
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			for (String str : wi.getUnitList()) {
				Unit o = business.unit().pick(str);
				if (o != null) {
					Wo wo = Wo.copier.copy(o);
					wo.setMatchKey(str);
					if (StringUtils.isNotEmpty(wo.getSuperior())) {
						Unit superior = business.unit().pick(wo.getSuperior());
						if (null != superior) {
							wo.setSuperior(superior.getDistinguishedName());
						}
					}
					wo.setSubDirectIdentityCount(this.countSubDirectIdentity(business, wo));
					wo.setSubDirectUnitCount(this.countSubDirectUnit(business, wo));
					wos.add(wo);
				}
			}
			return wos;
		}
	}

	private Long countSubDirectUnit(Business business, Wo wo) throws Exception {
		EntityManager em = business.entityManagerContainer().get(Unit.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Long> cq = cb.createQuery(Long.class);
		Root<Unit> root = cq.from(Unit.class);
		Predicate p = cb.equal(root.get(Unit_.superior), wo.getId());
		return em.createQuery(cq.select(cb.count(root)).where(p)).getSingleResult();
	}

	private Long countSubDirectIdentity(Business business, Wo wo) throws Exception {
		EntityManager em = business.entityManagerContainer().get(Identity.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Long> cq = cb.createQuery(Long.class);
		Root<Identity> root = cq.from(Identity.class);
		Predicate p = cb.equal(root.get(Identity_.unit), wo.getId());
		return em.createQuery(cq.select(cb.count(root)).where(p)).getSingleResult();
	}

}
