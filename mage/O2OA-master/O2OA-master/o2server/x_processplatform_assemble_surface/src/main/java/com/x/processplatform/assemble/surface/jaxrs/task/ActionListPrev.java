package com.x.processplatform.assemble.surface.jaxrs.task;

import java.util.List;

import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.EqualsTerms;
import com.x.processplatform.core.entity.content.Task;

class ActionListPrev extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String id, Integer count) throws Exception {
		EqualsTerms equals = new EqualsTerms();
		equals.put(Task.person_FIELDNAME, effectivePerson.getDistinguishedName());
		ActionResult<List<Wo>> result = this.standardListPrev(Wo.copier, id, count, Task.sequence_FIELDNAME, equals,
				null, null, null, null, null, null, null, true, DESC);
		return result;
	}

	public static class Wo extends Task {

		private static final long serialVersionUID = 2279846765261247910L;

		static WrapCopier<Task, Wo> copier = WrapCopierFactory.wo(Task.class, Wo.class, null,
				JpaObject.FieldsInvisible);

		@FieldDescribe("排序号")
		private Long rank;

		public Long getRank() {
			return rank;
		}

		public void setRank(Long rank) {
			this.rank = rank;
		}

	}

}
