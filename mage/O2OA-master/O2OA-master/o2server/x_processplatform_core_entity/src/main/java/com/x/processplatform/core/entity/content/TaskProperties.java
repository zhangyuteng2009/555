package com.x.processplatform.core.entity.content;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.x.base.core.entity.JsonProperties;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.gson.GsonPropertyObject;

public class TaskProperties extends JsonProperties {

	private static final long serialVersionUID = 5628694071505848771L;

	@FieldDescribe("上一人工环节处理人.")
	private String prevTaskIdentity;

	@FieldDescribe("上一人工环节处理人列表.")
	private List<String> prevTaskIdentityList;

	@FieldDescribe("标题.")
	private String title;

	@FieldDescribe("意见.")
	private String opinion;

	@FieldDescribe("上一人工环节待办对象列表.")
	private List<PrevTask> prevTaskList;

	@FieldDescribe("上一人工环节最近待办对象.")
	private PrevTask prevTask;

	@FieldDescribe("待办计时暂停工作时间时长(分钟).")
	private Date pauseStartTime;

	@FieldDescribe("待办计时暂停工作时间时长(分钟).")
	private Integer pauseWorkTimeMinutes;

	@FieldDescribe("待办计时暂停自然时间时长(分钟).")
	private Integer pauseMinutes;

	public List<String> getPrevTaskIdentityList() {
		if (null == prevTaskIdentityList) {
			this.prevTaskIdentityList = new ArrayList<String>();
		}
		return prevTaskIdentityList;
	}

	public List<PrevTask> getPrevTaskList() {
		if (null == prevTaskList) {
			this.prevTaskList = new ArrayList<PrevTask>();
		}
		return prevTaskList;
	}

	public void setPrevTaskIdentityList(List<String> prevTaskIdentityList) {
		this.prevTaskIdentityList = prevTaskIdentityList;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getOpinion() {
		return opinion;
	}

	public void setOpinion(String opinion) {
		this.opinion = opinion;
	}

	public String getPrevTaskIdentity() {
		return prevTaskIdentity;
	}

	public void setPrevTaskIdentity(String prevTaskIdentity) {
		this.prevTaskIdentity = prevTaskIdentity;
	}

	public static class PrevTask extends GsonPropertyObject {

		private String routeName;
		private String unit;
		private String identity;
		private String person;
		private String opinion;
		private Date startTime;
		private Date completedTime;

		public String getIdentity() {
			return identity;
		}

		public void setIdentity(String identity) {
			this.identity = identity;
		}

		public String getOpinion() {
			return opinion;
		}

		public void setOpinion(String opinion) {
			this.opinion = opinion;
		}

		public String getPerson() {
			return person;
		}

		public void setPerson(String person) {
			this.person = person;
		}

		public Date getStartTime() {
			return startTime;
		}

		public void setStartTime(Date startTime) {
			this.startTime = startTime;
		}

		public Date getCompletedTime() {
			return completedTime;
		}

		public void setCompletedTime(Date completedTime) {
			this.completedTime = completedTime;
		}

		public String getRouteName() {
			return routeName;
		}

		public void setRouteName(String routeName) {
			this.routeName = routeName;
		}

		public String getUnit() {
			return unit;
		}

		public void setUnit(String unit) {
			this.unit = unit;
		}

	}

	public void setPrevTaskList(List<PrevTask> prevTaskList) {
		this.prevTaskList = prevTaskList;
	}

	public PrevTask getPrevTask() {
		return prevTask;
	}

	public void setPrevTask(PrevTask prevTask) {
		this.prevTask = prevTask;
	}

	public Integer getPauseWorkTimeMinutes() {
		return pauseWorkTimeMinutes;
	}

	public void setPauseWorkTimeMinutes(Integer pauseWorkTimeMinutes) {
		this.pauseWorkTimeMinutes = pauseWorkTimeMinutes;
	}

	public Integer getPauseMinutes() {
		return pauseMinutes;
	}

	public void setPauseMinutes(Integer pauseMinutes) {
		this.pauseMinutes = pauseMinutes;
	}

	public Date getPauseStartTime() {
		return pauseStartTime;
	}

	public void setPauseStartTime(Date pauseStartTime) {
		this.pauseStartTime = pauseStartTime;
	}

}