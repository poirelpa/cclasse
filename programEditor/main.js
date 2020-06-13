const {app,ipcMain,BrowserWindow} = require('electron')
const path = require('path')


function launchProgramEditor(){

  const programEditorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      //nodeIntegration: true
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule:true
    }
  })
  // and load the index.html of the app.
  programEditorWindow.loadFile(path.join(__dirname, 'index.html'))


   // programEditorWindow.webContents.openDevTools()
}


ipcMain.on("launchProgramEditor",  (event, data) => {
	launchProgramEditor()
})
