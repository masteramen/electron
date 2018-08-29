// Modules to control application life and create native browser window
const electron = require('electron')
const {app, BrowserWindow,Tray,globalShortcut } = electron
const Menu = electron.Menu
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
console.log('start')
function registerListener(session, opts = {}, cb = () => {}) {

  var onHeadersReceived=(d, c)=>{
    if(d.responseHeaders['x-frame-options']) {
      delete d.responseHeaders['x-frame-options'];
    }
    c({cancel: false, responseHeaders: d.responseHeaders});
  }

  session.webRequest.onHeadersReceived({}, onHeadersReceived);
}


function createWindow () {
  // Create the browser window.
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({
titleBarStyle: 'hidden',
useContentSize:true,
	  width: 500, height: 500,
	  frame:false,
	  transparent:true,
	  webPreferences:{webSecurity:false}})
  //win.setIgnoreMouseEvents(true)
  //win.setAlwaysOnTop(true, 'screen');

  // and load the index.html of the app.
  //win.loadFile('index.html')
  win.loadURL('http://localhost:3006/')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
  
  const tray = new Tray('icon.png')
  
  /*tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })*/
  win.on('show', () => {
    tray.setHighlightMode('always')
  })
  win.on('hide', () => {
    tray.setHighlightMode('never')
  })
  registerListener(win.webContents.session, {}, (err, item) => {});

  const contextMenu = Menu.buildFromTemplate([{
    label: 'Toggle',
	type: 'radio',
    click: function () {
		//appIcon.destroy()
		win.isVisible() ? win.hide() : win.show()
      //event.sender.send('tray-removed')
    }
  },
{
    label: 'Exit',
    click: function () {
		//appIcon.destroy()
		app.quit()
      //event.sender.send('tray-removed')
    }
  }
  ])
  tray.setToolTip('Hello')
  tray.setContextMenu(contextMenu)
  
    const shortcut = globalShortcut.register('Control+F1', () => {
    win.hide();
  });
  globalShortcut.register('Control', () => {
    console.log('CommandOrControl+X is pressed')
    win.hide();
  })
  if (!shortcut) { console.log('Registration failed.'); }
  
}
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
if (win) {
if (win.isMinimized()) win.restore()
win.focus()
}
})
if (shouldQuit) {
app.quit()
return
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('session-created', session => {
  registerListener(session, {});
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  if (tray) tray.destroy()
})


app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }

  
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
/*app.on('browser-window-blur',function(type){
		
		const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
		const size = win.getSize()
		console.log(size)
		let x = (width-win.getSize()[0])/2
		let y = -win.getSize()[1]+2
		//console.log({x:x,y:y})
		win.setPosition(parseInt(x),parseInt(y),true)
});
app.on('browser-window-focus',function(type){

		const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
		const size = win.getSize()
		//console.log(size)
		let x = (width-win.getSize()[0])/2
		let y = win.getSize()[1]
		//console.log({x:x,y:y})
		win.setPosition(parseInt(x),parseInt(y),true)
});*/



