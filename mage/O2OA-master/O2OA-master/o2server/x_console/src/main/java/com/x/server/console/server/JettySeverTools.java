package com.x.server.console.server;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import com.x.base.core.entity.dynamic.DynamicBaseEntity;
import com.x.base.core.entity.dynamic.DynamicEntity;
import com.x.base.core.project.tools.ListTools;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.FileFilterUtils;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.filefilter.WildcardFileFilter;
import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.http.HttpVersion;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.SslConnectionFactory;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import com.x.base.core.project.x_base_core_project;
import com.x.base.core.project.annotation.Module;
import com.x.base.core.project.config.Config;

public abstract class JettySeverTools {

	protected JettySeverTools() {
		// nothing
	}

	protected static void addHttpsConnector(Server server, Integer port, boolean persistentConnectionsEnable)
			throws Exception {
		SslContextFactory sslContextFactory = new SslContextFactory.Server();
		sslContextFactory.setKeyStorePath(Config.sslKeyStore().getAbsolutePath());
		sslContextFactory.setKeyStorePassword(Config.token().getSslKeyStorePassword());
		sslContextFactory.setKeyManagerPassword(Config.token().getSslKeyManagerPassword());
		sslContextFactory.setTrustAll(true);
		HttpConfiguration config = new HttpConfiguration();
		config.setSecureScheme("https");
		config.setPersistentConnectionsEnabled(persistentConnectionsEnable);
		config.setRequestHeaderSize(8192 * 2);
		config.setResponseHeaderSize(8192 * 2);
		config.setSendServerVersion(false);
		config.setSendDateHeader(false);
		ServerConnector https = new ServerConnector(server,
				new SslConnectionFactory(sslContextFactory, HttpVersion.HTTP_1_1.asString()),
				new HttpConnectionFactory(config));
		https.setAcceptQueueSize(-1);
		https.setIdleTimeout(30000);
		https.setPort(port);
		server.addConnector(https);
	}

	protected static void addHttpConnector(Server server, Integer port, boolean persistentConnectionsEnable) {
		HttpConfiguration config = new HttpConfiguration();
		config.setPersistentConnectionsEnabled(persistentConnectionsEnable);
		config.setRequestHeaderSize(8192 * 2);
		config.setResponseHeaderSize(8192 * 2);
		config.setSendServerVersion(false);
		config.setSendDateHeader(false);
		ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(config));
		http.setAcceptQueueSize(-1);
		http.setIdleTimeout(30000);
		http.setPort(port);
		server.addConnector(http);
	}

	protected static void cleanDirectory(File dir) throws IOException {
		FileUtils.forceMkdir(dir);
		FileUtils.cleanDirectory(dir);
	}

	protected static String calculateExtraClassPath(Class<?> cls, Path... paths) throws Exception {
		List<String> jars = new ArrayList<>();
		jars.addAll(calculateExtraClassPathDefault());
		Module module = cls.getAnnotation(Module.class);
		for (String str : module.storeJars()) {
			File file = new File(Config.dir_store_jars(), str + ".jar");
			if (file.exists()) {
				jars.add(file.getAbsolutePath());
			}
		}
		for (String str : module.customJars()) {
			File file = new File(Config.dir_custom_jars(), str + ".jar");
			if (file.exists()) {
				jars.add(file.getAbsolutePath());
			}
		}
		if (module.dynamicJars() != null && module.dynamicJars().length > 0) {
			IOFileFilter filter = new WildcardFileFilter(DynamicEntity.JAR_PREFIX + "*.jar");
			for (File o : FileUtils.listFiles(Config.dir_dynamic_jars(true), filter, null)) {
				jars.add(o.getAbsolutePath());
			}
		}
		for (Path path : paths) {
			if (Files.exists(path) && Files.isDirectory(path)) {
				try (Stream<Path> stream = Files.walk(path, FileVisitOption.FOLLOW_LINKS)) {
					stream.filter(Files::isRegularFile)
							.filter(p -> p.toAbsolutePath().toString().toLowerCase().endsWith(".jar"))
							.forEach(p -> jars.add(p.toAbsolutePath().toString()));
				}
			}
		}
		return StringUtils.join(jars, ";");
	}

	private static List<String> calculateExtraClassPathDefault() throws Exception {
		List<String> jars = new ArrayList<>();
		IOFileFilter filter = new WildcardFileFilter(x_base_core_project.class.getSimpleName() + "*.jar");
		for (File o : FileUtils.listFiles(Config.dir_store_jars(), filter, null)) {
			jars.add(o.getAbsolutePath());
		}
		filter = new WildcardFileFilter("openjpa-*.jar");
		filter = FileFilterUtils.or(filter, new WildcardFileFilter("ehcache-*.jar"));
		/* 如果不单独导入会导致java.lang.NoClassDefFoundError: org/eclipse/jetty/http/MimeTypes */
		filter = FileFilterUtils.or(filter, new WildcardFileFilter("jetty-all-*.jar"));
		filter = FileFilterUtils.or(filter, new WildcardFileFilter("jetty-proxy-*.jar"));
		filter = FileFilterUtils.or(filter, new WildcardFileFilter("quartz-*.jar"));
		filter = FileFilterUtils.or(filter, new WildcardFileFilter("filters-*.jar"));
		/* jersey从AppClassLoader加载 */
		for (File o : FileUtils.listFiles(Config.dir_commons_ext().toFile(), filter, null)) {
			jars.add(o.getAbsolutePath());
		}
		return jars;
	}

}
