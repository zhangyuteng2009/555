package com.x.cms.assemble.control.jaxrs.document;

import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.tools.ListTools;
import com.x.cms.core.entity.Document;
import com.x.cms.core.express.tools.DateOperation;
import com.x.cms.core.express.tools.filter.QueryFilter;
import com.x.cms.core.express.tools.filter.term.*;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class WrapInDocumentFilter {

	@FieldDescribe( "排序列名" )
	private String orderField = "publishTime";

	@FieldDescribe( "排序方式：ASC|DESC." )
	private String orderType = "DESC";

	@FieldDescribe( "是否需要查询数据，默认不查询." )
	private Boolean needData = false;

	@FieldDescribe( "是否已读：ALL|READ|UNREAD." )
	private String readFlag = "ALL";

	@FieldDescribe( "是否置顶：ALL|TOP|UNTOP." )
	private String topFlag = "ALL";

	@FieldDescribe( "只查询minutes分钟之类发布的文档，值为null或者为0时不作限制" )
	private Integer minutes = null;

	@FieldDescribe( "作为过滤条件的CMS应用ID列表, 可多个, String数组." )
	private List<String> appIdList;

	@FieldDescribe( "作为过滤条件的CMS应用名称列表, 可多个, String数组." )
	private List<String> appNameList;

	@FieldDescribe( "作为过滤条件的CMS应用别名列表, 可多个, String数组." )
	private List<String> appAliasList;

	@FieldDescribe( "作为过滤条件的CMS分类ID列表, 可多个, String数组." )
	private List<String> categoryIdList;

	@FieldDescribe( "作为过滤条件的CMS分类名称列表, 可多个, String数组." )
	private List<String> categoryNameList;

	@FieldDescribe( "作为过滤条件的CMS分类别名列表, 可多个, String数组." )
	private List<String> categoryAliasList;

	@FieldDescribe( "作为过滤条件的创建者姓名列表, 可多个, String数组." )
	private List<String> creatorList;

	@FieldDescribe( "作为过滤条件的文档状态列表, 可多个, String数组，值：published | draft | archived" )
	private List<String> statusList;

	@FieldDescribe( "创建日期列表，可以传入1个(开始时间)或者2个(开始和结束时间), String, yyyy-mm-dd." )
	private List<String> createDateList;	//

	@FieldDescribe( "发布日期列表，可以传入1个(开始时间)或者2个(开始和结束时间), String, yyyy-mm-dd." )
	private List<String> publishDateList;	//

	@FieldDescribe( "作为过滤条件的发布者所属组织, 可多个, String数组." )
	private List<String> creatorUnitNameList;

	@FieldDescribe( "文档类型：全部 | 信息 | 数据" )
	private String documentType = "信息";

	@FieldDescribe( "作为过滤条件的CMS文档关键字, 通常是标题, String, 模糊查询." )
	private String title;

	@FieldDescribe("文件导入的批次号：一般是分类ID+时间缀")
	private String importBatchName;

	@FieldDescribe("业务数据String值01.")
	private String stringValue01;

	@FieldDescribe("业务数据String值02.")
	private String stringValue02;

	@FieldDescribe("业务数据String值03.")
	private String stringValue03;

	@FieldDescribe("业务数据String值04.")
	private String stringValue04;

	@FieldDescribe("业务数据Long值01.")
	private Long longValue01;

	@FieldDescribe("业务数据Long值02.")
	private Long longValue02;

	@FieldDescribe("业务数据Double值01.")
	private Double doubleValue01;

	@FieldDescribe("业务数据Double值02.")
	private Double doubleValue02;

	public String getTopFlag() {
		return topFlag;
	}

	public void setTopFlag(String topFlag) {
		this.topFlag = topFlag;
	}

	public String getImportBatchName() {
		return importBatchName;
	}

	public void setImportBatchName(String importBatchName) {
		this.importBatchName = importBatchName;
	}

	public String getReadFlag() {
		return readFlag;
	}

	public void setReadFlag(String readFlag) {
		this.readFlag = readFlag;
	}

	public Integer getMinutes() {
		return minutes;
	}

	public void setMinutes(Integer minutes) {
		this.minutes = minutes;
	}

	public List<String> getCreatorUnitNameList() {
		return creatorUnitNameList;
	}

	public void setCreatorUnitNameList(List<String> creatorUnitNameList) {
		this.creatorUnitNameList = creatorUnitNameList;
	}

	public List<String> getAppIdList() {
		return appIdList == null?new ArrayList<>():appIdList;
	}

	public void setAppIdList(List<String> appIdList) {
		this.appIdList = appIdList;
	}

	public List<String> getCategoryIdList() {
		return categoryIdList == null?new ArrayList<>():categoryIdList;
	}

	public void setCategoryIdList(List<String> categoryIdList) {
		this.categoryIdList = categoryIdList;
	}

	public List<String> getCreatorList() {
		return creatorList == null?new ArrayList<>():creatorList;
	}

	public void setCreatorList(List<String> creatorList) {
		this.creatorList = creatorList;
	}

	public List<String> getStatusList() {
		return statusList == null?new ArrayList<>():statusList;
	}

	public void setStatusList(List<String> statusList) {
		this.statusList = statusList;
	}

	public List<String> getCreateDateList() {
		return createDateList == null?new ArrayList<>():createDateList;
	}

	public void setCreateDateList(List<String> createDateList) {
		this.createDateList = createDateList;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public List<String> getPublishDateList() {
		return publishDateList == null?new ArrayList<>():publishDateList;
	}

	public void setPublishDateList(List<String> publishDateList) {
		this.publishDateList = publishDateList;
	}

	public String getOrderField() {
		return orderField;
	}

	public String getOrderType() {
		return orderType;
	}

	public void setOrderField(String orderField) {
		this.orderField = orderField;
	}

	public void setOrderType(String orderType) {
		this.orderType = orderType;
	}

	public List<String> getAppAliasList() {
		return appAliasList == null?new ArrayList<>():appAliasList;
	}

	public List<String> getCategoryAliasList() {
		return categoryAliasList == null?new ArrayList<>():categoryAliasList;
	}

	public void setAppAliasList(List<String> appAliasList) {
		this.appAliasList = appAliasList;
	}

	public void setCategoryAliasList(List<String> categoryAliasList) {
		this.categoryAliasList = categoryAliasList;
	}

	public String getDocumentType() {
		return documentType;
	}

	public void setDocumentType(String documentType) {
		this.documentType = documentType;
	}

	public Boolean getNeedData() {
		return needData;
	}

	public void setNeedData(Boolean needData) {
		this.needData = needData;
	}

	public List<String> getAppNameList() {
		return appNameList;
	}

	public void setAppNameList(List<String> appNameList) {
		this.appNameList = appNameList;
	}

	public List<String> getCategoryNameList() {
		return categoryNameList;
	}

	public void setCategoryNameList(List<String> categoryNameList) {
		this.categoryNameList = categoryNameList;
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

	public Long getLongValue01() {
		return longValue01;
	}

	public void setLongValue01(Long longValue01) {
		this.longValue01 = longValue01;
	}

	public Long getLongValue02() {
		return longValue02;
	}

	public void setLongValue02(Long longValue02) {
		this.longValue02 = longValue02;
	}

	public Double getDoubleValue01() {
		return doubleValue01;
	}

	public void setDoubleValue01(Double doubleValue01) {
		this.doubleValue01 = doubleValue01;
	}

	public Double getDoubleValue02() {
		return doubleValue02;
	}

	public void setDoubleValue02(Double doubleValue02) {
		this.doubleValue02 = doubleValue02;
	}

	/**
	 * 根据传入的查询参数，组织一个完整的QueryFilter对象
	 * @return
	 * @throws Exception
	 */
	public QueryFilter getQueryFilter() throws Exception {
		QueryFilter queryFilter = new QueryFilter();
		queryFilter.setJoinType( "and" );

		//组织查询条件对象
		if( StringUtils.isNotEmpty( this.getTitle() )) {
			queryFilter.addLikeTerm( new LikeTerm( "title", this.getTitle() ) );
		}

		//文档类型：全部 | 信息 | 数据
		if( StringUtils.isNotEmpty( this.getDocumentType())) {
			if( "信息".equals( this.getDocumentType() )) {
				queryFilter.addEqualsTerm( new EqualsTerm( "documentType", this.getDocumentType() ) );
			}else if( "数据".equals( this.getDocumentType() )) {
				queryFilter.addEqualsTerm( new EqualsTerm( "documentType", this.getDocumentType() ) );
			}
		}

		//是否置顶：ALL|TOP|UNTOP
		if( StringUtils.isNotEmpty( this.getTopFlag())) {
			if( "TOP".equals( this.getTopFlag() )) {
				queryFilter.addIsTrueTerm( new IsTrueTerm( "isTop" ) );
			}else if( "UNTOP".equals( this.getTopFlag() )) {
				queryFilter.addIsFalseTerm( new IsFalseTerm( "isTop" ) );
			}
		}

		if( StringUtils.isNotEmpty( this.getImportBatchName())) {
			queryFilter.addEqualsTerm( new EqualsTerm( "importBatchName", this.getImportBatchName() ) );
		}

		if( ListTools.isNotEmpty( this.getAppAliasList())) {
			if( this.getAppAliasList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "appAlias", this.getAppAliasList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "appAlias", new ArrayList<>( this.getAppAliasList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getAppNameList())) {
			if( this.getAppNameList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "appName", this.getAppNameList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "appName", new ArrayList<>( this.getAppNameList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getAppIdList())) {
			if( this.getAppIdList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "appId", this.getAppIdList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "appId", new ArrayList<>( this.getAppIdList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getCategoryAliasList())) {
			if( this.getCategoryAliasList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "categoryAlias", this.getCategoryAliasList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "categoryAlias", new ArrayList<>( this.getCategoryAliasList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getCategoryNameList())) {
			if( this.getCategoryNameList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "categoryName", this.getCategoryNameList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "categoryName", new ArrayList<>( this.getCategoryNameList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getCategoryIdList())) {
			if( this.getCategoryIdList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "categoryId", this.getCategoryIdList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "categoryId", new ArrayList<>( this.getCategoryIdList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getCreatorList())) {
			if( this.getCreatorList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "creatorPerson", this.getCreatorList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "creatorPerson", new ArrayList<>( this.getCreatorList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getCreatorUnitNameList())) {
			if( this.getCreatorUnitNameList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "creatorUnitName", this.getCreatorUnitNameList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "creatorUnitName", new ArrayList<>( this.getCreatorUnitNameList() ) ) );
			}
		}

		if( ListTools.isNotEmpty( this.getStatusList())) {
			if( this.getStatusList().size() == 1 ) { //如果只有一个值，就不要用IN，直接使用equals
				queryFilter.addEqualsTerm( new EqualsTerm( "docStatus", this.getStatusList().get(0) ) );
			}else {
				queryFilter.addInTerm( new InTerm( "docStatus", new ArrayList<>( this.getStatusList())) );
			}
		}else {
			queryFilter.addEqualsTerm( new EqualsTerm( "docStatus", "published" ) );
		}

		if( ListTools.isNotEmpty( this.getCreateDateList())) {
			Date startDate = null;
			Date endDate = null;

			if ( this.getCreateDateList().size() == 1 ) { // 从开始时间（yyyy-MM-DD），到现在
				try {
					startDate = DateOperation.getDateFromString( this.getCreateDateList().get(0).toString() );
					endDate = new Date();
					queryFilter.addDateBetweenTerm( "createTime", startDate, endDate );
				}catch( Exception e) {
					throw new Exception( "Timestamp ‘createDate’ can not format to date, style with: yyyy-MM-DD, data:" + this.getCreateDateList().get(0).toString() );
				}
			}else if( this.getCreateDateList().size() == 2 ){// 从开始时间到结束时间（yyyy-MM-DD）
				try {
					startDate = DateOperation.getDateFromString( this.getCreateDateList().get(0).toString());
					endDate = DateOperation.getDateFromString( this.getCreateDateList().get(1).toString());
					queryFilter.addDateBetweenTerm( "createTime", startDate, endDate );
				}catch( Exception e) {
					throw new Exception( "Timestamp ‘createDate’ can not format to date, style with: yyyy-MM-DD, data:" + this.getCreateDateList().get(0).toString() + " and " + this.getCreateDateList().get(1).toString()  );
				}
			}
		}

		if( ListTools.isNotEmpty( this.getPublishDateList())) {
			Date startDate = null;
			Date endDate = null;
			if ( this.getPublishDateList().size() == 1 ) { // 从开始时间（yyyy-MM-DD），到现在
				try {
					startDate = DateOperation.getDateFromString( this.getPublishDateList().get(0).toString() );
					endDate = new Date();
					queryFilter.addDateBetweenTerm( "publishTime", startDate, endDate );
				}catch( Exception e) {
					throw new Exception( "Timestamp 'publishDate' can not format to date, style with: yyyy-MM-DD, data:" + this.getCreateDateList().get(0).toString() );
				}
			}else if( this.getPublishDateList().size() == 2 ){// 从开始时间到结束时间（yyyy-MM-DD）
				try {
					startDate = DateOperation.getDateFromString( this.getPublishDateList().get(0).toString());
					endDate = DateOperation.getDateFromString( this.getPublishDateList().get(1).toString());
					queryFilter.addDateBetweenTerm( "publishTime", startDate, endDate );
				}catch( Exception e) {
					throw new Exception( "Timestamp ‘publishDate’ can not format to date, style with: yyyy-MM-DD, data:" + this.getCreateDateList().get(0).toString() + " and " + this.getCreateDateList().get(1).toString()  );
				}
			}
		}

		if( this.getMinutes() != null && this.getMinutes() > 0 ) {
			queryFilter.addDateBetweenTerm( "publishTime", new Date ( new Date().getTime() - minutes*60*1000L ), new Date() );
		}

		if( StringUtils.isNotEmpty( this.getStringValue01())) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.stringValue01_FIELDNAME, this.getStringValue01() ) );
		}

		if( StringUtils.isNotEmpty( this.getStringValue02())) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.stringValue02_FIELDNAME, this.getStringValue02() ) );
		}

		if( StringUtils.isNotEmpty( this.getStringValue03())) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.stringValue03_FIELDNAME, this.getStringValue03() ) );
		}

		if( StringUtils.isNotEmpty( this.getStringValue04())) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.stringValue04_FIELDNAME, this.getStringValue04() ) );
		}

		if( this.getLongValue01() != null) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.longValue01_FIELDNAME, this.getLongValue01() ) );
		}

		if( this.getLongValue02() != null) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.longValue02_FIELDNAME, this.getLongValue02() ) );
		}

		if( this.getDoubleValue01() != null) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.doubleValue01_FIELDNAME, this.getDoubleValue01() ) );
		}

		if( this.getDoubleValue02() != null) {
			queryFilter.addEqualsTerm( new EqualsTerm(Document.doubleValue02_FIELDNAME, this.getDoubleValue02() ) );
		}

		return queryFilter;
	}

}
