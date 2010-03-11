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
var tmpl = require('./jsonTemplate'),
    fs = require('fs'),
    url = require('url');

var viewsDir = './', defaultViewExtn = 'html';

exports.configure = function(config) {
    if(config.viewsDir)
        viewsDir = config.viewsDir;
    if(config.defaultViewExtn)
        defaultViewExtn = config.defaultViewExtn;
}

// Class: RequestContext
function RequestContext(request, response, params) {
    this.request = request;
    this.response = response;
    this.params = params;

    this.status = 200;
    this.extn = this.getExtn();
    this.headers = {
        'Content-Type': this.mimes[this.extn]
    };
}

RequestContext.prototype.mimes = {
    'html': 'text/html',
    'xml': 'text/xml',
    'js': 'text/javascript',
    'json': 'application/json'
};

RequestContext.prototype.getExtn = function() {
    var extn = defaultViewExtn;
    var path = url.parse(this.request.url).pathname;
    if(path.match(/\.[^\/]+$/)) {
        extn = path.substring(path.lastIndexOf('.') + 1);
    }
    
    return extn;
};

RequestContext.prototype.render = function(view, model) {
    if(typeof view == 'function' && model == undefined) {
        this.response.writeHead(this.status, this.headers);
        view();
        this.response.close();
    } else {
        var viewFile = viewsDir + view + '.' + this.extn;
        
        var self = this;
        fs.readFile(viewFile, function(err, content) {
            if(!err) {
                self.renderText(content, model);
            } else {
                self.status = 500;
                self.renderError(err);
            }
        });
    }
};

RequestContext.prototype.renderError = function(error) {
    if(error === undefined) {
        error = {};
    }

    var viewFile = viewsDir + this.status + '.' + this.extn;
    
    var self = this;
    fs.stat(viewFile, function(err, stats) {
        if(!err && stats.isFile()) {
            fs.readFile(viewFile, function(err, content) {
                self.renderText(content, error);
            });
        } else {
            self.response.writeHead(self.status, this.headers);
            self.response.close();
        }
    });
};

RequestContext.prototype.renderText = function(text, model) {
    this.response.writeHead(this.status, this.headers);

    if(model === undefined) {
        this.response.write(text);
    } else {
        this.response.write(new tmpl.Template(text).expand(model));
    }

    this.response.close();
};

exports.RequestContext = RequestContext;
