package com.x.program.center;

import com.x.base.core.project.config.Collect;
import com.x.base.core.project.config.Nodes;
import com.x.base.core.project.gson.XGsonBuilder;
import com.x.base.core.project.http.EffectivePerson;
import com.x.base.core.project.http.TokenType;
import com.x.base.core.project.logger.Logger;
import com.x.base.core.project.logger.LoggerFactory;
import com.x.base.core.project.organization.OrganizationDefinition;
import com.x.base.core.project.tools.Crypto;
import com.x.organization.core.express.Organization;
import org.apache.commons.lang3.StringUtils;

import com.x.base.core.container.EntityManagerContainer;
import com.x.base.core.project.config.Config;
import com.x.base.core.project.connection.ActionResponse;
import com.x.base.core.project.connection.ConnectionAction;
import com.x.base.core.project.gson.GsonPropertyObject;
import com.x.base.core.project.jaxrs.WrapBoolean;
import com.x.program.center.factory.PersonFactory;
import com.x.program.center.factory.UnitFactory;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Business {

	private static Logger logger = LoggerFactory.getLogger(Business.class);

	private EntityManagerContainer emc;

	public Business(EntityManagerContainer emc) throws Exception {
		this.emc = emc;
	}

	public EntityManagerContainer entityManagerContainer() {
		return this.emc;
	}

	private Organization organization;

	public Organization organization() throws Exception {
		if (null == this.organization) {
			this.organization = new Organization(ThisApplication.context());
		}
		return organization;
	}

	public boolean serviceControlAble(EffectivePerson effectivePerson) throws Exception {
		boolean result = false;
		if (effectivePerson.isManager()
				|| (this.organization().person().hasRole(effectivePerson, OrganizationDefinition.ServiceManager))) {
			result = true;
		}
		return result;
	}

	public Boolean collectAccountNotEmpty() throws Exception {
		if (StringUtils.isEmpty(Config.collect().getName()) || StringUtils.isEmpty(Config.collect().getPassword())) {
			return false;
		}
		return true;
	}

	public Boolean connectCollect() {
		try {
			String url = Config.collect().url("o2_collect_assemble/jaxrs/echo");
			ConnectionAction.get(url, null);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public Boolean validateCollect() throws Exception {
		String url = Config.collect().url("o2_collect_assemble/jaxrs/collect/validate");
		ValidateReq req = new ValidateReq();
		req.setName(Config.collect().getName());
		req.setPassword(Config.collect().getPassword());
		ActionResponse resp = ConnectionAction.put(url, null, req);
		return resp.getData(WoValidateCollect.class).getValue();
	}

	public String loginCollect() throws Exception {
		String url = Config.collect().url(Collect.ADDRESS_COLLECT_LOGIN);
		Map<String, String> map = new HashMap<>();
		map.put("credential", Config.collect().getName());
		map.put("password", Config.collect().getPassword());
		ActionResponse resp = ConnectionAction.post(url, null, map);
		LoginWo loginWo = resp.getData(LoginWo.class);
		if(loginWo!=null) {
			return loginWo.getToken();
		}else{
			return null;
		}
	}

	public String getUnitName() throws Exception {
		String url = Config.collect().url(Collect.ADDRESS_COLLECT_LOGIN);
		Map<String, String> map = new HashMap<>();
		map.put("credential", Config.collect().getName());
		map.put("password", Config.collect().getPassword());
		ActionResponse resp = ConnectionAction.post(url, null, map);
		LoginWo loginWo = resp.getData(LoginWo.class);
		if(loginWo!=null) {
			return loginWo.getName();
		}else{
			return null;
		}
	}

	public static class ValidateReq extends GsonPropertyObject {

		private String name;
		private String password;

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getPassword() {
			return password;
		}

		public void setPassword(String password) {
			this.password = password;
		}
	}

	private PersonFactory person;

	public PersonFactory person() throws Exception {
		if (null == this.person) {
			this.person = new PersonFactory(this);
		}
		return person;
	}

	private UnitFactory unit;

	public UnitFactory unit() throws Exception {
		if (null == this.unit) {
			this.unit = new UnitFactory(this);
		}
		return unit;
	}

	public static class WoValidateCollect extends WrapBoolean {
	}

	public static class LoginWo extends GsonPropertyObject {

		private String token;

		private String name;

		private TokenType tokenType;

		public String getToken() {
			return token;
		}

		public void setToken(String token) {
			this.token = token;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public TokenType getTokenType() {
			return tokenType;
		}

		public void setTokenType(TokenType tokenType) {
			this.tokenType = tokenType;
		}

	}

	public static List<String> dispatch(boolean asNew, String fileName, String filePath, byte[] bytes) throws Exception{
		List<String> list = new ArrayList<>();
		Nodes nodes = Config.nodes();
		for (String node : nodes.keySet()){
			boolean flag = false;

			try (Socket socket = new Socket(node, nodes.get(node).nodeAgentPort())) {
				socket.setKeepAlive(true);
				socket.setSoTimeout(10000);
				try (DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
					 DataInputStream dis = new DataInputStream(socket.getInputStream())){
					Map<String, Object> commandObject = new HashMap<>();
					commandObject.put("command", "uploadResource:"+fileName);
					commandObject.put("credential", Crypto.rsaEncrypt("o2@", Config.publicKey()));

					Map<String, Object> param = new HashMap<>();
					param.put("fileName", fileName);
					param.put("asNew", asNew);
					if(StringUtils.isNotEmpty(filePath)){
						param.put("filePath", filePath);
					}
					commandObject.put("param", param);
					dos.writeUTF(XGsonBuilder.toJson(commandObject));
					dos.flush();
					dos.writeInt(bytes.length);
					dos.flush();

					try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes)){
						byte[] onceBytes = new byte[1024];
						int length = 0;
						while((length = bis.read(onceBytes, 0, onceBytes.length)) != -1) {
							dos.write(onceBytes, 0, length);
							dos.flush();
						}
					}

					String result = dis.readUTF();
					logger.print("socket dispatch resource {} to {}:{} result={}", fileName, node, nodes.get(node).nodeAgentPort(), result);
					if("success".equals(result)){
						flag = true;
						list.add(node+":success");
					}else{
						list.add(node + ":failure");
					}
				}

			} catch (Exception ex) {
				list.add(node + ":failure-"+ex.getMessage());
				logger.print("socket dispatch resource to {}:{} error={}", node, nodes.get(node).nodeAgentPort(), ex.getMessage());
			}

		}
		return list;
	}

}
