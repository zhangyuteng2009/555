package com.x.attendance.assemble.control.service;

import java.util.Date;
import java.util.List;

import com.x.attendance.assemble.common.date.DateOperation;
import com.x.attendance.entity.AttendanceAppealAuditInfo;
import com.x.base.core.project.tools.ListTools;
import org.apache.commons.lang3.StringUtils;

import com.x.attendance.assemble.control.Business;
import com.x.attendance.entity.AttendanceAppealInfo;
import com.x.attendance.entity.AttendanceDetail;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.entity.annotation.CheckRemoveType;


public class AttendanceAppealInfoService {

	public AttendanceAppealInfo get( EntityManagerContainer emc, String id ) throws Exception {
		if( StringUtils.isEmpty( id ) || "(0)".equals( id )){
    		return null;
    	}
		return emc.find(id, AttendanceAppealInfo.class);
	}
	public List<AttendanceAppealInfo> list(EntityManagerContainer emc, List<String> ids) throws Exception {
		if(ListTools.isEmpty( ids ) ){
    		return null;
    	}
		return new Business(emc).getAttendanceAppealInfoFactory().list(ids);
	}

	public List<AttendanceAppealInfo> listWithDetailId(EntityManagerContainer emc, String id) throws Exception {
		if( StringUtils.isEmpty( id ) ){
			return null;
		}
		return new Business(emc).getAttendanceAppealInfoFactory().listWithDetailId(id);
	}

	public void delete( EntityManagerContainer emc, String id ) throws Exception {
		AttendanceAppealInfo attendanceAppealInfo = null;
		if( StringUtils.isNotEmpty( id ) && !"(0)".equals( id )){
			attendanceAppealInfo = emc.find(id, AttendanceAppealInfo.class);
			if ( null == attendanceAppealInfo ) {
				throw new Exception("需要删除的申诉信息信息不存在。id=" + id);
			} else {
				emc.beginTransaction( AttendanceAppealInfo.class );
				emc.remove( attendanceAppealInfo, CheckRemoveType.all );
				emc.commit();
			}
		}
	}

	public AttendanceAppealInfo save( EntityManagerContainer emc, AttendanceAppealInfo attendanceAppealInfo, AttendanceAppealAuditInfo attendanceAppealAuditInfo ) throws Exception {
		AttendanceDetail attendanceDetail = null;
		AttendanceAppealInfo attendanceAppealInfo_temp = null;
		AttendanceAppealAuditInfo attendanceAppealAuditInfo_temp = null;

		attendanceAppealInfo_temp = emc.find( attendanceAppealInfo.getId(), AttendanceAppealInfo.class);
		attendanceAppealAuditInfo_temp = emc.find( attendanceAppealInfo.getId(), AttendanceAppealAuditInfo.class);
		attendanceDetail = emc.find( attendanceAppealInfo.getDetailId(), AttendanceDetail.class);

		if( attendanceDetail == null ){
			throw new Exception("attendance detail info not exists.");
		}else{
			emc.beginTransaction( AttendanceDetail.class );
			emc.beginTransaction( AttendanceAppealInfo.class );
			emc.beginTransaction( AttendanceAppealAuditInfo.class );

			if ( attendanceAppealInfo_temp != null ) {
				attendanceAppealInfo.copyTo( attendanceAppealInfo_temp, JpaObject.FieldsUnmodify );
				emc.check( attendanceAppealInfo_temp, CheckPersistType.all );				
			}else{
				emc.persist( attendanceAppealInfo, CheckPersistType.all);
			}

			if ( attendanceAppealAuditInfo_temp != null ) {
				attendanceAppealAuditInfo.copyTo( attendanceAppealAuditInfo_temp, JpaObject.FieldsUnmodify );
				attendanceAppealAuditInfo.setId(attendanceAppealInfo.getId());
				emc.check( attendanceAppealAuditInfo_temp, CheckPersistType.all );
			}else{
				emc.persist( attendanceAppealAuditInfo, CheckPersistType.all);
			}

			//将打卡记录表里的打卡数据置为正在申诉中
			attendanceDetail.setAppealStatus(1);
			attendanceDetail.setAppealProcessor( attendanceAppealInfo.getCurrentProcessor() );
			attendanceDetail.setAppealReason( attendanceAppealInfo.getAppealReason());
			attendanceDetail.setAppealDescription( attendanceAppealInfo.getAppealDescription());
			emc.check(attendanceDetail, CheckPersistType.all);
			emc.commit();

			return attendanceAppealInfo;
		}
	}

	public AttendanceAppealInfo updateAppealProcessInfoForFirstProcess(EntityManagerContainer emc, String id, String unitName,
			String topUnitName, String processor, Date processTime, String opinion, Integer status, Boolean autoCommit ) throws Exception {

		AttendanceAppealInfo attendanceAppealInfo = emc.find(id, AttendanceAppealInfo.class);
		AttendanceAppealAuditInfo attendanceAppealAuditInfo = emc.find(id, AttendanceAppealAuditInfo.class);
		if( attendanceAppealInfo == null ){
			throw new Exception( "attendanceAppealInfo{'id':'"+ id +"'} not exists." );
		}
		if( autoCommit ){
			emc.beginTransaction(AttendanceAppealInfo.class);
			emc.beginTransaction(AttendanceAppealAuditInfo.class);
		}
		if( attendanceAppealAuditInfo == null ){
			attendanceAppealAuditInfo = new AttendanceAppealAuditInfo();
			attendanceAppealAuditInfo.setId( attendanceAppealInfo.getId() );
			emc.persist( attendanceAppealAuditInfo, CheckPersistType.all );
		}
		attendanceAppealAuditInfo.setProcessPersonUnit1( unitName );
		attendanceAppealAuditInfo.setProcessPersonTopUnit1(topUnitName);
		attendanceAppealAuditInfo.setProcessPerson1( processor );
		if( processTime == null ){
			attendanceAppealAuditInfo.setProcessTime1( new Date() );
		}else{
			attendanceAppealAuditInfo.setProcessTime1( processTime );
		}
		attendanceAppealAuditInfo.setOpinion1( opinion );
		attendanceAppealInfo.setStatus( status );
		emc.check(attendanceAppealInfo, CheckPersistType.all);
		emc.check(attendanceAppealAuditInfo, CheckPersistType.all);

		if( autoCommit ){
			emc.commit();
		}
		return attendanceAppealInfo;
	}

	public AttendanceAppealInfo updateAppealProcessInfoForSecondProcess( EntityManagerContainer emc, String id,
			String unitName, String topUnitName, String processor, Date processTime, String opinion,
			Integer status, Boolean autoCommit ) throws Exception {
		AttendanceAppealInfo attendanceAppealInfo = emc.find(id, AttendanceAppealInfo.class);
		AttendanceAppealAuditInfo attendanceAppealAuditInfo = emc.find(id, AttendanceAppealAuditInfo.class);
		if( attendanceAppealInfo == null ){
			throw new Exception( "attendanceAppealInfo{'id':'"+ id +"'} not exists." );
		}
		if( autoCommit ){
			emc.beginTransaction(AttendanceAppealInfo.class);
			emc.beginTransaction(AttendanceAppealAuditInfo.class);
		}
		if( attendanceAppealAuditInfo == null ){
			attendanceAppealAuditInfo = new AttendanceAppealAuditInfo();
			attendanceAppealAuditInfo.setId( attendanceAppealInfo.getId() );
			emc.persist( attendanceAppealAuditInfo, CheckPersistType.all );
		}
		attendanceAppealAuditInfo.setProcessPersonUnit2( unitName );
		attendanceAppealAuditInfo.setProcessPersonTopUnit2(topUnitName);
		attendanceAppealAuditInfo.setProcessPerson2( processor );
		if( processTime == null ){
			attendanceAppealAuditInfo.setProcessTime2( new Date() );
		}else{
			attendanceAppealAuditInfo.setProcessTime2(processTime);
		}
		attendanceAppealAuditInfo.setOpinion2( opinion );
		attendanceAppealInfo.setStatus( status );
		emc.check(attendanceAppealInfo, CheckPersistType.all);
		
		if( autoCommit ){
			emc.commit();
		}
		return attendanceAppealInfo;
	}

	public void archive( EntityManagerContainer emc, String id, String datetime ) throws Exception {
		if( id == null ){
			throw new Exception("id can not be null.");
		}
		if( datetime == null ){
			datetime = new DateOperation().getNowDateTime();
		}
		AttendanceAppealInfo attendanceAppealInfo = emc.find( id, AttendanceAppealInfo.class );
		emc.beginTransaction(AttendanceAppealInfo.class);
		if( attendanceAppealInfo != null ){
			attendanceAppealInfo.setArchiveTime( datetime );
			emc.check(attendanceAppealInfo, CheckPersistType.all);
		}else{
			throw new Exception("attendanceAppealInfo{'id':'"+ id +"'} is not exists.");
		}
		emc.commit();
	}



}
