var originalUnit = app.preferences.rulerUnits;
app.preferences.ruleUnits = Units.PIXELS;

/*PUT THE SETTINGS HERE*/

//Layer Names
var NAME = "IDName";
var IDNUM = "IDNum";
var EMAIL = "Email";
var CONTACT = "Contact";
var PHOTOFORMAT = "PhotoFormat";
var MEMBERTYPE = "MemberType";
var TOBERESIZED = new Array(NAME, EMAIL, MEMBERTYPE);

var maxWidth = 2626; //maxwidth for name text
var horizonPercent = 100; //percentage of horizontal scale

//open file paths
var filepath = Folder.selectDialog("Select the folder where ID.psd, pictures and names.txt are:");
var savepath = Folder.selectDialog("Select the folder where to save images:");

//references the PSD File
var fileRef = File(filepath + "/ID.psd");
var docRef = app.open(fileRef);

//reference the PSD's layers
var nameRef = docRef.layers.getByName(NAME).textItem;
var numRef = docRef.layers.getByName(IDNUM).textItem;
var emailRef = docRef.layers.getByName(EMAIL).textItem;
var contactRef = docRef.layers.getByName(CONTACT).textItem;
var PhotoFmt = docRef.layers.getByName(PHOTOFORMAT);
var memberType = docRef.layers.getByName(MEMBERTYPE).textItem;

//specify save options
var jpgSaveOpt = new JPEGSaveOptions();
jpgSaveOpt.quality = 12;
jpgSaveOpt.embedColorProfile = true;
jpgSaveOpt.formatOptions = FormatOptions.STANDARDBASELINE;
jpgSaveOpt.matte = MatteType.NONE;

/*END OF SETTINGS */

function changePhoto(photoName) {
	//opens the new photo
	var fileRef2 = File(photoName);
	var newPicRef = app.open(fileRef2);
	
	newPicRef.selection.selectAll();
	newPicRef.selection.copy();
	newPicRef.close(SaveOptions.DONOTSAVECHANGES);
	
	app.activeDocument = docRef;
	docRef.activeLayer = PhotoFmt;
	
	docRef.paste();
	docRef.activeLayer.name = "Photo";
	var newPhoto = docRef.layers.getByName("Photo");
	
	copyLayerStyle(PhotoFmt, newPhoto);
	//get photoformat's location
	var pfmtX = PhotoFmt.bounds[0];
	var pfmtY = PhotoFmt.bounds[1];
	//get new photo's location
	var photoX = newPhoto.bounds[0];
	var photoY = newPhoto.bounds[1];

	//move newPhoto to photoFormats location
	newPhoto.translate(pfmtX - photoX, pfmtY - photoY);
	
	PhotoFmt.visible = false;
	
	//save the file
	docRef.saveAs(jpgFile,jpgSaveOpt,true, Extension.LOWERCASE);
	newPhoto.remove();
	
}

//replaces text to underscore
function changeNameToJPEGName(text) {
	var jpgName = text.replace(",", "");
	while(jpgName.indexOf(" ") != -1) {
		jpgName = jpgName.replace(" ", "_");
	}
	return jpgName;
}

function removeQuote(text) {
    while(text.indexOf('"') != -1) {
	    text = text.replace('"', "");	
	}
    return text;
}

function getWidth(layername) {
	return docRef.layers.getByName(layername).bounds[2];
}

function adjustWidth(layername,maxWidth) {
		var horizonPercent = 100;
		var layer = docRef.layers.getByName(layername).textItem;
		layer.horizontalScale = horizonPercent;
		var layerWidth = getWidth(layername);
		while(layerWidth > maxWidth) {
			horizonPercent--;
			layer.horizontalScale = horizonPercent;
			layerWidth = getWidth(layername);
		}
}
//copy layer style
function copyLayerStyle(layer1, layer2) {
	
	app.activeDocument.activeLayer = layer1;
	var id157 = charIDToTypeID("CpFX");
	executeAction(id157, undefined, DialogModes.ALL);
	app.activeDocument.activeLayer = layer2;
	var id158 = charIDToTypeID("PaFX");
	executeAction(id158, undefined, DialogModes.ALL);
	
}

// open text files- READONLY
var txtMemberList = new File(filepath + "/memberlist.txt");
txtMemberList.open('r');

//loop for processing image
var memInfo = new Array();
while(!txtMemberList.eof){
	PhotoFmt.visible = true;

	//reads text files and put text in layers content
	var memberList = txtMemberList.readln().split("\t");
	
	for(var i = 0; i < memberList.length ; i++)
		memberList[i] = removeQuote(memberList[i]);
	
	memInfo[NAME] = memberList[0];
	memInfo[MEMBERTYPE] = memberList[1];
	memInfo[IDNUM] = memberList[2];
	memInfo[CONTACT]  = memberList[3];
	memInfo[EMAIL]  = memberList[4];
	
	nameRef.contents = memInfo[NAME];

	memberType.contents = memInfo[MEMBERTYPE] == "" || memInfo[MEMBERTYPE].toLowerCase() == "member" ? "Member" :  memInfo[MEMBERTYPE];
	
	numRef.contents = memInfo[IDNUM];
	contactRef.contents = memInfo[CONTACT];
	
	if (memInfo[CONTACT] == "") {
		contactRef.contents = memInfo[EMAIL];
		emailRef.contents = "";
	}
	else
		emailRef.contents = memInfo[EMAIL];
	
	//resizes specified layers in the array TOBERESIZED
	for(var i = 0; i < TOBERESIZED.length; i ++) {
		adjustWidth(TOBERESIZED[i], maxWidth);
	}

	//specify save path
	var jpgFile = new File(savepath + "/" + memInfo[NAME] + ".jpeg");
	
	//try if file name with underscore exists if not try normal image name
	try {
			//change memInfo[NAME] spaces to underscore
			var picName = changeNameToJPEGName(memInfo[NAME]);
			changePhoto(filepath + "/" +picName +  ".jpg");
	}
	catch(e) {
	    //if image name not found specify photo
		try {
			changePhoto(filepath + "/" + memInfo[NAME] + ".jpg");
		}
		catch(e) {
			
			try {
				alert("ERROR " + memInfo[NAME] + "'s PHOTO NOT FOUND! Please specify the location.");
				picName = File.openDialog(memInfo[NAME] + "'s Photo", "JPEG : *.jpg");
				changePhoto(picName);
				}
			catch(e) {
				docRef.saveAs(jpgFile,jpgSaveOpt,true, Extension.LOWERCASE);
			}
		}
	}
}

app.preferences.rulerUnits = originalUnit;

alert("FINISHED!!");