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

package org.fao.geonet.services.metadata;

import java.util.*;
import org.jdom.*;

import jeeves.constants.*;
import jeeves.interfaces.*;
import jeeves.resources.dbms.*;
import jeeves.server.*;
import jeeves.server.context.*;
import jeeves.utils.*;

import org.fao.geonet.constants.*;
import org.fao.geonet.kernel.*;
import org.fao.geonet.exceptions.*;
import org.fao.geonet.*;
import org.fao.geonet.kernel.search.MetaSearcher;

//=============================================================================

/** Removes a metadata from the system
  */

public class Delete implements Service
{
	public void init(String appPath, ServiceConfig params) throws Exception {}

	//--------------------------------------------------------------------------
	//---
	//--- Service
	//---
	//--------------------------------------------------------------------------

	public Element exec(Element params, ServiceContext context) throws Exception
	{
		GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
		DataManager   dataMan   = gc.getDataManager();
		AccessManager accessMan = gc.getAccessManager();
		UserSession   session   = context.getUserSession();

		Dbms dbms = (Dbms) context.getResourceManager().open(Geonet.Res.MAIN_DB);

		String id = Util.getParam(params, Params.ID);

		//-----------------------------------------------------------------------
		//--- check access

		if (!dataMan.existsMetadata(dbms, id))
			throw new IllegalArgumentException("Metadata not found --> " + id);

		HashSet hsOper = accessMan.getOperations(context, id, context.getIpAddress());

		if (!hsOper.contains(AccessManager.OPER_EDIT))
			throw new JeevesException(JeevesException.PRIVILEGES);

		//-----------------------------------------------------------------------
		//--- delete metadata and return status

		if (!dataMan.deleteMetadata(dbms, id))
			throw new GeoNetException(JeevesException.ERROR);

		Element elResp = new Element(Jeeves.Elem.RESPONSE);
		elResp.addContent(new Element(Geonet.Elem.ID).setText(id));

		// invalidate current result set set
		MetaSearcher searcher = (MetaSearcher)context.getUserSession().getProperty(Geonet.Session.SEARCH_RESULT);
		if (searcher != null) searcher.setValid(false);

		return elResp;
	}
}

//=============================================================================

