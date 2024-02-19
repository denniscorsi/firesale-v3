import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { join, basename } from 'path';
import { readFile, writeFile } from 'fs/promises';

type markdownFile = {
  content?: string;
  filePath?: string;
};

const hasChanges = (content: string) => {
  return currentFile.content != content;
};

let currentFile: markdownFile = {
  content: '',
  filePath: undefined,
};

const setCurrentFile = (
  browserWindow: BrowserWindow,
  filePath: string,
  content: string
) => {
  currentFile.filePath = filePath;
  currentFile.content = content;

  app.addRecentDocument(filePath);
  browserWindow.setTitle(`${basename(filePath)} - ${app.name}`);
  browserWindow.setRepresentedFilename(filePath);
};

const getCurrentFile = async (browserWindow: BrowserWindow) => {
  if (currentFile.filePath) return currentFile.filePath;
  if (!browserWindow) return;
  return showSaveDialog(browserWindow);
};

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
  openFile(browserWindow, filePath);
};

const showExportDialog = async (browserWindow: BrowserWindow, html: string) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    filters: [{ name: 'HTML File', extensions: ['html'] }],
  });

  if (result.canceled) return;

  const { filePath } = result;

  if (!filePath) return;

  saveFile(filePath, html);
};

const saveFile = async (filePath: string, html: string) => {
  await writeFile(filePath, html, { encoding: 'utf-8' });
};

const openFile = async (browserWindow: BrowserWindow, filePath: string) => {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  setCurrentFile(browserWindow, filePath, content);
  browserWindow.webContents.send('file-opened', content, filePath);
};

ipcMain.on('show-open-dialog', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (!browserWindow) return;
  showOpenDialog(browserWindow);
});

ipcMain.on('show-export-dialog', (event, html: string) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (!browserWindow) return;
  showExportDialog(browserWindow, html);
});

const showSaveDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    filters: [{ name: 'Markdown File', extensions: ['md'] }],
  });

  if (result.canceled) return;

  const { filePath } = result;

  if (!filePath) return;

  return filePath;
};

ipcMain.on('save-file', async (event, content: string) => {
  const filePath = await getCurrentFile(
    BrowserWindow.fromWebContents(event.sender)!
  );
  const browserWindow = BrowserWindow.fromWebContents(event.sender)!;

  if (!filePath) return;
  await saveFile(filePath, content);
  setCurrentFile(browserWindow, filePath, content);
});

ipcMain.on('new-file', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender)!;

  setCurrentFile(browserWindow, '', '');
});

ipcMain.handle('has-changes', async (event, content: string) => {
  const changed = hasChanges(content);
  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  browserWindow?.setDocumentEdited(changed);
  return changed;
});

ipcMain.handle('revert', (event) => {
  return currentFile.content;
});

ipcMain.on('show-in-folder', async () => {
  if (currentFile.filePath) {
    await shell.showItemInFolder(currentFile.filePath);
  }
});

ipcMain.on('open-in-default', () => {
  if (currentFile.filePath) {
    shell.openPath(currentFile.filePath);
  }
});
