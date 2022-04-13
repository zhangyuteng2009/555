package com.x.cms.assemble.control.jaxrs.form;

import com.google.gson.JsonElement;
import com.x.base.core.project.annotation.JaxrsDescribe;
import com.x.base.core.project.annotation.JaxrsMethodDescribe;
import com.x.base.core.project.annotation.JaxrsParameterDescribe;
import com.x.base.core.project.http.*;
import com.x.base.core.project.jaxrs.ResponseFactory;
import com.x.base.core.project.jaxrs.StandardJaxrsAction;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("form")
@JaxrsDescribe("表单信息管理")
public class FormAction extends StandardJaxrsAction {

	private static  Logger logger = LoggerFactory.getLogger( FormAction.class );

	@JaxrsMethodDescribe(value = "获取全部的表单模板列表.", action = ActionListAll.class)
	@GET
	@Path("list/all")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listAllForm( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListAll.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListAll().execute( request, effectivePerson );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在查询所有CMS表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取指定栏目的全部表单模板信息列表.", action = ActionListByApp.class)
	@GET
	@Path("list/app/{appId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listFormByAppId( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("栏目ID") @PathParam("appId") String appId ) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListByApp.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListByApp().execute( request, effectivePerson, appId );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在根据栏目ID查询表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据ID获取表单对象.", action = ActionGet.class)
	@GET
	@Path("{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void get( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("表单ID") @PathParam("id") String id) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<ActionGet.Wo> result = new ActionResult<>();
		try {
			result = new ActionGet().execute( request, effectivePerson, id );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在根据ID查询表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据表单标识和栏目标识获取表单.", action = ActionGetWithAppInfo.class)
	@GET
	@Path("{formFlag}/appinfo/{appFlag}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void getWithAppInfo( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("栏目标识：ID、表单名称") @PathParam("formFlag") String formFlag,
			@JaxrsParameterDescribe("表单标识：ID、栏目名称、栏目别名") @PathParam("appFlag") String appFlag) {
		ActionResult<ActionGetWithAppInfo.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionGetWithAppInfo().execute(request, effectivePerson, appFlag, formFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "保存表单信息对象.", action = ActionSave.class)
	@POST
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void post( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request, JsonElement jsonElement) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<ActionSave.Wo> result = new ActionResult<>();
		Boolean check = true;

		if( check ){
			try {
				result = new ActionSave().execute( request, effectivePerson, null, jsonElement );
			} catch (Exception e) {
				result = new ActionResult<>();
				result.error( e );
				logger.error( e, effectivePerson, request, null);
			}
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "更新表单信息对象.", action = ActionSave.class)
	@PUT
	@Path("{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void put( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("表单ID") @PathParam("id") String id, JsonElement jsonElement) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<ActionSave.Wo> result = new ActionResult<>();
		Boolean check = true;

		if( check ){
			try {
				result = new ActionSave().execute( request, effectivePerson, id, jsonElement );
			} catch (Exception e) {
				result = new ActionResult<>();
				result.error( e );
				logger.error( e, effectivePerson, request, null);
			}
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "更新表单信息对象.", action = ActionSave.class)
	@POST
	@Path("{id}/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void putMockPutToPost( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
					 @JaxrsParameterDescribe("表单ID") @PathParam("id") String id, JsonElement jsonElement) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<ActionSave.Wo> result = new ActionResult<>();
		Boolean check = true;

		if( check ){
			try {
				result = new ActionSave().execute( request, effectivePerson, id, jsonElement );
			} catch (Exception e) {
				result = new ActionResult<>();
				result.error( e );
				logger.error( e, effectivePerson, request, null);
			}
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据ID删除表单信息对象.", action = ActionDelete.class)
	@DELETE
	@Path("{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void delete( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("表单ID") @PathParam("id") String id) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<WrapOutId> result = new ActionResult<>();
		try {
			result = new ActionDelete().execute( request, effectivePerson, id );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在根据ID删除表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据ID删除表单信息对象.", action = ActionDelete.class)
	@GET
	@Path("{id}/mockdeletetoget")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void deleteMockDeleteToGet( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
						@JaxrsParameterDescribe("表单ID") @PathParam("id") String id) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<WrapOutId> result = new ActionResult<>();
		try {
			result = new ActionDelete().execute( request, effectivePerson, id );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在根据ID删除表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示满足过滤条件的表单信息,下一页.", action = ActionListNextWithFilter.class)
	@PUT
	@Path("filter/list/{id}/next/{count}/app/{appId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listNextWithFilter( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("最后一条信息ID，如果是第一页，则可以用(0)代替") @PathParam("id") String id,
			@JaxrsParameterDescribe("每页显示的条目数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("栏目ID") @PathParam("appId") String appId,
			JsonElement jsonElement) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListNextWithFilter.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListNextWithFilter().execute( request, effectivePerson, id, count, appId, jsonElement );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在查询所有CMS表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示满足过滤条件的表单信息,下一页.", action = ActionListNextWithFilter.class)
	@POST
	@Path("filter/list/{id}/next/{count}/app/{appId}/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listNextWithFilterMockPutToPost( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
									@JaxrsParameterDescribe("最后一条信息ID，如果是第一页，则可以用(0)代替") @PathParam("id") String id,
									@JaxrsParameterDescribe("每页显示的条目数量") @PathParam("count") Integer count,
									@JaxrsParameterDescribe("栏目ID") @PathParam("appId") String appId,
									JsonElement jsonElement) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListNextWithFilter.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListNextWithFilter().execute( request, effectivePerson, id, count, appId, jsonElement );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在查询所有CMS表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示满足过滤条件的表单信息,上一页.", action = ActionListPrevWithFilter.class)
	@PUT
	@Path("filter/list/{id}/prev/{count}/app/{appId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listPrevWithFilter( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("最后一条信息ID，如果是第一页，则可以用(0)代替") @PathParam("id") String id,
			@JaxrsParameterDescribe("每页显示的条目数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("栏目ID") @PathParam("appId") String appId,
			JsonElement jsonElement) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListPrevWithFilter.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListPrevWithFilter().execute( request, effectivePerson, id, count, appId, jsonElement );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在查询所有CMS表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示满足过滤条件的表单信息,上一页.", action = ActionListPrevWithFilter.class)
	@POST
	@Path("filter/list/{id}/prev/{count}/app/{appId}/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listPrevWithFilterMockPutToPost( @Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
									@JaxrsParameterDescribe("最后一条信息ID，如果是第一页，则可以用(0)代替") @PathParam("id") String id,
									@JaxrsParameterDescribe("每页显示的条目数量") @PathParam("count") Integer count,
									@JaxrsParameterDescribe("栏目ID") @PathParam("appId") String appId,
									JsonElement jsonElement) {
		EffectivePerson effectivePerson = this.effectivePerson( request );
		ActionResult<List<ActionListPrevWithFilter.Wo>> result = new ActionResult<>();
		try {
			result = new ActionListPrevWithFilter().execute( request, effectivePerson, id, count, appId, jsonElement );
		} catch (Exception e) {
			result = new ActionResult<>();
			Exception exception = new ExceptionServiceLogic( e, "系统在查询所有CMS表单时发生异常。" );
			result.error( exception );
			logger.error( e, effectivePerson, request, null);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据指定的栏目获取栏目下所有表单包含的字段字段信息.", action = ActionListFormFieldWithAppInfo.class)
	@GET
	@Path("list/formfield/appInfo/{appId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listFormFiledWithApplication(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("栏目Id") @PathParam("appId") String applicationId) {
		ActionResult<WrapOutMap> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListFormFieldWithAppInfo().execute(applicationId);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据指定的Form获取所有包含的字段信息.", action = ActionListFormFieldWithForm.class)
	@GET
	@Path("list/{id}/formfield")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listFormFiledWithForm(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("标识") @PathParam("id") String id) {
		ActionResult<WrapOutMap> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListFormFieldWithForm().execute(id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "查询表单,如果有表单那么返回表单id,如果表单不存在那么返回分类的默认Form.", action = V2LookupDoc.class)
	@GET
	@Path("v2/lookup/document/{docId}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2LookupDoc(@Suspended final AsyncResponse asyncResponse,
											@Context HttpServletRequest request,
											@JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId) {
		ActionResult<V2LookupDoc.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2LookupDoc().execute(effectivePerson, docId);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "查询表单,如果有表单那么返回表单id,如果表单不存在返回分类的默认FormMobile.", action = V2LookupDocMobile.class)
	@GET
	@Path("v2/lookup/document/{docId}/mobile")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2LookupDocMobile(@Suspended final AsyncResponse asyncResponse,
												  @Context HttpServletRequest request,
												  @JaxrsParameterDescribe("文档ID") @PathParam("docId") String docId) {
		ActionResult<V2LookupDocMobile.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2LookupDocMobile().execute(effectivePerson, docId);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取表单.", action = V2Get.class)
	@GET
	@Path("v2/{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2Get(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
					  @JaxrsParameterDescribe("标识") @PathParam("id") String id,
					  @JaxrsParameterDescribe("缓存标志") @QueryParam("t") String t) {
		ActionResult<V2Get.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2Get().execute(effectivePerson, id, t);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取表单Mobile.", action = V2GetMobile.class)
	@GET
	@Path("v2/{id}/mobile")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2GetMobile(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
							@JaxrsParameterDescribe("标识") @PathParam("id") String id,
							@JaxrsParameterDescribe("缓存标志") @QueryParam("t") String t) {
		ActionResult<V2GetMobile.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2GetMobile().execute(effectivePerson, id, t);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}
}
