const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const connectButton = document.getElementById('connectButton');
  const logContainer = document.getElementById('logContainer');

  connectButton.addEventListener('click', () => {
    ipcRenderer.send('connect-database');
  });

  // Receive log messages from the main process and display them in the UI
  ipcRenderer.on('log-message', (event, message) => {
    const logMessage = document.createElement('p');
    logMessage.textContent = message;
    logContainer.appendChild(logMessage);
  });
});


ipcRenderer.on('connect-database-response', (event, status) => {
    if (status === 'success') {
      console.log('Connected to the database');
    } else {
      console.error('Failed to connect to the database');
    }
  });