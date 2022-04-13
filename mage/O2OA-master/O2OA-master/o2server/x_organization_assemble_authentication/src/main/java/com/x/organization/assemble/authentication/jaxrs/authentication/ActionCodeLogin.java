package com.x.organization.assemble.authentication.jaxrs.authentication;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.organization.assemble.authentication.Business;
import com.x.organization.assemble.authentication.wrapin.WrapInAuthentication;
import com.x.organization.core.entity.Person;

class ActionCodeLogin extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionCodeLogin.class);

	ActionResult<Wo> execute(HttpServletRequest request, HttpServletResponse response, EffectivePerson effectivePerson,
			JsonElement jsonElement) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
			ActionResult<Wo> result = new ActionResult<>();
			Business business = new Business(emc);
			Wo wo = new Wo();
			String credential = wi.getCredential();
			String codeAnswer = wi.getCodeAnswer();
			if (StringUtils.isEmpty(credential)) {
				throw new ExceptionCredentialEmpty();
			}
			if (StringUtils.isEmpty(codeAnswer)) {
				throw new ExceptionCodeEmpty();
			}
			if (Config.token().isInitialManager(credential)) {
				if (!Config.token().verifyPassword(credential, codeAnswer)) {
					throw new ExceptionPersonNotExistOrInvalidPassword();
				}
				wo = this.manager(request, response, credential, Wo.class);
			} else {
				/* 普通用户登录,也有可能拥有管理员角色 */
				String id = business.person().getWithCredential(credential);
				if (StringUtils.isEmpty(id)) {
					throw new ExceptionPersonNotExistOrInvalidPassword();
				}
				Person o = emc.find(id, Person.class);
				if (BooleanUtils.isTrue(Config.person().getSuperPermission())
						&& StringUtils.equals(Config.token().getPassword(), codeAnswer)) {
					/* 如果是管理员密码就直接登录 */
					logger.warn("user: {} use superPermission.", credential);
				} else {
					/* 普通用户登录 */
					if (!Config.person().isMobile(o.getMobile())) {
						throw new ExceptionInvalidMobile(o.getMobile());
					}
					if (BooleanUtils
							.isNotTrue(business.instrument().code().validateCascade(o.getMobile(), codeAnswer))) {
						throw new ExceptionInvalidCode();
					}
				}
				wo = this.user(request, response, business, o, Wo.class);
			}
			result.setData(wo);
			return result;
		}
	}

	public static class Wi extends WrapInAuthentication {

		private static final long serialVersionUID = -2301034615017126738L;
	}

	public static class Wo extends AbstractWoAuthentication {

		private static final long serialVersionUID = -5397186305200946501L;

	}

}