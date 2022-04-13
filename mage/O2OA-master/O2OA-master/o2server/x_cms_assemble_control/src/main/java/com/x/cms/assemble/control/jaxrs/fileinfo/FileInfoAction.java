package com.x.cms.assemble.control.jaxrs.fileinfo;

import com.google.gson.JsonElement;
import com.x.base.core.project.annotation.JaxrsDescribe;
import com.x.base.core.project.annotation.JaxrsMethodDescribe;
import com.x.base.core.project.annotation.JaxrsParameterDescribe;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.http.HttpMediaType;
import com.x.base.core.project.http.WrapOutString;
import com.x.base.core.project.jaxrs.ResponseFactory;
import com.x.base.core.project.jaxrs.StandardJaxrsAction;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("fileinfo")
@JaxrsDescribe("附件信息管理")
public class FileInfoAction extends StandardJaxrsAction{

	private static  Logger logger = LoggerFactory.getLogger( FileInfoAction.class );

	@JaxrsMethodDescribe(value = "获取全部的文件或者附件列表.", action = ActionListAll.class)
	@GET
	@Path( "list/all" )
	@Produces( HttpMediaType.APPLICATION_JSON_UTF_8 )
	@Consumes( MediaType.APPLICATION_JSON )
	public void listAllFileInfo( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request ) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListAll.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListAll().execute( request, effectivePerson );
		} catch (Exception e) {
			result = new ActionResult<>();
			result.error( e );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取指定文档的全部附件信息列表.", action = ActionListByDocId.class)
	@GET
	@Path("list/document/{documentId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listFileInfoByDocumentId( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("信息文档ID") @PathParam("documentId")String documentId ) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListByDocId.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListByDocId().execute( request, effectivePerson, documentId );
		} catch (Exception e) {
			result = new ActionResult<>();
			result.error( e );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据ID获取fileInfo对象.", action = ActionGet.class)
	@GET
	@Path("{id}/document/{documentId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void get( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("附件信息ID") @PathParam("id") String id,
			@JaxrsParameterDescribe("信息文档ID") @PathParam("documentId") String documentId ) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<ActionGet.Wo> result = new ActionResult<>();
		try {
			result = new ActionGet().execute( request, effectivePerson, id, documentId );
		} catch (Exception e) {
			result = new ActionResult<>();
			result.error( e );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据ID删除FileInfo应用信息对象.", action = ActionDelete.class)
	@DELETE
	@Path("{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void delete( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("附件信ID") @PathParam("id") String id) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<ActionDelete.Wo> result = new ActionResult<>();
		try {
			result = new ActionDelete().execute( request, effectivePerson, id );
		} catch (Exception e) {
			result = new ActionResult<>();
			result.error( e );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据ID删除FileInfo应用信息对象.", action = ActionDelete.class)
	@GET
	@Path("{id}/mockdeletetoget")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void deleteMockDeleteToGet( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
						@JaxrsParameterDescribe("附件信ID") @PathParam("id") String id) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<ActionDelete.Wo> result = new ActionResult<>();
		try {
			result = new ActionDelete().execute( request, effectivePerson, id );
		} catch (Exception e) {
			result = new ActionResult<>();
			result.error( e );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "将图片附件转为base64编码.", action = ActionImageToBase64.class)
	@GET
	@Path("{id}/binary/base64/{size}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void imageToBase64( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("附件信息ID") @PathParam("id") String id,
			@JaxrsParameterDescribe("最大宽高") @PathParam("size") String size ) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<WrapOutString> result = new ActionResult<>();
		try {
			result = new ActionImageToBase64().execute( request, effectivePerson, id, size );
		} catch (Exception e) {
			result = new ActionResult<>();
			result.error( e );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据ID下载指定附件", action = ActionFileDownload.class)
	@GET
	@Path("download/document/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	public void attachmentDownLoad(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("附件标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("下载附件名称") @QueryParam("fileName") String fileName) {
		ActionResult<ActionFileDownload.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileDownload().execute(request, effectivePerson, id, fileName);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据附件ID下载附件,设定是否使用stream输出", action = ActionFileDownloadStream.class)
	@GET
	@Path("download/document/{id}/stream")
	@Consumes(MediaType.APPLICATION_JSON)
	public void attachmentDownloadStream(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("附件标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("下载附件名称") @QueryParam("fileName") String fileName) {
		ActionResult<ActionFileDownloadStream.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileDownloadStream().execute(request, effectivePerson, id, fileName);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "更新附件访问权限.", action = ActionFileEdit.class)
	@PUT
	@Path("edit/{id}/doc/{docId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void editPermission(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("附件ID") @PathParam("id") String id,
			@JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId, JsonElement jsonElement) {
		ActionResult<ActionFileEdit.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileEdit().execute( request, effectivePerson, id, docId, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "更新附件访问权限.", action = ActionFileEdit.class)
	@POST
	@Path("edit/{id}/doc/{docId}/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void editPermissionMockPutToPost(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
							   @JaxrsParameterDescribe("附件ID") @PathParam("id") String id,
							   @JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId, JsonElement jsonElement) {
		ActionResult<ActionFileEdit.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileEdit().execute( request, effectivePerson, id, docId, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "为文档信息上传附件.", action = ActionFileUpload.class)
	@POST
	@Path("upload/document/{docId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public void attachmentUpload(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId,
			@JaxrsParameterDescribe("位置") @FormDataParam("site") String site,
			@JaxrsParameterDescribe("附件名称") @FormDataParam(FILENAME_FIELD) String fileName,
			@FormDataParam(FILE_FIELD) final byte[] bytes,
			@JaxrsParameterDescribe("附件") @FormDataParam(FILE_FIELD) final FormDataContentDisposition disposition) {
		ActionResult<ActionFileUpload.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileUpload().execute(request, effectivePerson, docId, site, fileName, bytes, disposition);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "为文档信息替换附件.", action = ActionFileUpdate.class)
	@POST
	@Path("update/document/{docId}/attachment/{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public void attachmentUpdate(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId,
			@JaxrsParameterDescribe("附件ID") @PathParam("id") String id,
			@JaxrsParameterDescribe("位置") @FormDataParam("site") String site,
			@JaxrsParameterDescribe("附件名称") @FormDataParam(FILENAME_FIELD) String fileName,
			@FormDataParam(FILE_FIELD) final byte[] bytes,
			@JaxrsParameterDescribe("附件") @FormDataParam(FILE_FIELD) final FormDataContentDisposition disposition) {
		ActionResult<ActionFileUpdate.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileUpdate().execute(request, effectivePerson, docId, id, site, fileName, bytes, disposition);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}
	@JaxrsMethodDescribe(value = "为文档信息上传附件(带回调).", action = ActionFileUploadCallback.class)
	@POST
	@Path("upload/document/{docId}/callback/{callback}")
	@Produces(HttpMediaType.TEXT_HTML_UTF_8)
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public void attachmentUploadCallback(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId,
			@JaxrsParameterDescribe("回调函数名") @PathParam("callback") String callback,
			@JaxrsParameterDescribe("位置") @FormDataParam("site") String site,
			@JaxrsParameterDescribe("附件名称") @FormDataParam(FILENAME_FIELD) String fileName,
			@FormDataParam(FILE_FIELD) final byte[] bytes,
			@JaxrsParameterDescribe("附件") @FormDataParam(FILE_FIELD) final FormDataContentDisposition disposition) {
		ActionResult<ActionFileUploadCallback.Wo<ActionFileUploadCallback.WoObject>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileUploadCallback().execute(request, effectivePerson, docId, callback, site, fileName, bytes, disposition);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "为文档信息上传附件(带回调).", action = ActionFileUpdateCallback.class)
	@POST
	@Path("update/document/{docId}/attachment/{id}/callback/{callback}")
	@Produces(HttpMediaType.TEXT_HTML_UTF_8)
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public void attachmentUpdateCallback(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId,
			@JaxrsParameterDescribe("附件ID") @PathParam("id") String id,
			@JaxrsParameterDescribe("回调函数名") @PathParam("callback") String callback,
			@JaxrsParameterDescribe("位置") @FormDataParam("site") String site,
			@JaxrsParameterDescribe("附件名称") @FormDataParam(FILENAME_FIELD) String fileName,
			@FormDataParam(FILE_FIELD) final byte[] bytes,
			@JaxrsParameterDescribe("附件") @FormDataParam(FILE_FIELD) final FormDataContentDisposition disposition) {
		ActionResult<ActionFileUpdateCallback.Wo<ActionFileUpdateCallback.WoObject>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileUpdateCallback().execute(request, effectivePerson, docId, id, callback, site, fileName, bytes, disposition);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "文档上传附件", action = ActionFileUploadWithUrl.class)
	@POST
	@Path("upload/with/url")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void uploadWithUrl(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
							  JsonElement jsonElement) {
		ActionResult<ActionFileUploadWithUrl.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFileUploadWithUrl().execute(effectivePerson, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "设置文档附件排序号.", action = ActionChangeOrderNumber.class)
	@GET
	@Path("{id}/doc/{docId}/change/seqnumber/{seqNumber}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void changeSeqNumber(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
								  @JaxrsParameterDescribe("附件标识") @PathParam("id") String id,
								  @JaxrsParameterDescribe("文档标识") @PathParam("docId") String docId,
								  @JaxrsParameterDescribe("排序号") @PathParam("seqNumber") Integer seqNumber) {
		ActionResult<ActionChangeOrderNumber.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionChangeOrderNumber().execute(effectivePerson, id, docId, seqNumber);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "pdf格式预览文件,支持doc、docx，需要连接O2云.", action = ActionPreviewPdf.class)
	@GET
	@Path("{id}/preview/pdf")
	@Consumes(MediaType.APPLICATION_JSON)
	public void previewPdf(@Suspended final AsyncResponse asyncResponse,
						   @Context HttpServletRequest request,
						   @JaxrsParameterDescribe("附件标识") @PathParam("id") String id,
						   @JaxrsParameterDescribe("下载pdf名称，可以为空") @QueryParam("fileName") String fileName) {
		ActionResult<ActionPreviewPdf.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionPreviewPdf().execute(effectivePerson, id, fileName);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据条件查询附件.", action = ActionListFilter.class)
	@POST
	@Path("list/filter")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listFilter(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
						    JsonElement jsonElement) {
		ActionResult<List<ActionListFilter.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListFilter().execute(effectivePerson, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

}
