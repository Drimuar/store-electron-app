'use strict'

const path = require('path')
const { app, ipcMain } = require('electron')

const Window = require('./Window')
const DataStore = require('./DataStore')

require('electron-reload')(__dirname)

const storesData = new DataStore({ name: 'Stores Main' })

function main() {
  let mainWindow = new Window({
    file: path.join('renderer', 'index.html')
  })

  mainWindow.once('show', () => {
    mainWindow.webContents.send('stores', storesData.stores)
    mainWindow.webContents.send('storages', storesData.storages)
  })

  ipcMain.on('add-log', (event, stores) => {
    const updatedStorages = storesData.addStore(stores);
    console.log(updatedStorages);
    mainWindow.send('stores', updatedStorages.stores);
  })
  ipcMain.on('set-storages', (event, storageNumber) => {
    const updatedStorages = storesData.saveStorages(storageNumber);
    console.log(updatedStorages);
    mainWindow.send('storages', updatedStorages.storages);
  })
  ipcMain.on('get-stores', (event, storageNumber) => {
    const stores = storesData.getStores();
    let store = [];
    stores.filter((element) => {
      if (element.store == storageNumber) {
        store.push(element);
      }
    });
    mainWindow.send('store', store, storageNumber);
  })
  ipcMain.on('delete-storages', (event, storageNumber) => {
    storesData.deleteStores(storageNumber);
  })
}

app.on('ready', main)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
