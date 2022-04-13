package com.x.organization.assemble.control.jaxrs.unitduty;

import com.x.base.core.project.cache.CacheManager;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.tools.ListTools;
import com.x.organization.assemble.control.Business;
import com.x.organization.assemble.control.message.OrgMessageFactory;
import com.x.organization.core.entity.Unit;
import com.x.organization.core.entity.UnitDuty;

class ActionCreate extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Business business = new Business(emc);
			Unit unit = business.unit().pick(wi.getUnit());
			if (null == unit) {
				throw new ExceptionUnitNotExist(wi.getUnit());
			}
			if (!effectivePerson.isSecurityManager() && !business.editable(effectivePerson, unit)) {
				throw new ExceptionDenyEditUnit(effectivePerson, unit.getName());
			}
			if (StringUtils.isEmpty(wi.getName())) {
				throw new ExceptionNameEmpty();
			}
			UnitDuty o = new UnitDuty();
			Wi.copier.copy(wi, o);
			/** 如果唯一标识不为空,要检查唯一标识是否唯一 */
			if (uniqueDuplicateWhenNotEmpty(business, o)) {
				throw new ExceptionDuplicateUnique(o.getName(), o.getUnique());
			}
			o.setUnit(unit.getId());
			if (duplicateOnUnit(business, unit, o.getName(), o)) {
				throw new ExceptionDuplicateOnUnit(o.getName(), unit.getName());
			}
			o.setIdentityList(ListTools.extractProperty(business.identity().pick(o.getIdentityList()),
					JpaObject.id_FIELDNAME, String.class, true, true));
			emc.beginTransaction(UnitDuty.class);
			emc.persist(o, CheckPersistType.all);
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

	public static class Wi extends UnitDuty {

		private static final long serialVersionUID = -7527954993386512109L;

		static WrapCopier<Wi, UnitDuty> copier = WrapCopierFactory.wi(Wi.class, UnitDuty.class, null,
				ListTools.toList(JpaObject.FieldsUnmodify, "pinyin", "pinyinInitial"));

	}

}
