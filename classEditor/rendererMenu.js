
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
         click:window.launchProgramEditor
       },
       {
         label:'&Consultation de programmes',
         click:window.launchProgramBrowser
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
