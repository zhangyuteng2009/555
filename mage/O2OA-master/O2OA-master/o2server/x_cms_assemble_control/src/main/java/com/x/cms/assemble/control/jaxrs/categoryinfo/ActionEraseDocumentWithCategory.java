package com.x.cms.assemble.control.jaxrs.categoryinfo;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckRemoveType;
import com.x.base.core.project.annotation.AuditLog;
import com.x.base.core.project.cache.CacheManager;
import com.x.base.core.project.config.StorageMapping;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.jaxrs.WoId;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.tools.ListTools;
import com.x.cms.assemble.control.Business;
import com.x.cms.assemble.control.DocumentDataHelper;
import com.x.cms.assemble.control.ThisApplication;
import com.x.cms.core.entity.CategoryInfo;
import com.x.cms.core.entity.Document;
import com.x.cms.core.entity.FileInfo;
import com.x.query.core.entity.Item;
import org.apache.commons.lang3.StringUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public class ActionEraseDocumentWithCategory extends BaseAction {

	private static  Logger logger = LoggerFactory.getLogger(ActionEraseDocumentWithCategory.class);

	@AuditLog(operation = "删除分类下所有文档")
	protected ActionResult<Wo> execute(HttpServletRequest request, String id, EffectivePerson effectivePerson) throws Exception {
		ActionResult<Wo> result = new ActionResult<>();
		CategoryInfo categoryInfo = null;
		Boolean check = true;
		
		if ( StringUtils.isEmpty(id) ) {
			check = false;
			Exception exception = new ExceptionIdEmpty();
			result.error(exception);
		}
		if ( check ) {
			try {
				categoryInfo = categoryInfoServiceAdv.get(id);
			} catch ( Exception e ) {
				check = false;
				Exception exception = new ExceptionCategoryInfoProcess(e, "根据ID查询分类信息对象时发生异常。ID:" + id);
				result.error(exception);
				logger.error(e, effectivePerson, request, null);
			}
		}
		if ( check ) {
			if ( categoryInfo == null ) {
				check = false;
				Exception exception = new ExceptionCategoryInfoNotExists( id );
				result.error(exception);
			}
		}
		if ( check ) {
			//查询分类下的文档数量
			Long count = documentServiceAdv.countByCategoryId(id);
			Document document = null;
			List<String> idsForDelete = null;
			List<String> allFileInfoIds = null;			
			Integer queryMaxCount = 100;
			Integer whileCount = 0;
			Integer currentWhileCount = 0;
			FileInfo fileInfo = null;
			StorageMapping mapping = null;
			DocumentDataHelper documentDataHelper = null;
			
			if ( count > 0 ) {
				logger.info(">>>>一共需要删除"+count+"个文档。");
				result.setCount(count);
				whileCount =  (int) (count/queryMaxCount + 1);
				try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
					Business business = new Business( emc );
					
					//循环清除分类下所有的文档信息
					while( count > 0 && currentWhileCount<=whileCount ) {
						logger.info(">>>>正在根据categoryId查询"+queryMaxCount+"个需要删除的文档ID列表。");
						idsForDelete = documentServiceAdv.listIdsByCategoryId( id, queryMaxCount );
						if( ListTools.isNotEmpty(  idsForDelete )) {
							
							emc.beginTransaction( Document.class );
							emc.beginTransaction( Item.class );
							emc.beginTransaction( FileInfo.class );
							
							for( String docId : idsForDelete ) {
								try {
									document = emc.find( docId, Document.class );
									
									//删除与该文档有关的所有数据Item信息
									documentDataHelper = new DocumentDataHelper( emc, document );
									documentDataHelper.remove();
									
									//删除文档的附件信息
									allFileInfoIds = business.getFileInfoFactory().listAllByDocument( docId );
									if( allFileInfoIds != null && !allFileInfoIds.isEmpty() ){
										for( String fileInfoId : allFileInfoIds ){
											fileInfo = emc.find( fileInfoId, FileInfo.class );
											if( fileInfo != null ){
												if( "ATTACHMENT".equals( fileInfo.getFileType() )){
													mapping = ThisApplication.context().storageMappings().get( FileInfo.class, fileInfo.getStorage() );
													fileInfo.deleteContent( mapping );
												}
											}
											emc.remove( fileInfo, CheckRemoveType.all );
										}
									}
									//删除文档信息
									emc.remove( document, CheckRemoveType.all  );
								}catch( Exception e ) {
									e.printStackTrace();
								}
							}
							emc.commit();
							CacheManager.notify( Document.class );
						}
						count = documentServiceAdv.countByCategoryId( id );
						logger.info(">>>>已经删除"+queryMaxCount+"个文档，还剩下"+count+"个文档需要删除。");
					}
				}
			}
		}
		
		Wo wo = new Wo();
		wo.setId(id);
		result.setData(wo);
		return result;
	}

	public static class Wo extends WoId {

	}
}