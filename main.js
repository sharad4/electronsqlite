const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // Enable DevTools
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

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

ipcMain.on('connect-database', () => {
  const dbFilePath = './data/mydbnew.db';

  if (fs.existsSync(dbFilePath)) {
    // Connect to the existing database
    connectToDatabase(dbFilePath);
  } else {
    // Create a new database
    createDatabase(dbFilePath);
  }
});

function connectToDatabase(dbFilePath) {
  const db = new sqlite3.Database(dbFilePath);

  // Perform database operations
  db.serialize(() => {
    logMessage('Connected to the SQLite database');

    // Execute a simple SELECT query
    db.all('SELECT * FROM users', (error, rows) => {
      if (error) {
        logMessage('Error executing query:', + error);
        mainWindow.webContents.send('connect-database-response', 'error');
        return;
      }
      logMessage('Query results:', + JSON.stringify(rows));
      mainWindow.webContents.send('connect-database-response', 'success');
    });
  });

  // Close the database connection when done
  db.close((err) => {
    if (err) {
        logMessage('Error closing the database connection:', + err);
      return;
    }
    logMessage('Disconnected from the SQLite database');
  });
}

function createDatabase(dbFilePath) {
  const db = new sqlite3.Database(dbFilePath);

  // Create the database schema and perform any initial setup
  db.serialize(() => {
    logMessage('Created a new SQLite database');

    // Create a table
    db.run('CREATE TABLE users (id INT PRIMARY KEY, name TEXT)');

    // Insert initial data
    db.run('INSERT INTO users (id, name) VALUES (1, "John Doe")');

    logMessage('Initialization completed');
    mainWindow.webContents.send('connect-database-response', 'success')
  });

  // Close the database connection when done
  db.close((err) => {
    if (err) {
        logMessage('Error closing the database connection:', err);
      return;
    }
    logMessage('Disconnected from the SQLite database');
  });
}

function logMessage(message) {
    mainWindow.webContents.send('log-message', message);
}
