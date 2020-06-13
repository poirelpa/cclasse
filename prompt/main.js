const {app,ipcMain,BrowserWindow} = require('electron')
const path = require('path')
var promptWindow;
var promptOptions
var promptAnswer;

// Creating the dialog

function promptModal(parent, options, callback) {
  promptOptions = options;
  promptWindow = new BrowserWindow({
    width:360, height: 120,
    'parent': parent,
    'show': false,
    'modal': true,
    'alwaysOnTop' : true,
    'title' : options.title,
    'autoHideMenuBar': true,
    'webPreferences' : {
      "nodeIntegration":true,
      "sandbox" : false
    }
  });
  promptWindow.on('closed', () => {
    promptWindow = null
    callback(promptAnswer);
  })

  // Load the HTML dialog box
  promptWindow.loadURL(path.join(__dirname, "prompt.html"))
  promptWindow.once('ready-to-show', () => {
    promptWindow.show()
  })
}

// Called by the dialog box to get its parameters

ipcMain.on("openDialog", (event, data) => {
    event.returnValue = JSON.stringify(promptOptions, null, '')
})

// Called by the dialog box when closed

ipcMain.on("closeDialog", (event, data) => {
  promptAnswer = data
})

// Called by the application to open the prompt dialog

ipcMain.on("prompt",  (event, data) => {
	promptModal(BrowserWindow.fromWebContents(event.sender), {
	    "title":data.title,
	    "label":data.message,
	    "value":data.value,
	    "ok": "ok"
	    },
	    function(data) {
        event.returnValue = data
      }
    );
});
