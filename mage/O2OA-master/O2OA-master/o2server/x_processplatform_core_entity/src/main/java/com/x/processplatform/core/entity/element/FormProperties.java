package com.x.processplatform.core.entity.element;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.x.base.core.entity.JsonProperties;
import com.x.base.core.project.annotation.FieldDescribe;

public class FormProperties extends JsonProperties {

	@FieldDescribe("关联表单.")
	private List<String> relatedFormList = new ArrayList<String>();

	@FieldDescribe("移动端关联表单.")
	private List<String> mobileRelatedFormList = new ArrayList<String>();

	@FieldDescribe("关联脚本.")
	private Map<String, String> relatedScriptMap = new LinkedHashMap<String, String>();

	@FieldDescribe("移动端关联脚本.")
	private Map<String, String> mobileRelatedScriptMap = new LinkedHashMap<String, String>();

	public List<String> getRelatedFormList() {
		return this.relatedFormList == null ? new ArrayList<String>() : this.relatedFormList;
	}

	public List<String> getMobileRelatedFormList() {
		return this.mobileRelatedFormList == null ? new ArrayList<String>() : this.mobileRelatedFormList;
	}

	public Map<String, String> getRelatedScriptMap() {
		return this.relatedScriptMap == null ? new LinkedHashMap<String, String>() : this.relatedScriptMap;
	}

	public Map<String, String> getMobileRelatedScriptMap() {
		return this.mobileRelatedScriptMap == null ? new LinkedHashMap<String, String>() : this.mobileRelatedScriptMap;
	}

	public void setRelatedFormList(List<String> relatedFormList) {
		this.relatedFormList = relatedFormList;
	}

	public void setMobileRelatedFormList(List<String> mobileRelatedFormList) {
		this.mobileRelatedFormList = mobileRelatedFormList;
	}

	public void setRelatedScriptMap(Map<String, String> relatedScriptMap) {
		this.relatedScriptMap = relatedScriptMap;
	}

	public void setMobileRelatedScriptMap(Map<String, String> mobileRelatedScriptMap) {
		this.mobileRelatedScriptMap = mobileRelatedScriptMap;
	}

}
