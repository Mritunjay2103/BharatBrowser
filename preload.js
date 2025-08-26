const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  saveConsentLogs: (logs) => ipcRenderer.invoke('save-consent-logs', logs),
  getPageContent: (url) => ipcRenderer.invoke('get-page-content', url),
  
  // Menu event listeners
  onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
  onCloseTab: (callback) => ipcRenderer.on('close-tab', callback),
  onReloadPage: (callback) => ipcRenderer.on('reload-page', callback),
  onToggleAICopilot: (callback) => ipcRenderer.on('toggle-ai-copilot', callback),
  onToggleConsentManager: (callback) => ipcRenderer.on('toggle-consent-manager', callback),
  onOpenDigitalIdentity: (callback) => ipcRenderer.on('open-digital-identity', callback),
  onOpenUPIPayments: (callback) => ipcRenderer.on('open-upi-payments', callback),
  onExportConsentLogs: (callback) => ipcRenderer.on('export-consent-logs', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
