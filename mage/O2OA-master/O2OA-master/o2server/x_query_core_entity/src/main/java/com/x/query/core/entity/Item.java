package com.x.query.core.entity;

import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersist;
import com.x.base.core.entity.annotation.ContainerEntity;
import com.x.base.core.entity.dataitem.DataItem;
import com.x.base.core.entity.dataitem.ItemCategory;
import com.x.base.core.entity.dataitem.ItemPrimitiveType;
import com.x.base.core.entity.dataitem.ItemStringValueType;
import com.x.base.core.entity.dataitem.ItemType;
import com.x.base.core.project.annotation.FieldDescribe;

@Entity
@ContainerEntity(dumpSize = 500, type = ContainerEntity.Type.content, reference = ContainerEntity.Reference.strong)
@Table(name = PersistenceProperties.Item.table, uniqueConstraints = {
		@UniqueConstraint(name = PersistenceProperties.Item.table + JpaObject.IndexNameMiddle
				+ JpaObject.DefaultUniqueConstraintSuffix, columnNames = { JpaObject.IDCOLUMN,
						JpaObject.CREATETIMECOLUMN, JpaObject.UPDATETIMECOLUMN, JpaObject.SEQUENCECOLUMN }) },
		indexes = {
				@javax.persistence.Index(name = Item.TABLE + Item.IndexNameMiddle + Item.bundle_FIELDNAME,
						columnList = Item.ColumnNamePrefix + Item.bundle_FIELDNAME+","+
								Item.ColumnNamePrefix + Item.path0_FIELDNAME+","+
						Item.ColumnNamePrefix + Item.path1_FIELDNAME+","+Item.ColumnNamePrefix + Item.path2_FIELDNAME+","+
						Item.ColumnNamePrefix + Item.path3_FIELDNAME),
				@javax.persistence.Index(name = Item.TABLE + Item.IndexNameMiddle + Item.stringShortValue_FIELDNAME,
						columnList = Item.ColumnNamePrefix + Item.bundle_FIELDNAME+","+
								Item.ColumnNamePrefix + Item.stringShortValue_FIELDNAME+","+
								Item.ColumnNamePrefix + Item.path0_FIELDNAME+","+
								Item.ColumnNamePrefix + Item.path1_FIELDNAME+","+Item.ColumnNamePrefix + Item.path2_FIELDNAME+","+
								Item.ColumnNamePrefix + Item.path3_FIELDNAME)}
)
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class Item extends DataItem {

	private static final long serialVersionUID = 7182248599724230391L;
	public static final String TABLE = PersistenceProperties.Item.table;

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
		this.path0 = StringUtils.trimToEmpty(this.path0);
		this.path1 = StringUtils.trimToEmpty(this.path1);
		this.path2 = StringUtils.trimToEmpty(this.path2);
		this.path3 = StringUtils.trimToEmpty(this.path3);
		this.path4 = StringUtils.trimToEmpty(this.path4);
		this.path5 = StringUtils.trimToEmpty(this.path5);
		this.path6 = StringUtils.trimToEmpty(this.path6);
		this.path7 = StringUtils.trimToEmpty(this.path7);
		this.path0Location = NumberUtils.toInt(this.path0, -1);
		this.path1Location = NumberUtils.toInt(this.path1, -1);
		this.path2Location = NumberUtils.toInt(this.path2, -1);
		this.path3Location = NumberUtils.toInt(this.path3, -1);
		this.path4Location = NumberUtils.toInt(this.path4, -1);
		this.path5Location = NumberUtils.toInt(this.path5, -1);
		this.path6Location = NumberUtils.toInt(this.path6, -1);
		this.path7Location = NumberUtils.toInt(this.path7, -1);
	}

	/* 更新运行方法 */

	/* 修改过的 set get方法 */
	@FieldDescribe("数据标识")
	@Column(length = STRING_VALUE_MAX_LENGTH, name = ColumnNamePrefix + bundle_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String bundle;

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path0_FIELDNAME)
	private String path0 = "";

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path1_FIELDNAME)
	private String path1 = "";

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path2_FIELDNAME)
	private String path2 = "";

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path3_FIELDNAME)
	private String path3 = "";

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path4_FIELDNAME)
	private String path4 = "";

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path5_FIELDNAME)
	private String path5 = "";

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path6_FIELDNAME)
	private String path6 = "";

	@Column(length = Item.pathLength, name = ColumnNamePrefix + path7_FIELDNAME)
	private String path7 = "";

	@Column(name = ColumnNamePrefix + path0Location_FIELDNAME)
	private Integer path0Location;

	@Column(name = ColumnNamePrefix + path1Location_FIELDNAME)
	private Integer path1Location;

	@Column(name = ColumnNamePrefix + path2Location_FIELDNAME)
	private Integer path2Location;

	@Column(name = ColumnNamePrefix + path3Location_FIELDNAME)
	private Integer path3Location;

	@Column(name = ColumnNamePrefix + path4Location_FIELDNAME)
	private Integer path4Location;

	@Column(name = ColumnNamePrefix + path5Location_FIELDNAME)
	private Integer path5Location;

	@Column(name = ColumnNamePrefix + path6Location_FIELDNAME)
	private Integer path6Location;

	@Column(name = ColumnNamePrefix + path7Location_FIELDNAME)
	private Integer path7Location;

	@Enumerated(EnumType.STRING)
	@Column(length = ItemCategory.length, name = ColumnNamePrefix + itemCategory_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private ItemCategory itemCategory;

	@Enumerated(EnumType.STRING)
	@Column(length = ItemType.length, name = ColumnNamePrefix + itemType_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private ItemType itemType;

	@Enumerated(EnumType.STRING)
	@Column(length = ItemPrimitiveType.length, name = ColumnNamePrefix + itemPrimitiveType_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private ItemPrimitiveType itemPrimitiveType;

	@Enumerated(EnumType.STRING)
	@Column(length = ItemStringValueType.length, name = ColumnNamePrefix + itemStringValueType_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private ItemStringValueType itemStringValueType;

	@Column(length = STRING_VALUE_MAX_LENGTH, name = ColumnNamePrefix + stringShortValue_FIELDNAME)
	private String stringShortValue;

	@Column(length = JpaObject.length_100M, name = ColumnNamePrefix + stringLongValue_FIELDNAME)
	@Lob
	@Basic(fetch = FetchType.EAGER)
	private String stringLongValue;

	@Column(name = ColumnNamePrefix + numberValue_FIELDNAME)
	private Double numberValue;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = ColumnNamePrefix + dateTimeValue_FIELDNAME)
	private Date dateTimeValue;

	@Temporal(TemporalType.DATE)
	@Column(name = ColumnNamePrefix + dateValue_FIELDNAME)
	private Date dateValue;

	@Temporal(TemporalType.TIME)
	@Column(name = ColumnNamePrefix + timeValue_FIELDNAME)
	private Date timeValue;

	@Column(name = ColumnNamePrefix + booleanValue_FIELDNAME)
	private Boolean booleanValue;

	public String getPath0() {
		return path0;
	}

	public void setPath0(String path0) {
		this.path0 = path0;
	}

	public String getPath1() {
		return path1;
	}

	public void setPath1(String path1) {
		this.path1 = path1;
	}

	public String getPath2() {
		return path2;
	}

	public void setPath2(String path2) {
		this.path2 = path2;
	}

	public String getPath3() {
		return path3;
	}

	public void setPath3(String path3) {
		this.path3 = path3;
	}

	public String getPath4() {
		return path4;
	}

	public void setPath4(String path4) {
		this.path4 = path4;
	}

	public String getPath5() {
		return path5;
	}

	public void setPath5(String path5) {
		this.path5 = path5;
	}

	public String getPath6() {
		return path6;
	}

	public void setPath6(String path6) {
		this.path6 = path6;
	}

	public String getPath7() {
		return path7;
	}

	public void setPath7(String path7) {
		this.path7 = path7;
	}

	public Integer getPath0Location() {
		return path0Location;
	}

	public void setPath0Location(Integer path0Location) {
		this.path0Location = path0Location;
	}

	public Integer getPath1Location() {
		return path1Location;
	}

	public void setPath1Location(Integer path1Location) {
		this.path1Location = path1Location;
	}

	public Integer getPath2Location() {
		return path2Location;
	}

	public void setPath2Location(Integer path2Location) {
		this.path2Location = path2Location;
	}

	public Integer getPath3Location() {
		return path3Location;
	}

	public void setPath3Location(Integer path3Location) {
		this.path3Location = path3Location;
	}

	public Integer getPath4Location() {
		return path4Location;
	}

	public void setPath4Location(Integer path4Location) {
		this.path4Location = path4Location;
	}

	public Integer getPath5Location() {
		return path5Location;
	}

	public void setPath5Location(Integer path5Location) {
		this.path5Location = path5Location;
	}

	public Integer getPath6Location() {
		return path6Location;
	}

	public void setPath6Location(Integer path6Location) {
		this.path6Location = path6Location;
	}

	public Integer getPath7Location() {
		return path7Location;
	}

	public void setPath7Location(Integer path7Location) {
		this.path7Location = path7Location;
	}

	public ItemType getItemType() {
		return itemType;
	}

	public void setItemType(ItemType itemType) {
		this.itemType = itemType;
	}

	public ItemPrimitiveType getItemPrimitiveType() {
		return itemPrimitiveType;
	}

	public void setItemPrimitiveType(ItemPrimitiveType itemPrimitiveType) {
		this.itemPrimitiveType = itemPrimitiveType;
	}

	public ItemStringValueType getItemStringValueType() {
		return itemStringValueType;
	}

	public void setItemStringValueType(ItemStringValueType itemStringValueType) {
		this.itemStringValueType = itemStringValueType;
	}

	public Double getNumberValue() {
		return numberValue;
	}

	public void setNumberValue(Double numberValue) {
		this.numberValue = numberValue;
	}

	public Date getDateTimeValue() {
		return dateTimeValue;
	}

	public void setDateTimeValue(Date dateTimeValue) {
		this.dateTimeValue = dateTimeValue;
	}

	public Date getDateValue() {
		return dateValue;
	}

	public void setDateValue(Date dateValue) {
		this.dateValue = dateValue;
	}

	public Date getTimeValue() {
		return timeValue;
	}

	public void setTimeValue(Date timeValue) {
		this.timeValue = timeValue;
	}

	public Boolean getBooleanValue() {
		return booleanValue;
	}

	public void setBooleanValue(Boolean booleanValue) {
		this.booleanValue = booleanValue;
	}

	public ItemCategory getItemCategory() {
		return itemCategory;
	}

	public void setItemCategory(ItemCategory itemCategory) {
		this.itemCategory = itemCategory;
	}

	public String getBundle() {
		return bundle;
	}

	public void setBundle(String bundle) {
		this.bundle = bundle;
	}

	public String getStringShortValue() {
		return stringShortValue;
	}

	public void setStringShortValue(String stringShortValue) {
		this.stringShortValue = stringShortValue;
	}

	public String getStringLongValue() {
		return stringLongValue;
	}

	public void setStringLongValue(String stringLongValue) {
		this.stringLongValue = stringLongValue;
	}

}
