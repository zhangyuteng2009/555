package com.x.base.core.project.config;

import java.util.Objects;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.event.Level;

import com.x.base.core.project.annotation.FieldDescribe;

public class LogLevel extends ConfigObject {

	@FieldDescribe("是否启用调试")
	private String x_program_center = "";

	@FieldDescribe("是否启用调试")
	private String x_processplatform_service_processing = "";

	@FieldDescribe("是否启用调试")
	private String x_processplatform_assemble_surface = "";

	@FieldDescribe("是否启用调试")
	private String x_processplatform_assemble_designer = "";

	@FieldDescribe("是否启用调试")
	private String x_query_assemble_designer = "";

	@FieldDescribe("是否启用调试")
	private String x_query_assemble_surface = "";

	@FieldDescribe("是否启用调试")
	private String x_query_service_processing = "";

	@FieldDescribe("是否启用调试")
	private String x_meeting_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_organization_assemble_authentication = "";

	@FieldDescribe("是否启用调试")
	private String x_organization_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_general_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_file_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_attendance_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_collaboration_core_message = "";

	@FieldDescribe("是否启用调试")
	private String x_organization_core_express = "";

	@FieldDescribe("是否启用调试")
	private String x_query_core_express = "";

	@FieldDescribe("是否启用调试")
	private String x_bbs_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_calendar_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_cms_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_component_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_hotpic_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_message_assemble_communicate = "";

	@FieldDescribe("是否启用调试")
	private String x_mind_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_okr_assemble_control = "";

	@FieldDescribe("是否启用调试")
	private String x_organization_assemble_express = "";

	@FieldDescribe("是否启用调试")
	private String x_organization_assemble_personal = "";

	@FieldDescribe("是否启用调试")
	private String x_portal_assemble_designer = "";

	@FieldDescribe("是否启用调试")
	private String x_portal_assemble_surface = "";

	@FieldDescribe("是否启用调试")
	private String x_processplatform_assemble_bam = "";

	@FieldDescribe("是否启用调试")
	private String x_jpush_assemble_control = "";

	@FieldDescribe("是否启用web控制台日志输出")
	private Boolean webLogEnable = true;

	@FieldDescribe("审计日志配置")
	private Audit audit = Audit.defaultInstance();

	public static LogLevel defaultInstance() {
		return new LogLevel();
	}

	public Audit audit() {
		return (null == this.audit) ? Audit.defaultInstance() : this.audit;
	}

	public String x_attendance_assemble_control() {
		return this.getLevel(this.x_attendance_assemble_control);
	}

	public String x_collaboration_core_message() {
		return this.getLevel(this.x_collaboration_core_message);
	}

	public String x_organization_core_express() {
		return this.getLevel(this.x_organization_core_express);
	}

	public String x_query_core_express() {
		return this.getLevel(this.x_query_core_express);
	}

	public String x_bbs_assemble_control() {
		return this.getLevel(this.x_bbs_assemble_control);
	}

	public String x_calendar_assemble_control() {
		return this.getLevel(this.x_calendar_assemble_control);
	}

	public String x_cms_assemble_control() {
		return this.getLevel(this.x_cms_assemble_control);
	}

	public String x_component_assemble_control() {
		return this.getLevel(this.x_component_assemble_control);
	}

	public String x_hotpic_assemble_control() {
		return this.getLevel(this.x_hotpic_assemble_control);
	}

	public String x_message_assemble_communicate() {
		return this.getLevel(this.x_message_assemble_communicate);
	}

	public String x_mind_assemble_control() {
		return this.getLevel(this.x_mind_assemble_control);
	}

	public String x_okr_assemble_control() {
		return this.getLevel(this.x_okr_assemble_control);
	}

	public String x_organization_assemble_express() {
		return this.getLevel(this.x_organization_assemble_express);
	}

	public String x_organization_assemble_personal() {
		return this.getLevel(this.x_organization_assemble_personal);
	}

	public String x_portal_assemble_designer() {
		return this.getLevel(this.x_portal_assemble_designer);
	}

	public String x_portal_assemble_surface() {
		return this.getLevel(this.x_portal_assemble_surface);
	}

	public String x_processplatform_assemble_bam() {
		return this.getLevel(this.x_processplatform_assemble_bam);
	}

	public String x_program_center() {
		return this.getLevel(this.x_program_center);
	}

	public String x_processplatform_service_processing() {
		return this.getLevel(this.x_processplatform_service_processing);
	}

	public String x_processplatform_assemble_surface() {
		return this.getLevel(this.x_processplatform_assemble_surface);
	}

	public String x_processplatform_assemble_designer() {
		return this.getLevel(this.x_processplatform_assemble_designer);
	}

	public String x_query_assemble_surface() {
		return this.getLevel(this.x_query_assemble_surface);
	}

	public String x_query_assemble_designer() {
		return this.getLevel(this.x_query_assemble_designer);
	}

	public String x_query_service_processing() {
		return this.getLevel(this.x_query_service_processing);
	}

	public String x_meeting_assemble_control() {
		return this.getLevel(this.x_meeting_assemble_control);
	}

	public String x_organization_assemble_authentication() {
		return this.getLevel(this.x_organization_assemble_authentication);
	}

	public String x_organization_assemble_control() {
		return this.getLevel(this.x_organization_assemble_control);
	}

	public String x_general_assemble_control() {
		return this.getLevel(this.x_general_assemble_control);
	}

	public String x_file_assemble_control() {
		return this.getLevel(this.x_general_assemble_control);
	}

	public String x_jpush_assemble_control() {
		return this.getLevel(this.x_jpush_assemble_control);
	}

	public Boolean getWebLogEnable() {
		return webLogEnable;
	}

	public void setWebLogEnable(Boolean webLogEnable) {
		this.webLogEnable = webLogEnable;
	}

	private String getLevel(String str) {
		if (StringUtils.equalsIgnoreCase(str, Objects.toString(Level.ERROR))) {
			return Objects.toString(Level.ERROR);
		}
		if (StringUtils.equalsIgnoreCase(str, Objects.toString(Level.WARN))) {
			return Objects.toString(Level.WARN);
		}
		if (StringUtils.equalsIgnoreCase(str, Objects.toString(Level.INFO))) {
			return Objects.toString(Level.INFO);
		}
		if (StringUtils.equalsIgnoreCase(str, Objects.toString(Level.DEBUG))) {
			return Objects.toString(Level.DEBUG);
		}
		if (StringUtils.equalsIgnoreCase(str, Objects.toString(Level.TRACE))) {
			return Objects.toString(Level.TRACE);
		}
		return Objects.toString(Level.INFO);
	}

	public static class Audit extends ConfigObject {

		public static final Integer DEFAULT_LOGSIZE = 31;
		public static final Boolean DEFAULT_ENABLE = false;

		public static Audit defaultInstance() {
			return new Audit();
		}

		@FieldDescribe("是否启用审计日志")
		private Boolean enable;

		@FieldDescribe("审计日志保留天数")
		private Integer logSize;

		@FieldDescribe("审计日志归属系统code")
		private String system;

		@FieldDescribe("审计日志归属系统名称")
		private String systemName;

		@FieldDescribe("扩展字段1")
		private String extend1;

		public Boolean enable() {
			return BooleanUtils.isTrue(this.enable);
		}

		public Integer logSize() {
			if ((null == logSize) || (logSize < 0)) {
				return DEFAULT_LOGSIZE;
			} else {
				return this.logSize;
			}
		}

		public String getSystem() {
			return system;
		}

		public void setSystem(String system) {
			this.system = system;
		}

		public String getSystemName() {
			return systemName;
		}

		public void setSystemName(String systemName) {
			this.systemName = systemName;
		}

		public String getExtend1() {
			return extend1;
		}

		public void setExtend1(String extend1) {
			this.extend1 = extend1;
		}

	}
}
