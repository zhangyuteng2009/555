package com.x.processplatform.service.processing.processor.manual;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;

import javax.script.CompiledScript;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.gson.XGsonBuilder;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.organization.OrganizationDefinition;
import com.x.base.core.project.scripting.JsonScriptingExecutor;
import com.x.base.core.project.tools.ListTools;
import com.x.base.core.project.tools.PropertyTools;
import com.x.processplatform.core.entity.content.Data;
import com.x.processplatform.core.entity.element.Manual;
import com.x.processplatform.service.processing.Business;
import com.x.processplatform.service.processing.processor.AeiObjects;

/**
 * 在Manual环节计算所有的待办人的Identity
 * 
 * @author Rui
 *
 */
public class TranslateTaskIdentityTools {

	private TranslateTaskIdentityTools() {
		// nothing
	}

	private static final Logger LOGGER = LoggerFactory.getLogger(TranslateTaskIdentityTools.class);

	/* 计算manual节点中所有的待办，全部翻译成Identity */
	public static TaskIdentities translate(AeiObjects aeiObjects, Manual manual) throws Exception {
		TaskIdentities taskIdentities = new TaskIdentities();
		/* 正常执行 */
		List<String> units = new ArrayList<>();
		List<String> groups = new ArrayList<>();
		/* 指定的身份 */
		if (ListTools.isNotEmpty(manual.getTaskIdentityList())) {
			taskIdentities.addIdentities(manual.getTaskIdentityList());
		}
		/* 选择了职务 */
		taskIdentities.addIdentities(duty(aeiObjects, manual));
		/* 指定data数据路径值 */
		data(taskIdentities, units, groups, aeiObjects.getData(), manual);
		/* 使用脚本计算 */
		script(taskIdentities, units, groups, aeiObjects, manual);
		/* 指定处理组织 */
		if (ListTools.isNotEmpty(manual.getTaskUnitList())) {
			units.addAll(manual.getTaskUnitList());
		}
		/* 指定处理群组 */
		if (ListTools.isNotEmpty(manual.getTaskGroupList())) {
			groups.addAll(manual.getTaskGroupList());
		}
		if (ListTools.isNotEmpty(units)) {
			taskIdentities.addIdentities(aeiObjects.business().organization().identity().listWithUnitSubDirect(units));
		}
		if (ListTools.isNotEmpty(groups)) {
			taskIdentities.addIdentities(aeiObjects.business().organization().identity().listWithGroup(groups));
		}
		List<String> identities = aeiObjects.business().organization().identity().list(taskIdentities.identities());
		return new TaskIdentities(identities);
	}

	/* 取到指定职务的identity */
	private static List<String> duty(AeiObjects aeiObjects, Manual manual) throws Exception {
		List<String> list = new ArrayList<>();
		if (StringUtils.isNotEmpty(manual.getTaskDuty())) {
			JsonArray array = XGsonBuilder.instance().fromJson(manual.getTaskDuty(), JsonArray.class);
			Iterator<JsonElement> iterator = array.iterator();
			while (iterator.hasNext()) {
				JsonObject o = iterator.next().getAsJsonObject();
				String name = o.get("name").getAsString();
				String code = o.get("code").getAsString();
				CompiledScript compiledScript = aeiObjects.business().element()
						.getCompiledScript(aeiObjects.getActivity(), Business.EVENT_TASKDUTY, name, code);
				List<String> ds = JsonScriptingExecutor.evalDistinguishedNames(compiledScript,
						aeiObjects.scriptContext());
				if (ListTools.isNotEmpty(ds)) {
					for (String str : ds) {
						List<String> os = aeiObjects.business().organization().unitDuty()
								.listIdentityWithUnitWithName(str, name);
						if (ListTools.isNotEmpty(os)) {
							list.addAll(os);
						}
					}
				}
			}
		}
		return ListTools.trim(list, true, true);
	}

	/* 取到script指定的identity */
	private static List<String> script(TaskIdentities taskIdentities, List<String> units, List<String> groups,
			AeiObjects aeiObjects, Manual manual) throws Exception {
		List<String> list = new ArrayList<>();
		if ((StringUtils.isNotEmpty(manual.getTaskScript())) || (StringUtils.isNotEmpty(manual.getTaskScriptText()))) {
			CompiledScript cs = aeiObjects.business().element().getCompiledScript(aeiObjects.getWork().getApplication(),
					manual, Business.EVENT_MANUALTASK);
			JsonScriptingExecutor.jsonElement(cs, aeiObjects.scriptContext(), o -> {
				try {
					addObjectToTaskIdentities(taskIdentities, units, groups,
							JsonScriptingExecutor.Helper.stringOrDistinguishedNameAsList(o));
				} catch (Exception e) {
					LOGGER.error(e);
				}
			});
		}
		return list;
	}

	/* 取得通过路径指定的identity */
	private static void data(TaskIdentities taskIdentities, List<String> units, List<String> groups, Data data,
			Manual manual) throws Exception {
		if (ListTools.isNotEmpty(manual.getTaskDataPathList())) {
			for (String str : ListTools.trim(manual.getTaskDataPathList(), true, true)) {
				Object o = data.find(str);
				if (null != o) {
					addObjectToTaskIdentities(taskIdentities, units, groups, o);
				}
			}
		}
	}

	private static void addObjectToTaskIdentities(TaskIdentities taskIdentities, List<String> units,
			List<String> groups, Object o) throws Exception {
		for (String d : asDistinguishedNames(o)) {
			if (OrganizationDefinition.isIdentityDistinguishedName(d)) {
				Boolean ignore = BooleanUtils.isTrue(BooleanUtils.toBooleanObject(Objects.toString(
						PropertyTools.getOrElse(o, TaskIdentity.IGNOREEMPOWER, Boolean.class, Boolean.FALSE),
						"false")));
				TaskIdentity taskIdentity = new TaskIdentity();
				taskIdentity.setIdentity(d);
				taskIdentity.setIgnoreEmpower(ignore);
				taskIdentities.add(taskIdentity);
			} else if (OrganizationDefinition.isUnitDistinguishedName(d)) {
				units.add(d);
			} else if (OrganizationDefinition.isGroupDistinguishedName(d)) {
				groups.add(d);
			}
		}
	}

	public static List<String> asDistinguishedNames(Object o)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		List<String> list = new ArrayList<>();
		if (null != o) {
			if (o instanceof CharSequence) {
				list.add(Objects.toString(o));
			} else if (o instanceof Iterable) {
				asIterable(o, list);
			}
		}
		return list;
	}

	private static void asIterable(Object o, List<String> list)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		for (Object obj : (Iterable<?>) o) {
			if (null != obj) {
				if (obj instanceof CharSequence) {
					list.add(Objects.toString(obj));
				} else {
					Object d = PropertyUtils.getProperty(obj, JpaObject.DISTINGUISHEDNAME);
					if (null != d) {
						list.add(Objects.toString(d));
					}
				}
			}
		}
	}
}