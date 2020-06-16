
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
  let $table = $('#timeTable')
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
      if(! timeTable.days[d]?.validDay) continue
      let $td = $('<td class="empty">').appendTo($tr)
        .data('dayIndex',d%7)
    }
  }
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
    console.log(result)
    window.timeTable.days[dayIndex].slots = window.timeTable.days[dayIndex].slots ||[]
    window.timeTable.days[dayIndex].slots.push({
      start:result.start.replace(':',''),
      end:result.end.replace(':',''),
      name:'nouveau créneau'
    })
  }
  creatingSlot = false
}
function timeTableMouseLeave(e){
  creatingSlot = false
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
  $('#apply').click(()=>{
    window.closeWindow('a')
  })
  $('#cancel').click(()=>{
    window.closeWindow(null)
  })
  options = window.getOptions()
  if(options)
    displayTimeTable(options)

})
