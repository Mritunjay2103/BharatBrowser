const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'public/icons/browser-icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Needed for loading external websites
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('public/index.html');
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('new-tab');
          }
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.webContents.send('close-tab');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('reload-page');
          }
        },
        {
          label: 'Toggle AI Copilot',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow.webContents.send('toggle-ai-copilot');
          }
        },
        {
          label: 'Toggle Consent Manager',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => {
            mainWindow.webContents.send('toggle-consent-manager');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Digital Identity',
          click: () => {
            mainWindow.webContents.send('open-digital-identity');
          }
        },
        {
          label: 'UPI Payments',
          click: () => {
            mainWindow.webContents.send('open-upi-payments');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Consent Logs',
          click: () => {
            mainWindow.webContents.send('export-consent-logs');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('save-consent-logs', async (event, logs) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: 'consent-logs.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
      return { success: true };
    }
    return { success: false, error: 'Save cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-page-content', async (event, url) => {
  // Mock AI processing - in real implementation, this would call an AI service
  const mockSummary = [
    "• This webpage contains information about the requested topic",
    "• Key points include main content sections and navigation elements",
    "• The page structure follows standard web practices",
    "• Additional resources and links are available for further reading"
  ];
  
  return {
    summary: mockSummary,
    wordCount: Math.floor(Math.random() * 2000) + 500,
    readingTime: Math.floor(Math.random() * 10) + 2
  };
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent navigation to external protocols
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5000' && !parsedUrl.protocol.startsWith('http')) {
      navigationEvent.preventDefault();
    }
  });
});
