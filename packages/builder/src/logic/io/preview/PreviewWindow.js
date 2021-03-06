export default class Preview {
  constructor(url, stateChangeCallback) {
    this.url = url
    this.stateChangeCallback = stateChangeCallback

    this.window = null
    window.addEventListener(
      'beforeunload', () => { this.close() }
    )
  }

  // Open, close, reload, ... the preview window
  open() {
    this.window = window.open(
      this.url, 'labjs_preview',
      'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no'
    )
    // Catching an edge case here, where the window
    // would open to about:blank, and not move from
    // there if the content was reloaded
    this.window.addEventListener(
      'load', () => (this.window.location = this.url), { once: true }
    )
    this.window.addEventListener(
      'unload', () => this.checkWindow(), { once: true }
    )
    // Trigger callback
    this.stateChangeCallback('opened')
  }

  close() {
    if (this.window) {
      this.window.close()
    }
  }

  reload() {
    // Reset window location instead of merely reloading,
    // to make sure that the URL preview is correct.
    this.window.location = this.url
  }

  focus() {
    this.window.focus()
  }

  openOrFocus() {
    if (this.window === null || this.window.closed) {
      this.open()
    } else {
      this.focus()
    }
  }

  // Check window status
  checkWindow() {
    // This function is run when the unload event
    // on the preview window is caught, to check
    // whether the window was closed or just reloaded
    window.setTimeout(() => {
      // NOTE: There were some bugs coming out of this,
      // specifically with this.window being null and
      // therefore the .closed property not being
      // accessible. This is now fixed by the additional
      // check below, but because the error is not
      // reproducable, the source is not entirely
      // clear -- it could be that the browser sets
      // this.window to null when it is closed, or that
      // the calback is called twice, this.window being
      // null on the second call.
      if (this.window === null || this.window.closed) {
        // Detected closed window, removing reference
        this.window = null
        this.stateChangeCallback('closed')
      } else {
        // Window is still open, renew unload listener
        this.window.addEventListener(
          'unload', () => this.checkWindow(), { once: true }
        )
      }
    }, 25)
  }

}
