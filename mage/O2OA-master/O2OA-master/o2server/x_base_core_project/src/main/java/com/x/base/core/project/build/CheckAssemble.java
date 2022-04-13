package com.x.base.core.project.build;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.annotation.WebFilter;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.reflect.FieldUtils;

import com.x.base.core.project.annotation.FieldDescribe;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ClassInfoList;
import io.github.classgraph.ScanResult;

public class CheckAssemble {

	public static void main(String... args) throws Exception {
		List<ClassInfo> list = new ArrayList<>();
		try (ScanResult scanResult = new ClassGraph().disableJarScanning().enableAllInfo().scan()) {
			ClassInfoList classInfoList = scanResult.getAllClasses();
			for (ClassInfo info : classInfoList) {
				if (StringUtils.endsWith(info.getSimpleName(), "$Wi")) {
					list.add(info);
				}
			}
		}
		for (ClassInfo info : list) {
			Class<?> cls = Class.forName(info.getName());
			if (FieldUtils.getFieldsListWithAnnotation(cls, FieldDescribe.class).isEmpty()) {
				System.err.println(String.format("%s not set FieldDescribe", info.getName()));
			}
		}
		try (ScanResult scanResult = new ClassGraph().disableJarScanning().enableAllInfo().scan()) {
			ClassInfoList classInfoList = scanResult.getClassesWithAnnotation(WebFilter.class.getName());
			for (ClassInfo info : classInfoList) {
				Class cls = Class.forName(info.getName());
				WebFilter webFilter = (WebFilter) cls.getAnnotation(WebFilter.class);
				if (webFilter.asyncSupported() == false) {
					System.err.println("webFilter not set asyncSupported:" + info.getName());
				}
			}
		}
	}
}
