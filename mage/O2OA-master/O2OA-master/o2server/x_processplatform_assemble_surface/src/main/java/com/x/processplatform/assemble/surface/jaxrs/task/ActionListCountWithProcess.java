package com.x.processplatform.assemble.surface.jaxrs.task;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.bean.NameValueCountPair;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.SortTools;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.entity.content.Task_;
import com.x.processplatform.core.entity.element.Application;
import com.x.processplatform.core.entity.element.Process;

class ActionListCountWithProcess extends BaseAction {

	ActionResult<List<NameValueCountPair>> execute(EffectivePerson effectivePerson, String applicationFlag)
			throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<List<NameValueCountPair>> result = new ActionResult<>();
			Business business = new Business(emc);
			List<NameValueCountPair> wraps = new ArrayList<>();
			Application application = business.application().pick(applicationFlag);
			if (null != application) {
				EntityManager em = emc.get(Task.class);
				CriteriaBuilder cb = em.getCriteriaBuilder();
				CriteriaQuery<String> cq = cb.createQuery(String.class);
				Root<Task> root = cq.from(Task.class);
				Predicate p = cb.equal(root.get(Task_.person), effectivePerson.getDistinguishedName());
				p = cb.and(p, cb.equal(root.get(Task_.application), application.getId()));
				cq.select(root.get(Task_.process)).where(p);
				List<String> list = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
				for (String str : list) {
					this.addNameValueCountPair(business, effectivePerson, str, wraps);
				}
				SortTools.asc(wraps, false, "name");
			}
			result.setData(wraps);
			return result;
		}
	}

	private void addNameValueCountPair(Business business, EffectivePerson effectivePerson, String processId,
			List<NameValueCountPair> wraps) throws Exception {
		Process p = business.process().pick(processId);
		if (null != p) {
			NameValueCountPair pair = new NameValueCountPair();
			pair.setName(p.getName());
			pair.setValue(p.getId());
			pair.setCount(this.count(business, effectivePerson, processId));
			wraps.add(pair);
		}
	}

	private Long count(Business business, EffectivePerson effectivePerson, String processId) throws Exception {
		EntityManagerContainer emc = business.entityManagerContainer();
		EntityManager em = emc.get(Task.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Long> cq = cb.createQuery(Long.class);
		Root<Task> root = cq.from(Task.class);
		Predicate p = cb.equal(root.get(Task_.person), effectivePerson.getDistinguishedName());
		p = cb.and(p, cb.equal(root.get(Task_.process), processId));
		cq.select(cb.count(root)).where(p);
		return em.createQuery(cq).getSingleResult();
	}

}
