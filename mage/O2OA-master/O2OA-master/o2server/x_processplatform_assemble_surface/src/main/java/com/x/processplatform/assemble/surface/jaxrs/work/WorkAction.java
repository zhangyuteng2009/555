package com.x.processplatform.assemble.surface.jaxrs.work;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import com.google.gson.JsonElement;
import com.x.base.core.project.annotation.JaxrsDescribe;
import com.x.base.core.project.annotation.JaxrsMethodDescribe;
import com.x.base.core.project.annotation.JaxrsParameterDescribe;
import com.x.base.core.project.http.ActionResult;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.http.HttpMediaType;
import com.x.base.core.project.jaxrs.ResponseFactory;
import com.x.base.core.project.jaxrs.StandardJaxrsAction;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.processplatform.core.entity.element.ActivityType;

@Path("work")
@JaxrsDescribe("工作操作")
public class WorkAction extends StandardJaxrsAction {

	private static Logger logger = LoggerFactory.getLogger(WorkAction.class);

	@JaxrsMethodDescribe(value = "根据Work或workCompleted取得内容.", action = ActionGetWithWorkOrWorkCompleted.class)
	@GET
	@Path("workorworkcompleted/{workOrWorkCompleted}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void getWithWorkOrWorkCompleted(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作或已完成工作标识") @PathParam("workOrWorkCompleted") String workOrWorkCompleted) {
		ActionResult<ActionGetWithWorkOrWorkCompleted.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionGetWithWorkOrWorkCompleted().execute(effectivePerson, workOrWorkCompleted);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取指定人员的Task,TaskCompleted,Read,ReadCompleted,Review.没有权限限制", action = ActionCountWithPerson.class)
	@GET
	@Path("count/{credential}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void countWithPerson(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("个人标识") @PathParam("credential") String credential) {
		ActionResult<ActionCountWithPerson.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionCountWithPerson().execute(credential);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "取得指定work当前人员所有的task,taskCompleted,read,readCompleted,review", action = ActionRefer.class)
	@GET
	@Path("{id}/refer")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void refer(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("标识") @PathParam("id") String id) {
		ActionResult<ActionRefer.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionRefer().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "尝试流转一个Work.", action = ActionProcessing.class)
	@PUT
	@Path("{id}/processing")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void processing(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionProcessing.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionProcessing().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = ActionProcessing.class)
	@POST
	@Path("{id}/processing/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void processingMockPutToPost(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionProcessing.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionProcessing().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	@POST
	@Path("process/{processFlag}")
	@JaxrsMethodDescribe(value = "创建工作（创建启动版本的流程）.", action = ActionCreate.class)
	public void create(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("流程标识") @PathParam("processFlag") String processFlag, JsonElement jsonElement) {
		ActionResult<List<ActionCreate.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionCreate().execute(effectivePerson, processFlag, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("process/{processFlag}/force")
	@POST
	@JaxrsMethodDescribe(value = "创建工作（强制创建存在的流程）.", action = ActionCreateForce.class)
	public void createForce(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("流程标识") @PathParam("processFlag") String processFlag, JsonElement jsonElement) {
		ActionResult<List<ActionCreateForce.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionCreateForce().execute(effectivePerson, processFlag, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "创建工作（创建启动版本的流程）.", action = ActionCreateWithApplicationProcess.class)
	@POST
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("application/{applicationFlag}/process/{processFlag}")
	public void createWithApplicationProcess(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag,
			@JaxrsParameterDescribe("流程标识") @PathParam("processFlag") String processFlag, JsonElement jsonElement) {
		ActionResult<List<ActionCreateWithApplicationProcess.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionCreateWithApplicationProcess().execute(effectivePerson, applicationFlag, processFlag,
					jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "创建工作（强制创建存在的流程）.", action = ActionCreateWithApplicationProcessForce.class)
	@POST
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("application/{applicationFlag}/process/{processFlag}/force")
	public void createWithApplicationProcessForce(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag,
			@JaxrsParameterDescribe("流程标识") @PathParam("processFlag") String processFlag, JsonElement jsonElement) {
		ActionResult<List<ActionCreateWithApplicationProcessForce.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionCreateWithApplicationProcessForce().execute(effectivePerson, applicationFlag,
					processFlag, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "删除工作，需要应用管理权限或者是工作的创建者。", action = ActionDelete.class)
	@DELETE
	@Path("{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void delete(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionDelete.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionDelete().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "Mock Get To Delete.", action = ActionDelete.class)
	@GET
	@Path("{id}/mockdeletetoget")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void deleteMockDeleteToGet(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionDelete.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionDelete().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "完成工作关闭时候的检查,1.检查是否要删除处于草稿状态的工作,没有保存过任何数据将被认为是草稿.2.检查是否需要释放抢办.", action = ActionCloseCheck.class)
	@GET
	@Path("{id}/close/check")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void closeCheck(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionCloseCheck.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionCloseCheck().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	/**
	 * 	不需要申明,这里使用的是chrome在onunload事件运行有特殊的限制@Consumes(MediaType.APPLICATION_JSON)
	 */
	@JaxrsMethodDescribe(value = "完成工作关闭时候的检查,1.检查是否要删除处于草稿状态的工作,没有保存过任何数据将被认为是草稿.2.检查是否需要释放抢办.为了支持信标方法(Navigator.sendBeacon())单独增加的方法.", action = ActionCloseCheck.class)
	@POST
	@Path("{id}/close/check")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	public void closeCheckPost(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionCloseCheck.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionCloseCheck().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定应用当前用户创建的Work对象,下一页.", action = ActionListNextWithApplication.class)
	@GET
	@Path("list/{id}/next/{count}/application/{applicationFlag}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listNextWithApplication(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<List<ActionListNextWithApplication.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListNextWithApplication().execute(effectivePerson, id, count, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定应用当前用户创建的Work对象,上一页.", action = ActionListPrevWithApplication.class)
	@GET
	@Path("list/{id}/prev/{count}/application/{applicationFlag}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listPrevWithApplication(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<List<ActionListPrevWithApplication.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListPrevWithApplication().execute(effectivePerson, id, count, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定流程当前用户创建的Work对象,下一页.", action = ActionListNextWithProcess.class)
	@GET
	@Path("list/{id}/next/{count}/process/{processFlag}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listNextWithProcess(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("流程标识") @PathParam("processFlag") String processFlag) {
		ActionResult<List<ActionListNextWithProcess.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListNextWithProcess().execute(effectivePerson, id, count, processFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定流程当前用户创建的Work对象,上一页.", action = ActionListPrevWithProcess.class)
	@GET
	@Path("list/{id}/prev/{count}/process/{processFlag}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listPrevWithProcess(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("processFlag") String processFlag) {
		ActionResult<List<ActionListPrevWithProcess.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListPrevWithProcess().execute(effectivePerson, id, count, processFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "统计当前用户创建的Work，按应用分类.", action = ActionListCountWithApplication.class)
	@GET
	@Path("list/count/application")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void countWithApplication(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request) {
		ActionResult<List<ActionListCountWithApplication.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListCountWithApplication().execute(effectivePerson);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "统计当前用户在指定应用下的待办，按流程分类.", action = ActionListCountWithProcess.class)
	@GET
	@Path("list/count/application/{applicationFlag}/process")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listCountWithProcess(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<List<ActionListCountWithProcess.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListCountWithProcess().execute(effectivePerson, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取用于过滤的可选属性值,限定范围为我创建的工作", action = ActionFilterAttribute.class)
	@GET
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("filter/attribute/application/{applicationFlag}")
	public void filterAttribute(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<ActionFilterAttribute.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionFilterAttribute().execute(effectivePerson, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示根据过滤条件的Work,下一页,限定范围为我创建的工作以及应用.", action = ActionListNextWithFilter.class)
	@POST
	@Path("list/{id}/next/{count}/application/{applicationFlag}/filter")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listNextWithFilter(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag,
			JsonElement jsonElement) {
		ActionResult<List<ActionListNextWithFilter.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListNextWithFilter().execute(effectivePerson, id, count, applicationFlag, jsonElement);
		} catch (Exception e) {
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "列示根据过滤条件的Work,上一页,限定范围为我创建的工作以及应用.", action = ActionListPrevWithFilter.class)
	@POST
	@Path("list/{id}/prev/{count}/application/{applicationFlag}/filter")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listPrevWithFilter(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag,
			JsonElement jsonElement) {
		ActionResult<List<ActionListPrevWithFilter.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListPrevWithFilter().execute(effectivePerson, id, count, applicationFlag, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "列示当前用户创建的Work对象,下一页.", action = ActionListNextCreatorWithCurrent.class)
	@GET
	@Path("list/{id}/next/{count}/creator/current")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listNextCreatorWithCurrent(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count) {
		ActionResult<List<ActionListNextCreatorWithCurrent.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListNextCreatorWithCurrent().execute(effectivePerson, id, count);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示当前用户创建的Work对象,上一页.", action = ActionListPrevCreatorWithCurrent.class)
	@GET
	@Path("list/{id}/prev/{count}/creator/current")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listPrevCreatorWithCurrent(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count) {
		ActionResult<List<ActionListPrevCreatorWithCurrent.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListPrevCreatorWithCurrent().execute(effectivePerson, id, count);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示根据过滤条件的我创建的工作,下一页", action = ActionListNextCreatorWithCurrentFilter.class)
	@POST
	@Path("list/{id}/next/{count}/creator/current/filter")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listNextCreatorWithCurrentFilter(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count, JsonElement jsonElement) {
		ActionResult<List<ActionListNextCreatorWithCurrentFilter.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListNextCreatorWithCurrentFilter().execute(effectivePerson, id, count, jsonElement);
		} catch (Exception e) {
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "列示根据过滤条件的我创建的工作,上一页.", action = ActionListPrevCreatorWithCurrentFilter.class)
	@POST
	@Path("list/{id}/prev/{count}/creator/current/filter")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listPrevCreatorWithCurrentFilter(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count, JsonElement jsonElement) {
		ActionResult<List<ActionListPrevCreatorWithCurrentFilter.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListPrevCreatorWithCurrentFilter().execute(effectivePerson, id, count, jsonElement);
		} catch (Exception e) {
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "将工作召回。", action = ActionRetract.class)
	@PUT
	@Path("{id}/retract")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void retract(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionRetract.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionRetract().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = ActionRetract.class)
	@POST
	@Path("{id}/retract/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void retractMockPutToPost(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionRetract.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionRetract().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "将工作调度。", action = ActionReroute.class)
	@PUT
	@Path("{id}/reroute/activity/{activityId}/activitytype/{activityType}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void reroute(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("活动标识") @PathParam("activityId") String activityId,
			@JaxrsParameterDescribe("活动类型") @PathParam("activityType") ActivityType activityType,
			JsonElement jsonElement) {
		ActionResult<ActionReroute.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionReroute().execute(effectivePerson, id, activityId, activityType, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "将工作调度。", action = ActionReroute.class)
	@POST
	@Path("{id}/reroute/activity/{activityId}/activitytype/{activityType}/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void rerouteMockPost2Put(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("活动标识") @PathParam("activityId") String activityId,
			@JaxrsParameterDescribe("活动类型") @PathParam("activityType") ActivityType activityType,
			JsonElement jsonElement) {
		ActionResult<ActionReroute.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionReroute().execute(effectivePerson, id, activityId, activityType, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "增加一个会签分支", action = ActionAddSplit.class)
	@PUT
	@Path("{id}/add/split")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void addSplit(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<List<ActionAddSplit.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionAddSplit().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = ActionAddSplit.class)
	@POST
	@Path("{id}/add/split/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void addSplitMockPutToPost(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<List<ActionAddSplit.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionAddSplit().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "回滚工作到指定的workLog", action = ActionRollback.class)
	@PUT
	@Path("{id}/rollback")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void rollback(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<ActionRollback.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionRollback().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = ActionRollback.class)
	@POST
	@Path("{id}/rollback/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void rollbackMockPutToPost(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<ActionRollback.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionRollback().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "列示当前用户创建的工作,可以根据条件过滤,分页.", action = ActionListMyPaging.class)
	@POST
	@Path("list/my/paging/{page}/size/{size}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listMyPaging(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("分页") @PathParam("page") Integer page,
			@JaxrsParameterDescribe("数量") @PathParam("size") Integer size, JsonElement jsonElement) {
		ActionResult<List<ActionListMyPaging.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListMyPaging().execute(effectivePerson, page, size, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "指定Work运行映射.", action = ActionProjection.class)
	@GET
	@Path("{id}/projection")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void projection(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionProjection.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionProjection().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定应用不带权限区分的所有Work,下一页.", action = ActionManageListNext.class)
	@GET
	@Path("list/{id}/next/{count}/application/{applicationFlag}/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageListNext(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("最后一个Work的ID") @PathParam("id") String id,
			@JaxrsParameterDescribe("返回数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<List<ActionManageListNext.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageListNext().execute(effectivePerson, id, count, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定应用不带权限区分的所有Work,上一页.", action = ActionManageListPrev.class)
	@GET
	@Path("list/{id}/prev/{count}/application/{applicationFlag}/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageListPrev(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("最后一个Work的ID") @PathParam("id") String id,
			@JaxrsParameterDescribe("返回数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<List<ActionManageListPrev.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageListPrev().execute(effectivePerson, id, count, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取工作内容.", action = ActionManageGet.class)
	@GET
	@Path("{id}/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageGet(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionManageGet.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageGet().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定Work下所有的待办已办,待阅已阅和参阅.", action = ActionManageGetAssignment.class)
	@GET
	@Path("{id}/assignment/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageGetAssignment(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<ActionManageGetAssignment.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageGetAssignment().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示指定application下根据porcess分类的work数量.", action = ActionManageListCountWithProcess.class)
	@GET
	@Path("list/count/application/{applicationFlag}/process/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageListCountWithProcess(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<List<ActionManageListCountWithProcess.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageListCountWithProcess().execute(effectivePerson, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示关联的Work对象.", action = ActionManageListRelative.class)
	@GET
	@Path("{id}/relative/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageListRelative(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<List<ActionManageListRelative.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageListRelative().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "删除单个工作.", action = ActionManageDeleteSingleWork.class)
	@DELETE
	@Path("{id}/single/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageDeleteSingleWork(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<List<ActionManageDeleteSingleWork.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageDeleteSingleWork().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "Mock Get To Delete.", action = ActionManageDeleteSingleWork.class)
	@GET
	@Path("{id}/single/manage/mockdeletetoget")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageDeleteSingleWorkMockDeleteToGet(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<List<ActionManageDeleteSingleWork.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageDeleteSingleWork().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "删除所有相关联的工作.", action = ActionManageDeleteRelativeWork.class)
	@DELETE
	@Path("{id}/relative/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageDeleteRelativeWork(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<List<ActionManageDeleteRelativeWork.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageDeleteRelativeWork().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "Mock Get To Delete.", action = ActionManageDeleteRelativeWork.class)
	@GET
	@Path("{id}/relative/manage/mockdeletetoget")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageDeleteRelativeWorkMockDeleteToGet(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id) {
		ActionResult<List<ActionManageDeleteRelativeWork.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageDeleteRelativeWork().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取用于过滤的可选属性值", action = ActionManageFilterAttribute.class)
	@GET
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("filter/attribute/application/{applicationFlag}/manage")
	public void manageFilterAttribute(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag) {
		ActionResult<ActionManageFilterAttribute.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageFilterAttribute().execute(effectivePerson, applicationFlag);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "列示根据过滤条件的Work,下一页.", action = ActionManageListNextWithFilter.class)
	@POST
	@Path("list/{id}/next/{count}/application/{applicationFlag}/filter/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageListNextWithFilter(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag,
			JsonElement jsonElement) {
		ActionResult<List<ActionManageListNextWithFilter.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageListNextWithFilter().execute(effectivePerson, id, count, applicationFlag,
					jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "列示根据过滤条件的Work,上一页.", action = ActionManageListPrevWithFilter.class)
	@POST
	@Path("list/{id}/prev/{count}/application/{applicationFlag}/filter/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageListPrevWithFilter(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("数量") @PathParam("count") Integer count,
			@JaxrsParameterDescribe("应用标识") @PathParam("applicationFlag") String applicationFlag,
			JsonElement jsonElement) {
		ActionResult<List<ActionManageListPrevWithFilter.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageListPrevWithFilter().execute(effectivePerson, id, count, applicationFlag,
					jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "按条件对Work分页显示.", action = ActionManageListFilterPaging.class)
	@POST
	@Path("list/filter/{page}/size/{size}/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void manageListFilterPaging(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("分页") @PathParam("page") Integer page,
			@JaxrsParameterDescribe("数量") @PathParam("size") Integer size, JsonElement jsonElement) {
		ActionResult<List<ActionManageListFilterPaging.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionManageListFilterPaging().execute(effectivePerson, page, size, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "V2_工作调度.", action = V2Reroute.class)
	@PUT
	@Path("v2/{id}/reroute")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2Reroute(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<V2Reroute.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2Reroute().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = V2Reroute.class)
	@POST
	@Path("v2/{id}/reroute/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2RerouteMockPutToPost(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			JsonElement jsonElement) {
		ActionResult<V2Reroute.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2Reroute().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "V2_工作召回。", action = V2Retract.class)
	@PUT
	@Path("v2/{id}/retract")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2Retract(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<V2Retract.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2Retract().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = V2Retract.class)
	@POST
	@Path("v2/{id}/retract/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2RetractMockPutToPost(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			JsonElement jsonElement) {
		ActionResult<V2Retract.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2Retract().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "V2_回滚工作.", action = V2Rollback.class)
	@PUT
	@Path("v2/{id}/rollback")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2Rollback(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<V2Rollback.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2Rollback().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = V2Rollback.class)
	@POST
	@Path("v2/{id}/rollback/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2RollbackMockPutToPost(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			JsonElement jsonElement) {
		ActionResult<V2Rollback.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2Rollback().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "V2_增加一个会签分支", action = ActionAddSplit.class)
	@PUT
	@Path("v2/{id}/add/split")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2AddSplit(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id, JsonElement jsonElement) {
		ActionResult<V2AddSplit.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2AddSplit().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = ActionAddSplit.class)
	@POST
	@Path("v2/{id}/add/split/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2AddSplitMockPutToPost(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			JsonElement jsonElement) {
		ActionResult<V2AddSplit.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2AddSplit().execute(effectivePerson, id, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "管理员替代person操作工作召回。", action = V2ManageRetract.class)
	@PUT
	@Path("v2/{id}/person/{person}/retract/manage")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2ManageRetract(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("召回工作已办人员（根据流转记录确认）") @PathParam("person") String person, JsonElement jsonElement) {
		ActionResult<V2ManageRetract.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2ManageRetract().execute(effectivePerson, id, person);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "Mock Post To Put.", action = V2ManageRetract.class)
	@POST
	@Path("v2/{id}/person/{person}/retract/manage/mockputtopost")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2ManageRetractMockPutToPost(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request, @JaxrsParameterDescribe("工作标识") @PathParam("id") String id,
			@JaxrsParameterDescribe("召回工作已办人员（根据流转记录确认）") @PathParam("person") String person, JsonElement jsonElement) {
		ActionResult<V2ManageRetract.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2ManageRetract().execute(effectivePerson, id, person);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result, jsonElement));
	}

	@JaxrsMethodDescribe(value = "V2_根据Work或workCompleted取得内容.", action = V2GetWorkOrWorkCompleted.class)
	@GET
	@Path("v2/workorworkcompleted/{workOrWorkCompleted}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void V2GetWorkOrWorkCompleted(@Suspended final AsyncResponse asyncResponse,
			@Context HttpServletRequest request,
			@JaxrsParameterDescribe("工作标识") @PathParam("workOrWorkCompleted") String workOrWorkCompleted) {
		ActionResult<V2GetWorkOrWorkCompleted.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new V2GetWorkOrWorkCompleted().execute(effectivePerson, workOrWorkCompleted);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

}
