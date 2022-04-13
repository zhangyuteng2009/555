package com.x.processplatform.assemble.surface.jaxrs.readcompleted;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.NameValueCountPair;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.ReadCompleted;
import com.x.processplatform.core.entity.content.ReadCompleted_;
import com.x.processplatform.core.entity.element.Application;
import com.x.processplatform.core.entity.element.Process;

class ActionFilterAttributeFilter extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ActionResult<Wo> result = new ActionResult<>();
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			Predicate p = predicate(effectivePerson, business, wi);
			Wo wo = new Wo();
			wo.getApplicationList().addAll(this.listApplicationPair(business, p));
			wo.getProcessList().addAll(this.listProcessPair(business, p));
			wo.getCreatorUnitList().addAll(this.listCreatorUnitPair(business, p));
			wo.getStartTimeMonthList().addAll(this.listStartTimeMonthPair(business, p));
			wo.getCompletedTimeMonthList().addAll(this.listCompletedTimeMonthPair(business, p));
			wo.getActivityNameList().addAll(this.listActivityNamePair(business, p));
			wo.getCompletedList().addAll(this.listCompletedPair(business, p));
			result.setData(wo);
			return result;
		}
	}

	public class Wi extends GsonPropertyObject {

		public List<Boolean> getCompletedList() {
			return completedList;
		}

		public void setCompletedList(List<Boolean> completedList) {
			this.completedList = completedList;
		}

		@FieldDescribe("限制应用范围")
		private List<String> applicationList = new ArrayList<>();

		@FieldDescribe("限制流程范围")
		private List<String> processList = new ArrayList<>();

		@FieldDescribe("限制创建组织范围")
		private List<String> creatorUnitList = new ArrayList<>();

		@FieldDescribe("限制创建月份范围")
		private List<String> startTimeMonthList = new ArrayList<>();

		@FieldDescribe("限制结束月份范围")
		private List<String> completedTimeMonthList = new ArrayList<>();

		@FieldDescribe("限制活动名称范围")
		private List<String> activityNameList = new ArrayList<>();

		@FieldDescribe("可选择的完成状态")
		private List<Boolean> completedList = new ArrayList<>();

		public List<String> getApplicationList() {
			return applicationList;
		}

		public void setApplicationList(List<String> applicationList) {
			this.applicationList = applicationList;
		}

		public List<String> getProcessList() {
			return processList;
		}

		public void setProcessList(List<String> processList) {
			this.processList = processList;
		}

		public List<String> getStartTimeMonthList() {
			return startTimeMonthList;
		}

		public void setStartTimeMonthList(List<String> startTimeMonthList) {
			this.startTimeMonthList = startTimeMonthList;
		}

		public List<String> getActivityNameList() {
			return activityNameList;
		}

		public void setActivityNameList(List<String> activityNameList) {
			this.activityNameList = activityNameList;
		}

		public List<String> getCreatorUnitList() {
			return creatorUnitList;
		}

		public void setCreatorUnitList(List<String> creatorUnitList) {
			this.creatorUnitList = creatorUnitList;
		}

		public List<String> getCompletedTimeMonthList() {
			return completedTimeMonthList;
		}

		public void setCompletedTimeMonthList(List<String> completedTimeMonthList) {
			this.completedTimeMonthList = completedTimeMonthList;
		}

	}

	public static class Wo extends GsonPropertyObject {

		@FieldDescribe("可选择的应用")
		private List<NameValueCountPair> applicationList = new ArrayList<>();

		@FieldDescribe("可选择的流程")
		private List<NameValueCountPair> processList = new ArrayList<>();

		@FieldDescribe("可选择的组织")
		private List<NameValueCountPair> creatorUnitList = new ArrayList<>();

		@FieldDescribe("可选择的开始月份")
		private List<NameValueCountPair> startTimeMonthList = new ArrayList<>();

		@FieldDescribe("可选择的结束月份")
		private List<NameValueCountPair> completedTimeMonthList = new ArrayList<>();

		@FieldDescribe("可选择的活动节点")
		private List<NameValueCountPair> activityNameList = new ArrayList<>();

		@FieldDescribe("可选择的完成状态")
		private List<NameValueCountPair> completedList = new ArrayList<>();

		public List<NameValueCountPair> getCompletedList() {
			return completedList;
		}

		public void setCompletedList(List<NameValueCountPair> completedList) {
			this.completedList = completedList;
		}

		public List<NameValueCountPair> getApplicationList() {
			return applicationList;
		}

		public void setApplicationList(List<NameValueCountPair> applicationList) {
			this.applicationList = applicationList;
		}

		public List<NameValueCountPair> getProcessList() {
			return processList;
		}

		public void setProcessList(List<NameValueCountPair> processList) {
			this.processList = processList;
		}

		public List<NameValueCountPair> getCreatorUnitList() {
			return creatorUnitList;
		}

		public void setCreatorUnitList(List<NameValueCountPair> creatorUnitList) {
			this.creatorUnitList = creatorUnitList;
		}

		public List<NameValueCountPair> getStartTimeMonthList() {
			return startTimeMonthList;
		}

		public void setStartTimeMonthList(List<NameValueCountPair> startTimeMonthList) {
			this.startTimeMonthList = startTimeMonthList;
		}

		public List<NameValueCountPair> getActivityNameList() {
			return activityNameList;
		}

		public void setActivityNameList(List<NameValueCountPair> activityNameList) {
			this.activityNameList = activityNameList;
		}

		public List<NameValueCountPair> getCompletedTimeMonthList() {
			return completedTimeMonthList;
		}

		public void setCompletedTimeMonthList(List<NameValueCountPair> completedTimeMonthList) {
			this.completedTimeMonthList = completedTimeMonthList;
		}

	}

	private Predicate predicate(EffectivePerson effectivePerson, Business business, Wi wi) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		Predicate p = cb.equal(root.get(ReadCompleted_.person), effectivePerson.getDistinguishedName());
		if (ListTools.isNotEmpty(wi.getApplicationList())) {
			p = cb.and(p, root.get(ReadCompleted_.application).in(wi.getApplicationList()));
		}
		if (ListTools.isNotEmpty(wi.getProcessList())) {
			p = cb.and(p, root.get(ReadCompleted_.process).in(wi.getProcessList()));
		}
		if (ListTools.isNotEmpty(wi.getCreatorUnitList())) {
			p = cb.and(p, root.get(ReadCompleted_.creatorUnit).in(wi.getCreatorUnitList()));
		}
		if (ListTools.isNotEmpty(wi.getStartTimeMonthList())) {
			p = cb.and(p, root.get(ReadCompleted_.startTimeMonth).in(wi.getStartTimeMonthList()));
		}
		if (ListTools.isNotEmpty(wi.getCompletedTimeMonthList())) {
			p = cb.and(p, root.get(ReadCompleted_.completedTimeMonth).in(wi.getCompletedTimeMonthList()));
		}
		if (ListTools.isNotEmpty(wi.getActivityNameList())) {
			p = cb.and(p, root.get(ReadCompleted_.activityName).in(wi.getActivityNameList()));
		}
		// completed对象按单值处理
		if (ListTools.isNotEmpty(wi.getCompletedList())) {
			boolean value = BooleanUtils.isTrue(wi.getCompletedList().get(0));
			if (value) {
				p = cb.and(p, cb.isTrue(root.get(ReadCompleted_.completed)));
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(ReadCompleted_.completed)),
						cb.isFalse(root.get(ReadCompleted_.completed))));
			}
		}
		return p;
	}

	private List<NameValueCountPair> listApplicationPair(Business business, Predicate p) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		cq.select(root.get(ReadCompleted_.application)).where(p);
		List<String> os = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
		List<NameValueCountPair> wos = new ArrayList<>();
		for (String str : os) {
			if (StringUtils.isNotEmpty(str)) {
				NameValueCountPair o = new NameValueCountPair();
				Application application = business.application().pick(str);
				if (null != application) {
					o.setValue(application.getId());
					o.setName(application.getName());
				} else {
					o.setValue(str);
					o.setName(str);
				}
				wos.add(o);
			}
		}
		wos = wos.stream().sorted(Comparator.comparing(NameValueCountPair::getName, (s1, s2) -> {
			return Objects.toString(s1, "").compareTo(Objects.toString(s2, ""));
		})).collect(Collectors.toList());
		return wos;
	}

	private List<NameValueCountPair> listProcessPair(Business business, Predicate p) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		cq.select(root.get(ReadCompleted_.process)).where(p);
		List<String> os = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
		List<NameValueCountPair> wos = new ArrayList<>();
		for (String str : os) {
			if (StringUtils.isNotEmpty(str)) {
				NameValueCountPair o = new NameValueCountPair();
				Process process = business.process().pick(str);
				if (null != process) {
					o.setValue(process.getId());
					o.setName(process.getName());
				} else {
					o.setValue(str);
					o.setName(str);
				}
				wos.add(o);
			}
		}
		wos = wos.stream().sorted(Comparator.comparing(NameValueCountPair::getName, (s1, s2) -> {
			return Objects.toString(s1, "").compareTo(Objects.toString(s2, ""));
		})).collect(Collectors.toList());
		return wos;
	}

	private List<NameValueCountPair> listCreatorUnitPair(Business business, Predicate p) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		cq.select(root.get(ReadCompleted_.creatorUnit)).where(p);
		List<String> os = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
		List<NameValueCountPair> wos = new ArrayList<>();
		for (String str : os) {
			if (StringUtils.isNotEmpty(str)) {
				NameValueCountPair o = new NameValueCountPair();
				o.setValue(str);
				o.setName(StringUtils.defaultString(StringUtils.substringBefore(str, "@"), str));
				wos.add(o);
			}
		}
		wos = wos.stream().sorted(Comparator.comparing(NameValueCountPair::getName, (s1, s2) -> {
			return Objects.toString(s1, "").compareTo(Objects.toString(s2, ""));
		})).collect(Collectors.toList());
		return wos;
	}

	private List<NameValueCountPair> listActivityNamePair(Business business, Predicate p) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		cq.select(root.get(ReadCompleted_.activityName)).where(p);
		List<String> os = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
		List<NameValueCountPair> wos = new ArrayList<>();
		for (String str : os) {
			if (StringUtils.isNotEmpty(str)) {
				NameValueCountPair o = new NameValueCountPair();
				o.setValue(str);
				o.setName(str);
				wos.add(o);
			}
		}
		wos = wos.stream().sorted(Comparator.comparing(NameValueCountPair::getName, (s1, s2) -> {
			return Objects.toString(s1, "").compareTo(Objects.toString(s2, ""));
		})).collect(Collectors.toList());
		return wos;
	}

	private List<NameValueCountPair> listStartTimeMonthPair(Business business, Predicate p) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		cq.select(root.get(ReadCompleted_.startTimeMonth)).where(p);
		List<String> os = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
		List<NameValueCountPair> wos = new ArrayList<>();
		for (String str : os) {
			if (StringUtils.isNotEmpty(str)) {
				NameValueCountPair o = new NameValueCountPair();
				o.setValue(str);
				o.setName(str);
				wos.add(o);
			}
		}
		wos = wos.stream().sorted(Comparator.comparing(NameValueCountPair::getName, (s1, s2) -> {
			return Objects.toString(s1, "").compareTo(Objects.toString(s2, ""));
		})).collect(Collectors.toList());
		return wos;
	}

	private List<NameValueCountPair> listCompletedTimeMonthPair(Business business, Predicate p) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		cq.select(root.get(ReadCompleted_.completedTimeMonth)).where(p);
		List<String> os = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
		List<NameValueCountPair> wos = new ArrayList<>();
		for (String str : os) {
			if (StringUtils.isNotEmpty(str)) {
				NameValueCountPair o = new NameValueCountPair();
				o.setValue(str);
				o.setName(str);
				wos.add(o);
			}
		}
		wos = wos.stream().sorted(Comparator.comparing(NameValueCountPair::getName, (s1, s2) -> {
			return Objects.toString(s1, "").compareTo(Objects.toString(s2, ""));
		})).collect(Collectors.toList());
		return wos;
	}

	private List<NameValueCountPair> listCompletedPair(Business business, Predicate p) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Boolean> cq = cb.createQuery(Boolean.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		cq.select(root.get(ReadCompleted_.completed)).where(p);
		List<Boolean> os = em.createQuery(cq).getResultList().stream().distinct().collect(Collectors.toList());
		List<NameValueCountPair> wos = new ArrayList<>();
		for (Boolean value : os) {
			NameValueCountPair o = new NameValueCountPair();
			if (BooleanUtils.isTrue(value)) {
				o.setValue(Boolean.TRUE);
				o.setName("completed");
			} else {
				o.setValue(Boolean.FALSE);
				o.setName("not completed");
			}
			wos.add(o);
		}
		return wos;
	}
}