package com.x.general.assemble.control.jaxrs.office;

import java.util.Optional;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoFile;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;

class ActionHtmlToWordResult extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionHtmlToWordResult.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String flag) throws Exception {
		logger.info("{}", flag);
		ActionResult<Wo> result = new ActionResult<>();
		CacheKey cacheKey = new CacheKey(flag);
		Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
		if (optional.isPresent()) {
			HtmlToWordResultObject obj = (HtmlToWordResultObject) optional.get();
			if (!StringUtils.equals(effectivePerson.getDistinguishedName(), obj.getPerson())) {
				throw new ExceptionAccessDenied(effectivePerson);
			}
			Wo wo = new Wo(obj.getBytes(), this.contentType(true, obj.getName()),
					this.contentDisposition(true, obj.getName()));
			result.setData(wo);
		} else {
			throw new ExceptionHtmlToWordResultObject(flag);
		}
		return result;
	}

	public static class Wo extends WoFile {

		public Wo(byte[] bytes, String contentType, String contentDisposition) {
			super(bytes, contentType, contentDisposition);
		}

	}

}