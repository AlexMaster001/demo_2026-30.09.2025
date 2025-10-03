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

async function addGood(event, goodData) {
  const { article, type, category, manufacturer, supplier, description, price, measure, quantity, discount, image_path } = goodData;
  try {
    await globalDbClient.query(
      `INSERT INTO goods (article, type, category, manufacturer, supplier, description, price, measure, quantity, discount, image_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [article, type, category, manufacturer, supplier, description, price, measure, quantity, discount, image_path || 'picture.png']
    );
    return { success: true };
  } catch (err) {
    console.error('❌ Ошибка при добавлении товара:', err.message);
    throw new Error('Не удалось добавить товар');
  }
}

async function updateGood(event, goodData) {
  const { id, article, type, category, manufacturer, supplier, description, price, measure, quantity, discount, image_path } = goodData;
  try {
    await globalDbClient.query(
      `UPDATE goods SET article=$1, type=$2, category=$3, manufacturer=$4, supplier=$5, description=$6, 
                        price=$7, measure=$8, quantity=$9, discount=$10, image_path=$11 WHERE id=$12`,
      [article, type, category, manufacturer, supplier, description, price, measure, quantity, discount, image_path, id]
    );
    return { success: true };
  } catch (err) {
    console.error('❌ Ошибка при обновлении товара:', err.message);
    throw new Error('Не удалось обновить товар');
  }
}

async function deleteGood(event, id) {
  try {
    // Проверяем, есть ли товар в заказах
    const orderCheck = await globalDbClient.query('SELECT * FROM orders WHERE good_id = $1', [id]);
    if (orderCheck.rows.length > 0) {
      return { success: false, message: 'Товар нельзя удалить — он присутствует в заказе' };
    }

    await globalDbClient.query('DELETE FROM goods WHERE id = $1', [id]);
    return { success: true };
  } catch (err) {
    console.error('❌ Ошибка при удалении товара:', err.message);
    return { success: false, message: 'Ошибка при удалении товара' };
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

async function getOrders(event) {
  try {
    const response = await globalDbClient.query(`
      SELECT o.*, g.article as good_article 
      FROM orders o 
      JOIN goods g ON o.good_id = g.id
      ORDER BY o.created_at DESC
    `);
    return response.rows;
  } catch (err) {
    console.error('❌ Ошибка при загрузке заказов:', err.message);
    throw err;
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
  ipcMain.handle('addGood', addGood);
  ipcMain.handle('updateGood', updateGood);
  ipcMain.handle('deleteGood', deleteGood);
  ipcMain.handle('getOrders', getOrders);

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
