


function openClass(menuItem, browserWindow, event){
  window.getOpenClassPath().then(r => {
    let path = r.filePaths?.[0]
    if(path){
      window.openClassFile(path).then(r=>{
          var c = JSON.parse(r)
          c.filePath = path
          displayClass(c)
      })
    }
  })
}

function saveClass(menuItem, browserWindow, event){
  if(!window.class_.filePath)
    return saveClassAs(menuItem, browserWindow, event)
  updateClass()

  window.saveClassFile(window.class_, window.class_.filePath).then(noResult=>{
    //ok, pas d'argument
  })
}



function saveClassAs(menuItem, browserWindow, event){
  updateClass()
  window.getSaveClassPath(window.class_.name).then(r=>{
    let path = r?.filePath
    if(path){
      window.class_.filePath = path
      saveClass(menuItem, browserWindow, event)
    }
  })
}

function newClass(menuItem, browserWindow, event){
  let class_ = {
    name:"nouvelle classe"
  }
  displayClass(class_)
}


function updateClass(){

  Object.assign(window.class_,{
    name:$('#className').text(),
    program:$('#classProgram').val()
  })
  return window.class_
}

function displayClass(class_){
  console.log(class_)
  $('#className').text(class_.name).editable()
  $('#classProgram').val(class_.program)
  window.class_ = class_
  $('#class').show()
  buildProgrammationsTable()
  buildTimeTablesTable()
}

$(function(){
  loadPrograms()

  let path = "C:/Users/poirelp/AppData/Roaming/CClasse/storage/classes/toto.json"
    window.openClassFile(path).then(r=>{
        var c = JSON.parse(r)
        c.filePath = path
        displayClass(c)
    })
})
