var sys = require('sys'),
    events = require('events');

exports.api = {};

function ResponseWrapper(response) {
    this.response = response;
    this.writable = true;
    var self = this;

    response.on('drain', function() {
        self.emit('drain');
    });
    response.on('error', function(exception) {
        self.writable = false;
        self.emit('error', exception);
    });
    response.on('close', function() {
        self.emit('close');
    });
}

sys.inherits(ResponseWrapper, events.EventEmitter);

ResponseWrapper.prototype.writeHead = function(statusCode, reasonPhrase,
                                                    headers) {
    this.response.writeHead(statusCode, reasonPhrase, headers);
}

ResponseWrapper.prototype.write = function(chunk, encoding) {
    this.response.write(chunk, encoding);
}

ResponseWrapper.prototype.end = function(data, encoding) {
    this.writable = false;
    this.response.end(data, encoding);
}

ResponseWrapper.prototype.destroy = function() {
    this.writable = false;
    this.response.destroy();
}

exports.api.ResponseWrapper = ResponseWrapper;
