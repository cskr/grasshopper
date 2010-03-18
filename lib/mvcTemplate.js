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
var fs = require('fs'),
    sys = require('sys');
 
var cache = {};

exports.fill = function(templateFile, model, encoding, callback) {
    if(typeof encoding == 'function' && !callback) {
        callback = encoding;
        encoding = 'utf8';
    }
    
    var template = cache[templateFile];
    if(template) {
        callback(null, template(model));
    } else {
        fs.readFile(templateFile, encoding, function(err, content) {
            if(err) {
                callback(err);
            } else {
                cache[templateFile] = compile(content);
                callback(null, cache[templateFile](model));
            }
        });
    }
}

exports.fillText = function(text, model) {
    return compile(text)(model);
}

function compile(text) {
    var template = new Function("model",
        "var p=[], model = model || {};" +

        "with(model){ " +
            "p.push('" +
                text
                .split("'").join("\\'")
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
        "}" +
        
        "return p.join('');"
    );

    return template;
}
