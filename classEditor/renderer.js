


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
  buildProgrammationsTable()
  buildTimeTablesList()
  $('#class').show()
}

function addTimeTableClick(){
  window.class_.timeTables = window.class_.timeTables || []
  window.class_.timeTables.push({
    name:'nouvel emploi du temps'
  })
  buildTimeTablesList()
}
function buildTimeTablesList(){
  let $ul = $('#timeTablesList').empty()
  window.class_.timeTables = window.class_.timeTables || []
  window.class_.timeTables.forEach((item, i)=>{
    console.log(item)
    $(`<li><span class="timeTableName">${item.name}</span><span class="ui-icon ui-icon-calculator"/span></li>`)
      .appendTo($ul)
      .data('timeTableIndex',i)
  })
  $('.timeTableName',$ul).editable().on('change',function(){
    let $this=$(this)
    window.class_.timeTables[$this.parent().data('timeTableIndex')].name = $this.text()
  })
}

$(function(){
  loadPrograms()

  $('#addPeriod').on('click',addPeriodClick)
  $('#addProgrammation').on('click',addSubjectClick)
  $('#selectProgramItem').programItemSelector(getProgramItemSelectorOptions).on('programItemSelected',programItemSelected)
  $('#classProgram').on('change',classProgramChange)
  $('#programmationsEditMode').on('change',programmationsEditModeChange)
  $('#addTimeTable').on('click',addTimeTableClick)

  $('#programmations')
    .on('click','.subject .addProgrammation',addProgrammationClick)
    .on('editableChange','.programmationName',programmationNameChange)
    .on('editableChange','.subjectName',subjectNameChange)
    .on('editableChange','.progression',progressionNameChange)
    .on('click','.programmation .ui-icon-trash',deleteProgClick)
    .on('click','.subject .ui-icon-trash',deleteSubjectClick)
    .on('click','.progression .ui-icon-trash',deleteProgressionClick)
    .on('click','td.empty',emptyCellClicked)
    .on('click','.deleteWeek',deleteWeekClicked)


  let path = "C:/Users/poirelp/AppData/Roaming/CClasse/storage/classes/toto.json"
    window.openClassFile(path).then(r=>{
        var c = JSON.parse(r)
        c.filePath = path
        displayClass(c)
    })
})
