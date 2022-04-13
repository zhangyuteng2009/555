package com.x.program.center.jaxrs;

import com.x.base.core.project.jaxrs.CipherManagerJaxrsFilter;

import javax.servlet.annotation.WebFilter;

@WebFilter(urlPatterns = "/jaxrs/apppack/*", asyncSupported = true)
public class AppPackJaxrsFilter extends CipherManagerJaxrsFilter {

}