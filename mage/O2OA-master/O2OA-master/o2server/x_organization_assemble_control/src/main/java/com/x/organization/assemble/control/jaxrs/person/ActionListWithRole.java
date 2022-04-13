package com.x.organization.assemble.control.jaxrs.person;

import java.util.List;
import java.util.Optional;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.organization.assemble.control.Business;
import com.x.organization.core.entity.Person;
import com.x.organization.core.entity.Role;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;

class ActionListWithRole extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String roleFlag) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();
			Business business = new Business(emc);
			CacheKey cacheKey = new CacheKey(this.getClass(), roleFlag);
			Optional<?> optional = CacheManager.get(business.cache(), cacheKey);
			if (optional.isPresent()) {
				result.setData((List<Wo>) optional.get());
			} else {
				List<Wo> wos = this.list(business, roleFlag);
				CacheManager.put(business.cache(), cacheKey, wos);
				result.setData(wos);
			}
			this.updateControl(effectivePerson, business, result.getData());
			this.hide(effectivePerson, business, result.getData());
			return result;
		}
	}

	private List<Wo> list(Business business, String roleFlag) throws Exception {
		Role o = business.role().pick(roleFlag);
		if (null == o) {
			throw new ExceptionRoleNotExist(roleFlag);
		}
		List<String> ids = o.getPersonList();
		List<Person> os = business.person().pick(ids);
		List<Wo> wos = Wo.copier.copy(os);
		wos = business.person().sort(wos);
		/** 产生头像 */
		// this.updateIcon(wos);
		return wos;
	}

	public static class Wo extends WoPersonAbstract {

		private static final long serialVersionUID = -125007357898871894L;

		static WrapCopier<Person, Wo> copier = WrapCopierFactory.wo(Person.class, Wo.class, null,
				person_fieldsInvisible);

	}

}