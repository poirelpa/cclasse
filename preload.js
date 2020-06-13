const {remote, ipcRenderer} = require('electron')
const { Menu, MenuItem } = remote
const menu = new Menu()
menu.append(new MenuItem({ label: 'MenuItem1', click() { console.log('item 1 clicked') } }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup({ window: remote.getCurrentWindow() })
}, false)



window.prompt = function(title,msg,val){
  return ipcRenderer.sendSync("prompt", {title:title,message:msg,value:val})
}
