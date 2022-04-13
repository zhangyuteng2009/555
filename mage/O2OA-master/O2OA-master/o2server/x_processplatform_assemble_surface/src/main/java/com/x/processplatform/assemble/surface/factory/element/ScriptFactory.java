package com.x.processplatform.assemble.surface.factory.element;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.x.base.core.project.cache.Cache.CacheCategory;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.exception.ExceptionWhen;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.element.Application;
import com.x.processplatform.core.entity.element.Script;
import com.x.processplatform.core.entity.element.Script_;

public class ScriptFactory extends ElementFactory {

	public ScriptFactory(Business abstractBusiness) throws Exception {
		super(abstractBusiness);
	}

	public Script pick(String flag) throws Exception {
		return this.pick(flag, ExceptionWhen.none);
	}

	@Deprecated
	public Script pick(String flag, ExceptionWhen exceptionWhen) throws Exception {
		return this.pick(flag, Script.class);
	}

	@SuppressWarnings("unchecked")
	public List<Script> listScriptNestedWithApplicationWithUniqueName(Application application, String uniqueName)
			throws Exception {
		List<Script> list = new ArrayList<>();
		if (null == application) {
			return list;
		}
		CacheCategory cacheCategory = new CacheCategory(Script.class);
		CacheKey cacheKey = new CacheKey("listScriptNestedWithApplicationWithUniqueName", application.getId(),
				uniqueName);
		Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
		if (optional.isPresent()) {
			list = (List<Script>) optional.get();
		} else {
			List<String> names = new ArrayList<>();
			names.add(uniqueName);
			while (!names.isEmpty()) {
				List<String> loops = new ArrayList<>();
				for (String name : names) {
					Script o = this.getScriptWithApplicationWithUniqueName(application, name);
					if ((null != o) && (!list.contains(o))) {
						list.add(o);
						loops.addAll(o.getDependScriptList());
					}
				}
				names = loops;
			}
			if (!list.isEmpty()) {
				Collections.reverse(list);
				CacheManager.put(cacheCategory, cacheKey, list);
			}
		}
		return list;
	}

	private Script getScriptWithApplicationWithUniqueName(Application application, String uniqueName) throws Exception {
		Script script = this.getWithApplicationWithId(application, uniqueName);
		if (null == script) {
			script = this.getWithApplicationWithAlias(application, uniqueName);
		}
		if (null == script) {
			script = this.getWithApplicationWithName(application, uniqueName);
		}
		if(script != null){
			this.entityManagerContainer().get(Script.class).detach(script);
		}
		return script;
	}

	private Script getWithApplicationWithId(Application application, String uniqueName) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Script.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Script> cq = cb.createQuery(Script.class);
		Root<Script> root = cq.from(Script.class);
		Predicate p = cb.equal(root.get(Script_.id), uniqueName);
		p = cb.and(p, cb.equal(root.get(Script_.application), application.getId()));
		List<Script> list = em.createQuery(cq.where(p)).setMaxResults(1).getResultList();
		if (!list.isEmpty()) {
			return list.get(0);
		}
		return null;
	}

	private Script getWithApplicationWithAlias(Application application, String uniqueName) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Script.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Script> cq = cb.createQuery(Script.class);
		Root<Script> root = cq.from(Script.class);
		Predicate p = cb.equal(root.get(Script_.alias), uniqueName);
		p = cb.and(p, cb.equal(root.get(Script_.application), application.getId()));
		List<Script> list = em.createQuery(cq.where(p)).setMaxResults(1).getResultList();
		if (!list.isEmpty()) {
			return list.get(0);
		}
		return null;
	}

	private Script getWithApplicationWithName(Application application, String uniqueName) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Script.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Script> cq = cb.createQuery(Script.class);
		Root<Script> root = cq.from(Script.class);
		Predicate p = cb.equal(root.get(Script_.name), uniqueName);
		p = cb.and(p, cb.equal(root.get(Script_.application), application.getId()));
		List<Script> list = em.createQuery(cq.where(p)).setMaxResults(1).getResultList();
		if (!list.isEmpty()) {
			return list.get(0);
		}
		return null;
	}
}
