package com.x.organization.assemble.authentication.jaxrs.authentication;

import java.util.Map;
import java.util.Objects;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.beanutils.PropertyUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.config.Token.OauthClient;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.organization.core.entity.Person;

class ActionOauthBind extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionOauthBind.class);

	ActionResult<Wo> execute(HttpServletRequest request, HttpServletResponse response, EffectivePerson effectivePerson,
			String name, String code, String redirectUri) throws Exception {
		if (effectivePerson.isAnonymous()) {
			throw new ExceptionPersonNotLogin();
		}
		ActionResult<Wo> result = new ActionResult<>();
		// 获取oauthClient对象
		OauthClient oauthClient = oauthClient(name);
		Map<String, Object> param = oauthCreateParam(oauthClient, code, redirectUri);
		logger.debug("oauth create param:{}", param);
		oauthToken(oauthClient, param);
		logger.debug("oauth token param:{}", param);
		oauthCheckAccessToken(param);
		oauthInfo(oauthClient, param);
		logger.debug("oauth info param:{}", param);
		String credential = Objects.toString(param.get(oauthClient.getInfoCredentialField()), "");
		oauthCheckCredential(credential);
		logger.debug("credential:{}", credential);
		Wo wo = new Wo();
		wo.setValue(false);
		if (!Config.token().isInitialManager(credential)) {
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Person o = emc.flag(effectivePerson.getDistinguishedName(), Person.class);
				if (null != o) {
					emc.beginTransaction(Person.class);
					PropertyUtils.setProperty(o, oauthClient.getBindingField(), credential);
					wo.setValue(true);
					emc.commit();
				}
			}
		}
		result.setData(wo);
		return result;
	}

	public static class Wo extends WrapBoolean {

		private static final long serialVersionUID = 1898584836208616046L;

	}

}