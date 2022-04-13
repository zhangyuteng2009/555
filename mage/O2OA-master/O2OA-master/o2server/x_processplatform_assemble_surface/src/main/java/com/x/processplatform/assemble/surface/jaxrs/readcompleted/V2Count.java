package com.x.processplatform.assemble.surface.jaxrs.readcompleted;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.NameValueCountPair;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.ReadCompleted;
import com.x.processplatform.core.entity.content.ReadCompleted_;

class V2Count extends V2Base {

	public ActionResult<Wo> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
		Wo wo = new Wo();
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			Predicate p = this.toFilterPredicate(effectivePerson, business, wi);
			wo.setCount(this.count(business, p));
			if (BooleanUtils.isTrue(wi.getGroupByApplication())) {
				wo.setApplicationList(this.groupByApplication(business, p));
			}
			if (BooleanUtils.isTrue(wi.getGroupByProcess())) {
				wo.setProcessList(this.groupByProcess(business, p));
			}
			if (BooleanUtils.isTrue(wi.getGroupByCreatorPerson())) {
				wo.setCreatorPersonList(this.groupByCreatorPerson(business, p));
			}
			if (BooleanUtils.isTrue(wi.getGroupByCreatorUnit())) {
				wo.setCreatorUnitList(this.groupByCreatorUnit(business, p));
			}
			if (BooleanUtils.isTrue(wi.getGroupByStartTimeMonth())) {
				wo.setStartTimeMonthList(this.groupByStartTimeMonth(business, p));
			}
		}
		result.setData(wo);
		return result;
	}

	private Long count(Business business, Predicate predicate) throws Exception {
		return business.entityManagerContainer().count(ReadCompleted.class, predicate);
	}

	private List<NameValueCountPair> groupByApplication(Business business, Predicate predicate) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		Path<String> pathApplication = root.get(ReadCompleted_.application);
		Path<String> pathApplicationName = root.get(ReadCompleted_.applicationName);
		cq.multiselect(pathApplication, pathApplicationName, cb.count(root)).where(predicate).groupBy(pathApplication);
		List<Tuple> os = em.createQuery(cq).getResultList();
		List<NameValueCountPair> list = new ArrayList<>();
		NameValueCountPair pair = null;
		for (Tuple o : os) {
			pair = new NameValueCountPair();
			pair.setName(o.get(pathApplicationName));
			pair.setValue(o.get(pathApplication));
			pair.setCount(o.get(2, Long.class));
			list.add(pair);
		}
		return list.stream().sorted(Comparator.comparing(NameValueCountPair::getCount).reversed())
				.collect(Collectors.toList());
	}

	private List<NameValueCountPair> groupByProcess(Business business, Predicate predicate) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		Path<String> pathProcess = root.get(ReadCompleted_.process);
		Path<String> pathProcessName = root.get(ReadCompleted_.processName);
		cq.multiselect(pathProcess, pathProcessName, cb.count(root)).where(predicate).groupBy(pathProcess);
		List<Tuple> os = em.createQuery(cq).getResultList();
		List<NameValueCountPair> list = new ArrayList<>();
		NameValueCountPair pair = null;
		for (Tuple o : os) {
			pair = new NameValueCountPair();
			pair.setName(o.get(pathProcessName));
			pair.setValue(o.get(pathProcess));
			pair.setCount(o.get(2, Long.class));
			list.add(pair);
		}
		return list.stream().sorted(Comparator.comparing(NameValueCountPair::getCount).reversed())
				.collect(Collectors.toList());
	}

	private List<NameValueCountPair> groupByCreatorPerson(Business business, Predicate predicate) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		Path<String> pathCreatorPerson = root.get(ReadCompleted_.creatorPerson);
		cq.multiselect(pathCreatorPerson, cb.count(root)).where(predicate).groupBy(pathCreatorPerson);
		List<Tuple> os = em.createQuery(cq).getResultList();
		List<NameValueCountPair> list = new ArrayList<>();
		NameValueCountPair pair = null;
		for (Tuple o : os) {
			pair = new NameValueCountPair();
			pair.setName(o.get(pathCreatorPerson));
			pair.setValue(o.get(pathCreatorPerson));
			pair.setCount(o.get(1, Long.class));
			list.add(pair);
		}
		return list.stream().sorted(Comparator.comparing(NameValueCountPair::getCount).reversed())
				.collect(Collectors.toList());
	}

	private List<NameValueCountPair> groupByCreatorUnit(Business business, Predicate predicate) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		Path<String> pathCreatorUnit = root.get(ReadCompleted_.creatorUnit);
		cq.multiselect(pathCreatorUnit, cb.count(root)).where(predicate).groupBy(pathCreatorUnit);
		List<Tuple> os = em.createQuery(cq).getResultList();
		List<NameValueCountPair> list = new ArrayList<>();
		NameValueCountPair pair = null;
		for (Tuple o : os) {
			pair = new NameValueCountPair();
			pair.setName(o.get(pathCreatorUnit));
			pair.setValue(o.get(pathCreatorUnit));
			pair.setCount(o.get(1, Long.class));
			list.add(pair);
		}
		return list.stream().sorted(Comparator.comparing(NameValueCountPair::getCount).reversed())
				.collect(Collectors.toList());
	}

	private List<NameValueCountPair> groupByStartTimeMonth(Business business, Predicate predicate) throws Exception {
		EntityManager em = business.entityManagerContainer().get(ReadCompleted.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<ReadCompleted> root = cq.from(ReadCompleted.class);
		Path<String> pathStartTimeMonth = root.get(ReadCompleted_.startTimeMonth);
		cq.multiselect(pathStartTimeMonth, cb.count(root)).where(predicate).groupBy(pathStartTimeMonth);
		List<Tuple> os = em.createQuery(cq).getResultList();
		List<NameValueCountPair> list = new ArrayList<>();
		NameValueCountPair pair = null;
		for (Tuple o : os) {
			pair = new NameValueCountPair();
			pair.setName(o.get(pathStartTimeMonth));
			pair.setValue(o.get(pathStartTimeMonth));
			pair.setCount(o.get(1, Long.class));
			list.add(pair);
		}
		return list.stream()
				.sorted((o1, o2) -> Objects.toString(o2.getName(), "").compareTo(Objects.toString(o1.getName(), "")))
				.collect(Collectors.toList());
	}

	public static class Wi extends FilterWi {

		@FieldDescribe("按应用分类")
		private Boolean groupByApplication;

		@FieldDescribe("按流程分类")
		private Boolean groupByProcess;

		@FieldDescribe("按创建人分类")
		private Boolean groupByCreatorPerson;

		@FieldDescribe("按创建人分类")
		private Boolean groupByCreatorUnit;

		@FieldDescribe("按创建年月分类")
		private Boolean groupByStartTimeMonth;

		public Boolean getGroupByApplication() {
			return groupByApplication;
		}

		public void setGroupByApplication(Boolean groupByApplication) {
			this.groupByApplication = groupByApplication;
		}

		public Boolean getGroupByProcess() {
			return groupByProcess;
		}

		public void setGroupByProcess(Boolean groupByProcess) {
			this.groupByProcess = groupByProcess;
		}

		public Boolean getGroupByCreatorPerson() {
			return groupByCreatorPerson;
		}

		public void setGroupByCreatorPerson(Boolean groupByCreatorPerson) {
			this.groupByCreatorPerson = groupByCreatorPerson;
		}

		public Boolean getGroupByCreatorUnit() {
			return groupByCreatorUnit;
		}

		public void setGroupByCreatorUnit(Boolean groupByCreatorUnit) {
			this.groupByCreatorUnit = groupByCreatorUnit;
		}

		public Boolean getGroupByStartTimeMonth() {
			return groupByStartTimeMonth;
		}

		public void setGroupByStartTimeMonth(Boolean groupByStartTimeMonth) {
			this.groupByStartTimeMonth = groupByStartTimeMonth;
		}

	}

	public static class Wo extends GsonPropertyObject {

		@FieldDescribe("总数量")
		private Long count;

		@FieldDescribe("按应用分类数量")
		private List<NameValueCountPair> applicationList = new ArrayList<>();

		@FieldDescribe("按流程分类数量")
		private List<NameValueCountPair> processList = new ArrayList<>();

		@FieldDescribe("按创建人分类数量")
		private List<NameValueCountPair> creatorPersonList = new ArrayList<>();

		@FieldDescribe("按创建组织分类数量")
		private List<NameValueCountPair> creatorUnitList = new ArrayList<>();

		@FieldDescribe("按创建的年月分类")
		private List<NameValueCountPair> startTimeMonthList = new ArrayList<>();

		public Long getCount() {
			return count;
		}

		public void setCount(Long count) {
			this.count = count;
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

		public List<NameValueCountPair> getCreatorPersonList() {
			return creatorPersonList;
		}

		public void setCreatorPersonList(List<NameValueCountPair> creatorPersonList) {
			this.creatorPersonList = creatorPersonList;
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

	}
}
