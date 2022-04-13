package com.x.processplatform.assemble.surface.jaxrs.attachment;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.x.base.core.project.config.StorageMapping;
import com.x.processplatform.assemble.surface.ThisApplication;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoFile;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.DateTools;
import com.x.general.core.entity.GeneralFile;
import com.x.processplatform.assemble.surface.Business;
import com.x.processplatform.core.entity.content.Attachment;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.content.WorkCompleted;

class ActionBatchDownloadWithWorkOrWorkCompleted extends BaseAction {

	private static final String SITE_SEPARATOR = "~";

	private static final String FILE_SEPARATOR = ",";

	private static Logger logger = LoggerFactory.getLogger(ActionBatchDownloadWithWorkOrWorkCompleted.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String workId, String site, String fileName, String flag)
			throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			String title = "";
			String job = "";
			Work work = emc.fetch(workId, Work.class);
			if (work == null) {
				WorkCompleted workCompleted = emc.fetch(workId, WorkCompleted.class);
				if (null == workCompleted) {
					throw new Exception("workId: " + workId + " not exist in work or workCompleted");
				}
				if (!business.readable(effectivePerson, workCompleted)) {
					throw new ExceptionWorkCompletedAccessDenied(effectivePerson.getDistinguishedName(),
							workCompleted.getTitle(), workCompleted.getId());
				}
				title = workCompleted.getTitle();
				job = workCompleted.getJob();
			} else {
				if (!business.readable(effectivePerson, work)) {
					throw new ExceptionAccessDenied(effectivePerson, work);
				}
				title = work.getTitle();
				job = work.getJob();
			}
			List<Attachment> attachmentList;
			if (StringUtils.isBlank(site) || EMPTY_SYMBOL.equals(site)) {
				attachmentList = business.attachment().listWithJobObject(job);
			} else if (site.indexOf(SITE_SEPARATOR) == -1) {
				attachmentList = emc.listEqualAndEqual(Attachment.class, Attachment.job_FIELDNAME, job,
						Attachment.site_FIELDNAME, site);
			} else {
				attachmentList = emc.listEqualAndIn(Attachment.class, Attachment.job_FIELDNAME, job,
						Attachment.site_FIELDNAME, Arrays.asList(site.split(SITE_SEPARATOR)));
			}

			List<String> identities = business.organization().identity().listWithPerson(effectivePerson);
			List<String> units = business.organization().unit().listWithPerson(effectivePerson);
			List<Attachment> readableAttachmentList = new ArrayList<>();
			for (Attachment attachment : attachmentList) {
				if (this.read(attachment, effectivePerson, identities, units, business)) {
					readableAttachmentList.add(attachment);
				}
			}
			if (StringUtils.isBlank(fileName)) {
				if(title.length()>60){
					title = title.substring(0, 60);
				}
				fileName = title + DateTools.format(new Date(), DateTools.formatCompact_yyyyMMddHHmmss) + ".zip";
			} else {
				String extension = FilenameUtils.getExtension(fileName);
				if (StringUtils.isEmpty(extension)) {
					fileName = fileName + ".zip";
				}
			}

			Map<String, byte[]> map = new HashMap<>();
			this.assembleFile(business, map, flag);

			fileName = StringUtils.replaceEach(fileName,
					new String[] { "/",":","*","?","<<",">>","|","<",">","\\" }, new String[] { "","","","","","","","","","" });
			logger.info("batchDown to {}，att size {}, from work {}", fileName, attachmentList.size(), workId);
			try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
				business.downToZip(readableAttachmentList, os, map);
				byte[] bs = os.toByteArray();
				Wo wo = new Wo(bs, this.contentType(false, fileName), this.contentDisposition(false, fileName));
				result.setData(wo);
			}

			return result;
		}
	}

	private void assembleFile(Business business, Map<String, byte[]> map, String files) throws Exception {
		EntityManagerContainer emc = business.entityManagerContainer();
		if (StringUtils.isNotEmpty(files)) {
			String[] flagList = files.split(FILE_SEPARATOR);
			for (String flag : flagList) {
				if(StringUtils.isNotBlank(flag)) {
					GeneralFile generalFile = emc.find(flag.trim(), GeneralFile.class);
					if (generalFile != null) {
						StorageMapping gfMapping = ThisApplication.context().storageMappings().get(GeneralFile.class,
								generalFile.getStorage());
						map.put(generalFile.getName(), generalFile.readContent(gfMapping));

						generalFile.deleteContent(gfMapping);
						emc.beginTransaction(GeneralFile.class);
						emc.delete(GeneralFile.class, generalFile.getId());
						emc.commit();
					}
				}
			}
		}
	}

	public static class Wo extends WoFile {

		public Wo(byte[] bytes, String contentType, String contentDisposition) {
			super(bytes, contentType, contentDisposition);
		}

	}

}
