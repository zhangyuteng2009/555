package com.x.program.center.jaxrs;

import com.x.base.core.project.jaxrs.AnonymousCipherManagerUserJaxrsFilter;

import javax.servlet.annotation.WebFilter;

@WebFilter(urlPatterns = "/jaxrs/apppackanony/*", asyncSupported = true)
public class AppPackAnonymousJaxrsFilter extends AnonymousCipherManagerUserJaxrsFilter {

}