package com.x.processplatform.service.processing.factory;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.x.processplatform.core.entity.content.Attachment;
import com.x.processplatform.core.entity.content.Attachment_;
import com.x.processplatform.service.processing.AbstractFactory;
import com.x.processplatform.service.processing.Business;

public class AttachmentFactory extends AbstractFactory {

	public AttachmentFactory(Business business) throws Exception {
		super(business);
	}

	public List<String> listWithJob(String job) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Attachment.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<Attachment> root = cq.from(Attachment.class);
		Predicate p = cb.equal(root.get(Attachment_.job), job);
		cq.select(root.get(Attachment_.id)).where(p);
		return em.createQuery(cq).getResultList();
	}

	public List<Attachment> listWithJobObject(String job) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Attachment.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Attachment> cq = cb.createQuery(Attachment.class);
		Root<Attachment> root = cq.from(Attachment.class);
		Predicate p = cb.equal(root.get(Attachment_.job), job);
		cq.select(root).where(p);
		return em.createQuery(cq).getResultList();
	}
}