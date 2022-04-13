package com.x.attendance.assemble.control.jaxrs.attendancedetail;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.x.attendance.entity.AttendanceAppealAuditInfo;
import com.x.attendance.entity.AttendanceAppealInfo;
import com.x.attendance.entity.AttendanceScheduleSetting;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.tools.ListTools;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.attendance.assemble.control.Business;
import com.x.attendance.assemble.control.ExceptionWrapInConvert;
import com.x.attendance.entity.AttendanceDetail;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.StandardJaxrsAction;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;

public class ActionListPrevWithFilter extends BaseAction {

	private static  Logger logger = LoggerFactory.getLogger(ActionListPrevWithFilter.class);

	protected ActionResult<List<Wo>> execute(HttpServletRequest request, EffectivePerson effectivePerson, String id,
			Integer count, JsonElement jsonElement) throws Exception {
		ActionResult<List<Wo>> result = new ActionResult<>();
		List<Wo> wraps = new ArrayList<>();
		EffectivePerson currentPerson = this.effectivePerson(request);
		long total = 0;
		List<AttendanceDetail> detailList = null;
		List<String> topUnitNames = new ArrayList<String>();
		List<String> unitNames = new ArrayList<String>();
		List<String> topUnitNames_tmp = null;
		List<String> unitNames_tmp = null;
		Wi wrapIn = null;
		AttendanceScheduleSetting scheduleSetting_top = null;
		AttendanceScheduleSetting scheduleSetting = null;
		Boolean check = true;

		try {
			wrapIn = this.convertToWrapIn(jsonElement, Wi.class);
		} catch (Exception e) {
			check = false;
			Exception exception = new ExceptionWrapInConvert(e, jsonElement);
			result.error(exception);
			logger.error(e, currentPerson, request, null);
		}
		if (check) {
			try {
				EntityManagerContainer emc = EntityManagerContainerFactory.instance().create();
				Business business = new Business(emc);

				// 查询出ID对应的记录的sequence
				Object sequence = null;
				if (id == null || "(0)".equals(id) || id.isEmpty()) {
				} else {
					if (!StringUtils.equalsIgnoreCase(id, StandardJaxrsAction.EMPTY_SYMBOL)) {
						sequence = PropertyUtils.getProperty(emc.find(id, AttendanceDetail.class),  JpaObject.sequence_FIELDNAME);
					}
				}

				// 处理一下顶层组织，查询下级顶层组织
				if ( StringUtils.isNotEmpty( wrapIn.getQ_topUnitName() )) {
					topUnitNames.add(wrapIn.getQ_topUnitName());
					scheduleSetting_top = attendanceScheduleSettingServiceAdv.getAttendanceScheduleSettingWithUnit(wrapIn.getQ_topUnitName(), effectivePerson.getDebugger() );
					try {
						topUnitNames_tmp = userManagerService.listSubUnitNameWithParent(wrapIn.getQ_topUnitName());
					} catch (Exception e) {
						Exception exception = new ExceptionAttendanceDetailProcess(e,
								"根据顶层组织顶层组织列示所有下级组织名称发生异常！TopUnit:" + wrapIn.getQ_topUnitName());
						result.error(exception);
						logger.error(e, currentPerson, request, null);
					}
					if (topUnitNames_tmp != null && topUnitNames_tmp.size() > 0) {
						for (String topUnitName : topUnitNames_tmp) {
							topUnitNames.add(topUnitName);
						}
					}
					wrapIn.setTopUnitNames(topUnitNames);
				}

				// 处理一下组织,查询下级组织
				if ( StringUtils.isNotEmpty( wrapIn.getQ_topUnitName() )) {
					unitNames.add(wrapIn.getQ_topUnitName());
					scheduleSetting = attendanceScheduleSettingServiceAdv.getAttendanceScheduleSettingWithUnit(wrapIn.getQ_unitName(), effectivePerson.getDebugger() );
					try {
						unitNames_tmp = userManagerService.listSubUnitNameWithParent(wrapIn.getQ_topUnitName());
					} catch (Exception e) {
						Exception exception = new ExceptionAttendanceDetailProcess(e,
								"根据组织名称列示所有下级组织名称发生异常！Unit:" + wrapIn.getQ_topUnitName());
						result.error(exception);
						logger.error(e, currentPerson, request, null);
					}
					if (unitNames_tmp != null && unitNames_tmp.size() > 0) {
						for (String unitName : unitNames_tmp) {
							unitNames.add(unitName);
						}
					}
					wrapIn.setUnitNames(unitNames);
				}

				// 从数据库中查询符合条件的一页数据对象
				detailList = business.getAttendanceDetailFactory().listIdsPrevWithFilter(id, count, sequence, wrapIn);
				// 从数据库中查询符合条件的对象总数
				total = business.getAttendanceDetailFactory().getCountWithFilter(wrapIn);
				// 将所有查询出来的有状态的对象转换为可以输出的过滤过属性的对象
				wraps = Wo.copier.copy(detailList);

				if( scheduleSetting == null ){
					scheduleSetting = scheduleSetting_top;
				}

				if (check && ListTools.isNotEmpty( wraps )) {
					Integer signProxy = 1;
					List<AttendanceAppealInfo> appealInfos = null;
					AttendanceAppealAuditInfo appealAuditInfo = null;
					List<WoAttendanceAppealInfo> woAppealInfos = null;
					for( Wo detail : wraps ){
						if ( scheduleSetting != null ) {
							signProxy = scheduleSetting.getSignProxy();
						}
						detail.setSignProxy( signProxy );

						//判断并补充申诉信息
						if( detail.getAppealStatus() != 0 ){
							//十有八九已经提过申诉了，查询申诉信息
							appealInfos = attendanceAppealInfoServiceAdv.listWithDetailId( detail.getId() );
							if(ListTools.isNotEmpty( appealInfos ) ){
								woAppealInfos = WoAttendanceAppealInfo.copier.copy( appealInfos );
							}
							if(ListTools.isNotEmpty( woAppealInfos ) ){
								for( WoAttendanceAppealInfo woAppealInfo : woAppealInfos ){
									appealAuditInfo = attendanceAppealInfoServiceAdv.getAppealAuditInfo( woAppealInfo.getId() );
									if( appealAuditInfo != null ){
										woAppealInfo.setAppealAuditInfo( WoAttendanceAppealAuditInfo.copier.copy( appealAuditInfo ));
									}
								}
							}
							detail.setAppealInfos(woAppealInfos);
						}
					}
				}

			} catch (Throwable th) {
				th.printStackTrace();
				result.error(th);
			}
		}
		result.setCount(total);
		result.setData(wraps);
		return result;
	}

	public static class Wi extends WrapInFilter{

	}

	public static class Wo extends AttendanceDetail {

		private static final long serialVersionUID = -5076990764713538973L;

		@FieldDescribe("员工所属组织的排班打卡策略：1-两次打卡（上午上班，下午下班） 2-三次打卡（上午上班，下午下班加中午一次共三次） 3-四次打卡（上午下午都打上班下班卡）")
		private Integer signProxy = 1;

		@FieldDescribe("考勤申诉内容")
		private List<WoAttendanceAppealInfo> appealInfos = null;

		public List<WoAttendanceAppealInfo> getAppealInfos() { return appealInfos; }

		public void setAppealInfos(List<WoAttendanceAppealInfo> appealInfos) { this.appealInfos = appealInfos; }

		public Integer getSignProxy() {
			return signProxy;
		}

		public void setSignProxy(Integer signProxy) {
			this.signProxy = signProxy;
		}

		public static WrapCopier<AttendanceDetail, Wo> copier = WrapCopierFactory.wo(AttendanceDetail.class, Wo.class,
				null, JpaObject.FieldsInvisible);
	}


}