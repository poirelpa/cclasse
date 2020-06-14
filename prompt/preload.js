const { remote, ipcRenderer } = require("electron");
require('../preloadTools.js')



window.closeWindow = function(data) {
  ipcRenderer.send("closePrompt", data)
  remote.getCurrentWindow().close();
}

window.getOptions=function() {
  return ipcRenderer.sendSync("openPrompt", "")
}
