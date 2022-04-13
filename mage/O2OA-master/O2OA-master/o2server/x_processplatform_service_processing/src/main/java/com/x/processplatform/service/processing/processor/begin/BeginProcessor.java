package com.x.processplatform.service.processing.processor.begin;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

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
import com.x.base.core.project.tools.NumberTools;
import com.x.base.core.project.utils.time.WorkTime;
import com.x.processplatform.core.entity.content.Review;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.element.Begin;
import com.x.processplatform.core.entity.element.Route;
import com.x.processplatform.core.entity.log.Signal;
import com.x.processplatform.service.processing.Business;
import com.x.processplatform.service.processing.processor.AeiObjects;

public class BeginProcessor extends AbstractBeginProcessor {

	private static final Logger LOGGER = LoggerFactory.getLogger(BeginProcessor.class);

	public BeginProcessor(EntityManagerContainer entityManagerContainer) throws Exception {
		super(entityManagerContainer);
	}

	@Override
	protected Work arriving(AeiObjects aeiObjects, Begin begin) throws Exception {
		// 发送ProcessingSignal
		aeiObjects.getProcessingAttributes().push(Signal.beginArrive(aeiObjects.getWork().getActivityToken(), begin));
		// 创建创建者的review
		String person = this.business().organization().person().get(aeiObjects.getWork().getCreatorPerson());
		if (StringUtils.isNotEmpty(person)) {
			aeiObjects.createReview(new Review(aeiObjects.getWork(), person));
		}
		return aeiObjects.getWork();
	}

	@Override
	protected void arrivingCommitted(AeiObjects aeiObjects, Begin begin) throws Exception {
		if (StringUtils.isNotEmpty(aeiObjects.getProcess().getAfterBeginScript())
				|| StringUtils.isNotEmpty(aeiObjects.getProcess().getAfterBeginScriptText())) {
			CompiledScript cs = aeiObjects.business().element().getCompiledScript(aeiObjects.getWork().getApplication(),
					aeiObjects.getProcess(), Business.EVENT_PROCESSAFTERBEGIN);
			JsonScriptingExecutor.eval(cs, aeiObjects.scriptContext());
		}
	}

	@Override
	protected List<Work> executing(AeiObjects aeiObjects, Begin begin) throws Exception {
		// 发送ProcessingSignal
		aeiObjects.getProcessingAttributes().push(Signal.beginExecute(aeiObjects.getWork().getActivityToken(), begin));
		List<Work> list = new ArrayList<>();
		// 如果是再次进入begin节点那么就不需要设置开始时间
		if (aeiObjects.getWork().getStartTime() == null) {
			aeiObjects.getWork().setStartTime(new Date());
			// 计算过期时间
			this.calculateExpire(aeiObjects);
		}
		list.add(aeiObjects.getWork());
		return list;
	}

	@Override
	protected void executingCommitted(AeiObjects aeiObjects, Begin begin, List<Work> works) throws Exception {
		// nothing
	}

	@Override
	protected List<Route> inquiring(AeiObjects aeiObjects, Begin begin) throws Exception {
		// 发送ProcessingSignal
		aeiObjects.getProcessingAttributes().push(Signal.beginInquire(aeiObjects.getWork().getActivityToken(), begin));
		List<Route> list = new ArrayList<>();
		Route o = aeiObjects.getRoutes().get(0);
		list.add(o);
		return list;
	}

	@Override
	protected void inquiringCommitted(AeiObjects aeiObjects, Begin begin) throws Exception {
		// nothing
	}

	private void calculateExpire(AeiObjects aeiObjects) throws Exception {
		if (BooleanUtils.isTrue(aeiObjects.getActivityProcessingConfigurator().getCalculateExpire())
				&& (null != aeiObjects.getProcess().getExpireType())) {
			switch (aeiObjects.getProcess().getExpireType()) {
			case never:
				this.expireNever(aeiObjects);
				break;
			case appoint:
				this.expireAppoint(aeiObjects);
				break;
			case script:
				this.expireScript(aeiObjects);
				break;
			default:
				break;
			}
		}
	}

	private void expireNever(AeiObjects aeiObjects) {
		aeiObjects.getWork().setExpireTime(null);
	}

	private void expireAppoint(AeiObjects aeiObjects) throws Exception {
		if (BooleanUtils.isTrue(aeiObjects.getProcess().getExpireWorkTime())) {
			this.expireAppointWorkTime(aeiObjects);
		} else {
			this.expireAppointNaturalDay(aeiObjects);
		}
	}

	private void expireAppointWorkTime(AeiObjects aeiObjects) throws Exception {
		Integer m = 0;
		WorkTime wt = Config.workTime();
		if (NumberTools.greaterThan(aeiObjects.getProcess().getExpireDay(), 0)) {
			m += aeiObjects.getProcess().getExpireDay() * wt.minutesOfWorkDay();
		}
		if (NumberTools.greaterThan(aeiObjects.getProcess().getExpireHour(), 0)) {
			m += aeiObjects.getProcess().getExpireHour() * 60;
		}
		if (m > 0) {
			aeiObjects.getWork().setExpireTime(wt.forwardMinutes(aeiObjects.getWork().getCreateTime(), m));
		} else {
			aeiObjects.getWork().setExpireTime(null);
		}
	}

	private void expireAppointNaturalDay(AeiObjects aeiObjects) throws Exception {
		Integer m = 0;
		if (NumberTools.greaterThan(aeiObjects.getProcess().getExpireDay(), 0)) {
			m += aeiObjects.getProcess().getExpireDay() * 60 * 24;
		}
		if (NumberTools.greaterThan(aeiObjects.getProcess().getExpireHour(), 0)) {
			m += aeiObjects.getProcess().getExpireHour() * 60;
		}
		if (m > 0) {
			Calendar cl = Calendar.getInstance();
			cl.setTime(aeiObjects.getWork().getCreateTime());
			cl.add(Calendar.MINUTE, m);
			aeiObjects.getWork().setExpireTime(cl.getTime());
		} else {
			aeiObjects.getWork().setExpireTime(null);
		}
	}

	private void expireScript(AeiObjects aeiObjects) throws Exception {
		ExpireScriptResult expire = new ExpireScriptResult();
		ScriptContext scriptContext = aeiObjects.scriptContext();
		CompiledScript cs = aeiObjects.business().element().getCompiledScript(aeiObjects.getWork().getApplication(),
				aeiObjects.getProcess(), Business.EVENT_PROCESSEXPIRE);
		scriptContext.getBindings(ScriptContext.ENGINE_SCOPE).put(ScriptingFactory.BINDING_NAME_EXPIRE, expire);
		JsonScriptingExecutor.eval(cs, scriptContext, ExpireScriptResult.class, o -> {
			if (null != o) {
				expire.setDate(o.getDate());
				expire.setHour(o.getHour());
				expire.setWorkHour(o.getWorkHour());
			}
		});
		if (BooleanUtils.isTrue(NumberTools.greaterThan(expire.getWorkHour(), 0))) {
			Integer m = 0;
			m += expire.getWorkHour() * 60;
			if (m > 0) {
				aeiObjects.getWork().setExpireTime(Config.workTime().forwardMinutes(new Date(), m));
			} else {
				aeiObjects.getWork().setExpireTime(null);
			}
		} else if (BooleanUtils.isTrue(NumberTools.greaterThan(expire.getHour(), 0))) {
			Integer m = 0;
			m += expire.getHour() * 60;
			if (m > 0) {
				Calendar cl = Calendar.getInstance();
				cl.add(Calendar.MINUTE, m);
				aeiObjects.getWork().setExpireTime(cl.getTime());
			} else {
				aeiObjects.getWork().setExpireTime(null);
			}
		} else if (null != expire.getDate()) {
			aeiObjects.getWork().setExpireTime(expire.getDate());
		} else {
			aeiObjects.getWork().setExpireTime(null);
		}
	}

	public class ExpireScriptResult {
		Integer hour;
		Integer workHour;
		Date date;

		public Integer getHour() {
			return hour;
		}

		public void setHour(Integer hour) {
			this.hour = hour;
		}

		public Integer getWorkHour() {
			return workHour;
		}

		public void setWorkHour(Integer workHour) {
			this.workHour = workHour;
		}

		public Date getDate() {
			return date;
		}

		public void setDate(Date date) {
			this.date = date;
		}

	}

}