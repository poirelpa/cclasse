
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

$(function(){
  $('#apply').click(()=>{
    window.closeWindow('a')
  })
  options = window.getOptions()
  console.log(options)
  if(options.program){
    loadProgramFile(window.getProgramsPath()+'/'+options.program)
  }
})
