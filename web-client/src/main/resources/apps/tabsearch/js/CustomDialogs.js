var OEH = {
	// Popup constants
	Popup: {
		DOWNLOAD_CC : "DOWNLOAD_CC",
		DOWNLOAD_OEH : "DOWNLOAD_OEH",
		DOWNLOAD_LF : "DOWNLOAD_LF",
		ENQUIRY : "ENQUIRY",
		SERVICE_KML : "SERVICE_KML",
		SERVICE_REST : "SERVICE_REST",
		SERVICE_WMS : "SERVICE_WMS"
	}
};

/**
 * Creates a popup for data actions.
 *
 * @param type - See popup constants.
 * @param url - Default URL of the action (ex. download file, opening service url, etc). This will be called on submit of the form.
 * @param options - Additional options map.
 *
 */
OEH.Popup.show = function(type, url, options) {
	
	// Returns an organistion form field.
	function getOrganisationField() {

		var combo = new Ext.form.ComboBox({
			id:	'cmbOrg',
			name: 'organisation_type',
			fieldLabel: 'Organisation Type',
			width : 280,
			mode: 'local',
			triggerAction : 'all',
			editable: false,
			store: new Ext.data.ArrayStore({
				id: 0,
				fields: [
					'myId',
					'displayText'
				],
				data: [
					["SG", "State Government"],
					["CG", "Commonwealth Government"],
					["LG", "Local Government"],
					["CI", "Consultant/Industry"],
					["RI", "Research Institution"],
					["ED", "Education"],
					["NG", "Non-Government/Not-for-Profit Organisation"],
					["GE", "General Public/Other"]
				]
			}),
			valueField: 'myId',
			displayField: 'displayText'
		});
		combo.value = "--- Please select ---";
		return combo;
		
	}

	// Returns the privacy policy link
	function getPrivacyPolicyLink() {
		return "<a href='http://www.environment.nsw.gov.au/help/privacy.htm' target='_blank'>Privacy policy</a>";
	}

	// Returns the creative commons text link
	function getCreativeCommonsLink() {
		return "<a href='http://creativecommons.org/licenses/by/3.0/au/' target='_blank'>Creative Commons Attribution 3.0 Australia License</a>";
	}
	
	// Returns the creative commons image link
	function getCreativeCommonsImgLink() {
		return '<a href="http://creativecommons.org/licenses/by/3.0/au/" target="_blank"><img id="eoh-popup-cc" src="images/oeh/cc_icon.png"/></a>';
	}
	
	// Returns the CC license footnote text
	function getCcLicenseFootnote() {
		return "This data is provided under a Creative Commons Attribution 3.0 Australia Licence (CC BY 3.0 AU): http://creativecommons.org/licenses/by/3.0/au." 
			+ "<br/><br/>" 
			+ "Attribute <b>Office of Environment and Heritage NSW</b> in publications using this data.";
	}
	
	// Returns the OEH license footnote text
	function getOehLicenseFootnote() {
		return "This data is provided under licence by the Office of Environment and Heritage." + "<br/><br/>" +
				"Read the licence conditions in the readme.txt file contained in the downloaded zip file before using the data." + "<br/><br/>" +
				"Unless otherwise stated in the readme.txt, attribute <b>Office of Environment and Heritage NSW</b> in publications using this data.";
	}
	
	// Returns a mandatory marker styled span
	function getMandatoryMarker() {
		return '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
	}
	
	// Returns a link with onclick function attached
	function createLink(id, href, html, onclick) {
		return {
			id: id,
			name: id,
			xtype: 'box',
			autoEl: {
				tag: 'a',
				href: href,
				html: html
			},
			listeners: {
				scope: this,
				render: function(c){
					c.getEl().on('click', 
						onclick, 
						this, 
						{stopEvent: true});
				}
			}
		};
	}
	
	// Returns the modal window
	function createWindow(items) {
		return new Ext.Window({ 
			width : 470,
			cls: 'oeh-popup',
			modal: true,
			closable: true,
			draggable: false,
			resizable: false,
			header: false,
        	border: false,
			closeAction: 'destroy',
			constrain : true,
			items: items
		});
	}
	
	function openUrl(url) {
		if (url && url != null && url != '') {
			window.open(url);
		}
	}
function createThankYouPopup(type, panel, options) {
		
		var title = "Thank you";
		var items = [
		
			{
				html: '<span class="oeh-popup-title-text">' + title + '</span><p></p><p>We will respond within two business days.</p>',
				border : false,
				cls: 'oeh-popup-title'
			}
			/* Commented because it gives grey background between title and text. - JD */
			/* ,
			{
				html: 'We will respond within two business days.',
				border : false,
				cls: 'oeh-popup-subtitle'
			} */
		];
		
		
		items.push(panel);
		var window = createWindow(items);
		return window;
		
	}
	
	/**
	 * Creates a popup for licensed types (eg. licensed downloads and services).
	 */
	function createLicensedPopup(type, url, options) {
		
		var title = 'Download Data';
		if (OEH.Popup.SERVICE_KML == type) {
			title = 'Connect to KML Service (view in Google Earth)';
		} else if (OEH.Popup.SERVICE_REST == type) {
			title = 'Connect to REST Service';
		} else if (OEH.Popup.SERVICE_WMS == type) {
			title = 'Connect to Web Map Service (view in GIS)';
		}

		var footnote = getCcLicenseFootnote();
		if (OEH.Popup.DOWNLOAD_OEH == type) {
			footnote = getOehLicenseFootnote();
		}
		
		var submitLabel = 'Acknowledge and Download';
		var notifyText = 'To be notified of data updates, please provide your';
		if (OEH.Popup.SERVICE_KML == type
				|| OEH.Popup.SERVICE_REST == type
				|| OEH.Popup.SERVICE_WMS == type) {
			submitLabel = 'Acknowledge and Connect';
			notifyText = 'To be notified of planned service changes or outages, please provide your';
		}
		
		var leftButtonPanel = '';
		if (OEH.Popup.DOWNLOAD_OEH != type) {
			leftButtonPanel = getCreativeCommonsImgLink();
		}
		
		var buttonPanel = {
			id: 'buttonPanel',
			name: 'buttonPanel',
			border : false,
			html:  '<table border="0" width="100%">' +
						'<tr class="oeh-popup-wms-panel-header">' +
							'<td>' +
								leftButtonPanel +
							'</td>' +
							'<td style="text-align:right;">' +
								'<button id="eoh-popup-submit" type="button" style="margin-right: 10px;">' + submitLabel + '</button>' +
								'<a id="eoh-popup-reset" href="#">Reset</a>' +
							'</td>' +
						'</tr>' +
					'</table>',
			listeners: {
				scope: this,
				render: function(c){
					c.getEl().on('click', 
						function(event, item, options) {
							if (item.id === "eoh-popup-submit") {
								//TODO: LISAsoft - Submit form and save log details.
								//THis is where we need to integrate into db for saving authentication.

								// Only fix download URL for downloads, not other popups - JD 2013-08-10
								if (OEH.Popup.DOWNLOAD_CC == type || OEH.Popup.DOWNLOAD_OEH == type) {
									var _strcmbOrg=formPanel.getForm().findField("cmbOrg").getValue();
									var _strEmail=formPanel.getForm().findField("txtEmailsDownLoad").getValue();
									var _strIntendedUsage=formPanel.getForm().findField("txtIntendedUseDownLoad").getValue();
									var _strtarget=formPanel.getForm().findField("chkIsTargetedforNewsandSurveysDownLoad").getValue();
									
									url=this.catalogue.services.fileDownload_OEH+"?fname="+url
									+"&orgType="+_strcmbOrg+"&email="+_strEmail+"&IntendedUsage="
									+_strIntendedUsage+"&IsTargetedforNewsandSurveys="+_strtarget;
								}

								if (OEH.Popup.SERVICE_WMS == type) {
									var wmsUrlPanel = Ext.getCmp('wmsUrlPanel').getEl();
									if (!wmsUrlPanel.isVisible()) {
										item.innerHTML = 'Close';
										item.parentNode.children["eoh-popup-reset"].hidden = true;
										wmsUrlPanel.show();
									} else {
										window.close();
									}
								} else {
									openUrl(url);
									window.close();
								}							
							} else if (item.id === "eoh-popup-reset") {
								formPanel.getForm().reset();
							} else if (item.id === "eoh-popup-cc") {
								openUrl(item.parentNode.href);
							}
						}, 
						this, {stopEvent: true});
				}
			}
		};
		
		var formPanelItems = [
						{
							html: '<span class="oeh-popup-title-text">' + title + '</span>',
							border : false,
							cls: 'oeh-popup-title'
						},
						{
							html: 'These details will help us improve our services to you.',
							border : false,
							cls: 'oeh-popup-subtitle'
						},
						getOrganisationField(),
						{
							id		  :'txtIntendedUseDownLoad',
							name      : 'intendedUse',
							xtype     : 'textarea',
							fieldLabel: 'Intended Use',
							anchor    : '100%',
							boxMaxWidth : 280
						},
						{
							html: notifyText,
							border : false
						},
						{
							id		  :	'txtEmailsDownLoad',
							name      : 'email',
							xtype     : 'textfield',
							fieldLabel: 'email address',
							anchor    : '100%',
							boxMaxWidth : 280
						},
						{
							id		  :	'chkIsTargetedforNewsandSurveysDownLoad',
							name      : 'flag',
							xtype     : 'checkbox',
							fieldLabel: getPrivacyPolicyLink(),
							labelSeparator: '',
							boxLabel  : 'We may send you occasional news and user surveys',
							anchor    : '100%'
						},
						{
							html: footnote,
							border : false,
							cls: 'oeh-popup-footer'
						},
						buttonPanel
					];
		

		
		var formPanel = new Ext.form.FormPanel({
			labelAlign: 'left',
			labelWidth: 120,
			border: false,
			padding: 10,
			items: formPanelItems
		});
		
		var items = [formPanel];
		if (OEH.Popup.SERVICE_WMS == type) {
			
			var wmsUrl = url.substring(0, url.indexOf('?'));
			var wmsSampleMap = url; // Parameter is the getMap url 
			var wmsCapabilities = wmsUrl + '?request=GetCapabilities&service=WMS';
			
			var wmsPanel = {
				id: 'wmsUrlPanel',
				name: 'wmsUrlPanel',
				cls: 'oeh-popup-wms-panel',
				padding: 10,
				border : true,
				html:  '<table border="0" width="100%">' +
							'<tr class="oeh-popup-wms-panel-header">' +
								'<td colspan="3">' +
									'Service URL - copy/paste link to connect in desktop GIS:' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td colspan="3">' +
									'<input type="text" name="wmsUrl" value="' + wmsUrl + '" onClick="this.select();" readonly>' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td><a href="' + wmsSampleMap + '" target="_blank">Sample Map</a></td>' +
								'<td><a href="' + wmsCapabilities + '" target="_blank">Capabilities XML</a></td>' +
								'<td><a href="http://en.wikipedia.org/wiki/Web_Map_Service" target="_blank">What is WMS?</a></td>' +
							'</tr>' +
						'</table>',
				listeners: {
					scope: this,
					render: function(panel){
						panel.getEl().hide();
					}
				}
			};		
			
			var outerPanel = {
					border : false,
					padding: 10,
					items: [wmsPanel]
				}
			
			items.push(outerPanel);
		}
		
		var window = createWindow(items);
		return window;
		
	}
	
	/**
	 * Creates a popup for requested types (eg. large file download and enquiry).
	 */
	function createRequestPopup(type, url, options) {
		
		var title = "Request Data";
		if (OEH.Popup.ENQUIRY == type) {
			title = "Data Enquiry";
		}
		
		var items = [
			{
				html: '<span class="oeh-popup-title-text">' + title + '</span>',
				border : false,
				cls: 'oeh-popup-title'
			}
		];
		if (OEH.Popup.DOWNLOAD_LF == type) {
			items.push(
				{
					html: 'This data is available on request from the Office of Environment and Heritage.',
					border : false,
					cls: 'oeh-popup-subtitle'
				}
			);
		}
		items.push(
			{
				html: 'Please provide your details and we will respond within two business days.',
				border : false,
				cls: 'oeh-popup-subtitle'
			},
			{
				id		  :	'txtNameRequest',
				name      : 'name',
				xtype     : 'textfield',
				fieldLabel: 'Name',
				labelSeparator: getMandatoryMarker() + ':',
				anchor    : '100%',
				boxMaxWidth : 280,
				allowBlank : false
			},
			{
				id		  :	'txtEmailRequest',
				name      : 'email',
				xtype     : 'textfield',
				fieldLabel: 'Email',
				labelSeparator: getMandatoryMarker() + ':',
				anchor    : '100%',
				boxMaxWidth : 280,
				allowBlank : false
			},
			{
				id		  :	'chkIsTargetedForUpdate',
				name      : 'email_success',
				xtype     : 'checkbox',
				fieldLabel: '&nbsp',
				labelSeparator: '',
				boxLabel  : 'Email me when this data is updated',
				anchor    : '100%'
			},
			{
				id		  :	'chkIsTargetedForNewsandSurveysRequest',
				name      : 'email_news',
				xtype     : 'checkbox',
				fieldLabel: '&nbsp',
				labelSeparator: '',
				boxLabel  : 'Send me occasional news and user surveys',
				anchor    : '100%'
			},
			{
				id		  :	'txtOrg',
				name      : 'organisation',
				xtype     : 'textfield',
				fieldLabel: 'Organisation',
				anchor    : '100%',
				boxMaxWidth : 280
			},
			getOrganisationField(),
			{
				id		  :	'txtRequirements',
				name      : 'requirements',
				xtype     : 'textarea',
				fieldLabel: 'Required geographic extent of data, or other requirements',
				anchor    : '100%',
				boxMaxWidth : 280
			},
			{
				id		  :	'txtIntendedUseRequest',
				name      : 'intendedUse',
				xtype     : 'textarea',
				fieldLabel: 'Intended Use',
				anchor    : '100%',
				boxMaxWidth : 280
			},
			{
				html: getMandatoryMarker() + "mandatory fields",
				border : false
			}
		);
		
		var submitLabel = 'Request Data';
		if (OEH.Popup.ENQUIRY == type) {
			submitLabel = 'Send';
		}

		var buttonPanel = {
				id: 'buttonPanel',
				name: 'buttonPanel',
				border : false,
				html:  '<table border="0" width="100%">' +
							'<tr class="oeh-popup-wms-panel-header">' +
								'<td>' +
									getPrivacyPolicyLink() +
								'</td>' +
								'<td style="text-align:right;">' +
									'<button id="eoh-popup-submit" type="button" style="margin-right: 10px;">' + submitLabel + '</button>' +
									'<a id="eoh-popup-reset" href="#">Reset</a>' +
								'</td>' +
							'</tr>' +
						'</table>',
				listeners: {
					scope: this,
					render: function(c){
						c.getEl().on('click', 
							function(event, item, options) {
								if (item.id === "eoh-popup-submit") {
									if (formPanel.getForm().isValid()) {
										//TODO: LISAsoft - Submit request and save log details -logging
										//this is where we need to save to logging db table. We also need to make the request.
										
										var _txtNameRequest=formPanel.getForm().findField("txtNameRequest").getValue();
										var _txtOrg=formPanel.getForm().findField("txtOrg").getValue();
										var _cmbOrg=formPanel.getForm().findField("cmbOrg").getValue();
										var _txtEmailRequest=formPanel.getForm().findField("txtEmailRequest").getValue();
										var _txtRequirements=formPanel.getForm().findField("txtRequirements").getValue();
										var _txtIntendedUseRequest=formPanel.getForm().findField("txtIntendedUseRequest").getValue();
										var _chkIsTargetedForNewsandSurveysRequest=formPanel.getForm().findField("chkIsTargetedForNewsandSurveysRequest").getValue();
										var _chkIsTargetedForUpdate=formPanel.getForm().findField("chkIsTargetedForUpdate").getValue();
										
										var urlPath = this.catalogue.services.request_OEH+"?dataInfo="+url+"&nameUser="+_txtNameRequest
										+"&org="+_txtOrg+"&orgType="+_cmbOrg+"&email="+_txtEmailRequest+"&ReqGeoExtentofData="+_txtRequirements+"&IntendedUsage="
										+_txtIntendedUseRequest+"&IsTargetedforNewsandSurveys="+_chkIsTargetedForNewsandSurveysRequest
										+"&IsTargetedforUpdate="+_chkIsTargetedForUpdate;
										window.close();
										
										var dynamicPanel = new Ext.Component({
									           loader: {
									              url: urlPath,
									              renderer: 'html',
									              autoLoad: true,
									              scripts: true
									              }
									           });

										popup2 = createThankYouPopup(type, dynamicPanel, options);


										popup2.show();
										

										
										//openUrl(urlPath);
										
										//window.close();	
									}
								} else if (item.id === "eoh-popup-reset") {
									formPanel.getForm().reset();
								}
							}, 
							this, {stopEvent: true});
					}
				}
			};
		items.push(buttonPanel);
		
		var formPanel = new Ext.form.FormPanel({
			labelAlign: 'left',
			labelWidth: 120,
			border : false,
			padding: 10,
			items: items
		});
		
		var window = createWindow([formPanel]);
		return window;
		
	}
	
	var popup;
	if (OEH.Popup.DOWNLOAD_CC == type || OEH.Popup.DOWNLOAD_OEH == type
			|| OEH.Popup.SERVICE_KML == type || OEH.Popup.SERVICE_REST == type
			|| OEH.Popup.SERVICE_WMS == type) {
		popup = createLicensedPopup(type, url, options);
	} else if (OEH.Popup.DOWNLOAD_LF == type || OEH.Popup.ENQUIRY == type) {
		popup = createRequestPopup(type, url, options);
	}
	
	popup.show();
	
}