package com.x.base.core.project.bean;

import java.util.Objects;

public class NameValueCountPair {

	private Object name;

	private Object value;

	private Long count;

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((count == null) ? 0 : count.hashCode());
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		result = prime * result + ((value == null) ? 0 : value.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		NameValueCountPair other = (NameValueCountPair) obj;
		return (Objects.equals(this.getCount(), other.getCount())) && (Objects.equals(this.getName(), other.getName()))
				&& (Objects.equals(this.getValue(), other.getValue()));
	}

	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		this.value = value;
	}

	public Long getCount() {
		return count;
	}

	public void setCount(Long count) {
		this.count = count;
	}

	public Object getName() {
		return name;
	}

	public void setName(Object name) {
		this.name = name;
	}

}
