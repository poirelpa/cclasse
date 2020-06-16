const {app,ipcMain,BrowserWindow} = require('electron')
const path = require('path')

var options
var returnValue

function launch(window,options,callback){

  let window_ = new BrowserWindow({
    width: 800,
    height: 600,
    parent:options.select?window:null,
    modal:!!options.select,
    alwaysOnTop : true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule:true
    },
    icon:path.join(__dirname, '../cc.ico')
  })

  window_.on('closed', () => {
      window_ = null
      callback();
  })
  // and load the index.html of the app.
  window_.loadFile(path.join(__dirname, 'index.html'))


   window_.webContents.openDevTools()
}


ipcMain.on("openTimeTableEditor", (event, data) => {
    event.returnValue = options
})

// Called by the dialog box when closed

ipcMain.on("closeTimeTableEditor", (event, data) => {
  returnValue = data
})

// Called by the application to open the prompt dialog
ipcMain.on("launchTimeTableEditor",  (event, data) => {
  options = data || {}
  launch(BrowserWindow.fromWebContents(event.sender),options,
  function() {
    event.returnValue = returnValue
  })
})
