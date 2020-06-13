const {app,ipcMain,BrowserWindow} = require('electron')
const path = require('path')

var options
var selection;

function launchProgramBrowser(window,options,callback){
  console.log()
  let programBrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent:options.select?window:null,
    modal:!!options.select,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule:true
    }
  })

  programBrowserWindow.on('closed', () => {
      programBrowserWindow = null
      callback();
  })
  // and load the index.html of the app.
  programBrowserWindow.loadFile(path.join(__dirname, 'index.html'))


   programBrowserWindow.webContents.openDevTools()
}


// Called by the dialog box to get its parameters

ipcMain.on("openProgramBrowser", (event, data) => {
    event.returnValue = options
})

// Called by the dialog box when closed

ipcMain.on("closeProgramBrowser", (event, data) => {
  selection = data
})

// Called by the application to open the prompt dialog
ipcMain.on("launchProgramBrowser",  (event, data) => {
  options = data || {}
  launchProgramBrowser(BrowserWindow.fromWebContents(event.sender),options,
  function() {
    event.returnValue = selection
  })
})
