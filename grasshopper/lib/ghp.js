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
var fs = require('fs');
 
var cache = {};

var helpers = [require('./helpers')];

function fill(templateFile, model, encoding, viewsDir, extn, locale) {
    var template = cache[templateFile];
    if(!template) {
        var content = fs.readFileSync(templateFile, encoding);
        cache[templateFile] = template = compile(content, helpers.length + 2);
    }
    return template(model, [new IncludeHelper(model, encoding, viewsDir, extn, locale), {locale: locale}].concat(helpers));
}

exports.fill = fill;

exports.addHelpers = function(newHelpers) {
    for(var i = 0; i < arguments.length; i++) {
        helpers.push(arguments[i]);
    }
}

function compile(text, helpersCount) {
    var funcBody = "var p=[], model = model || {};";

    for(var i = 0; i < helpersCount; i++) {
        funcBody += "with(helpers[" + i + "]) {";
    }

    funcBody += "with(model){ ";
    var parts = text.split("<%");
    parts.forEach(function(part) {
        if(part.indexOf("%>") == -1) {
            funcBody += "p.push('" + escapeCode(part) + "');";
        } else if(part.charAt(0) == '=') {
            var subParts = part.split('%>');
            funcBody += "p.push(" + subParts[0].substring(1) + ");";
            if(subParts.length > 1) {
                funcBody += "p.push('" + escapeCode(subParts[1]) + "');";
            }
        } else {
            var subParts = part.split('%>');
            funcBody += subParts[0];
            if(subParts.length > 1) {
                funcBody += "p.push('" + escapeCode(subParts[1]) + "');";
            }
        }
    });

    funcBody += "}";


    for(var i = 0; i < helpersCount; i++) {
        funcBody += "}";
    }

    funcBody += "return p.join('');"
    return new Function("model", "helpers", funcBody);
}

function escapeCode(str) {
    return str.replace("'", "\\'").split('\r').join('\\r').split('\n').join('\\n');
}

// Class: IncludeHelper
function IncludeHelper(model, encoding, viewsDir, extn, locale) {
    this.model = model;
    this.encoding = encoding;
    this.viewsDir = viewsDir;
    this.extn = extn;
    this.locale = locale;
}

IncludeHelper.prototype.include = function(templateFile) {
    return fill(this.viewsDir + '/' + templateFile + '.' + this.extn , this.model, this.encoding, this.viewsDir, this.extn, this.locale);
}
