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

var fs = require('fs'),
    vm = require('vm');
 
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
        cache[templateFile] = template = compile(content, helpers.length + 2,
                                                    templateFile);
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

function compile(text, helpersCount, fileName) {
    text = skipIgnoredNewlines(text);
    var funcBody = "model = model || {};";

    for(var i = 0; i < helpersCount; i++) {
        funcBody += "helpers[" + i + "].out = out;";
        funcBody += "with(helpers[" + i + "]) {";
    }

    funcBody += "with(model) {";
    var parts = text.split("<%");
    parts.forEach(function(part) {
        if(part.indexOf("%>") == -1) {
            funcBody += getWriteCode(escapeCode(part));
        } else if(part.charAt(0) == '=') {
            var subParts = part.split('%>');
            funcBody += "out.write(escapeHTML(" + subParts[0].substring(1)
                        + "));";
            if(subParts.length > 1) {
                funcBody += getWriteCode(escapeCode(subParts[1]));
            }
        } else if(part.charAt(0) == 'h') {
            var subParts = part.split('%>');
            funcBody += "out.write(" + subParts[0].substring(1) + ");";
            if(subParts.length > 1) {
                funcBody += getWriteCode(escapeCode(subParts[1]));
            }
        } else {
            var subParts = part.split('%>');
            funcBody += subParts[0];
            if(subParts.length > 1) {
                funcBody += getWriteCode(escapeCode(subParts[1]));
            }
        }
    });

    funcBody += "}";

    for(var i = 0; i < helpersCount; i++) {
        funcBody += "}";
    }

    return vm.runInThisContext('tmpl = function(out, model, helpers) {'
                                + funcBody
                            + '}', fileName);
}

function skipIgnoredNewlines(text) {
    return text.split('-%>\r\n').join('%>').split('-%>\n').join('%>')
                .split('-%>').join('%>');
}

function escapeCode(str) {
    return str.split("'").join("\\'").split('\r').join('\\r').split('\n').join('\\n');
}

function getWriteCode(text) {
    var code = '';
    if(text.indexOf('\\n') >= 0) {
        var lines = text.split('\\n');
        lines.forEach(function(line, index) {
            if(line.length > 0) {
                if(index < lines.length - 1) {
                    code += "out.write('" + line + "\\n');\n";
                } else {
                    code += "out.write('" + line + "');";
                }
            } else if(index < lines.length - 1) {
                code += "\nout.write('\\n');";
            }
        });
    } else {
        code += "out.write('" + text + "');";
    }
    return code;
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

IncludeHelper.prototype.include = function(templateFile, updateModel) {
    if(updateModel) {
        updateModel(this.model);
    }

    return fill(this.viewsDir + '/' + templateFile + '.' + this.extn ,
                undefined, this.model, this.encoding, this.viewsDir, this.extn,
                this.locale, this.out);
}

function Streamer(response, encoding) {
    this._out = new Buffer(bufferSize);
    this._response = response;
    this._bufContentLen = 0;
    this.encoding = encoding;
}

Streamer.prototype.write = function(str) {
    if(str !== undefined) {
        var tmpBuffer = new Buffer(str),
            currentOffset = 0;

        while(this._bufContentLen +
                (tmpBuffer.length - currentOffset) >= bufferSize) {
            var remaining = bufferSize - this._bufContentLen;
            tmpBuffer.copy(this._out, this._bufContentLen, currentOffset,
                            currentOffset + remaining);
            currentOffset += remaining;
            this._bufContentLen += remaining;
            this.flush();
        }

        tmpBuffer.copy(this._out, this._bufContentLen, currentOffset);
        this._bufContentLen += tmpBuffer.length - currentOffset;
    }
};

Streamer.prototype.flush = function() {
    this._response.write(this._out.toString(this.encoding, 0,
        this._bufContentLen));
    this._out = new Buffer(bufferSize);
    this._bufContentLen = 0;
};

Streamer.prototype.end = function() {
    if(this._bufContentLen > 0) {
        this.flush();
    }
    this._response.end();
};
