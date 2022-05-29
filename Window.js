'use strict'

const { BrowserWindow } = require('electron')

// default window settings
const defaultProps = {
  width: 600,
  minWidth: 580,
  maxWidth: 800,
  height: 800,
  minHeight: 800,
  maxHeight: 800,
  show: false,
  autoHideMenuBar: true,

  // update for electron V5+
  webPreferences: {
    nodeIntegration: true,
    devTools: false
  }
}

class Window extends BrowserWindow {
  constructor({ file, ...windowSettings }) {
    // calls new BrowserWindow with these props
    super({ ...defaultProps, ...windowSettings })

    // load the html and open devtools
    this.loadFile(file)
    // this.webContents.openDevTools()

    // gracefully show when ready to prevent flickering
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

module.exports = Window
