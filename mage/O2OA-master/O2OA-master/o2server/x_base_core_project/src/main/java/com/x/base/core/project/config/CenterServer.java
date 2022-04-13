package com.x.base.core.project.config;

import java.io.File;
import java.util.LinkedHashMap;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.project.annotation.FieldDescribe;
import com.x.base.core.project.gson.XGsonBuilder;
import com.x.base.core.project.tools.DefaultCharset;

public class CenterServer extends ConfigObject {

	private static final long serialVersionUID = 8147826320846595611L;

	private static final Boolean DEFAULT_ENABLE = true;
	private static final Integer DEFAULT_PORT = 20030;
	private static final Integer DEFAULT_SCANINTERVAL = 0;
	private static final Boolean DEFAULT_CONFIGAPIENABLE = true;
	private static final Integer DEFAULT_ORDER = 0;
	private static final Boolean DEFAULT_STATENABLE = true;
	private static final String DEFAULT_STATEXCLUSIONS = "*.js,*.gif,*.jpg,*.png,*.css,*.ico";
	private static final Integer DEFAULT_MAXFORMCONTENT = 20;
	private static final Boolean DEFAULT_EXPOSEJEST = true;
	private static final Boolean DEFAULT_PERSISTENTCONNECTIONSENABLE = true;
	private static final Boolean DEFAULT_REQUESTLOGENABLE = false;
	private static final String DEFAULT_REQUESTLOGFORMAT = "";
	private static final Integer DEFAULT_REQUESTLOGRETAINDAYS = 7;
	private static final Boolean DEFAULT_REQUESTLOGBODYENABLE = false;

	public static CenterServer defaultInstance() {
		return new CenterServer();
	}

	public CenterServer() {
		this.enable = DEFAULT_ENABLE;
		this.sslEnable = false;
		this.redeploy = true;
		this.order = DEFAULT_ORDER;
		this.port = DEFAULT_PORT;
		this.httpProtocol = "";
		this.proxyHost = "";
		this.proxyPort = DEFAULT_PORT;
		this.scanInterval = DEFAULT_SCANINTERVAL;
		this.configApiEnable = DEFAULT_CONFIGAPIENABLE;
		this.statEnable = DEFAULT_STATENABLE;
		this.statExclusions = DEFAULT_STATEXCLUSIONS;
		this.maxFormContent = DEFAULT_MAXFORMCONTENT;
		this.exposeJest = DEFAULT_EXPOSEJEST;
		this.persistentConnectionsEnable = DEFAULT_PERSISTENTCONNECTIONSENABLE;
		this.requestLogEnable = DEFAULT_REQUESTLOGENABLE;
		this.requestLogFormat = DEFAULT_REQUESTLOGFORMAT;
		this.requestLogRetainDays = DEFAULT_REQUESTLOGRETAINDAYS;
		this.requestLogBodyEnable = DEFAULT_REQUESTLOGBODYENABLE;
	}

	@FieldDescribe("是否启用")
	private Boolean enable;
	@FieldDescribe("center节点顺序,顺序排列0,1,2...")
	private Integer order;
	@FieldDescribe("是否启用ssl传输加密,如果启用将使用config/keystore文件作为密钥文件.使用config/token.json文件中的sslKeyStorePassword字段为密钥密码,sslKeyManagerPassword为管理密码.")
	private Boolean sslEnable;
	@FieldDescribe("每次启动是否重新部署所有应用.")
	private Boolean redeploy;
	@FieldDescribe("端口,center服务器端口,默认20030")
	private Integer port;
	@FieldDescribe("对外http访问协议,http/https")
	private String httpProtocol;
	@FieldDescribe("代理主机,当服务器是通过apache/nginx等代理服务器映射到公网或者通过路由器做端口映射,在这样的情况下需要设置此地址以标明公网访问地址.")
	private String proxyHost;
	@FieldDescribe("代理端口,当服务器是通过apache/nginx等代理服务器映射到公网或者通过路由器做端口映射,在这样的情况下需要设置此地址以标明公网访问端口.")
	private Integer proxyPort;
	@FieldDescribe("重新扫描war包时间间隔(秒)")
	private Integer scanInterval;
	@FieldDescribe("其他参数")
	private LinkedHashMap<String, Object> config;
	@FieldDescribe("允许通过Api修改config")
	private Boolean configApiEnable;
	@FieldDescribe("启用统计,默认启用统计.")
	private Boolean statEnable;
	@FieldDescribe("统计忽略路径,默认忽略*.js,*.gif,*.jpg,*.png,*.css,*.ico")
	private String statExclusions;
	@FieldDescribe("最大提交数据限制(M),限制有所上传的内容大小,包括附件.")
	private Integer maxFormContent;
	@FieldDescribe("暴露jest接口.")
	private Boolean exposeJest;
	@FieldDescribe("启用访问日志功能.")
	private Boolean requestLogEnable;
	@FieldDescribe("访问日志记录格式.")
	private String requestLogFormat;
	@FieldDescribe("访问日志记录天数,默认7天.")
	private Integer requestLogRetainDays;
	@FieldDescribe("访问日志是否记录post或者put的body内容,只对content-type为application/json的请求有效.")
	private Boolean requestLogBodyEnable;

	public Boolean getRequestLogBodyEnable() {
		return BooleanUtils.isTrue(this.requestLogBodyEnable);
	}

	@FieldDescribe("是否启用长连接,默认false.")
	private Boolean persistentConnectionsEnable;

	public Boolean getPersistentConnectionsEnable() {
		return persistentConnectionsEnable == null ? DEFAULT_PERSISTENTCONNECTIONSENABLE
				: this.persistentConnectionsEnable;
	}

	public Boolean getExposeJest() {
		return BooleanUtils.isNotFalse(this.exposeJest);
	}

	public Integer getMaxFormContent() {
		return ((null == maxFormContent) || (maxFormContent < 1)) ? DEFAULT_MAXFORMCONTENT : maxFormContent;
	}

	public String getStatExclusions() {
		return (StringUtils.isEmpty(statExclusions) ? DEFAULT_STATEXCLUSIONS : this.statExclusions) + ",/druid/*";
	}

	public Boolean getStatEnable() {
		return BooleanUtils.isNotFalse(statEnable);
	}

	public Boolean getConfigApiEnable() {
		return configApiEnable == null ? DEFAULT_CONFIGAPIENABLE : this.configApiEnable;
	}

	public Boolean getEnable() {
		return enable == null ? DEFAULT_ENABLE : this.enable;
	}

	public String getHttpProtocol() {
		return StringUtils.equals("https", this.httpProtocol) ? "https" : "http";
	}

	public Integer getScanInterval() {
		if (null != this.scanInterval && this.scanInterval > 0) {
			return this.scanInterval;
		}
		return DEFAULT_SCANINTERVAL;
	}

	public Boolean getRedeploy() {
		return BooleanUtils.isTrue(this.redeploy);
	}

	public Boolean getSslEnable() {
		return BooleanUtils.isTrue(this.sslEnable);
	}

	public Integer getPort() {
		if (null != this.port && this.port > 0 && this.port < 65535) {
			return this.port;
		}
		return DEFAULT_PORT;
	}

	public String getProxyHost() throws Exception {
		return StringUtils.isNotEmpty(this.proxyHost) ? this.proxyHost : "";
	}

	public Integer getProxyPort() {
		if (null != this.proxyPort && this.proxyPort > 0) {
			return this.proxyPort;
		}
		return this.getPort();
	}

	public LinkedHashMap<String, Object> getConfig() {
		if (null == this.config) {
			return new LinkedHashMap<String, Object>();
		}
		return this.config;
	}

	public Integer getOrder() {
		return order == null ? DEFAULT_ORDER : this.order;
	}

	public void save() throws Exception {
		File file = new File(Config.base(), Config.PATH_CONFIG_CENTERSERVER);
		FileUtils.write(file, XGsonBuilder.toJson(this), DefaultCharset.charset);
	}

	public void setSslEnable(Boolean sslEnable) {
		this.sslEnable = sslEnable;
	}

	public void setPort(Integer port) {
		this.port = port;
	}

	public void setProxyHost(String proxyHost) {
		this.proxyHost = proxyHost;
	}

	public void setProxyPort(Integer proxyPort) {
		this.proxyPort = proxyPort;
	}

	public void setScanInterval(Integer scanInterval) {
		this.scanInterval = scanInterval;
	}

	public void setRedeploy(Boolean redeploy) {
		this.redeploy = redeploy;
	}

	public void setConfig(LinkedHashMap<String, Object> config) {
		this.config = config;
	}

	public void setHttpProtocol(String httpProtocol) {
		this.httpProtocol = httpProtocol;
	}

	public Boolean getRequestLogEnable() {
		return BooleanUtils.isTrue(this.requestLogEnable);
	}

	public String getRequestLogFormat() {
		return StringUtils.isEmpty(this.requestLogFormat) ? "" : this.requestLogFormat;
	}

	public Integer getRequestLogRetainDays() {
		return (null == this.requestLogRetainDays || this.requestLogRetainDays < 1) ? DEFAULT_REQUESTLOGRETAINDAYS
				: this.requestLogRetainDays;
	}

}
