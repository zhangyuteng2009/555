package com.x.processplatform.assemble.designer.jaxrs.process;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionWhen;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.designer.Business;
import com.x.processplatform.core.entity.element.Application;
import com.x.processplatform.core.entity.element.Process;
import com.x.processplatform.core.entity.element.Process_;

class ActionListWithApplication extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String applicationId) throws Exception {
		ActionResult<List<Wo>> result = new ActionResult<>();
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			Application application = emc.find(applicationId, Application.class, ExceptionWhen.not_found);
			if (null == application) {
				throw new ExceptionApplicationNotExist(applicationId);
			}
			if (!effectivePerson.isSecurityManager() && !business.editable(effectivePerson, application)) {
				throw new ExceptionApplicationAccessDenied(effectivePerson.getDistinguishedName(),
						application.getName(), application.getId());
			}
			List<Wo> wos = Wo.copier.copy(business.process().listWithApplicationObject(applicationId));
			wos = business.process().sort(wos);
			result.setData(wos);
			return result;
		}
	}

	public static class Wo extends Process {

		private static final long serialVersionUID = 1439909268641168987L;

		static WrapCopier<Process, Wo> copier = WrapCopierFactory.wo(Process.class, Wo.class, null,
				JpaObject.FieldsInvisible);
	}

}
