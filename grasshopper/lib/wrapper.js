/*
 * Copyright (C) 2010 Chandra Sekar S
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var util = require('util'),
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

util.inherits(ResponseWrapper, events.EventEmitter);

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
