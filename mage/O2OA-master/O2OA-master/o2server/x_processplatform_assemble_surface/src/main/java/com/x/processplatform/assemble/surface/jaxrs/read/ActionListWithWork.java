package com.x.processplatform.assemble.surface.jaxrs.read;

import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.Read;
import com.x.processplatform.core.entity.content.Work;

class ActionListWithWork extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String workId) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {

			ActionResult<List<Wo>> result = new ActionResult<>();

			Business business = new Business(emc);

			Work work = emc.fetch(workId, Work.class, ListTools.toList(Work.job_FIELDNAME));

			if (null == work) {
				throw new ExceptionEntityNotExist(workId, Work.class);
			}

			if (!business.readableWithJob(effectivePerson, work.getJob())) {
				throw new ExceptionAccessDenied(effectivePerson);
			}

			List<Wo> wos = Wo.copier.copy(emc.listEqual(Read.class, Read.work_FIELDNAME, workId));

			wos = wos.stream().sorted(Comparator.comparing(Wo::getStartTime, Comparator.nullsLast(Date::compareTo)))
					.collect(Collectors.toList());

			result.setData(wos);

			return result;
		}
	}

	public static class Wo extends Read {

		private static final long serialVersionUID = 2279846765261247910L;

		static WrapCopier<Read, Wo> copier = WrapCopierFactory.wo(Read.class, Wo.class, null,
				JpaObject.FieldsInvisible);

	}
}