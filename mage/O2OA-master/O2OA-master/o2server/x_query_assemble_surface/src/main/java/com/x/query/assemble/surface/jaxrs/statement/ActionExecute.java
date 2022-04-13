package com.x.query.assemble.surface.jaxrs.statement;

import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.Parameter;
import javax.persistence.Query;
import javax.script.Bindings;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptException;

import org.apache.commons.lang3.StringUtils;

import com.google.gson.JsonElement;
import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.dynamic.DynamicBaseEntity;
import com.x.base.core.entity.dynamic.DynamicEntity;
import com.x.base.core.project.cache.Cache.CacheKey;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.exception.ExceptionAccessDenied;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.script.AbstractResources;
import com.x.base.core.project.scripting.JsonScriptingExecutor;
import com.x.base.core.project.scripting.ScriptingFactory;
import com.x.base.core.project.webservices.WebservicesClient;
import com.x.organization.core.express.Organization;
import com.x.query.assemble.surface.Business;
import com.x.query.assemble.surface.ThisApplication;
import com.x.query.core.entity.schema.Statement;
import com.x.query.core.entity.schema.Table;
import com.x.query.core.express.statement.Runtime;

class ActionExecute extends BaseAction {

	private static final String[] pageKeys = { "GROUP BY", " COUNT(" };

	ActionResult<Object> execute(EffectivePerson effectivePerson, String flag, Integer page, Integer size,
			JsonElement jsonElement) throws Exception {

		ActionResult<Object> result = new ActionResult<>();
		Statement statement = this.getStatement(flag);
		if (null == statement) {
			throw new ExceptionEntityNotExist(flag, Statement.class);
		}

		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			if (!business.executable(effectivePerson, statement)) {
				throw new ExceptionAccessDenied(effectivePerson, statement);
			}
		}

		Runtime runtime = this.runtime(effectivePerson, jsonElement, page, size);

		Object data = null;

		if (StringUtils.equals(statement.getFormat(), Statement.FORMAT_SCRIPT)) {
			data = this.script(effectivePerson, statement, runtime);
		} else {
			data = this.jpql(statement, runtime);
		}
		result.setData(data);
		return result;
	}

	private Statement getStatement(String flag) throws Exception {
		Statement statement = null;
		CacheKey cacheKey = new CacheKey(this.getClass(), flag);
		Optional<?> optional = CacheManager.get(cache, cacheKey);
		if (optional.isPresent()) {
			statement = (Statement) optional.get();
		} else {
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				statement = emc.flag(flag, Statement.class);
				if (null != statement) {
					emc.get(Statement.class).detach(statement);
					CacheManager.put(cache, cacheKey, statement);
				}
			}
		}
		return statement;
	}

	private CompiledScript getCompiledScriptOfScriptText(Statement statement) throws ScriptException {
		CompiledScript compiledScript = null;
		CacheKey cacheKey = new CacheKey(this.getClass(), statement.getId(), Statement.scriptText_FIELDNAME);
		Optional<?> optional = CacheManager.get(cache, cacheKey);
		if (optional.isPresent()) {
			compiledScript = (CompiledScript) optional.get();
		} else {
			compiledScript = ScriptingFactory.functionalizationCompile(statement.getScriptText());
			CacheManager.put(cache, cacheKey, compiledScript);
		}
		return compiledScript;
	}

	private Object script(EffectivePerson effectivePerson, Statement statement, Runtime runtime) throws Exception {
		Object data = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			ScriptContext scriptContext = this.scriptContext(effectivePerson, runtime);
			CompiledScript compiledScript = this.getCompiledScriptOfScriptText(statement);
			String text = JsonScriptingExecutor.evalString(compiledScript, scriptContext);
			Class<? extends JpaObject> cls = this.clazz(business, statement);
			EntityManager em;
			if (StringUtils.equalsIgnoreCase(statement.getEntityCategory(), Statement.ENTITYCATEGORY_DYNAMIC)
					&& StringUtils.equalsIgnoreCase(statement.getType(), Statement.TYPE_SELECT)) {
				em = business.entityManagerContainer().get(DynamicBaseEntity.class);
			} else {
				em = business.entityManagerContainer().get(cls);
			}
			Query query = em.createQuery(text);
			for (Parameter<?> p : query.getParameters()) {
				if (runtime.hasParameter(p.getName())) {
					query.setParameter(p.getName(), runtime.getParameter(p.getName()));
				}
			}
			if (StringUtils.equalsIgnoreCase(statement.getType(), Statement.TYPE_SELECT)) {
				if (isPageSql(text)) {
					query.setFirstResult((runtime.page - 1) * runtime.size);
					query.setMaxResults(runtime.size);
				}
				data = query.getResultList();
			} else {
				business.entityManagerContainer().beginTransaction(cls);
				data = query.executeUpdate();
				business.entityManagerContainer().commit();
			}
		}
		return data;
	}

	private Object jpql(Statement statement, Runtime runtime) throws Exception {
		Object data = null;
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Business business = new Business(emc);
			Class<? extends JpaObject> cls = this.clazz(business, statement);
			EntityManager em;
			if (StringUtils.equalsIgnoreCase(statement.getEntityCategory(), Statement.ENTITYCATEGORY_DYNAMIC)
					&& StringUtils.equalsIgnoreCase(statement.getType(), Statement.TYPE_SELECT)) {
				em = business.entityManagerContainer().get(DynamicBaseEntity.class);
			} else {
				em = business.entityManagerContainer().get(cls);
			}

			Query query = em.createQuery(statement.getData());
			for (Parameter<?> p : query.getParameters()) {
				if (runtime.hasParameter(p.getName())) {
					query.setParameter(p.getName(), runtime.getParameter(p.getName()));
				}
			}
			if (StringUtils.equalsIgnoreCase(statement.getType(), Statement.TYPE_SELECT)) {
				if (isPageSql(statement.getData())) {
					query.setFirstResult((runtime.page - 1) * runtime.size);
					query.setMaxResults(runtime.size);
				}
				data = query.getResultList();
			} else {
				business.entityManagerContainer().beginTransaction(cls);
				data = query.executeUpdate();
				business.entityManagerContainer().commit();
			}
		}
		return data;
	}

	private boolean isPageSql(String sql) {
		sql = sql.toUpperCase().replaceAll("\\s{1,}", " ");
		for (String key : pageKeys) {
			if (sql.indexOf(key) > -1) {
				return false;
			}
		}
		return true;
	}

	@SuppressWarnings("unchecked")
	private Class<? extends JpaObject> clazz(Business business, Statement statement) throws Exception {
		Class<? extends JpaObject> cls = null;
		if (StringUtils.equals(Statement.ENTITYCATEGORY_OFFICIAL, statement.getEntityCategory())
				|| StringUtils.equals(Statement.ENTITYCATEGORY_CUSTOM, statement.getEntityCategory())) {
			cls = (Class<? extends JpaObject>) Class.forName(statement.getEntityClassName());
		} else {
			Table table = business.entityManagerContainer().flag(statement.getTable(), Table.class);
			if (null == table) {
				throw new ExceptionEntityNotExist(statement.getTable(), Table.class);
			}
			DynamicEntity dynamicEntity = new DynamicEntity(table.getName());
			cls = (Class<? extends JpaObject>) Class.forName(dynamicEntity.className());
		}
		return cls;
	}

	private ScriptContext scriptContext(EffectivePerson effectivePerson, Runtime runtime) throws Exception {
		ScriptContext scriptContext = ScriptingFactory.scriptContextEvalInitialServiceScript();
		Resources resources = new Resources();
		resources.setContext(ThisApplication.context());
		resources.setApplications(ThisApplication.context().applications());
		resources.setWebservicesClient(new WebservicesClient());
		resources.setOrganization(new Organization(ThisApplication.context()));
		Bindings bindings = scriptContext.getBindings(ScriptContext.ENGINE_SCOPE);
		bindings.put(ScriptingFactory.BINDING_NAME_SERVICE_RESOURCES, resources);
		bindings.put(ScriptingFactory.BINDING_NAME_SERVICE_EFFECTIVEPERSON, effectivePerson);
		bindings.put(ScriptingFactory.BINDING_NAME_SERVICE_PARAMETERS, gson.toJson(runtime.getParameters()));
		return scriptContext;
	}

	public static class Resources extends AbstractResources {

		private Organization organization;

		public Organization getOrganization() {
			return organization;
		}

		public void setOrganization(Organization organization) {
			this.organization = organization;
		}

	}

}
