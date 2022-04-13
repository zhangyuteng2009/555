package com.x.query.assemble.surface.jaxrs.statement;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
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

import java.util.List;

@Path("statement")
@JaxrsDescribe("语句")
public class StatementAction extends StandardJaxrsAction {

	private static Logger logger = LoggerFactory.getLogger(StatementAction.class);

	@JaxrsMethodDescribe(value = "执行语句.", action = ActionExecute.class)
	@POST
	@Path("{flag}/execute/page/{page}/size/{size}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void execute(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
			@JaxrsParameterDescribe("标识") @PathParam("flag") String flag,
			@JaxrsParameterDescribe("页码") @PathParam("page") Integer page,
			@JaxrsParameterDescribe("每页数量") @PathParam("size") Integer size, JsonElement jsonElement) {
		ActionResult<Object> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionExecute().execute(effectivePerson, flag, page, size, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "根据查询列示语句对象.", action = ActionListWithQuery.class)
	@POST
	@Path("list/query/{queryFlag}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void listWithQuery(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
							  @JaxrsParameterDescribe("查询标识") @PathParam("queryFlag") String queryFlag, JsonElement jsonElement) {
		ActionResult<List<ActionListWithQuery.Wo>> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionListWithQuery().execute(effectivePerson, queryFlag, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "获取语句内容.", action = ActionGet.class)
	@GET
	@Path("{id}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void get(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
					@JaxrsParameterDescribe("标识") @PathParam("id") String id) {
		ActionResult<ActionGet.Wo> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionGet().execute(effectivePerson, id);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, null);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

	@JaxrsMethodDescribe(value = "执行语句V2,可以同时执行查询结果及查询总数.", action = ActionExecuteV2.class)
	@POST
	@Path("{flag}/execute/mode/{mode}/page/{page}/size/{size}")
	@Produces(HttpMediaType.APPLICATION_JSON_UTF_8)
	@Consumes(MediaType.APPLICATION_JSON)
	public void executeV2(@Suspended final AsyncResponse asyncResponse, @Context HttpServletRequest request,
						  @JaxrsParameterDescribe("标识") @PathParam("flag") String flag,
						  @JaxrsParameterDescribe("执行模式：data|count|all") @PathParam("mode") String mode,
						  @JaxrsParameterDescribe("页码") @PathParam("page") Integer page,
						  @JaxrsParameterDescribe("每页数量") @PathParam("size") Integer size, JsonElement jsonElement) {
		ActionResult<Object> result = new ActionResult<>();
		EffectivePerson effectivePerson = this.effectivePerson(request);
		try {
			result = new ActionExecuteV2().execute(effectivePerson, flag, mode, page, size, jsonElement);
		} catch (Exception e) {
			logger.error(e, effectivePerson, request, jsonElement);
			result.error(e);
		}
		asyncResponse.resume(ResponseFactory.getEntityTagActionResultResponse(request, result));
	}

}