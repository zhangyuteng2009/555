package com.x.cms.assemble.control;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.organization.OrganizationDefinition;
import com.x.base.core.project.tools.ListTools;
import com.x.cms.assemble.control.factory.*;
import com.x.cms.assemble.control.factory.element.QueryViewFactory;
import com.x.cms.assemble.control.factory.portal.PortalFactory;
import com.x.cms.assemble.control.factory.process.ProcessFactory;
import com.x.cms.core.entity.AppInfo;
import com.x.organization.core.express.Organization;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 通用业务类
 * @author sword
 */
public class Business {

	private EntityManagerContainer emc;

	public Business(EntityManagerContainer emc) throws Exception {
		this.emc = emc;
	}

	public EntityManagerContainer entityManagerContainer() {
		return this.emc;
	}

	private TemplateFormFactory templateFormFactory;
	private AppInfoFactory appInfoFactory;
	private AppInfoConfigFactory appInfoConfigFactory;
	private CategoryInfoFactory categoryInfoFactory;
	private CategoryExtFactory categoryExtFactory;
	private FileInfoFactory fileInfoFactory;
	private LogFactory logFactory;
	private DocumentFactory documentFactory;
	private DocumentViewRecordFactory documentViewRecordFactory;
	private FormFactory formFactory;
	private FileFactory fileFactory;
	private QueryViewFactory queryViewFactory;
	private ViewCategoryFactory viewCategoryFactory;
	private ViewFactory viewFactory;
	private ViewFieldConfigFactory viewFieldConfigFactory;
	private AppDictFactory appDictFactory;
	private AppDictItemFactory appDictItemFactory;
	private ScriptFactory scriptFactory;
	private SearchFactory searchFactory;
	private Organization organization;
	private ItemFactory itemFactory;
	private FormFieldFactory formFieldFactory;
	private CmsBatchOperationFactory cmsBatchOperationFactory;
	private DocumentCommendFactory documentCommendFactory;
	private DocumentCommentCommendFactory documentCommentCommendFactory;
	private DocumentCommentInfoFactory documentCommentInfoFactory;
	private ReviewFactory reviewFactory;

	public AppInfoConfigFactory appInfoConfigFactory() throws Exception {
		if (null == this.appInfoConfigFactory) {
			this.appInfoConfigFactory = new AppInfoConfigFactory(this);
		}
		return appInfoConfigFactory;
	}

	public DocumentCommentCommendFactory documentCommentCommendFactory() throws Exception {
		if (null == this.documentCommentCommendFactory) {
			this.documentCommentCommendFactory = new DocumentCommentCommendFactory(this);
		}
		return documentCommentCommendFactory;
	}

	public ReviewFactory reviewFactory() throws Exception {
		if (null == this.reviewFactory) {
			this.reviewFactory = new ReviewFactory(this);
		}
		return reviewFactory;
	}

	public CmsBatchOperationFactory cmsBatchOperationFactory() throws Exception {
		if (null == this.cmsBatchOperationFactory) {
			this.cmsBatchOperationFactory = new CmsBatchOperationFactory(this);
		}
		return cmsBatchOperationFactory;
	}

	public DocumentCommentInfoFactory documentCommentInfoFactory() throws Exception {
		if (null == this.documentCommentInfoFactory) {
			this.documentCommentInfoFactory = new DocumentCommentInfoFactory(this);
		}
		return documentCommentInfoFactory;
	}

	public DocumentCommendFactory documentCommendFactory() throws Exception {
		if (null == this.documentCommendFactory) {
			this.documentCommendFactory = new DocumentCommendFactory(this);
		}
		return documentCommendFactory;
	}

	public FileFactory fileFactory() throws Exception {
		if (null == this.fileFactory) {
			this.fileFactory = new FileFactory(this);
		}
		return fileFactory;
	}

	public FormFieldFactory formFieldFactory() throws Exception {
		if (null == this.formFieldFactory) {
			this.formFieldFactory = new FormFieldFactory(this);
		}
		return formFieldFactory;
	}

	public ItemFactory itemFactory() throws Exception {
		if (null == this.itemFactory) {
			this.itemFactory = new ItemFactory(this);
		}
		return itemFactory;
	}

	public CategoryExtFactory categoryExtFactory() throws Exception {
		if (null == this.categoryExtFactory) {
			this.categoryExtFactory = new CategoryExtFactory(this);
		}
		return categoryExtFactory;
	}

	public Organization organization() throws Exception {
		if (null == this.organization) {
			this.organization = new Organization(ThisApplication.context());
		}
		return organization;
	}

	public TemplateFormFactory templateFormFactory() throws Exception {
		if (null == this.templateFormFactory) {
			this.templateFormFactory = new TemplateFormFactory(this);
		}
		return templateFormFactory;
	}

	public DocumentViewRecordFactory documentViewRecordFactory() throws Exception {
		if (null == this.documentViewRecordFactory) {
			this.documentViewRecordFactory = new DocumentViewRecordFactory(this);
		}
		return documentViewRecordFactory;
	}



	public QueryViewFactory queryViewFactory() throws Exception {
		if (null == this.queryViewFactory) {
			this.queryViewFactory = new QueryViewFactory(this);
		}
		return queryViewFactory;
	}

	public ViewCategoryFactory getViewCategoryFactory() throws Exception {
		if (null == this.viewCategoryFactory) {
			this.viewCategoryFactory = new ViewCategoryFactory(this);
		}
		return viewCategoryFactory;
	}

	public ViewFactory getViewFactory() throws Exception {
		if (null == this.viewFactory) {
			this.viewFactory = new ViewFactory(this);
		}
		return viewFactory;
	}

	public ViewFieldConfigFactory getViewFieldConfigFactory() throws Exception {
		if (null == this.viewFieldConfigFactory) {
			this.viewFieldConfigFactory = new ViewFieldConfigFactory(this);
		}
		return viewFieldConfigFactory;
	}

	public SearchFactory getSearchFactory() throws Exception {
		if (null == this.searchFactory) {
			this.searchFactory = new SearchFactory(this);
		}
		return searchFactory;
	}

	public ScriptFactory getScriptFactory() throws Exception {
		if (null == this.scriptFactory) {
			this.scriptFactory = new ScriptFactory(this);
		}
		return scriptFactory;
	}

	public FormFactory getFormFactory() throws Exception {
		if (null == this.formFactory) {
			this.formFactory = new FormFactory(this);
		}
		return formFactory;
	}

	public AppDictFactory getAppDictFactory() throws Exception {
		if (null == this.appDictFactory) {
			this.appDictFactory = new AppDictFactory(this);
		}
		return appDictFactory;
	}

	public AppDictItemFactory getAppDictItemFactory() throws Exception {
		if (null == this.appDictItemFactory) {
			this.appDictItemFactory = new AppDictItemFactory(this);
		}
		return appDictItemFactory;
	}

	public DocumentFactory getDocumentFactory() throws Exception {
		if (null == this.documentFactory) {
			this.documentFactory = new DocumentFactory(this);
		}
		return documentFactory;
	}

	public AppInfoFactory getAppInfoFactory() throws Exception {
		if (null == this.appInfoFactory) {
			this.appInfoFactory = new AppInfoFactory(this);
		}
		return appInfoFactory;
	}

	public CategoryInfoFactory getCategoryInfoFactory() throws Exception {
		if (null == this.categoryInfoFactory) {
			this.categoryInfoFactory = new CategoryInfoFactory(this);
		}
		return categoryInfoFactory;
	}

	public FileInfoFactory getFileInfoFactory() throws Exception {
		if (null == this.fileInfoFactory) {
			this.fileInfoFactory = new FileInfoFactory(this);
		}
		return fileInfoFactory;
	}

	public LogFactory getLogFactory() throws Exception {
		if (null == this.logFactory) {
			this.logFactory = new LogFactory(this);
		}
		return logFactory;
	}

	private ProcessFactory process;

	public ProcessFactory process() throws Exception {
		if (null == this.process) {
			this.process = new ProcessFactory(this);
		}
		return process;
	}

	private PortalFactory portal;

	public PortalFactory portal() throws Exception {
		if (null == this.portal) {
			this.portal = new PortalFactory(this);
		}
		return portal;
	}

	public boolean isHasPlatformRole( String personName, String roleName) throws Exception {
		if ( StringUtils.isEmpty( personName ) ) {
			throw new Exception("personName is null!");
		}
		if ( StringUtils.isEmpty( roleName )) {
			throw new Exception("roleName is null!");
		}
		List<String> roleList = null;
		roleList = organization().role().listWithPerson( personName );
		if ( roleList != null && !roleList.isEmpty()) {
			if( roleList.stream().filter( r -> roleName.equalsIgnoreCase( r )).count() > 0 ){
				return true;
			}
		} else {
			return false;
		}
		return false;
	}

	/**
	 * 判断用户是否管理员权限
	 * 1、person.isManager()
	 * 2、xadmin
	 * 3、CMSManager
	 *
	 * @param person
	 * @return
	 * @throws Exception
	 */
	public boolean isManager(EffectivePerson person) throws Exception {
		// 如果用户的身份是平台的超级管理员，那么就是超级管理员权限
		if ( person.isManager() ) {
			return true;
		} else {
			if (organization().person().hasRole(person, OrganizationDefinition.Manager,
					OrganizationDefinition.CMSManager)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 是否是栏目管理员
	 * @param person
	 * @param appInfo
	 * @return
	 * @throws Exception
	 */
	public boolean isAppInfoManager(EffectivePerson person, AppInfo appInfo) throws Exception {
		if( isManager(person) ) {
			return true;
		}
		if(appInfo != null) {
			if (ListTools.isNotEmpty(appInfo.getManageablePersonList())) {
				if (appInfo.getManageablePersonList().contains(person.getDistinguishedName())) {
					return true;
				}
			}
			if (ListTools.isNotEmpty(appInfo.getManageableUnitList())) {
				List<String> unitNames = this.organization().unit().listWithPersonSupNested(person.getDistinguishedName());
				if (ListTools.containsAny(unitNames, appInfo.getManageableUnitList())) {
					return true;
				}
			}
			if (ListTools.isNotEmpty(appInfo.getManageableGroupList())) {
				List<String> groupNames = this.organization().group().listWithPerson(person.getDistinguishedName());
				if (ListTools.containsAny(groupNames, appInfo.getManageableGroupList())) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * TODO (uncomplete)判断用户是否有权限进行：[表单模板管理]操作
	 *
	 * @param person
	 * @return
	 * @throws Exception
	 */
	public boolean formEditAvailable( EffectivePerson person) throws Exception {
		if ( isManager( person)) {
			return true;
		}
		// 其他情况暂时全部不允许操作
		return true;
	}

	/**
	 * TODO (uncomplete)判断用户是否有权限进行：[视图配置管理]操作
	 *
	 * @param person
	 * @return
	 * @throws Exception
	 */
	public boolean viewEditAvailable( EffectivePerson person) throws Exception {
		if (isManager(person)) {
			return true;
		}
		// 其他情况暂时全部不允许操作
		return true;
	}

	public boolean editable( EffectivePerson effectivePerson, AppInfo appInfo ) throws Exception {
		if ((StringUtils.equals(appInfo.getCreatorPerson(), effectivePerson.getDistinguishedName()))
				|| effectivePerson.isManager() || organization().person().hasRole(effectivePerson,
						OrganizationDefinition.CMSManager)) {
			return true;
		}

		//判断effectivePerson是不是该栏目的管理者：涉及 个人，组织和群组
		List<String> unitNameList= this.organization().unit().listWithPersonSupNested( effectivePerson.getDistinguishedName() );
		List<String> groupNameList = new ArrayList<String>();
		List<String> groupList = this.organization().group().listWithPerson( effectivePerson.getDistinguishedName() );
		if (groupList != null && groupList.size() > 0) {
			groupList.stream().filter( g -> !groupNameList.contains( g )).distinct().forEach( g -> groupNameList.add( g ));
		}

		if( ListTools.isNotEmpty( appInfo.getManageablePersonList() )) {
			if (appInfo.getManageablePersonList().contains( effectivePerson.getDistinguishedName() )) {
				return true;
			}
		}

		if( ListTools.isNotEmpty( appInfo.getManageableGroupList() ) && ListTools.isNotEmpty( groupNameList )) {
			groupNameList.retainAll( appInfo.getManageableGroupList()  );
			if( ListTools.isNotEmpty( groupNameList )) {
				return true;
			}
		}

		if( ListTools.isNotEmpty( appInfo.getManageableUnitList() )&& ListTools.isNotEmpty( unitNameList )) {
			unitNameList.retainAll( appInfo.getManageableUnitList()  );
			if( ListTools.isNotEmpty( unitNameList )) {
				return true;
			}
		}
		return false;
	}
}
