package com.x.query.assemble.designer.jaxrs;

import javax.servlet.annotation.WebFilter;

import com.x.base.core.project.jaxrs.CipherManagerUserJaxrsFilter;

@WebFilter(urlPatterns = "/jaxrs/importmodel/*", asyncSupported = true)
public class ImportModelJaxrsFilter extends CipherManagerUserJaxrsFilter {

}
