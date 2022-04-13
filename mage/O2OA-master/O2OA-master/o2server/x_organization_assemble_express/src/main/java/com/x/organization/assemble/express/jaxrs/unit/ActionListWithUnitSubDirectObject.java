package com.x.organization.assemble.express.jaxrs.unit;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.ListTools;
import com.x.organization.assemble.express.Business;
import com.x.organization.core.entity.Identity;
import com.x.organization.core.entity.Identity_;
import com.x.organization.core.entity.Unit;
import com.x.organization.core.entity.Unit_;

class ActionListWithUnitSubDirectObject extends BaseAction {

	@SuppressWarnings("unchecked")
	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			ActionResult<List<Wo>> result = new ActionResult<>();
			Business business = new Business(emc);
			CacheKey cacheKey = new CacheKey(this.getClass(), wi.getUnitList(),
					wi.getCountSubDirectIdentity(), wi.getCountSubDirectUnit());
			Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
			if (optional.isPresent()) {
				result.setData((List<Wo>) optional.get());
			} else {
				List<Wo> wos = this.list(business, wi);
				CacheManager.put(cacheCategory, cacheKey, wos);
				result.setData(wos);
			}
			return result;
		}
	}

	public static class Wi extends GsonPropertyObject {

		private static final long serialVersionUID = 1106979865206299656L;

		@FieldDescribe("组织")
		private List<String> unitList;

		@FieldDescribe("是否要统计直接子部门数量")
		private Boolean countSubDirectUnit = false;

		@FieldDescribe("是否要统计直接部门身份数量")
		private Boolean countSubDirectIdentity = false;

		public List<String> getUnitList() {
			return unitList;
		}

		public void setUnitList(List<String> unitList) {
			this.unitList = unitList;
		}

		public Boolean getCountSubDirectUnit() {
			return countSubDirectUnit;
		}

		public void setCountSubDirectUnit(Boolean countSubDirectUnit) {
			this.countSubDirectUnit = countSubDirectUnit;
		}

		public Boolean getCountSubDirectIdentity() {
			return countSubDirectIdentity;
		}

		public void setCountSubDirectIdentity(Boolean countSubDirectIdentity) {
			this.countSubDirectIdentity = countSubDirectIdentity;
		}

	}

	public static class Wo extends com.x.base.core.project.organization.Unit {

		private static final long serialVersionUID = -1387072363896397302L;

		@FieldDescribe("直接下级组织数量")
		private Long subDirectUnitCount;

		@FieldDescribe("直接下级身份数量")
		private Long subDirectIdentityCount;

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

	private List<Wo> list(Business business, Wi wi) throws Exception {
		List<Wo> wos = new ArrayList<>();
		List<Unit> os = business.unit().pick(wi.getUnitList());
		List<String> unitIds = new ArrayList<>();
		for (Unit o : os) {
			unitIds.addAll(business.unit().listSubDirect(o.getId()));
		}
		unitIds = ListTools.trim(unitIds, true, true);

		Map<String, Long> countSubDirectUnitMap = new HashMap<>();
		if (BooleanUtils.isTrue(wi.getCountSubDirectUnit())) {
			countSubDirectUnitMap = this.countSubDirectUnit(business, unitIds);
		}
		Map<String, Long> countSubDirectIdentityMap = new HashMap<>();
		if (BooleanUtils.isTrue(wi.getCountSubDirectIdentity())) {
			countSubDirectIdentityMap = this.countSubDirectIdentity(business, unitIds);
		}

		for (Unit o : business.unit().pick(unitIds)) {
			Wo wo = this.convert(business, o, Wo.class);
			if (BooleanUtils.isTrue(wi.getCountSubDirectUnit())) {
				wo.setSubDirectUnitCount(countSubDirectUnitMap.getOrDefault(o.getId(), 0L));
			}
			if (BooleanUtils.isTrue(wi.getCountSubDirectIdentity())) {
				wo.setSubDirectIdentityCount(countSubDirectIdentityMap.getOrDefault(o.getId(), 0L));
			}
			wos.add(wo);
		}
		return wos;
	}

	private Map<String, Long> countSubDirectUnit(Business business, List<String> unitIds) throws Exception {
		EntityManagerContainer emc = business.entityManagerContainer();
		EntityManager em = emc.get(Unit.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<Unit> root = cq.from(Unit.class);
		Predicate predicate = root.get(Unit_.superior).in(unitIds);
		cq.where(predicate).multiselect(root.get(Unit_.superior), cb.count(root)).groupBy(root.get(Unit_.superior));
		List<Tuple> list = em.createQuery(cq).getResultList();
		Map<String, Long> map = new HashMap<>();
		for (Tuple t : list) {
			map.put(t.get(0, String.class), t.get(1, Long.class));
		}
		return map;
	}

	private Map<String, Long> countSubDirectIdentity(Business business, List<String> unitIds) throws Exception {
		EntityManagerContainer emc = business.entityManagerContainer();
		EntityManager em = emc.get(Identity.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<Identity> root = cq.from(Identity.class);
		Predicate predicate = root.get(Identity_.unit).in(unitIds);
		cq.where(predicate).multiselect(root.get(Identity_.unit), cb.count(root)).groupBy(root.get(Identity_.unit));
		List<Tuple> list = em.createQuery(cq).getResultList();
		Map<String, Long> map = new HashMap<>();
		for (Tuple t : list) {
			map.put(t.get(0, String.class), t.get(1, Long.class));
		}
		return map;
	}

}
