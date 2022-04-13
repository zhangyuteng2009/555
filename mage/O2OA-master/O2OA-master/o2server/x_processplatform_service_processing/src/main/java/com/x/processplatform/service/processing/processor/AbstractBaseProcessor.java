package com.x.processplatform.service.processing.processor;

import java.lang.reflect.InvocationTargetException;
import java.util.Comparator;
import java.util.Date;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.google.gson.Gson;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.gson.XGsonBuilder;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.base.core.project.tools.StringTools;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.content.WorkLog;
import com.x.processplatform.core.entity.content.WorkStatus;
import com.x.processplatform.core.entity.element.Activity;
import com.x.processplatform.core.entity.element.Embed;
import com.x.processplatform.core.entity.element.Form;
import com.x.processplatform.core.entity.element.Process;
import com.x.processplatform.service.processing.Business;

/***
 * 基础的Processor类,属性以及WorkLog处理
 */
public abstract class AbstractBaseProcessor {

	private static final Logger LOGGER = LoggerFactory.getLogger(AbstractBaseProcessor.class);

	private EntityManagerContainer entityManagerContainer;

	private Business business;

	protected Gson gson = XGsonBuilder.instance();

	protected AbstractBaseProcessor(EntityManagerContainer entityManagerContainer) throws Exception {
		this.entityManagerContainer = entityManagerContainer;
		this.business = new Business(this.entityManagerContainer);
	}

	protected EntityManagerContainer entityManagerContainer() {
		return this.entityManagerContainer;
	}

	protected Business business() {
		return this.business;
	}

	protected static final Integer MAX_ERROR_RETRY = 5;

	protected static final String BAS = "beforeArriveScript";
	protected static final String BAST = "beforeArriveScriptText";
	protected static final String AAS = "afterArriveScript";
	protected static final String AAST = "afterArriveScriptText";
	protected static final String BES = "beforeExecuteScript";
	protected static final String BEST = "beforeExecuteScriptText";
	protected static final String AES = "afterExecuteScript";
	protected static final String AEST = "afterExecuteScriptText";
	protected static final String BIS = "beforeInquireScript";
	protected static final String BIST = "beforeInquireScriptText";
	protected static final String AIS = "afterInquireScript";
	protected static final String AIST = "afterInquireScriptText";

	protected void arriveActivity(AeiObjects aeiObjects) throws Exception {
		String token = aeiObjects.getWork().getActivityToken();
		if (BooleanUtils.isTrue(aeiObjects.getActivityProcessingConfigurator().getChangeActivityToken())) {
			token = StringTools.uniqueToken();
		}
		Date date = new Date();
		if (BooleanUtils.isTrue(aeiObjects.getActivityProcessingConfigurator().getStampArrivedWorkLog())
				&& ListTools.isNotEmpty(aeiObjects.getWorkLogs())) {
			/* 如果为空的话那么就是新建的工作,不需要连接到达日志 */
			this.stampArriveWorkLog(aeiObjects, token, date);
		}
		if (BooleanUtils.isTrue(aeiObjects.getActivityProcessingConfigurator().getCreateFromWorkLog())) {
			this.createFromWorkLog(aeiObjects, token, date);
		}
		aeiObjects.getWork().setActivityToken(token);
		aeiObjects.getWork().setActivityArrivedTime(date);
		aeiObjects.getWork().setActivity(aeiObjects.getActivity().getId());
		aeiObjects.getWork().setActivityName(aeiObjects.getActivity().getName());
		aeiObjects.getWork().setActivityAlias(aeiObjects.getActivity().getAlias());
		aeiObjects.getWork().setActivityDescription(aeiObjects.getActivity().getDescription());
		aeiObjects.getWork().setActivityType(aeiObjects.getActivity().getActivityType());
		aeiObjects.getWork().setWorkStatus(WorkStatus.processing);
		if (StringUtils.isNotEmpty(aeiObjects.getActivity().getForm())) {
			/** 检查表单存在 */
			Form form = this.business().element().get(aeiObjects.getActivity().getForm(), Form.class);
			if (null != form) {
				aeiObjects.getWork().setForm(form.getId());
			}
		}
	}

	protected WorkLog stampArriveWorkLog(AeiObjects aeiObjects, String token, Date date) throws Exception {
		WorkLog workLog = aeiObjects.getWorkLogs().stream()
				.filter(o -> StringUtils.equals(aeiObjects.getWork().getId(), o.getWork())
						&& StringUtils.equals(aeiObjects.getWork().getActivityToken(), o.getFromActivityToken())
						&& BooleanUtils.isNotTrue(o.getConnected()))
				.findFirst().orElse(null);
		if (null != workLog) {
			/* 已经有workLog 进行连接 */
			workLog.setArrivedActivity(aeiObjects.getActivity().getId());
			workLog.setArrivedActivityName(aeiObjects.getActivity().getName());
			workLog.setArrivedActivityToken(token);
			workLog.setArrivedActivityType(aeiObjects.getActivity().getActivityType());
			workLog.setArrivedTime(date);
			workLog.setArrivedGroup(aeiObjects.getActivity().getGroup());
			workLog.setArrivedOpinionGroup(aeiObjects.getActivity().getOpinionGroup());
			workLog.setRoute(aeiObjects.getWork().getDestinationRoute());
			workLog.setRouteName(aeiObjects.getWork().getDestinationRouteName());
			workLog.setCompleted(false);
			workLog.setConnected(true);
			workLog.setDuration(Config.workTime().betweenMinutes(workLog.getFromTime(), workLog.getArrivedTime()));
			aeiObjects.getUpdateWorkLogs().add(workLog);
		} else {
			/* 拆分情况下是有可能这样的情况的,多份Work其中一份已经连接了formActivityToken的WorkLog */
			WorkLog oldest = aeiObjects.getWorkLogs().stream()
					.filter(o -> StringUtils.equals(aeiObjects.getWork().getActivityToken(), o.getFromActivityToken()))
					.sorted(Comparator.comparing(WorkLog::getCreateTime, Comparator.nullsLast(Date::compareTo)))
					.findFirst().orElse(null);
			if (null != oldest) {
				workLog = new WorkLog();
				oldest.copyTo(workLog, JpaObject.ID_DISTRIBUTEFACTOR);
				workLog.setArrivedActivity(aeiObjects.getActivity().getId());
				workLog.setArrivedActivityName(aeiObjects.getActivity().getName());
				workLog.setArrivedActivityToken(token);
				workLog.setArrivedActivityType(aeiObjects.getActivity().getActivityType());
				workLog.setArrivedGroup(aeiObjects.getActivity().getGroup());
				workLog.setArrivedOpinionGroup(aeiObjects.getActivity().getOpinionGroup());
				workLog.setArrivedTime(date);
				workLog.setRoute(aeiObjects.getWork().getDestinationRoute());
				workLog.setRouteName(aeiObjects.getWork().getDestinationRouteName());
				workLog.setCompleted(false);
				workLog.setConnected(true);
				workLog.setDuration(Config.workTime().betweenMinutes(workLog.getFromTime(), workLog.getArrivedTime()));
				aeiObjects.getCreateWorkLogs().add(workLog);
			} else {
				/* 这样的情况应该是不可能的 */
				throw new IllegalStateException("不能发生的情况,没有找到任何WorkLog");
			}
		}
		return workLog;
	}

	protected Work copyWork(Work work) throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		Work copy = new Work();
		work.copyTo(copy, JpaObject.ID_DISTRIBUTEFACTOR);
		return copy;
	}

	protected boolean hasBeforeArriveScript(Process process, Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return this.hasBeforeArriveScript(process) || this.hasBeforeArriveScript(activity);
	}

	protected boolean hasBeforeArriveScript(Process process)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(process.get(BAS, String.class))
				|| StringUtils.isNotEmpty(process.get(BAST, String.class));
	}

	protected boolean hasBeforeArriveScript(Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(activity.get(BAS, String.class))
				|| StringUtils.isNotEmpty(activity.get(BAST, String.class));
	}

	protected boolean hasAfterArriveScript(Process process, Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return this.hasAfterArriveScript(process) || this.hasAfterArriveScript(activity);
	}

	protected boolean hasAfterArriveScript(Process process)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(process.get(AAS, String.class))
				|| StringUtils.isNotEmpty(process.get(AAST, String.class));
	}

	protected boolean hasAfterArriveScript(Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(activity.get(AAS, String.class))
				|| StringUtils.isNotEmpty(activity.get(AAST, String.class));
	}

	protected boolean hasBeforeExecuteScript(Process process, Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return this.hasBeforeExecuteScript(process) || this.hasBeforeExecuteScript(activity);
	}

	protected boolean hasBeforeExecuteScript(Process process)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(process.get(BES, String.class))
				|| StringUtils.isNotEmpty(process.get(BEST, String.class));
	}

	protected boolean hasBeforeExecuteScript(Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(activity.get(BES, String.class))
				|| StringUtils.isNotEmpty(activity.get(BEST, String.class));
	}

	protected boolean hasAfterExecuteScript(Process process, Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return this.hasAfterExecuteScript(process) || this.hasAfterExecuteScript(activity);
	}

	protected boolean hasAfterExecuteScript(Process process)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(process.get(AES, String.class))
				|| StringUtils.isNotEmpty(process.get(AEST, String.class));
	}

	protected boolean hasAfterExecuteScript(Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(activity.get(AES, String.class))
				|| StringUtils.isNotEmpty(activity.get(AEST, String.class));
	}

	protected boolean hasBeforeInquireScript(Process process, Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return this.hasBeforeInquireScript(process) || this.hasBeforeInquireScript(activity);
	}

	protected boolean hasBeforeInquireScript(Process process)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(process.get(BIS, String.class))
				|| StringUtils.isNotEmpty(process.get(BIST, String.class));
	}

	protected boolean hasBeforeInquireScript(Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(activity.get(BIS, String.class))
				|| StringUtils.isNotEmpty(activity.get(BIST, String.class));
	}

	protected boolean hasAfterInquireScript(Process process, Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return this.hasAfterInquireScript(process) || this.hasAfterInquireScript(activity);
	}

	protected boolean hasAfterInquireScript(Process process)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(process.get(AIS, String.class))
				|| StringUtils.isNotEmpty(process.get(AIST, String.class));
	}

	protected boolean hasAfterInquireScript(Activity activity)
			throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
		return StringUtils.isNotEmpty(activity.get(AIS, String.class))
				|| StringUtils.isNotEmpty(activity.get(AIST, String.class));
	}

	protected boolean hasEmbedCompletedScript(Embed embed) {
		return StringUtils.isNotEmpty(embed.getProperties().getCompletedScript())
				|| StringUtils.isNotEmpty(embed.getProperties().getCompletedScriptText());
	}

	protected boolean hasEmbedCompletedEndScript(Embed embed) {
		return StringUtils.isNotEmpty(embed.getProperties().getCompletedEndScript())
				|| StringUtils.isNotEmpty(embed.getProperties().getCompletedEndScriptText());
	}

	protected boolean hasEmbedCompletedCancelScript(Embed embed) {
		return StringUtils.isNotEmpty(embed.getProperties().getCompletedCancelScript())
				|| StringUtils.isNotEmpty(embed.getProperties().getCompletedCancelScriptText());
	}

	protected void createFromWorkLog(AeiObjects aeiObjects, String token, Date date) throws Exception {
		WorkLog workLog = WorkLog.createFromWork(aeiObjects.getWork(), aeiObjects.getActivity(), token, date);
		aeiObjects.getCreateWorkLogs().add(workLog);
	}

}
