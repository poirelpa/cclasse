const { remote, ipcRenderer } = require("electron");
require('../preloadTools.js')


window.closeWindow = function(data) {
  ipcRenderer.send("closeTimeTableEditor", data)
  remote.getCurrentWindow().close();
}

window.getOptions=function() {
  return ipcRenderer.sendSync("openTimeTableEditor", "")
}

window.updateTimeTable = function(){
  ipcRenderer.send("updateTimeTable", window.timeTable)
}

window.saveClass = function(){
  ipcRenderer.send("updateTimeTable", window.timeTable)
  ipcRenderer.send("saveClass", window.timeTable)
}
