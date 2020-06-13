
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
         click:window.launchClassEditor
       },
       {
         label:'&Consultation de programmes'
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
  buildProgrammationsTable(class_)
  $('#class').show()
  window.class_ = class_
}

function buildProgrammationsTable(class_){
  let $header = $('<tr><th>Programmations</th></tr>')
  let $programmations = $('#programmations').empty()
    .append($header)

  let $programmationRows = {}
  for (var p in class_.programmations) {
    if (class_.programmations.hasOwnProperty(p)) {
      $programmationRows[p]=$(`<tr><th>${p}</th></tr>`).appendTo($programmations)
    }
  }

  let prevDay
  let prevWeek
  for (var d in class_.days) {
    if (class_.days.hasOwnProperty(d)) {
      //console.log()
      let day = $.datepicker.parseDate("yy-mm-dd",d)
      if(prevDay == null || day.getDay()<prevDay.getDay() || (day.getTime() - prevWeek.getTime() > 1000*60*60*24*6)){
        let f = $.datepicker.formatDate('d/m',day)

        $header.append(`<th>${f}</th>`)

        let periodBreak = day.getTime() - prevWeek?.getTime() > 1000*60*60*24*13
        if(periodBreak)
          $th.addClass('periodBreak')

        for (var name in class_.programmations) {
          if (class_.programmations.hasOwnProperty(name)) {

              let programmation = class_.programmations[name]
              let $td = $('<td>').appendTo($programmationRows[name])
              if(periodBreak)
                $td.addClass('periodBreak')
              if(programmation.progressions){
                //todo
              } else {
                $('<a class="addProgression">+</a>').appendTo($td)
              }
          }
        }
        prevWeek = day
      }
      prevDay = day
    }
  }

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
        let k = $.datepicker.formatDate('yy-mm-dd',d)
        window.class_.days[k]=window.class_.days[k]||{}
      }
    }
    console.log(window.class_)
  buildProgrammationsTable()
}

function addProgrammationClick(){
  let name = $('#programmationName').val()
  if(!name) return
  window.class_.programmations = window.class_.programmations || {}
  if(window.class_.programmations.hasOwnProperty(name)) return

  window.class_.programmations[name]={}
  buildProgrammationsTable(window.class_  )
}

$(function(){
  loadPrograms()

  $('#addPeriod').on('click',addPeriodClick)
  $('#addProgrammation').on('click',addProgrammationClick)

  let path = "C:/Users/poirelp/AppData/Roaming/CClasse/storage/classes/toto.json"
    window.openClassFile(path).then(r=>{
        var c = JSON.parse(r)
        c.filePath = path
        displayClass(c)
    })
})
