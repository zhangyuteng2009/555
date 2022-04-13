package com.x.base.core.project.organization;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.apache.commons.collections4.list.UnmodifiableList;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.project.tools.ListTools;

public class OrganizationDefinition {

	public final static String Manager = "Manager";
	public final static String Manager_description = "系统管理员(系统角色)，拥有所有角色的权限，可以管理所有内容。";

	public final static String AttendanceManager = "AttendanceManager";
	public final static String AttendanceManager_description = "考勤管理员(系统角色)，可以管理考勤管理相关的配置，使用数据管理功能。";

	public final static String OrganizationManager = "OrganizationManager";
	public final static String OrganizationManager_description = "组织信息管理员(系统角色)，可以使用组织架构、人员、群组以及角色相关的配置和管理功能。";

	public final static String PersonManager = "PersonManager";
	public final static String PersonManager_description = "人员信息管理员(系统角色)，可以使用组织管理中的人员管理相关功能。";

	public final static String GroupManager = "GroupManager";
	public final static String GroupManager_description = "群组信息管理员(系统角色)，可以使用组织管理中的群组管理相关功能。";

	public final static String UnitManager = "UnitManager";
	public final static String UnitManager_description = "组织信息管理员(系统角色)，可以使用组织管理中的组织架构管理相关功能。";

	public final static String RoleManager = "RoleManager";
	public final static String RoleManager_description = "角色信息管理员(系统角色)，可以使用组织管理中的角色管理相关功能。";

	public final static String ProcessPlatformManager = "ProcessPlatformManager";
	public final static String ProcessPlatformManager_description = "流程平台管理员(系统角色)，可以对流程平台进行管理，可以进行流程设计管理，可以查询、调度和删除流程实例等。";

	public final static String ProcessPlatformCreator = "ProcessPlatformCreator";
	public final static String ProcessPlatformCreator_description = "流程设计创建者(系统角色)，可以进行流程设计，新增和设计流程应用。";

	public final static String MeetingManager = "MeetingManager";
	public final static String MeetingManager_description = "会议管理员(系统角色)，可以对会议地址，会议室，会议等信息进行管理，对会议管理系统所有配置进行管理。";

	public final static String MeetingViewer = "MeetingViewer";
	public final static String MeetingViewer_description = "会议观察员(系统角色)，可以对所有的会议信息进行查看。";

	public final static String PortalManager = "PortalManager";
	public final static String PortalManager_description = "门户管理员(系统角色)，可以进行门户应用设计，对门户应用进行管理操作。";

	public final static String BBSManager = "BBSManager";
	public final static String BBSManager_description = "社区管理员(系统角色)，可以对社区进行论坛分区，版块的创建，权限的设定，贴子的管理等操作。";

	public final static String CMSManager = "CMSManager";
	public final static String CMSManager_description = "内容管理系统管理员(系统角色)，可以设计内容管理栏目，分类，对表单，列表进行设计，对文档进行管理等操作。";

	public final static String OKRManager = "OKRManager";
	public final static String OKRManager_description = "执行力管理员(系统角色)，可以进行执行力管理系统配置，对工作内容进行管理操作。";

	public final static String CRMManager = "CRMManager";
	public final static String CRMManager_description = "CRM管理员(系统角色)，可以进行CRM系统相关配置，对客户信息，商机等信息进行管理操作。";

	public final static String TeamWorkManager = "TeamWorkManager";
	public final static String TeamWorkManager_description = "TeamWork管理员(系统角色)，可以进行TeamWork系统相关配置，对项目，任务等信息进行管理操作。";

	public final static String QueryManager = "QueryManager";
	public final static String QueryManager_description = "数据中心管理员(系统角色)，可以在数据中心进行视图管理，统计管理等操作。";

	public final static String MessageManager = "MessageManager";
	public final static String MessageManager_description = "消息管理员(系统角色)，可以对系统中产生的消息进行管理。";

	public final static String HotPictureManager = "HotPictureManager";
	public final static String HotPictureManager_description = "热点图片控制权限(系统角色)，可以对系统中产生的系统图片进行管理。";

	public final static String SearchPrivilege = "SearchPrivilege";
	public final static String SearchPrivilege_description = "搜索管理员(系统角色)，可以跨权限对系统内容进行搜索。";

	public final static String FileManager = "FileManager";
	public final static String FileManager_description = "云文件管理员(系统角色)，可以进行云文件系统相关配置。";

	public final static String ServiceManager = "ServiceManager";
	public final static String ServiceManager_description = "服务管理员(系统角色)，可以进行服务管理的接口和代理配置。";

	public final static String SystemManager = "SystemManager";
	public final static String SystemManager_description = "三元管理中的系统管理员(系统角色)，负责为系统添加用户和系统运行维护工作。";

	public final static String SecurityManager = "SecurityManager";
	public final static String SecurityManager_description = "三元管理中的安全管理员(系统角色)，负责权限设定，负责系统审计日志、用户和系统管理员操作行为的审查分析。";

	public final static String AuditManager = "AuditManager";
	public final static String AuditManager_description = "三元管理中的安全审计员(系统角色)，负责对系统管理员、安全管理员的操作行为进行审计、跟踪。";

	public final static String RoleDefinitionSuffix = "SystemRole";

	public final static Pattern person_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@P$");

	public final static Pattern personAttribute_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@PA$");

	public final static Pattern group_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@G$");

	public final static Pattern role_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@R$");

	public final static Pattern identity_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@I$");

	public final static Pattern unit_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@U$");

	public final static Pattern unitAttribute_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@UA$");

	public final static Pattern unitDuty_distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@UD$");

	public final static Pattern distinguishedName_pattern = Pattern.compile("^(.+)\\@(\\S+)\\@(P|PA|G|R|I|U|UA|UD)$");

	public final static List<String> DEFAULTROLES = new UnmodifiableList<String>(ListTools.toList(Manager,SystemManager,SecurityManager,AuditManager,
			AttendanceManager, OrganizationManager, PersonManager, GroupManager, UnitManager, RoleManager,
			ProcessPlatformManager, ProcessPlatformCreator, MeetingManager, MeetingViewer, PortalManager, BBSManager,
			CMSManager, OKRManager, CRMManager,TeamWorkManager, QueryManager, MessageManager, HotPictureManager, SearchPrivilege, FileManager, ServiceManager));

	public static String toDistinguishedName(String name) {
		if (!StringUtils.contains(name, "@")) {
			name = name + "@" + name + RoleDefinitionSuffix + "@R";
		}
		return name;
	}

	public static String name(String distinguishedName) {
		if (StringUtils.contains(distinguishedName, "@")) {
			return StringUtils.substringBefore(distinguishedName, "@");
		}
		return distinguishedName;
	}

	public static List<String> name(List<String> list) {
		List<String> os = new ArrayList<>();
		if (ListTools.isNotEmpty(list)) {
			for (String str : list) {
				if (StringUtils.isNotEmpty(str)) {
					os.add(name(str));
				}
			}
		}
		return os;
	}

	public static boolean isDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isIdentityDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (identity_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isPersonDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (person_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isPersonAttributeDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (personAttribute_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isUnitDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (unit_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isUnitAttributeDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (unitAttribute_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isUnitDutyDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (unitDuty_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isGroupDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (group_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static boolean isRoleDistinguishedName(String str) {
		if (StringUtils.isEmpty(str)) {
			return false;
		}
		if (role_distinguishedName_pattern.matcher(str).find()) {
			return true;
		}
		return false;
	}

	public static DistinguishedNameCategory distinguishedNameCategory(List<String> list) {
		DistinguishedNameCategory category = new DistinguishedNameCategory();
		if (ListTools.isNotEmpty(list)) {
			list.stream().forEach(o -> {
				if (isIdentityDistinguishedName(o)) {
					category.getIdentityList().add(o);
				} else if (isPersonDistinguishedName(o)) {
					category.getPersonList().add(o);
				} else if (isPersonAttributeDistinguishedName(o)) {
					category.getPersonAttributeList().add(o);
				} else if (isUnitDistinguishedName(o)) {
					category.getUnitList().add(o);
				} else if (isUnitAttributeDistinguishedName(o)) {
					category.getUnitAttributeList().add(o);
				} else if (isUnitDutyDistinguishedName(o)) {
					category.getUnitDutyList().add(o);
				} else if (isGroupDistinguishedName(o)) {
					category.getGroupList().add(o);
				} else if (isRoleDistinguishedName(o)) {
					category.getRoleList().add(o);
				} else {
					category.getUnknownList().add(o);
				}
			});
		}
		return category;

	}

	public static class DistinguishedNameCategory {
		private List<String> personList = new ArrayList<>();
		private List<String> personAttributeList = new ArrayList<>();
		private List<String> unitList = new ArrayList<>();
		private List<String> unitAttributeList = new ArrayList<>();
		private List<String> unitDutyList = new ArrayList<>();
		private List<String> identityList = new ArrayList<>();
		private List<String> groupList = new ArrayList<>();
		private List<String> roleList = new ArrayList<>();
		private List<String> unknownList = new ArrayList<>();

		public List<String> getPersonList() {
			return personList;
		}

		public void setPersonList(List<String> personList) {
			this.personList = personList;
		}

		public List<String> getPersonAttributeList() {
			return personAttributeList;
		}

		public void setPersonAttributeList(List<String> personAttributeList) {
			this.personAttributeList = personAttributeList;
		}

		public List<String> getUnitList() {
			return unitList;
		}

		public void setUnitList(List<String> unitList) {
			this.unitList = unitList;
		}

		public List<String> getUnitAttributeList() {
			return unitAttributeList;
		}

		public void setUnitAttributeList(List<String> unitAttributeList) {
			this.unitAttributeList = unitAttributeList;
		}

		public List<String> getUnitDutyList() {
			return unitDutyList;
		}

		public void setUnitDutyList(List<String> unitDutyList) {
			this.unitDutyList = unitDutyList;
		}

		public List<String> getIdentityList() {
			return identityList;
		}

		public void setIdentityList(List<String> identityList) {
			this.identityList = identityList;
		}

		public List<String> getGroupList() {
			return groupList;
		}

		public void setGroupList(List<String> groupList) {
			this.groupList = groupList;
		}

		public List<String> getRoleList() {
			return roleList;
		}

		public void setRoleList(List<String> roleList) {
			this.roleList = roleList;
		}

		public List<String> getUnknownList() {
			return unknownList;
		}

		public void setUnknownList(List<String> unknownList) {
			this.unknownList = unknownList;
		}
	}

}
