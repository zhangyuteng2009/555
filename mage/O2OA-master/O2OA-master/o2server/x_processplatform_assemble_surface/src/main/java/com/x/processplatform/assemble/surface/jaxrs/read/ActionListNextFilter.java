package com.x.processplatform.assemble.surface.jaxrs.read;

import java.util.List;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.processplatform.assemble.surface.Business;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.EqualsTerms;
import com.x.base.core.project.jaxrs.InTerms;
import com.x.base.core.project.jaxrs.LikeTerms;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Read;

class ActionListNextFilter extends BaseAction {

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, String id, Integer count, JsonElement jsonElement)
			throws Exception {
		ActionResult<List<Wo>> result = new ActionResult<>();
		Business business = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			business = new Business(emc);
		}
		Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
		EqualsTerms equals = new EqualsTerms();
		InTerms ins = new InTerms();
		LikeTerms likes = new LikeTerms();
		equals.put(Read.person_FIELDNAME, effectivePerson.getDistinguishedName());
		if (ListTools.isNotEmpty(wi.getApplicationList())) {
			ins.put(Read.application_FIELDNAME, wi.getApplicationList());
		}
		if (ListTools.isNotEmpty(wi.getProcessList())) {
			if(BooleanUtils.isFalse(wi.getRelateEditionProcess())) {
				ins.put(Read.process_FIELDNAME, wi.getProcessList());
			}else{
				ins.put(Read.process_FIELDNAME, business.process().listEditionProcess(wi.getProcessList()));
			}
		}
		if (ListTools.isNotEmpty(wi.getCreatorUnitList())) {
			ins.put(Read.creatorUnit_FIELDNAME, wi.getCreatorUnitList());
		}
		if (ListTools.isNotEmpty(wi.getStartTimeMonthList())) {
			ins.put(Read.startTimeMonth_FIELDNAME, wi.getStartTimeMonthList());
		}
		if (ListTools.isNotEmpty(wi.getActivityNameList())) {
			ins.put(Read.activityName_FIELDNAME, wi.getActivityNameList());
		}
		if (StringUtils.isNotEmpty(wi.getKey())) {
			String key = StringUtils.trim(StringUtils.replace(wi.getKey(), "\u3000", " "));
			if (StringUtils.isNotEmpty(key)) {
				likes.put(Read.title_FIELDNAME, key);
				likes.put(Read.opinion_FIELDNAME, key);
				likes.put(Read.serial_FIELDNAME, key);
				likes.put(Read.creatorPerson_FIELDNAME, key);
				likes.put(Read.creatorUnit_FIELDNAME, key);
			}
		}
		result = this.standardListNext(Wo.copier, id, count, Read.sequence_FIELDNAME, equals, null, likes, ins, null,
				null, null, null, true, DESC);
		return result;
	}

	public class Wi extends GsonPropertyObject {

		@FieldDescribe("应用")
		private List<String> applicationList;

		@FieldDescribe("流程")
		private List<String> processList;

		@FieldDescribe("是否查找同版本流程数据：true(默认查找)|false")
		private Boolean relateEditionProcess = true;

		@FieldDescribe("创建组织")
		private List<String> creatorUnitList;

		@FieldDescribe("到达时间")
		private List<String> startTimeMonthList;

		@FieldDescribe("活动名称")
		private List<String> activityNameList;

		@FieldDescribe("关键字")
		private String key;

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

		public Boolean getRelateEditionProcess() {
			return relateEditionProcess;
		}

		public void setRelateEditionProcess(Boolean relateEditionProcess) {
			this.relateEditionProcess = relateEditionProcess;
		}

		public List<String> getActivityNameList() {
			return activityNameList;
		}

		public void setActivityNameList(List<String> activityNameList) {
			this.activityNameList = activityNameList;
		}

		public String getKey() {
			return key;
		}

		public void setKey(String key) {
			this.key = key;
		}

		public List<String> getCreatorUnitList() {
			return creatorUnitList;
		}

		public void setCreatorUnitList(List<String> creatorUnitList) {
			this.creatorUnitList = creatorUnitList;
		}

		public List<String> getStartTimeMonthList() {
			return startTimeMonthList;
		}

		public void setStartTimeMonthList(List<String> startTimeMonthList) {
			this.startTimeMonthList = startTimeMonthList;
		}

	}

	public static class Wo extends Read {

		private static final long serialVersionUID = 2279846765261247910L;

		static WrapCopier<Read, Wo> copier = WrapCopierFactory.wo(Read.class, Wo.class, null,
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
