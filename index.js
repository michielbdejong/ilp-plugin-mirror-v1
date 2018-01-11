const EventEmitter2 = require('eventemitter2')

class Plugin extends EventEmitter2 {
  constructor (opts, mirror) {
    super()
    if (!mirror) {
      mirror = new Plugin(opts, this)
    }
    this.mirror = mirror
    this.transfersSent = {}
  }

  connect () { this._connected = true; this.emit('connect') }
  disconnect () { this._connected = false; this.emit('disconnect') }
  isConnected () { return this._connected }

  getInfo () { return {} }
  getAccount () { return 'me' }
  getBalance () { return Promise.resolve('0') }

  sendTransfer (transfer) {
//console.log('sendTransfer!', transfer)
    this.transfersSent[transfer.id] = transfer
    this.mirror.emit('incoming_prepare', transfer)
    return Promise.resolve(null)
  }

  fulfillCondition (transferId, fulfillment) {
    this.mirror.emit('outgoing_fulfill', this.mirror.transfersSent[transferId], fulfillment)
    return Promise.resolve()
  }

  rejectIncomingTransfer (transferId, reason) {
    this.mirror.emit('outgoing_reject', this.mirror.transfersSent[transferId], reason)
    return Promise.resolve()
  }

  sendRequest (request) { return Promise.resolve(this.mirror._requestHandler && this.mirror._requestHandler(request)) }
  registerRequestHandler (handler) { this._requestHandler = handler }
  deregisterRequestHandler () { delete this._requestHandler }
}
Plugin.version = 1
module.exports = Plugin
