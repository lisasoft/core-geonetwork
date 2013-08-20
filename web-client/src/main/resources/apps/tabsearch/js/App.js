Ext.namespace('GeoNetwork');

var catalogue;
var app;
var cookie;

GeoNetwork.app = function () {
    // private vars:
    var geonetworkUrl;
    var searching = false;
    var editorWindow;
    var editorPanel;
    var resultPanel;

    /**
     * Application parameters are : * any search form ids (eg. any) * mode=1 for
     * visualization * advanced: to open advanced search form by default *
     * search: to trigger the search * uuid: to display a metadata record based
     * on its uuid * extent: to set custom map extent
     */
    var urlParameters = {};

    /**
     * Catalogue manager
     */
    var catalogue;

    /**
     * An interactive map panel for data visualization
     */
    var iMap;

    var searchForm;

    var facetsPanel;
    
    var optionsForm;

    var resultsPanel;

    var metadataResultsView;

    var tBar, bBar;

    var mainTagCloudViewPanel, tagCloudViewPanel;

    var visualizationModeInitialized = false;


    function setTab(id) {

        var tabPanel = Ext.getCmp("GNtabs"),
             tabs = tabPanel.find('id', id);
          
        if (tabs[0]) {
            tabPanel.setActiveTab(tabs[0]);
        }
    }
    
    function addWMSLayer(arr) {
        app.switchMode();
        app.getIMap().addWMSLayer(arr);
    }
    
    /**
     * Create a mapControl
     * 
     * @return
     */
    function initMap() {
        iMap = new GeoNetwork.mapApp();
        var layers={}, options={};
        if(GeoNetwork.map.CONTEXT || GeoNetwork.map.OWS) {
            options = GeoNetwork.map.CONTEXT_MAIN_MAP_OPTIONS;
        } else {
            options = GeoNetwork.map.MAIN_MAP_OPTIONS;
            layers  = GeoNetwork.map.BACKGROUND_LAYERS;
        }
        iMap.init(layers, options);
        metadataResultsView.addMap(iMap.getMap());
        visualizationModeInitialized = true;
        return iMap;
    }

    /**
     * Create a language switcher mode
     * 
     * @return
     */
    function createLanguageSwitcher(lang) {
        return new Ext.form.FormPanel({
            renderTo : 'lang-form',
            width : 80,
            border : false,
            layout : 'hbox',
            hidden : GeoNetwork.Util.locales.length === 1 ? true : false,
            items : [ new Ext.form.ComboBox({
                mode : 'local',
                triggerAction : 'all',
                width : 80,
                store : new Ext.data.ArrayStore({
                    idIndex : 2,
                    fields : [ 'id', 'name', 'id2' ],
                    data : GeoNetwork.Util.locales
                }),
                valueField : 'id2',
                displayField : 'name',
                value : lang,
                listeners : {
                    select : function (cb, record, idx) {
                        window.location.replace('?hl=' + cb.getValue());
                    }
                }
            }) ]
        });
    }
    
    /**
     * Error message in case of bad login
     * 
     * @param cat
     * @param user
     * @return
     */
    function loginAlert(cat, user) {
        Ext.Msg.show({
            title : 'Login',
            msg : 'Login failed. Check your username and password.',
            /* TODO : Get more info about the error */
            icon : Ext.MessageBox.ERROR,
            buttons : Ext.MessageBox.OK
        });
    }
    
    /**
     * Create a default login form and register extra events in case of error.
     * 
     * @return
     */
    function createLoginForm() {
        var loginForm = new GeoNetwork.LoginForm({
            id:'loginForm',
            renderTo : 'login-form',
            catalogue : catalogue,
            layout : 'hbox',
            bodyStyle : {
                "background-color" : "transparent"
            },
            hideLoginLabels : GeoNetwork.hideLoginLabels
        });

        catalogue.on('afterBadLogin', loginAlert, this);

        // Store user info in cookie to be displayed if user reload the page
        // Register events to set cookie values
        catalogue.on('afterLogin', function () {
            cookie.set('user', catalogue.identifiedUser);
        });
        catalogue.on('afterLogout', function () {
            cookie.set('user', undefined);
        });

        // Refresh login form if needed
        var user = cookie.get('user');
        if (user) {
            catalogue.identifiedUser = user;
            loginForm.login(catalogue, true);
        }
    }
    function getResultsMap() {
        // Create map panel
        var map = undefined;
        
        if (GeoNetwork.map.CONTEXT) {
            // Load map context
            var request = OpenLayers.Request.GET({
                url: GeoNetwork.map.CONTEXT,
                async: false
            });
            if (request.responseText) {
                var text = request.responseText;
                var format = new OpenLayers.Format.WMC();
                map = format.read(text, {map: GeoNetwork.map.CONTEXT_MAP_OPTIONS});
            }
        }
        else if (GeoNetwork.map.OWS) {
            // Load map context
            var request = OpenLayers.Request.GET({
                url: GeoNetwork.map.OWS,
                async: false
            });
            if (request.responseText) {
                var parser = new OpenLayers.Format.OWSContext();
                var text = request.responseText;
                map = parser.read(text, {map: GeoNetwork.map.CONTEXT_MAP_OPTIONS});
            }
        }
        
        if (!map) {
            map = new OpenLayers.Map('results_map', GeoNetwork.map.MAP_OPTIONS);
            map.addLayers(GeoNetwork.map.BACKGROUND_LAYERS);
            map.zoomToMaxExtent();
        }
        
        var mapPanel = new GeoExt.MapPanel({
            id : "resultsMap",
           height: 220,
            width : 250,
            stateful: false,
            map : map
        });
        
        return mapPanel;
    }

    /**
     * Create a default search form with advanced mode button
     * 
     * @return
     */
    function createSearchForm() {
        // Add advanced mode criteria to simple form - start
        var advancedCriteria = [];
        var services = catalogue.services;

        // Multi select organisation field
        var orgNameStore = new GeoNetwork.data.OpenSearchSuggestionStore({
            url : services.opensearchSuggest,
            rootId : 1,
            baseParams : {
                field : 'orgName'
            }
        });

        var orgNameField = new Ext.ux.form.SuperBoxSelect({
            hideLabel : false,
            minChars : 0,
            queryParam : 'q',
            hideTrigger : false,
            id : 'E_orgName',
            name : 'E_orgName',
            store : orgNameStore,
            valueField : 'value',
            displayField : 'value',
            valueDelimiter : ' or ',
            // tpl: tpl,
            fieldLabel : OpenLayers.i18n('org')
        });

        // Multi select keyword
        var themekeyStore = new GeoNetwork.data.OpenSearchSuggestionStore({
            url : services.opensearchSuggest,
            rootId : 1,
            baseParams : {
                field : 'keyword'
            }
        });
        
        var themekeyField = new Ext.ux.form.SuperBoxSelect({
            hideLabel : false,
            minChars : 0,
            queryParam : 'q',
            hideTrigger : false,
            id : 'E_themekey',
            name : 'E_themekey',
            store : themekeyStore,
            valueField : 'value',
            displayField : 'value',
            valueDelimiter : ' or ',
            fieldLabel : OpenLayers.i18n('keyword')
        });

        var catalogueField = GeoNetwork.util.SearchFormTools.getCatalogueField(
                services.getSources, services.logoUrl, true);
        var groupField = GeoNetwork.util.SearchFormTools.getGroupField(
                services.getGroups, true);
        var metadataTypeField = GeoNetwork.util.SearchFormTools
                .getMetadataTypeField(true);
        var categoryField = GeoNetwork.util.SearchFormTools.getCategoryField(
                services.getCategories, '../images/default/category/', true);
        var validField = GeoNetwork.util.SearchFormTools.getValidField(true);
        var spatialTypes = GeoNetwork.util.SearchFormTools
                .getSpatialRepresentationTypeField(null, true);
        var denominatorField = GeoNetwork.util.SearchFormTools
                .getScaleDenominatorField(true);

        // Add hidden fields to be use by quick metadata links from the admin
        // panel (eg. my metadata).
        var ownerField = new Ext.form.TextField({
            name : 'E__owner',
            hidden : true
        });
        var isHarvestedField = new Ext.form.TextField({
            name : 'E__isHarvested',
            hidden : true
        });

        // OEH (Nchan-13062013) - Add title and abstract search fields.
        var titleField = GeoNetwork.util.SearchFormTools.getTitleField();
        var abstractField = GeoNetwork.util.SearchFormTools.getAbstractField();
        
        // OEH (Nchan-13062013) - Customise what fields to display.  
        advancedCriteria.push(
        		titleField,
        		abstractField,
        		themekeyField
        	);

        // Hide or show extra fields after login event
        var adminFields = [ groupField, metadataTypeField, validField ];
        Ext.each(adminFields, function (item) {
            item.setVisible(false);
        });

        catalogue.on('afterLogin', function () {
            Ext.each(adminFields, function (item) {
                item.setVisible(true);
            });
            GeoNetwork.util.SearchFormTools.refreshGroupFieldValues();
        });
        catalogue.on('afterLogout', function () {
            Ext.each(adminFields, function (item) {
                item.setVisible(false);
            });
            GeoNetwork.util.SearchFormTools.refreshGroupFieldValues();
        });

        var hideInspirePanel = catalogue.getInspireInfo().enable === "false";
        var searchCb = function () {
        	var any = Ext.getCmp('searchSuggestion');
        	if (any.getValue() === 'Enter search terms (optional)'){
        		any.setValue('');
        	}
            if (any) {
                if (any.getValue() === OpenLayers.i18n('fullTextSearch')) {
                    any.setValue('');
                }
            }
            catalogue.startRecord = 1; // Reset
            // start
            // record
            search();
            
            setTab('results');
            if (any.getValue() === ''){
        		any.setValue('Enter search terms (optional)');
            }
            
            /// Trigger the onsearch event which update search form state
            Ext.getCmp('searchForm').fireEvent('onsearch');
        };
        // Radio button list under search text box - May 2013, Kalpesh
        var radioGroup = {
            id:'radiogroupID',
            xtype: 'fieldset',
            title: 'Radio Groups',
            height:20,
            width:310,
            layout:'fit',
            style : 'margin-left:288px',
            cls:'FormatRadio',
            items: [{
                xtype: 'radiogroup',
                id:'radiogroup',
                columns:3,
                vertical:false,
                items: [ 
                    {
                    	id:'rd1',
                    	width:92,
                        name: 'E_oehactiontype',
                        boxLabel: 'All results',
                        inputValue: '',  // Blank -- do not filter by this field   
                        checked: true 
                    },
                    {
                    	id: 'rd2', 
                    	width:92,
	                    name: 'E_oehactiontype', 
	                    boxLabel: 'Downloads',
	                    inputValue: 'downloads' // Value expected by the index
	                },
                    {
	                	id: 'rd3',
	                	width:92,
	                	border:1,
	                    name: 'E_oehactiontype',
	                    boxLabel: 'Web services',
	                    inputValue: 'services' // Value expected by the index 
	                     
	                }
                ]
            }]
        };
        
        // Init when panel in advanced search
        var whenAdvItems = GeoNetwork.util.OEH.SearchFormTools.getOehWhen();
        whenAdvItems[0].colspan = 2;
        
        return new GeoNetwork.SearchFormPanel({
            id : 'searchForm',
            stateId: 's',
            bodyStyle : 'text-align: center;',
            width: 890,
            height:480,
            border : false,
            searchBt: null,
            searchCb: searchCb,
            resetBt: null,
            items : [
                    // Simple search form and search buttons
                    {
                        bodyStyle : {
                            'padding-top' : '39px'
                        },
                        layout : {
                            type : 'hbox',
                            pack : 'center',
                            align : 'center'
                        },
                        border : false,
                        width:730,
                        items :[
                                {
                                    html : '<h2>' + 
                                        OpenLayers.i18n('Searchforspatialdataon') + '</h2>',
                                    margins : '5 10 5 10',
                                    border : false
                                },
                                new GeoNetwork.form.OpenSearchSuggestionTextField({
                                    // hideLabel: true,
                                    width : 285,
                                    id: 'searchSuggestion',
                                    height : 40,
                                    minChars : 2,
                                    value : 'Enter search terms (optional)',
                                    hideTrigger : true,
                                    url : catalogue.services.opensearchSuggest,
                                    listeners: {
                                        'Render': function (c) {
                                          c.getEl (). on ('focus', function () {
                                        	  if (c.getValue()==='Enter search terms (optional)') {
                                        			  c.setValue('');
                                        	  }
                                          }, c);
                                          c.getEl (). on ('blur', function () {
                                        	  if (c.getValue()==='') {
                                        			  c.setValue('Enter search terms (optional)');
                                        	  }
                                          }, c);
                                          
                                        }
                                      }/*listeners: {
                                    	'Render': function (c) {
                                            c.getEl (). on ('focus', function () {
                                            	if(this.value == 'Enter search terms (optional)') {
    	                                    		this.value = ''; 
    	                                    	}
                                            }, c);
                                          }
                                    }*/
                                }),
                                new Ext.Button({
                                    text : OpenLayers.i18n('search'),
                                    id : 'searchBt',
                                    margins : '3 5 3 5',
                                    xtype: 'toolbar',
                                    listeners : {
                                        click : searchCb
                                    }
                                }),
                                new Ext.Button({
                                    text : OpenLayers
                                            .i18n('reset'),
                                    tooltip : OpenLayers
                                            .i18n('resetSearchForm'),
                                    // iconCls: 'md-mn-reset',
                                    id : 'resetBt',
                                    margins : '3 5 3 5',
                                    listeners : {
                                        click : function () {
                                            facetsPanel.reset();
                                            Ext.getCmp('searchForm').getForm().reset();
                                        }
                                    }
                                })
                            ]
                    },
                    // Panel with Advanced search, Help and About Links
                                // Radio button list under search text box - May 2013, Kalpesh
                    radioGroup,
                    
					// OEH (Nchan-13062013) - Customized advance search form.
                    {
                        id : 'advSearchTabs',
                        layout : {
                            type : 'hbox',
                            pack : 'center',
                            align : 'left'
                        },
                        maxWidth: 910,
                        height: 320,
                        plain : true,
                        autoHeight : false,
                        border : false,
                        autoScroll : false,
                        visibility:Ext.Element.NONE,
                        items : [
                            {
								layoutConfig : {
									type : 'vbox',
									align : 'stretch',
									pack : 'center'
								},
                                id:'tabs',
								border : false,
                                items : [
                                         // What panel
                                         {
                                             title : OpenLayers.i18n('What'),
                                             id:'WhatPanel',
                                             layout : 'form',
											 bodyStyle : 'padding: 5px; text-align: left;',
                                             items : [
                                                     advancedCriteria
                                                 ]
                                         },
										 {
											layout : 'vbox',
											border : false,
											height: 10
										 },
                                         // Options panel
                                         {
                                             title : OpenLayers.i18n('Options'),
                                             id:'OptionsPanel',
                                             layout : 'form',
											 bodyStyle : 'padding: 5px',
                                             items : [
                                                      optionsForm
                                                 ]
                                         }
                                    ]                            	
                            },
                            // Where panel
                            {
                                title : OpenLayers.i18n('Where'),
                                id:'WherePanel',
                                margins : '0 10 0 10',
                                bodyStyle : 'padding:0px',
                                layout : 'form',
                                items : [ GeoNetwork.util.SearchFormTools
                                        .getSimpleMap(
                                                GeoNetwork.map.BACKGROUND_LAYERS,
                                                GeoNetwork.map.MAP_OPTIONS,
                                                false)
                                ]
                            },
                            {
                            	layout: 'table',
                                layoutConfig: {
									tableAttrs: { 
										style: { 
											width: '100%',
											margin: 0,
											padding: 0
										}
									},
									columns: 1
								},
								border: false,
                                items : [
                                         // When panel
                                         {
                                             title : OpenLayers.i18n('When'),
                                             id:'WhenPanel',
                                             layout: 'table',
                                             layoutConfig: {
             									tableAttrs: { 
             										style: { 
             											width: '100%',
             											margin: 0
             										}
             									},
             									columns: 2
             								},
                                            width: 305,
             								bodyStyle : 'padding: 5px; text-align: left;',
                                            items : [
                                                      	whenAdvItems[0],
                                                      	whenAdvItems[1],
                                                      	{
                                                      		layout: 'form',
                                                      		labelWidth: 30,
                                                      		width: 160,
                                                      		border: false,
                                                      		defaultType : 'datefield',
                                                      		items: whenAdvItems[2]
                                                      	},
                                                      	whenAdvItems[3],
                                                      	{
                                                      		layout: 'form',
                                                      		labelWidth: 30,
                                                      		width: 160,
                                                      		border: false,
                                                      		defaultType : 'datefield',
                                                      		items: whenAdvItems[4]
                                                      	}
                                                      ]
                                         },
                                         {
     										layout : 'vbox',
     										border : false,
     										height: 10
     									 },
                                          // Tips panel
                                          {
                                              title : OpenLayers.i18n('Tips'),
                                              id:'TipsPanel',
                                              width: 305,
                                              bodyStyle : 'padding: 5px; text-align: left;',
                                              html: 'Use * to search on part of a word: <b>park*</b> searches for park, parks and parking.'
                                          }
                                    ]                            	
                            }

                        ]
                    },
                    
                    {
                        layout: {
                            type: "hbox",
                            pack: "center",
                            align: "center"
                        },
                        id: "advSearch",
                        autoScroll: true,
                        border: false,
                        defaults: {
                            bodyStyle: {},
                            margins: "0 10 0 10",
                            border: false
                        },
                        // Show and Hide Advance Option and Change browse tiles position - May 2013, Kalpesh
                        items: [{         
                         id: 'AdvanceImg',
                         xtype: 'button',
                         cls: 'AdvanceImgdown',
                         text:'Show advanced options',
                         width: 150,
                         handler: function()
                         {
                            var display = Ext.fly('advSearchTabs').getStyle('display');
                           //Ext.MessageBox.alert('Status1', 'visible: ' + visible + 'display: ' + display, 'test1');   
                           Ext.get("advSearchTabs").setVisibilityMode(Ext.Element.DISPLAY);
                             if(display == 'block')
                             {        
                                 Ext.get("advSearchTabs").slideOut('t', {
                                    easing: 'easeOut',
                                    duration: .5
                                });
                                 
                                 Ext.get("GNtabs").scale(980,200); 
                                 Ext.fly('AdvanceImg').replaceClass('AdvanceImgup', 'AdvanceImgdown'); 
                                 this.setText("Show advanced options");
                             }
                             else
                             {                             
                               
                            	 Ext.get("advSearchTabs").show();
                               Ext.get("advSearchTabs").slideIn('t', {
                                    easing: 'easeOut',
                                    duration: .5
                                }); 
                               Ext.get("GNtabs").scale(980,520); 
                               Ext.fly('AdvanceImg').replaceClass('AdvanceImgdown', 'AdvanceImgup');
                               this.setText("Hide advanced options");
                             }
                         }
                          
                        }]
                    }
                ]
        });
    }
    
    function done(){
    }

    function search() {
        searching = true;
        catalogue.search('searchForm', app.loadResults, null,
                catalogue.startRecord, true);
    }

    function initPanels() {
        var resultsPanel = Ext.getCmp('resultsPanel');
        if (!resultsPanel.isVisible()) {
            resultsPanel.show();
        }

    }
    /**
     * Bottom bar
     * 
     * @return
     */
    function createBBar() {

        var previousAction = new Ext.Action({
            id : 'previousBt',
            text : '&lt;&lt;',
            handler : function () {
                var from = catalogue.startRecord - parseInt(Ext.getCmp('E_hitsperpage').getValue(), 10);
                if (from > 0) {
                    catalogue.startRecord = from;
                    search();
                }
            },
            scope : this
        });

        var nextAction = new Ext.Action({
            id : 'nextBt',
            text : '&gt;&gt;',
            handler : function () {
                catalogue.startRecord += parseInt(Ext.getCmp('E_hitsperpage')
                        .getValue(), 10);
                search();
            },
            scope : this
        });
//reducing bottom toolbar height - May 2013, Kalpesh
        return new Ext.Toolbar({
            height:45,           
            items : [ previousAction, '|', nextAction, '|', {
                xtype : 'tbtext',
                text : '',
                id : 'info'
            } ]
        });

    }

    /**
     * Results panel layout with top, bottom bar and DataView
     * 
     * @return
     */
    function createResultsPanel(permalinkProvider) {
        metadataResultsView = new GeoNetwork.MetadataResultsView({
            id:'metadataResultsView',
            width:900,
            maxWidth:900,
            catalogue : catalogue,
            displaySerieMembers : true,
            autoScroll : true,
            tpl : GeoNetwork.Templates.FULL
        });

        catalogue.resultsView = metadataResultsView;

        tBar = new GeoNetwork.MetadataResultsToolbar({
         id:'MetadataResultsToolbar',
            width:740,
            maxWidth:740,
            catalogue : catalogue,
            searchBtCmp : Ext.getCmp('searchBt'),
            sortByCmp : Ext.getCmp('E_sortBy'),
            metadataResultsView : metadataResultsView,
            permalinkProvider : permalinkProvider
        });

        bBar = createBBar();

        resultPanel = new Ext.Panel({
            id : 'resultsPanel',
            border : false,
            hidden : true,
            bodyCssClass : 'md-view',
            autoScroll : true,
            header: null,
            tbar : tBar,
            layout : 'fit',
            items : metadataResultsView,
            // paging bar on the bottom
            bbar : bBar
        });

        return resultPanel;
    }
    function loadCallback(el, success, response, options) {

        if (!success) {
            // createMainTagCloud();
            // createLatestUpdate();
//        } else {
            Ext.get('helpPanel').getUpdater().update({
                url : 'help_eng.html'
            });
        }
    }
    /**
     * private: methode[creatAboutPanel] About information panel displayed on
     * load
     * 
     * :return:
     */
    function creatAboutPanel() {
        return new Ext.Panel({
            border : true,
            id : 'infoPanel',
            baseCls : 'md-info',
            autoWidth : true,
            autoLoad : {
                url : catalogue.services.rootUrl + '/about?modal=true',
                callback : loadCallback,
                scope : this,
                loadScripts : true
            }
        });
    }
    /**
     * private: methode[createHelpPanel] Help panel displayed on load
     * 
     * :return:
     */
    function createHelpPanel() {
        return new Ext.Panel({
            border : false,
            frame : false,
            bodyStyle : {
                'background-color' : 'white',
                padding : '5px'
            },
            autoScroll : true,
            baseCls : 'none',
            id : 'helpPanel',
            autoWidth : true,
            autoLoad : {
                url : 'help_' + catalogue.LANG + '.html',
                callback: initShortcut,
                scope : this,
                loadScripts : false
            }
        });
    }

    /**
     * Main tagcloud displayed in the information panel
     * 
     * @return
     */
    function createMainTagCloud() {
        var tagCloudView = new GeoNetwork.TagCloudView({
            catalogue : catalogue,
            query : 'fast=true&summaryOnly=true',
            renderTo : 'tag',
            onSuccess : 'app.loadResults'
        });

        return tagCloudView;
    }
    /**
     * Create latest metadata panel.
     */
    function createLatestUpdate() {
        var latestView = new GeoNetwork.MetadataResultsView({
            id:'latestView',
            catalogue : catalogue,
            autoScroll : true,
            tpl : GeoNetwork.Settings.latestTpl
        });
        var latestStore = GeoNetwork.Settings.mdStore();
        latestView.setStore(latestStore);
        latestStore.on('load', function () {
            Ext.ux.Lightbox.register('a[rel^=lightbox]');
        });
        var p = new Ext.Panel({
            id: 'md-view',
            border : false,
            bodyCssClass : 'md-view',
            items : latestView,
            renderTo : 'latest'
        });
        catalogue.kvpSearch(GeoNetwork.Settings.latestQuery, null, null, null,
                true, latestView.getStore());
    }
    /**
     * Extra tag cloud to displayed current search summary TODO : not really a
     * narrow your search component.
     * 
     * @return
     */
    function createTagCloud() {
        var tagCloudView = new GeoNetwork.TagCloudView({
            catalogue : catalogue
        });

        return new Ext.Panel({
            id : 'tagCloudPanel',
            border : true,
            hidden : true,
            baseCls : 'md-view',
            items : tagCloudView
        });
    }

    function edit(metadataId, create, group, child) {

        if (!this.editorWindow) {
            this.editorPanel = new GeoNetwork.editor.EditorPanel({
                defaultViewMode : GeoNetwork.Settings.editor.defaultViewMode,
                catalogue : catalogue,
                xlinkOptions : {
                    CONTACT : true
                }
            });

            this.editorWindow = new Ext.Window({
                tools : [ {
                    id : 'newwindow',
                    qtip : OpenLayers.i18n('newWindow'),
                    handler : function (e, toolEl, panel, tc) {
                        window.open(GeoNetwork.Util.getBaseUrl(location.href) + "#edit=" + 
                                panel.getComponent('editorPanel').metadataId);
                        panel.hide();
                    },
                    scope : this
                } ],
                title : OpenLayers.i18n('mdEditor'),
                id : 'editorWindow',
                layout : 'fit',
                modal : false,
                items : this.editorPanel,
                collapsible : true,
                collapsed : false,
                maximizable : true,
                maximized : true,
                resizable : true,
                // constrain: true,
                width : 980,
                //height : 800
            });
            this.editorPanel.setContainer(this.editorWindow);
            this.editorPanel.on('editorClosed', function () {
                Ext.getCmp('searchBt').fireEvent('click');
            });
        }
        if (metadataId) {
            this.editorWindow.show();
            this.editorPanel.init(metadataId, create, group, child);
        }
    }
    function createOptionsForm() {
        var hitsPerPage = [ [ '10' ], [ '20' ], [ '50' ], [ '100' ] ], items = [];

        items.push(GeoNetwork.util.OEH.SearchFormTools.getSortByCombo());

        items.push(new Ext.form.ComboBox({
            id : 'E_hitsperpage',
            name : 'E_hitsperpage',
            mode : 'local',
            width: 130,
            triggerAction : 'all',
            fieldLabel : OpenLayers.i18n('hitsPerPage'),
            value : hitsPerPage[1], // Set arbitrarily the second value of the
            // array as the default one.
            store : new Ext.data.ArrayStore({
                id : 0,
                fields : [ 'id' ],
                data : hitsPerPage
            }),
            valueField : 'id',
            displayField : 'id'
        }));

        return items;
    }

    function createHeader() {
        var info = catalogue.getInfo();
        var crumbText ='<span id="crumblabel">You are here: </span> ' +
        	'<a href="http://environment.nsw.gov.au/">Home</a> &gt; <a href="http://www.environment.nsw.gov.au/knowledgecentre.htm">Knowledge centre</a> &gt; ' +
        	'<a href=""> Maps and data</a>';
        Ext.getDom('breadcrumbs').innerHTML = crumbText;
        Ext.getDom('title').innerHTML = '<h1>Maps and data</h1>';
        document.title = info.name;
    }

    // public space:
    return {
        init : function () 
        {
            geonetworkUrl = GeoNetwork.URL || window.location.href.match(
                            /(http.*\/.*)\/apps\/tabsearch.*/, '')[1];

            urlParameters = GeoNetwork.Util.getParameters(location.href);
            var lang = urlParameters.hl || GeoNetwork.Util.defaultLocale;
            
            if (urlParameters.extent) {
                urlParameters.bounds = new OpenLayers.Bounds(
                        urlParameters.extent[0], urlParameters.extent[1],
                        urlParameters.extent[2], urlParameters.extent[3]);
            }
            
            if (urlParameters.wmc) {
               GeoNetwork.map.CONTEXT = urlParameters.wmc;
            }
            if (urlParameters.ows) {
               GeoNetwork.map.OWS = urlParameters.ows;
            }
            
            // Init cookie
            cookie = new Ext.state.CookieProvider({
                expires : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365))
            });

            // set a permalink provider which will be the main state provider.
            var permalinkProvider = new GeoExt.state.PermalinkProvider({
                encodeType : false
            });

            Ext.state.Manager.setProvider(permalinkProvider);

            // Create connexion to the catalogue
            catalogue = new GeoNetwork.Catalogue({
                statusBarId : 'info',
                lang : lang,
                hostUrl : geonetworkUrl,
                width: 740,
                maxWidth: 740,
                mdOverlayedCmpId : 'resultsPanel',
                adminAppUrl : geonetworkUrl + '/srv/' + lang + '/admin',
                // Declare default store to be used for records and
                // summary
                metadataStore : GeoNetwork.Settings.mdStore ? GeoNetwork.Settings
                        .mdStore()
                        : GeoNetwork.data.MetadataResultsStore(),
                metadataCSWStore : GeoNetwork.data
                        .MetadataCSWResultsStore(),
                summaryStore : GeoNetwork.data.MetadataSummaryStore(),
                editMode : 2, // TODO : create constant
                metadataEditFn : edit
            });

            createHeader();

            // Options Panel
            optionsForm = createOptionsForm();

            // Search form
            searchForm = createSearchForm();

            // Top navigation widgets
            // createModeSwitcher();
            //createLanguageSwitcher(lang);
            //createLoginForm();
            edit();

            // Results map
            var resultsMap = getResultsMap();

            // Search result
            resultsPanel = createResultsPanel(permalinkProvider);
            
            tagCloudViewPanel = createTagCloud();

            // Initialize map viewer
            initMap();

            // Register events on the catalogue
            var margins = '0 0 0 0';
            var breadcrumb = new Ext.Panel({
                layout:'column',
                cls: 'breadcrumb',
                renderTo:'breadcrumbs',
                defaultType: 'button',
                border: false,
                split: false
//                layoutConfig: {
//                    columns:3
//                }
            });
            facetsPanel = new GeoNetwork.FacetsPanel({
                searchForm: searchForm,
                breadcrumb: breadcrumb,
                maxDisplayedItems: GeoNetwork.Settings.facetMaxItems || 7,
                facetListConfig: GeoNetwork.Settings.facetListConfig || []
            });
            
            var viewport = new Ext.Viewport({
                layout : 'border',
                id : 'vp',
                items : [ // todo: should add header here?
                          breadcrumb,
                        new Ext.TabPanel(
                        {
                            region : 'center',
                            id : 'GNtabs',
                            boxMaxWidth : 990,
                            width:990,
                            height:200,
                            renderTo: 'GeoNetworkContent',
                            deferredRender : false,
                            plain : true,
                            autoScroll : true,
                            autoSize: false,
                            defaults : {
                                autoScroll : true
                            },
                            margins : '0 0 0 0',
                            border : false,
                            activeTab : 0,
                             listeners: {
                                  tabchange: function(tp,newTab){
                                    var id = newTab.id;
                                    homeContent = Ext.get(FeatureMainContainer);
                                    if (id !='HomePanel') {
                                        homeContent.hide();
                                        Ext.get("GNtabs").scale(980,580);
                                    } else {
                                        homeContent.show();
                                        Ext.get("advSearchTabs").hide();
                                        Ext.get("GNtabs").scale(980,200);
                                    }
                                    if (tabs[0]) {
                                        tabPanel.setActiveTab(tabs[0]);
                                    }
                               }
                               },
                            items : [ 
                                {   // basic search panel
                                    title : OpenLayers.i18n('Search'),
                                    id:'HomePanel',
                                    // contentEl:'dvZoeken',
                                    layout : 'absolute',
                                    height: 200,
                                    width: 990,
                                    maxWidth: 990,
                                    autoSize: true,
                                    closable : false,
                                    autoScroll : true,
                                    items : [ {
                                        id : 'alignCenter',
                                        border : false,
                                        height: 580,
                                        layout : 'hbox',
                                        layoutConfig : {
                                            pack : 'center',
                                            align : 'center'
                                        },
                                        items : [ {
                                        	id:'searchForm',
                                            columnWidth : 0.90,
                                            border : false,
                                            items : [ searchForm ]
                                        } ]
                                    } ]
                                }, 
                                {// search results panel
                                    id : 'results',
                                    title : OpenLayers.i18n('Results'),
                                    autoScroll : false,
                                    layout : 'hbox',
                                    width:990,
                                    maxWidth:990,
                                    height: 580,
                                    autoSize: true,
                                    items : [ {// sidebar searchform
                                        region : 'west',
                                        id : 'west',
                                        border : true,
                                        width : 250,
                                        height: 580,
                                        items : [ resultsMap, facetsPanel  ]
                                    }, {
                                        layout : 'fit',
                                        border : false,
                                        maxWidth : 640,
                                        autoScroll : true,
                                        items : [ resultPanel ]
                                    }
                                    ],
                                    /*
                                     * Hide tab panel until a search is done
                                     * Seem "hidden:true" as in other places
                                     * doesn't work for Tabs, and need to
                                     * use a listener!
                                     * 
                                     * See
                                     * http://www.sencha.com/forum/showthread.php?65441-Starting-A-Tab-Panel-with-a-Hidden-Tab
                                     */
                                    listeners : {
                                        render : function (c) {
                                            c.ownerCt.hideTabStripItem(c);
                                        }
                                    }
                                }
                            ]
                        })
                ]
               
            });
            // Hide advanced search options
            //Ext.get("advSearchTabs").hide();
             Ext.get("FeatureMainContainer").setVisibilityMode(Ext.Element.DISPLAY);
            Ext.get("HomePanel").setVisibilityMode(Ext.Element.DISPLAY);
            Ext.get("results").setVisibilityMode(Ext.Element.DISPLAY);
            Ext.get("advSearchTabs").setVisibilityMode(Ext.Element.DISPLAY);
            Ext.get("advSearchTabs").setDisplayed(false);
            //Ext.get("results").hide();
             //Ext.get("GNtabs").setHeight(200);

            // Ext.getCmp('mapprojectionselector').syncSize();
            // Ext.getCmp('mapprojectionselector').setWidth(130);

            /* Init form field URL according to URL parameters */
            GeoNetwork.util.SearchTools.populateFormFromParams(searchForm,
                    urlParameters);

            /* Trigger search if search is in URL parameters */
            if (urlParameters.search !== undefined) {
                Ext.getCmp('searchBt').fireEvent('click');
            }
            if (urlParameters.edit !== undefined && urlParameters.edit !== '') {
                catalogue.metadataEdit(urlParameters.edit);
            }
            if (urlParameters.create !== undefined) {
                resultPanel.getTopToolbar().createMetadataAction
                        .fireEvent('click');
            }
            if (urlParameters.uuid !== undefined) {
                catalogue.metadataShow(urlParameters.uuid, true);
            } else if (urlParameters.id !== undefined) {
                catalogue.metadataShowById(urlParameters.id, true);
            }

            // FIXME : should be in Search field configuration
            Ext.get('E_any').setWidth(285);
            Ext.get('E_any').setHeight(28);

            metadataResultsView.addMap(Ext.getCmp('resultsMap').map);

            if (GeoNetwork.searchDefault.activeMapControlExtent) {
                Ext.getCmp('geometryMap').setExtent();
            }
            if (urlParameters.bounds) {
                Ext.getCmp('geometryMap').map
                        .zoomToExtent(urlParameters.bounds);
            }

            // resultPanel.setHeight(Ext.getCmp('center').getHeight());

            var events = [ 'afterDelete', 'afterRating', 'afterLogout',
                    'afterLogin' ];
            Ext.each(events, function (e) {
                catalogue.on(e, function () {
                    if (searching === true) {
                        Ext.getCmp('searchBt').fireEvent('click');
                    }

                });
            });

            // Hack to run search after all app is rendered within a sec ...
            // It could have been better to trigger event in
            // SearchFormPanel#applyState
            // FIXME
            if (urlParameters.s_search !== undefined) {
                setTimeout(function () {
                    Ext.getCmp('searchBt').fireEvent('click');
                }, 500);
            }
            
            initShortcut();
        },
        getIMap : function () {
            // init map if not yet initialized
            if (!iMap) {
                initMap();
            }

            // TODO : maybe we should switch to visualization mode also ?
            return iMap;
        },
        getHelpWindow : function () {
            return new Ext.Window({
                title : OpenLayers.i18n('Help'),
                layout : 'fit',
                height : 600,
                width : 600,
                closable : true,
                resizable : true,
                draggable : true,
                items : [ createHelpPanel() ]
            });
        },
        getAboutWindow : function () {
            return new Ext.Window({
                title : OpenLayers.i18n('About'),
                layout : 'fit',
                height : 600,
                width : 600,
                closable : true,
                resizable : true,
                draggable : true,
                items : [ creatAboutPanel() ]
            });
        },
        getCatalogue : function () {
            return catalogue;
        },
        getMetadataResultsView : function () {
            return metadataResultsView;
        },
        /**
         * Do layout
         * 
         * @param response
         * @return
         */
        loadResults : function (response) {
            // Show "List results" panel
            var tabPanel = Ext.getCmp("GNtabs");
            tabPanel.unhideTabStripItem(tabPanel.items.itemAt(1));

            initPanels();
            facetsPanel.refresh(response);

            // FIXME : result panel need to update layout in case of slider
            // Ext.getCmp('resultsPanel').syncSize();

            Ext.getCmp('previousBt').setDisabled(catalogue.startRecord === 1);
            Ext.getCmp('nextBt').setDisabled(
                    catalogue.startRecord + parseInt(Ext.getCmp('E_hitsperpage').getValue(),
                                    10) > catalogue.metadataStore.totalLength);
            if (Ext.getCmp('E_sortBy').getValue()) {
                Ext.getCmp('sortByToolBar').setValue(
                        Ext.getCmp('E_sortBy').getValue() + "#" + Ext.getCmp('sortOrder').getValue());

            } else {
                Ext.getCmp('sortByToolBar').setValue(
                        Ext.getCmp('E_sortBy').getValue());
            }

            // Fix for width sortBy combo in toolbar
            // See this:
            // http://www.sencha.com/forum/showthread.php?122454-TabPanel-deferred-render-false-nested-toolbar-layout-problem
            Ext.getCmp('sortByToolBar').syncSize();
            Ext.getCmp('sortByToolBar').setWidth(130);
            //resultsPanel.setWidth(990);
            resultsPanel.syncSize();

            Ext.ux.Lightbox.register('a[rel^=lightbox]');
        },
        /**
         * Activate map tab
         */
        switchMode : function () {
            setTab('map');
        }
    };
};

Ext.onReady(function () {
    var lang = /hl=([a-z]{3})/.exec(location.href);
    GeoNetwork.Util.setLang(lang && lang[1], '..');

    Ext.QuickTips.init();
    setTimeout(function () {
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({
            remove : true
        });
    }, 250);

    app = new GeoNetwork.app();
    app.init();
    catalogue = app.getCatalogue();

    // overwrite default detail-click action
    catalogue.metadataShow = function (uuid) {
        var tabPanel = Ext.getCmp("GNtabs"), 
             tabs = tabPanel.find('id', uuid);
        
        if (tabs[0]) {
            tabPanel.setActiveTab(tabs[0]);
        } else {
            // Retrieve information in synchrone mode todo: this doesn't work
        	//HERE: result tab
            // here
            var store = GeoNetwork.data.MetadataResultsFastStore();
            catalogue.kvpSearch("fast=index&uuid=" + uuid, null, null, null,
                    true, store, null, false);
            var record = store.getAt(store.find('uuid', uuid));
            var showFeedBackButton = record.get('email');
            var RowTitle = uuid;

            try {
                RowTitle = record.data.title;
            } catch (e) {
            }
            var RowLabel = RowTitle;
            if (RowLabel.length > 18) {
                RowLabel = RowLabel.substr(0, 17) + "...";
            }
            
            var aResTab = new GeoNetwork.view.ViewPanel({
                id:'aResTab',
                serviceUrl : catalogue.services.mdView + '?uuid=' + uuid,
                lang : catalogue.lang,
                autoScroll : true,
                resultsView : app.getMetadataResultsView(),
                layout : 'absolute',
                width:990,
                maxWidth:990,
                height: 550, // Was 580. Reduced to fix truncation of content in metadata tab. - JD
                layout : 'fit',
                // autoHeight:true,
                padding : '5px 0px 0px 25px',
                currTab : GeoNetwork.defaultViewMode || 'simple',
                printDefaultForTabs : GeoNetwork.printDefaultForTabs || false,
                catalogue : catalogue,
                // maximized: true,
                metadataUuid : uuid,
                showFeedBackButton: showFeedBackButton,
                record : record
            });

            // Override zoomToAction (maye better way?). TODO: Check as seem
            // calling old handler code
            aResTab.actionMenu.zoomToAction.setHandler(function () {
                var uuid = this.record.get('uuid');
                this.resultsView.zoomTo(uuid);

                // Custom code to display Map tab
                tabPanel.setActiveTab(tabPanel.items.itemAt(2));
            }, aResTab.actionMenu);

            aResTab.actionMenu.viewAction.hide();

            tabPanel.add({
                title : RowLabel,
                tabTip : RowTitle,
                iconCls : 'tabs',
                id : uuid,
                closable : true,
                items : [ aResTab ]
            }).show();
        }
    };
});
