Ext.namespace('GeoNetwork');
function GetID(ID) {

    var x = document.getElementById('E_any');

    // var a = document.getElementById(ID); // if passing id then enable this and disable the next line 
    var a = ID;

    // use below if passing ID
   // x.value = a.innerText || a.textContent;

   // alert(x.value);
    // passing text
    
    x.value = a;
    
    if (navigator.appName == 'Microsoft Internet Explorer') {

        var y = document.getElementById('searchBt');
        y.click();

    }
    else {
        var z = document.getElementById('searchBt');

        z.click();

        
    }
    // x.value = "";

}


Ext.onReady(function () {
    var x = Ext.getCmp("rd1");

    // radio button tooltip position - May 2013, Kalpesh
    var rd1_xy = Ext.getCmp("rd1").getPosition();
    var rd1_x = rd1_xy[0] + 25;
    var rd1_y = rd1_xy[1] + 30;

    var rd2_xy = Ext.getCmp("rd2").getPosition();
    var rd2_x = rd2_xy[0] + 10;
    var rd2_y = rd2_xy[1] + 30;

    var rd3_xy = Ext.getCmp("rd3").getPosition();
    var rd3_x = rd3_xy[0] + 10;
    var rd3_y = rd3_xy[1] + 30;

    //Ext.MessageBox.alert('status', rd3_x + ':' + rd3_y, 'test1');

    // radio button tooltip - May 2013, Kalpesh
    
    new Ext.ToolTip({
        target: 'x-form-el-rd1',
        anchor: 'top',
        //title: 'Mouse Track',
        // width: 200,
        html: 'Search for downloads and web services.',
        trackMouse: true,
        getTargetXY: function () {
            return [rd1_x, rd1_y];
        }
    });
    new Ext.ToolTip({
        target: 'x-form-el-rd2',
        anchor: 'top',
        // title: 'Mouse Track',
        trackMouse: true,
        html: 'Search for data downloads: shapefiles and GeoTIFFs for GIS software and spreadsheets for Microsoft Excel and LibreOffice.',
        getTargetXY: function () {
            return [rd2_x, rd2_y];
        }

    });

    new Ext.ToolTip({
        target: 'x-form-el-rd3',
        anchor: 'top',
        html: 'Search for spatial web services: Web Map Services (WMS) for GIS, KML for Google Earth and REST (JSON, SOAP) for developers.',
        trackMouse: true,
        // title: 'My Tip Title',
        // autoHide: false,
        // closable: true,
        //draggable: true,
        getTargetXY: function () {
            return [rd3_x, rd3_y];
        }
    });


    Ext.QuickTips.init();



});