package com.x.processplatform.service.processing.processor.agent;

import java.util.ArrayList;
import java.util.List;

import javax.script.CompiledScript;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.scripting.JsonScriptingExecutor;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.element.Agent;
import com.x.processplatform.core.entity.element.Route;
import com.x.processplatform.service.processing.Business;
import com.x.processplatform.service.processing.processor.AbstractProcessor;
import com.x.processplatform.service.processing.processor.AeiObjects;

public abstract class AbstractAgentProcessor extends AbstractProcessor {

	private static Logger logger = LoggerFactory.getLogger(AbstractAgentProcessor.class);

	protected AbstractAgentProcessor(EntityManagerContainer entityManagerContainer) throws Exception {
		super(entityManagerContainer);
	}

	@Override
	protected Work arriveProcessing(AeiObjects aeiObjects) throws Exception {
		Agent agent = (Agent) aeiObjects.getActivity();
		/** 更新data中的work和attachment */
		aeiObjects.getData().setWork(aeiObjects.getWork());
		aeiObjects.getData().setAttachmentList(aeiObjects.getAttachments());
		return arriving(aeiObjects, agent);
	}

	@Override
	protected void arriveCommitted(AeiObjects aeiObjects) throws Exception {
		Agent agent = (Agent) aeiObjects.getActivity();
		this.arrivingCommitted(aeiObjects, agent);
	}

	@Override
	protected List<Work> executeProcessing(AeiObjects aeiObjects) throws Exception {
		Agent agent = (Agent) aeiObjects.getActivity();
		List<Work> os = new ArrayList<>();
		try {
			os = executing(aeiObjects, agent);
			return os;
		} catch (Exception e) {
			if (this.hasAgentInterruptScript(agent)) {
				CompiledScript compiledScript = aeiObjects.business().element().getCompiledScript(
						aeiObjects.getWork().getApplication(), aeiObjects.getActivity(), Business.EVENT_AGENTINTERRUPT);
				JsonScriptingExecutor.eval(compiledScript, aeiObjects.scriptContext());
			}
			throw e;
		}
	}

	@Override
	protected void executeCommitted(AeiObjects aeiObjects, List<Work> works) throws Exception {
		Agent agent = (Agent) aeiObjects.getActivity();
		this.executingCommitted(aeiObjects, agent, works);
	}

	@Override
	protected List<Route> inquireProcessing(AeiObjects aeiObjects) throws Exception {
		Agent agent = (Agent) aeiObjects.getActivity();
		return inquiring(aeiObjects, agent);
	}

	@Override
	protected void inquireCommitted(AeiObjects aeiObjects) throws Exception {
		Agent agent = (Agent) aeiObjects.getActivity();
		this.inquiringCommitted(aeiObjects, agent);
	}

	protected abstract Work arriving(AeiObjects aeiObjects, Agent agent) throws Exception;

	protected abstract void arrivingCommitted(AeiObjects aeiObjects, Agent agent) throws Exception;

	protected abstract List<Work> executing(AeiObjects aeiObjects, Agent agent) throws Exception;

	protected abstract void executingCommitted(AeiObjects aeiObjects, Agent agent, List<Work> works) throws Exception;

	protected abstract List<Route> inquiring(AeiObjects aeiObjects, Agent agent) throws Exception;

	protected abstract void inquiringCommitted(AeiObjects aeiObjects, Agent agent) throws Exception;

	private boolean hasAgentInterruptScript(Agent agent) throws Exception {
		return StringUtils.isNotEmpty(agent.getAgentInterruptScript())
				|| StringUtils.isNotEmpty(agent.getAgentInterruptScriptText());
	}
}