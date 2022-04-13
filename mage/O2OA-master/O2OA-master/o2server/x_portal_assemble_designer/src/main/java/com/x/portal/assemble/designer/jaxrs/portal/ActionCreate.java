package com.x.portal.assemble.designer.jaxrs.portal;

import java.util.Date;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.portal.assemble.designer.Business;
import com.x.portal.core.entity.Portal;

class ActionCreate extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ActionResult<Wo> result = new ActionResult<>();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			if (!business.isPortalManager(effectivePerson)) {
				throw new InsufficientPermissionException(effectivePerson.getDistinguishedName());
			}
			emc.beginTransaction(Portal.class);
			Portal portal = Wi.copier.copy(wi);
			portal.setCreatorPerson(effectivePerson.getDistinguishedName());
			portal.setLastUpdatePerson(effectivePerson.getDistinguishedName());
			portal.setLastUpdateTime(new Date());
			this.checkName(business, portal);
			this.checkAlias(business, portal);
			emc.persist(portal, CheckPersistType.all);
			emc.commit();
			CacheManager.notify(Portal.class);
			Wo wo = new Wo();
			wo.setId(portal.getId());
			result.setData(wo);
			return result;
		}
	}

	public static class Wi extends Portal {

		private static final long serialVersionUID = 6624639107781167248L;

		static WrapCopier<Wi, Portal> copier = WrapCopierFactory.wi(Wi.class, Portal.class, null,
				JpaObject.FieldsUnmodifyExcludeId);

	}

	public static class Wo extends WoId {
	}

}