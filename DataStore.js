'use strict'

const Store = require('electron-store')

class DataStore extends Store {
  constructor(settings) {
    super(settings)

    this.storages = this.get('storages') || null
    this.stores = this.get('stores') || []
  }

  saveStorages(storages) {
    this.storages = storages
    this.set('storages', this.storages)
    return this
  }

  getStorages() {
    this.storages = this.get('storages') || null

    return this
  }

  addStore(stores) {
    this.stores = [...this.stores, stores]
    this.set('stores', this.stores)

    return this
  }

  getStores() {
    this.stores = this.get('stores')

    return this.stores;
  }

  deleteStores(storageNumber) {
    this.stores = this.stores.filter(s => s.store <= storageNumber);
    this.set('stores', this.stores)
    return this;
  }
}

module.exports = DataStore
