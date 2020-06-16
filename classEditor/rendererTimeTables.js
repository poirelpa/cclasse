
function buildTimeTablesTable(){
  let class_ = window.class_
  let $header = $('<tr><th></th></tr>')
  let $timeTables = $('#timeTables').empty()
    .append($header)

  let $timeTableRows = []

  class_.timeTables.forEach((timeTable, row) => {
    let currentRow = row
    $timeTableRows[row]=$(`<tr></tr>`)
      .data('timeTableUuid',timeTable.uuid)
      .data('timeTableIndex',row)
      .appendTo($timeTables).append(
        $(`<th class="timeTable"><span class="ui-icon ui-icon-grip-dotted-horizontal"/><span class="timeTableName">${timeTable.name}</span><span class="openTimeTable ui-icon ui-icon-calculator"/><span class="ui-icon ui-icon-trash"/></th>`)
      )
  })
  let prevDay
  let prevWeek
  for (var dayKey in class_.days) {
    if (class_.days.hasOwnProperty(dayKey)) {
      let dayDate = $.datepicker.parseDate("yymmdd",dayKey)
      if(prevDay == null || dayDate.getDay()<prevDay.getDay() || (dayDate.getTime() - prevWeek.getTime() > 1000*60*60*24*6)){
        let formatted = $.datepicker.formatDate('d/m',dayDate)

        let $th = $(`<th>${formatted}</th>`)
          .appendTo($header)
          .data('day',dayKey)

        let periodBreak = !prevWeek || dayDate.getTime() - prevWeek?.getTime() > 1000*60*60*24*13
        if(periodBreak)
          $th.addClass('periodBreak')
        class_.timeTables.forEach((timeTable, row)=>{
          let $td = $(`<td><input type="radio" name="${dayKey}" ${class_.days[dayKey]?.timeTableUuid==timeTable.uuid?'checked':''} class="applyTimeTable"/></td>`).appendTo($timeTableRows[row])
            .data('dayKey',dayKey)
          if(periodBreak)
            $td.addClass('periodBreak')
        })
        prevWeek = dayDate
      }
      prevDay = dayDate
    }
  }
  $('.timeTable .ui-icon-grip-dotted-horizontal',$timeTables).draggable({
    axis:'y',
    revert:timeTableDragStop,
    zIndex:100
  })


  $('.timeTableName',$timeTables).editable().on('change',timeTableNameChange)

  updateTimeTablesTableWidth()
  timeTablesEditModeChange()
}

function timeTableNameChange(){
  let $this=$(this)
  window.class_.timeTables[$this.parents('tr').data('timeTableIndex')].name = $this.text()
}

function timeTableDragStop(){
  console.log(this.position().top)
  throw "not implemented"
  return true
}

function addTimeTableClick(){
  window.class_.timeTables = window.class_.timeTables || []
  window.class_.timeTables.push({
    name:'nouvel emploi du temps',
    uuid:uuid()
  })
  buildTimeTablesTable()
  return false
}

function timeTablesEditModeChange(){
  let show = $('#timeTablesEditMode').get(0).checked
  $('span.ui-icon:not(.ui-icon-calculator)','#timeTables').css('display',show?'inline-block':'none')
  $('#timeTablesEdit').css('display',show?'block':'none')
  $(':radio:not(:checked)').attr('disabled', !show);
}

function updateTimeTablesTableWidth(){
  $('tr','#timeTables').first().children().each((i,item)=>{
    $(item).innerWidth($('th','#programmations').eq(i).innerWidth())
  })
}

function deleteTimeTableClick(){
  if(!confirm("Supprimer cet emploi du temps ?"))return
  let timeTableIndex = $(this).parents('tr').data('timeTableIndex')
  window.class_.timeTables.splice(timeTableIndex,1)
  buildTimeTablesTable()
}
function applyTimeTableClick(){
  let dayKey = $(this).parents('td').data('dayKey')
  let uuid = $(this).parents('tr').data('timeTableUuid')
  window.class_.days[dayKey].timeTableUuid=uuid
}
function openTimeTableClick(){
  let uuid = $(this).parents('tr').data('timeTableUuid')
  console.log(window.launchTimeTableEditor(uuid))
}
$(function(){
  $('#addTimeTable').on('click',addTimeTableClick)
  $('#timeTablesEditMode').on('change',timeTablesEditModeChange)
  $('#timeTables').on('click','.timeTable .ui-icon-trash',deleteTimeTableClick)
  $('#timeTables').on('click','.applyTimeTable',applyTimeTableClick)
  $('#timeTables').on('click','.openTimeTable',openTimeTableClick)
})
