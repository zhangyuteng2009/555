package com.x.organization.assemble.control.jaxrs.unitduty;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.organization.assemble.control.Business;
import com.x.organization.assemble.control.message.OrgMessageFactory;
import com.x.organization.core.entity.Unit;
import com.x.organization.core.entity.UnitDuty;

class ActionDelete extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			UnitDuty o = business.unitDuty().pick(id);
			if (null == o) {
				throw new ExceptionUnitDutyNotExist(id);
			}
			Unit unit = business.unit().pick(o.getUnit());
			if (null == unit) {
				throw new ExceptionUnitNotExist(o.getUnit());
			}
			if (!effectivePerson.isSecurityManager() && !business.editable(effectivePerson, unit)) {
				throw new ExceptionDenyEditUnit(effectivePerson, unit.getName());
			}
			/** pick出来的需要重新取出 */
			emc.beginTransaction(UnitDuty.class);
			o = emc.find(o.getId(), UnitDuty.class);
			emc.remove(o, CheckRemoveType.all);
			emc.commit();
			CacheManager.notify(UnitDuty.class);

			/**创建 组织变更org消息通信 */
			OrgMessageFactory  orgMessageFactory = new OrgMessageFactory();
			orgMessageFactory.createMessageCommunicate("add", "duty", o, effectivePerson);

			Wo wo = new Wo();
			wo.setId(o.getId());
			result.setData(wo);
			return result;
		}
	}

	public static class Wo extends WoId {
	}

}
