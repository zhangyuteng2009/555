package com.x.file.assemble.control.jaxrs.file;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;

import javax.imageio.ImageIO;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.EnumUtils;
import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.imgscalr.Scalr;
import org.imgscalr.Scalr.Method;
import org.imgscalr.Scalr.Mode;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.config.StorageMapping;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.tools.DefaultCharset;
import com.x.file.assemble.control.ThisApplication;
import com.x.file.core.entity.open.File;
import com.x.file.core.entity.open.ReferenceType;

class ActionUpload extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String referenceType, String reference, Integer scale,
			byte[] bytes, FormDataContentDisposition disposition) throws Exception {
		String fileName = "";
		StorageMapping mapping = ThisApplication.context().storageMappings().random(File.class);
		File file = null;
		ReferenceType type = null;
		Wo wo = new Wo();
		ActionResult<Wo> result = new ActionResult<>();

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create();
				ByteArrayInputStream in = new ByteArrayInputStream(bytes)) {
			type = EnumUtils.getEnum(ReferenceType.class, referenceType);
			if (null == mapping) {
				throw new ExceptionAllocateStorageMaaping();
			}
			/** ????????????????????????craeteTime??????path,???????????????,???????????????,???????????? */
			/** ???????????????????????????????????? */
			/** ????????????????????? */
			fileName = new String(disposition.getFileName().getBytes(DefaultCharset.charset_iso_8859_1),
					DefaultCharset.charset);
			fileName = FilenameUtils.getName(fileName);

			if (StringUtils.isEmpty(FilenameUtils.getExtension(fileName))) {
				throw new ExceptionEmptyExtension(fileName);
			}

			/* ??????????????? */
			file = new File(mapping.getName(), fileName, effectivePerson.getDistinguishedName(), type, reference);
			emc.check(file, CheckPersistType.all);
			file.saveContent(mapping, in, fileName);
			emc.beginTransaction(File.class);
			emc.persist(file);
			emc.commit();
			wo.setOrigId(file.getId());

		}

         /*???????????????*/
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create();
				ByteArrayInputStream in = new ByteArrayInputStream(bytes)) {
			if ((scale > 0) && ArrayUtils.contains(IMAGE_EXTENSIONS_COMPRESS, file.getExtension())) {
				String fileNameThumbnail = fileName.substring(0, fileName.lastIndexOf(".")) + "_t" + "."+ file.getExtension();
				File fileThumbnail = new File(mapping.getName(), fileNameThumbnail,effectivePerson.getDistinguishedName(), type, reference);
				/** ?????????????????????????????? */
				try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
					BufferedImage image = ImageIO.read(in);
					if (image.getWidth() > scale) {
						/** ????????????????????????scale????????????????????? */
						BufferedImage scalrImage = Scalr.resize(image, Method.QUALITY, Mode.FIT_TO_WIDTH, scale);
						ImageIO.write(scalrImage, fileThumbnail.getExtension(), baos);
					} else {
						/** ????????????????????????scale???,??????????????????????????? */
						ImageIO.write(image, fileThumbnail.getExtension(), baos);
					}
					try (ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray())) {
						fileThumbnail.saveContent(mapping, bais, fileNameThumbnail);
					}

					emc.beginTransaction(File.class);
					emc.persist(fileThumbnail);
					emc.commit();
					wo.setId(fileThumbnail.getId());
				}

			} else {
				//???????????????,????????????id
				wo.setId(file.getId());
			}
		}

		CacheManager.notify(File.class);
		result.setData(wo);
		return result;
	}

	public static class Wo extends GsonPropertyObject {

		public Wo() {

		}

		public Wo(String id) throws Exception {
			this.id = id;
		}

		@FieldDescribe("?????????id")
		private String id;

		@FieldDescribe("??????id")
		private String origId;

		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public String getOrigId() {
			return origId;
		}

		public void setOrigId(String origId) {
			this.origId = origId;
		}
	}
}
