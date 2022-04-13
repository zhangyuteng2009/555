package com.x.cms.assemble.control.factory;

import com.x.base.core.project.exception.ExceptionWhen;
import com.x.base.core.project.tools.ListTools;
import com.x.cms.assemble.control.AbstractFactory;
import com.x.cms.assemble.control.Business;
import com.x.cms.core.entity.element.Form;
import com.x.cms.core.entity.element.Form_;
import com.x.cms.core.express.tools.CriteriaBuilderTools;
import org.apache.commons.lang3.StringUtils;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;


/**
 * 分类表单模板信息管理表基础功能服务类
 *
 * @author O2LEE
 */
public class FormFactory extends ElementFactory {

	public FormFactory( Business business ) throws Exception {
		super(business);
	}

	public Form pick(String flag) throws Exception {
		return this.pick(flag, ExceptionWhen.none);
	}

	@Deprecated
	public Form pick(String flag, ExceptionWhen exceptionWhen) throws Exception {
		return this.pick(flag, Form.class);
	}

	/**
	 * @param id
	 * @return Form
	 * @throws Exception
	 */
	//@MethodDescribe("获取指定Id的Form文件附件信息对象")
	public Form get( String id ) throws Exception {
		return this.entityManagerContainer().find( id, Form.class, ExceptionWhen.none );
	}

	/**
	 * @return List：String
	 * @throws Exception
	 */
	//@MethodDescribe("列示全部的Form文件附件信息ID列表")
	public List<String> listAll() throws Exception {
		EntityManager em = this.entityManagerContainer().get( Form.class );
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<Form> root = cq.from( Form.class );
		cq.select(root.get(Form_.id));
		return em.createQuery(cq).getResultList();
	}

	/**
	 *
	 * @param ids 需要查询的ID列表
	 * @return List：Form
	 * @throws Exception
	 */
	//@MethodDescribe("列示指定Id的Form文件附件信息ID列表")
//	public List<Form> list(List<String> ids) throws Exception {
//		if(ListTools.isEmpty( ids )) {
//			return null;
//		}
//		EntityManager em = this.entityManagerContainer().get( Form.class );
//		CriteriaBuilder cb = em.getCriteriaBuilder();
//		CriteriaQuery<Form> cq = cb.createQuery( Form.class );
//		Root<Form> root = cq.from( Form.class );
//		Predicate p = root.get(Form_.id).in(ids);
//		return em.createQuery(cq.where(p)).getResultList();
//	}

	/**
	 * 列示指定应用的所有表单模板信息ID列表
	 * @param appId 指定的文档ID
	 * @return
	 * @throws Exception
	 */
	//@MethodDescribe("列示指定分类的所有表单模板信息ID列表")
	public List<String> listByAppId( String appId ) throws Exception {
		if( StringUtils.isEmpty(appId) ){
			throw new Exception("内容管理listByAppId方法不接受appId为空的查询操作！");
		}
		EntityManager em = this.entityManagerContainer().get( Form.class );
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<Form> root = cq.from( Form.class );
		cq.select(root.get(Form_.id));
		Predicate p = cb.equal(root.get( Form_.appId ), appId);
		return em.createQuery(cq.where(p)).getResultList();
	}

	public List<String> listByAppIds(List<String> appIds) throws Exception {
		EntityManager em = this.entityManagerContainer().get(Form.class);
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<String> cq = cb.createQuery(String.class);
		Root<Form> root = cq.from(Form.class);
		Predicate p = cb.conjunction();
		if(ListTools.isNotEmpty(appIds)) {
			p = cb.isMember(root.get(Form_.appId), cb.literal(appIds));
		}
		cq.select(root.get(Form_.id)).where(p);
		return em.createQuery(cq).getResultList();
	}

	public List<Form> listFormByAppId( String appId ) throws Exception {
		if( StringUtils.isEmpty(appId) ){
			throw new Exception("内容管理listByAppId方法不接受appId为空的查询操作！");
		}
		EntityManager em = this.entityManagerContainer().get( Form.class );
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Form> cq = cb.createQuery(Form.class);
		Root<Form> root = cq.from( Form.class );
		Predicate p = cb.equal(root.get( Form_.appId ), appId);
		return em.createQuery(cq.where(p)).getResultList();
	}

	/**
	 * 根据栏目ID以及表单的标识 获取一个表单对象
	 * @param appId 栏目ID
	 * @param formFlag 表单标识
	 * @return
	 * @throws Exception
	 */
	public Form getWithAppInfo(String appId, String formFlag) throws Exception {
		if( StringUtils.isEmpty(appId) ){
			throw new Exception("appId can not empty！");
		}
		if( StringUtils.isEmpty(formFlag) ){
			throw new Exception("formFlag can not empty！");
		}
		EntityManager em = this.entityManagerContainer().get( Form.class );
		CriteriaBuilder cb = em.getCriteriaBuilder();
		CriteriaQuery<Form> cq = cb.createQuery(Form.class);
		Root<Form> root = cq.from( Form.class );
		Predicate appPre = cb.equal( root.get( Form_.appId ), appId );
		Predicate p = CriteriaBuilderTools.predicate_or( cb, cb.equal( root.get( Form_.id ), formFlag ), cb.equal( root.get( Form_.name ), formFlag ) );
//		p = CriteriaBuilderTools.predicate_or( cb, cb.equal( root.get( Form_.alias ), formFlag ), p );
		p = CriteriaBuilderTools.predicate_and( cb, appPre, p );
		List<Form> list = em.createQuery(cq.where(p)).getResultList();
		return ListTools.isEmpty( list ) ? null : list.get( 0 );
	}
}
