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
    ResponseWrapper = require('./wrapper.js').api.ResponseWrapper,
    zlib = require('zlib');

function GzipResponseWrapper(response, compressionLevel) {
    ResponseWrapper.call(this, response);
}

util.inherits(GzipResponseWrapper, ResponseWrapper);

GzipResponseWrapper.prototype._createCompressor = function() {
    this._compressor = zlib.createGzip();
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
    if(this._compressor) {
        if(!this._pumpStarted) {
            this._pumpStarted = true;
            this._compressor.pipe(this.response);
        }

        var self = this;

        // This is required to workaround a bug either in node-compress/node
        // which occurs when streaming large files.
        // I couldn't isolate the exact problem.  This hack works and
        // doesn't affect performance.
        process.nextTick(function() {
            self.emit('drain');
        });

        this._compressor.write(chunk, encoding);
        return false;
    } else {
         return this.response.write(chunk, encoding);
    }
}

GzipResponseWrapper.prototype.end = function(data, encoding) {
    this.writable = false;

    if(this._compressor) {
        if(!this._pumpStarted) {
            this._compressor.pipe(this.response);
        }

        this._compressor.end(data, encoding);
    } else {
        this.response.end(data, encoding);
    }
}

exports.GzipResponseWrapper = GzipResponseWrapper;

exports.api.gzipFilter = function(next) {
    var acceptHeader = this.request.headers['accept-encoding'];
    if(acceptHeader && acceptHeader.indexOf('gzip') >= 0) {
        this.response = new GzipResponseWrapper(this.response, 9);
    }
    next();
}
