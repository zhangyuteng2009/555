package com.x.organization.assemble.personal.jaxrs.empower;

import org.apache.commons.lang3.StringUtils;

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
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.organization.assemble.personal.Business;
import com.x.organization.core.entity.accredit.Empower;

class ActionManagerCreate extends BaseAction {

    private static Logger logger = LoggerFactory.getLogger(ActionManagerCreate.class);

    ActionResult<Wo> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {

        try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
            ActionResult<Wo> result = new ActionResult<>();

            if (effectivePerson.isManager()) {

                Wi wi = this.convertToWrapIn(jsonElement, Wi.class);

                Business business = new Business(emc);
                Empower empower = Wi.copier.copy(wi);
                this.check(business, empower);
                String fromPerson = this.getPersonDNWithIdentityDN(business, empower.getFromIdentity());
                if (StringUtils.isEmpty(fromPerson)) {
                    throw new ExceptionPersonNotExistWithIdentity(empower.getFromIdentity());
                } else {
                    empower.setFromPerson(fromPerson);
                }
                String toPerson = this.getPersonDNWithIdentityDN(business, empower.getToIdentity());
                if (StringUtils.isEmpty(toPerson)) {
                    throw new ExceptionPersonNotExistWithIdentity(empower.getToIdentity());
                } else {
                    empower.setToPerson(toPerson);
                }
                emc.beginTransaction(Empower.class);
                emc.persist(empower, CheckPersistType.all);
                emc.commit();
                CacheManager.notify(Empower.class);
                Wo wo = new Wo();
                wo.setId(empower.getId());
                result.setData(wo);
            }

            return result;
        }
    }

    public static class Wi extends Empower {

        private static final long serialVersionUID = -4315296543575928054L;

        static WrapCopier<Wi, Empower> copier = WrapCopierFactory.wi(Wi.class, Empower.class, null,
                JpaObject.FieldsUnmodify);
    }

    public static class Wo extends WoId {

    }

}
