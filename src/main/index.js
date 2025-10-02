// main/index.js
import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import icon from '../../resources/icon.ico?asset';

// ✅ Импортируем функцию подключения к БД
import connectDB from './db.js';

let globalDbClient;

async function authorize(event, user) {
  const { login, password } = user;
  try {
    const response = await globalDbClient.query(
      `SELECT LOGIN, FULLNAME, PASSWORD, ROLE FROM EMPLOYEES`
    );
    const foundUser = response.rows.find(u => u.login === login && u.password === password);
    if (foundUser) {
      return { role: foundUser.role, name: foundUser.fullname };
    } else {
      console.log('❌ Пользователь не найден или неверный пароль');
      return null;
    }
  } catch (err) {
    console.error('❌ Ошибка в authorize:', err.message);
    throw err;
  }
}

async function getGoods(event) {
  try {
    const response = await globalDbClient.query(`SELECT * FROM goods`);
    console.log(`✅ Загружено товаров: ${response.rows.length}`);
    return response.rows;
  } catch (err) {
    console.error('❌ Ошибка при загрузке товаров:', err.message);
    throw err;
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
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron');

  // ✅ Подключаемся к БД
  try {
    globalDbClient = await connectDB();
  } catch (err) {
    console.error('❌ Критическая ошибка подключения к БД:', err.message);
    app.quit();
    return;
  }

  // ✅ Регистрируем IPC-обработчики
  ipcMain.handle('authorizeUser', authorize);
  ipcMain.handle('getGoods', getGoods);

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
