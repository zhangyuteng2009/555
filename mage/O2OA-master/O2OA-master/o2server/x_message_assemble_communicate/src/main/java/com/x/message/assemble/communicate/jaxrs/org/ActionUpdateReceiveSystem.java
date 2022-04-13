package com.x.message.assemble.communicate.jaxrs.org;

import java.util.ArrayList;
import java.util.List;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.message.core.entity.Org;

class ActionUpdateReceiveSystem extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionUpdateReceiveSystem.class);

	ActionResult<Wo> execute(EffectivePerson effectivePerson, String id,String consumedModule) throws Exception {
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			
			ActionResult<Wo> result = new ActionResult<>();
			emc.beginTransaction(Org.class);
			
			Org org = emc.find(id, Org.class);
			
			if (null == org) {
				throw new ExceptionEntityNotExist(id, Org.class);
			}
						
			String module =  org.getConsumedModule(); 
			if(module ==null) {
				module = "," + consumedModule + ",";
			}else {
				module  = module + "," +consumedModule;
			}
			
			org.setConsumedModule(module);
			
			emc.commit();
			
			Wo wo = new Wo();
			wo.setId(org.getId());
			result.setData(wo);
			return result;
			
		}
	}

	public static class Wi extends GsonPropertyObject {

		@FieldDescribe("标识")
		List<String> idList = new ArrayList<>();

		public List<String> getIdList() {
			return idList;
		}

		public void setIdList(List<String> idList) {
			this.idList = idList;
		}

	}

	public static class Wo extends WoId {
		
	}

}
