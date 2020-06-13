
const template = [
  {
    role:'fileMenu',
    submenu:[
      {
        label:'&Nouvelle classe',
        //click:newProgram,
        accelerator:'CommandOrControl+N'
      },
      {
        label:'&Ouvrir',
        //click:openProgram,
        accelerator:'CommandOrControl+O'
      },
      {
        label:'&Enregistrer',
        //click:saveProgram,
        accelerator:'CommandOrControl+S'
      },
      {
        label:'&Enregistrer sous',
        //click:saveProgramAs,
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
         click:window.launchProgramEditor
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
