const {app,ipcMain,BrowserWindow} = require('electron')
const path = require('path')

var options
var returnValue
var parentWebContents

function launch(window,options,callback){

  let window_ = new BrowserWindow({
    width: 800,
    height: 600,
    parent:options?window:null,
    modal:!!options,
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
  //https://github.com/electron/electron/issues/10616
  window_.on('close', e => window.setAlwaysOnTop(true))
  window_.on('closed', e => window.setAlwaysOnTop(false))
  // and load the index.html of the app.
  window_.loadFile(path.join(__dirname, 'index.html'))


   window_.webContents.openDevTools()
}


ipcMain.on('openTimeTableEditor', (event, data) => {
    event.returnValue = options
})

// Called by the dialog box when closed

ipcMain.on('closeTimeTableEditor', (event, data) => {
  returnValue = data
})

// Called by the application to open the prompt dialog
ipcMain.on('launchTimeTableEditor',  (event, data) => {
  options = data || {}
  parentWebContents = event.sender
  launch(BrowserWindow.fromWebContents(event.sender),options,
  function() {
    event.returnValue = returnValue
  })
})
ipcMain.on('updateTimeTable',  (event, data) => {
  if(parentWebContents)
    parentWebContents.send('updateTimeTable',data)
})
ipcMain.on('saveClass',  (event, data) => {
  if(parentWebContents)
    parentWebContents.send('saveClass',data)
})
