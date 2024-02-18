import { app, BrowserWindow, dialog } from 'electron';
import { join } from 'path';
import { readFile } from 'fs/promises';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    showOpenDialog(mainWindow);
  });

  mainWindow.webContents.openDevTools({
    mode: 'detach',
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const showOpenDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Markdown Files', extensions: ['md'] }],
  });

  if (result.canceled) return;
  const [filePath] = result.filePaths;
  console.log(result);
  openFile(browserWindow, filePath);
};

const openFile = async (browserWindow: BrowserWindow, filePath: string) => {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  console.log(browserWindow, content);
};
