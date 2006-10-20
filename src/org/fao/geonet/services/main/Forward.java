//=============================================================================
//===	Copyright (C) 2001-2005 Food and Agriculture Organization of the
//===	United Nations (FAO-UN), United Nations World Food Programme (WFP)
//===	and United Nations Environment Programme (UNEP)
//===
//===	This program is free software; you can redistribute it and/or modify
//===	it under the terms of the GNU General Public License as published by
//===	the Free Software Foundation; either version 2 of the License, or (at
//===	your option) any later version.
//===
//===	This program is distributed in the hope that it will be useful, but
//===	WITHOUT ANY WARRANTY; without even the implied warranty of
//===	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
//===	General Public License for more details.
//===
//===	You should have received a copy of the GNU General Public License
//===	along with this program; if not, write to the Free Software
//===	Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
//===
//===	Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
//===	Rome - Italy. email: GeoNetwork@fao.org
//==============================================================================

package org.fao.geonet.services.main;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import jeeves.interfaces.Service;
import jeeves.server.JeevesException;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.Util;
import jeeves.utils.Xml;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.jdom.Document;
import org.jdom.Element;

//=============================================================================

public class Forward implements Service
{
	//--------------------------------------------------------------------------
	//---
	//--- Init
	//---
	//--------------------------------------------------------------------------

	public void init(String appPath, ServiceConfig config) throws Exception {}

	//--------------------------------------------------------------------------
	//---
	//--- Service
	//---
	//--------------------------------------------------------------------------

	public Element exec(Element params, ServiceContext context) throws Exception
	{
		String  url = Util.getParam(params, "url");
		Element par = Util.getChild(params, "params");

		List list = par.getChildren();

		if (list.size() == 0)
			throw JeevesException.BadRequest("Missing request inside the 'params' element", params);

		params = (Element) list.get(0);

		String req = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+ Xml.getString(params);

		PostMethod post = new PostMethod(url);
		post.setRequestEntity(new StringRequestEntity(req, "application/xml", "UTF-8"));

		HttpClient http = new HttpClient();

		int statusCode;

		try
		{
			statusCode = http.executeMethod(post);

			InputStream is = new ByteArrayInputStream(post.getResponseBody());

			if (statusCode == HttpStatus.SC_OK)
				return Xml.loadStream(is);
		}
		catch(Exception e)
		{
			context.warning("Raised exception when connecting to host");
			context.warning(Util.getStackTrace(e));

			throw JeevesException.OperationAborted("Raise exception", e);
		}
		finally
		{
			post.releaseConnection();
		}

		context.warning("Bad status code received from host : "+ statusCode);
		throw JeevesException.OperationAborted("Bad status code from host", statusCode);
	}
}

//=============================================================================

