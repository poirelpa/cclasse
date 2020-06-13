
const template = [
  {
    role:'fileMenu',
    submenu:[
      {
        label:'&Nouveau',
        click:newProgram,
        accelerator:'CommandOrControl+N'
      },
      {
        label:'&Ouvrir',
        click:openProgram,
        accelerator:'CommandOrControl+O'
      },
      {
        label:'&Enregistrer',
        click:saveProgram,
        accelerator:'CommandOrControl+S'
      },
      {
        label:'&Enregistrer sous',
        click:saveProgramAs,
        accelerator:'CommandOrControl+Shift+S'
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

class Program{
  constructor(name='nouveau programme', filePath=''){
    this.filePath = filePath
    this.name = name
    this.items = []
  }
  static fromJSON(o){
    return Object.assign(new Program(), o)
  }
}



function openProgram(menuItem, browserWindow, event){
  window.getOpenProgramPath().then(r => {
    let path = r.filePaths?.[0]
    if(path){
      window.openProgramFile(path).then(r=>{
          var p = Program.fromJSON(JSON.parse(r))
          p.filePath = path
          displayProgram(p)
      })
    }
  })
}

function saveProgram(menuItem, browserWindow, event){
  if(!window.program.filePath)
    return saveProgramAs(menuItem, browserWindow, event)
  updateProgram()

  window.saveProgramFile(window.program, window.program.filePath).then(noResult=>{
    //ok, pas d'argument
  })
}



function saveProgramAs(menuItem, browserWindow, event){
  updateProgram()
  window.getSaveProgramPath(window.program.name).then(r=>{
    let path = r?.filePath
    if(path){
      window.program.filePath = path
      saveProgram(menuItem, browserWindow, event)
    }
  })
}

function newProgram(menuItem, browserWindow, event){
  let program = new Program()
  displayProgram(program)
}


function updateProgram(){

  Object.assign(window.program,{
    name:$('#programName').val(),
    reference:$('#programReference').val(),
  })

  window.program.items=[]
  let currentItemsByLevel=[window.program]
  let currentLevel = 0
  $('#programItems li').each((i, li) => {
    let $li = $(li)
    let level = $li.data('level')
    let item={
      name:$('input.name',$li).val(),
      color:$('input.color',$li).val(),
      referenceXPath:$('a.link',$li).data('xpath'),
      uuid:$li.data('uuid')||uuid(),
      items:[]
    }
    currentItemsByLevel[level].items.push(item)
    currentItemsByLevel[level+1] = item
  })
  return window.program
}

function displayProgram(program){
  console.log(program)
  window.program = program
  $('#programName').val(program.name)
  if(program.reference){
    $('#programReference').val(program.reference).change()
  }
  let $programItems = $('#programItems').empty()
  let addItems = function(items,level){
    items.forEach((item, i) => {
      item.level=level
      addItem(item)
      addItems(item.items, level+1)
    });
  }
  addItems(window.program.items, 0)
  if(!window.program.items.length){
    addItem()
  }
  $('li',programItems).first().addClass('currentItem')

  $('#program').show()
}

function addItem(item={}){
  item.name = item.name || ""
  item.referenceXPath = item.referenceXPath || ""
  item.level = item.level || 0
  item.color = item.color || "#ffffff"
  let $li = $(`<li><input class="name"value="${item.name}"/><input class="color" type="color" value="${item.color}"><a class="link" href="#"><span class="ui-icon ui-icon-link"></span></a><a href="#" class="zoom"><span class="ui-icon ui-icon-zoomout"></span></a><a href="#" class="delete"><span class="ui-icon ui-icon-trash"></span></a></li>`)
    .appendTo('#programItems')
    .data('level',item.level || 0).css('margin-left',item.level*15)
    .data('uuid',item.uuid)
  if(item.referenceXPath){
    $('a.link', $li).data('xpath',item?.referenceXPath).css('visibility','visible')
  }
  return $li
}

function loadReferences(){
  let $references=$('#programReference').empty()
  $references.append('<option></option>')
  window.getReferencesFilesList().then(files=>{
    files.filter(f =>{
      return f.endsWith('.html') || f.endsWith('.htm')
    }).forEach((f, i) => {
      $references.append(`<option value="${f}">${window.extractPath(f).name}</option>`)
    });

    //$references.selectmenu('refresh')
  })
}

$('#importReference').on('click',e=>{
  window.getImportReferencePath().then(r => {
    let filePath = r.filePaths?.[0]
    if(filePath){
      let name = window.extractPath(filePath).name
      name = window.prompt("Import d'une référence","Renseigner le nom de la référence",name)
      if(name){
        window.importReferenceFile(filePath,name).then(noResult=>{
          loadReferences()
        })
      }
    }
  })
})

function loadReference(fileName){
  $reference.load(window.getReferencesPath()+'/'+fileName,function(){
    $reference.show()
  })
}

function getPathTo(element){
  if (element.id!=='')
      return 'id("'+element.id+'")';
  if (element===document.body)
      return element.tagName;

  let ix= 0;
  let siblings= element.parentNode.childNodes;
  for (var i= 0; i<siblings.length; i++) {
      var sibling= siblings[i];
      if (sibling===element)
          return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
      if (sibling.nodeType===1 && sibling.tagName===element.tagName)
          ix++;
  }
}

function textTruncate (str, length=100, ending=" …") {
    if (str.length > length) {
      str = str.substring(0, length - ending.length)
      return str.substr(0, str.lastIndexOf(" ")) + ending;
    } else {
      return str;
    }
  }

$(function(){
  loadReferences()
  $reference = $('#reference')
  $('#programReference').on('change',function(){
    loadReference(this.value)
  })

  $reference.on('click',e=>{
    $currentITem = $('#programItems .currentItem')
    if(e.ctrlKey){
      let $a = $('a.link',$currentITem)
      let $input =$('input.name',$currentITem)
      if(!$a.data('xpath') || window.confirm('Ecraser le lien existant ?')){
        let xpath = getPathTo(e.target)
        let $i = $(document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext())
        $a.data('xpath',xpath).css('visibility','visible')
        $i.effect('transfer',{ to: "#programItems .currentItem .ui-icon-link", className: "ui-effects-transfer" })
        console.log(textTruncate($i.text(),200).trim())
        if(!$input.val()) $input.val(textTruncate($i.text(),200).trim().replace(/\s+/mg,' ').replace(/^[–→·Ø-]\s*/,'').replace(/\s*[.;:]$/,''))
      }
      $input.focus().select()
    }
  })

  $('#programItems').on('click','a.link',function(){
    let $i = $(document.evaluate($(this).data('xpath'), document, null, XPathResult.ANY_TYPE, null).iterateNext())
    $reference.stop(true,true).animate({
        'scrollTop': $i.position().top + $reference.scrollTop()-10
    }, 400, 'swing')
    $i.stop(true,true).effect('highlight',2000)

    return false
  })
  $('#programItems').on('click','a.zoom',function(){
    let $li = $(this).parent()
    let minLevel = $li.data('level')
    let show=-1

    $('a.zoom .ui-icon', $li).toggleClass('ui-icon-zoomin ui-icon-zoomout')
    $li = $li.next()
    while($li.length && $li.data('level')>minLevel){
      if(show==-1) show=($li.css('display')=='none')
      show ? $li.show() : $li.hide()
      $li = $li.next()
    }
    return false
  })
  $('#programItems').on('click','a.delete',function(){
    let $li = $(this).parent()
    if(!$li.siblings().length){
      window.alert("impossible de supprimer la seule competence")
      return false
    }
    if($li.next().data('level')>$li.data('level')){
      window.alert("impossible de supprimer une competence ayant des enfants")
      return false
    }

    if((!$('input.name',$li).val() && !$('a.link',$li).data('xpath')) || window.confirm("Supprimer cet élément ?"))
      $(this).parent().remove()
    return false
  })

  $('#programItems').on('mousedown','li',function(){
    let $li = $(this)
    $('.currentItem').removeClass('currentItem')
    $li.addClass('currentItem')
    $('input.name',$li).focus()
  })
  $('#programItems').on('change','input.color',function(e){
    if(!confirm('Appliquer aux enfants ?')) return false
    let $li = $(this).parent()
    let minLevel = $li.data('level')

    $li = $li.next()
    while($li.length && $li.data('level')>minLevel){
      $('input.color',$li).val(this.value)
      $li = $li.next()
    }
    return false
  })
  $('#programItems').on('keydown','input.name',function(e){

    let $li
    if(e.key=="Enter"){
      let $prev=$(this).parent()
      let level = ($prev.data('level') || 0)
      $li = addItem({level:level}).insertAfter($prev)
      $li.data('level',level).css('margin-left',level*15)
      $('input.color',$li).val($('input.color',$prev).val())
    } else if(e.key=="ArrowUp"){
      $li = $(this).parent().prev()
    } else if(e.key=="ArrowDown"){
      $li = $(this).parent().next()
    } else if(e.key=="Tab" && e.shiftKey){
      $li=$(this).parent()
      let level = Math.max(0, ($li.data('level') || 0)-1)
      $li.data('level',level).css('margin-left',level*15)
    } else if(e.key=="Tab"){
      $li=$(this).parent()
      $prev = $li.prev()
      let level = Math.min($prev.data('level')+1,($li.data('level') || 0)+ 1)
      $li.data('level',level).css('margin-left',level*15)
    } else {
      return true
    }
    if($li.length){
      $('.currentItem').removeClass('currentItem')
      $li.addClass('currentItem')
      $('input.name',$li).focus()
    }

    return false
  })


  var path='C:/Users/poirelp/AppData/Roaming/CClasse/storage/programmes/tata.json'
  window.openProgramFile(path).then(r=>{
    var p = Program.fromJSON(JSON.parse(r))
    p.filePath = path
    displayProgram(p)
  })
})
