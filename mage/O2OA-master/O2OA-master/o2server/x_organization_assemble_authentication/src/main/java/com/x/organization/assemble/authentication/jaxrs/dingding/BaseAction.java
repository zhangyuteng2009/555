package com.x.organization.assemble.authentication.jaxrs.dingding;

import java.io.InputStream;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

import org.apache.commons.io.IOUtils;

import com.x.base.core.project.jaxrs.StandardJaxrsAction;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.DefaultCharset;

abstract class BaseAction extends StandardJaxrsAction {

	private static Logger logger = LoggerFactory.getLogger(ActionInfo.class);

	protected String get(String address) throws Exception {
		HttpsURLConnection connection = null;
		URL url = new URL(address);
		connection = (HttpsURLConnection) url.openConnection();
		connection.setRequestMethod("GET");
		connection.setUseCaches(false);
		connection.setDoOutput(false);
		connection.setDoInput(true);
		/** 访问主机上的端口 */
		connection.connect();
		byte[] buffer = null;
		try (InputStream input = connection.getInputStream()) {
			buffer = IOUtils.toByteArray(input);
			String str = new String(buffer, DefaultCharset.name);
			return str;
		}
	}
}