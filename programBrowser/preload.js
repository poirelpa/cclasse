const { remote, ipcRenderer } = require("electron");
const fs = require('fs').promises
const path = require('path')
require('../preloadTools.js')


const programsPath = path.join(remote.app.getPath("userData"),'storage','programmes')
const programsExtension = [{name:'JSON',extensions:['json']}]
const referencesPath = path.join(remote.app.getPath("userData"),'storage','programmes','references')
const referencesExtension = [{name:'HTML',extensions:['htm','html']}]


window.getOpenProgramPath = function(){
  let options={
    defaultPath :programsPath,
    filters: programsExtension,
    properties: ['openFile']
  }
  return remote.dialog.showOpenDialog(options)
}

window.openProgramFile = function(filePath){
  return fs.readFile(filePath).then(d=>JSON.parse(d))
}

window.getReferencesPath = function(){
  return referencesPath
}
window.getProgramsPath = function(){
  return programsPath
}


window.closeWindow = function(data) {
  ipcRenderer.send("closeProgramBrowser", data)
  remote.getCurrentWindow().close();
}

window.getOptions=function() {
  return ipcRenderer.sendSync("openProgramBrowser", "")
}
