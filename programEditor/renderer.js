
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
  let items=$('#programItems li').map((i, li) => {
    return {
      name:$('input',li).val(),
      referenceXPath:$('a',li).data('xpath')
    }
    console.log(item)
  }).get();

  Object.assign(window.program,{
    name:$('#programName').val(),
    reference:$('#programReference').val(),
    items:items
  })
  console.log(window.program)
}

function displayProgram(program){
  console.log(program)
  window.program = program
  $('#programName').val(program.name)
  if(program.reference){
    $('#programReference').val(program.reference).change()
  }
  let $programItems = $('#programItems').empty()
  window.program.items.forEach((item, i) => {
    addItem(item)
  });
  if(!window.program.items.length){
    addItem()
  }
  $('li',programItems).first().addClass('currentItem')

  $('#program').show()
}

function addItem(item={name:'',referenceXPath:''}){
  let $li = $(`<li><input value="${item.name}"/><span class="ui-icon ui-icon-link"></span><a href="#"></a></li>`)
    .appendTo('#programItems')
  $('a', $li).data('xpath',item.referenceXPath)
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
    $('#programItems a').each((i,item)=>{
      let $item = $(item)
      let $i = $(document.evaluate($item.data('xpath'), document, null, XPathResult.ANY_TYPE, null).iterateNext())
      $item.text(textTruncate($i.text(),30))
    })
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
      $('a',$currentITem).data('xpath',xpath).text(textTruncate($i.text(),30))
      $('input',$currentITem).val(textTruncate($i.text(),80)).select()
    }
    $('input',$currentITem).focus()
  })

  $('#programItems').on('click','a',function(){
    let $i = $(document.evaluate($(this).data('xpath'), document, null, XPathResult.ANY_TYPE, null).iterateNext())
    $reference.animate({
        'scrollTop': $i.position().top + $reference.scrollTop()
    }, 400, 'swing')
    $i.effect('highlight',2000)

    return false
  })

  $('#programItems').on('keydown','input',function(e){

    let $li
    if(e.key=="Enter"){
      $li = addItem()
    } else if(e.key=="ArrowUp"){
      $li = $(this).parent().prev()
    } else if(e.key=="ArrowDown"){
      $li = $(this).parent().next()
    } else if(e.key=="Tab" && e.shiftKey){
      $li=$(this).parent()
      let level = Math.max(0, ($li.data('level') || 0)-1)
      $li.data('level',level).css('margin-left',level*15)
      console.log($li.data('level'))
    } else if(e.key=="Tab"){
      $li=$(this).parent()
      let level = ($li.data('level') || 0)+ 1
      $li.data('level',level).css('margin-left',level*15)
      console.log($li.data('level'))
    } else {
      console.log(e.key)
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
