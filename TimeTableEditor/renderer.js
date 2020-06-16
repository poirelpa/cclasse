
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
  for(let d_=1;d_<=7;d_++){
    d = d_%7
    if(! timeTable.days[d]?.validDay) continue
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

      let $td = $('<td class="empty">')

      if(! timeTable.days[d]?.validDay) continue
      timeTable.days[d].slots = timeTable.days[d].slots || []
      d,t,timeTable.days[d].slots.forEach((item, i) => {
        if(item.start == t){
          let rowspan = (((item.end/100|0) - (item.start/100|0))*60 + item.end%100 - item.start%100)/5
          $td = $(`<td class="slot"><span class="slotName">${item.name}</span><input type="color" class="slotColor" value="${item.color}"/><span class="addProgramItem"/><br><span class="slotTime">${formatTime(item.start)}-${formatTime(item.end)}</span></td>`)
            .attr('rowspan',rowspan)
            .css('background-color',item.color)
            .data('slotIndex',i)
          return false
        }
        if(item.start < t && item.end > t){
          // skip cell because of rowspan
          $td=null
          return false
        }
      })
      if($td){
        $td.appendTo($tr)
          .data('dayIndex',d%7)
      }
    }
  }
  $('.slotName').editable()
  $('.addProgramItem').programItemSelector({program:window.program})
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
  startTime = $(this).parent().data('time')
  return false
}
function timeTableMouseUp(e){
  if(creatingSlot){
    let end = $(this).parent().data('time')
    let dayIndex = $(this).data('dayIndex')
    if(end == startTime) end = startTime + 100
    let result = window.promptForm(`<form width="500px">De <input type="time" name="start" value="${formatTime(startTime)}"/><br>
      à <input type="time" name="end" value="${formatTime(end)}"/><br>
      <button onclick="window.close()">Annuler</button>
      <input type="submit"/></form>`)
    window.timeTable.days[dayIndex].slots = window.timeTable.days[dayIndex].slots ||[]
    window.timeTable.days[dayIndex].slots.push({
      start:result.start.replace(':',''),
      end:result.end.replace(':',''),
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
  let $td = $(this).parents('td')
  let dayIndex=$td.data('dayIndex')
  let slotIndex=$td.data('slotIndex')
  window.timeTable.days[dayIndex].slots[slotIndex].name=this.innerText
  buildTimeTable()
}
function colorChange(){
  let $td = $(this).parents('td')
  let dayIndex=$td.data('dayIndex')
  let slotIndex=$td.data('slotIndex')
  window.timeTable.days[dayIndex].slots[slotIndex].color=this.value
  buildTimeTable()
}

function programItemSelected(i,item){
  if(item){
    let $td = $(this).parents('td')
    let dayIndex=$td.data('dayIndex')
    let slotIndex=$td.data('slotIndex')
    Object.assign(window.timeTable.days[dayIndex].slots[slotIndex],{
      name:item.name,
      color:item.color,
      programItemUuid:item.uuid,
      programItemReference:item.reference,
      programItemReferenceXPath:item.referenceXPath
    })
    buildTimeTable()
    //$('#programmationName').val(item.name)
    //$('#programmationColor').val(item.color)
    //$(this).data('uuid',item.uuid).data('referenceXPath',item.referenceXPath)
  }
}

$(function(){
  $('#timeTableName').editable()
    .on('change',timeTableNameChange)
  $('#timeTable')
    .tooltip({
      track:true,
      show:false,
      hide:false,
      position:{ my: "left+15 top+15", at: "left bottom", collision: "flipfit" }
    })
    .on('mousedown','td.empty',timeTableMouseDown)
    .on('mouseup','td.empty',timeTableMouseUp)
    .on('change','.slotName',slotNameChange)
    .on('programItemSelected','.addProgramItem',programItemSelected)
    .on('change','input[type=color]',colorChange)
  $('#apply').click(()=>{
    window.closeWindow('a')
  })
  $('#cancel').click(()=>{
    window.closeWindow(null)
  })
  options = window.getOptions()
  window.program = options.program
  if(options?.timeTable)
    displayTimeTable(options.timeTable)

})
