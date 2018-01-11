const EventEmitter2 = require('eventemitter2')

class Plugin extends EventEmitter2 {
  constructor (opts, mirror) {
    super()
    if (!mirror) {
      mirror = new Plugin(opts, this)
    }
    this.mirror = mirror
    this.transfersSent = {}
    this.opts = opts
  }

  connect () { this._connected = true; this.emit('connect') }
  disconnect () { this._connected = false; this.emit('disconnect') }
  isConnected () { return this._connected }

  getInfo () { return this.opts.info }
  getAccount () { return this.opts.account }
  getBalance () { return Promise.resolve(this.opts.balance) }

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

  sendRequest (request) { return Promise.resolve(this.mirror._requestHandler ? this.mirror._requestHandler(request) : null) }
  registerRequestHandler (handler) { this._requestHandler = handler }
  deregisterRequestHandler () { delete this._requestHandler }
}
Plugin.version = 1
module.exports = Plugin
