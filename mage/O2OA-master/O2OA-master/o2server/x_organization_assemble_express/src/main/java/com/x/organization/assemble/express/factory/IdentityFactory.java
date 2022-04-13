package com.x.organization.assemble.express.factory;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.cache.Cache.CacheCategory;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.tools.ListTools;
import com.x.organization.assemble.express.AbstractFactory;
import com.x.organization.assemble.express.Business;
import com.x.organization.core.entity.Identity;
import com.x.organization.core.entity.Identity_;

public class IdentityFactory extends AbstractFactory {

	private CacheCategory cacheCategory = new CacheCategory(Identity.class);

	public IdentityFactory(Business business) throws Exception {
		super(business);
	}

	public Identity pick(String flag) throws Exception {
		if (StringUtils.isEmpty(flag)) {
			return null;
		}
		Identity o = null;
		CacheKey cacheKey = new CacheKey(Identity.class.getName(), flag);
		Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
		if (optional.isPresent()) {
			o = (Identity) optional.get();
		} else {
			o = this.pickObject(flag);
			if (null != o) {
				CacheManager.put(cacheCategory, cacheKey, o);
			}
		}
		return o;
	}

	private Identity pickObject(String flag) throws Exception {
		Identity o = this.entityManagerContainer().flag(flag, Identity.class);
		if (o != null) {
			this.entityManagerContainer().get(Identity.class).detach(o);
		} else {
			String name = flag;
			Matcher matcher = identity_distinguishedName_pattern.matcher(flag);
			if (matcher.find()) {
				name = matcher.group(1);
				String unique = matcher.group(2);
				o = this.entityManagerContainer().flag(unique, Identity.class);
				if (null != o) {
					this.entityManagerContainer().get(Identity.class).detach(o);
				}
			}
			if ((null == o) && BooleanUtils.isTrue(Config.organization().getPickIdentityWithName())) {
				EntityManager em = this.entityManagerContainer().get(Identity.class);
				CriteriaBuilder cb = em.getCriteriaBuilder();
				CriteriaQuery<Identity> cq = cb.createQuery(Identity.class);
				Root<Identity> root = cq.from(Identity.class);
				Predicate p = cb.equal(root.get(Identity_.name), name);
				List<Identity> os = em.createQuery(cq.select(root).where(p)).getResultList();
				if (os.size() == 1) {
					o = os.get(0);
					em.detach(o);
				}
			}
		}
		return o;
	}

	public List<Identity> pick(List<String> flags) throws Exception {
		List<Identity> list = new ArrayList<>();
		for (String str : flags) {
			CacheKey cacheKey = new CacheKey(Identity.class.getName(), str);
			Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
			if (optional.isPresent()) {
				list.add((Identity) optional.get());
			} else {
				Identity o = this.pickObject(str);
				if (null != o) {
					CacheManager.put(cacheCategory, cacheKey, o);
					list.add(o);
				}
			}
		}
		return list;
	}

	public List<Identity> listByPerson(String personId) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Identity.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Identity> cq = cb.createQuery(Identity.class);
		Root<Identity> root = cq.from(Identity.class);
		Predicate p = cb.equal(root.get(Identity_.person), personId);
		List<Identity> is = em.createQuery(cq.select(root).where(p)).getResultList();
		return is;
	}

	public <T extends Identity> List<T> sort(List<T> list) throws Exception {
		if (Config.person().getPersonUnitOrderByAsc()) {
			list = list.stream()
					.sorted(Comparator.comparing(Identity::getOrderNumber, Comparator.nullsLast(Integer::compareTo))
							.thenComparing(Comparator
									.comparing(Identity::getName, Comparator.nullsFirst(String::compareTo)).reversed()))
					.collect(Collectors.toList());
		} else {
			list = list.stream()
					.sorted(Comparator.comparing(Identity::getOrderNumber, Comparator.nullsLast(Integer::compareTo))
							.reversed()
							.thenComparing(Comparator
									.comparing(Identity::getName, Comparator.nullsFirst(String::compareTo)).reversed()))
					.collect(Collectors.toList());
		}
		return list;
	}

	public List<String> listIdentityDistinguishedNameSorted(List<String> identityIds) throws Exception {
		List<Identity> list = this.entityManagerContainer().list(Identity.class, identityIds);
		list = this.sort(list);
		List<String> values = ListTools.extractProperty(list, JpaObject.DISTINGUISHEDNAME, String.class, true, true);
		return values;
	}

	/* 取出指定人员的的主身份 */
	public List<Identity> listMajorOfPerson(Business business, List<String> people) throws Exception {
		List<Identity> list = new ArrayList<>();
		List<Identity> identities = business.entityManagerContainer().listIn(Identity.class, Identity.person_FIELDNAME,
				people);
		Map<String, List<Identity>> map = identities.stream().collect(Collectors.groupingBy(Identity::getPerson));
		for (List<Identity> os : map.values()) {
			Optional<Identity> optional = os.stream().filter(o -> BooleanUtils.isTrue(o.getMajor())).findFirst();
			if (optional.isPresent()) {
				list.add(optional.get());
			} else {
				list.add(os.stream()
						.sorted(Comparator.comparing(Identity::getUnitLevel, Comparator.nullsLast(Integer::compareTo))
								.thenComparing(Identity::getUpdateTime, Comparator.nullsLast(Date::compareTo)))
						.findFirst().get());
			}
		}
		return list;
	}

	public Long countByUnit(String unitId) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Identity.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Long> cq = cb.createQuery(Long.class);
		Root<Identity> root = cq.from(Identity.class);
		Predicate p = cb.equal(root.get(Identity_.unit), unitId);
		Long count = em.createQuery(cq.select(cb.count(root)).where(p)).getSingleResult();
		return count;
	}

	public List<String> listPerson(List<String> identityIds) throws Exception {
		List<Identity> list = this.entityManagerContainer().fetch(identityIds, Identity.class, ListTools.toList(Identity.id_FIELDNAME, Identity.person_FIELDNAME));
		List<String> values = ListTools.extractProperty(list, Identity.person_FIELDNAME, String.class, true, true);
		return values;
	}

}
