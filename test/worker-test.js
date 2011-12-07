var path = require('path'),
    assert = require('assert'),
    vows = require('vows'),
    nssocket = require('nssocket'),
    Monitor = require('../lib/forever/monitor').Monitor,
    Worker = require('../lib/forever/worker').Worker;

var SOCKET_PATH = path.join(__dirname, 'fixtures', 'worker.sock'),
    SCRIPT = path.join(__dirname, '..', 'examples', 'log-on-interval.js');

vows.describe('forever/worker').addBatch({
  'When using forever worker': {
    'and starting it and pinging it': {
      topic: function () {
        var self = this,
            monitors = [];

        for (var i = 0; i < 3; i++) {
          monitors.push(new Monitor(SCRIPT).start());
        }

        var worker = new Worker({ socketPath: SOCKET_PATH, monitors: monitors }),
            reader = new nssocket.NsSocket();

        worker.start();

        reader.connect(SOCKET_PATH, function () {
          self.callback(null, reader);
        });
      },
      'it should connect': {
        'and respond to pings': {
          topic: function (reader) {
            reader.send(['ping']);
            reader.data(['pong'], this.callback);
          },
          'with `pong`': function () {}
        },
        'and when asked for the list of monitors': {
          topic: function (reader) {
            reader.send(['monitors', 'list']);
            reader.data(['monitors', 'list'], this.callback.bind(this, null));
          },
          'it should respond with the list of monitors': function (data) {
            assert.lengthOf(data.monitors, 3);
          }
        }
      }
    }
  }
}).export(module);

