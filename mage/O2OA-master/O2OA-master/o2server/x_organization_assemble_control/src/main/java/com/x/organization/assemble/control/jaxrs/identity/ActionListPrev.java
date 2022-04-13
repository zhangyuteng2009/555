package com.x.organization.assemble.control.jaxrs.identity;

import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.organization.assemble.control.Business;
import com.x.organization.core.entity.Identity;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;

class ActionListPrev extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String flag, Integer count) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ActionResult<List<Wo>> result = new ActionResult<>();
			CacheKey cacheKey = new CacheKey(this.getClass(), flag, count);
			Optional<?> optional = CacheManager.get(business.cache(), cacheKey);
			if (optional.isPresent()) {
				Co co = (Co) optional.get();
				result.setData(co.getWos());
				result.setCount(co.getCount());
			} else {
				String id = EMPTY_SYMBOL;
				/** 如果不是空位标志位 */
				if (!StringUtils.equals(EMPTY_SYMBOL, flag)) {
					Identity identity = business.identity().pick(flag);
					if (null == identity) {
						throw new ExceptionIdentityNotExist(flag);
					}
					id = identity.getId();
				}
				result = this.standardListPrev(Wo.copier, id, count,  JpaObject.sequence_FIELDNAME, null, null, null, null, null, null,
						null, null, true, DESC);
				Co co = new Co(result.getData(), result.getCount());
				CacheManager.put(business.cache(), cacheKey, co);
			}
			return result;
		}
	}

	public static class Co extends GsonPropertyObject {

		public Co(List<Wo> wos, Long count) {
			this.wos = wos;
			this.count = count;
		}

		List<Wo> wos;
		Long count;

		public Long getCount() {
			return count;
		}

		public void setCount(Long count) {
			this.count = count;
		}

		public List<Wo> getWos() {
			return wos;
		}

		public void setWos(List<Wo> wos) {
			this.wos = wos;
		}
	}

	public static class Wo extends Identity {

		private static final long serialVersionUID = -125007357898871894L;

		@FieldDescribe("排序号")
		private Long rank;

		static WrapCopier<Identity, Wo> copier = WrapCopierFactory.wo(Identity.class, Wo.class, null,
				JpaObject.FieldsInvisible);

		public Long getRank() {
			return rank;
		}

		public void setRank(Long rank) {
			this.rank = rank;
		}

	}
}