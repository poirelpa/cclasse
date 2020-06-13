
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
      name:$('input',$li).val(),
      referenceXPath:$('a',$li).data('xpath'),
      items:[]
    }
    currentItemsByLevel[level].items.push(item)
    currentItemsByLevel[level+1] = item
    return {
      name:$('input',li).val(),
      referenceXPath:$('a',li).data('xpath')
    }
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
  let $li = $(`<li><input value="${item.name}"/><a href="#"><span class="ui-icon ui-icon-link"></span></a></li>`)
    .appendTo('#programItems')
    .data('level',item.level || 0).css('margin-left',item.level*15)
  if(item.referenceXPath){
    $('a', $li).data('xpath',item?.referenceXPath).css('display','inline')
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
      let xpath = getPathTo(e.target)
      let $i = $(document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext())
      $i.effect('transfer',{ to: "#programItems .currentItem .ui-icon-link", className: "ui-effects-transfer" })
      $('a',$currentITem).data('xpath',xpath).css('display','inline')
      $('input',$currentITem).val(textTruncate($i.text(),80)).select()
    }
    $('input',$currentITem).focus()
  })

  $('#programItems').on('click','a',function(){
    let $i = $(document.evaluate($(this).data('xpath'), document, null, XPathResult.ANY_TYPE, null).iterateNext())
    $reference.stop(true,true).animate({
        'scrollTop': $i.position().top + $reference.scrollTop()
    }, 400, 'swing')
    $i.stop(true,true).effect('highlight',2000)

    return false
  })

  $('#programItems').on('mousedown','li',function(){
    let $li = $(this)
    $('.currentItem').removeClass('currentItem')
    $li.addClass('currentItem')
    $('input',$li).focus()
  })
  $('#programItems').on('keydown','input',function(e){

    let $li
    if(e.key=="Enter"){
      let $prev=$(this).parent()
      let level = ($prev.data('level') || 0)+1
      $li = addItem({level:level}).insertAfter($prev)
      $li.data('level',level).css('margin-left',level*15)
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
      $('input',$li).focus()
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
