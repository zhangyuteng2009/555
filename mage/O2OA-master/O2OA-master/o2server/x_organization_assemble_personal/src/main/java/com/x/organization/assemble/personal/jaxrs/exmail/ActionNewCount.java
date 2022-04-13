package com.x.organization.assemble.personal.jaxrs.exmail;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.connection.HttpConnection;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WrapCount;
import com.x.organization.assemble.personal.Business;
import com.x.organization.core.entity.Person;

/**
 * 
 * @author ray
 *
 */
class ActionNewCount extends BaseAction {

	ActionResult<Wo> execute(EffectivePerson effectivePerson) throws Exception {

		checkEnable();

		ActionResult<Wo> result = new ActionResult<>();
		Wo wo = new Wo();

		if ((!effectivePerson.isAnonymous()) && (!effectivePerson.isCipher())) {
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Business business = new Business(emc);
				wo = this.get(business, effectivePerson);
			}
		}

		result.setData(wo);
		return result;
	}

	private Wo get(Business business, EffectivePerson effectivePerson) throws Exception {
		Wo wo = new Wo();
		wo.setCount(0L);
		Person person = business.person().pick(effectivePerson.getDistinguishedName());
		String mail = person.getMail();
		String address = Config.exmail().getNewCountAddress() + "?access_token="
				+ Config.exmail().newRemindAccessToken() + "&userid=" + mail;
		Resp resp = HttpConnection.getAsObject(address, null, Resp.class);
		if (resp.errcode == null || resp.errcode != 0) {
			throw new ExceptionNewCount(gson.toJson(resp));
		}
		wo.setCount(resp.count);
		return wo;
	}

	public static class Resp {

		private Integer errcode;
		private String errmsg;
		private Long count;

		public Integer getErrcode() {
			return errcode;
		}

		public void setErrcode(Integer errcode) {
			this.errcode = errcode;
		}

		public String getErrmsg() {
			return errmsg;
		}

		public void setErrmsg(String errmsg) {
			this.errmsg = errmsg;
		}

		public Long getCount() {
			return count;
		}

		public void setCount(Long count) {
			this.count = count;
		}

	}

	public static class Wo extends WrapCount {

		private static final long serialVersionUID = 1L;
	}

}