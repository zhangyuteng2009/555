package com.x.organization.core.express.identity;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.x.base.core.project.AbstractContext;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.organization.Identity;

class ActionListObject extends BaseAction {

	public static List<? extends Identity> execute(AbstractContext context, Collection<String> collection) throws Exception {
		Wi wi = new Wi();
		if (null != collection) {
			wi.getIdentityList().addAll(collection);
		}
		List<Wo> wos = context.applications().postQuery(applicationClass, "identity/list/object", wi)
				.getDataAsList(Wo.class);
		return wos;
	}

	public static class Wi extends GsonPropertyObject {

		@FieldDescribe("身份")
		private List<String> identityList = new ArrayList<>();

		public List<String> getIdentityList() {
			return identityList;
		}

		public void setIdentityList(List<String> identityList) {
			this.identityList = identityList;
		}

	}

	public static class Wo extends Identity {

	}
}