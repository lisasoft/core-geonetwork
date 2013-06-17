var OEH = {
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

OEH.Popup.show = function(type, callback) {
	
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

	function getPrivacyPolicyLink() {
		return "<a href='http://www.environment.nsw.gov.au/help/privacy.htm' target='_blank'>Privacy Policy</a>";
	}

	function getCreativeCommonsLink() {
		return "<a href='http://creativecommons.org/licenses/by/3.0/au/' target='_blank'>Creative Commons Attribution 3.0 Australia License</a>";
	}
	
	function getCcLicenseFootnote() {
		return '<p>This data is provided under ' + getCreativeCommonsLink() + '.</p>' + 
				'<p>Attribute the <b>Office of Environment and Heritage NSW</b> in publications using this data.</p>';
	}
	
	function getOehLicenseFootnote() {
		return '<p>This data is provided under license by the Office of Environment and Heritage.</p>' + 
				'<p>Read the license conditions in the readme.txt file contained in the downloaded zip file before using the data.</p>' + 
				'<p>Unless otherwise stated in the readme.txt, attribute the <b>Office of Environment and Heritage NSW</b> in publications using this data.</p>';
	}
	
	function getMandatoryMarker() {
		return '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
	}
	
	function createWindow(width, height, formPanel) {
		return new Ext.Window({
			height : height,
			width : width,
			layout : 'fit',
			modal: true,
			closable: true,
			closeAction: 'destroy',
			constrain : true,
			items: [formPanel]
		});
	}
	
	function createLicensedPopup(type, callback) {
		
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
					items : [
						{
							html: '<a href="http://creativecommons.org/licenses/by/3.0/au/" target="_blank"><img src=""/>CC IMAGE</a>',
							border : false
						},
						{
							html: '<a href="#"><img src=""/>SUBMIT BUTTON</a>',
							border : false
						},
						{
							html: '<a href="#" onclick="return false;" title="Reset">Reset</a>',
							border : false
						}
					]
				}
			]
		});
		
		var width = 470;
		var height = 350;
		if (OEH.Popup.DOWNLOAD_OEH == type) {
			height = 390;
		}
		
		return createWindow(width, height, formPanel);
		
	}
	
	function createRequestPopup(type, callback) {
		
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
					{
						html: '<a href="#"><img src=""/>SUBMIT BUTTON</a>',
						border : false
					},
					{
						html: '<a href="#" onclick="return false;" title="Reset">Reset</a>',
						border : false
					}
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
		
		return createWindow(width, height, formPanel);
		
	}
	
	var popup;
	if (OEH.Popup.DOWNLOAD_CC == type || OEH.Popup.DOWNLOAD_OEH == type
			|| OEH.Popup.SERVICE_KML == type || OEH.Popup.SERVICE_REST == type
			|| OEH.Popup.SERVICE_WMS == type) {
		popup = createLicensedPopup(type, callback);
	} else if (OEH.Popup.DOWNLOAD_LF == type || OEH.Popup.ENQUIRY == type) {
		popup = createRequestPopup(type, callback);
	}
	popup.show();
	
}