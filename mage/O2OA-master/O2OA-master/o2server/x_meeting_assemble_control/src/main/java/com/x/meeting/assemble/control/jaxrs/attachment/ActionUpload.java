package com.x.meeting.assemble.control.jaxrs.attachment;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Date;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.config.StorageMapping;
import com.x.base.core.project.exception.ExceptionWhen;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.meeting.assemble.control.Business;
import com.x.meeting.assemble.control.ThisApplication;
import com.x.meeting.core.entity.Attachment;
import com.x.meeting.core.entity.Meeting;

public class ActionUpload extends BaseAction {

	public ActionResult<Wo> execute(EffectivePerson effectivePerson, String meetingId, Boolean summary, String fileName,
			byte[] bytes, FormDataContentDisposition disposition) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			Meeting meeting = emc.find(meetingId, Meeting.class);
			if (null == meeting) {
				throw new ExceptionMeetingNotExist(meetingId);
			}
			business.meetingReadAvailable(effectivePerson, meeting, ExceptionWhen.not_allow);
			try (InputStream input = new ByteArrayInputStream(bytes)) {
				StorageMapping mapping = ThisApplication.context().storageMappings().random(Attachment.class);
				emc.beginTransaction(Attachment.class);
				fileName = StringUtils.isEmpty(fileName) ? disposition.getFileName() : fileName;
				fileName = FilenameUtils.getName(fileName);
				Attachment attachment = this.concreteAttachment(meeting, summary);
				attachment.saveContent(mapping, input, fileName);
				attachment.setLastUpdatePerson(effectivePerson.getDistinguishedName());
				attachment.setLastUpdateTime(new Date());
				emc.persist(attachment, CheckPersistType.all);
				emc.commit();
				Wo wo = new Wo();
				wo.setId(attachment.getId());
				result.setData(wo);
			}
			return result;
		}
	}

	public static class Wo extends WoId {

	}

}