package com.x.organization.assemble.authentication.jaxrs.sso;

import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.x.base.core.project.tools.ListTools;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.config.Token.Sso;
import com.x.base.core.project.exception.ExceptionPersonNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.http.HttpToken;
import com.x.base.core.project.http.TokenType;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.organization.OrganizationDefinition;
import com.x.base.core.project.tools.Crypto;
import com.x.organization.assemble.authentication.Business;
import com.x.organization.core.entity.Person;

class ActionGetLogin extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionGetLogin.class);

	ActionResult<Wo> execute(HttpServletRequest request, HttpServletResponse response, EffectivePerson effectivePerson,
			String client, String token) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			if (StringUtils.isEmpty(client)) {
				throw new ExceptionClientEmpty();
			}
			if (StringUtils.isEmpty(token)) {
				throw new ExceptionEmptyToken();
			}
			Sso sso = Config.token().findSso(client);
			if (null == sso) {
				throw new ExceptionClientNotExist(client);
			}
			if (StringUtils.isEmpty(sso.getKey())) {
				throw new ExceptionEmptyKey();
			}
			String content = null;
			logger.debug("decrypt sso client:{}, token:{}, key:{}.", client, token, sso.getKey());
			try {
				content = Crypto.decrypt(token, sso.getKey());
				logger.debug("decrypt sso client:{}, token:{}, key:{}, content:{}.", client, token, sso.getKey(),
						content);
			} catch (Exception e) {
				throw new ExceptionReadToken(client, token);
			}
			String flag = StringUtils.substringBefore(content, "#");
			flag = URLDecoder.decode(flag, "UTF-8");
			String timeString = StringUtils.substringAfter(content, "#");
			if (StringUtils.isEmpty(flag)) {
				throw new ExceptionEmptyCredential();
			}
			Date date = new Date(Long.parseLong(timeString));
			Date now = new Date();
			if (Math.abs((now.getTime() - date.getTime())) >= (60000 * 60 * 12)) {
				throw new ExceptionTokenExpired();
			}
			if (Config.token().isInitialManager(flag)) {
				throw new ExceptionAdmin();
			}

			Business business = new Business(emc);
			String personId = business.person().getWithCredential(flag);
			if (StringUtils.isEmpty(personId)) {
				throw new ExceptionPersonNotExist(flag);
			}
			Person person = emc.find(personId, Person.class);
			Wo wo = Wo.copier.copy(person);
			List<String> roles = business.organization().role().listWithPerson(person.getDistinguishedName());
			wo.setRoleList(roles);
			TokenType tokenType = TokenType.user;
			if (roles.contains(OrganizationDefinition.toDistinguishedName(OrganizationDefinition.Manager))) {
				tokenType = TokenType.manager;
			} else if (roles.contains(OrganizationDefinition.toDistinguishedName(OrganizationDefinition.SystemManager))) {
				tokenType = TokenType.systemManager;
			} else if (roles.contains(OrganizationDefinition.toDistinguishedName(OrganizationDefinition.SecurityManager))) {
				tokenType = TokenType.securityManager;
			} else if (roles.contains(OrganizationDefinition.toDistinguishedName(OrganizationDefinition.AuditManager))) {
				tokenType = TokenType.auditManager;
			}
			EffectivePerson effective = new EffectivePerson(wo.getDistinguishedName(), tokenType,
					Config.token().getCipher());
			wo.setToken(effective.getToken());
			HttpToken httpToken = new HttpToken();
			httpToken.setToken(request, response, effective);
			result.setData(wo);
		}
		return result;
	}

	public static class Wo extends Person {

		private static final long serialVersionUID = 4901269474728548509L;

		public static List<String> Excludes = new ArrayList<>(JpaObject.FieldsInvisible);

		static {
			Excludes.add(Person.password_FIELDNAME);
		}

		static WrapCopier<Person, Wo> copier = WrapCopierFactory.wo(Person.class, Wo.class, null, Excludes);

		@FieldDescribe("令牌")
		private String token;

		@FieldDescribe("角色")
		private List<String> roleList;

		public String getToken() {
			return token;
		}

		public void setToken(String token) {
			this.token = token;
		}

		public List<String> getRoleList() {
			return roleList;
		}

		public void setRoleList(List<String> roleList) {
			this.roleList = roleList;
		}
	}

}
