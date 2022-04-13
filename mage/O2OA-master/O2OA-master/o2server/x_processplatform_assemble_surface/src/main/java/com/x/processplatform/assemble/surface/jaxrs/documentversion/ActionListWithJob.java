package com.x.processplatform.assemble.surface.jaxrs.documentversion;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDeniedOrEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.organization.OrganizationDefinition;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.DocumentVersion;

class ActionListWithJob extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionListWithJob.class);

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String job) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<Wo>> result = new ActionResult<>();

			Business business = new Business(emc);

			if ((!business.readableWithJob(effectivePerson, job))
					&& (!business.organization().person().hasRole(effectivePerson, OrganizationDefinition.Manager,
							OrganizationDefinition.ProcessPlatformManager))) {
				throw new ExceptionAccessDeniedOrEntityNotExist(effectivePerson);
			}

			List<Wo> wos = this.list(business, job);

			wos = wos.stream().sorted(Comparator.comparing(Wo::getCreateTime).reversed()).collect(Collectors.toList());

			result.setData(wos);

			return result;
		}
	}

	private List<Wo> list(Business business, String job) throws Exception {
		List<DocumentVersion> os = business.entityManagerContainer().fetchEqual(DocumentVersion.class,
				DocumentVersion.job_FIELDNAME, job);
		List<Wo> wos = Wo.copier.copy(os);
		return wos;
	}

	public static class Wo extends DocumentVersion {

		static final long serialVersionUID = 5610132069178497370L;

		static WrapCopier<DocumentVersion, Wo> copier = WrapCopierFactory.wo(DocumentVersion.class, Wo.class,
				JpaObject.singularAttributeField(DocumentVersion.class, true, false), null);

	}

}