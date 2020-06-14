
const template = [
  {
    role:'fileMenu',
    submenu:[
      {
        label:'&Nouvelle classe',
        click:newClass,
        accelerator:'CommandOrControl+N'
      },
      {
        label:'&Ouvrir',
        click:openClass,
        accelerator:'CommandOrControl+O'
      },
      {
        label:'&Enregistrer',
        click:saveClass,
        accelerator:'CommandOrControl+S'
      },
      {
        label:'&Enregistrer sous',
        click:saveClassAs,
        accelerator:'CommandOrControl+Shift+S'
      }
    ]
  },
   {
      label: 'Edit',
      submenu: [
         {
            role: 'undo'
         },
         {
            role: 'redo'
         },
         {
            type: 'separator'
         },
         {
            role: 'cut'
         },
         {
            role: 'copy'
         },
         {
            role: 'paste'
         }
      ]
   },
   {
     label: '&Outils',
     submenu: [
       {
         label:'&Editeur de programmes',
         click:window.launchProgramEditor
       },
       {
         label:'&Consultation de programmes',
         click:window.launchProgramBrowser
       },
       {
          type: 'separator'
       },
       {
         label:'Editeur de &séquence'
       },
     ]
   },
   {
      label: 'View',
      submenu: [
         {
            role: 'reload'
         },
         {
            role: 'toggledevtools'
         },
         {
            type: 'separator'
         },
         {
            role: 'resetzoom'
         },
         {
            role: 'zoomin'
         },
         {
            role: 'zoomout'
         },
         {
            type: 'separator'
         },
         {
            role: 'togglefullscreen'
         }
      ]
   },

   {
      role: 'window',
      submenu: [
         {
            role: 'minimize'
         },
         {
            role: 'close'
         }
      ]
   }
]

window.loadMenu(template)



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
    name:$('#className').val(),
    program:$('#classProgram').val()
  })
  return window.class_
}

function displayClass(class_){
  console.log(class_)
  $('#className').val(class_.name)
  $('#classProgram').val(class_.program)
  window.class_ = class_
  buildProgrammationsTable()
  $('#class').show()
}

function buildProgrammationsTable(){
  let class_ = window.class_
  console.log(window.class_.programmations)
  let $header = $('<tr><th colspan="2">Programmations</th></tr>')
  let $programmations = $('#programmations').empty()
    .append($header)

  let $programmationRows = []

  let buildProgGroupCell = function(name, progGroup, colspan){

  }

  let row = 0
  class_.programmations.forEach((progGroup, i) => {
    let currentRow = row
    if(progGroup.programmations?.length){
      progGroup.programmations.forEach((prog, j) => {
        $programmationRows[row]=$(`<tr><th class="prog"><span class="editable progName">${prog.name}</span><span class="addProgItem ui-icon ui-icon-note"></span><span class="deleteProg ui-icon ui-icon-trash"></span></th></tr>`)
          .css('background-color',prog.color)
          .data('uuid',prog.uuid)
          .data('xpath',prog.xpath)
          .data('progGroupIndex',i)
          .data('progIndex',j)
          .appendTo($programmations)
        row++
      });
    }
    else {
      $programmationRows[row]=$(`<tr></tr>`)
        .css('background-color',progGroup.color)
        .data('uuid',progGroup.uuid)
        .data('xpath',progGroup.xpath)
        .data('progGroupIndex',i)
      .appendTo($programmations)
      row++
    }
    $programmationRows[currentRow].prepend(
      $(`<th class="progGroup"><span class="editable progGroupName">${progGroup.name}</span><span class="addProg ui-icon ui-icon-plus"></span><span class="addProgItem ui-icon ui-icon-note"></span><span class="deleteProg ui-icon ui-icon-trash"></span></th>`)
      .css('background-color',progGroup.color)
      .data('uuid',progGroup.uuid)
      .data('xpath',progGroup.xpath)
      .data('progGroupIndex',i)
      .attr('colspan',progGroup.programmations?.length ? 1 : 2)
      .attr('rowspan',Math.max(progGroup.programmations?.length,1))
      .appendTo($programmations)
    )
  })

  let prevDay
  let prevWeek
  let addCell=function(row,periodBreak,prog, day){
    let $td = $('<td class="empty">').appendTo($programmationRows[row])
      .data('day',d)
    if(periodBreak)
      $td.addClass('periodBreak')
  }
  for (var d in class_.days) {
    if (class_.days.hasOwnProperty(d)) {
      let day = $.datepicker.parseDate("yymmdd",d)
      if(prevDay == null || day.getDay()<prevDay.getDay() || (day.getTime() - prevWeek.getTime() > 1000*60*60*24*6)){
        let f = $.datepicker.formatDate('d/m',day)

        let $th = $(`<th>${f}</th>`).appendTo($header)

        let periodBreak = !prevWeek || day.getTime() - prevWeek?.getTime() > 1000*60*60*24*13
        if(periodBreak)
          $th.addClass('periodBreak')


          row = 0
          class_.programmations.forEach((progGroup, i) => {
            if(progGroup.programmations?.length){
              progGroup.programmations.forEach((prog, j) => {
                addCell(row, periodBreak, prog, day)
                row ++
              });
            }else{
              addCell(row, periodBreak, progGroup, day)
              row ++
            }

          });

        prevWeek = day
      }
      prevDay = day
    }
  }


  $('.editable',$programmations).editable()
  programmationsEditModeChange()
}

function loadPrograms(){
  let $programs=$('#classProgram').empty()
  $programs.append('<option></option>')
  window.getProgramsFilesList().then(files=>{
    files.filter(f =>{
      return f.endsWith('.json')
    }).forEach((f, i) => {
      $programs.append(`<option value="${f}">${window.extractPath(f).name}</option>`)
    });

    //$references.selectmenu('refresh')
  })
}

function addPeriodClick(){
  let validDays = [
    $('#periodSunday').is(':checked'),
    $('#periodMonday').is(':checked'),
    $('#periodTuesday').is(':checked'),
    $('#periodWednesday').is(':checked'),
    $('#periodThursday').is(':checked'),
    $('#periodFriday').is(':checked'),
    $('#periodSaturday').is(':checked')]

    let periodStart = $('#periodStart').get(0).valueAsDate
    let periodEnd = $('#periodEnd').get(0).valueAsDate

    if(!periodStart || !periodEnd){
      return
    }
    if(periodStart > periodEnd){
      alert("La date de début est supérieure à la date de fin !")
      return
    }
    if(periodEnd - periodStart > 365 * 24 * 60 * 60 * 1000){
        alert("Ca fait plus d'un an !")
        return
    }
    window.class_.days = window.class_.days || {}
    for(let d = periodStart; d <= periodEnd; d.setDate(d.getDate()+1)){
      if(validDays[d.getDay()]){
        let k = $.datepicker.formatDate('yymmdd',d)
        window.class_.days[k]=window.class_.days[k]||{}
      }
    }
  buildProgrammationsTable()
}

function addProgrammationClick(){
  let name = $('#programmationName').val()
  let uuid = $('a#selectCompetence').data('uuid')
  let referenceXPath = $('#programmationColor').data('referenceXPath')

  if(!name) return
  window.class_.programmations = window.class_.programmations || []

  window.class_.programmations.push({
    name:name,
    color:$('#programmationColor').val(),
    uuid:$('a#selectProgramItem').data('uuid'),
    xpath:$('a#selectProgramItem').data('referenceXPath')
  })
  buildProgrammationsTable()
}

function selectProgramItemClick(){
  if(!window.class_.program) return false
  competence = window.selectProgramItem({
    select:'1',
    program:window.class_.program
  })
  if(competence){
    $('#programmationName').val(competence.name)
    $('#programmationColor').val(competence.color)
    $(this).data('uuid',competence.uuid).data('referenceXPath',competence.referenceXPath)
  }
}

function classProgramChange(){
  window.class_.program = $(this).val()
}

function addSubProgrammationClick(){
  let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
  let progGroup = window.class_.programmations[progGroupIndex]

  progGroup.programmations = progGroup.programmations || []
  progGroup.programmations.push({
    name:"nouvelle programmation",
    color:progGroup.color
  })
  buildProgrammationsTable()
}

function progNameChange(e){
  let progIndex = $(this).parents('tr').data('progIndex')
  let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
  window.class_.programmations[progGroupIndex].programmations[progIndex].name = this.innerText
  console.log(class_.programmations)
}
function progGroupNameChange(){
    let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
    class_.programmations[progGroupIndex].name = this.innerText
    console.log(class_.programmations)
}

function programmationsEditModeChange(){
  let show = $('#programmationsEditMode').get(0).checked
  $('span.ui-icon','#programmations').css('display',show?'inline-block':'none')
  $('#programmationsEdit').css('display',show?'block':'none')
}

function deleteProgClick(){
  if(!confirm("Supprimer cette programmation ?"))return
  let progIndex = $(this).parents('tr').data('progIndex')
  let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
  window.class_.programmations[progGroupIndex].programmations.splice(progIndex,1)
  buildProgrammationsTable()
}
function deleteProgGroupClick(){
  if(!confirm("Supprimer cette programmation ?"))return
  let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
  window.class_.programmations.splice(progGroupIndex,1)
  buildProgrammationsTable()
}
function addProgItem(){
  let $tr = $(this).parents('tr')
  let progIndex = $tr.data('progIndex')
  let progGroupIndex = $tr.data('progGroupIndex')

  if(!window.class_.program) return false
  item = window.selectProgramItem({
    select:'1',
    program:window.class_.program,
    item:window.class_.programmations[progGroupIndex].programmations[progIndex].uuid
  })
  if(item){
    Object.assign(window.class_.programmations[progGroupIndex].programmations[progIndex], item)
    buildProgrammationsTable()
  }
}
function addProgGroupItem(){
  let $tr = $(this).parents('tr')
  let progGroupIndex = $tr.data('progGroupIndex')

  if(!window.class_.program) return false
  item = window.selectProgramItem({
    select:'1',
    program:window.class_.program,
    item:window.class_.programmations[progGroupIndex].uuid
  })
  if(item){
    Object.assign(window.class_.programmations[progGroupIndex], item)
    buildProgrammationsTable()
  }
}

function emptyCellClicked(){
  let $td = $(this)
  let $tr = $td.parent()
  let day = $td.data('day')
  let progIndex = $tr.data('progIndex')
  let progGroupIndex = $tr.data('progGroupIndex')
  let data = window.promptForm('<form><input name="toto"/><input name="tata"/></form>')
  console.log(data)
}

$(function(){
  loadPrograms()

  $('#addPeriod').on('click',addPeriodClick)
  $('#addProgrammation').on('click',addProgrammationClick)
  $('#selectProgramItem').on('click',selectProgramItemClick)
  $('#classProgram').on('change',classProgramChange)
  $('#programmationsEditMode').on('change',programmationsEditModeChange)

  $('#programmations')
    .on('click','.progGroup .addProg',addSubProgrammationClick)
    .on('editableChange','.progName',progNameChange)
    .on('editableChange','.progGroupName',progGroupNameChange)
    .on('click','.prog .deleteProg',deleteProgClick)
    .on('click','.progGroup .deleteProg',deleteProgGroupClick)
    .on('click','.prog .addProgItem',addProgItem)
    .on('click','.progGroup .addProgItem',addProgGroupItem)
    .on('click','td.empty',emptyCellClicked)

  let path = "C:/Users/poirelp/AppData/Roaming/CClasse/storage/classes/toto.json"
    window.openClassFile(path).then(r=>{
        var c = JSON.parse(r)
        c.filePath = path
        displayClass(c)
    })
})
