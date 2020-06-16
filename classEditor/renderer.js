


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
    program:$('#classProgram').val(),
    validDays:getValidDays()
  })
  return window.class_
}

function getValidDays(){
  return [
    $('#periodSunday').is(':checked'),
    $('#periodMonday').is(':checked'),
    $('#periodTuesday').is(':checked'),
    $('#periodWednesday').is(':checked'),
    $('#periodThursday').is(':checked'),
    $('#periodFriday').is(':checked'),
    $('#periodSaturday').is(':checked')]
}

function displayClass(class_){
  console.log(class_)
  $('#className').text(class_.name).editable()
  $('#classProgram').val(class_.program)
  class_.validDays = class_.validDays || [0,1,1,0,1,1,0]
  $('#periodSunday').get(0).checked=class_.validDays[0]
  $('#periodMonday').get(0).checked=class_.validDays[1]
  $('#periodTuesday').get(0).checked=class_.validDays[2]
  $('#periodWednesday').get(0).checked=class_.validDays[3]
  $('#periodThursday').get(0).checked=class_.validDays[4]
  $('#periodFriday').get(0).checked=class_.validDays[5]
  $('#periodSaturday').get(0).checked=class_.validDays[6]
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
        $('.ui-icon-calculator').first().click()
    })
})
