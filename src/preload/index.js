// preload/index.js
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  authorizeUser: (user) => ipcRenderer.invoke("authorizeUser", user),
  getGoods: () => ipcRenderer.invoke("getGoods"),
  addGood: (good) => ipcRenderer.invoke("addGood", good),
  updateGood: (good) => ipcRenderer.invoke("updateGood", good),
  deleteGood: (id) => ipcRenderer.invoke("deleteGood", id)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}