import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'

import connectDB from './db';

async function authorize(event, user) {
  const { login, password } = user;

  try {
    const response = await global.dbclient.query(`SELECT LOGIN, FULLNAME, PASSWORD, ROLE FROM EMPLOYEES`);
    const user = response.rows.find((user) => user.login === login && user.password === password);
    if (user) {
      return { role: user.role, name: user.fullname };
    } dialog.showErrorBox('Такого пользователя нет', 'Попробуйте ввести другой логин и/или пароль')
  } catch (e) {
    return ('error')
  }
}
async function getGoods(event) {
  try {
    const response = await global.dbclient.query(`SELECT * from goods`);
    return response.rows;
  } catch (e) {
    return ('error')
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../resources/icon.ico'),
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  global.dbclient = await connectDB();

  ipcMain.handle('authorizeUser', authorize)
  ipcMain.handle('getGoods', getGoods)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
