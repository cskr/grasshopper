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
    mime = require('./mime'),
    fs = require('fs'),
    sys = require('sys'),
    url = require('url');

var viewsDir = '.', defaultViewExtn = 'html', staticsDir = '.';

exports.handleError = function(err, req, res, params) {
    if(params === undefined) {
        params={};
    }

    new RequestContext(req, res, params).handleError(err);
}

exports.configure = function(config) {
    if(config.viewsDir)
        viewsDir = config.viewsDir;
    if(config.defaultViewExtn)
        defaultViewExtn = config.defaultViewExtn;
    if(config.staticsDir)
        staticsDir = config.staticsDir;
}

// Class: RequestContext
function RequestContext(request, response, params) {
    this.request = request;
    this.response = response;
    this.params = params;

    this.status = 200;
    this.extn = this.getExtn();
    this.headers = {
        'content-type': mime.mimes[this.extn] ? mime.mimes[this.extn] : 'application/octet-stream'
    };
}

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
        var viewFile = viewsDir + '/' + view + '.' + this.extn;
        
        var self = this;
        fs.readFile(viewFile, function(err, content) {
            if(!err) {
                self.renderText(content, model);
            } else {
                self.handleError(err);
            }
        });
    }
};

RequestContext.prototype.renderError = function(error) {
    if(error === undefined) {
        error = {};
    }

    var viewFile = viewsDir + '/' + this.status + '.' + this.extn;
    
    var self = this;
    fs.stat(viewFile, function(err, stats) {
        if(!err && stats.isFile()) {
            fs.readFile(viewFile, function(err, content) {
                if(err) {
                    self.handleError(err);
                } else {
                    self.renderText(content, error);
                }
            });
        } else {
            self.response.writeHead(self.status, self.headers);
            self.response.close();
        }
    });
};

RequestContext.prototype.handleError = function(err) {
    if(err) {
        sys.puts(err.stack);
    }
    this.status = 500;
    this.renderError(err);
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

RequestContext.prototype.renderStatic = function() {
    var staticFile = staticsDir + url.parse(this.request.url).pathname;
    var self = this;
    fs.stat(staticFile, function(err, stats) {
        if(err || !stats.isFile()) {
            if(err && err.errno == 2) {
                self.status = 404;
                self.extn = defaultViewExtn;
                self.headers['content-type'] = mime.mimes[defaultViewExtn];
                self.renderError();
            } else {
                self.handleError(err);
            }
        } else {
            fs.readFile(staticFile, 'binary', function(err, content) {
                if(err) {
                    self.handleError(err);
                } else {
                    self.response.writeHeader(self.status, self.headers);
                    self.response.write(content, 'binary');
                    self.response.close();
                }
            });
        }
    });
};

RequestContext.prototype.redirect = function(location) {
    this.status = 302;
    this.headers['location'] = location;
    this.renderError({location: location});
}

exports.RequestContext = RequestContext;
