package com.x.organization.assemble.personal.jaxrs.exmail;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.container.factory.EntityManagerContainerFactory;
import com.x.base.core.entity.JpaObject;
import com.x.base.core.entity.annotation.CheckPersistType;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.exception.ExceptionEntityNotExist;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.queue.AbstractQueue;
import com.x.base.core.project.tools.DateTools;
import com.x.base.core.project.tools.StringTools;
import com.x.organization.core.entity.Person;
import com.x.organization.core.entity.PersonAttribute;

/**
 * 
 * @author ray
 *
 */
public class QueueUpdateExmail extends AbstractQueue<String> {

	private static final String MSGTYPE_UNREAD = "UnRead";

	private static final String MSGTYPE_MAIL = "Mail";

	private static Logger logger = LoggerFactory.getLogger(QueueUpdateExmail.class);

	protected void execute(String xmlBody) throws Exception {
		Element element = this.xml(xmlBody);
		String msgType = this.msgType(element);
		if (StringUtils.equalsIgnoreCase(msgType, MSGTYPE_UNREAD)) {
			unread(element);
		} else if (StringUtils.equalsIgnoreCase(msgType, MSGTYPE_MAIL)) {
			mail(element);
		} else {
			logger.warn("unknown msgType:{}, body:{}.", msgType, element.toString());
		}
	}

	private Element xml(String msg) throws SAXException, IOException, ParserConfigurationException {
		try (StringReader sr = new StringReader(msg)) {
			InputSource is = new InputSource(sr);
			Document document = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(is);
			return document.getDocumentElement();
		}
	}

	private String msgType(Element root) {
		NodeList nodes = root.getElementsByTagName("MsgType");
		return nodes.item(0).getTextContent();
	}

	private void unread(Element element) throws Exception {
		String userId = this.userId(element);
		String unreadCount = this.unreadCount(element);
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Person person = emc.firstEqual(Person.class, Person.mail_FIELDNAME, userId);
			if (null == person) {
				throw new ExceptionEntityNotExist(userId, Person.class);
			}
			// 更新未读邮件数量
			PersonAttribute unreadAttribute = emc.firstEqualAndEqual(PersonAttribute.class,
					PersonAttribute.name_FIELDNAME, Config.exmail().getPersonAttributeNewCountName(),
					PersonAttribute.person_FIELDNAME, person.getId());
			emc.beginTransaction(PersonAttribute.class);
			if (null == unreadAttribute) {
				unreadAttribute = new PersonAttribute();
				unreadAttribute.setPerson(person.getId());
				unreadAttribute.setName(Config.exmail().getPersonAttributeNewCountName());
				unreadAttribute.setAttributeList(new ArrayList<>());
				emc.persist(unreadAttribute, CheckPersistType.all);
			}
			unreadAttribute.getAttributeList().clear();
			unreadAttribute.getAttributeList().add(unreadCount);
			emc.commit();
		}
	}

	private void mail(Element element) throws Exception {
		String toUserId = this.toUserId(element);
		String fromUser = this.fromUser(element);
		String title = this.title(element);
		Date time = this.time(element);
		try (EntityManagerContainer emc = EntityManagerContainerFactory.instance().create()) {
			Person person = emc.firstEqual(Person.class, Person.mail_FIELDNAME, toUserId);
			if (null == person) {
				throw new ExceptionEntityNotExist(toUserId, Person.class);
			}
			String text = fromUser + "(" + DateTools.format(time, "MM-dd HH:mm") + ")";
			text = StringTools.utf8SubString(title, JpaObject.length_255B - StringTools.utf8Length(text)) + text;
			emc.beginTransaction(PersonAttribute.class);
			// 更新新邮件标题
			PersonAttribute titleAttribute = emc.firstEqualAndEqual(PersonAttribute.class,
					PersonAttribute.name_FIELDNAME, Config.exmail().getPersonAttributeTitleName(),
					PersonAttribute.person_FIELDNAME, person.getId());
			if (null == titleAttribute) {
				titleAttribute = new PersonAttribute();
				titleAttribute.setPerson(person.getId());
				titleAttribute.setName(Config.exmail().getPersonAttributeTitleName());
				titleAttribute.setAttributeList(new ArrayList<>());
				emc.persist(titleAttribute, CheckPersistType.all);
			}
			List<String> list = titleAttribute.getAttributeList();

			LinkedList<String> queue = new LinkedList<>(list);
			queue.push(text);

			titleAttribute.getAttributeList().clear();

			for (int i = 0; i < Math.min(30, queue.size()); i++) {
				titleAttribute.getAttributeList().add(queue.get(i));
			}
			// 更新未读邮件数量
			PersonAttribute unreadAttribute = emc.firstEqualAndEqual(PersonAttribute.class,
					PersonAttribute.name_FIELDNAME, Config.exmail().getPersonAttributeNewCountName(),
					PersonAttribute.person_FIELDNAME, person.getId());
			if (null == unreadAttribute) {
				unreadAttribute = new PersonAttribute();
				unreadAttribute.setPerson(person.getId());
				unreadAttribute.setName(Config.exmail().getPersonAttributeNewCountName());
				unreadAttribute.setAttributeList(new ArrayList<>());
				emc.persist(unreadAttribute, CheckPersistType.all);
			}
			int count = 1;
			if (!unreadAttribute.getAttributeList().isEmpty()) {
				count += NumberUtils.toInt(unreadAttribute.getAttributeList().get(0), 0);
				unreadAttribute.getAttributeList().clear();
			}
			unreadAttribute.getAttributeList().add(count + "");
			emc.commit();
		}
	}

	private String toUserId(Element root) {
		NodeList nodes = root.getElementsByTagName("ToUserID");
		return nodes.item(0).getTextContent();
	}

	private String fromUser(Element root) {
		NodeList nodes = root.getElementsByTagName("FromUser");
		return nodes.item(0).getTextContent();
	}

	private String title(Element root) {
		NodeList nodes = root.getElementsByTagName("Title");
		return nodes.item(0).getTextContent();
	}

	private String newCount(Element root) {
		NodeList nodes = root.getElementsByTagName("NewCount");
		return nodes.item(0).getTextContent();
	}

	private String userId(Element root) {
		NodeList nodes = root.getElementsByTagName("UserID");
		return nodes.item(0).getTextContent();
	}

	private String unreadCount(Element root) {
		NodeList nodes = root.getElementsByTagName("UnReadCount");
		return nodes.item(0).getTextContent();
	}

	private Date time(Element root) {
		NodeList nodes = root.getElementsByTagName("Time");
		String text = nodes.item(0).getTextContent();
		return new Date(Long.parseLong(text) * 1000);
	}

	/**
	 * <xml> <CorpID><![CDATA[ww878809d01b17fb5e]]></CorpID>
	 * <MsgType><![CDATA[Mail]]></MsgType>
	 * <MailID><![CDATA[Hr/VDOqk59elyFLdE9n3JU3mnwRsuo5JVzC1tNmquI8=]]></MailID>
	 * <ToUserID><![CDATA[xielingqiao@o2oa.net]]></ToUserID>
	 * <FromUser><![CDATA["zhourui@zoneland.net"<zhourui@zoneland.net>]]></FromUser>
	 * <Title><![CDATA[邮件到达了]]></Title> <Time>1610007415</Time>
	 * <NewCount>11</NewCount> </xml> <br>
	 * <xml><br>
	 * <CorpID><![CDATA[ww878809d01b17fb5e]]></CorpID>
	 * <MsgType><![CDATA[UnRead]]></MsgType>
	 * <UserID><![CDATA[xielingqiao@o2oa.net]]></UserID> <Time>1610007514</Time>
	 * <UnReadCount>10</UnReadCount> </xml>
	 */

}
