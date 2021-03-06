package com.x.bbs.assemble.control.jaxrs.subjectinfo;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.x.base.core.project.cache.CacheManager;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.bbs.assemble.control.jaxrs.subjectinfo.exception.ExceptionSectionIdEmpty;
import com.x.bbs.assemble.control.jaxrs.subjectinfo.exception.ExceptionSubjectIdEmpty;
import com.x.bbs.assemble.control.jaxrs.subjectinfo.exception.ExceptionSubjectInfoProcess;
import com.x.bbs.assemble.control.jaxrs.subjectinfo.exception.ExceptionSubjectSave;
import com.x.bbs.assemble.control.jaxrs.subjectinfo.exception.ExceptionWrapInConvert;
import com.x.bbs.entity.BBSForumInfo;
import com.x.bbs.entity.BBSSectionInfo;
import com.x.bbs.entity.BBSSubjectInfo;

public class ActionSubjectChangeSection extends BaseAction {

	private static  Logger logger = LoggerFactory.getLogger(ActionSubjectChangeSection.class);

	protected ActionResult<Wo> execute(HttpServletRequest request, EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		BBSSectionInfo sectionInfo = null;
		List<BBSSubjectInfo> subjectInfoList = null;
		List<String> ids = null;
		String sectionId = null;		
		Wi wrapIn = null;
		Wo wo = new Wo();
		Boolean check = true;

		try {
			wrapIn = this.convertToWrapIn( jsonElement, Wi.class );
		} catch (Exception e) {
			check = false;
			Exception exception = new ExceptionWrapInConvert(e, jsonElement);
			result.error(exception);
			logger.error(e, effectivePerson, request, null);
		}

		if (check) {
			if( ListTools.isEmpty(  wrapIn.getSubjectIds() )) {
				check = false;
				Exception exception = new ExceptionSubjectIdEmpty();
				result.error(exception);
			}
			ids = wrapIn.getSubjectIds();
		}

		if (check) {
			if( StringUtils.isEmpty(  wrapIn.getSectionId() )) {
				check = false;
				Exception exception = new ExceptionSectionIdEmpty();
				result.error(exception);
			}
			sectionId = wrapIn.getSectionId();
		}
		
		// ??????????????????????????????
		if (check) {
			try {
				sectionInfo = sectionInfoServiceAdv.get( sectionId );
			} catch (Exception e) {
				check = false;
				Exception exception = new ExceptionSubjectInfoProcess(e, "????????????ID?????????????????????????????????.ID:" + sectionId );
				result.error(exception);
				logger.error(e, effectivePerson, request, null);
			}
		}
		
		if (check) {
			wo.setTotal( ids.size() );
			try {
				subjectInfoList = subjectInfoServiceAdv.list( ids );				
			} catch (Exception e) {
				check = false;
				Exception exception = new ExceptionSubjectSave(e);
				result.error(exception);
				logger.error(e, effectivePerson, request, null);
			}
		}
		if (check) {
			if( ListTools.isNotEmpty( subjectInfoList )) {
				List<String> successList = new ArrayList<>();
				List<String> failtureList = new ArrayList<>();
				for( BBSSubjectInfo subjectInfo : subjectInfoList ) {
					if( subjectInfoServiceAdv.changeSection( subjectInfo, sectionInfo )) {
						successList.add( subjectInfo.getId() );
					}else {
						failtureList.add( subjectInfo.getId() );
					}
				}
				wo.setFailtureList(failtureList);
				wo.setSuccessList(successList);
				CacheManager.notify( BBSForumInfo.class );
				CacheManager.notify( BBSSectionInfo.class );
				CacheManager.notify( BBSSubjectInfo.class );
			}
		}
		result.setCount(Long.parseLong( wo.getTotal().toString() ));
		result.setData(wo);
		return result;
	}

	public static class Wi {

		@FieldDescribe("???????????????????????????Id??????")
		private List<String> subjectIds = null;

		@FieldDescribe("????????????ID")
		private String sectionId = null;

		public List<String> getSubjectIds() {
			return subjectIds;
		}

		public String getSectionId() {
			return sectionId;
		}

		
		public void setSubjectIds(List<String> subjectIds) {
			this.subjectIds = subjectIds;
		}

		public void setSectionId(String sectionId) {
			this.sectionId = sectionId;
		}

		
	}

	public static class Wo{
		
		@FieldDescribe("???????????????????????????ID??????")
		private List<String> successList = null;
		
		@FieldDescribe("???????????????????????????ID??????")
		private List<String> failtureList = null;
		
		@FieldDescribe("?????????????????????????????????")
		private Integer total = null;
		
		public List<String> getSuccessList() {
			return successList;
		}


		public List<String> getFailtureList() {
			return failtureList;
		}


		public void setSuccessList(List<String> successList) {
			this.successList = successList;
		}


		public void setFailtureList(List<String> failtureList) {
			this.failtureList = failtureList;
		}


		public Integer getTotal() {
			return total;
		}

		
		public void setTotal(Integer total) {
			this.total = total;
		}
	}
}