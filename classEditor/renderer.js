
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
        $programmationRows[row]=$(`<tr><th class="prog"><span class="editable progName">${prog.name}</span><span class="addProgItem"></span><span class="deleteProg ui-icon ui-icon-trash"></span></th></tr>`)
          .css('background-color',prog.color)
          .data('uuid',prog.uuid)
          .data('xpath',prog.xpath)
          .data('progGroupIndex',i)
          .data('progIndex',j)
          .appendTo($programmations)
          $('.prog .addProgItem',$programmationRows[row]).data('item',{uuid:prog.uuid,program:prog.program})
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
      $(`<th class="progGroup"><span class="editable progGroupName">${progGroup.name}</span><span class="addProg ui-icon ui-icon-plus"></span><span class="addProgItem"></span><span class="deleteProg ui-icon ui-icon-trash"></span></th>`)
      .css('background-color',progGroup.color)
      .data('uuid',progGroup.uuid)
      .data('xpath',progGroup.xpath)
      .data('progGroupIndex',i)
      .attr('colspan',progGroup.programmations?.length ? 1 : 2)
      .attr('rowspan',Math.max(progGroup.programmations?.length,1))
      .appendTo($programmations)
    )
    $('.progGroup .addProgItem',$programmationRows[row]).data('item',{uuid:progGroup.uuid,program:progGroup.program})

  })

  let prevDay
  let prevWeek
  let addCell=function(row,periodBreak,prog, day, d){
    let progression, progressionIndex
    prog.progressions?.forEach((item, k) => {
      if(item.start == d){
        progression = item
        progressionIndex = k
        return false
      }
    });

    let $td = $('<td>').appendTo($programmationRows[row])
      .data('day',day)
    if(periodBreak)
      $td.addClass('periodBreak')
    if(progression){
      $td.append(`<span class="draggable-left"/><span class="draggable-right"/><span class="editable">${progression.name}</span><span class="addProgItem"/><span class="ui-icon ui-icon-trash"/>`)
        .addClass('progression')
        .data('progression',progression)
        .data('progressionIndex',progressionIndex)
        .css('background-color',progression.color)
    }else{
      $td.addClass('empty')
    }
    return $td
  }
  for (var d in class_.days) {
    if (class_.days.hasOwnProperty(d)) {
      let day = $.datepicker.parseDate("yymmdd",d)
      if(prevDay == null || day.getDay()<prevDay.getDay() || (day.getTime() - prevWeek.getTime() > 1000*60*60*24*6)){
        let f = $.datepicker.formatDate('d/m',day)

        let $th = $(`<th>${f}<span class="deleteWeek ui-icon ui-icon-trash"></span></th>`)
          .appendTo($header)
          .data('day',day)

        let periodBreak = !prevWeek || day.getTime() - prevWeek?.getTime() > 1000*60*60*24*13
        if(periodBreak)
          $th.addClass('periodBreak')


          row = 0
          class_.programmations.forEach((progGroup, i) => {
            if(progGroup.programmations?.length){
              progGroup.programmations.forEach((prog, j) => {
                addCell(row, periodBreak, prog, day, d)
                row ++
              });
            }else{
              addCell(row, periodBreak, progGroup, day, d)
              row ++
            }

          });

        prevWeek = day
      }
      prevDay = day
    }
  }


  $('.editable',$programmations).editable()
  $('.prog .addProgItem',$programmations).programItemSelector(getProgramItemSelectorOptions).on('programItemSelected',addProgItem)
  $('.progGroup .addProgItem',$programmations).programItemSelector(getProgramItemSelectorOptions).on('programItemSelected',addProgGroupItem)
  $('.progression .addProgItem',$programmations).programItemSelector(getProgramItemSelectorOptions).on('programItemSelected',addProgressionItem)
  $('td.progression',$programmations).each((i,item)=>{
    let $item = $(item)
    let weeks = $item.data('progression')?.duration
    $item.attr('colspan',weeks  )
    $item.nextAll().slice(0,weeks-1).remove()
  })
  /*$('.draggable-left').each((i,item)=>{
    console.log($(item).parent())
    if(!$(item).parent().prev().hasClass('empty'))
      $(item).remove()
  })
  $('.draggable-right').each((i,item)=>{
    console.log($(item).parent())
    if(!$(item).parent().next().hasClass('empty'))
      $(item).remove()
  })*/
  $('.draggable-left,.draggable-right',$programmations).draggable({
    axis:'x',
    revert:progressionDragStop,
    zIndex:100
    //stop:progressionDragStop
  })
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

function programItemSelected(i,item){
  if(item){
    console.log(item)
    $('#programmationName').val(item.name)
    $('#programmationColor').val(item.color)
    $(this).data('uuid',item.uuid).data('referenceXPath',item.referenceXPath)
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
}
function progGroupNameChange(){
    let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
    class_.programmations[progGroupIndex].name = this.innerText
}
function progressionNameChange(){
  let progIndex = $(this).parents('tr').data('progIndex')
  let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
  let progressionIndex = $(this).data('progressionIndex')
  window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex].name = this.innerText
}

function programmationsEditModeChange(){
  let show = $('#programmationsEditMode').get(0).checked
  $('span.ui-icon, .draggable-left, .draggable-right','#programmations').css('display',show?'inline-block':'none')
  $('#programmationsEdit').css('display',show?'block':'none')
  $('#programmations td.empty').css('cursor',show?'cell':'default')
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
function deleteProgressionClick(){
  if(!confirm("Supprimer cette progression ?"))return
  let progIndex = $(this).parents('tr').data('progIndex')
  let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
  let progressionIndex = $(this).parents('td=').data('progressionIndex')
  window.class_.programmations[progGroupIndex].programmations[progIndex].progressions.splice(progressionIndex,1)
  buildProgrammationsTable()

}
function addProgItem(e,item){
  let $tr = $(this).parents('tr')
  let progIndex = $tr.data('progIndex')
  let progGroupIndex = $tr.data('progGroupIndex')
  if(item){
    Object.assign(window.class_.programmations[progGroupIndex].programmations[progIndex], item)
    buildProgrammationsTable()
  }
}
function addProgGroupItem(e,item){
  let $tr = $(this).parents('tr')
  let progGroupIndex = $tr.data('progGroupIndex')
  if(item){
    Object.assign(window.class_.programmations[progGroupIndex], item)
    buildProgrammationsTable()
  }
}
function addProgressionItem(e,item){
  let progIndex = $(this).parents('tr').data('progIndex')
  let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
  let progressionIndex = $(this).parent('td').data('progressionIndex')

  if(item){
    Object.assign(window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex], item)
    buildProgrammationsTable()
  }
}

function deleteWeekClicked(){
  let day = $.datepicker.formatDate('yymmdd',$(this).parent().data('day'))
  let nextWeek = $.datepicker.formatDate('yymmdd',$(this).parent().next().data('day'))
  for (var date in window.class_.days) {
    if (window.class_.days.hasOwnProperty(date)) {
      if(date >= day && (!nextWeek || date < nextWeek)) {
        delete window.class_.days[date]
      }
    }
  }

  buildProgrammationsTable()
}

function emptyCellClicked(){
  if(!$('#programmationsEditMode').get(0).checked) return
  let $td = $(this)
  let $tr = $td.parent()
  let day = $td.data('day')
  let progIndex = $tr.data('progIndex')
  let progGroupIndex = $tr.data('progGroupIndex')
  //let formData = window.promptForm(`<form>A partir du <br/><input name="start" type="date" value="${$.datepicker.formatDate('yy-mm-dd',day)}"/><br><br>pour <input name="duration" type="number" value="1"/> semaines<br><br><input type="submit"/></form>`)
  //if(!formData.start)return
  data = {
    name:'nouvelle progression',
    start:$.datepicker.formatDate('yymmdd',day),
    duration:1
  }
  let progs
  let index
  if(window.class_.programmations[progGroupIndex].programmations?.length){
    progs = window.class_.programmations[progGroupIndex].programmations
    index = progIndex
  } else {
    progs = window.class_.programmations
    index = progGroupIndex
  }
  console.log([progs,index,progs[index]])
  progs[index].progressions = progs[index].progressions || []
  progs[index].progressions.push(data)

  buildProgrammationsTable()
}

function getProgramItemSelectorOptions(){
  return {program:window.class_.program}
}

function progressionDragStop(e){
  let $this = $(this)
  let left = $this.position().left
  let day = $this.parent().data('day')
  let weeks = 0
  let start = day
  let $baseItem
  $('#programmations tr').first().children().each((i,item)=>{
    let $item = $(item)
    if($item.data('day') == day){
      while($item.length){
        if(left <=$item.get(0).offsetWidth/2+2 && left >= -($item.prev()?.get(0)?.offsetWidth/2-2)){

          let progIndex = $(this).parents('tr').data('progIndex')
          let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
          let progressionIndex = $(this).parent('td').data('progressionIndex')
          if($this.hasClass('draggable-left')){
            window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex].start = $.datepicker.formatDate('yymmdd',$item.data('day'))
            window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex].duration = Math.max(window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex].duration-weeks,1)
          }
          if($this.hasClass('draggable-right')){
            window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex].duration = weeks
          }
          buildProgrammationsTable()
          return
        } else if(left>$item.get(0).offsetWidth/2+2){
          left -= $item.get(0).offsetWidth
          $item = $item.next()
          weeks++
        } else if(left < - $item.prev()?.get(0)?.offsetWidth/2-2){
          $item = $item.prev(0)
          left += $item.get(0).offsetWidth
          weeks--
        }
        console.log($item.get(0).innerText, left,weeks)
      }
      return false
    }
  })
  return true
      /*while(left < 0 && $this.hasClass('draggable-left')){
        //item
        //left -=
      }
      console.log(left)
      if(left>item.offsetWidth/2-3){
        left -= item.offsetWidth
        weeks++
      }
      if(left <=item.offsetWidth/2-3){
        weeks = Math.max(weeks,1)
        let progIndex = $(this).parents('tr').data('progIndex')
        let progGroupIndex = $(this).parents('tr').data('progGroupIndex')
        let progressionIndex = $(this).parent('td').data('progressionIndex')
        if($this.hasClass('draggable-left')){
          window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex].start = $.datepicker.formatDate('yymmdd',$(item).next().data('day'))
        }
        if($this.hasClass('draggable-right')){
          window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex].duration = weeks
        }
          console.log(window.class_.programmations[progGroupIndex].programmations[progIndex].progressions[progressionIndex])
        buildProgrammationsTable()
        return false
      }
    }
  return true*/
}

$(function(){
  loadPrograms()

  $('#addPeriod').on('click',addPeriodClick)
  $('#addProgrammation').on('click',addProgrammationClick)
  $('#selectProgramItem').programItemSelector(getProgramItemSelectorOptions).on('programItemSelected',programItemSelected)
  $('#classProgram').on('change',classProgramChange)
  $('#programmationsEditMode').on('change',programmationsEditModeChange)

  $('#programmations')
    .on('click','.progGroup .addProg',addSubProgrammationClick)
    .on('editableChange','.progName',progNameChange)
    .on('editableChange','.progGroupName',progGroupNameChange)
    .on('editableChange','.progression',progressionNameChange)
    .on('click','.prog .deleteProg',deleteProgClick)
    .on('click','.progGroup .deleteProg',deleteProgGroupClick)
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
