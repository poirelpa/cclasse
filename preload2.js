const {remote} = require('electron')
const fs = require('fs')
const path = require('path')

window.json2html = require('node-json2html')

window.getProgrammesList = async function (){
  return new Promise((resolve,reject)=>{
    fs.readdir(path.join(remote.app.getPath("userData"),'storage','programmes'), (error, files) => {
      error ? reject(error) : resolve(files);
    });
  })
}

window.loadProgramme = async function(nom){
  return new Promise((resolve, reject)=>{
    fs.readFile(path.join(remote.app.getPath("userData"),'storage','programmes',nom + '.json'), 'utf8', function (error, data) {
      error ? reject(error) : resolve(JSON.parse(data));
    });
  })
}


window.getClassesList = async function (){
  return new Promise((resolve,reject)=>{
    fs.readdir(path.join(remote.app.getPath("userData"),'storage','classes'), (error, files) => {
      error ? reject(error) : resolve(files);
    });
  })
}

window.loadClasse = async function(nom){
  return new Promise((resolve, reject)=>{
    fs.readFile(path.join(remote.app.getPath("userData"),'storage','classes',nom + '.json'), 'utf8', function (error, data) {
      error ? reject(error) : resolve(JSON.parse(data));
    });
  })
}

window.saveClasse = async function(classe, force = false){
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(remote.app.getPath("userData"),'storage','classes',classe.nom + '.json'),JSON.stringify(classe),{flag:force?'w':'wx'},(err)=>{
      err ? reject(err) : resolve(null)
    })
  })
}
