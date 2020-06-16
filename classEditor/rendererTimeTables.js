
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
  let $tr = this.parents('tr')
  let top = this.position().top+5
  let oldIndex = $tr.data('timeTableIndex')

  do{
    if(top <0){
      $tr = $tr.prev()
      top += $tr.outerHeight()
    }else if(top >$tr.outerHeight()){
      top -= $tr.outerHeight()
      $tr = $tr.next()
    }else {
      let newIndex = $tr.data('timeTableIndex')
      if(newIndex == oldIndex) return true

      if(top > $tr.outerHeight() /2)
        newIndex ++

      if(newIndex > oldIndex)
        newIndex --
      window.class_.timeTables.splice(newIndex, 0,  window.class_.timeTables.splice(oldIndex, 1)[0])
      buildTimeTablesTable()
      return false
    }
  }while($tr.length)

  return true
}

function addTimeTableClick(){
  window.class_.timeTables = window.class_.timeTables || []
  let newTimeTable = {
    name:'nouvel emploi du temps',
    uuid:uuid(),
    days:[]
  }
  getValidDays().forEach((valid, day) => {
    newTimeTable.days[day]=valid ? defautDay = {
      validDay:true,
      timeTableUuid:newTimeTable.uuid
    } : {}
  });
  window.class_.timeTables.push(newTimeTable)

  buildTimeTablesTable()
  return false
}

function timeTablesEditModeChange(){
  let show = $('#timeTablesEditMode').get(0).checked
  $('span.ui-icon:not(.ui-icon-calculator)','#timeTables').css('display',show?'inline-block':'none')
  $('#timeTablesEdit').css('display',show?'block':'none')
  $(':radio','#timeTables').css('display',show?'inline-block':'none');
  $('.ui-icon-check','#timeTables').remove()
  if(!show){
    $(':radio:checked','#timeTables').after('<span class="ui-icon ui-icon-check">✓</span>')
  }
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
  let index = $(this).parents('tr').data('timeTableIndex')
  let dayDate = $.datepicker.parseDate('yymmdd',dayKey)

  if(window.class_.days[dayKey].timeTableUuid==window.class_.timeTables[index].uuid) return

  do{
    if(window.class_.days.hasOwnProperty(dayKey)){
      window.class_.days[dayKey].timeTableUuid=window.class_.timeTables[index].uuid
      window.class_.days[dayKey].timeTable=window.class_.timeTables[index].days?.[dayDate.getDay()]
    }
    dayKey++
    dayDate.setDate(dayDate.getDate()+1)
  }while(dayDate.getDay()>0)
}

function openTimeTableClick(){
  let index = $(this).parents('tr').data('timeTableIndex')
  console.log(window.launchTimeTableEditor(window.class_.timeTables[index]))
}
$(function(){
  $('#addTimeTable').on('click',addTimeTableClick)
  $('#timeTablesEditMode').on('change',timeTablesEditModeChange)
  $('#timeTables').on('click','.timeTable .ui-icon-trash',deleteTimeTableClick)
  $('#timeTables').on('click','.applyTimeTable',applyTimeTableClick)
  $('#timeTables').on('click','.openTimeTable',openTimeTableClick)
})
