package com.x.file.assemble.control.jaxrs.attachment;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.output.ByteArrayOutputStream;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.config.StorageMapping;
import com.x.base.core.project.exception.ExceptionWhen;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapString;
import com.x.file.assemble.control.ThisApplication;
import com.x.file.core.entity.personal.Attachment;

class ActionGetBase64 extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			ActionResult<Wo> result = new ActionResult<>();
			Attachment attachment = emc.find(id, Attachment.class, ExceptionWhen.not_found);
			/* 判断文件的当前用户是否是管理员或者文件创建者 或者当前用户在分享或者共同编辑中 */
			if (effectivePerson.isNotManager() && effectivePerson.isNotPerson(attachment.getPerson())
					&& effectivePerson.isNotPerson(attachment.getShareList())
					&& effectivePerson.isNotPerson(attachment.getEditorList())) {
				throw new Exception("person{name:" + effectivePerson.getDistinguishedName() + "} access attachment{id:"
						+ id + "} denied.");
			}
			StorageMapping mapping = ThisApplication.context().storageMappings().get(Attachment.class,
					attachment.getStorage());
			try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
				attachment.readContent(mapping, output);
				String value = Base64.encodeBase64String(output.toByteArray());
				Wo wo = new Wo();
				wo.setValue(value);
				result.setData(wo);
			}
			return result;
		}
	}

	public static class Wo extends WrapString {

	}

}
