const {app, BrowserWindow} = require('electron');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      height: 1200,
      width: 1200
  });

  mainWindow.loadURL('file://' + __dirname + './imprezi/index.html');
});
