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
require('sys').inherits(MockRequest, EventEmitter);

MockRequest.prototype.setEncoding = function(encoding) {
    this.encoding = encoding;
};

function MockResponse() {
}

MockResponse.prototype.writeHead = function(status, headers) {
};

MockResponse.prototype.end = function() {
};

exports.MockRequest = MockRequest;
exports.MockResponse = MockResponse;
