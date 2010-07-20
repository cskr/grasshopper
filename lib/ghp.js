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
 *
 * Based On - http://github.com/graphnode/node-template
 */
var fs = require('fs');
 
var cache = {};

var helpers = [{h: escapeHTML}];

function fill(templateFile, model, encoding, viewsDir, extn) {
    var template = cache[templateFile];
    if(!template) {
        var content = fs.readFileSync(templateFile, encoding);
        cache[templateFile] = template = compile(content, helpers.length + 1);
    }
    return template(model, [new IncludeHelper(model, encoding, viewsDir, extn)].concat(helpers));
}

exports.fill = fill;

exports.fillText = function(text, model) {
    return compile(text, helpers.length)(model, helpers);
}

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

    funcBody += "with(model){ " +
            "p.push('" +
                text
                .split("'").join("\\'")
                .split("\r\n").join("\n")
                .split("\n").join("\\n")
                .replace(/<%(.*?)%>/mg, function(m, t) { 
                    return '<%' + t
                           .split("\\'").join("'")
                           .split("\\n").join("\n") +
                           '%>'; 
                })
                .replace(/<%=(.+?)%>/g, "',$1,'")
                .split("<%").join("');")
                .split("%>").join("p.push('") +
            "');"+
        "}";

    for(var i = 0; i < helpersCount; i++) {
        funcBody += "}";
    }

    funcBody += "return p.join('');"
    return new Function("model", "helpers", funcBody);
}

// Class: IncludeHelper
function IncludeHelper(model, encoding, viewsDir, extn) {
    this.model = model;
    this.encoding = encoding;
    this.viewsDir = viewsDir;
    this.extn = extn;
}

IncludeHelper.prototype.include = function(templateFile) {
    return fill(this.viewsDir + '/' + templateFile + '.' + this.extn , this.model, this.encoding, this.viewsDir, this.extn);
}

function escapeHTML(html) {
    return html.
        replace(/&/gmi, '&amp;').
        replace(/"/gmi, '&quot;').
        replace(/>/gmi, '&gt;').
        replace(/</gmi, '&lt;');
}
