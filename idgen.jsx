var originalUnit = app.preferences.rulerUnits;
app.preferences.ruleUnits = Units.PIXELS;

//open file paths
var filepath = Folder.selectDialog("Select the folder where ID.psd, pictures and names.txt are:")
var savepath = Folder.selectDialog("Select the folder where to save images:")

var maxWidth = 2626 //maxwidth for name text
var horizonScale = 100 //percentage of horizontal scale

var fileRef = File(filepath + "/ID.psd");
var docRef = app.open(fileRef);

/*
docRef.layers[1].name = "IDName"
docRef.layers[3].name = "IDNum"
docRef.layers[4].name = "Contact"
docRef.layers[4].name = "Email";
*/

//reference the PSD's layers
var nameRef = docRef.layers.getByName("IDName").textItem;
var nameWidth = getNameWidth();
var numRef = docRef.layers.getByName("IDNum").textItem;
var emailRef = docRef.layers.getByName("Email").textItem;
var contactRef = docRef.layers.getByName("Contact").textItem;
var newPhotoFmt = docRef.layers.getByName("PhotoFormat");

//specify save options
var jpgSaveOpt = new JPEGSaveOptions();
jpgSaveOpt.quality = 12;
jpgSaveOpt.embedColorProfile = true;
jpgSaveOpt.formatOptions = FormatOptions.STANDARDBASELINE;
jpgSaveOpt.matte = MatteType.NONE;


// open text files- READONLY
var txtNameFile = File(filepath + "/names.txt");
txtNameFile.open('r');

var txtContactFile = File(filepath + "/contacts.txt");
txtContactFile.open('r');

var txtEmailFile = File(filepath + "/emails.txt");
txtEmailFile.open('r');

var txtIdNumFile = File(filepath + "/idnums.txt");
txtIdNumFile.open('r');
//loop for processing image
while(!txtNameFile.eof){
	horizonScale = 100;
	newPhotoFmt.visible = true;
	nameRef.horizontalScale = horizonScale;
	emailRef.horizontalScale = horizonScale;
	
	
	//reads text files
	var txtName =  txtNameFile.readln();
	nameRef.contents = txtName;
	
	var txtContact = txtContactFile.readln();
	contactRef.contents = txtContact;
	
	var txtEmail = txtEmailFile.readln();
	if (txtContact == "") {
		contactRef.contents = txtEmail;
		emailRef.contents = "";
	}
	else
		emailRef.contents = txtEmail;
	
	var txtIdNum = txtIdNumFile.readln();
	numRef.contents = txtIdNum;
	
	//specify save path
	jpgFile = new File(savepath + "/" + txtName + ".jpeg");
	
	//resize font size if width exceeds - name layer
	nameWidth = getNameWidth();
	while (nameWidth > maxWidth) {
		horizonScale--;
		nameRef.horizontalScale = horizonScale;
		nameWidth = getNameWidth();
	}
	horizonScale = 100;
	
	//resize for email
	emailWidth = getEmailWidth();
	while(emailWidth > maxWidth) {
		horizonScale--;
		emailRef.horizontalScale = horizonScale;
		emailWidth = getEmailWidth();
	}


	//try if file exists if not specify image
try {
		//change txtName spaces to underscore
		var picName = changeNameToJPEGName(txtName);
		changePhoto(filepath + "/" +picName +  ".jpg");
	}
catch(e) {
		try {
			changePhoto(filepath + "/" + txtName + ".jpg");
		}
		catch(e) {
			try {
				alert("ERROR " + txtName + "'s PHOTO NOT FOUND! Please specify the location.");
				picName = File.openDialog(txtName + "'s Photo", "JPEG : *.jpg");
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


function changePhoto(photoName) {
	//opens the new photo
	var fileRef2 = File(photoName);
	var newPicRef = app.open(fileRef2);
	
	newPicRef.selection.selectAll();
	newPicRef.selection.copy();
	newPicRef.close(SaveOptions.DONOTSAVECHANGES);
	
	app.activeDocument = docRef;
	docRef.activeLayer = newPhotoFmt;
	
	docRef.paste();
	docRef.activeLayer.name = "Photo";
	var newPhoto = docRef.layers.getByName("Photo");
	
	copyLayerStyle(newPhotoFmt, newPhoto);
	//get photoformat's location
	var pfmtX = newPhotoFmt.bounds[0];
	var pfmtY = newPhotoFmt.bounds[1];
	//get new photo's location
	var photoX = newPhoto.bounds[0];
	var photoY = newPhoto.bounds[1];

	//move newPhoto to photoFormats location
	newPhoto.translate(pfmtX - photoX, pfmtY - photoY);
	
	newPhotoFmt.visible = false;
	
	//save the file
	docRef.saveAs(jpgFile,jpgSaveOpt,true, Extension.LOWERCASE);
	newPhoto.remove();
	
};

//replaces text to underscore
function changeNameToJPEGName(text) {
		var jpgName = text.replace(",", "");
		while(jpgName.indexOf(" ") != -1) {
			jpgName = jpgName.replace(" ", "_");
		}
		return jpgName;
};

//get name width
function getNameWidth() {
		return docRef.layers.getByName ("IDName").bounds[2];
	
} ;

function getEmailWidth() {
		return docRef.layers.getByName("Email").bounds[2];
}
//copy layer style
function copyLayerStyle(layer1, layer2) {
	
		app.activeDocument.activeLayer = layer1;
		var id157 = charIDToTypeID("CpFX");
		executeAction(id157, undefined, DialogModes.ALL);
		app,activeDocument.activeLayer = layer2;
		var id158 = charIDToTypeID("PaFX");
		executeAction(id158, undefined, DialogModes.ALL);
	
	
};