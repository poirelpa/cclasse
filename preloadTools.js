const { remote, ipcRenderer } = require("electron");
const { v4: uuid } = require('uuid');
const path = require('path')


window.loadMenu = function(template){
  const menu = remote.Menu.buildFromTemplate(template);
  remote.getCurrentWindow().setMenu(menu);
}

window.extractPath = function(filePath){
  return path.parse(filePath)
}

window.prompt = function(title,msg,val){
  return ipcRenderer.sendSync("prompt", {title:title,message:msg,value:val})
}

window.promptForm = function(form){
  let data = ipcRenderer.sendSync("prompt", {form:form}) || []
  let result = {}
  data.forEach((item, i) => {
    result[item.name] = item.value
  });
  return result
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

window.uuid = function(){
  return uuid()
}



window.selectProgramItem = function(options){
  options.select = options.select || 1
  return ipcRenderer.sendSync("launchProgramBrowser",options)
}
