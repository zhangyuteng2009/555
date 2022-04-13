package com.x.portal.assemble.designer.jaxrs;

import javax.servlet.annotation.WebFilter;

import com.x.base.core.project.jaxrs.CipherManagerJaxrsFilter;

@WebFilter(urlPatterns = "/jaxrs/output/*", asyncSupported = true)
public class OutputJaxrsFilter extends CipherManagerJaxrsFilter {

}
