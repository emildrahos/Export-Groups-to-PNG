// Skript pro exportovani Skupin oznacenych ".png" na konci do samostatnych PNG souboru
// "Export assetu"
// Skript exportuje pouze skupiny. Nikoliv samostatne vrstvy!
// v_2
// ED
// 11. 3. 2016
// ---------
// Based on:
// (C) Mirko Hänßgen, 08.01.2014
// Exporting Nested Layersets
// ---------

// exportCurrentLayer - funkce exportuje vsechny vrstvy do samostatnych png souboru
// kazde vrstve nastavi visibility na true a po exportu je vrati na false
function exportCurrentLayer(arrlayer, filePathToOriginal)
{   
    var opts = new ExportOptionsSaveForWeb()
    opts.format = SaveDocumentType.PNG
    opts.PNG8 = false
    opts.quality = 100

    for (var lvi = 0; lvi < docRef.artLayers.length; lvi++)
    {
        //vypnuti vsech ostatnich artLayers v rootu
        workingFile.artLayers[lvi].visible = false
    }
    for (var lvi = 0; lvi < arrlayer.length; lvi++)
    {
        // vypnuti visibility vsech vrstev ktere jsou v poli arrlayer
        arrlayer[lvi].visible = false
    }

    for (var lvi = 0; lvi < arrlayer.length; lvi++)
    {
        arrlayer[lvi].visible = true
        var fileexport = new File (filePathToOriginal + "/" + (arrlayer[lvi].name))
        activeDocument.exportDocument(fileexport, ExportType.SAVEFORWEB, opts)
        arrlayer[lvi].visible = false            
    }
}

// getNestedLayers - funkce vytvori sezname vrstev ktere se maji exportovat
function getNestedLayers(lsroot, arrlayer)
{
    var layerName = ""
    var isLayerForExport = ""
    
    for (var lvi = lsroot.length-1; lvi > -1; lvi--)
    {
        layerName = lsroot[lvi].name
        isLayerForExport = layerName.substr((layerName.length - 4), layerName.length)
        
        if (isLayerForExport === ".png"){
            arrlayer.push(lsroot[lvi])
            }
        //pokud group NENI .png a zaroven obsahuje artLayers tak se artLayers vypnou
        if ((isLayerForExport !== ".png") && (lsroot[lvi].artLayers.length > 0)){
                for (i = 0; i < lsroot[lvi].artLayers.length; i += 1){
                    lsroot[lvi].artLayers[i].visible = false
                    }
            }
        //pokud group NENI .png a zaroven obsahuje dalsi groups then >>>, POKUD ALE JE PNG TAK SE NA JEJI PODSLOZKY NESAHA
        if ((lsroot[lvi].layerSets.length > 0) && (isLayerForExport !== ".png")){
            lsroot[lvi].visible = true
            getNestedLayers(lsroot[lvi].layerSets, arrlayer)
            } 
    }//end of for
}//end of getNestedLayers

// --------------- MAIN ---------------- //
app.bringToFront()

// Update all modified content
var idplacedLayerUpdateAllModified = stringIDToTypeID( "placedLayerUpdateAllModified" )
executeAction( idplacedLayerUpdateAllModified, undefined, DialogModes.NO )

//turn dialogs OFF
displayDialogs = DialogModes.NO

var docRef = app.activeDocument
var filePathToOriginal = docRef.path //reference na cestu souboru

var workingFile = docRef.duplicate() //vytvoreni pracovniho duplikatu

//deklarace noveho pole do ktereho se nactou ref na layerSety s .png na konci
arrlayer = new Array()
//vytvorit seznam vrstev pro export
getNestedLayers(app.activeDocument.layerSets, arrlayer)
//exportovat vybrane vrstvy do PNG
exportCurrentLayer(arrlayer, filePathToOriginal)

//zavrit duplikovany pracovni soubor bez ulozeni zmen
workingFile.close(SaveOptions.DONOTSAVECHANGES)

docRef = null;
workingFile = null;

app.activeDocument.close(SaveOptions.DONOTSAVECHANGES) //Save and close


//turn dialogs back ON
displayDialogs = DialogModes.ALL

//NO DIALOGS IN THIS VERSION - Meant for running via action on multiple files
//alert("Layers exported: " + arrlayer.length)
