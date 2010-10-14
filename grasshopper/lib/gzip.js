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
exports.api = {};

var sys = require('sys'),
    ResponseWrapper = require('./wrapper.js').api.ResponseWrapper
try {
    var compress = require('compress');
} catch(e) {
}

function GzipResponseWrapper(response, compressionLevel) {
    ResponseWrapper.call(this, response);
    this.compressor = new compress.GzipStream();
    var self = this;
    this.compressor.on('data', function(data) {
        if(self.hasBody) {
            self.response.write(data);
        }
    });
    this.compressor.on('error', function(err) {
        self.response.emit('error', err);
    });
    this.compressor.on('end', function() {
        self.response.end();
    });
}

sys.inherits(GzipResponseWrapper, ResponseWrapper);

GzipResponseWrapper.prototype.writeHead = function(statusCode, reasonPhrase,
                                                headers) {
    if(headers === undefined) {
        headers = reasonPhrase;
        reasonPhrase = undefined;
    }
    var self = this;

    function writeHead() {
        if(!reasonPhrase) {
            self.response.writeHead(statusCode, headers);
        } else {
            self.response.writeHead(statusCode, reasonPhrase, headers);
        }
    }

    if(!headers['content-encoding']) {
        this.compressionEnabled = true;
        delete headers['content-length'];
        headers['transfer-encoding'] = 'chunked';
        headers['content-encoding'] = 'gzip';
        writeHead();
    } else {
        writeHead();
    }
}

GzipResponseWrapper.prototype.write = function(chunk, encoding) {
    if(this.compressionEnabled) {
        this.hasBody = true;
        this.compressor.write(chunk, encoding);
    } else {
        this.response.write(chunk, encoding);
    }
}

GzipResponseWrapper.prototype.end = function(data, encoding) {
    this.writable = false;
    if(data) {
        if(this.compressionEnabled) {
            this.hasBody = true;
            this.compressor.write(data, encoding);
        } else {
            this.response.end(data, encoding);
        }
    }
    this.compressor.close();
}

exports.GzipResponseWrapper = GzipResponseWrapper;

exports.api.gzipFilter = function(next) {
    var acceptHeader = this.request.headers['accept-encoding'];
    if(compress && acceptHeader && acceptHeader.indexOf('gzip') >= 0) {
        this.response = new GzipResponseWrapper(this.response, 9);
    }
    next();
}
