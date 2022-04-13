package com.x.cms.core.entity.element;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import org.apache.commons.lang3.StringUtils;
import org.apache.openjpa.persistence.jdbc.Index;

import com.x.base.core.entity.AbstractPersistenceProperties;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.SliceJpaObject;
import com.x.base.core.entity.annotation.CheckPersist;
import com.x.base.core.entity.annotation.ContainerEntity;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.cms.core.entity.PersistenceProperties;

@Entity
@ContainerEntity(dumpSize = 200, type = ContainerEntity.Type.content, reference = ContainerEntity.Reference.strong)
@Table(name = PersistenceProperties.Element.ViewCategory.table, uniqueConstraints = {
		@UniqueConstraint(name = PersistenceProperties.Element.ViewCategory.table + JpaObject.IndexNameMiddle
				+ JpaObject.DefaultUniqueConstraintSuffix, columnNames = { JpaObject.IDCOLUMN,
						JpaObject.CREATETIMECOLUMN, JpaObject.UPDATETIMECOLUMN, JpaObject.SEQUENCECOLUMN }) })
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class ViewCategory extends SliceJpaObject {

	private static final long serialVersionUID = 3263767038182121907L;
	private static final String TABLE = PersistenceProperties.Element.ViewCategory.table;

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

	public void onPersist() throws Exception {
		this.editor = StringUtils.trimToEmpty(this.editor);
	}

	public String getEditor() {
		return editor;
	}

	public void setEditor(String editor) {
		this.editor = editor;
	}
	/* ==============================================以上为 JpaObject 默认字段 */

	/*
	 * =====================================更新运行方法
	 * =======================================
	 */
	public static final String editor_FIELDNAME = "editor";
	@FieldDescribe("最后的编辑者.")
	@Column(length = AbstractPersistenceProperties.organization_name_length, name = ColumnNamePrefix + editor_FIELDNAME)
	@CheckPersist(allowEmpty = true)
	private String editor;

	public static final String viewId_FIELDNAME = "viewId";
	@FieldDescribe("列表ID.")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + viewId_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + viewId_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String viewId;

	public static final String categoryId_FIELDNAME = "categoryId";
	@FieldDescribe("分类ID.")
	@Column(length = JpaObject.length_id, name = ColumnNamePrefix + categoryId_FIELDNAME)
	@Index(name = TABLE + IndexNameMiddle + categoryId_FIELDNAME)
	@CheckPersist(allowEmpty = false)
	private String categoryId;

	public String getViewId() {
		return viewId;
	}

	public void setViewId(String viewId) {
		this.viewId = viewId;
	}

	public String getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(String categoryId) {
		this.categoryId = categoryId;
	}
}