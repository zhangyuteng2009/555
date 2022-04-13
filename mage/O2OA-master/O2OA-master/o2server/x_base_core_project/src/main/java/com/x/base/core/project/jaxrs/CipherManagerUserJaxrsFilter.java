package com.x.base.core.project.jaxrs;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.x.base.core.project.config.Config;
import com.x.base.core.project.exception.ExceptionUnauthorized;
import com.x.base.core.project.http.*;
import org.apache.commons.lang3.StringUtils;

/**
 * 必须由前台已经登陆的用户访问
 */
public abstract class CipherManagerUserJaxrsFilter extends TokenFilter {

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
			throws IOException, ServletException {
		try {
			HttpServletRequest request = (HttpServletRequest) req;
			HttpServletResponse response = (HttpServletResponse) res;
			FilterTools.allow(request, response);
			if (!request.getMethod().equalsIgnoreCase("options")) {
				HttpToken httpToken = new HttpToken();
				EffectivePerson effectivePerson = httpToken.who(request, response, Config.token().getCipher());
				if (TokenType.anonymous.equals(effectivePerson.getTokenType())) {
					/** 401 Unauthorized 未登录访问被拒绝 */
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.setHeader("Content-Type", "application/json;charset=UTF-8");
					ActionResult result = new ActionResult();
					ExceptionUnauthorized e = new ExceptionUnauthorized();
					result.error(e);
					String message = e.getFormatMessage(result.getPrompt(), request.getHeader(ResponseFactory.Accept_Language));
					if(StringUtils.isNotBlank(message)) {
						result.setMessage(message);
					}
					response.getWriter().write(result.toJson());
				} else {
					chain.doFilter(request, response);
				}
			} else {
				options(request,response);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void destroy() {
	}

	public void init(FilterConfig config) throws ServletException {
	}
}
