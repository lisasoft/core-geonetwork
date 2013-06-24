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
			name: 'organisation_type',
			fieldLabel: 'Organisation Type',
			width : 280,
			editable: true,
			forceSelection: true,
			mode: 'local',
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
		
		return combo;
		
	}

	// Returns the privacy policy link
	function getPrivacyPolicyLink() {
		return "<a href='http://www.environment.nsw.gov.au/help/privacy.htm' target='_blank'>Privacy Policy</a>";
	}

	// Returns the creative commons text link
	function getCreativeCommonsLink() {
		return "<a href='http://creativecommons.org/licenses/by/3.0/au/' target='_blank'>Creative Commons Attribution 3.0 Australia License</a>";
	}
	
	// TODO - add image
	// Returns the creative commons image link
	function getCreativeCommonsImgLink() {
		return '<a href="http://creativecommons.org/licenses/by/3.0/au/" target="_blank"><img src=""/>Copyright</a>';
	}
	
	// Returns the CC license footnote text
	function getCcLicenseFootnote() {
		return "<p>This data is provided under a Creative Commons Attribution 3.0 Australia Licence (CC BY 3.0 AU): http://creativecommons.org/licenses/by/3.0/au Attribute 'Office of Environment and Heritage NSW' in publications using this data.</p>";
	}
	
	// Returns the OEH license footnote text
	function getOehLicenseFootnote() {
		return "<p>This data is provided under licence by the Office of Environment and Heritage. Read the licence conditions in the readme.txt file contained in the downloaded zip file before using the data. Unless otherwise stated in the readme.txt, attribute 'Office of Environment and Heritage NSW' in publications using this data.</p>";
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
	function createWindow(width, height, items) {
		return new Ext.Window({
			height : height,
			width : width,
			layout: 'vbox',
			layoutConfig: {
				align: 'stretch'
			},
			modal: true,
			closable: true,
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
		
		var formPanel = new Ext.form.FormPanel({
			labelAlign: 'left',
			labelWidth: 120,
			padding: 10,
			items: [
				{
					html: title,
					border : false
				},
				{
					html: 'These details will help us improve our services to you.',
					border : false
				},
				getOrganisationField(),
				{
					name      : 'intendedUse',
					xtype     : 'textarea',
					fieldLabel: 'Intended Use',
					anchor    : '100%',
					boxMaxWidth : 280
				},
				{
					html: 'To be notified of data updates, please provide your',
					border : false
				},
				{
					name      : 'email',
					xtype     : 'textfield',
					fieldLabel: 'email address',
					anchor    : '100%',
					boxMaxWidth : 280
				},
				{
					name      : 'flag',
					xtype     : 'checkbox',
					fieldLabel: getPrivacyPolicyLink(),
					labelSeparator: '',
					boxLabel  : 'We may send you news and occasional user surveys',
					anchor    : '100%'
				},
				{
					html: footnote,
					border : false
				},
				{
					layout : {
						type : 'hbox',
						pack : 'start'
                    },
					border : false,
					items : [
						{
							html: getCreativeCommonsImgLink(),
							border : false
						},
						createLink('submitLink', '#', 'Submit', function() {
							//TODO - Submit form and save log details
							if (OEH.Popup.SERVICE_WMS == type) {
								var wmsUrlPanel = Ext.getCmp('wmsUrlPanel').getEl();
								if (!wmsUrlPanel.isVisible()) {
									//TODO - Rename submit link
									Ext.get('submitLink').update('Close');
									//TODO - Hide reset link
									Ext.getCmp('resetLink').getEl().hide();
									//TODO - Show WMS url panel
									wmsUrlPanel.show();
								} else {
									window.close();
								}
							} else {
								openUrl(url);
								window.close();
							}							
						}),
						createLink('resetLink', '#', 'Reset', function() {
							formPanel.getForm().reset();
						})
					]
				}
			]
		});
		
		var items = [formPanel];
		if (OEH.Popup.SERVICE_WMS == type) {
			
			var wmsUrl = url;
			var wmsSampleMap = url + '?VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG:102100&FORMAT=image/png&TRANSPARENT=TRUE&EXCEPTIONS=INIMAGE&BBOX=15625344.26,-4574548.91,17179065.4,-3204873.971&WIDTH=500&HEIGHT=440&LAYERS=0&STYLES=';
			var wmsCapabilities = url + '?request=GetCapabilities&service=WMS';
			
			var wmsPanel = {
				id: 'wmsUrlPanel',
				name: 'wmsUrlPanel',
				padding: 10,
				html:  '<table border="0" width="100%">' +
							'<tr>' +
								'<td colspan="3">' +
									'Service URL - copy/paste link to connect in desktop GIS:' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td colspan="3">' +
									'<input type="text" name="wmsUrl" value="' + wmsUrl + '" style="width:100%;" onClick="this.select();" readonly>' +
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
			items.push(wmsPanel);
		}
		
		var width = 470;
		var height = 350;
		if (OEH.Popup.DOWNLOAD_OEH == type) {
			height = 390;
		} else if (OEH.Popup.SERVICE_WMS == type) {
			height = 400;
		}
		var window = createWindow(width, height, items);
		
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
				html: title,
				border : false
			}
		];
		if (OEH.Popup.DOWNLOAD_LF == type) {
			items.push(
				{
					html: 'This data is available on request from the Office of Environment and Heritage.',
					border : false
				}
			);
		}
		items.push(
			{
				html: 'Please provide your details and we will respond within two business days.',
				border : false
			},
			{
				name      : 'name',
				xtype     : 'textfield',
				fieldLabel: 'Name',
				labelSeparator: getMandatoryMarker() + ':',
				anchor    : '100%',
				boxMaxWidth : 280,
				allowBlank : false
			},
			{
				name      : 'email',
				xtype     : 'textfield',
				fieldLabel: 'Email',
				labelSeparator: getMandatoryMarker() + ':',
				anchor    : '100%',
				boxMaxWidth : 280,
				allowBlank : false
			},
			{
				name      : 'email_success',
				xtype     : 'checkbox',
				fieldLabel: '&nbsp',
				labelSeparator: '',
				boxLabel  : 'Email me when this data is updated',
				anchor    : '100%'
			},
			{
				name      : 'email_news',
				xtype     : 'checkbox',
				fieldLabel: '&nbsp',
				labelSeparator: '',
				boxLabel  : 'Send me occasional news and user serveys',
				anchor    : '100%'
			},
			{
				name      : 'organisation',
				xtype     : 'textfield',
				fieldLabel: 'Organisation',
				anchor    : '100%',
				boxMaxWidth : 280
			},
			getOrganisationField(),
			{
				name      : 'requirements',
				xtype     : 'textarea',
				fieldLabel: 'Required geographic extent of data, or other requirements',
				anchor    : '100%',
				boxMaxWidth : 280
			},
			{
				name      : 'intendedUse',
				xtype     : 'textarea',
				fieldLabel: 'Intended Use',
				anchor    : '100%',
				boxMaxWidth : 280
			},
			{
				html: getMandatoryMarker() + "mandatory fields",
				border : false
			},
			{
				layout : {
					type : 'hbox',
					pack : 'start'
				},
				items : [
					{
						html: getPrivacyPolicyLink(),
						border : false
					},
					createLink('submitLink', '#', 'Submit', function() {
						//TODO - Send request
						//TODO - Save log details
						window.close();
					}),
					createLink('resetLink', '#', 'Reset', function() {
						formPanel.getForm().reset();
					})
				]
			}
		);
		
		var formPanel = new Ext.form.FormPanel({
			labelAlign: 'left',
			labelWidth: 120,
			padding: 10,
			items: items
		});
		
		var width = 470;
		var height = 440;
		if (OEH.Popup.ENQUIRY == type) {
			height = 420;
		}
		
		var window = createWindow(width, height, [formPanel]);
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