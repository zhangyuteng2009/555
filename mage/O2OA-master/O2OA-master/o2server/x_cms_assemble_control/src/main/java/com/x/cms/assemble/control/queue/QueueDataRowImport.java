package com.x.cms.assemble.control.queue;

import java.util.List;

import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.queue.AbstractQueue;
import com.x.base.core.project.tools.ListTools;
import com.x.cms.assemble.control.DocumentDataHelper;
import com.x.cms.assemble.control.jaxrs.document.ActionPersistImportDataExcel.WiParam;
import com.x.cms.assemble.control.service.CmsBatchOperationPersistService;
import com.x.cms.assemble.control.service.CmsBatchOperationProcessService;
import com.x.cms.common.excel.reader.ExcelReadRuntime;
import com.x.cms.common.excel.reader.ExcelReadRuntime.DocTemplate;
import com.x.cms.core.entity.Document;
import com.x.cms.core.entity.content.Data;

public class QueueDataRowImport extends AbstractQueue<ImportDataRow> {

	private static Logger logger = LoggerFactory.getLogger( QueueDataRowImport.class );

	public void execute( ImportDataRow dataRow ) throws Exception {
		int curRow = dataRow.getCurRow();
		List<String> colmlist = dataRow.getColmlist(); 
		ExcelReadRuntime excelReadRuntime = dataRow.getExcelReadRuntime();
		String batchName = excelReadRuntime.importBatchName;
		DataImportStatus dataImportStatus = dataRow.getExcelReadRuntime().dataImportStatus;
		int titleColIndex = excelReadRuntime.wi.getTitleColIndex();
		String titleFlag = excelReadRuntime.wi.getTitle();
		
		//生成一个Document和Data
//		System.out.println(">>>>>>>>>>>>>>>>>>>QueueDataRowImport.execute正在处理第" + curRow + "行数据：" + printData( colmlist ) );
		if( ListTools.isNotEmpty( colmlist ) ){
			Data data = null;

			List<String> propertyNames = excelReadRuntime.propertyNames;
			if( ListTools.isNotEmpty( propertyNames )) {
				String docId = null;
				try ( EntityManagerContainer emc = EntityManagerContainerFactory.instance().create() ) {
					Document document = composeDocumentFormTemplate( excelReadRuntime.template );
					if( StringUtils.isEmpty( document.getId()  )) {
						document.setId( Document.createId() );
					}
					document.setImportBatchName( batchName );
					document.setDocStatus("checking"); //待校验
					document.setSummary( null );
					document.addToReadPersonList( "所有人" );
					document.addToAuthorPersonList( excelReadRuntime.operatorName );

					if( StringUtils.isNotEmpty( colmlist.get( titleColIndex )+"" )) {
						if( StringUtils.isNotEmpty( titleFlag )) {
							document.setTitle( titleFlag + colmlist.get( titleColIndex )+""  );
						}else {
							document.setTitle( colmlist.get( titleColIndex )+""  );
						}
					}else {
						if( StringUtils.isNotEmpty( titleFlag )) {
							document.setTitle( titleFlag + "无标题"  );
						}else {
							document.setTitle( "无标题"  );
						}
					}
					emc.beginTransaction( Document.class );
					document.setDocStatus( excelReadRuntime.template.getDocStatus() ); //已发布
					emc.persist( document, CheckPersistType.all );
							
					DocumentDataHelper documentDataHelper = new DocumentDataHelper( emc, document );
					data = documentDataHelper.get();
							
					//先保存文档全部都有的数据参数
					if( excelReadRuntime!= null && excelReadRuntime.wi !=null && 
							ListTools.isNotEmpty(excelReadRuntime.wi.getWiParameters() )) {
						for( WiParam wiParam : excelReadRuntime.wi.getWiParameters() ) {
							data.put( wiParam.getDataPath(), wiParam.getValue());
						}
					}
					
					for( int i = 0 ; i< propertyNames.size(); i++  ) {
						if( colmlist.size() > i && colmlist.get(i) != null ) {
							data.put( propertyNames.get(i), colmlist.get(i).trim());
//							//处理标题
//							if( propertyNames.get(i).equalsIgnoreCase(excelReadRuntime.wi.getTitle_column())) {
//								if( StringUtils.isEmpty( document.getTitle() ) ) {
//									document.setTitle( colmlist.get(i).trim() );
//								}else {
//									document.setTitle( document.getTitle() + colmlist.get(i).trim() );
//								}
//							}
						}else {
							data.put( propertyNames.get(i),"");
						}
					}
//							
//					//处理标题
//					if( StringUtils.isEmpty( document.getTitle() )) {
//						document.setTitle( "无标题" );
//					}

					data.setDocument( document );
					documentDataHelper.update( data );
					emc.commit();
					docId = document.getId();
					dataImportStatus.addDocumentId( document.getId() );
					dataImportStatus.increaseSuccessTotal(1);
					logger.print( "第" + curRow + "行数据导入成功，已经成功提交到数据库！导入成功共"+ excelReadRuntime.wo.getSuccess_count() +"条.");
				} catch ( Exception e ) {
					logger.print( "第" + curRow + "行数据导入成功，保存失败！导入失败共"+ excelReadRuntime.wo.getError_count() +"条.");
					dataImportStatus.appendErorrData( colmlist );
					dataImportStatus.increaseErrorTotal(1);
					e.printStackTrace();
				} finally {
                    if(docId!=null) {
                        new CmsBatchOperationProcessService().refreshDocumentReview(docId);
					/*new CmsBatchOperationPersistService().addOperation(
							CmsBatchOperationProcessService.OPT_OBJ_DOCUMENT,
							CmsBatchOperationProcessService.OPT_TYPE_PERMISSION, document.getId(), document.getId(), "导入新文档：ID=" + document.getId());*/
                    }
                }

			}else {
				logger.print("数据导入不成功，propertyNames为空，无法识别数据列对应的属性！");
			}
		}
		
	}
	
	/**
	 * 直接根据模板生成一个新的文档信息对象
	 * @param template
	 * @return
	 */
	private Document composeDocumentFormTemplate( DocTemplate template ) {
		Document document = new Document();
		document.setId( Document.createId() );
		document.setDocumentType( template.getDocumentType() );
		document.setAppId( template.getAppId() );
		document.setAppAlias( template.getAppAlias() );
		document.setAppName( template.getAppName() );
		document.setCategoryId( template.getCategoryId() );
		document.setCategoryName( template.getCategoryName() );
		document.setCategoryAlias(  template.getCategoryAlias() );
		
		document.setCreatorPerson( template.getCreatorPerson() );
		document.setCreatorIdentity( template.getCreatorIdentity() );
		document.setCreatorTopUnitName( template.getCreatorTopUnitName() );
		document.setCreatorUnitName( template.getCreatorUnitName() );
		
		document.setAuthorPersonList( template.getAuthorPersonList() );
		document.setAuthorUnitList( template.getAuthorUnitList() );
		document.setAuthorGroupList( template.getAuthorGroupList() );
		document.setReadPersonList( template.getReadPersonList() );
		document.setReadUnitList( template.getReadUnitList() );
		document.setReadGroupList( template.getReadGroupList() );
		document.setReadFormId( template.getReadFormId() );
		document.setReadFormName( template.getReadFormName() );
		
		document.setDocStatus( template.getDocStatus() );
		document.setPublishTime( template.getPublishTime());
		
		document.setForm( template.getForm() );
		document.setFormName( template.getFormName() );
		
		return document;
	}
	
	private String printData( List<String> colmlist ) {
		StringBuffer sb = new StringBuffer();
		for( String col : colmlist ){
			if( col == null ){
				col = "null";
			}
			if( sb.toString().isEmpty() ){
				sb.append( "["+ col + "]" );
			}else{
				sb.append( ", [" + col + "]" );
			}
		}
		return sb.toString();
	}
}
