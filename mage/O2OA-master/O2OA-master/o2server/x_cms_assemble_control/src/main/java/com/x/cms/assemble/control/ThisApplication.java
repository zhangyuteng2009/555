package com.x.cms.assemble.control;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import com.x.base.core.project.Context;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.message.MessageConnector;
import com.x.cms.assemble.control.queue.*;
import com.x.cms.assemble.control.timertask.Timertask_BatchOperationTask;
import com.x.cms.assemble.control.timertask.Timertask_InitOperationRunning;
import com.x.cms.assemble.control.timertask.Timertask_LogRecordCheckTask;
import com.x.cms.assemble.control.timertask.Timertask_RefreshAllDocumentReviews;

public class ThisApplication {

	private ThisApplication() {
		// nothing
	}

	protected static Context context;

	public static final String ROLE_CMSManager = "CMSManager@CMSManagerSystemRole@R";
	public static final String ROLE_Manager = "Manager@ManagerSystemRole@R";
	// 文档批量导入时数据存储过程
	public static final QueueDataRowImport queueDataRowImport = new QueueDataRowImport();
	// Document删除时也需要检查一下热点图片里的数据是否已经删除掉了
	public static final QueueDocumentDelete queueDocumentDelete = new QueueDocumentDelete();
	// Document变更标题时也需要更新一下热点图片里的数据
	public static final QueueDocumentUpdate queueDocumentUpdate = new QueueDocumentUpdate();
	// Document被访问时，需要将总的访问量更新到item的document中，便于视图使用，在队列里异步修改
	public static final QueueDocumentViewCountUpdate queueDocumentViewCountUpdate = new QueueDocumentViewCountUpdate();
	// 执行数据库中的批处理操作
	public static final QueueBatchOperation queueBatchOperation = new QueueBatchOperation();
	// Document发布时，向所有阅读者推送通知
	public static final QueueSendDocumentNotify queueSendDocumentNotify = new QueueSendDocumentNotify();
	// 执行文档的数据映射
	public static final ProjectionExecuteQueue projectionExecuteQueue = new ProjectionExecuteQueue();

	private static final ConcurrentHashMap<String, DataImportStatus> importStatus = new ConcurrentHashMap<>();

	public static Context context() {
		return context;
	}

	public static void init() throws Exception {
		CacheManager.init(context.clazz().getSimpleName());
		MessageConnector.start(context());
		context().startQueue(queueBatchOperation);
		context().startQueue(queueDocumentDelete);
		context().startQueue(queueDataRowImport);
		context().startQueue(queueDocumentUpdate);
		context().startQueue(queueDocumentViewCountUpdate);
		context().startQueue(queueSendDocumentNotify);
		context().startQueue(projectionExecuteQueue);
		// 每天凌晨2点执行一次
		context.schedule(Timertask_LogRecordCheckTask.class, "0 0 2 * * ?");
		context.schedule(Timertask_BatchOperationTask.class, "0 */5 * * * ?");

		// 每天凌晨1点，计算所有的文档的权限信息
		context.schedule(Timertask_RefreshAllDocumentReviews.class, "0 0 1 * * ?");
		// 集群下多台会一起运行，Timertask_BatchOperationTask运行即可
		context.scheduleLocal(Timertask_InitOperationRunning.class, 150);
	}

	public static void destroy() {
		try {
			CacheManager.shutdown();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static ConcurrentMap<String, DataImportStatus> listImportStatus() {
		return importStatus;
	}

	public static DataImportStatus getDataImportStatus(String batchName) {
		if (importStatus.get(batchName) == null) {
			DataImportStatus dataImportStatus = new DataImportStatus();
			dataImportStatus.setBatchName(batchName);
			importStatus.put(batchName, dataImportStatus);
		}
		return importStatus.get(batchName);
	}
}
