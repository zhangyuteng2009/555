package com.x.organization.assemble.personal.jaxrs.definition;

import java.util.Optional;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.organization.assemble.personal.Business;
import com.x.organization.core.entity.Definition;

class ActionGet extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionGet.class);

	private static final String DEFINITION_MEETING_CONFIG = "meetingConfig";

	ActionResult<String> execute(EffectivePerson effectivePerson, String name) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ActionResult<String> result = new ActionResult<>();
			CacheKey cacheKey = new CacheKey(name);
			Optional<?> optional = CacheManager.get(business.cache(), cacheKey);
			String wo = "";
			if (optional.isPresent()) {
				wo = (String) optional.get();
			} else {
				Definition o = emc.flag(name, Definition.class);
				if (null != o) {
					 wo = o.getData();
					CacheManager.put(business.cache(), cacheKey, wo);
				}else if(DEFINITION_MEETING_CONFIG.equalsIgnoreCase(name)){
					 wo ="{\"process\":null,\"weekBegin\":\"0\",\"meetingViewer\":[],\"mobileCreateEnable\":\"true\",\"disableViewList\":[],\"toMyMeetingViewName\":\"\",\"toMonthViewName\":\"\",\"toWeekViewName\":\"\",\"toDayViewName\":\"\",\"toListViewName\":\"\",\"toRoomViewName\":\"\"}";
				}
			}
			result.setData(wo);
			return result;
		}
	}
}
