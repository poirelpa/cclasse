
const template = [
  {
    role:'fileMenu',
    submenu:[
      {
        label:'&Enregistrer',
        click:window.saveClass,
        accelerator:'CommandOrControl+S'
      },
    ]
  },
  {
    label:'Debug',
    submenu:[
    {
      role: 'reload'
    },
    {
      role: 'toggledevtools'
    },
    ]
  }
]
window.loadMenu(template)

function displayTimeTable(timeTable){
  window.timeTable = timeTable
  $('#timeTableName').text(timeTable.name)
  buildTimeTable()
}
function buildTimeTable(){
  let $table = $('#timeTable').empty()
  let $rows = []
  let $tr = $('<tr><th id="hourDisplay"></th></tr>').appendTo($table)
  let dayNames = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi']
  let d

  var slotColumn=[]
  var slotOverlapsCount=[]
  for(let d_=1;d_<=7;d_++){
    d = d_%7
    if(! timeTable.days[d]?.validDay) continue



    // commpute for each slot its "column index" in case of overlapping
    timeTable.days[d].slots = timeTable.days[d].slots || []
    // step 1 : order slots to optimize overlapping
    // todo
    // step 2 : liste for each slot the overlapping slots

    slotColumn[d] = []
    slotOverlapsCount[d] = []
    let overlap=[]
    for(let i = 0; i<timeTable.days[d].slots.length;i++){
      let slot1 = timeTable.days[d].slots[i]
      overlap[i]=[]
      for(let j = 0; j<timeTable.days[d].slots.length;j++){
        if(i==j) continue
        let slot2 = timeTable.days[d].slots[j]
        if(!(slot1.end <= slot2.start) && !(slot2.end <= slot1.start)){
          overlap[i].push(j)
        }
      }
      slotColumn[d][i]=0
      let overlappingSlotCols = overlap[i].map((j,item)=>slotColumn[d][j])
      while(overlappingSlotCols.includes(slotColumn[d][i]))
        slotColumn[d][i]++

    }
    for(let i = 0; i<timeTable.days[d].slots.length;i++){
      slotOverlapsCount[d][i]=Math.max(slotColumn[d][i],...overlap[i].map((j,item)=>slotColumn[d][j]))+1
    }


    let $td = $('<th class="day">').appendTo($tr)
      .data('dayIndex',d%7)
      .text(dayNames[d%7])
  }
  for(let t = 800;t<=1755;t+=5){
    if(t%100==60)t+=40
    let $tr = $('<tr></tr>').appendTo($table)
      .data('time',t)
      .attr('title',formatTime(t))
      .addClass('min'+t%100)

    let grad = 30
    if(t%100%grad==0){
      $('<th>')
        .text(formatTime(t))
        .appendTo($tr)
        .attr('rowspan',grad/5 | 0)
    }


    for(let d_=1;d_<=7;d_++){
      d = d_%7

      if(! timeTable.days[d]?.validDay) continue

      let $columns = []
      let columnsCount = 0

      let $td = $('<td><div class="slotContainer"></div></td>')
        .appendTo($tr)
        .data('dayIndex',d%7)


      d,t,timeTable.days[d].slots.forEach((item, i) => {
        if(item.end == t){

          let rowspan = (((item.end/100|0) - (item.start/100|0))*60 + item.end%100 - item.start%100)/5
          let $slot = $(`<div class="slot"><span class="slotName">${item.name}</span><input type="color" class="slotColor" value="${item.color}"/><span class="addProgramItem"/><span class="ui-icon ui-icon-trash deleteSlot"/><br><span class="slotTime">${formatTime(item.start)}-${formatTime(item.end)}</span><span class="ui-icon ui-icon-clock changeSlotTime"/></div>`)
            .css('background-color',item.color)
            .data('slotIndex',i)
            .data('rowspan',rowspan)
            .data('dayIndex',d%7)
            //.appendTo($('.slotContainer',$td))
            .outerHeight(rowspan * 5)
            .attr('title','')

          $columns[slotColumn[d][i]]=$slot
        }
        if(item.start < t && item.end >= t){
          columnsCount = slotOverlapsCount[d][i]
        }
      })
      for(let i = 0;i<columnsCount;i++){
        let $slot=$columns[i]
        if($slot){
          $slot.appendTo($('.slotContainer',$td))
        } else{
           $('<div class="coveredByASlot"></div>')
            .appendTo($('.slotContainer',$td))
        }
      }

    }
  }
  $('.slotName').editable()
  $('.addProgramItem').programItemSelector({program:window.program})
  timeTableEditModeClick()
}
function formatTime(t){
  return `${t/1000|0||'0'}${t%1000/100|0}:${t%100/10|0||'0'}${t%100%10}`
}
function timeTableNameChange(){
  window.timeTable.name = this.innerText
}

var creatingSlot = false
var startTime
function timeTableMouseDown(e){
  creatingSlot = true
  startTime = $(this).parents('tr').data('time')
  return false
}
function timeTableMouseUp(e){
  if(creatingSlot){
    creatingSlot = false
    let end = $(this).parents('tr').data('time')
    let dayIndex = $(this).data('dayIndex')
    if(end < startTime) {
      let toto = end
      end = startTime
      startTime = toto
    }
    if(end - startTime <= 10) end = startTime + 100
    let result = promptTime(startTime,end)
    if(!result) return false
    window.timeTable.days[dayIndex].slots = window.timeTable.days[dayIndex].slots ||[]
    window.timeTable.days[dayIndex].slots.push({
      start:result.start,
      end:result.end,
      name:'nouveau créneau',
      color:'#cccccc'
    })
    buildTimeTable()
  }
  creatingSlot = false
}
function timeTableMouseLeave(e){
  creatingSlot = false
}
function slotNameChange(){
  let $slot = $(this).parents('.slot')
  let dayIndex=$slot.data('dayIndex')
  let slotIndex=$slot.data('slotIndex')
  window.timeTable.days[dayIndex].slots[slotIndex].name=this.innerText
  buildTimeTable()
}
function colorChange(){
  let $slot = $(this).parents('.slot')
  let dayIndex=$slot.data('dayIndex')
  let slotIndex=$slot.data('slotIndex')
  window.timeTable.days[dayIndex].slots[slotIndex].color=this.value
  buildTimeTable()
}

function programItemSelected(i,item){
  if(item){
    let $slot = $(this).parents('.slot')
    let dayIndex=$slot.data('dayIndex')
    let slotIndex=$slot.data('slotIndex')
    Object.assign(window.timeTable.days[dayIndex].slots[slotIndex],{
      name:item.name,
      color:item.color,
      programItemUuid:item.uuid,
      programItemReference:item.reference,
      programItemReferenceXPath:item.referenceXPath
    })
    buildTimeTable()
  }
}
function deleteSlotClick(){
  let $slot = $(this).parents('.slot')
  let dayIndex=$slot.data('dayIndex')
  let slotIndex=$slot.data('slotIndex')
  window.timeTable.days[dayIndex].slots.splice(slotIndex,1)
  buildTimeTable()
  return false
}
function changeSlotTimeClick(){
  let $slot = $(this).parents('.slot')
  let dayIndex=$slot.data('dayIndex')
  let slotIndex=$slot.data('slotIndex')
  let slot = window.timeTable.days[dayIndex].slots[slotIndex]
  let result = promptTime(slot.start,slot.end)
  if(!result) return false
  slot.start = result.start
  slot.end = result.end
  buildTimeTable()
  return false
}

function promptTime(start,end){
  let result = window.promptForm(`<form>De <input type="time" name="start" step="300" value="${formatTime(start)}"/>
    à <input type="time" name="end" value="${formatTime(end)}"/><br><br>
    <button onclick="window.close()">Annuler</button>&nbsp;
    <input type="submit"/></form><style>form{width:200px;}</style>`)
  if(result){
    result.start = result.start?.replace(':','')
    result.end = result.end?.replace(':','')
  }
  return result
}

function timeTableEditModeClick(){
  let show = $('#timeTableEditMode').get(0).checked
  $('#timeTableEdit').toggle(show)
  $('#timeTable .ui-icon,#timeTable input[type=color]').toggle(show)
  $('#timeTable td').toggleClass('editMode',show)
}

$(function(){
  $('#timeTableName').editable()
    .on('change',timeTableNameChange)
  $('#timeTableEditMode').on('click',timeTableEditModeClick)
  $('#timeTable')
    .tooltip({
      track:true,
      show:false,
      hide:false,
      position:{ my: "left+15 top+15", at: "left bottom", collision: "flipfit" }
    })
    .on('mousedown','td.editMode',timeTableMouseDown)
    .on('mousedown','.slot',()=>false)
    .on('mouseup','td.editMode',timeTableMouseUp)
    .on('change','.slotName',slotNameChange)
    .on('programItemSelected','.addProgramItem',programItemSelected)
    .on('change','input[type=color]',colorChange)
    .on('click','.deleteSlot',deleteSlotClick)
    .on('click','.changeSlotTime',changeSlotTimeClick)
  $('#apply').click(()=>{
    window.updateTimeTable()
    window.close()
  })
  $('#cancel').click(()=>{
    window.close()
  })
  options = window.getOptions()
  window.program = options.program
  if(options?.timeTable)
    displayTimeTable(options.timeTable)

})
