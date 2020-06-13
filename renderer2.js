// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

async function init(){
  $('#program').load('./cycle3.html')
  $('#main-tabs').tabs();
  $.datepicker.setDefaults( $.datepicker.regional[ "fr" ] );

  // programmes
  let programmes = (await getProgrammesList())
    .filter((f)=>{
      return f.endsWith('.json')
    })
    .map((f)=>{
      return f.slice(0,-5)
    })

  let ul = $('#programmes')
  programmes.forEach((p) => {
    ul.append(`<li><a href="${p}">${p}</a></li>`)
  });
  ul.on('click','a',(e)=>{
    e.preventDefault()
    let nom = $(e.target).attr('href')
    openProgramme(nom)
  })

  refreshClasses()

  $('button').button()

  $('#classes-ajout').on('click',(e)=>{
    openClasse()
  })
}

async function refreshClasses(){
  let classes = (await getClassesList())
    .filter((f)=>{
      return f.endsWith('.json')
    })
    .map((f)=>{
      return f.slice(0,-5)
    })
  ul = $('#classes').empty()
  classes.forEach((c) => {
    ul.append(`<li><a href="${c}">${c}</a></li>`)
  });
  ul.on('click','a',(e)=>{
    e.preventDefault()
    let nom = $(e.target).attr('href')
    openClasse(nom)
  })
}

function programme2html(o){
  if(typeof o == "string") return `<h3 class="ui-accordion-header ui-state-default ui-accordion-header-collapsed ui-corner-all">${o}</h3><div></div>`
  if(o.hasOwnProperty("nom")) {
    let html=[]
    html.push('<div class="accordion">')
    html.push(`<h3>${o.nom}</h3>`)
    html.push('<div>')
    for (var p in o) {
      if(p=="nom") {
      } else if(typeof o[p]== "string"){
        html.push(`<div class="${p}"><b>${p} : </b>${o[p].replace(/\n/g,'<br/>')}</div>`)
      } else if(p == "competences") {
        o[p].forEach((c, i) => {
          html.push(programme2html(c))
        });
      }
    }
    html.push('</div></div>')
    return html.join('')
  }
}

async function openProgramme(nom){
  openTab(nom,async function(div){

    let programme = await window.loadProgramme(nom);
    div.html(programme2html(programme))
    $('.accordion',div).accordion({
      collapsible:true,
      heightStyle: "content",
      active:false
    })
    $('.accordion',div).first().accordion({
      active:0
    })
  })
}

function openTab(nom, callback){
  let tabs = $('#main-tabs')
  if($("#"+nom,tabs).length == 0){

    let div = $(`<div id="${nom}"></div>`).appendTo(tabs)
    let li = $(`<li><a href="#${nom}">${nom}</a></li>`).appendTo($('ul',tabs))

    $('<button><span class="ui-icon ui-icon-close">Fermer</span></button>')
      .button()
      .on('click',()=>{
        li.remove()
        div.remove()
        tabs.tabs('refresh')
      }).appendTo(li)

    tabs.tabs('refresh')
    callback(div,li)
  }
  let index =$('.ui-tabs-panel',tabs).index($('#'+nom));
  tabs.tabs({active:index})
}

async function openClasse(p){
  let classe
  if(typeof p == "Object")
    classe = p
  else if(typeof p == "string")
    classe = await window.loadClasse(p)
  else
    classe = {nom:"nouvelle-classe",programmations:{},jours:{}}

  openTab(classe.nom,(div,li)=>{
    div.load('./classe.html',()=>{
      $('input[name="nom"]',div)
        .val(classe.nom)
        .on('keyup',(e)=>{
          classe.nom = e.target.value
          $('a',li).text(classe.nom)
        })
      $('button.sauvegarder',div).on('click',async function(e){
        try{
          await window.saveClasse(classe)
          await refreshClasses()
        }catch(e){
          if(e.message.includes("EEXIST")){
            if(confirm("Voulez-vous écraser le fichier existant ?")){
                await window.saveClasse(classe,true)
                await refreshClasses()
            }
          }else throw e
        }
      })
      $('input[name="ajoutPeriodeDebut"],input[name="ajoutPeriodeFin"]',div).datepicker()
      $('.ajouter-periode',div).on('click',()=>{
        let debut = $('input[name="ajoutPeriodeDebut"]').datepicker('getDate')
        let fin = $('input[name="ajoutPeriodeFin"]').datepicker('getDate')
        if(fin < debut){
          let toto = fin
          fin = debut
          debut = toto
        }
        classe.jours = classe.jours||{}

        while(debut <= fin){
          if([1,2,4,5].indexOf(debut.getDay())>=0) // TODO config
            classe.jours[$.datepicker.formatDate('yymmdd',debut)]=null
          debut.setDate(debut.getDate()+1)
        }
        console.log(classe.jours)

        refreshAgenda(classe,div)
      })

      $('.ajouter-programmation',div).on('click',()=>{
        classe.programmations = classe.programmations || {}
        classe.programmations[$('input[name="ajoutProgrammation"]').val()]={}
        refreshAgenda(classe,div)
      })

      refreshAgenda(classe,div)
      $('form',div).on('change',(e)=>{
        $('a',li).addClass('changed')
      })
    })
  })
}

function refreshAgenda(classe,div,options={display:"year"}){
  classe.programmations = classe.programmations||{}
  classe.jours = classe.jours||{}



  if(display = "year"){

    let $agenda = $('table.agenda',div).empty()
    let $dateLine = $('<tr><th>Matière</th></tr>').appendTo($agenda)
    let $programmations = {}

    for (var p in classe.programmations) {
      if (classe.programmations.hasOwnProperty(p)) {
          $programmations[p]=$(`<tr><th>${p}</th></tr>`).appendTo($agenda)
      }
    }

    let dmoinsun = null
    let wmoinsun = null
    let d

    for (var j in classe.jours) {
      if (classe.jours.hasOwnProperty(j)) {
        let d = $.datepicker.parseDate("yymmdd",j)
        if(dmoinsun == null || d.getDay()<dmoinsun.getDay() || (d.getTime() - wmoinsun.getTime() > 1000*60*60*24*6)){
          let f = $.datepicker.formatDate('d/m',d)
          let $th = $(`<th>${f}</th>`).appendTo($dateLine)
          let rentree = d.getTime() - wmoinsun?.getTime() > 1000*60*60*24*13
          if(rentree)
            $th.addClass('rentree')
          //$dateLine.append($th)

          for (var p in classe.programmations) {
            if (classe.programmations.hasOwnProperty(p)) {

                let nom = p
                let programmation = classe.programmations[nom]
                let $td = $('<td>').appendTo($programmations[nom])
                if(rentree)
                  $td.addClass('rentree')
                if(programmation.progressions){
                  //todo
                } else {
                  $('<a>+</a>').appendTo($td).on('click',()=>{
                    ajouterProgression(classe,nom,d);
                  })
                }
            }
          }
          wmoinsun = d
        }
        dmoinsun = d
      }
    }
  }

}

function ajouterProgression(classe,programmation,date){
  console.log(programmation)
  console.log(date)
}

init()
