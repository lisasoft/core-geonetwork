/**
 * 
 */

Ext.namespace("GeoNetwork.util.OEH");

/** api: (define)
 *  module = GeoNetwork.util
 *  class = SearchFormTools
 */
/** api: example
 *  SearchFormTools help to quickly create simple or advanced form
 *  or any GeoNetwork default search fields.
 *
 *
 *  .. code-block:: javascript
 *
 *      searchForm = new Ext.FormPanel({
 *                items : GeoNetwork.SearchFormTools.getAdvancedFormFields(catalogue.services),
 *               ...
 *
 *  TODO : Add distributed search
 *
 */
GeoNetwork.util.OEH.SearchFormTools = {
	    getOehWhen: function(){
			
	    	function resetForm(ck, checked) {
				if (checked) {
					ck.ownerCt.items.each(function(item, index, length){
						if (item.getXType() === 'panel') {
							var panelItems = item.items.items;
							for ( var i = 0; i < panelItems.length; i++) {
								var panelItem = panelItems[i];
								if (panelItem.getXType() === 'datefield') {
									panelItem.setValue('');
									panelItem.disable();
								}								
							}
						}
						
						if (item.getXType() === 'radio') {
							if (item.name != ck.name) {
								item.setValue(false);
							}
						}
					});
				}
	    	}
	    	
			function enableDates(toId, fromId, checked) {
				if (checked) {
					Ext.getCmp(toId).enable();
					Ext.getCmp(fromId).enable();
				}
			}
			
			function setDateRangeLayout(fields) {
				// From field
				setDateFieldLayout(fields[0]);
				fields[0].fieldLabel = 'from';
				// To field
				setDateFieldLayout(fields[1]);
				fields[1].fieldLabel = 'to';
			}
			
			function setDateFieldLayout(field) {
				field.disabled = true;
				field.labelStyle = 'text-align: right;';
				field.labelSeparator = '';
			}
			
	        var anyTime = new Ext.form.Radio({
	            name: 'timeType',
	            checked: true,
				hideLabel: true,
	            boxLabel: OpenLayers.i18n('anyTime'),
	            handler: function(ck, checked){
	            	resetForm(ck, checked);
	            }
	        });
	        
	        var temporalExtent = new Ext.form.Radio({
	            name: 'temporalExtent',
	            checked: false,
				hideLabel: true,
				boxLabel: 'Data Extent:',
	            handler: function(ck, checked){
	            	resetForm(ck, checked);
					enableDates('extTo', 'extFrom', checked);
	            }
	        });
	        
			var temporalExtentDates = GeoNetwork.util.SearchFormTools.getTemporalExtentField(anyTime);
			setDateRangeLayout(temporalExtentDates);
			
	        var metadataChange = new Ext.form.Radio({
	            name: 'metadataChange',
	            checked: false,
				hideLabel: true,
				boxLabel: 'Metadata Changed:',
	            handler: function(ck, checked){
	            	resetForm(ck, checked);
					enableDates('revisionDateTo', 'revisionDateFrom', checked);
	            }
	        });
		
			var metadataChangeDates = GeoNetwork.util.SearchFormTools.getModificationDateField(anyTime);
			setDateRangeLayout(metadataChangeDates);
			
		var items = [
			anyTime,
			temporalExtent,
			temporalExtentDates,
			metadataChange,
			metadataChangeDates
		];
		
	    return items;
	        
	    },
	    /** api:method[getSortByCombo]
	     *  
	     *  :param defaultValue: Default value for sorting. Default is relevance.
	     *  
	     *  Return a combo box with sort options
	     */
	    getSortByCombo: function(defaultValue){
	        var store = GeoNetwork.util.SearchFormTools.getSortByStore();
	        var combo = new Ext.form.ComboBox({
	        	width: 130,
	            mode: 'local',
	            fieldLabel: OpenLayers.i18n('sortBy'),
	            triggerAction: 'all',
	            store: store,
	            valueField: 'id',
	            displayField: 'name',
	            listeners: {
	                change: function(cb, newValue, oldValue){
	                    /* Adapt sort order according to sort field */
	                   var tokens = newValue.split('#');
	                   sortByField.setValue(tokens[0]);
	                   sortOrderField.setValue(tokens[1]);
	                }
	            }
	        });
	        var sortByField = new Ext.form.TextField({
	            name: 'E_sortBy',
	            id: 'E_sortBy',
	            inputType: 'hidden',
	            linkedCombo: combo
	        });
	        var sortOrderField = new Ext.form.TextField({
	            name: 'E_sortOrder',
	            id: 'sortOrder',
	            inputType: 'hidden',
	            linkedCombo: combo
	        });
	        combo.setValue(defaultValue || 'relevance#');
	        return [sortByField, sortOrderField, combo];
	    }
}

