package com.x.cms.core.express.tools.filter.term;

public class IsTrueTerm {

	private String name = null;
	
	public IsTrueTerm() {}
	
	public IsTrueTerm( String name ) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
}
