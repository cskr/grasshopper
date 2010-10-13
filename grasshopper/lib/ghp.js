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

var fs = require('fs');
 
var cache = {},
    bufferSize = 8 * 1024;

var helpers = [require('./helpers')];

function fill(templateFile, response, model, encoding, viewsDir, extn, locale, streamer) {
    if(streamer === undefined) {
        var endResponse = true;
        streamer = new Streamer(response, encoding);
    }
    var template = cache[templateFile];
    if(!template) {
        var content = fs.readFileSync(templateFile, encoding);
        cache[templateFile] = template = compile(content, helpers.length + 2);
    }
    template(streamer, model, [new IncludeHelper(streamer, model, encoding, viewsDir, extn, locale), {locale: locale}].concat(helpers));
    if(endResponse) {
        streamer.end();
    }
}

exports.fill = fill;

exports.api.addHelpers = function(newHelpers) {
    for(var i = 0; i < arguments.length; i++) {
        helpers.push(arguments[i]);
    }
};

exports.configure = function(config) {
    if(config.templateBufferSize) {
        bufferSize = config.templateBufferSize;
    }
};

function compile(text, helpersCount) {
    var funcBody = "model = model || {};";

    for(var i = 0; i < helpersCount; i++) {
        funcBody += "helpers[" + i + "].out = out;";
        funcBody += "with(helpers[" + i + "]) {";
    }

    funcBody += "with(model) {";
    var parts = text.split("<%");
    parts.forEach(function(part) {
        if(part.indexOf("%>") == -1) {
            funcBody += "out.write('" + escapeCode(part) + "');";
        } else if(part.charAt(0) == '=') {
            var subParts = part.split('%>');
            funcBody += "out.write(escapeHTML(" + subParts[0].substring(1)
                        + "));";
            if(subParts.length > 1) {
                funcBody += "out.write('" + escapeCode(subParts[1]) + "');";
            }
        } else if(part.charAt(0) == 'h') {
            var subParts = part.split('%>');
            funcBody += "out.write(" + subParts[0].substring(1) + ");";
            if(subParts.length > 1) {
                funcBody += "out.write('" + escapeCode(subParts[1]) + "');";
            }
        } else {
            var subParts = part.split('%>');
            funcBody += subParts[0];
            if(subParts.length > 1) {
                funcBody += "out.write('" + escapeCode(subParts[1]) + "');";
            }
        }
    });

    funcBody += "}";

    for(var i = 0; i < helpersCount; i++) {
        funcBody += "}";
    }

    return new Function("out", "model", "helpers", funcBody);
}

function escapeCode(str) {
    return str.split("'").join("\\'").split('\r').join('\\r').split('\n').join('\\n');
}

// Class: IncludeHelper
function IncludeHelper(out, model, encoding, viewsDir, extn, locale) {
    this.out = out;
    this.model = model;
    this.encoding = encoding;
    this.viewsDir = viewsDir;
    this.extn = extn;
    this.locale = locale;
}

IncludeHelper.prototype.include = function(templateFile) {
    return fill(this.viewsDir + '/' + templateFile + '.' + this.extn , undefined, this.model,
                this.encoding, this.viewsDir, this.extn, this.locale, this.out);
}

function Streamer(response, encoding) {
    this._out = new Buffer(bufferSize);
    this._response = response;
    this._bufContentLen = 0;
    this.encoding = encoding;
}

Streamer.prototype.write = function(str) {
    if(str !== undefined) {
        if(this.needsFlush(str)) {
            this.flush();
        }

        var strBytes = Buffer.byteLength(str, this.encoding);
        this._out.write(str, this._bufContentLen, this.encoding);
        this._bufContentLen += strBytes;
    }
};

Streamer.prototype.needsFlush = function(str) {
    var strBytes = Buffer.byteLength(str, this.encoding);
    if(strBytes + this._bufContentLen > bufferSize) {
        return true;
    }
    return false;
};

Streamer.prototype.flush = function() {
    this._response.write(this._out.toString(this.encoding, 0, this._bufContentLen));
    this._out = new Buffer(bufferSize);
    this._bufContentLen = 0;
};

Streamer.prototype.end = function() {
    if(this._bufContentLen > 0) {
        this.flush();
    }
    this._response.end();
};
