package com.x.program.center.jaxrs.designer;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.enums.DesignerType;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WiDesigner;
import com.x.base.core.project.jaxrs.WrapDesigner;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.base.core.project.tools.PropertyTools;
import com.x.program.center.core.entity.Agent;
import com.x.program.center.core.entity.Invoke;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

class ActionSearch extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(ActionSearch.class);

	ActionResult<List<Wo>> execute(EffectivePerson effectivePerson, JsonElement jsonElement) throws Exception {
		if(!effectivePerson.isManager()){
			throw new ExceptionAccessDenied(effectivePerson);
		}
		Wi wi = this.convertToWrapIn(jsonElement, Wi.class);
		logger.debug("{}开始服务管理设计搜索，关键字：{}", effectivePerson.getDistinguishedName(), wi.getKeyword());
		if(StringUtils.isBlank(wi.getKeyword())){
			throw new ExceptionFieldEmpty("keyword");
		}
		ActionResult<List<Wo>> result = new ActionResult<>();

		List<Wo> resWos = new ArrayList<>();
		List<CompletableFuture<List<Wo>>> list = new ArrayList<>();
		Map<String, List<String>> designerMap = wi.getAppDesigner();
		List<String> appList = wi.getAppIdList();
		if ((wi.getDesignerTypes().isEmpty() || wi.getDesignerTypes().contains(DesignerType.script.toString()))
				&& (designerMap.isEmpty() || designerMap.containsKey(DesignerType.script.toString()))){
			if(appList.isEmpty() || appList.contains("invoke")) {
				list.add(searchInvoke(wi, designerMap.get(DesignerType.script.toString())));
			}
			if(appList.isEmpty() || appList.contains("agent")) {
				list.add(searchAgent(wi, designerMap.get(DesignerType.script.toString())));
			}
		}
		for (CompletableFuture<List<Wo>> cf : list){
			if(resWos.size()<50) {
				resWos.addAll(cf.get(60, TimeUnit.SECONDS));
			}
		}
		if (resWos.size()>50){
			resWos = resWos.subList(0, 50);
		}
		result.setData(resWos);
		result.setCount((long)resWos.size());
		return result;
	}

	private CompletableFuture<List<Wo>> searchAgent(final Wi wi, final List<String> designerIdList) {
		CompletableFuture<List<Wo>> cf = CompletableFuture.supplyAsync(() -> {
			List<Wo> resWos = new ArrayList<>();
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				List<WoAgent> woAgents;
				if (ListTools.isNotEmpty(designerIdList)) {
					woAgents = emc.fetchIn(Agent.class, WoAgent.copier, Agent.id_FIELDNAME, designerIdList);
				} else {
					woAgents = emc.fetchAll(Agent.class, WoAgent.copier);
				}
				for (WoAgent woAgent : woAgents) {
					Map<String, String> map = PropertyTools.fieldMatchKeyword(WoAgent.copier.getCopyFields(), woAgent, wi.getKeyword(),
							wi.getCaseSensitive(), wi.getMatchWholeWord(), wi.getMatchRegExp());
					if (!map.isEmpty()) {
						Wo wo = new Wo();
						wo.setAppId("agent");
						wo.setAppName("代理");
						wo.setDesignerId(woAgent.getId());
						wo.setDesignerName(woAgent.getName());
						wo.setDesignerType(DesignerType.script.toString());
						wo.setUpdateTime(woAgent.getUpdateTime());
						wo.setPatternList(map);
						resWos.add(wo);
					}
				}
				woAgents.clear();
				woAgents = null;
			}catch (Exception e){
				logger.error(e);
			}
			return resWos;
		});
		return cf;
	}

	private CompletableFuture<List<Wo>> searchInvoke(final Wi wi, final List<String> designerIdList) {
		CompletableFuture<List<Wo>> cf = CompletableFuture.supplyAsync(() -> {
			List<Wo> resWos = new ArrayList<>();
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				List<WoInvoke> woInvokes;
				if (ListTools.isNotEmpty(designerIdList)) {
					woInvokes = emc.fetchIn(Invoke.class, WoInvoke.copier, Invoke.id_FIELDNAME, designerIdList);
				} else {
					woInvokes = emc.fetchAll(Invoke.class, WoInvoke.copier);
				}
				for (WoInvoke woInvoke : woInvokes) {
					Map<String, String> map = PropertyTools.fieldMatchKeyword(WoInvoke.copier.getCopyFields(), woInvoke, wi.getKeyword(),
							wi.getCaseSensitive(), wi.getMatchWholeWord(), wi.getMatchRegExp());
					if (!map.isEmpty()) {
						Wo wo = new Wo();
						wo.setAppId("invoke");
						wo.setAppName("接口");
						wo.setDesignerId(woInvoke.getId());
						wo.setDesignerName(woInvoke.getName());
						wo.setDesignerType(DesignerType.script.toString());
						wo.setUpdateTime(woInvoke.getUpdateTime());
						wo.setPatternList(map);
						resWos.add(wo);
					}
				}
				woInvokes.clear();
				woInvokes = null;
			}catch (Exception e){
				logger.error(e);
			}
			return resWos;
		});
		return cf;
	}


	public static class Wi extends WiDesigner {

	}

	public static class Wo extends WrapDesigner{

	}

	public static class WoAgent extends Agent {

		static WrapCopier<Agent, WoAgent> copier = WrapCopierFactory.wo(Agent.class, WoAgent.class,
				JpaObject.singularAttributeField(Agent.class, true, false),null);

	}

	public static class WoInvoke extends Invoke {

		static WrapCopier<Invoke, WoInvoke> copier = WrapCopierFactory.wo(Invoke.class, WoInvoke.class,
				JpaObject.singularAttributeField(Invoke.class, true, false),null);

	}


}
