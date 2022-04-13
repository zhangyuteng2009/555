package com.x.processplatform.service.processing.jaxrs;

import javax.servlet.annotation.WebFilter;

import com.x.base.core.project.jaxrs.AnonymousCipherManagerUserJaxrsFilter;

@WebFilter(urlPatterns = "/jaxrs/test/*", asyncSupported = true)
public class TestJaxrsFilter extends AnonymousCipherManagerUserJaxrsFilter {

}
