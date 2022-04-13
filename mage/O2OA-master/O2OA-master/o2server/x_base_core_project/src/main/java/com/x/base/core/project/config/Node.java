package com.x.base.core.project.config;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.tools.DateTools;

public class Node extends ConfigObject {

	public static final Integer DEFAULT_NODEAGENTPORT = 20010;
	public static final String DEFAULT_BANNER = "O2OA";
	public static final Integer DEFAULT_LOGSIZE = 14;
	public static final Boolean DEFAULT_SELFHEALTHCHECKENABLE = false;

	public static Node defaultInstance() {
		Node o = new Node();
		o.enable = true;
		o.isPrimaryCenter = true;
		o.center = CenterServer.defaultInstance();
		o.application = ApplicationServer.defaultInstance();
		o.web = WebServer.defaultInstance();
		o.data = DataServer.defaultInstance();
		o.storage = StorageServer.defaultInstance();
		o.logLevel = "warn";
		o.dumpData = new ScheduleDumpData();
		o.restoreData = new ScheduleRestoreData();
		o.nodeAgentEnable = true;
		o.nodeAgentEncrypt = true;
		o.nodeAgentPort = DEFAULT_NODEAGENTPORT;
		o.quickStartWebApp = false;
		o.autoStart = true;
		o.selfHealthCheckEnable = false;
		return o;
	}

	@FieldDescribe("是否启用")
	private Boolean enable;
	@FieldDescribe("是否是center节点,仅允许存在一个center节点")
	private Boolean isPrimaryCenter;
	@FieldDescribe("Center服务器配置")
	private CenterServer center;
	@FieldDescribe("Application服务器配置")
	private ApplicationServer application;
	@FieldDescribe("Web服务器配置")
	private WebServer web;
	@FieldDescribe("Data服务器配置")
	private DataServer data;
	@FieldDescribe("Storage服务器配置")
	private StorageServer storage;
	@FieldDescribe("日志级别,默认当前节点的slf4j日志级别,通过系统变量\"org.slf4j.simpleLogger.defaultLogLevel\"设置到当前jvm中.")
	private String logLevel;
	@FieldDescribe("定时数据导出配置")
	private ScheduleDumpData dumpData;
	@FieldDescribe("定时数据导入配置")
	private ScheduleRestoreData restoreData;
	@FieldDescribe("日志文件保留天数.")
	private Integer logSize;
	@FieldDescribe("审计日志文件保留天数.")
	private Integer auditLogSize;
	@FieldDescribe("是否启用节点代理")
	private Boolean nodeAgentEnable;
	@FieldDescribe("是否启用节点端口")
	private Integer nodeAgentPort;
	@FieldDescribe("是否启用节点代理加密")
	private Boolean nodeAgentEncrypt;
	@FieldDescribe("是否使用快速应用部署")
	private Boolean quickStartWebApp;
	@FieldDescribe("服务器控制台启动标识")
	private String banner;
	@FieldDescribe("是否自动启动")
	private Boolean autoStart;
	@FieldDescribe("是否允许使用擦除数据功能")
	private Boolean eraseContentEnable;
	@FieldDescribe("是否启用节点上模块健康自检查,如果启用在提交到center之前将进行模块的健康检查.默认false")
	private Boolean selfHealthCheckEnable;

	public Boolean getSelfHealthCheckEnable() {
		return BooleanUtils.isTrue(selfHealthCheckEnable);
	}

	/* 20191009兼容centerServer */
	protected void setCenter(CenterServer centerServer) {
		this.center = centerServer;
	}
	/* 20191009兼容centerServer end */

	public Boolean getEraseContentEnable() {
		return BooleanUtils.isNotFalse(eraseContentEnable);
	}

	public Boolean autoStart() {
		return BooleanUtils.isNotFalse(autoStart);
	}

	public Boolean getEnable() {
		return BooleanUtils.isTrue(this.enable);
	}

	public CenterServer getCenter() {
		return (center == null) ? CenterServer.defaultInstance() : this.center;
	}

	public ApplicationServer getApplication() {
		return (application == null) ? ApplicationServer.defaultInstance() : this.application;
	}

	public WebServer getWeb() {
		return (web == null) ? WebServer.defaultInstance() : this.web;
	}

	public DataServer getData() {
		return (data == null) ? DataServer.defaultInstance() : this.data;
	}

	public StorageServer getStorage() {
		return (storage == null) ? StorageServer.defaultInstance() : this.storage;
	}

	public String getLogLevel() {
		// "trace", "debug", "info", "warn", "error" or "off"
		if (StringUtils.equals("trace", this.logLevel)) {
			return "trace";
		} else if (StringUtils.equalsIgnoreCase("debug", this.logLevel)) {
			return "debug";
		} else if (StringUtils.equalsIgnoreCase("info", this.logLevel)) {
			return "info";
		} else if (StringUtils.equalsIgnoreCase("warn", this.logLevel)) {
			return "warn";
		} else if (StringUtils.equalsIgnoreCase("error", this.logLevel)) {
			return "error";
		} else if (StringUtils.equalsIgnoreCase("off", this.logLevel)) {
			return "off";
		} else {
			return "warn";
		}
	}

	public String getBanner() {
		return StringUtils.isBlank(this.banner) ? DEFAULT_BANNER : this.banner;
	}

	public Integer logSize() {
		if ((this.logSize != null) && (this.logSize > 0)) {
			return this.logSize;
		}
		return DEFAULT_LOGSIZE;
	}

	public Boolean getQuickStartWebApp() {
		return BooleanUtils.isTrue(quickStartWebApp);
	}

	public Integer nodeAgentPort() {
		if (null == this.nodeAgentPort || this.nodeAgentPort < 0) {
			return DEFAULT_NODEAGENTPORT;
		}
		return this.nodeAgentPort;
	}

	public Boolean nodeAgentEnable() {
		return BooleanUtils.isTrue(this.nodeAgentEnable);
	}

	public Boolean nodeAgentEncrypt() {
		return BooleanUtils.isNotFalse(this.nodeAgentEncrypt);
	}

	public Boolean getIsPrimaryCenter() {
		return BooleanUtils.isTrue(this.isPrimaryCenter);
	}

	public ScheduleDumpData dumpData() {
		return (dumpData == null) ? new ScheduleDumpData() : this.dumpData;
	}

	public ScheduleRestoreData restoreData() {
		return (restoreData == null) ? new ScheduleRestoreData() : this.restoreData;
	}

	public static class ScheduleDumpData extends ConfigObject {

		public static ScheduleDumpData defaultInstance() {
			return new ScheduleDumpData();
		}

		public boolean available() {
			return DateTools.cronAvailable(this.cron());
		}

		@FieldDescribe("是否启用,默认禁用.")
		private Boolean enable = false;

		@FieldDescribe("定时任务cron表达式,默认每天凌晨2点进行备份.")
		private String cron = "";

		@FieldDescribe("最大保留份数,超过将自动删除最久的数据.")
		private Integer size = 7;

		@FieldDescribe("备份路径")
		private String path = "";

		public Boolean enable() {
			return (BooleanUtils.isTrue(this.enable)) ? true : false;
		}

		public String cron() {
			return (null == cron) ? "5 0 2 * * ?" : this.cron;
		}

		public Integer size() {
			return (null == size) ? 14 : this.size;
		}

		public String path() {
			return StringUtils.trim(path);
		}

	}

	public static class ScheduleRestoreData extends ConfigObject {

		public static ScheduleRestoreData defaultInstance() {
			return new ScheduleRestoreData();
		}

		public boolean available() {
			return DateTools.cronAvailable(this.cron) && StringUtils.isNotEmpty(this.path);
		}

		@FieldDescribe("是否启用.")
		private Boolean enable = false;

		@FieldDescribe("定时任务cron表达式")
		private String cron = "";

		@FieldDescribe("恢复路径")
		private String path = "";

		public Boolean enable() {
			return (BooleanUtils.isTrue(this.enable)) ? true : false;
		}

		public String cron() {
			return (null == cron) ? "" : this.cron;
		}

		public String path() {
			return StringUtils.trim(path);
		}

	}

}
