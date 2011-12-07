var nssocket = require('nssocket'),
    forever = require('../forever');

var Worker = exports.Worker = function (options) {
  this.monitors   = options.monitors   || [];
  this.socketPath = options.socketPath || forever.config.get('socketPath');

  this._socket = null;
};

Worker.prototype.start = function () {
  var self = this;

  if (this._socket) throw new Error("Can't start already started worker");

  this._socket = nssocket.createServer(function (socket) {
    socket.data(['ping'], function (data) {
      socket.send(['pong']);
    });

    socket.data(['monitors', 'list'], function (data) {
      socket.send(['monitors', 'list'], self.monitors.map(function (monitor) {
        return monitor.data;
      }));
    });
  });

  this._socket.listen(this.socketPath);
};

