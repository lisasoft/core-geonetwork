//=============================================================================
//===	Copyright (C) 2001-2007 Food and Agriculture Organization of the
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
//===	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
//===
//===	Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
//===	Rome - Italy. email: geonetwork@osgeo.org
//==============================================================================

package org.fao.geonet.services.feedback;

import jeeves.interfaces.Service;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.Util;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.fao.geonet.constants.Params;
import org.fao.geonet.kernel.setting.SettingManager;
import org.fao.geonet.util.MailSender;
import org.jdom.Element;

import jeeves.exceptions.BadParameterEx;
import jeeves.exceptions.MissingParameterEx;
import jeeves.exceptions.ResourceNotFoundEx;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;
import jeeves.utils.BinaryFile;
import jeeves.utils.Util;
import jeeves.utils.Xml;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.exceptions.MetadataNotFoundEx;
import org.fao.geonet.kernel.AccessManager;
import org.fao.geonet.kernel.DataManager;
import org.fao.geonet.kernel.MdInfo;
import org.fao.geonet.kernel.mef.MEFLib;
import org.fao.geonet.kernel.setting.SettingManager;
import org.fao.geonet.lib.Lib;
import org.fao.geonet.services.Utils;
import org.fao.geonet.util.MailSender;
import org.jdom.Element;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLConnection;

//=============================================================================

/** OEH request user details */

public class request_OEH implements Service
{
	//--------------------------------------------------------------------------
	//---
	//--- Init
	//---
	//--------------------------------------------------------------------------

	public void init(String appPath, ServiceConfig params) throws Exception {}

	//--------------------------------------------------------------------------
	//---
	//--- Service
	//---
	//--------------------------------------------------------------------------

	public Element exec(Element params, final ServiceContext context) throws Exception
	{
		//by SR 12 Aug 2013 - log the metadata user request info to the db
		
		String _nameUser=Util.getParam(params, Params._NAMEUSER);
		String _org=Util.getParam(params, Params._ORG);
		String _orgType=Util.getParam(params, Params._ORGTYPE);
		String _email=Util.getParam(params, Params._EMAIL);
		String _reqExtent=Util.getParam(params, Params._REQGEOEXTENT);
		String _intendedUsage=Util.getParam(params, Params._INTENDEDUSAGE);
		String _IsTargetNews= Util.getParam(params, Params._ISTARGETNEWS);
		String _IsTargetUpdate=Util.getParam(params, Params._ISTARGETUPDATE);
		Dbms dbms = (Dbms) context.getResourceManager().open(Geonet.Res.MAIN_DB);
		
		String _query="INSERT INTO [metadataDownloadRequestDataInfo] ([fname],[nameUser],[org],[orgType],[email],[ReqGeoExtentofData],[intendedUsage],[isTargetedforNewsSurveys],[isTargetedforUpdate],[downloadDate],[requestDate])"+
             " VALUES (NULL,?,?,?,?,?,?,?,?,NULL,GETDATE())";
		
		dbms.execute(_query ,_nameUser,_org,_orgType,_email,_reqExtent,_intendedUsage,_IsTargetNews,_IsTargetUpdate);
	
		GeonetContext  gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
		SettingManager sm = gc.getSettingManager();

		String uuid		= Util.getParam(params,Params.UUID);
		String title=Util.getParam(params,Params.TITLE);
		
		String host = sm.getValue("system/feedback/mailServer/host");
		String port = sm.getValue("system/feedback/mailServer/port");
		String to   = sm.getValue("system/feedback/email");
		
		//get the current date in simple format
		Calendar currentDate = Calendar.getInstance();
		SimpleDateFormat formatter= 
		new SimpleDateFormat("yyyy/MMM/dd HH:mm:ss");
		String dateNow = formatter.format(currentDate.getTime());
		
		String emailContent="Request Date Time: "+ dateNow+"\n"
				+ "Metadata uuid: "+uuid+"\n"
				+ "Metadata title: "+title+"\n"
				+ "Name: " +_nameUser+"\n"
				+ "Download Email: "+_email+"\n"
				+ "Required Extent: "+_reqExtent+"\n"
				+ "Organisation: "+_org+"\n"
				+ "Organisation Type: "+_orgType+"\n"
				+ "Intended Usage: "+_intendedUsage;
		
		MailSender sender = new MailSender(context);
		sender.send(host, Integer.parseInt(port), _email, _nameUser +" ("+_org+")", to, null, "New Data Request", emailContent);

		return new Element("response").addContent(params.cloneContent());
		
	}

}

//=============================================================================


