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

var EventEmitter = require('events').EventEmitter;

function MockRequest(method, url, headers) {
   EventEmitter.call(this);

   this.method = method;
   this.url = url;
   this.headers = headers;
}
require('util').inherits(MockRequest, EventEmitter);

MockRequest.prototype.setEncoding = function(encoding) {
    this.encoding = encoding;
};

function MockResponse() {
    this.writable = true;
}
require('util').inherits(MockResponse, EventEmitter);

MockResponse.prototype.writeHead = function(statusCode, reasonPhrase, headers) {
    this.statusCode = statusCode;
    this.reasonPhrase = reasonPhrase;
    this.headers = headers;
};

MockResponse.prototype.write = function(chunk, encoding) {
    this.chunks = this.chunks || [];
    this.chunks.push(chunk);
    this.encodings = this.encodings || [];
    this.encodings.push(encoding);
};

MockResponse.prototype.end = function(data, encoding) {
    this.endData = data;
    this.endEncoding = encoding;
    this.writable = false;
};

MockResponse.prototype.destroy = function() {
    this.writable = false;
};

exports.MockRequest = MockRequest;
exports.MockResponse = MockResponse;
