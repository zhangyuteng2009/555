package com.x.query.core.entity.schema;

import java.util.Date;
import java.util.List;
import java.util.Objects;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Lob;
import javax.persistence.OrderColumn;
import javax.persistence.UniqueConstraint;

import org.apache.openjpa.persistence.PersistentCollection;
import org.apache.openjpa.persistence.jdbc.ContainerTable;
import org.apache.openjpa.persistence.jdbc.ElementColumn;
import org.apache.openjpa.persistence.jdbc.ElementIndex;
import org.apache.openjpa.persistence.jdbc.Index;

import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.SliceJpaObject;
import com.x.base.core.entity.annotation.CheckPersist;
import com.x.base.core.entity.annotation.CitationExist;
import com.x.base.core.entity.annotation.ContainerEntity;
import com.x.base.core.entity.annotation.Flag;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.query.core.entity.PersistenceProperties;
import com.x.query.core.entity.Query;

@Entity
@ContainerEntity(dumpSize = 1000, type = ContainerEntity.Type.content, reference = ContainerEntity.Reference.strong)
@javax.persistence.Table(name = PersistenceProperties.Schema.Statement.table, uniqueConstraints = {
		@UniqueConstraint(name = PersistenceProperties.Schema.Statement.table + JpaObject.IndexNameMiddle
				+ JpaObject.DefaultUniqueConstraintSuffix, columnNames = { JpaObject.IDCOLUMN,
						JpaObject.CREATETIMECOLUMN, JpaObject.UPDATETIMECOLUMN, JpaObject.SEQUENCECOLUMN }) })
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class Statement extends SliceJpaObject {

	private static final long serialVersionUID = -5610293696763235753L;

	private static final String TABLE = PersistenceProperties.Schema.Statement.table;

	public static final String TYPE_SELECT = "select";
	public static final String TYPE_DELETE = "delete";
	public static final String TYPE_UPDATE = "update";
	public static final String TYPE_INSERT = "insert";

	public static final String MODE_DATA = "data";
	public static final String MODE_COUNT = "count";

	public static final String FORMAT_JPQL = "jpql";
	public static final String FORMAT_SCRIPT = "script";

	public static final String ENTITYCATEGORY_DYNAMIC = "dynamic";
	public static final String ENTITYCATEGORY_OFFICIAL = "official";
	public static final String ENTITYCATEGORY_CUSTOM = "custom";

	@Override
	public String getId() {
		return id;
	}

	@Override
	public void setId(String id) {
		this.id = id;
	}

	@FieldDescribe("数据库主键,自动生成.")
	@Id
	@Column(length = length_id, name = ColumnNamePrefix + id_FIELDNAME)
	private String id = createId();

	/* 以上为 JpaObject 默认字段 */

	@Override
	public void onPersist() throws Exception {

	}

	public String getEntityCategory() {
		return entityCategory;
	}

	public String getFormat() {
		return Objects.toString(this.format, FORMAT_JPQL);
	}

	public static final String name_FIELDNAME = "name";
	@Flag
	@FieldDescribe("语句名称.")
	@Column(length = length_255B, name = ColumnNamePrefix + name_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + name_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String name;

	public static final String alias_FIELDNAME = "alias";
	@Flag
	@FieldDescribe("别名.")
	@Column(length = length_255B, name = ColumnNamePrefix + alias_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + alias_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String alias;

	public static final String format_FIELDNAME = "format";
	@FieldDescribe("格式,jpql或者script.")
	@Column(length = length_32B, name = ColumnNamePrefix + format_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + format_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String format;

	public static final String description_FIELDNAME = "description";
	@FieldDescribe("描述.")
	@Column(length = length_255B, name = ColumnNamePrefix + description_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String description;

	public static final String query_FIELDNAME = "query";
	@FieldDescribe("所属查询.")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + query_FIELDNAME)
	@Index(name = TABLE + ColumnNamePrefix + query_FIELDNAME)
	@CheckPersist(allowEmpty = false, citationExists = { @CitationExist(type = Query.class) })
	private String query;

	public static final String type_FIELDNAME = "type";
	@FieldDescribe("语句类型,insert,delete,update,select")
	@Column(length = length_16B, name = ColumnNamePrefix + type_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + type_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String type;

	public static final String executePersonList_FIELDNAME = "executePersonList";
	@FieldDescribe("可执行的用户.")
	@PersistentCollection(fetch = FetchType.EAGER)
	@ContainerTable(name = TABLE + ContainerTableNameMiddle
			+ executePersonList_FIELDNAME, joinIndex = @Index(name = TABLE + IndexNameMiddle
					+ executePersonList_FIELDNAME + JoinIndexNameSuffix))
	@OrderColumn(name = ORDERCOLUMNCOLUMN)
	@ElementColumn(length = length_255B, name = ColumnNamePrefix + executePersonList_FIELDNAME)
	@ElementIndex(name = TABLE + IndexNameMiddle + executePersonList_FIELDNAME + ElementIndexNameSuffix)
	@CheckPersist(allowEmpty = true)
	private List<String> executePersonList;

	public static final String executeUnitList_FIELDNAME = "executeUnitList";
	@FieldDescribe("可以访问的组织.")
	@PersistentCollection(fetch = FetchType.EAGER)
	@ContainerTable(name = TABLE + ContainerTableNameMiddle + executeUnitList_FIELDNAME, joinIndex = @Index(name = TABLE
			+ IndexNameMiddle + executeUnitList_FIELDNAME + JoinIndexNameSuffix))
	@OrderColumn(name = ORDERCOLUMNCOLUMN)
	@ElementColumn(length = length_255B, name = ColumnNamePrefix + executeUnitList_FIELDNAME)
	@ElementIndex(name = TABLE + IndexNameMiddle + executeUnitList_FIELDNAME + ElementIndexNameSuffix)
	@CheckPersist(allowEmpty = true)
	private List<String> executeUnitList;

	public static final String executeGroupList_FIELDNAME = "executeGroupList";
	@FieldDescribe("可以访问的群组.")
	@PersistentCollection(fetch = FetchType.EAGER)
	@ContainerTable(name = TABLE + ContainerTableNameMiddle + executeGroupList_FIELDNAME, joinIndex = @Index(name = TABLE
			+ IndexNameMiddle + executeGroupList_FIELDNAME + JoinIndexNameSuffix))
	@OrderColumn(name = ORDERCOLUMNCOLUMN)
	@ElementColumn(length = length_255B, name = ColumnNamePrefix + executeGroupList_FIELDNAME)
	@ElementIndex(name = TABLE + IndexNameMiddle + executeGroupList_FIELDNAME + ElementIndexNameSuffix)
	@CheckPersist(allowEmpty = true)
	private List<String> executeGroupList;

	public static final String data_FIELDNAME = "data";
	@FieldDescribe("jpql语句.")
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = JpaObject.length_32K, name = ColumnNamePrefix + data_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String data;

	public static final String scriptText_FIELDNAME = "scriptText";
	@FieldDescribe("类型为script的执行脚本.")
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = JpaObject.length_1M, name = ColumnNamePrefix + scriptText_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String scriptText;

	public static final String countData_FIELDNAME = "countData";
	@FieldDescribe("jpql语句，用于查询总数.")
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = JpaObject.length_32K, name = ColumnNamePrefix + countData_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String countData;

	public static final String countScriptText_FIELDNAME = "countScriptText";
	@FieldDescribe("类型为script的执行脚本，用于查询总数.")
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = JpaObject.length_1M, name = ColumnNamePrefix + countScriptText_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String countScriptText;

	public static final String view_FIELDNAME = "view";
	@FieldDescribe("展现视图.")
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = JpaObject.length_10M, name = ColumnNamePrefix + view_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String view;

	public static final String creatorPerson_FIELDNAME = "creatorPerson";
	@FieldDescribe("创建者")
	@CheckPersist(allowEmpty = false)
	@Column(length = length_255B, name = ColumnNamePrefix + creatorPerson_FIELDNAME)
	private String creatorPerson;

	public static final String lastUpdateTime_FIELDNAME = "lastUpdateTime";
	@FieldDescribe("最后修改时间")
	@CheckPersist(allowEmpty = false)
	@Column(name = ColumnNamePrefix + lastUpdateTime_FIELDNAME)
	private Date lastUpdateTime;

	public static final String lastUpdatePerson_FIELDNAME = "lastUpdatePerson";
	@FieldDescribe("最后修改者")
	@CheckPersist(allowEmpty = false)
	@Column(length = length_255B, name = ColumnNamePrefix + lastUpdatePerson_FIELDNAME)
	private String lastUpdatePerson;

	public static final String table_FIELDNAME = "table";
	@FieldDescribe("执行的表")
	@Column(length = length_id, name = ColumnNamePrefix + table_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + table_FIELDNAME)
	@CheckPersist(allowEmpty = true, citationExists = { @CitationExist(type = Table.class) })
	private String table;

	public static final String entityClassName_FIELDNAME = "entityClassName";
	@FieldDescribe("custom,official时使用的类名.")
	@CheckPersist(allowEmpty = true)
	@Column(length = length_255B, name = ColumnNamePrefix + entityClassName_FIELDNAME)
	private String entityClassName;

	public static final String entityCategory_FIELDNAME = "entityCategory";
	@FieldDescribe("表类型,official,dynamic,custom")
	@Column(length = length_16B, name = ColumnNamePrefix + entityCategory_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String entityCategory;

	public static final String testParameters_FIELDNAME = "testParameters";
	@FieldDescribe("测试参数（json格式文本）.")
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = JpaObject.length_4K, name = ColumnNamePrefix + testParameters_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String testParameters;

	public static final String anonymousAccessible_FIELDNAME = "anonymousAccessible";
	@FieldDescribe("是否允许匿名访问（boolean类型）")
	@CheckPersist(allowEmpty = true)
	@Column(name = ColumnNamePrefix + anonymousAccessible_FIELDNAME)
	private Boolean anonymousAccessible;

	public static final String display_FIELDNAME = "display";
	@FieldDescribe("是否前端可见.")
	@Column(name = ColumnNamePrefix + display_FIELDNAME)
	private Boolean display;

	public static final String orderNumber_FIELDNAME = "orderNumber";
	@FieldDescribe("排序号,为空在最后")
	@Column(name = ColumnNamePrefix + orderNumber_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + orderNumber_FIELDNAME)
	private Integer orderNumber;

	public void setEntityCategory(String entityCategory) {
		this.entityCategory = entityCategory;
	}

	public String getName() {
		return name;
	}

	public void setFormat(String format) {
		this.format = format;
	}

	public String getScriptText() {
		return scriptText;
	}

	public void setScriptText(String scriptText) {
		this.scriptText = scriptText;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public String getCreatorPerson() {
		return creatorPerson;
	}

	public String getEntityClassName() {
		return entityClassName;
	}

	public void setEntityClassName(String entityClassName) {
		this.entityClassName = entityClassName;
	}

	public void setCreatorPerson(String creatorPerson) {
		this.creatorPerson = creatorPerson;
	}

	public Date getLastUpdateTime() {
		return lastUpdateTime;
	}

	public void setLastUpdateTime(Date lastUpdateTime) {
		this.lastUpdateTime = lastUpdateTime;
	}

	public String getLastUpdatePerson() {
		return lastUpdatePerson;
	}

	public void setLastUpdatePerson(String lastUpdatePerson) {
		this.lastUpdatePerson = lastUpdatePerson;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public List<String> getExecutePersonList() {
		return executePersonList;
	}

	public void setExecutePersonList(List<String> executePersonList) {
		this.executePersonList = executePersonList;
	}

	public List<String> getExecuteUnitList() {
		return executeUnitList;
	}

	public void setExecuteUnitList(List<String> executeUnitList) {
		this.executeUnitList = executeUnitList;
	}

	public String getTable() {
		return table;
	}

	public void setTable(String table) {
		this.table = table;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	public String getCountData() {
		return countData;
	}

	public void setCountData(String countData) {
		this.countData = countData;
	}

	public String getCountScriptText() {
		return countScriptText;
	}

	public void setCountScriptText(String countScriptText) {
		this.countScriptText = countScriptText;
	}

	public String getView() {
		return view;
	}

	public void setView(String view) {
		this.view = view;
	}

	public String getTestParameters() {
		return testParameters;
	}

	public void setTestParameters(String testParameters) {
		this.testParameters = testParameters;
	}

	public Boolean getAnonymousAccessible() {
		return anonymousAccessible;
	}

	public void setAnonymousAccessible(Boolean anonymousAccessible) {
		this.anonymousAccessible = anonymousAccessible;
	}

	public Boolean getDisplay() {
		return display;
	}

	public void setDisplay(Boolean display) {
		this.display = display;
	}

	public Integer getOrderNumber() {
		return orderNumber;
	}

	public void setOrderNumber(Integer orderNumber) {
		this.orderNumber = orderNumber;
	}

	public List<String> getExecuteGroupList() {
		return executeGroupList;
	}

	public void setExecuteGroupList(List<String> executeGroupList) {
		this.executeGroupList = executeGroupList;
	}
}
