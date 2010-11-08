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

var util = require('util'),
    ResponseWrapper = require('./wrapper.js').api.ResponseWrapper
try {
    var compress = require('compress');
} catch(e) {
}

function GzipResponseWrapper(response, compressionLevel) {
    ResponseWrapper.call(this, response);
}

util.inherits(GzipResponseWrapper, ResponseWrapper);

GzipResponseWrapper.prototype._createCompressor = function() {
    this.compressor = new compress.GzipStream();
    var self = this;

    this.compressor.on('data', function(data) {
        if(self._hasBody) {
            self.response.write(data);
        }
    });

    this.compressor.on('error', function(err) {
        self.response.emit('error', err);
    });

    this.compressor.on('end', function() {
        self.response.end();
    });
};

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
        this._createCompressor();
        delete headers['content-length'];
        headers['transfer-encoding'] = 'chunked';
        headers['content-encoding'] = 'gzip';
        writeHead();
    } else {
        writeHead();
    }
}

GzipResponseWrapper.prototype.write = function(chunk, encoding) {
    if(this.compressor) {
        this._hasBody = true;
        return this.compressor.write(chunk, encoding);
    } else {
         return this.response.write(chunk, encoding);
    }
}

GzipResponseWrapper.prototype.end = function(data, encoding) {
    this.writable = false;

    if(this.compressor) {
        if(data) {
            this._hasBody = true;
            this.compressor.write(data, encoding);
            this.compressor.close();
        } else {
            this.compressor.close();
        }
    } else {
        this.response.end(data, encoding);
    }
}

exports.GzipResponseWrapper = GzipResponseWrapper;

exports.api.gzipFilter = function(next) {
    var acceptHeader = this.request.headers['accept-encoding'];
    if(compress && acceptHeader && acceptHeader.indexOf('gzip') >= 0) {
        this.response = new GzipResponseWrapper(this.response, 9);
    }
    next();
}
