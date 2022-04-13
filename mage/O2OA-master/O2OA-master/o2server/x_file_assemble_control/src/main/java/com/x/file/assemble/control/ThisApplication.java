package com.x.file.assemble.control;

import com.x.base.core.project.Context;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.message.MessageConnector;
import com.x.file.assemble.control.jaxrs.file.FileRemoveQueue;
import com.x.file.assemble.control.schedule.RecycleClean;

/**
 * @author sword
 */
public class ThisApplication {

	private ThisApplication() {
		// nothing
	}

	public static final FileRemoveQueue fileRemoveQueue = new FileRemoveQueue();

	protected static Context context;

	public static Context context() {
		return context;
	}

	public static void init() {
		try {
			CacheManager.init(context.clazz().getSimpleName());
			MessageConnector.start(context());
			context.schedule(RecycleClean.class, "0 20 15 * * ?");
			context().startQueue(fileRemoveQueue);
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
