package com.x.processplatform.service.processing.jaxrs.data;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.dataitem.DataItemConverter;
import com.x.base.core.entity.dataitem.ItemCategory;
import com.x.base.core.entity.dataitem.ItemType;
import com.x.base.core.project.annotation.ActionLogger;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.gson.XGsonBuilder;
import com.x.base.core.project.jaxrs.StandardJaxrsAction;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.processplatform.core.entity.content.Attachment;
import com.x.processplatform.core.entity.content.Data;
import com.x.processplatform.core.entity.content.Data.DataWork;
import com.x.processplatform.core.entity.content.Read;
import com.x.processplatform.core.entity.content.ReadCompleted;
import com.x.processplatform.core.entity.content.Review;
import com.x.processplatform.core.entity.content.Task;
import com.x.processplatform.core.entity.content.TaskCompleted;
import com.x.processplatform.core.entity.content.Work;
import com.x.processplatform.core.entity.content.WorkCompleted;
import com.x.processplatform.core.entity.element.Process;
import com.x.processplatform.core.entity.element.Projection;
import com.x.processplatform.core.entity.element.util.ProjectionFactory;
import com.x.processplatform.service.processing.Business;
import com.x.query.core.entity.Item;

abstract class BaseAction extends StandardJaxrsAction {

	@ActionLogger
	private static Logger logger = LoggerFactory.getLogger(BaseAction.class);

	protected Gson gson = XGsonBuilder.instance();

	JsonElement getData(Business business, String job, String... paths) throws Exception {
		JsonElement jsonElement = null;
		List<Item> list = business.item().listWithJobWithPath(job, paths);
		DataItemConverter<Item> converter = new DataItemConverter<>(Item.class);
		jsonElement = converter.assemble(list, paths.length);
		return jsonElement;
	}

	// 将data中的Title 和 serial 字段同步到work中
	void updateTitleSerial(Business business, Work work, JsonElement jsonElement) throws Exception {
		String title = XGsonBuilder.extractString(jsonElement, Work.title_FIELDNAME);
		if (StringUtils.isBlank(title)) {
			title = XGsonBuilder.extractString(jsonElement, Work.TITLEALIAS_SUBJECT);
		}
		String serial = XGsonBuilder.extractString(jsonElement, Work.serial_FIELDNAME);
		// 如果有数据就将数据覆盖到work task taskCompleted read readCompleted review 中
		if ((StringUtils.isNotBlank(title) && (!Objects.equals(title, work.getTitle())))
				|| (StringUtils.isNotBlank(serial) && (!Objects.equals(serial, work.getSerial())))) {
			business.entityManagerContainer().beginTransaction(Work.class);
			business.entityManagerContainer().beginTransaction(Task.class);
			business.entityManagerContainer().beginTransaction(TaskCompleted.class);
			business.entityManagerContainer().beginTransaction(Read.class);
			business.entityManagerContainer().beginTransaction(ReadCompleted.class);
			business.entityManagerContainer().beginTransaction(Review.class);

			List<Task> tasks = business.entityManagerContainer().listEqual(Task.class, Task.job_FIELDNAME,
					work.getJob());
			List<TaskCompleted> taskCompleteds = business.entityManagerContainer().listEqual(TaskCompleted.class,
					TaskCompleted.job_FIELDNAME, work.getJob());
			List<Read> reads = business.entityManagerContainer().listEqual(Read.class, Read.job_FIELDNAME,
					work.getJob());
			List<ReadCompleted> readCompleteds = business.entityManagerContainer().listEqual(ReadCompleted.class,
					ReadCompleted.job_FIELDNAME, work.getJob());
			List<Review> reviews = business.entityManagerContainer().listEqual(Review.class, Review.job_FIELDNAME,
					work.getJob());

			this.updateTitle(title, work, tasks, taskCompleteds, reads, readCompleteds, reviews);
			this.updateSerial(serial, work, tasks, taskCompleteds, reads, readCompleteds, reviews);
			// 这里必须先提交掉,不然后面的获取会得到不一致的状态
			// <openjpa-2.4.3-SNAPSHOT-r422266:1777109 nonfatal user error>
			// org.apache.openjpa.persistence.InvalidStateException: Opera tion attempted on
			// a deleted instance.
			business.entityManagerContainer().commit();
		}
	}

	// 将data中的Title 和 serial 字段同步到work中
	void updateTitleSerial(Business business, WorkCompleted workCompleted, JsonElement jsonElement) throws Exception {
		String title = XGsonBuilder.extractString(jsonElement, WorkCompleted.title_FIELDNAME);
		String serial = XGsonBuilder.extractString(jsonElement, WorkCompleted.serial_FIELDNAME);
		// 如果有数据就将数据覆盖到work task taskCompleted read readCompleted review 中
		if ((StringUtils.isNotBlank(title) && (!Objects.equals(title, workCompleted.getTitle())))
				|| (StringUtils.isNotBlank(serial) && (!Objects.equals(serial, workCompleted.getSerial())))) {
			business.entityManagerContainer().beginTransaction(WorkCompleted.class);
			business.entityManagerContainer().beginTransaction(Task.class);
			business.entityManagerContainer().beginTransaction(TaskCompleted.class);
			business.entityManagerContainer().beginTransaction(Read.class);
			business.entityManagerContainer().beginTransaction(ReadCompleted.class);
			business.entityManagerContainer().beginTransaction(Review.class);

			List<Task> tasks = business.entityManagerContainer().listEqual(Task.class, Task.job_FIELDNAME,
					workCompleted.getJob());
			List<TaskCompleted> taskCompleteds = business.entityManagerContainer().listEqual(TaskCompleted.class,
					TaskCompleted.job_FIELDNAME, workCompleted.getJob());
			List<Read> reads = business.entityManagerContainer().listEqual(Read.class, Read.job_FIELDNAME,
					workCompleted.getJob());
			List<ReadCompleted> readCompleteds = business.entityManagerContainer().listEqual(ReadCompleted.class,
					ReadCompleted.job_FIELDNAME, workCompleted.getJob());
			List<Review> reviews = business.entityManagerContainer().listEqual(Review.class, Review.job_FIELDNAME,
					workCompleted.getJob());

			this.updateTitle(title, workCompleted, tasks, taskCompleteds, reads, readCompleteds, reviews);
			this.updateSerial(serial, workCompleted, tasks, taskCompleteds, reads, readCompleteds, reviews);
			// 这里必须先提交掉,不然后面的获取会得到不一致的状态
			// <openjpa-2.4.3-SNAPSHOT-r422266:1777109 nonfatal user error>
			// org.apache.openjpa.persistence.InvalidStateException: Opera tion attempted on
			// a deleted instance.
			business.entityManagerContainer().commit();
		}
	}

	private void updateTitle(String title, Work work, List<Task> tasks, List<TaskCompleted> taskCompleteds,
			List<Read> reads, List<ReadCompleted> readCompleteds, List<Review> reviews) {
		if (StringUtils.isNotBlank(title) && (!Objects.equals(title, work.getTitle()))) {
			work.setTitle(title);
			for (Task o : tasks) {
				o.setTitle(title);
			}
			for (TaskCompleted o : taskCompleteds) {
				o.setTitle(title);
			}
			for (Read o : reads) {
				o.setTitle(title);
			}
			for (ReadCompleted o : readCompleteds) {
				o.setTitle(title);
			}
			for (Review o : reviews) {
				o.setTitle(title);
			}
		}

	}

	private void updateTitle(String title, WorkCompleted workCompleted, List<Task> tasks,
			List<TaskCompleted> taskCompleteds, List<Read> reads, List<ReadCompleted> readCompleteds,
			List<Review> reviews) {
		if (StringUtils.isNotBlank(title) && (!Objects.equals(title, workCompleted.getTitle()))) {
			workCompleted.setTitle(title);
			for (Task o : tasks) {
				o.setTitle(title);
			}
			for (TaskCompleted o : taskCompleteds) {
				o.setTitle(title);
			}
			for (Read o : reads) {
				o.setTitle(title);
			}
			for (ReadCompleted o : readCompleteds) {
				o.setTitle(title);
			}
			for (Review o : reviews) {
				o.setTitle(title);
			}
		}

	}

	private void updateSerial(String serial, Work work, List<Task> tasks, List<TaskCompleted> taskCompleteds,
			List<Read> reads, List<ReadCompleted> readCompleteds, List<Review> reviews) {
		if (StringUtils.isNotBlank(serial) && (!Objects.equals(serial, work.getSerial()))) {
			work.setSerial(serial);
			for (Task o : tasks) {
				o.setSerial(serial);
			}
			for (TaskCompleted o : taskCompleteds) {
				o.setSerial(serial);
			}
			for (Read o : reads) {
				o.setSerial(serial);
			}
			for (ReadCompleted o : readCompleteds) {
				o.setSerial(serial);
			}
			for (Review o : reviews) {
				o.setSerial(serial);
			}
		}
	}

	private void updateSerial(String serial, WorkCompleted workCompleted, List<Task> tasks,
			List<TaskCompleted> taskCompleteds, List<Read> reads, List<ReadCompleted> readCompleteds,
			List<Review> reviews) {
		if (StringUtils.isNotBlank(serial) && (!Objects.equals(serial, workCompleted.getSerial()))) {
			workCompleted.setSerial(serial);
			for (Task o : tasks) {
				o.setSerial(serial);
			}
			for (TaskCompleted o : taskCompleteds) {
				o.setSerial(serial);
			}
			for (Read o : reads) {
				o.setSerial(serial);
			}
			for (ReadCompleted o : readCompleteds) {
				o.setSerial(serial);
			}
			for (Review o : reviews) {
				o.setSerial(serial);
			}
		}
	}

	void updateData(Business business, Work work, JsonElement jsonElement, String... paths) throws Exception {
		JsonObject jsonObject = jsonElement.getAsJsonObject();
		if (paths.length == 0) {
			DataWork dataWork = DataWork.workCopier.copy(work);
			dataWork.setWorkId(work.getId());
			dataWork.setWorkCompletedId("");
			dataWork.setCompleted(false);
			jsonObject.add(Data.WORK_PROPERTY, gson.toJsonTree(dataWork));
			jsonObject.add(Data.ATTACHMENTLIST_PROPERTY,
					gson.toJsonTree(this.listDataAttachment(business, work.getJob())));
		}
		DataItemConverter<Item> converter = new DataItemConverter<>(Item.class);
		List<Item> exists = business.item().listWithJobWithPath(work.getJob(), paths);
		List<Item> currents = converter.disassemble(jsonObject, paths);
		List<Item> removes = converter.subtract(exists, currents);
		List<Item> adds = converter.subtract(currents, exists);
		if ((!removes.isEmpty()) || (!adds.isEmpty())) {
			business.entityManagerContainer().beginTransaction(Item.class);
			for (Item _o : removes) {
				business.entityManagerContainer().remove(_o);
			}
			for (Item _o : adds) {
				this.fill(_o, work);
				business.entityManagerContainer().persist(_o);
			}
			// 标记数据已经被修改
			business.entityManagerContainer().beginTransaction(Work.class);
			work.setDataChanged(true);
			if (BooleanUtils.isTrue(Config.processPlatform().getUpdateDataProjectionEnable())) {
				business.entityManagerContainer().beginTransaction(Task.class);
				business.entityManagerContainer().beginTransaction(TaskCompleted.class);
				business.entityManagerContainer().beginTransaction(Read.class);
				business.entityManagerContainer().beginTransaction(ReadCompleted.class);
				business.entityManagerContainer().beginTransaction(Review.class);
				projection(business, work, XGsonBuilder.convert(jsonObject, Data.class));
			}
			// 基于前面的原因,这里进行单独提交
			business.entityManagerContainer().commit();
		}
	}

	void updateData(Business business, WorkCompleted workCompleted, JsonElement jsonElement, String... paths)
			throws Exception {
		JsonObject jsonObject = jsonElement.getAsJsonObject();
		if (paths.length == 0) {
			DataWork dataWork = DataWork.workCompletedCopier.copy(workCompleted);
			dataWork.setWorkCompletedId(workCompleted.getId());
			dataWork.setWorkId(workCompleted.getWork());
			dataWork.setCompleted(true);
			jsonObject.add(Data.WORK_PROPERTY, gson.toJsonTree(dataWork));
			jsonObject.add(Data.ATTACHMENTLIST_PROPERTY,
					gson.toJsonTree(this.listDataAttachment(business, workCompleted.getJob())));
		}
		DataItemConverter<Item> converter = new DataItemConverter<>(Item.class);
		List<Item> exists = business.item().listWithJobWithPath(workCompleted.getJob(), paths);
		List<Item> currents = converter.disassemble(jsonObject, paths);
		List<Item> removes = converter.subtract(exists, currents);
		List<Item> adds = converter.subtract(currents, exists);
		if ((!removes.isEmpty()) || (!adds.isEmpty())) {
			business.entityManagerContainer().beginTransaction(Item.class);
			for (Item _o : removes) {
				business.entityManagerContainer().remove(_o);
			}
			for (Item _o : adds) {
				this.fill(_o, workCompleted);
				business.entityManagerContainer().persist(_o);
			}
			if (BooleanUtils.isTrue(Config.processPlatform().getUpdateDataProjectionEnable())) {
				business.entityManagerContainer().beginTransaction(WorkCompleted.class);
				business.entityManagerContainer().beginTransaction(Task.class);
				business.entityManagerContainer().beginTransaction(TaskCompleted.class);
				business.entityManagerContainer().beginTransaction(Read.class);
				business.entityManagerContainer().beginTransaction(ReadCompleted.class);
				business.entityManagerContainer().beginTransaction(Review.class);
				projection(business, workCompleted, XGsonBuilder.convert(jsonObject, Data.class));
			}
			// 基于前面的原因,这里进行单独提交
			business.entityManagerContainer().commit();

		}

	}

	void createData(Business business, Work work, JsonElement jsonElement, String... paths) throws Exception {
		if (jsonElement.isJsonObject()) {
			JsonObject jsonObject = jsonElement.getAsJsonObject();

			jsonObject.add(Data.WORK_PROPERTY, gson.toJsonTree(Data.DataWork.workCopier.copy(work)));
			jsonObject.add(Data.ATTACHMENTLIST_PROPERTY,
					gson.toJsonTree(this.listDataAttachment(business, work.getJob())));

			jsonElement = jsonObject;
		}
		String[] parentPaths = new String[] { "", "", "", "", "", "", "", "" };
		String[] cursorPaths = new String[] { "", "", "", "", "", "", "", "" };
		for (int i = 0; i < paths.length - 1; i++) {
			parentPaths[i] = paths[i];
			cursorPaths[i] = paths[i];
		}
		cursorPaths[paths.length - 1] = paths[paths.length - 1];
		Item parent = business.item().getWithJobWithPath(work.getJob(), parentPaths[0], parentPaths[1], parentPaths[2],
				parentPaths[3], parentPaths[4], parentPaths[5], parentPaths[6], parentPaths[7]);
		if (null == parent) {
			throw new ExceptionParentNotExist(paths);
		}
		Item cursor = business.item().getWithJobWithPath(work.getJob(), cursorPaths[0], cursorPaths[1], cursorPaths[2],
				cursorPaths[3], cursorPaths[4], cursorPaths[5], cursorPaths[6], cursorPaths[7]);
		DataItemConverter<Item> converter = new DataItemConverter<>(Item.class);
		business.entityManagerContainer().beginTransaction(Item.class);
		if ((null != cursor) && cursor.getItemType().equals(ItemType.a)) {
			// 向数组里面添加一个成员对象
			Integer index = business.item().getArrayLastIndexWithJobWithPath(work.getJob(), paths);
			// 新的路径开始
			String[] ps = new String[paths.length + 1];
			for (int i = 0; i < paths.length; i++) {
				ps[i] = paths[i];
			}
			ps[paths.length] = Integer.toString(index + 1);
			List<Item> adds = converter.disassemble(jsonElement, ps);
			for (Item o : adds) {
				this.fill(o, work);
				business.entityManagerContainer().persist(o);
			}
		} else if ((cursor == null) && parent.getItemType().equals(ItemType.o)) {
			// 向parent对象添加一个属性值
			List<Item> adds = converter.disassemble(jsonElement, paths);
			for (Item o : adds) {
				this.fill(o, work);
				business.entityManagerContainer().persist(o);
			}
		} else {
			throw new ExceptionUnexpectedData(work.getId(), paths, jsonElement);
		}
		// 标记数据已经被修改
		business.entityManagerContainer().beginTransaction(Work.class);
		work.setDataChanged(true);
		if (BooleanUtils.isTrue(Config.processPlatform().getUpdateDataProjectionEnable())) {
			business.entityManagerContainer().beginTransaction(Task.class);
			business.entityManagerContainer().beginTransaction(TaskCompleted.class);
			business.entityManagerContainer().beginTransaction(Read.class);
			business.entityManagerContainer().beginTransaction(ReadCompleted.class);
			business.entityManagerContainer().beginTransaction(Review.class);
			projection(business, work, XGsonBuilder.convert(jsonElement, Data.class));
		}
		business.entityManagerContainer().commit();
	}

	void deleteData(Business business, Work work, String... paths) throws Exception {
		List<Item> exists = business.item().listWithJobWithPath(work.getJob(), paths);
		if (exists.isEmpty()) {
			throw new ExceptionDataNotExist(work.getJob(), paths);
		}
		business.entityManagerContainer().beginTransaction(Item.class);
		for (Item o : exists) {
			business.entityManagerContainer().remove(o);
		}
		if ((paths.length > 0) && NumberUtils.isCreatable(paths[paths.length - 1])) {
			int position = paths.length - 1;
			for (Item o : business.item().listWithJobWithPathWithAfterLocation(work.getJob(),
					NumberUtils.toInt(paths[position]), paths)) {
				o.path(Integer.toString(o.pathLocation(position) - 1), position);
			}
		}
		// 标记数据已经被修改
		business.entityManagerContainer().beginTransaction(Work.class);
		work.setDataChanged(true);
		business.entityManagerContainer().commit();
	}

	void fill(Item o, Work work) {
		// 将DateItem与Work放在同一个分区
		o.setDistributeFactor(work.getDistributeFactor());
		o.setBundle(work.getJob());
		o.setItemCategory(ItemCategory.pp);
	}

	void fill(Item o, WorkCompleted workCompleted) {
		// 将DateItem与Work放在同一个分区
		o.setDistributeFactor(workCompleted.getDistributeFactor());
		o.setBundle(workCompleted.getJob());
		o.setItemCategory(ItemCategory.pp);
	}

	private List<Data.DataAttachment> listDataAttachment(Business business, String job) throws Exception {
		return business.entityManagerContainer().fetchEqual(Attachment.class, Data.DataAttachment.copier,
				Attachment.job_FIELDNAME, job);
	}

	private void projection(Business business, Work work, Data data) throws Exception {
		Process process = business.element().get(work.getProcess(), Process.class);
		if (null != process) {
			List<Projection> list = this.listProjection(process);
			if (ListTools.isNotEmpty(list)) {
				ProjectionFactory.projectionWork(list, data, work);
				business.entityManagerContainer().listEqualAndNotEqual(Work.class, Work.job_FIELDNAME, work.getJob(),
						JpaObject.id_FIELDNAME, work.getId()).forEach(o -> {
							try {
								ProjectionFactory.projectionWork(list, data, o);
							} catch (Exception e) {
								logger.error(e);
							}
						});
				projectionTask(business, work.getJob(), data, list);
				projectionTaskCompleted(business, work.getJob(), data, list);
				projectionRead(business, work.getJob(), data, list);
				projectionReadCompleted(business, work.getJob(), data, list);
				projectionReview(business, work.getJob(), data, list);
			}
		}
	}

	private void projection(Business business, WorkCompleted workCompleted, Data data) throws Exception {
		Process process = business.element().get(workCompleted.getProcess(), Process.class);

		if (null != process) {
			List<Projection> list = this.listProjection(process);

			if (ListTools.isNotEmpty(list)) {
				ProjectionFactory.projectionWorkCompleted(list, data, workCompleted);
				projectionTaskCompleted(business, workCompleted.getJob(), data, list);
				projectionRead(business, workCompleted.getJob(), data, list);
				projectionReadCompleted(business, workCompleted.getJob(), data, list);
				projectionReview(business, workCompleted.getJob(), data, list);
			}
		}
	}

	private void projectionTask(Business business, String job, Data data, List<Projection> list) throws Exception {
		business.entityManagerContainer().listEqual(Task.class, Task.job_FIELDNAME, job).forEach(o -> {
			try {
				ProjectionFactory.projectionTask(list, data, o);
			} catch (Exception e) {
				logger.error(e);
			}
		});
	}

	private void projectionTaskCompleted(Business business, String job, Data data, List<Projection> list)
			throws Exception {
		business.entityManagerContainer().listEqual(TaskCompleted.class, TaskCompleted.job_FIELDNAME, job)
				.forEach(o -> {
					try {
						ProjectionFactory.projectionTaskCompleted(list, data, o);
					} catch (Exception e) {
						logger.error(e);
					}
				});
	}

	private void projectionRead(Business business, String job, Data data, List<Projection> list) throws Exception {
		business.entityManagerContainer().listEqual(Read.class, Read.job_FIELDNAME, job).forEach(o -> {
			try {
				ProjectionFactory.projectionRead(list, data, o);
			} catch (Exception e) {
				logger.error(e);
			}
		});
	}

	private void projectionReadCompleted(Business business, String job, Data data, List<Projection> list)
			throws Exception {
		business.entityManagerContainer().listEqual(ReadCompleted.class, ReadCompleted.job_FIELDNAME, job)
				.forEach(o -> {
					try {
						ProjectionFactory.projectionReadCompleted(list, data, o);
					} catch (Exception e) {
						logger.error(e);
					}
				});
	}

	private void projectionReview(Business business, String job, Data data, List<Projection> list) throws Exception {
		business.entityManagerContainer().listEqual(Review.class, Review.job_FIELDNAME, job).forEach(o -> {
			try {
				ProjectionFactory.projectionReview(list, data, o);
			} catch (Exception e) {
				logger.error(e);
			}
		});
	}

	public List<Projection> listProjection(Process process) {
		List<Projection> list = new ArrayList<>();
		String text = process.getProjection();
		if (XGsonBuilder.isJsonArray(text)) {
			list = XGsonBuilder.instance().fromJson(text, new TypeToken<List<Projection>>() {
			}.getType());
		}
		return list;
	}

}
