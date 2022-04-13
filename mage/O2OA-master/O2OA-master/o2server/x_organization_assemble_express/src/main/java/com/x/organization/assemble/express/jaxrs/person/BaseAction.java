package com.x.organization.assemble.express.jaxrs.person;

import java.util.ArrayList;
import java.util.List;

import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.organization.OrganizationDefinition;
import com.x.base.core.project.tools.ListTools;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.cache.Cache.CacheCategory;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.jaxrs.StandardJaxrsAction;
import com.x.organization.assemble.express.Business;
import com.x.organization.core.entity.Group;
import com.x.organization.core.entity.Identity;
import com.x.organization.core.entity.Person;
import com.x.organization.core.entity.PersonAttribute;
import com.x.organization.core.entity.Role;
import com.x.organization.core.entity.Unit;
import com.x.organization.core.entity.UnitAttribute;
import com.x.organization.core.entity.UnitDuty;
import com.x.organization.core.entity.accredit.Empower;

class BaseAction extends StandardJaxrsAction {

	CacheCategory cacheCategory = new CacheCategory(Identity.class, Unit.class, UnitAttribute.class, UnitDuty.class,
			Role.class, Person.class, PersonAttribute.class, Group.class, Empower.class);

	static class WoPersonListAbstract extends GsonPropertyObject {

		@FieldDescribe("个人识别名")
		private List<String> personList = new ArrayList<>();

		public List<String> getPersonList() {
			return personList;
		}

		public void setPersonList(List<String> personList) {
			this.personList = personList;
		}

	}

	protected <T extends com.x.base.core.project.organization.Person> T convert(Business business, Person person,
			Class<T> clz) throws Exception {
		T t = clz.newInstance();
		t.setId(person.getId());
		t.setName(person.getName());
		t.setGenderType(person.getGenderType());
		t.setSignature(person.getSignature());
		t.setDescription(person.getDescription());
		t.setEmployee(person.getEmployee());
		t.setUnique(person.getUnique());
		t.setDistinguishedName(person.getDistinguishedName());
		t.setOrderNumber(person.getOrderNumber());
		if (StringUtils.isNotEmpty(person.getSuperior())) {
			Person s = business.person().pick(person.getSuperior());
			if (null != s) {
				t.setSuperior(s.getDistinguishedName());
			}
		}
		t.setMail(person.getMail());
		t.setWeixin(person.getWeixin());
		t.setQq(person.getQq());
		t.setMobile(person.getMobile());
		t.setOfficePhone(person.getOfficePhone());
		t.setBoardDate(person.getBoardDate());
		t.setBirthday(person.getBirthday());
		t.setAge(person.getAge());
		t.setQiyeweixinId(person.getQiyeweixinId());
		t.setDingdingId(person.getDingdingId());
		t.setZhengwuDingdingId(person.getZhengwuDingdingId());
		t.setWeLinkId(person.getWeLinkId());
		t.setNickName(person.getNickName());
		return t;

	}

	protected static List<String> person_fieldsInvisible = ListTools.toList(JpaObject.FieldsInvisible,
			Person.password_FIELDNAME, Person.icon_FIELDNAME);

	protected <T extends Person> void hide(EffectivePerson effectivePerson, Business business, List<T> list)
			throws Exception {
		if (!effectivePerson.isManager() && (!effectivePerson.isCipher())) {
			if (!business.hasAnyRole(effectivePerson, OrganizationDefinition.OrganizationManager,
					OrganizationDefinition.Manager)) {
				for (Person o : list) {
					if (BooleanUtils.isTrue(o.getHiddenMobile()) && (!StringUtils
							.equals(effectivePerson.getDistinguishedName(), o.getDistinguishedName()))) {
						o.setMobile(Person.HIDDENMOBILESYMBOL);
					}
				}
			}
		}
	}

	protected <T extends Person> void hide(EffectivePerson effectivePerson, Business business, T t)
			throws Exception {
		if (!effectivePerson.isManager() && (!effectivePerson.isCipher())) {
			if (!business.hasAnyRole(effectivePerson, OrganizationDefinition.OrganizationManager,
					OrganizationDefinition.Manager)) {
				if (BooleanUtils.isTrue(t.getHiddenMobile())
						&& (!StringUtils.equals(effectivePerson.getDistinguishedName(), t.getDistinguishedName()))) {
					t.setMobile(Person.HIDDENMOBILESYMBOL);
				}
			}
		}
	}

}
