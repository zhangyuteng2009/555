package com.x.program.center.jaxrs.appstyle;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.imgscalr.Scalr;
import org.imgscalr.Scalr.Method;

import com.x.base.core.project.config.AppStyle.Image;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;

/*
 * 225 *225
 */
class ActionImageLoginAvatar extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson, byte[] bytes, FormDataContentDisposition disposition)
			throws Exception {
		try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
				ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
			ActionResult<Wo> result = new ActionResult<>();
			if (!effectivePerson.isManager()) {
				throw new ExceptionAccessDenied(effectivePerson.getName());
			}
			BufferedImage image = ImageIO.read(bais);
			BufferedImage scalrImage = Scalr.resize(image, Method.QUALITY, 225, 225);
			ImageIO.write(scalrImage, "png", baos);
			String value = Base64.encodeBase64String(baos.toByteArray());
			Image o = Image.login_avatar();
			o.setValue(value);
			// 由于getImages设置了检查,所以只能对images进行处理
			Set<Image> images = Config.appStyle().getImages();
			images = images.stream().filter(img -> (!StringUtils.equals(img.getName(), Image.name_login_avatar)))
					.collect(Collectors.toSet());
			images.add(o);
			Config.appStyle().setImages(new TreeSet<>(images));
			Config.appStyle().save();
			Wo wo = new Wo();
			wo.setValue(true);
			result.setData(wo);
			Config.flush();
			return result;
		}
	}

	public static class Wo extends WrapBoolean {

	}

}