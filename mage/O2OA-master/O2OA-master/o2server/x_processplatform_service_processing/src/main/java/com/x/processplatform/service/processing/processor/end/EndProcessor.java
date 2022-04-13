package com.x.processplatform.service.processing.processor.end;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Objects;

import javax.script.Bindings;
import javax.script.CompiledScript;
import javax.script.ScriptContext;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.scripting.JsonScriptingExecutor;
import com.x.base.core.project.scripting.ScriptingFactory;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.content.WorkCompleted;
import com.x.processplatform.core.entity.element.ActivityType;
import com.x.processplatform.core.entity.element.Embed;
import com.x.processplatform.core.entity.element.End;
import com.x.processplatform.core.entity.element.Route;
import com.x.processplatform.core.entity.log.Signal;
import com.x.processplatform.core.express.ProcessingAttributes;
import com.x.processplatform.service.processing.Business;
import com.x.processplatform.service.processing.Processing;
import com.x.processplatform.service.processing.processor.AeiObjects;

public class EndProcessor extends AbstractEndProcessor {

	private static final Logger LOGGER = LoggerFactory.getLogger(EndProcessor.class);

	public EndProcessor(EntityManagerContainer entityManagerContainer) throws Exception {
		super(entityManagerContainer);
	}

	@Override
	protected Work arriving(AeiObjects aeiObjects, End end) throws Exception {
		// 发送ProcessingSignal
		aeiObjects.getProcessingAttributes().push(Signal.endArrive(aeiObjects.getWork().getActivityToken(), end));
		return aeiObjects.getWork();
	}

	@Override
	protected void arrivingCommitted(AeiObjects aeiObjects, End end) throws Exception {
		// nothing
	}

	@Override
	protected List<Work> executing(AeiObjects aeiObjects, End end) throws Exception {
		// 发送ProcessingSignal
		aeiObjects.getProcessingAttributes().push(Signal.endExecute(aeiObjects.getWork().getActivityToken(), end));
		List<Work> results = new ArrayList<>();
		Work other = aeiObjects.getWorks().stream().filter(o -> o != aeiObjects.getWork())
				.sorted(Comparator.comparing(Work::getCreateTime)).findFirst().orElse(null);

		if (null != other) {
			aeiObjects.getUpdateWorks().add(other);
			aeiObjects.getDeleteWorks().add(aeiObjects.getWork());
			this.mergeTaskCompleted(aeiObjects, aeiObjects.getWork(), other);
			this.mergeRead(aeiObjects, aeiObjects.getWork(), other);
			this.mergeReadCompleted(aeiObjects, aeiObjects.getWork(), other);
			this.mergeReview(aeiObjects, aeiObjects.getWork(), other);
			this.mergeAttachment(aeiObjects, aeiObjects.getWork(), other);
			this.mergeWorkLog(aeiObjects, aeiObjects.getWork(), other);
			this.mergeRecord(aeiObjects, aeiObjects.getWork(), other);
			aeiObjects.getWorkLogs().stream()
					.filter(p -> StringUtils.equals(p.getFromActivityToken(), aeiObjects.getWork().getActivityToken()))
					.forEach(obj -> aeiObjects.getDeleteWorkLogs().add(obj));
		} else {
			WorkCompleted workCompleted = this.createWorkCompleted(aeiObjects.getWork(), end);
			workCompleted.setAllowRollback(end.getAllowRollback());
			aeiObjects.getCreateWorkCompleteds().add(workCompleted);
			aeiObjects.getTasks().stream().forEach(o -> aeiObjects.getDeleteTasks().add(o));
			aeiObjects.getDocumentVersions().stream().forEach(o -> aeiObjects.getDeleteDocumentVersions().add(o));
			aeiObjects.getTaskCompleteds().stream().forEach(o -> {
				// 已办的完成时间是不需要更新的
				o.setCompleted(true);
				o.setWorkCompleted(workCompleted.getId());
				// 重新赋值映射字段
				o.copyProjectionFields(workCompleted);
				// 加入到更新队列保证事务开启
				aeiObjects.getUpdateTaskCompleteds().add(o);
			});
			aeiObjects.getReads().stream().forEach(o -> {
				// 待阅的完成时间是不需要更新的
				o.setCompleted(true);
				o.setWorkCompleted(workCompleted.getId());
				// 重新赋值映射字段
				o.copyProjectionFields(workCompleted);
				// 加入到更新队列保证事务开启
				aeiObjects.getUpdateReads().add(o);
			});
			aeiObjects.getReadCompleteds().stream().forEach(o -> {
				// 已阅的完成时间是不需要更新的
				o.setCompleted(true);
				o.setWorkCompleted(workCompleted.getId());
				// 重新赋值映射字段
				o.copyProjectionFields(workCompleted);
				// 加入到更新队列保证事务开启
				aeiObjects.getUpdateReadCompleteds().add(o);
			});
			aeiObjects.getRecords().stream().forEach(o -> {
				o.setCompleted(true);
				o.setWorkCompleted(workCompleted.getId());
				aeiObjects.getUpdateRecords().add(o);
			});
			aeiObjects.getReviews().stream().forEach(o -> {
				o.setCompleted(true);
				o.setWorkCompleted(workCompleted.getId());
				o.setCompletedTime(workCompleted.getCompletedTime());
				o.setCompletedTimeMonth(workCompleted.getCompletedTimeMonth());
				// 重新赋值映射字段
				o.copyProjectionFields(workCompleted);
				// 加入到更新队列保证事务开启
				aeiObjects.getUpdateReviews().add(o);
			});
			aeiObjects.getWorkLogs().stream().forEach(o -> {
				o.setSplitting(false);
				o.setSplitToken("");
				o.getProperties().setSplitTokenList(new ArrayList<>());
				o.setSplitValue("");
				o.setCompleted(true);
				o.setWorkCompleted(workCompleted.getId());
				// 加入到更新队列保证事务开启
				aeiObjects.getUpdateWorkLogs().add(o);
				// 删除未连接的WorkLogd0431924-849f-4bf6-81b2-bfe997e62b7f
				if (BooleanUtils.isNotTrue(o.getConnected())) {
					aeiObjects.getDeleteWorkLogs().add(o);
				}
			});
			aeiObjects.getAttachments().stream().forEach(o -> {
				o.setCompleted(true);
				o.setWorkCompleted(workCompleted.getId());
				// 加入到更新队列保证事务开启
				aeiObjects.getUpdateAttachments().add(o);
			});
			// 已workCompleted数据为准进行更新
			aeiObjects.getData().setWork(workCompleted);
			aeiObjects.getData().setAttachmentList(aeiObjects.getAttachments());
			aeiObjects.getDeleteWorks().addAll(aeiObjects.getWorks());
			// 删除快照
			aeiObjects.getDeleteSnaps().addAll(aeiObjects.getSnaps());
		}

		return results;
	}

	@Override
	protected void executingCommitted(AeiObjects aeiObjects, End end, List<Work> works) throws Exception {
		if (StringUtils.isNotEmpty(aeiObjects.getProcess().getAfterEndScript())
				|| StringUtils.isNotEmpty(aeiObjects.getProcess().getAfterEndScriptText())) {
			CompiledScript cs = aeiObjects.business().element().getCompiledScript(aeiObjects.getWork().getApplication(),
					aeiObjects.getProcess(), Business.EVENT_PROCESSAFTEREND);
			JsonScriptingExecutor.eval(cs, aeiObjects.scriptContext());
		}
		// 回写到父Work
		tryUpdateParentWork(aeiObjects);
	}

	private void tryUpdateParentWork(AeiObjects aeiObjects) {
		if (StringUtils.isNotBlank(aeiObjects.getWork().getProperties().getParentWork())) {
			try {
				Work parent = aeiObjects.entityManagerContainer()
						.find(aeiObjects.getWork().getProperties().getParentWork(), Work.class);
				if ((null != parent) && Objects.equals(parent.getActivityType(), ActivityType.embed)) {
					Embed embed = (Embed) aeiObjects.business().element().get(parent.getActivity(), ActivityType.embed);

					if ((null != embed) && BooleanUtils.isTrue(embed.getWaitUntilCompleted())) {
						updateParentWork(aeiObjects, parent, embed);
					}
				}
			} catch (Exception e) {
				LOGGER.error(new ExceptionUpdateParentWork(e, aeiObjects.getWork().getId(),
						aeiObjects.getWork().getProperties().getParentWork()));
			}
		}
	}

	private void updateParentWork(AeiObjects aeiObjects, Work parent, Embed embed) throws Exception {
		// 先把状态值注入,这样脚本执行时可以取得到值.
		parent.setEmbedCompleted(ActivityType.end.toString());
		AeiObjects embedAeiObjects = new AeiObjects(aeiObjects.business(), parent, embed,
				aeiObjects.getProcessingConfigurator(), aeiObjects.getProcessingAttributes());
		embedAeiObjects.entityManagerContainer().beginTransaction(Work.class);
		if (this.hasEmbedCompletedScript(embed) || this.hasEmbedCompletedEndScript(embed)) {
			ScriptContext scriptContext = embedAeiObjects.scriptContext();
			Bindings bindings = scriptContext.getBindings(ScriptContext.ENGINE_SCOPE);
			bindings.put(ScriptingFactory.BINDING_NAME_EMBEDDATA, aeiObjects.getData());
			if (this.hasEmbedCompletedScript(embed)) {
				CompiledScript cs = aeiObjects.business().element()
						.getCompiledScript(aeiObjects.getWork().getApplication(), embed, Business.EVENT_EMBEDCOMPLETED);
				JsonScriptingExecutor.eval(cs, scriptContext);
			}
			if (this.hasEmbedCompletedEndScript(embed)) {
				CompiledScript cs = aeiObjects.business().element().getCompiledScript(
						aeiObjects.getWork().getApplication(), embed, Business.EVENT_EMBEDCOMPLETEDEND);
				JsonScriptingExecutor.eval(cs, scriptContext);
			}
		}
		embedAeiObjects.commit();
		touchWork(parent.getId());
	}

	/**
	 * 触发在等待状态的父文档
	 * 
	 * @param parentWorkId
	 */
	private void touchWork(String workId) {
		new Thread(EndProcessor.class.getName() + "_touchWork") {
			@Override
			public void run() {
				try {
					new Processing(new ProcessingAttributes()).processing(workId);
				} catch (Exception e) {
					LOGGER.error(e);
				}
			}
		}.start();
	}

	@Override
	protected List<Route> inquiring(AeiObjects aeiObjects, End end) throws Exception {
		// 发送ProcessingSignal
		aeiObjects.getProcessingAttributes().push(Signal.endInquire(aeiObjects.getWork().getActivityToken(), end));
		return new ArrayList<>();
	}

	@Override
	protected void inquiringCommitted(AeiObjects aeiObjects, End end) throws Exception {
		// nothing
	}

	/* 根据work和data创建最终保存的workCompleted */
	private WorkCompleted createWorkCompleted(Work work, End end) throws Exception {
		Date completedTime = new Date();
		Long duration = Config.workTime().betweenMinutes(work.getStartTime(), completedTime);
		WorkCompleted workCompleted = new WorkCompleted(work, completedTime, duration);
		workCompleted.setActivity(end.getId());
		workCompleted.setActivityAlias(end.getAlias());
		workCompleted.setActivityDescription(end.getDescription());
		workCompleted.setActivityName(end.getName());
		return workCompleted;
	}
}