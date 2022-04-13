package com.x.cms.assemble.control.jaxrs.form;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.project.bean.WrapCopier;
import com.x.base.core.project.bean.WrapCopierFactory;
import com.x.base.core.project.cache.Cache;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.tools.SortTools;
import com.x.cms.assemble.control.Business;
import com.x.cms.assemble.control.factory.FormFactory;
import com.x.cms.core.entity.element.Form;

import net.sf.ehcache.Element;

public class ActionListAll extends BaseAction {

	@SuppressWarnings("unchecked")
	protected ActionResult<List<Wo>> execute( HttpServletRequest request, EffectivePerson effectivePerson ) throws Exception {
		ActionResult<List<Wo>> result = new ActionResult<>();
		List<Wo> wraps = null;

		Cache.CacheKey cacheKey = new Cache.CacheKey( this.getClass() );
		Optional<?> optional = CacheManager.get(cacheCategory, cacheKey );

		if (optional.isPresent()) {
			wraps = (List<Wo>) optional.get();
			result.setData(wraps);
		} else {
			try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
				Business business = new Business(emc);
				FormFactory formFactory = business.getFormFactory();
				List<String> ids = formFactory.listAll();// 获取所有表单模板列表
				List<Form> formList = emc.list( Form.class, ids );// 查询ID IN ids 的所有表单模板信息列表
				wraps = Wo.copier.copy( formList );// 将所有查询出来的有状态的对象转换为可以输出的过滤过属性的对象
				SortTools.desc(wraps, "createTime" );
				CacheManager.put(cacheCategory, cacheKey, wraps );
				result.setData(wraps);
			} catch (Throwable th) {
				th.printStackTrace();
				result.error(th);
			}
		}

		return result;
	}

	public static class Wo extends Form {

		private static final long serialVersionUID = -5076990764713538973L;

		public static List<String> excludes = new ArrayList<String>();

		public static final WrapCopier<Form, Wo> copier = WrapCopierFactory.wo(Form.class, Wo.class, null,JpaObject.FieldsInvisible);

		static {
			excludes.add("data");
			excludes.add("mobileData");
		}

	}
}
