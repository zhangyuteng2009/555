package com.x.processplatform.assemble.designer.content.factory;

import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.x.processplatform.assemble.designer.AbstractFactory;
import com.x.processplatform.assemble.designer.Business;
import com.x.processplatform.core.entity.content.WorkCompleted;
import com.x.processplatform.core.entity.content.WorkCompleted_;

public class WorkCompletedFactory extends AbstractFactory {

	public WorkCompletedFactory(Business business) throws Exception {
		super(business);
	}

	public List<String> listWithApplication(String id) throws Exception {
		EntityManager em = this.entityManagerContainer().get(WorkCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<WorkCompleted> root = cq.from(WorkCompleted.class);
		Predicate p = cb.equal(root.get(WorkCompleted_.application), id);
		cq.select(root.get(WorkCompleted_.id)).where(p);
		return em.createQuery(cq).getResultList();
	}

	public List<String> listWithProcess(String id) throws Exception {
		EntityManager em = this.entityManagerContainer().get(WorkCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<WorkCompleted> root = cq.from(WorkCompleted.class);
		Predicate p = cb.equal(root.get(WorkCompleted_.process), id);
		cq.select(root.get(WorkCompleted_.id)).where(p);
		return em.createQuery(cq).getResultList();
	}

	public List<String> listJobWithApplication(String applicationId) throws Exception {
		EntityManager em = this.entityManagerContainer().get(WorkCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<WorkCompleted> root = cq.from(WorkCompleted.class);
		Predicate p = cb.equal(root.get(WorkCompleted_.application), applicationId);
		return em.createQuery(cq.select(root.get(WorkCompleted_.job)).where(p)).getResultList().stream().distinct()
				.collect(Collectors.toList());
	}

	public List<String> listJobWithProcess(String processId) throws Exception {
		EntityManager em = this.entityManagerContainer().get(WorkCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<WorkCompleted> root = cq.from(WorkCompleted.class);
		Predicate p = cb.equal(root.get(WorkCompleted_.process), processId);
		return em.createQuery(cq.select(root.get(WorkCompleted_.job)).where(p)).getResultList().stream().distinct()
				.collect(Collectors.toList());
	}
}