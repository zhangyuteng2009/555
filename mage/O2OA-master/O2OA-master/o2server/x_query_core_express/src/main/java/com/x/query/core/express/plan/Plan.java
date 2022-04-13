package com.x.query.core.express.plan;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.apache.commons.collections4.list.TreeList;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.dataitem.ItemPrimitiveType;
import com.x.base.core.entity.dataitem.ItemStringValueType;
import com.x.base.core.entity.tools.JpaObjectTools;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.organization.OrganizationDefinition;
import com.x.base.core.project.scripting.JsonScriptingExecutor;
import com.x.base.core.project.scripting.ScriptingFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.query.core.entity.Item;
import com.x.query.core.entity.Item_;

public abstract class Plan extends GsonPropertyObject {

	// private static Logger logger = LoggerFactory.getLogger(Plan.class);

	public static final String SCOPE_WORK = "work";
	public static final String SCOPE_CMS_INFO = "cms_info";
	public static final String SCOPE_CMS_DATA = "cms_data";
	public static final String SCOPE_WORKCOMPLETED = "workCompleted";
	public static final String SCOPE_ALL = "all";

	public static final String CALCULATE_SUM = "sum";
	public static final String CALCULATE_AVERAGE = "average";
	public static final String CALCULATE_COUNT = "count";

	// protected static final int SQL_STATEMENT_IN_BATCH = 1000;

	public Runtime runtime;

	public SelectEntries selectList = new SelectEntries();

	public List<FilterEntry> filterList = new TreeList<>();

	public List<FilterEntry> customFilterList = new TreeList<>();

	/* 需要输出,前台也需要使用此值 */
	public List<SelectEntry> orderList = new TreeList<>();

	/* 需要输出,前台也需要使用此值 */
	public SelectEntry group = null;

	public List<String> columnList = new TreeList<>();

	public String afterGridScriptText = "";

	public String afterGroupGridScriptText = "";

	public String afterCalculateGridScriptText = "";

	public Table grid;

	public GroupTable groupGrid;

	public List<Object> columnGrid;

	public Boolean exportGrid;

	public Boolean exportGroupGrid;

	public Integer count;

	/**
	 * !!这个类最后要输出.不能gson scriptEngine对象
	 *
	 */
	private transient ScriptEngine scriptEngine;

	private Table order(Table table) {
		Comparator<Row> comparator = new Comparator<Row>() {
			@SuppressWarnings({ "rawtypes", "unchecked" })
			public int compare(Row r1, Row r2) {
				int comp = 0;
				Object o1 = null;
				Object o2 = null;
				Comparable c1 = null;
				Comparable c2 = null;
				for (SelectEntry en : orderList) {
					o1 = r1.find(en.column);
					o2 = r2.find(en.column);
					if (BooleanUtils.isTrue(en.numberOrder)) {
						if (StringUtils.isEmpty(o1.toString())) {
							c1 = Double.MAX_VALUE;
						} else {
							try {
								c1 = Double.parseDouble(o1.toString());
							} catch (Exception e) {
								c1 = Double.MAX_VALUE;
							}
						}
						if (StringUtils.isEmpty(o2.toString())) {
							c2 = Double.MAX_VALUE;
						} else {
							try {
								c2 = Double.parseDouble(o2.toString());
							} catch (Exception e) {
								c2 = Double.MAX_VALUE;
							}
						}
						if (StringUtils.equals(SelectEntry.ORDER_ASC, en.orderType)) {
							comp = c1.compareTo(c2);
						} else {
							comp = c2.compareTo(c1);
						}
					} else if (null == o1 && null == o2) {
						comp = 0;
					} else if (null == o1) {
						comp = -1;
					} else if (null == o2) {
						comp = 1;
					} else if (o1 instanceof Collection<?> || o2 instanceof Collection<?>) {
						comp = 0;
					} else {
						if (o1.getClass() == o2.getClass()) {
							c1 = (Comparable) o1;
							c2 = (Comparable) o2;
						} else {
							c1 = o1.toString();
							c2 = o2.toString();
						}
						if (StringUtils.equals(SelectEntry.ORDER_ASC, en.orderType)) {
							comp = c1.compareTo(c2);
						} else {
							comp = c2.compareTo(c1);
						}
					}
					if (comp != 0) {
						return comp;
					}
				}
				return comp;
			}
		};
		List<Row> list = new TreeList<>();
		if ((null != table) && (!table.isEmpty()) && (!orderList.isEmpty())) {
			list = table.stream().sorted(comparator).collect(Collectors.toList());
			table.clear();
			table.addAll(list);
		}
		return table;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private GroupTable group(Table table) throws Exception {
		final String orderType = (null == this.group) ? SelectEntry.ORDER_ORIGINAL : this.group.orderType;
		Map<Object, List<Row>> map = table.stream().collect(Collectors.groupingBy(row -> row.find(this.group.column)));
		List<GroupRow> groupRows = new GroupTable();
		for (Entry<Object, List<Row>> en : map.entrySet()) {
			Table o = new Table();
			o.addAll(en.getValue());
			o = order(o);
			GroupRow groupRow = new GroupRow();
			if (this.group.isName) {
				groupRow.group = this.name(Objects.toString(en.getKey()));
			} else {
				groupRow.group = en.getKey();
			}
			groupRow.list = o;
			groupRows.add(groupRow);
		}
		/* 分类值再进行一次排序 */
		groupRows = groupRows.stream().sorted((r1, r2) -> {
			Object o1 = r1.group;
			Object o2 = r2.group;
			if (null == o1 && null == o2) {
				return 0;
			} else if (null == o1) {
				return -1;
			} else if (null == o2) {
				return 1;
			} else {
				Comparable c1 = (Comparable) o1;
				Comparable c2 = (Comparable) o2;
				if (StringUtils.equals(SelectEntry.ORDER_ASC, orderType)) {
					return c1.compareTo(c2);
				} else {
					return c2.compareTo(c1);
				}
			}
		}).collect(Collectors.toList());
		GroupTable groupTable = new GroupTable();
		groupTable.addAll(groupRows);
		return groupTable;
	}

	abstract void adjust() throws Exception;

	abstract List<String> listBundle() throws Exception;

	public void access() throws Exception {
		/* 先获取所有记录对应的job值作为返回的结果集 */
		/* 先进行字段调整 */
		this.adjust();
		this.group = this.findGroupSelectEntry();
		this.orderList = this.listOrderSelectEntry();
		List<String> bundles = null;
		if ((null != this.runtime) && (ListTools.isNotEmpty(runtime.bundleList))) {
			bundles = this.runtime.bundleList;
		} else {
			bundles = this.listBundle();
		}

		if ((null != this.runtime.count) && (this.runtime.count > 0)) {
			/* runtime限制了数量 */
			if (this.runtime.count < bundles.size()) {
				bundles = bundles.subList(0, this.runtime.count);
			}
		}

		final Table fillTable = this.concreteTable(bundles);
		List<CompletableFuture<Void>> futures = new TreeList<>();
		for (List<String> _part_bundles : ListTools.batch(bundles, Config.query().getPlanQueryBatchSize())) {
			for (SelectEntry selectEntry : this.selectList) {
				CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
					try {
						this.fillSelectEntry(_part_bundles, selectEntry, fillTable);
					} catch (Exception e) {
						e.printStackTrace();
					}
				});
				futures.add(future);
			}
		}
		for (CompletableFuture<Void> future : futures) {
			future.get(300, TimeUnit.SECONDS);
		}
		Table table = this.order(fillTable);
		/* 新增测试 */
		if (BooleanUtils.isFalse(this.selectList.emptyColumnCode())) {
			// ScriptEngine engine = this.getScriptEngine();
			ScriptContext scriptContext = ScriptingFactory.scriptContextEvalInitialScript();
			scriptContext.getBindings(ScriptContext.ENGINE_SCOPE).put("gird", table);
			for (SelectEntry selectEntry : this.selectList) {
				if (StringUtils.isNotBlank(selectEntry.code)) {
					List<ExtractObject> extractObjects = new TreeList<>();
					table.stream().forEach(r -> {
						ExtractObject extractObject = new ExtractObject();
						extractObject.setBundle(r.bundle);
						extractObject.setColumn(selectEntry.getColumn());
						extractObject.setValue(r.find(selectEntry.getColumn()));
						extractObject.setEntry(r);
						extractObjects.add(extractObject);
					});
					scriptContext.getBindings(ScriptContext.ENGINE_SCOPE).put("extractObjects", extractObjects);
					StringBuilder text = new StringBuilder();
					text.append("function executeScript(o){\n");
					text.append(selectEntry.code);
					text.append("\n");
					text.append("}\n");
					text.append("for each (var extractObject in extractObjects) {\n");
					text.append("var o= {\n");
					text.append("'value':extractObject.getValue(),\n");
					text.append("'entry':extractObject.getEntry(),\n");
					text.append("'columnName':extractObject.getColumn()\n");
					text.append("}\n");
					text.append("extractObject.setValue(executeScript.apply(o));\n");
					text.append("}");
					// engine.eval(text.toString());
					CompiledScript cs = ScriptingFactory.compile(text.toString());
					JsonScriptingExecutor.eval(cs, scriptContext);
					for (ExtractObject extractObject : extractObjects) {
						table.get(extractObject.getBundle()).put(extractObject.getColumn(), extractObject.getValue());
					}
				}
			}
		}
		this.grid = table;
		if (null != this.findGroupSelectEntry()) {
			GroupTable groupTable = group(table);
			if (StringUtils.isNotEmpty(this.afterGroupGridScriptText)) {
				ScriptEngine engine = this.getScriptEngine();
				engine.put("groupGrid", groupTable);
				engine.eval(this.afterGroupGridScriptText);
			}
			this.groupGrid = groupTable;
		}
		/* 需要抽取单独的列 */
		if (ListTools.isNotEmpty(this.columnList)) {
			this.columnGrid = new TreeList<Object>();
			for (String column : this.columnList) {
				List<Object> list = new TreeList<>();
				SelectEntry selectEntry = this.selectList.column(column);
				if (null != selectEntry) {
					for (Row o : table) {
						if (selectEntry.isName) {
							list.add(name(Objects.toString(o.find(column), "")));
						} else {
							list.add(o.find(column));
						}
					}
				}
				/* 只有一列的情况下直接输出List */
				if (this.columnList.size() == 1) {
					this.columnGrid = list;
				} else {
					this.columnGrid.add(list);
				}
			}
		}
		if (BooleanUtils.isFalse(exportGrid)) {
			this.grid = null;
		}
		if (BooleanUtils.isFalse(exportGroupGrid)) {
			this.groupGrid = null;
		}
		if (null != this.grid) {
			this.selectList.stream().filter(o -> {
				return BooleanUtils.isTrue(o.isName);
			}).forEach(o -> {
				this.grid.forEach(row -> {
					row.put(o.column, name(Objects.toString(row.find(o.column), "")));
				});
			});
		}
		if (null != this.groupGrid) {
			if (this.group.isName) {
				this.groupGrid.stream().forEach(o -> {
					o.group = name(Objects.toString(o.group, ""));
				});
			}
			this.selectList.stream().filter(o -> {
				return BooleanUtils.isTrue(o.isName);
			}).forEach(o -> {
				this.grid.forEach(row -> {
					row.put(o.column, name(Objects.toString(row.find(o.column), "")));
				});
			});
		}
	}

	public List<String> fetchBundles() throws Exception {
		/* 先获取所有记录对应的job值作为返回的结果集 */
		List<String> bundles = this.listBundle();
		/* 先进行字段调整 */
		this.adjust();
		this.group = this.findGroupSelectEntry();
		this.orderList = this.listOrderSelectEntry();
		if ((null != this.runtime.count) && (this.runtime.count > 0)) {
			/* runtime限制了数量 */
			if (this.runtime.count < bundles.size()) {
				bundles = bundles.subList(0, this.runtime.count);
			}
		}
		if (orderList.isEmpty()) {
			return bundles;
		}
		TreeList<String> os = new TreeList<>();
		final Table fillTable = this.concreteTable(bundles);
		List<CompletableFuture<Void>> futures = new TreeList<>();
		for (List<String> _part_bundles : ListTools.batch(bundles, Config.query().getPlanQueryBatchSize())) {
			for (SelectEntry selectEntry : this.orderList) {
				CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
					try {
						this.fillSelectEntry(_part_bundles, selectEntry, fillTable);
					} catch (Exception e) {
						e.printStackTrace();
					}
				});
				futures.add(future);
			}
		}
		for (CompletableFuture<Void> future : futures) {
			future.get(300, TimeUnit.SECONDS);
		}
		Table table = this.order(fillTable);
		if (null == group) {
			for (Row row : table) {
				os.add(row.bundle);
			}
		} else {
			for (GroupRow groupRow : group(table)) {
				for (Row row : groupRow.list) {
					os.add(row.bundle);
				}
			}
		}
		return os;
	}

	private String name(String str) {
		Matcher m = OrganizationDefinition.distinguishedName_pattern.matcher(str);
		if (m.find()) {
			return m.group(1);
		}
		return str;
	}

	private SelectEntry findGroupSelectEntry() {
		for (SelectEntry _o : this.selectList) {
			if (BooleanUtils.isTrue(_o.groupEntry)) {
				return _o;
			}
		}
		return null;
	}

	private List<SelectEntry> listOrderSelectEntry() {
		List<SelectEntry> list = new TreeList<>();
		SelectEntry _g = this.findGroupSelectEntry();
		if (null != _g) {
			if (_g.isOrderType()) {
				list.add(_g);
			}
		}
		for (SelectEntry _o : this.selectList) {
			if (_o.isOrderType()) {
				list.add(_o);
			}
		}
		return list;
	}

	private Table concreteTable(List<String> jobs) throws Exception {
		Table table = new Table();
		for (String str : jobs) {
			Row row = new Row(str);
			for (SelectEntry entry : ListTools.trim(this.selectList, true, false)) {
				if (entry.available()) {
					/** 统一填充默认值 */
					row.put(entry.getColumn(), Objects.toString(entry.defaultValue, ""));
				}
			}
			table.add(row);
		}
		return table;
	}

	private void fillSelectEntry(List<String> bundles, SelectEntry selectEntry, Table table) throws Exception {
		/* oracle 将empty string 自动转换成null,需要判断 */
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			EntityManager em = emc.get(Item.class);
			CriteriaBuilder cb = em.getCriteriaBuilder();
			CriteriaQuery<Tuple> cq = cb.createQuery(Tuple.class);
			Root<Item> root = cq.from(Item.class);
			Predicate p = cb.isMember(root.get(Item_.bundle), cb.literal(bundles));
			String[] paths = StringUtils.split(selectEntry.path, ".");
			List<Order> orderList = new ArrayList<>();
			if ((paths.length > 0) && StringUtils.isNotEmpty(paths[0])) {
				p = cb.and(p, cb.equal(root.get(Item_.path0), paths[0]));
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path0)), cb.equal(root.get(Item_.path0), "")));
			}
			if ((paths.length > 1) && StringUtils.isNotEmpty(paths[1])) {
				if (!FilterEntry.WILDCARD.equals(paths[1])) {
					p = cb.and(p, cb.equal(root.get(Item_.path1), paths[1]));
				} else {
					orderList.add(cb.asc(root.get(Item_.path1)));
				}
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path1)), cb.equal(root.get(Item_.path1), "")));
			}
			if ((paths.length > 2) && StringUtils.isNotEmpty(paths[2])) {
				if (!FilterEntry.WILDCARD.equals(paths[2])) {
					p = cb.and(p, cb.equal(root.get(Item_.path2), paths[2]));
				} else {
					orderList.add(cb.asc(root.get(Item_.path2)));
				}
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path2)), cb.equal(root.get(Item_.path2), "")));
			}
			if ((paths.length > 3) && StringUtils.isNotEmpty(paths[3])) {
				if (!FilterEntry.WILDCARD.equals(paths[3])) {
					p = cb.and(p, cb.equal(root.get(Item_.path3), paths[3]));
				} else {
					orderList.add(cb.asc(root.get(Item_.path3)));
				}
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path3)), cb.equal(root.get(Item_.path3), "")));
			}
			if ((paths.length > 4) && StringUtils.isNotEmpty(paths[4])) {
				if (!FilterEntry.WILDCARD.equals(paths[4])) {
					p = cb.and(p, cb.equal(root.get(Item_.path4), paths[4]));
				} else {
					orderList.add(cb.asc(root.get(Item_.path4)));
				}
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path4)), cb.equal(root.get(Item_.path4), "")));
			}
			if ((paths.length > 5) && StringUtils.isNotEmpty(paths[5])) {
				if (!FilterEntry.WILDCARD.equals(paths[5])) {
					p = cb.and(p, cb.equal(root.get(Item_.path5), paths[5]));
				} else {
					orderList.add(cb.asc(root.get(Item_.path5)));
				}
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path5)), cb.equal(root.get(Item_.path5), "")));
			}
			if ((paths.length > 6) && StringUtils.isNotEmpty(paths[6])) {
				if (!FilterEntry.WILDCARD.equals(paths[6])) {
					p = cb.and(p, cb.equal(root.get(Item_.path6), paths[6]));
				} else {
					orderList.add(cb.asc(root.get(Item_.path6)));
				}
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path6)), cb.equal(root.get(Item_.path6), "")));
			}
			if ((paths.length > 7) && StringUtils.isNotEmpty(paths[7])) {
				if (!FilterEntry.WILDCARD.equals(paths[7])) {
					p = cb.and(p, cb.equal(root.get(Item_.path7), paths[7]));
				} else {
					orderList.add(cb.asc(root.get(Item_.path7)));
				}
			} else {
				p = cb.and(p, cb.or(cb.isNull(root.get(Item_.path7)), cb.equal(root.get(Item_.path7), "")));
			}
			cq.multiselect(root.get(Item_.bundle), root.get(Item_.itemPrimitiveType),
					root.get(Item_.itemStringValueType), root.get(Item_.stringShortValue),
					root.get(Item_.stringLongValue), root.get(Item_.dateValue), root.get(Item_.timeValue),
					root.get(Item_.dateTimeValue), root.get(Item_.booleanValue), root.get(Item_.numberValue)).where(p);
			boolean isList = false;
			if (!orderList.isEmpty()) {
				isList = true;
				cq.orderBy(orderList);
			}
			List<Tuple> list = em.createQuery(cq).getResultList();
			Row row = null;
			for (Tuple o : list) {
				row = table.get(Objects.toString(o.get(0)));
				switch (ItemPrimitiveType.valueOf(Objects.toString(o.get(1)))) {
				case s:
					switch (ItemStringValueType.valueOf(Objects.toString(o.get(2)))) {
					case s:
						if (null != o.get(3)) {
							if ((null != o.get(4)) && StringUtils.isNotEmpty(Objects.toString(o.get(4)))) {
								row.put(selectEntry.getColumn(), Objects.toString(o.get(4)), isList);
							} else {
								row.put(selectEntry.getColumn(), Objects.toString(o.get(3)), isList);
							}
						}
						break;
					case d:
						if (null != o.get(5)) {
							row.put(selectEntry.getColumn(), JpaObjectTools.confirm((Date) o.get(5)), isList);
						}
						break;
					case t:
						if (null != o.get(6)) {
							row.put(selectEntry.getColumn(), JpaObjectTools.confirm((Date) o.get(6)), isList);
						}
						break;
					case dt:
						if (null != o.get(7)) {
							row.put(selectEntry.getColumn(), JpaObjectTools.confirm((Date) o.get(7)), isList);
						}
						break;
					default:
						break;
					}
					break;
				case b:
					if (null != o.get(8)) {
						row.put(selectEntry.getColumn(), (Boolean) o.get(8), isList);
					}
					break;
				case n:
					if (null != o.get(9)) {
						row.put(selectEntry.getColumn(), (Number) o.get(9), isList);
					}
					break;
				default:
					break;
				}
			}
		}
	}

	/* 有两个地方用到了 */
	private ScriptEngine getScriptEngine() throws ScriptException, Exception {
		if (null == this.scriptEngine) {
			scriptEngine = ScriptingFactory.newScriptEngine();
		}
		return scriptEngine;
	}

	public static class ExtractObject {

		private Row entry;
		private String bundle;
		private String column;
		private Object value;

		public String getBundle() {
			return bundle;
		}

		public void setBundle(String bundle) {
			this.bundle = bundle;
		}

		public String getColumn() {
			return column;
		}

		public void setColumn(String column) {
			this.column = column;
		}

		public Object getValue() {
			return value;
		}

		public void setValue(Object value) {
			this.value = value;
		}

		public Row getEntry() {
			return entry;
		}

		public void setEntry(Row entry) {
			this.entry = entry;
		}

	}
}
