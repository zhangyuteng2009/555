package com.x.attendance.assemble.control.jaxrs.attendanceschedulesetting;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import com.x.attendance.entity.AttendanceScheduleSetting;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;

public class ActionListAll extends BaseAction {

	private static  Logger logger = LoggerFactory.getLogger(ActionListAll.class);

	protected ActionResult<List<Wo>> execute(HttpServletRequest request, EffectivePerson effectivePerson)
			throws Exception {
		ActionResult<List<Wo>> result = new ActionResult<>();
		List<Wo> wraps = new ArrayList<>();
		List<AttendanceScheduleSetting> attendanceScheduleSettingList = null;
		Boolean check = true;

		if (check) {
			try {
				attendanceScheduleSettingList = attendanceScheduleSettingServiceAdv.listAll();
			} catch (Exception e) {
				check = false;
				Exception exception = new ExceptionAttendanceScheduleProcess(e, "系统查询所有组织排班信息列表时发生异常.");
				result.error(exception);
				logger.error(e, effectivePerson, request, null);
			}
		}
		if (check && attendanceScheduleSettingList != null) {
			try {
				wraps = Wo.copier.copy(attendanceScheduleSettingList);
			} catch (Exception e) {
				check = false;
				Exception exception = new ExceptionAttendanceScheduleProcess(e,
						"将所有查询出来的有状态的导入文件对象转换为可以输出的过滤过属性的对象时发生异常.");
				result.error(exception);
				logger.error(e, effectivePerson, request, null);
			}
		}
		result.setData(wraps);
		return result;
	}

	public static class Wo extends AttendanceScheduleSetting {

		private static final long serialVersionUID = -5076990764713538973L;

		public static WrapCopier<AttendanceScheduleSetting, Wo> copier = WrapCopierFactory
				.wo(AttendanceScheduleSetting.class, Wo.class, null, JpaObject.FieldsInvisible);
	}
}