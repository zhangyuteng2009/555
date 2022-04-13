package com.x.base.core.container;

import java.util.List;
import java.util.Random;

import com.x.base.core.entity.JpaObject;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.openjpa.slice.DistributionPolicy;

public class FactorDistributionPolicy implements DistributionPolicy {

	private Random random = new Random();

	public String distribute(Object pc, List<String> slices, Object context) {
		try {
			Object o = PropertyUtils.getProperty(pc,JpaObject.distributeFactor_FIELDNAME);
			Integer factor = null;
			if (null == o) {
				factor = random.nextInt(1000);
				PropertyUtils.setProperty(pc, JpaObject.distributeFactor_FIELDNAME, factor);
			} else {
				factor = (Integer) o;
			}
			return slices.get(factor % slices.size());
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

}