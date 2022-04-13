package com.x.attendance.assemble.control.jaxrs.attendanceadmin;

import javax.servlet.http.HttpServletRequest;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;

public class ActionDelete extends BaseAction {
	
	private static  Logger logger = LoggerFactory.getLogger( ActionDelete.class );
	
	protected ActionResult<Wo> execute( HttpServletRequest request, EffectivePerson effectivePerson, String id ) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		EffectivePerson currentPerson = this.effectivePerson(request);
		Boolean check = true;

		if (check) {
			if (id == null || id.isEmpty() || "(0)".equals(id)) {
				check = false;
				result.error(new Exception("传入的id为空，或者不合法，无法查询数据。"));
			}
		}
		if (check) {
			try {
				attendanceAdminServiceAdv.delete(id);
				result.setData(new Wo(id));
			} catch (Exception e) {
				check = false;
				Exception exception = new ExceptionAttendanceAdminProcess( e, "系统删除考勤打卡记录信息时发生异常。ID:" + id );
				result.error(exception);
				logger.error(e, currentPerson, request, null);
			}
		}
		return result;
	}
	
	public static class Wo extends WoId {
		public Wo( String id ) {
			setId( id );
		}
	}
}