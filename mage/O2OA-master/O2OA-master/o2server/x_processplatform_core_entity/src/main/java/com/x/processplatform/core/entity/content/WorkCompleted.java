package com.x.processplatform.core.entity.content;

import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Lob;
import javax.persistence.PostLoad;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;

import org.apache.commons.lang3.StringUtils;
import org.apache.openjpa.persistence.Persistent;
import org.apache.openjpa.persistence.jdbc.Index;
import org.apache.openjpa.persistence.jdbc.Strategy;

import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.SliceJpaObject;
import com.x.base.core.entity.annotation.CheckPersist;
import com.x.base.core.entity.annotation.ContainerEntity;
import com.x.base.core.entity.annotation.Flag;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.tools.DateTools;
import com.x.base.core.project.tools.StringTools;
import com.x.processplatform.core.entity.PersistenceProperties;

@Entity
@ContainerEntity(dumpSize = 100, type = ContainerEntity.Type.content, reference = ContainerEntity.Reference.strong)
@Table(name = PersistenceProperties.Content.WorkCompleted.table, uniqueConstraints = {
		@UniqueConstraint(name = PersistenceProperties.Content.WorkCompleted.table + JpaObject.IndexNameMiddle
				+ JpaObject.DefaultUniqueConstraintSuffix, columnNames = { JpaObject.IDCOLUMN,
						JpaObject.CREATETIMECOLUMN, JpaObject.UPDATETIMECOLUMN, JpaObject.SEQUENCECOLUMN }) })
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class WorkCompleted extends SliceJpaObject implements ProjectionInterface {

	private static final long serialVersionUID = 8340732901486828267L;
	private static final String TABLE = PersistenceProperties.Content.WorkCompleted.table;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@FieldDescribe("数据库主键,自动生成.")
	@Id
	@Column(length = length_id, name = ColumnNamePrefix + id_FIELDNAME)
	private String id = createId();

	/* 以上为 JpaObject 默认字段 */

	public void onPersist() throws Exception {
		if (StringUtils.isEmpty(this.startTimeMonth) && (null != this.startTime)) {
			this.startTimeMonth = DateTools.format(this.startTime, DateTools.format_yyyyMM);
		}
		if (StringUtils.isEmpty(this.completedTimeMonth) && (null != this.completedTime)) {
			this.completedTimeMonth = DateTools.format(this.completedTime, DateTools.format_yyyyMM);
		}
		if (StringUtils.isEmpty(this.creatorIdentity)) {
			this.creatorIdentity = "";
		}
		if (StringUtils.isEmpty(this.creatorUnit)) {
			this.creatorUnit = "";
		}
		if (StringUtils.isEmpty(this.creatorPerson)) {
			this.creatorPerson = "";
		}
		if (StringUtils.isEmpty(this.creatorUnitLevelName)) {
			this.creatorUnitLevelName = "";
		}
		if (StringTools.utf8Length(this.getProperties().getTitle()) > length_255B) {
			this.title = StringTools.utf8SubString(this.getProperties().getTitle(), length_255B - 3) + "...";
		}
	}

	@PostLoad
	public void postLoad() {
		if ((null != this.properties) && StringUtils.isNotEmpty(this.getProperties().getTitle())) {
			this.title = this.getProperties().getTitle();
		}
	}

	/* 更新运行方法 */

	public WorkCompleted() {
		this.properties = new WorkCompletedProperties();
	}

	/**
	 * 通过Work创建WorkCompleted
	 */
	public WorkCompleted(Work work, Date completedTime, Long duration) {
		this();
		this.job = work.getJob();
		this.setTitle(work.getTitle());
		this.startTime = work.getStartTime();
		this.startTimeMonth = work.getStartTimeMonth();
		this.completedTime = completedTime;
		this.creatorPerson = work.getCreatorPerson();
		this.creatorIdentity = work.getCreatorIdentity();
		this.creatorUnit = work.getCreatorUnit();
		this.creatorUnitLevelName = work.getCreatorUnitLevelName();
		this.application = work.getApplication();
		this.applicationName = work.getApplicationName();
		this.applicationAlias = work.getApplicationAlias();
		this.process = work.getProcess();
		this.processName = work.getProcessName();
		this.processAlias = work.getProcessAlias();
		this.serial = work.getSerial();
		this.form = work.getForm();
//		this.formData = formData;
//		this.formMobileData = formMobileData;
		this.work = work.getId();
		this.expireTime = work.getExpireTime();
		if ((null != expireTime) && (completedTime.after(expireTime))) {
			this.expired = true;
		} else {
			this.expired = false;
		}
		this.duration = duration;
		this.copyProjectionFields(work);
	}

	public WorkCompletedProperties getProperties() {
		if (null == this.properties) {
			this.properties = new WorkCompletedProperties();
		}
		return this.properties;
	}

	public void setProperties(WorkCompletedProperties properties) {
		this.properties = properties;
	}

	public void setTitle(String title) {
		this.title = title;
		this.getProperties().setTitle(title);
	}

	public String getTitle() {
		if ((null != this.properties) && StringUtils.isNotEmpty(this.properties.getTitle())) {
			return this.properties.getTitle();
		} else {
			return this.title;
		}
	}

	public static final String job_FIELDNAME = "job";
	@FieldDescribe("工作")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + job_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + job_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String job;

	public static final String title_FIELDNAME = "title";
	@FieldDescribe("标题")
	@Column(length = length_255B, name = ColumnNamePrefix + title_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + title_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String title;

	public static final String startTime_FIELDNAME = "startTime";
	@FieldDescribe("工作开始时间")
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = ColumnNamePrefix + startTime_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + startTime_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private Date startTime;

	public static final String startTimeMonth_FIELDNAME = "startTimeMonth";
	@FieldDescribe("用于在Filter中分类使用.")
	@Column(length = JpaObject.length_16B, name = ColumnNamePrefix + startTimeMonth_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + startTimeMonth_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String startTimeMonth;

	public static final String completedTime_FIELDNAME = "completedTime";
	@FieldDescribe("工作开始时间")
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = ColumnNamePrefix + completedTime_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + completedTime_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private Date completedTime;

	public static final String completedTimeMonth_FIELDNAME = "completedTimeMonth";
	@FieldDescribe("用于在Filter中分类使用.由于是自动计算所以允许空")
	@Column(length = JpaObject.length_16B, name = ColumnNamePrefix + completedTimeMonth_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + completedTimeMonth_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String completedTimeMonth;

	public static final String creatorPerson_FIELDNAME = "creatorPerson";
	@FieldDescribe("创建人")
	@Column(length = length_255B, name = ColumnNamePrefix + creatorPerson_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + creatorPerson_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String creatorPerson;

	public static final String creatorIdentity_FIELDNAME = "creatorIdentity";
	@FieldDescribe("创建人Identity")
	@Column(length = length_255B, name = ColumnNamePrefix + creatorIdentity_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + creatorIdentity_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String creatorIdentity;

	public static final String creatorUnit_FIELDNAME = "creatorUnit";
	@FieldDescribe("创建人组织")
	@Column(length = length_255B, name = ColumnNamePrefix + creatorUnit_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + creatorUnit_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String creatorUnit;

	public static final String creatorUnitLevelName_FIELDNAME = "creatorUnitLevelName";
	@FieldDescribe("创建人组织层级名.")
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@CheckPersist(allowEmpty = true)
	@Column(length = JpaObject.length_2K, name = ColumnNamePrefix + creatorUnitLevelName_FIELDNAME)
	private String creatorUnitLevelName;

	public static final String application_FIELDNAME = "application";
	@FieldDescribe("应用ID")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + application_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + application_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String application;

	public static final String applicationName_FIELDNAME = "applicationName";
	@FieldDescribe("应用名称.")
	@Column(length = length_255B, name = ColumnNamePrefix + applicationName_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + applicationName_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String applicationName;

	public static final String applicationAlias_FIELDNAME = "applicationAlias";
	@FieldDescribe("应用别名.")
	@Column(length = length_255B, name = ColumnNamePrefix + applicationAlias_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String applicationAlias;

	public static final String process_FIELDNAME = "process";
	@FieldDescribe("流程ID")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + process_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + process_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String process;

	public static final String processName_FIELDNAME = "processName";
	@FieldDescribe("流程名称")
	@Column(length = length_255B, name = ColumnNamePrefix + processName_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + processName_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String processName;

	public static final String processAlias_FIELDNAME = "processAlias";
	@FieldDescribe("流程别名.")
	@Column(length = length_255B, name = ColumnNamePrefix + processAlias_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String processAlias;

	public static final String serial_FIELDNAME = "serial";
	@FieldDescribe("编号")
	@Column(length = JpaObject.length_128B, name = ColumnNamePrefix + serial_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + serial_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String serial;

	public static final String form_FIELDNAME = "form";
	@FieldDescribe("使用表单ID")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + form_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + form_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String form;

//	public static final String formData_FIELDNAME = "formData";
//	@FieldDescribe("文本内容.")
//	@Lob
//	@Basic(fetch = FetchType.EAGER)
//	@Column(length = JpaObject.length_10M, name = ColumnNamePrefix + formData_FIELDNAME)
//	@CheckPersist(allowEmpty = true)
//	private String formData;

//	public static final String formMobileData_FIELDNAME = "formMobileData";
//	@FieldDescribe("移动端文本内容.")
//	@Lob
//	@Basic(fetch = FetchType.EAGER)
//	@Column(length = JpaObject.length_10M, name = ColumnNamePrefix + formMobileData_FIELDNAME)
//	@CheckPersist(allowEmpty = true)
//	private String formMobileData;

	public static final String work_FIELDNAME = "work";
	@Flag
	@FieldDescribe("Work Id.")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + work_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + work_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String work;

	public static final String expireTime_FIELDNAME = "expireTime";
	@FieldDescribe("任务截止时间.")
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = ColumnNamePrefix + expireTime_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + expireTime_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date expireTime;

	public static final String expired_FIELDNAME = "expired";
	@FieldDescribe("是否超时.")
	@Column(name = ColumnNamePrefix + expired_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + expired_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private Boolean expired;

	public static final String duration_FIELDNAME = "duration";
	@FieldDescribe("工作时长(分钟数).")
	@Column(name = ColumnNamePrefix + duration_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private Long duration;

	public static final String allowRollback_FIELDNAME = "allowRollback";
	@FieldDescribe("完成后是否允许回滚.")
	@Column(name = ColumnNamePrefix + allowRollback_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + allowRollback_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Boolean allowRollback;

	public static final String activity_FIELDNAME = "activity";
	@FieldDescribe("结束节点的活动id.")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + activity_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + activity_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String activity;

	public static final String activityName_FIELDNAME = "activityName";
	@FieldDescribe("结束节点的活动名称.")
	@Column(length = length_255B, name = ColumnNamePrefix + activityName_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + activityName_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String activityName;

	public static final String activityAlias_FIELDNAME = "activityAlias";
	@FieldDescribe("结束节点的活动别名.")
	@Column(length = length_255B, name = ColumnNamePrefix + activityAlias_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + activityAlias_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String activityAlias;

	public static final String activityDescription_FIELDNAME = "activityDescription";
	@FieldDescribe("结束节点的活动说明.")
	@Column(length = length_255B, name = ColumnNamePrefix + activityDescription_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + activityDescription_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String activityDescription;

	public static final String properties_FIELDNAME = "properties";
	@FieldDescribe("属性对象存储字段.")
	@Persistent
	@Strategy(JsonPropertiesValueHandler)
	@Column(length = JpaObject.length_10M, name = ColumnNamePrefix + properties_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private WorkCompletedProperties properties;

	public static final String merged_FIELDNAME = "merged";
	@FieldDescribe("合并数据")
	@Column(name = ColumnNamePrefix + merged_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + merged_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Boolean merged;

	public static final String stringValue01_FIELDNAME = "stringValue01";
	@FieldDescribe("业务数据String值01.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue01_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue01_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue01;

	public static final String stringValue02_FIELDNAME = "stringValue02";
	@FieldDescribe("业务数据String值02.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue02_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue02_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue02;

	public static final String stringValue03_FIELDNAME = "stringValue03";
	@FieldDescribe("业务数据String值03.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue03_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue03_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue03;

	public static final String stringValue04_FIELDNAME = "stringValue04";
	@FieldDescribe("业务数据String值04.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue04_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue04_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue04;

	public static final String stringValue05_FIELDNAME = "stringValue05";
	@FieldDescribe("业务数据String值05.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue05_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue05_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue05;

	public static final String stringValue06_FIELDNAME = "stringValue06";
	@FieldDescribe("业务数据String值06.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue06_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue06_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue06;

	public static final String stringValue07_FIELDNAME = "stringValue07";
	@FieldDescribe("业务数据String值07.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue07_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue07_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue07;

	public static final String stringValue08_FIELDNAME = "stringValue08";
	@FieldDescribe("业务数据String值08.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue08_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue08_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue08;

	public static final String stringValue09_FIELDNAME = "stringValue09";
	@FieldDescribe("业务数据String值09.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue09_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue09_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue09;

	public static final String stringValue10_FIELDNAME = "stringValue10";
	@FieldDescribe("业务数据String值10.")
	@Column(length = length_255B, name = ColumnNamePrefix + stringValue10_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + stringValue10_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String stringValue10;

	public static final String booleanValue01_FIELDNAME = "booleanValue01";
	@FieldDescribe("业务数据Boolean值01.")
	@Column(name = ColumnNamePrefix + booleanValue01_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + booleanValue01_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Boolean booleanValue01;

	public static final String booleanValue02_FIELDNAME = "booleanValue02";
	@FieldDescribe("业务数据Boolean值02.")
	@Column(name = ColumnNamePrefix + booleanValue02_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + booleanValue02_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Boolean booleanValue02;

	public static final String doubleValue01_FIELDNAME = "doubleValue01";
	@FieldDescribe("业务数据Double值01.")
	@Column(name = ColumnNamePrefix + doubleValue01_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + doubleValue01_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Double doubleValue01;

	public static final String doubleValue02_FIELDNAME = "doubleValue02";
	@FieldDescribe("业务数据Double值02.")
	@Column(name = ColumnNamePrefix + doubleValue02_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + doubleValue02_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Double doubleValue02;

	public static final String doubleValue03_FIELDNAME = "doubleValue03";
	@FieldDescribe("业务数据Double值03.")
	@Column(name = ColumnNamePrefix + doubleValue03_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + doubleValue03_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Double doubleValue03;

	public static final String doubleValue04_FIELDNAME = "doubleValue04";
	@FieldDescribe("业务数据Double值04.")
	@Column(name = ColumnNamePrefix + doubleValue04_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + doubleValue04_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Double doubleValue04;

	public static final String doubleValue05_FIELDNAME = "doubleValue05";
	@FieldDescribe("业务数据Double值05.")
	@Column(name = ColumnNamePrefix + doubleValue05_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + doubleValue05_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Double doubleValue05;

	public static final String longValue01_FIELDNAME = "longValue01";
	@FieldDescribe("业务数据Long值01.")
	@Column(name = ColumnNamePrefix + longValue01_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + longValue01_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Long longValue01;

	public static final String longValue02_FIELDNAME = "longValue02";
	@FieldDescribe("业务数据Long值02.")
	@Column(name = ColumnNamePrefix + longValue02_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + longValue02_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Long longValue02;

	public static final String longValue03_FIELDNAME = "longValue03";
	@FieldDescribe("业务数据Long值03.")
	@Column(name = ColumnNamePrefix + longValue03_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + longValue03_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Long longValue03;

	public static final String longValue04_FIELDNAME = "longValue04";
	@FieldDescribe("业务数据Long值04.")
	@Column(name = ColumnNamePrefix + longValue04_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + longValue04_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Long longValue04;

	public static final String longValue05_FIELDNAME = "longValue05";
	@FieldDescribe("业务数据Long值05.")
	@Column(name = ColumnNamePrefix + longValue05_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + longValue05_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Long longValue05;

	public static final String dateTimeValue01_FIELDNAME = "dateTimeValue01";
	@Temporal(TemporalType.TIMESTAMP)
	@FieldDescribe("业务数据DateTime值01.")
	@Column(name = ColumnNamePrefix + dateTimeValue01_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + dateTimeValue01_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date dateTimeValue01;

	public static final String dateTimeValue02_FIELDNAME = "dateTimeValue02";
	@Temporal(TemporalType.TIMESTAMP)
	@FieldDescribe("业务数据DateTime值02.")
	@Column(name = ColumnNamePrefix + dateTimeValue02_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + dateTimeValue02_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date dateTimeValue02;

	public static final String dateTimeValue03_FIELDNAME = "dateTimeValue03";
	@Temporal(TemporalType.TIMESTAMP)
	@FieldDescribe("业务数据DateTime值03.")
	@Column(name = ColumnNamePrefix + dateTimeValue03_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + dateTimeValue03_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date dateTimeValue03;

	public static final String dateTimeValue04_FIELDNAME = "dateTimeValue04";
	@Temporal(TemporalType.TIMESTAMP)
	@FieldDescribe("业务数据DateTime值04.")
	@Column(name = ColumnNamePrefix + dateTimeValue04_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + dateTimeValue04_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date dateTimeValue04;

	public static final String dateTimeValue05_FIELDNAME = "dateTimeValue05";
	@Temporal(TemporalType.TIMESTAMP)
	@FieldDescribe("业务数据DateTime值05.")
	@Column(name = ColumnNamePrefix + dateTimeValue05_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + dateTimeValue05_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date dateTimeValue05;

	public static final String dateValue01_FIELDNAME = "dateValue01";
	@Temporal(TemporalType.DATE)
	@FieldDescribe("业务数据Date值01.")
	@Column(name = ColumnNamePrefix + dateValue01_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + dateValue01_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date dateValue01;

	public static final String dateValue02_FIELDNAME = "dateValue02";
	@Temporal(TemporalType.DATE)
	@FieldDescribe("业务数据Date值02.")
	@Column(name = ColumnNamePrefix + dateValue02_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + dateValue02_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date dateValue02;

	public static final String timeValue01_FIELDNAME = "timeValue01";
	@Temporal(TemporalType.TIME)
	@FieldDescribe("业务数据Time值01.")
	@Column(name = ColumnNamePrefix + timeValue01_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + timeValue01_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date timeValue01;

	public static final String timeValue02_FIELDNAME = "timeValue02";
	@Temporal(TemporalType.TIME)
	@FieldDescribe("业务数据Time值02.")
	@Column(name = ColumnNamePrefix + timeValue02_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + timeValue02_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private Date timeValue02;

	public String getJob() {
		return job;
	}

	public void setJob(String job) {
		this.job = job;
	}

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public String getCreatorPerson() {
		return creatorPerson;
	}

	public void setCreatorPerson(String creatorPerson) {
		this.creatorPerson = creatorPerson;
	}

	public String getCreatorIdentity() {
		return creatorIdentity;
	}

	public void setCreatorIdentity(String creatorIdentity) {
		this.creatorIdentity = creatorIdentity;
	}

	public String getCreatorUnit() {
		return creatorUnit;
	}

	public void setCreatorUnit(String creatorUnit) {
		this.creatorUnit = creatorUnit;
	}

	public String getApplication() {
		return application;
	}

	public void setApplication(String application) {
		this.application = application;
	}

	public String getApplicationName() {
		return applicationName;
	}

	public void setApplicationName(String applicationName) {
		this.applicationName = applicationName;
	}

	public String getProcess() {
		return process;
	}

	public void setProcess(String process) {
		this.process = process;
	}

	public String getProcessName() {
		return processName;
	}

	public void setProcessName(String processName) {
		this.processName = processName;
	}

	public Date getCompletedTime() {
		return completedTime;
	}

	public void setCompletedTime(Date completedTime) {
		this.completedTime = completedTime;
	}

	public String getWork() {
		return work;
	}

	public void setWork(String work) {
		this.work = work;
	}

	public String getForm() {
		return form;
	}

	public void setForm(String form) {
		this.form = form;
	}

	public String getStartTimeMonth() {
		return startTimeMonth;
	}

	public void setStartTimeMonth(String startTimeMonth) {
		this.startTimeMonth = startTimeMonth;
	}

	public String getCompletedTimeMonth() {
		return completedTimeMonth;
	}

	public void setCompletedTimeMonth(String completedTimeMonth) {
		this.completedTimeMonth = completedTimeMonth;
	}

//	public String getFormData() {
//		return formData;
//	}
//
//	public void setFormData(String formData) {
//		this.formData = formData;
//	}
//
//	public String getFormMobileData() {
//		return formMobileData;
//	}
//
//	public void setFormMobileData(String formMobileData) {
//		this.formMobileData = formMobileData;
//	}

	public Long getDuration() {
		return duration;
	}

	public void setDuration(Long duration) {
		this.duration = duration;
	}

	public String getSerial() {
		return serial;
	}

	public void setSerial(String serial) {
		this.serial = serial;
	}

	public String getApplicationAlias() {
		return applicationAlias;
	}

	public void setApplicationAlias(String applicationAlias) {
		this.applicationAlias = applicationAlias;
	}

	public String getProcessAlias() {
		return processAlias;
	}

	public void setProcessAlias(String processAlias) {
		this.processAlias = processAlias;
	}

	public Date getExpireTime() {
		return expireTime;
	}

	public void setExpireTime(Date expireTime) {
		this.expireTime = expireTime;
	}

	public Boolean getExpired() {
		return expired;
	}

	public void setExpired(Boolean expired) {
		this.expired = expired;
	}

	public String getCreatorUnitLevelName() {
		return creatorUnitLevelName;
	}

	public void setCreatorUnitLevelName(String creatorUnitLevelName) {
		this.creatorUnitLevelName = creatorUnitLevelName;
	}

	public Boolean getAllowRollback() {
		return allowRollback;
	}

	public void setAllowRollback(Boolean allowRollback) {
		this.allowRollback = allowRollback;
	}

	public String getStringValue01() {
		return stringValue01;
	}

	public void setStringValue01(String stringValue01) {
		this.stringValue01 = stringValue01;
	}

	public String getStringValue02() {
		return stringValue02;
	}

	public void setStringValue02(String stringValue02) {
		this.stringValue02 = stringValue02;
	}

	public String getStringValue03() {
		return stringValue03;
	}

	public void setStringValue03(String stringValue03) {
		this.stringValue03 = stringValue03;
	}

	public String getStringValue04() {
		return stringValue04;
	}

	public void setStringValue04(String stringValue04) {
		this.stringValue04 = stringValue04;
	}

	public String getStringValue05() {
		return stringValue05;
	}

	public void setStringValue05(String stringValue05) {
		this.stringValue05 = stringValue05;
	}

	public Boolean getBooleanValue01() {
		return booleanValue01;
	}

	public void setBooleanValue01(Boolean booleanValue01) {
		this.booleanValue01 = booleanValue01;
	}

	public Double getDoubleValue01() {
		return doubleValue01;
	}

	public void setDoubleValue01(Double doubleValue01) {
		this.doubleValue01 = doubleValue01;
	}

	public Long getLongValue01() {
		return longValue01;
	}

	public void setLongValue01(Long longValue01) {
		this.longValue01 = longValue01;
	}

	public Date getDateTimeValue01() {
		return dateTimeValue01;
	}

	public void setDateTimeValue01(Date dateTimeValue01) {
		this.dateTimeValue01 = dateTimeValue01;
	}

	public Date getDateValue01() {
		return dateValue01;
	}

	public void setDateValue01(Date dateValue01) {
		this.dateValue01 = dateValue01;
	}

	public Date getTimeValue01() {
		return timeValue01;
	}

	public void setTimeValue01(Date timeValue01) {
		this.timeValue01 = timeValue01;
	}

	public String getStringValue06() {
		return stringValue06;
	}

	public void setStringValue06(String stringValue06) {
		this.stringValue06 = stringValue06;
	}

	public String getStringValue07() {
		return stringValue07;
	}

	public void setStringValue07(String stringValue07) {
		this.stringValue07 = stringValue07;
	}

	public String getStringValue08() {
		return stringValue08;
	}

	public void setStringValue08(String stringValue08) {
		this.stringValue08 = stringValue08;
	}

	public String getStringValue09() {
		return stringValue09;
	}

	public void setStringValue09(String stringValue09) {
		this.stringValue09 = stringValue09;
	}

	public String getStringValue10() {
		return stringValue10;
	}

	public void setStringValue10(String stringValue10) {
		this.stringValue10 = stringValue10;
	}

	public Double getDoubleValue03() {
		return doubleValue03;
	}

	public void setDoubleValue03(Double doubleValue03) {
		this.doubleValue03 = doubleValue03;
	}

	public Double getDoubleValue04() {
		return doubleValue04;
	}

	public void setDoubleValue04(Double doubleValue04) {
		this.doubleValue04 = doubleValue04;
	}

	public Double getDoubleValue05() {
		return doubleValue05;
	}

	public void setDoubleValue05(Double doubleValue05) {
		this.doubleValue05 = doubleValue05;
	}

	public Long getLongValue03() {
		return longValue03;
	}

	public void setLongValue03(Long longValue03) {
		this.longValue03 = longValue03;
	}

	public Long getLongValue04() {
		return longValue04;
	}

	public void setLongValue04(Long longValue04) {
		this.longValue04 = longValue04;
	}

	public Long getLongValue05() {
		return longValue05;
	}

	public void setLongValue05(Long longValue05) {
		this.longValue05 = longValue05;
	}

	public Date getDateTimeValue03() {
		return dateTimeValue03;
	}

	public void setDateTimeValue03(Date dateTimeValue03) {
		this.dateTimeValue03 = dateTimeValue03;
	}

	public Date getDateTimeValue04() {
		return dateTimeValue04;
	}

	public void setDateTimeValue04(Date dateTimeValue04) {
		this.dateTimeValue04 = dateTimeValue04;
	}

	public Date getDateTimeValue05() {
		return dateTimeValue05;
	}

	public void setDateTimeValue05(Date dateTimeValue05) {
		this.dateTimeValue05 = dateTimeValue05;
	}

	public Boolean getBooleanValue02() {
		return booleanValue02;
	}

	public void setBooleanValue02(Boolean booleanValue02) {
		this.booleanValue02 = booleanValue02;
	}

	public Double getDoubleValue02() {
		return doubleValue02;
	}

	public void setDoubleValue02(Double doubleValue02) {
		this.doubleValue02 = doubleValue02;
	}

	public Long getLongValue02() {
		return longValue02;
	}

	public void setLongValue02(Long longValue02) {
		this.longValue02 = longValue02;
	}

	public Date getDateTimeValue02() {
		return dateTimeValue02;
	}

	public void setDateTimeValue02(Date dateTimeValue02) {
		this.dateTimeValue02 = dateTimeValue02;
	}

	public Date getDateValue02() {
		return dateValue02;
	}

	public void setDateValue02(Date dateValue02) {
		this.dateValue02 = dateValue02;
	}

	public Date getTimeValue02() {
		return timeValue02;
	}

	public void setTimeValue02(Date timeValue02) {
		this.timeValue02 = timeValue02;
	}

	public Boolean getMerged() {
		return merged;
	}

	public void setMerged(Boolean merged) {
		this.merged = merged;
	}

	public String getActivity() {
		return activity;
	}

	public void setActivity(String activity) {
		this.activity = activity;
	}

	public String getActivityName() {
		return activityName;
	}

	public void setActivityName(String activityName) {
		this.activityName = activityName;
	}

	public String getActivityAlias() {
		return activityAlias;
	}

	public void setActivityAlias(String activityAlias) {
		this.activityAlias = activityAlias;
	}

	public String getActivityDescription() {
		return activityDescription;
	}

	public void setActivityDescription(String activityDescription) {
		this.activityDescription = activityDescription;
	}

}