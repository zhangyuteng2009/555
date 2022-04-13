package com.x.query.assemble.designer.jaxrs.query;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.query.assemble.designer.Business;
import com.x.query.core.entity.Query;
import com.x.query.core.entity.Query_;
import com.x.query.core.entity.Reveal;
import com.x.query.core.entity.Reveal_;
import com.x.query.core.entity.Stat;
import com.x.query.core.entity.Stat_;
import com.x.query.core.entity.View;
import com.x.query.core.entity.View_;

class ActionListWithQueryCategory extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionListWithQueryCategory.class);

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String queryCategory) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			logger.debug(effectivePerson, effectivePerson.getDistinguishedName());
			Business business = new Business(emc);
			if (!business.controllable(effectivePerson)) {
				throw new ExceptionAccessDenied(effectivePerson.getDistinguishedName());
			}
			ActionResult<List<Wo>> result = new ActionResult<>();
			List<Wo> wos = Wo.copier.copy(this.list(business, queryCategory));
			List<String> ids = ListTools.extractField(wos, JpaObject.id_FIELDNAME, String.class, true, true);
			List<WoView> views = WoView.copier.copy(this.listView(business, ids));
			List<WoStat> stats = WoStat.copier.copy(this.listStat(business, ids));
			List<WoReveal> reveals = WoReveal.copier.copy(this.listReveal(business, ids));
			ListTools.groupStick(wos, views, Query.id_FIELDNAME, View.query_FIELDNAME, "viewList");
			ListTools.groupStick(wos, stats, Query.id_FIELDNAME, Stat.query_FIELDNAME, "statList");
			ListTools.groupStick(wos, reveals, Query.id_FIELDNAME, Reveal.query_FIELDNAME, "revealList");
			wos.stream().forEach(o -> {
				try {
					o.setViewList(business.view().sort(o.getViewList()));
					o.setStatList(business.stat().sort(o.getStatList()));
					o.setRevealList(business.reveal().sort(o.getRevealList()));
				} catch (Exception e) {
					e.printStackTrace();
				}
			});
			wos = business.query().sort(wos);
			result.setData(wos);
			return result;
		}
	}

	private List<Query> list(Business business, String queryCategory) throws Exception {
		String _category = StringUtils.trimToEmpty(queryCategory);
		_category = StringUtils.equals(_category, EMPTY_SYMBOL) ? "" : _category;
		EntityManager em = business.entityManagerContainer().get(Query.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Query> cq = cb.createQuery(Query.class);
		Root<Query> root = cq.from(Query.class);
		Predicate p = cb.equal(root.get(Query_.queryCategory), _category);
		List<Query> os = em.createQuery(cq.select(root).where(p)).getResultList();
		return os;
	}

	private List<View> listView(Business business, List<String> queryIds) throws Exception {
		EntityManager em = business.entityManagerContainer().get(View.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<View> cq = cb.createQuery(View.class);
		Root<View> root = cq.from(View.class);
		Predicate p = root.get(View_.query).in(queryIds);
		List<View> os = em.createQuery(cq.select(root).where(p)).getResultList();
		return os;
	}

	private List<Stat> listStat(Business business, List<String> queryIds) throws Exception {
		EntityManager em = business.entityManagerContainer().get(Stat.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Stat> cq = cb.createQuery(Stat.class);
		Root<Stat> root = cq.from(Stat.class);
		Predicate p = root.get(Stat_.query).in(queryIds);
		List<Stat> os = em.createQuery(cq.select(root).where(p)).getResultList();
		return os;
	}

	private List<Reveal> listReveal(Business business, List<String> queryIds) throws Exception {
		EntityManager em = business.entityManagerContainer().get(Reveal.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Reveal> cq = cb.createQuery(Reveal.class);
		Root<Reveal> root = cq.from(Reveal.class);
		Predicate p = root.get(Reveal_.query).in(queryIds);
		List<Reveal> os = em.createQuery(cq.select(root).where(p)).getResultList();
		return os;
	}

	public static class Wo extends Query {

		private static final long serialVersionUID = 2886873983211744188L;

		static WrapCopier<Query, Wo> copier = WrapCopierFactory.wo(Query.class, Wo.class,
				JpaObject.singularAttributeField(View.class, true, false), null);

		private List<WoView> viewList = new ArrayList<>();

		private List<WoStat> statList = new ArrayList<>();

		private List<WoReveal> revealList = new ArrayList<>();

		public List<WoView> getViewList() {
			return viewList;
		}

		public void setViewList(List<WoView> viewList) {
			this.viewList = viewList;
		}

		public List<WoStat> getStatList() {
			return statList;
		}

		public void setStatList(List<WoStat> statList) {
			this.statList = statList;
		}

		public List<WoReveal> getRevealList() {
			return revealList;
		}

		public void setRevealList(List<WoReveal> revealList) {
			this.revealList = revealList;
		}

	}

	public static class WoView extends View {

		private static final long serialVersionUID = 3456154680561609726L;

		static WrapCopier<View, WoView> copier = WrapCopierFactory.wo(View.class, WoView.class,
				JpaObject.singularAttributeField(View.class, true, true), null);

	}

	public static class WoStat extends Stat {

		private static final long serialVersionUID = -6331662271434269932L;

		static WrapCopier<Stat, WoStat> copier = WrapCopierFactory.wo(Stat.class, WoStat.class,
				JpaObject.singularAttributeField(Stat.class, true, true), null);

	}

	public static class WoReveal extends Reveal {

		private static final long serialVersionUID = -2348134755539702740L;

		static WrapCopier<Reveal, WoReveal> copier = WrapCopierFactory.wo(Reveal.class, WoReveal.class,
				JpaObject.singularAttributeField(Reveal.class, true, true), null);
	}
}