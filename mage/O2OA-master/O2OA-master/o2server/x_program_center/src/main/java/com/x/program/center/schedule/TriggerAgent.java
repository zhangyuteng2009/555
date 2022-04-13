package com.x.program.center.schedule;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.script.Bindings;
import javax.script.CompiledScript;
import javax.script.ScriptContext;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.concurrent.BasicThreadFactory;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.project.cache.Cache.CacheCategory;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.config.CenterServer;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.connection.ActionResponse;
import com.x.base.core.project.connection.CipherConnectionAction;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.script.AbstractResources;
import com.x.base.core.project.scripting.JsonScriptingExecutor;
import com.x.base.core.project.scripting.ScriptingFactory;
import com.x.base.core.project.tools.CronTools;
import com.x.base.core.project.tools.DateTools;
import com.x.base.core.project.tools.ListTools;
import com.x.base.core.project.webservices.WebservicesClient;
import com.x.organization.core.express.Organization;
import com.x.program.center.Business;
import com.x.program.center.ThisApplication;
import com.x.program.center.core.entity.Agent;
import com.x.program.center.core.entity.Agent_;

/**
 * 定时代理任务处理
 * 
 * @author sword
 */
public class TriggerAgent extends BaseAction {

	private static Logger logger = LoggerFactory.getLogger(TriggerAgent.class);

	private static final CopyOnWriteArrayList<String> LOCK = new CopyOnWriteArrayList<>();

	private static final ExecutorService executorService = new ScheduledThreadPoolExecutor(
			Runtime.getRuntime().availableProcessors(),
			new BasicThreadFactory.Builder().namingPattern("triggerAgent-pool-%d").daemon(true).build());

	@Override
	public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
		try {
			if (pirmaryCenter()) {
				List<Pair> list;
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					Business business = new Business(emc);
					list = this.list(business);
				}
				if (list != null) {
					list.stream().forEach(this::trigger);
				}
			}
		} catch (Exception e) {
			logger.error(e);
			throw new JobExecutionException(e);
		}
	}

	private void trigger(Pair pair) {
		try {
			if (StringUtils.isEmpty(pair.getCron())) {
				return;
			}
			Date date = CronTools.next(pair.getCron(), pair.getLastStartTime());
			if (date.before(new Date())) {
				if (LOCK.contains(pair.getId())) {
					throw new ExceptionAgentLastNotEnd(pair);
				}
				Agent agent = null;
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					agent = emc.find(pair.getId(), Agent.class);
					if (null != agent) {
						emc.beginTransaction(Agent.class);
						agent.setLastStartTime(new Date());
						emc.commit();
					}
				}
				if (null != agent && agent.getEnable()) {
					logger.info("trigger agent : {}, name :{}, cron: {}, last start time: {}.", pair.getId(),
							pair.getName(), pair.getCron(),
							(pair.getLastStartTime() == null ? "" : DateTools.format(pair.getLastStartTime())));
					ExecuteThread thread = new ExecuteThread(agent);
					executorService.execute(thread);
				}

			}
		} catch (Exception e) {
			logger.error(e);
		}
	}

	private List<Pair> list(Business business) throws Exception {
		EntityManagerContainer emc = business.entityManagerContainer();
		EntityManager em = emc.get(Agent.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
		Root<Agent> root = cq.from(Agent.class);
		Path<String> pathId = root.get(Agent_.id);
		Path<String> pathName = root.get(Agent_.name);
		Path<String> pathCron = root.get(Agent_.cron);
		Path<Date> pathLastEndTime = root.get(Agent_.lastEndTime);
		Path<Date> pathLastStartTime = root.get(Agent_.lastStartTime);
		Predicate p = cb.equal(root.get(Agent_.enable), true);
		List<Tuple> list = em
				.createQuery(cq.multiselect(pathId, pathName, pathCron, pathLastEndTime, pathLastStartTime).where(p))
				.getResultList();
		return list.stream()
				.map(o -> new Pair(o.get(pathId), o.get(pathName), o.get(pathCron), o.get(pathLastStartTime)))
				.distinct().collect(Collectors.toList());
	}

	class Pair {
		Pair(String id, String name, String cron, Date lastStartTime) {
			this.id = id;
			this.name = name;
			this.cron = cron;
			this.lastStartTime = lastStartTime;
		}

		private String id;

		private String name;

		private String cron;

		private Date lastStartTime;

		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public String getCron() {
			return cron;
		}

		public void setCron(String cron) {
			this.cron = cron;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public Date getLastStartTime() {
			return lastStartTime;
		}

		public void setLastStartTime(Date lastStartTime) {
			this.lastStartTime = lastStartTime;
		}

	}

	public class ExecuteThread implements Runnable {

		private Agent agent;

		public ExecuteThread(Agent agent) {
			this.agent = agent;
		}

		@Override
		public void run() {
			if (StringUtils.isNotEmpty(agent.getText())) {
				try {
					LOCK.add(agent.getId());
					Map.Entry<String, CenterServer> centerServer = getCenterServer();
					if (centerServer == null) {
						evalLocal();
					} else {
						evalRemote(centerServer);
					}
				} catch (Exception e) {
					logger.error(e);
				} finally {
					LOCK.remove(agent.getId());
				}
			}
		}

		private void evalRemote(Map.Entry<String, CenterServer> centerServer) {
			try {
				CipherConnectionAction.get(false,
						Config.url_x_program_center_jaxrs(centerServer, "agent", agent.getId(), "execute") + "?tt="
								+ System.currentTimeMillis());
			} catch (Exception e) {
				logger.warn("trigger agent {} on center {} error:{}", agent.getName(), centerServer.getKey(),
						e.getMessage());
			}
		}

		private void evalLocal() throws Exception {
			CacheCategory cacheCategory = new CacheCategory(Agent.class);
			CacheKey cacheKey = new CacheKey(TriggerAgent.class, agent.getId());
			CompiledScript compiledScript = null;
			Optional<?> optional = CacheManager.get(cacheCategory, cacheKey);
			if (optional.isPresent()) {
				compiledScript = (CompiledScript) optional.get();
			} else {
				compiledScript = ScriptingFactory.functionalizationCompile(agent.getText());
				CacheManager.put(cacheCategory, cacheKey, compiledScript);
			}
			ScriptContext scriptContext = ScriptingFactory.scriptContextEvalInitialServiceScript();
			Bindings bindings = scriptContext.getBindings(ScriptContext.ENGINE_SCOPE);
			Resources resources = new Resources();
			resources.setContext(ThisApplication.context());
			resources.setOrganization(new Organization(ThisApplication.context()));
			resources.setWebservicesClient(new WebservicesClient());
			resources.setApplications(ThisApplication.context().applications());
			bindings.put(ScriptingFactory.BINDING_NAME_SERVICE_RESOURCES, resources);
			eval(compiledScript, scriptContext);
			updateLastEndTime();
		}

		private void updateLastEndTime() {
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Agent o = emc.find(agent.getId(), Agent.class);
				if (null != o) {
					emc.beginTransaction(Agent.class);
					o.setLastEndTime(new Date());
					emc.commit();
				}
			} catch (Exception e) {
				logger.error(e);
			}
		}

		private void eval(CompiledScript compiledScript, ScriptContext scriptContext) throws ExceptionAgentEval {
			try {
				JsonScriptingExecutor.jsonElement(compiledScript, scriptContext);
			} catch (Exception e) {
				throw new ExceptionAgentEval(e, e.getMessage(), agent.getId(), agent.getName(), agent.getAlias(),
						agent.getText());
			}
		}

		private Map.Entry<String, CenterServer> getCenterServer() {
			Map.Entry<String, CenterServer> centerServer = null;
			try {
				Map.Entry<String, CenterServer> entry;
				List<Map.Entry<String, CenterServer>> list = Config.nodes().centerServers().orderedEntry();
				if (ListTools.isNotEmpty(list)) {
					Collections.shuffle(list);
					entry = list.get(0);
					ActionResponse response = CipherConnectionAction.get(false, 2000, 4000,
							Config.url_x_program_center_jaxrs(entry, "echo"));
					JsonElement jsonElement = response.getData(JsonElement.class);
					if (null != jsonElement && (!jsonElement.isJsonNull())) {
						centerServer = entry;
					}
				}
			} catch (Exception e) {
				logger.debug(e.getMessage());
			}
			return centerServer;
		}

	}

	public static class Resources extends AbstractResources {
		private Organization organization;

		public Organization getOrganization() {
			return organization;
		}

		public void setOrganization(Organization organization) {
			this.organization = organization;
		}

	}

}
