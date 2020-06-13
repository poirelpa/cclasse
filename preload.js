const {remote, ipcRenderer} = require('electron')
const fs = require('fs').promises
const path = require('path')
require('./preloadTools.js')



const classesPath = path.join(remote.app.getPath("userData"),'storage','classes')
const classesExtension = [{name:'JSON',extensions:['json']}]
const programsPath = path.join(remote.app.getPath("userData"),'storage','programmes')
const programsExtension = [{name:'JSON',extensions:['json']}]



window.launchProgramEditor = function(){
    return ipcRenderer.send("launchProgramEditor")
}

window.launchProgramEditor = function(){
    return ipcRenderer.send("launchProgramBrowser")
}

window.selectCompetence = function(options){
  return ipcRenderer.sendSync("launchProgramBrowser",options)
}

window.getOpenClassPath = function(){
  let options={
    defaultPath :classesPath,
    filters: classesExtension,
    properties: ['openFile']
  }
  return remote.dialog.showOpenDialog(options)
}

window.getSaveClassPath = function(className){
  let options={
    defaultPath: path.join(classesPath,className),
    filters: classesExtension
  }
  return remote.dialog.showSaveDialog(options)
}

window.openClassFile = function(filePath){
  return fs.readFile(filePath)
}
window.saveClassFile = function(class_, filePath){
  return fs.writeFile(filePath, JSON.stringify(class_,null,2))
}

window.getProgramsFilesList = function(){
  return fs.readdir(programsPath)
}
