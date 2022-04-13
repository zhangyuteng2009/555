package com.x.organization.assemble.control.jaxrs.unit;

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

import java.util.Optional;

class ActionGetSupDirect extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String flag) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			CacheKey cacheKey = new CacheKey(this.getClass(), flag);
			Optional<?> optional = CacheManager.get(business.cache(), cacheKey);
			if (optional.isPresent()) {
				result.setData((Wo) optional.get());
			} else {
				Wo wo = this.get(business, flag);
				CacheManager.put(business.cache(), cacheKey, wo);
				result.setData(wo);
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

	private Wo get(Business business, String flag) throws Exception {
		Unit unit = business.unit().pick(flag);
		if (null == unit) {
			throw new ExceptionUnitNotExist(flag);
		}
		Unit sup = business.unit().getSupDirectObject(unit);
		Wo wo = Wo.copier.copy(sup);
		wo.setSubDirectUnitCount(
				business.entityManagerContainer().countEqual(Unit.class, Unit.superior_FIELDNAME, wo.getId()));
		wo.setSubDirectIdentityCount(
				business.entityManagerContainer().countEqual(Identity.class, Identity.unit_FIELDNAME, wo.getId()));
		return wo;
	}

}