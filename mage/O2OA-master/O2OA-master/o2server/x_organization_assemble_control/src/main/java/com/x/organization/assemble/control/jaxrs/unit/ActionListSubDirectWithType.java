package com.x.organization.assemble.control.jaxrs.unit;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.organization.assemble.control.Business;
import com.x.organization.core.entity.Identity;
import com.x.organization.core.entity.Unit;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;

class ActionListSubDirectWithType extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String flag, String type) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();
			Business business = new Business(emc);
			CacheKey cacheKey = new CacheKey(this.getClass(), flag, type);
			Optional<?> optional = CacheManager.get(business.cache(), cacheKey);
			if (optional.isPresent()) {
				result.setData((List<Wo>) optional.get());
			} else {
				List<Wo> wos = this.list(business, flag, type);
				CacheManager.put(business.cache(), cacheKey, wos);
				result.setData(wos);
			}
			this.updateControl(effectivePerson, business, result.getData());
			return result;
		}
	}

	public static class Wo extends WoAbstractUnit {

		private static final long serialVersionUID = -125007357898871894L;

		@FieldDescribe("直接下级组织数量")
		private Long subDirectUnitCount = 0L;

		@FieldDescribe("直接下级身份数量")
		private Long subDirectIdentityCount = 0L;

		static WrapCopier<Unit, Wo> copier = WrapCopierFactory.wo(Unit.class, Wo.class, null,
				JpaObject.FieldsInvisible);

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

	private List<Wo> list(Business business, String flag, String type) throws Exception {
		Unit unit = business.unit().pick(flag);
		if (null == unit) {
			throw new ExceptionUnitNotExist(flag);
		}
		List<Unit> os = business.unit().listSubDirectObject(unit);
		List<Wo> wos = Wo.copier.copy(os);
		if (StringUtils.isNotEmpty(type)) {
			wos = wos.stream().filter(o -> {
				return o.getTypeList().contains(type);
			}).collect(Collectors.toList());
		}
		for (Wo wo : wos) {
			wo.setSubDirectUnitCount(
					business.entityManagerContainer().countEqual(Unit.class, Unit.superior_FIELDNAME, wo.getId()));
			wo.setSubDirectIdentityCount(
					business.entityManagerContainer().countEqual(Identity.class, Identity.unit_FIELDNAME, wo.getId()));
		}
		wos = business.unit().sort(wos);
		return wos;
	}

}