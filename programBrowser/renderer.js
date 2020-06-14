
const template = [
  {
    role:'fileMenu',
    submenu:[
      {
        label:'&Ouvrir',
        click:openProgram,
        accelerator:'CommandOrControl+O'
      }
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

function openProgram(menuItem, browserWindow, event){
  window.getOpenProgramPath().then(r => {
    let path = r.filePaths?.[0]
    if(path){
      window.openProgramFile(path).then(p=>{
          p.filePath = path
          displayProgram(p)
      })
    }
  })
}

function displayProgram(program){
  window.program = program
  $('#programName').val(program.name)
  loadReference(program.reference)
  let $programItems = $('#programItems').empty()
  let addItems = function(items,level){
    items.forEach((item, i) => {
      item.level=level
      addItem(item).css('display',level ? 'none':'flex')
      addItems(item.items, level+1)
    });
  }
  addItems(window.program.items, 0)

  $('.highlight',$programItems).each((i,highlight)=>{
    // open parents
    let $highlight = $(highlight)
    let level = $highlight.data('level')

    $highlight.prevAll().each((i,prev)=>{
      if($(prev).data('level')==level-1){
        $('.ui-icon-zoomin',$(prev)).trigger('click')
        level --
      }
    })

    $highlight.css('background-color',$highlight.css('background-color').replace(')',',0.5)'))
  })

  $('#program').show()
}

function addItem(item={}){
  item.name = item.name || ""
  item.referenceXPath = item.referenceXPath || ""
  item.level = item.level || 0
  item.color = item.color || "#ffffff"


  let $li = $(`<li><span class="name">${item.name}</span><a class="link" href="#"><span class="ui-icon ui-icon-link"></span></a><a href="#" class="zoom"><span class="ui-icon ui-icon-zoomin"></span></a><a href="#" class="select"><span class="ui-icon ui-icon-check"></span></a></li>`)
    .appendTo('#programItems')
    .data('level',item.level).css('margin-left',item.level*15)
    .data('color',item.color).css('background-color',item.color)
    .data('uuid',item.uuid)
    .data('xpath',item.referenceXPath)
  if(item.referenceXPath){
    $('a.link', $li).css('visibility','visible')
  }
  if(item.uuid == options.item){
    $li.addClass('highlight')
  }
  if(!options.select){
    $('a.select', $li).data('xpath',item?.referenceXPath).hide()
  }
  return $li
}

function loadReference(fileName){

  $('#reference').show().text('chargement en cours ...').load(window.getReferencesPath()+'/'+fileName)
}

function zoomClick(){
  let $li = $(this).parent()
  let minLevel = $li.data('level')

  let show = []

  show[minLevel+1] = $('a.zoom .ui-icon', $li).toggleClass('ui-icon-zoomin ui-icon-zoomout').hasClass('ui-icon-zoomout')
  $li = $li.next()
  let level = $li.data('level')
  while($li.length && level>minLevel){
    level = $li.data('level')
    show[level] ? $li.show() : $li.hide()
    show[level+1] = show[level] && $('a.zoom .ui-icon', $li).hasClass('ui-icon-zoomout')

    $li = $li.next()
  }
  return false
}

function linkClick(){
  let $i = $(document.evaluate($(this).parent().data('xpath'), document, null, XPathResult.ANY_TYPE, null).iterateNext())
  let $reference = $('#reference')
  $reference.stop(true,true).animate({
      'scrollTop': $i.position().top + $reference.scrollTop()-10
  }, 400, 'swing')
  $i.stop(true,true).effect('highlight',2000)

  return false
}

function selectClick(){
  let $li = $(this).parent()
  let selection = {
    name:$('.name',$li).text(),
    uuid:$li.data('uuid'),
    color:$li.data('color'),
    referenceXPath:$li.data('xpath')
  }
  window.closeWindow(selection)
}

var options

$(function(){
  options = window.getOptions()
  if(options.program){
    let program = window.openProgramFile(window.getProgramsPath()+'/'+options.program).then(displayProgram)
  }



  $('#programItems').on('click','a.link',linkClick)
  $('#programItems').on('click','a.zoom',zoomClick)
  $('#programItems').on('click','a.select',selectClick)
})
