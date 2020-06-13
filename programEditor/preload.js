const { remote, ipcRenderer } = require("electron");
const fs = require('fs').promises
const path = require('path')

window.loadMenu = function(template){
  const menu = remote.Menu.buildFromTemplate(template);
  remote.getCurrentWindow().setMenu(menu);
}



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

window.getSaveProgramPath = function(programName){
  let options={
    defaultPath: path.join(programsPath,programName),
    filters: programsExtension
  }
  return remote.dialog.showSaveDialog(options)
}

window.openProgramFile = function(filePath){
  return fs.readFile(filePath)
}
window.saveProgramFile = function(program, filePath){
  return fs.writeFile(filePath, JSON.stringify(program))
}

window.getImportReferencePath = function(){
  let options={
    defaultPath :referencesPath,
    filters: referencesExtension,
    properties: ['openFile']
  }
  return remote.dialog.showOpenDialog(options)
}

window.importReferenceFile = function(filePath,name){
  return fs.copyFile(filePath, path.join(referencesPath,name + '.html'))
  console.log(filePath)
}

window.getReferencesFilesList = function(){
  return fs.readdir(referencesPath)
}

window.getReferencesPath = function(){
  return referencesPath
}

window.extractPath = function(filePath){
  return path.parse(filePath)
}

window.prompt = function(title,msg,val){
  return ipcRenderer.sendSync("prompt", {title:title,message:msg,value:val})
}

window.confirm = function(msg){
  return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(),{
    type:"question",
    buttons:["Annuler","Valider"],
    message:msg
  })
}
window.alert = function(msg){
  return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(),{
    type:"info",
    buttons:["vu ✓"],
    message:msg
  })
}
