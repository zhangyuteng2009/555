package com.x.cms.assemble.control.service;

import java.util.List;

import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;

/**
 * 文档点赞信息查询管理的服务类
 * 
 * @author O2LEE
 */
public class CommentCommendQueryService {
	
	private CommentCommendService commnetCommendService = new CommentCommendService();
	
	public List<String> listIdsByDocumentCommentAndPerson( String commentId, String personName, Integer maxCount ) throws Exception {
		if( StringUtils.isEmpty( commentId ) ){
			return null;
		}
		if( StringUtils.isEmpty( personName ) ){
			return null;
		}
		try ( EntityManagerContainer emc = EntityManagerContainerFactory.instance().create() ) {
			return commnetCommendService.listIdsByDocumentCommentAndPerson(emc, commentId, personName, maxCount);
		} catch ( Exception e ) {
			throw e;
		}
	}
	
	public List<String> listByComment( String commentId, Integer maxCount ) throws Exception {
		if( StringUtils.isEmpty( commentId ) ){
			return null;
		}
		try ( EntityManagerContainer emc = EntityManagerContainerFactory.instance().create() ) {
			return commnetCommendService.listByComment(emc, commentId, maxCount);
		} catch ( Exception e ) {
			throw e;
		}
	}
	
	public List<String> listWithPerson( String personName, Integer maxCount ) throws Exception {
		if( StringUtils.isEmpty( personName ) ){
			return null;
		}
		try ( EntityManagerContainer emc = EntityManagerContainerFactory.instance().create() ) {
			return commnetCommendService.listWithPerson(emc, personName, maxCount);
		} catch ( Exception e ) {
			throw e;
		}
	}
}
