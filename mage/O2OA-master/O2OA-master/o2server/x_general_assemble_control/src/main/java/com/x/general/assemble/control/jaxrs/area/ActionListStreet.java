package com.x.general.assemble.control.jaxrs.area;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.ListTools;
import com.x.general.assemble.control.Business;
import com.x.general.core.entity.area.District;

public class ActionListStreet extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String province, String city, String district)
			throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();
			List<Wo> wos = new ArrayList<>();
			CacheKey cacheKey = new CacheKey(this.getClass(), province, city, district);
			Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
			if (optional.isPresent()) {
				wos = (List<Wo>) optional.get();
			} else {
				Business business = new Business(emc);
				District districtProvince = this.getProvince(business, province);
				if (null == districtProvince) {
					throw new ExceptionDistrictNotExist(province);
				}
				District districtCity = this.getCity(business, districtProvince, city);
				if (null == districtCity) {
					throw new ExceptionDistrictNotExist(city);
				}
				District districtDistrict = this.getDistrict(business, districtCity, district);
				if (null == districtDistrict) {
					throw new ExceptionDistrictNotExist(district);
				}
				wos = Wo.copier.copy(this.listStreet(business, districtDistrict));
				CacheManager.put(cacheCategory, cacheKey, wos);
			}
			result.setData(wos);
			return result;
		}
	}

	public static class Wo extends District {

		private static final long serialVersionUID = -6068531258644538959L;
		static WrapCopier<District, Wo> copier = WrapCopierFactory.wo(District.class, Wo.class,
				ListTools.toList(District.zipCode_FIELDNAME, District.center_FIELDNAME, District.name_FIELDNAME,
						District.level_FIELDNAME),
				null);
	}

}
