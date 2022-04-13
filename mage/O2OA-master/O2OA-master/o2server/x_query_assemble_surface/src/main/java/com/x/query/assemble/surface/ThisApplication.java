package com.x.query.assemble.surface;

import com.x.base.core.project.Context;
import com.x.base.core.project.cache.CacheManager;
import com.x.query.assemble.surface.queue.QueueImportData;

public class ThisApplication {

	private ThisApplication() {
		// nothing
	}

	protected static Context context;

	public static QueueImportData queueImportData = new QueueImportData();

	public static Context context() {
		return context;
	}

	public static void init() {
		try {
			CacheManager.init(context.clazz().getSimpleName());
			context().startQueue(queueImportData);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void destroy() {
		try {
			CacheManager.shutdown();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
