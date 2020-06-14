const {app,ipcMain,BrowserWindow} = require('electron')
const path = require('path')

var options
var result;

// adapted from https://www.scriptol.com/javascript/electron-prompt.php

// Creating the dialog

function promptModal(parent, options, callback) {

  promptWindow = new BrowserWindow({
    width:200, height: 120,
    'parent': parent,
    'modal': true,
    'title' : options.title,
    'autoHideMenuBar': true,
    'webPreferences' : {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule:true
    }
  });
  result=null
  promptWindow.on('closed', () => {
    promptWindow = null
    callback();
  })

  // Load the HTML dialog box
  promptWindow.loadFile(path.join(__dirname, "prompt.html"))


  //promptWindow.webContents.openDevTools()
}

// Called by the dialog box to get its parameters

ipcMain.on("openPrompt", (event, data) => {
    event.returnValue = options
})

// Called by the dialog box when closed

ipcMain.on("closePrompt", (event, data) => {
  result = data
})

// Called by the application to open the prompt dialog

ipcMain.on("prompt",  (event, data) => {
  options = data || {}
	promptModal(BrowserWindow.fromWebContents(event.sender), options,
	    function() {
        event.returnValue = result
      }
    );
});
