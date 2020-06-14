// Modules to control application life and create native browser window
const {app, BrowserWindow,Menu} = require('electron')
const path = require('path')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      //nodeIntegration: true
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule:true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

exports.createWindow = createWindow
