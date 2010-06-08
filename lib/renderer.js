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
var template = require('./mvcTemplate'),
    mime = require('./mime'),
    fs = require('fs'),
    sys = require('sys'),
    url = require('url');

var viewsDir = '.',
    defaultViewExtn = 'html',
    staticsDir = '.',
    defaultEncoding = 'ascii';

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
    if(config.defaultEncoding)
        defaultEncoding = config.defaultEncoding;
}

// Class: RequestContext
function RequestContext(request, response, params) {
    this.request = request;
    this.response = response;
    this.params = params;

    this.status = 200;
    this.extn = this.getExtn();
    this.encoding = defaultEncoding;
    this.headers = {
        'content-type': mime.mimes[this.extn] 
                        ? mime.mimes[this.extn] 
                        : 'application/octet-stream'
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
    if(view === undefined && model === undefined) {
        this.response.writeHead(this.status, this.headers);
        this.response.end();
    } else if(typeof view == 'function') {
        this.response.writeHead(this.status, this.headers);
        view();
        this.response.end();
    } else {
        var viewFile = viewsDir + '/' + view + '.' + this.extn;

        var self = this;
        template.fill(viewFile, model, this.encoding, function(err, content) {
            if(!err) {
                self.send(content, model);
            } else {
                self.handleError(err);
            }
        });
    }
};

RequestContext.prototype.renderText = function(text, model) {
    if(model === undefined) {
        this.send(text);
    } else {
        this.send(template.fillText(text, model));
    }
};

RequestContext.prototype.send = function(text) {
    this.response.writeHead(this.status, this.headers);
    this.response.write(text, this.encoding);
    this.response.end();
};

RequestContext.prototype.renderStatic = function() {
    var staticFile = staticsDir + url.parse(this.request.url).pathname;
    var self = this;
    fs.stat(staticFile, function(err, stats) {
        if(err || !stats.isFile()) {
            if((err && err.errno == 2) || !stats.isFile()) {
                self.extn = defaultViewExtn;
                self.headers['content-type'] = mime.mimes[defaultViewExtn];
                self.renderError(404);
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
                    self.response.end();
                }
            });
        }
    });
};

RequestContext.prototype.renderError = function(status, error) {
    this.status = status;
    if(error === undefined) {
        error = {};
    }

    var viewFile = viewsDir + '/' + this.status + '.' + this.extn;

    var self = this;
    fs.stat(viewFile, function(err, stats) {
        if(!err && stats.isFile()) {
            template.fill(viewFile, error, this.encoding, function(err, content) {
                if(err) {
                    self.handleError(err);
                } else {
                    self.send(content, error);
                }
            });
        } else {
            self.response.writeHead(self.status, self.headers);
            self.response.end();
        }
    });
};

RequestContext.prototype.handleError = function(err) {
    if(err) {
        sys.puts(err.stack);
    }
    this.renderError(500, err);
};

RequestContext.prototype.redirect = function(location) {
    this.headers['location'] = location;
    this.renderError(302, {location: location});
};

exports.RequestContext = RequestContext;
