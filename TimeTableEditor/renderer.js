
const template = [
  {
    role:'fileMenu',
    submenu:[
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
  return `${t/100|0}h${t%100/10|0||'0'}${t%100%10}`
}
function timeTableNameChange(){
  window.timeTable.name = this.innerText
}

var drawing = false
function timeTableMouseDown(e){
  let $this = $(this)
  $this.addClass('drawing')
  drawing = true
  console.log('down',$this.parent().data('time'))
  return false
}
function timeTableMouseUp(e){
  drawing = false
  let $this = $(this)
  console.log('up',$this.parent().data('time'))
}
function timeTableMouseLeave(e){
  console.log('z')
  //if (this.tagName != 'TABLE') return
  drawing = false
  $('td.drawing').removeClass('drawing')
}
function timeTableMouseEnter(e){
  console.log('a')
  if(!drawing) return
  let $this = $(this)
  $this.addClass('drawing')
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
    .on('mouseenter','td.empty',timeTableMouseEnter)
    .on('mouseleave',timeTableMouseLeave)
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
