package com.x.attendance.assemble.control.jaxrs;

import java.util.Set;

import javax.ws.rs.ApplicationPath;

import com.x.attendance.assemble.control.jaxrs.attachment.FileImportExportAction;
import com.x.attendance.assemble.control.jaxrs.attendanceadmin.AttendanceAdminAction;
import com.x.attendance.assemble.control.jaxrs.attendanceappealinfo.AttendanceAppealInfoAction;
import com.x.attendance.assemble.control.jaxrs.attendancedetail.AttendanceDetailAction;
import com.x.attendance.assemble.control.jaxrs.attendancedetail.AttendanceDetailMobileAction;
import com.x.attendance.assemble.control.jaxrs.attendanceemployeeconfig.AttendanceEmployeeConfigAction;
import com.x.attendance.assemble.control.jaxrs.attendanceimportfileinfo.AttendanceImportFileInfoAction;
import com.x.attendance.assemble.control.jaxrs.attendanceschedulesetting.AttendanceScheduleSettingAction;
import com.x.attendance.assemble.control.jaxrs.attendancesetting.AttendanceSettingAction;
import com.x.attendance.assemble.control.jaxrs.attendancestatistic.AttendanceStatisticAction;
import com.x.attendance.assemble.control.jaxrs.attendancestatistic.AttendanceStatisticShowAction;
import com.x.attendance.assemble.control.jaxrs.attendancestatisticalcycle.AttendanceStatisticalCycleAction;
import com.x.attendance.assemble.control.jaxrs.attendancestatisticrequirelog.AttendanceStatisticRequireLogAction;
import com.x.attendance.assemble.control.jaxrs.attendanceworkdayconfig.AttendanceWorkDayConfigAction;
import com.x.attendance.assemble.control.jaxrs.dingding.DingdingAttendanceAction;
import com.x.attendance.assemble.control.jaxrs.dingdingstatistic.DingdingAttendanceStatisticAction;
import com.x.attendance.assemble.control.jaxrs.fileimport.AttendanceDetailFileImportAction;
import com.x.attendance.assemble.control.jaxrs.qywx.QywxAttendanceAction;
import com.x.attendance.assemble.control.jaxrs.qywxstatistic.QywxAttendanceStatisticAction;
import com.x.attendance.assemble.control.jaxrs.selfholiday.AttendanceSelfHolidayAction;
import com.x.attendance.assemble.control.jaxrs.selfholiday.AttendanceSelfHolidaySimpleAction;
import com.x.attendance.assemble.control.jaxrs.uuid.UUIDAction;
import com.x.attendance.assemble.control.jaxrs.workplace.AttendanceWorkPlaceAction;
import com.x.base.core.project.jaxrs.AbstractActionApplication;

@ApplicationPath("jaxrs")
public class ActionApplication extends AbstractActionApplication {

	public Set<Class<?>> getClasses() {
		this.classes.add(UUIDAction.class);
		this.classes.add(AttendanceWorkPlaceAction.class);
		this.classes.add(AttendanceDetailAction.class);
		this.classes.add(AttendanceDetailMobileAction.class);
		this.classes.add(AttendanceImportFileInfoAction.class);
		this.classes.add(FileImportExportAction.class);
		this.classes.add(AttendanceSettingAction.class);
		this.classes.add(AttendanceWorkDayConfigAction.class);
		this.classes.add(AttendanceAdminAction.class);
		this.classes.add(AttendanceScheduleSettingAction.class);
		this.classes.add(AttendanceSelfHolidayAction.class);
		this.classes.add(AttendanceSelfHolidaySimpleAction.class);
		this.classes.add(AttendanceDetailFileImportAction.class);
		this.classes.add(AttendanceAppealInfoAction.class);
		this.classes.add(AttendanceStatisticAction.class);
		this.classes.add(AttendanceStatisticShowAction.class);
		this.classes.add(AttendanceStatisticalCycleAction.class);
		this.classes.add(AttendanceEmployeeConfigAction.class);
		this.classes.add(AttendanceStatisticRequireLogAction.class);
		this.classes.add(DingdingAttendanceAction.class);
		this.classes.add(QywxAttendanceAction.class);
		this.classes.add(DingdingAttendanceStatisticAction.class);
		this.classes.add(QywxAttendanceStatisticAction.class);
		return this.classes;
	}

}