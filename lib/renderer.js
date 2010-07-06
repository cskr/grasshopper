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
    uuid = require('./uuid'),
    session = require('./session'),
    mvc = require('./mvc'),
    fs = require('fs'),
    sys = require('sys'),
    url = require('url'),
    crypto = require('crypto');

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

    var cookieLine = request.headers['cookie'];
    if(cookieLine) {
        this.requestCookies = {};
        var cookies = cookieLine.split('; ');
        for(var i = 0; i < cookies.length; i++) {
            var cookieParts = cookies[i].split('=');
            if(cookieParts[0] == 'MVCSESSION') {
                this.sessionId = decodeURIComponent(cookieParts[1]);
            } else {
                this.requestCookies[cookieParts[0]] = decodeURIComponent(cookieParts[1]);
            }
        }
    }
}

RequestContext.prototype.getExtn = function() {
    var extn = defaultViewExtn;
    var path = url.parse(this.request.url).pathname;
    if(path.match(/\.[^\/]+$/)) {
        extn = path.substring(path.lastIndexOf('.') + 1);
    }

    return extn;
};

RequestContext.prototype.addCookie = function(cookie) {
    var cookieLine = cookie.name + '=' + encodeURIComponent(cookie.value);
    cookieLine += cookie.path ? '; path=' + cookie.path : '';
    cookieLine += cookie.expires ? '; expires=' + cookie.expires : '';
    cookieLine += cookie.domain ? '; domain=' + cookie.domain : '';
    cookieLine += cookie.secure ? '; secure' : '';
    cookieLine += cookie.httpOnly ? '; HttpOnly' : '';

    if(this.headers['set-cookie']) {
        this.headers['set-cookie'] += '\r\nset-cookie: ' + cookieLine;
    } else {
        this.headers['set-cookie'] = cookieLine;
    }
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
            self.headers['content-length'] = stats.size;
            var rs = fs.createReadStream(staticFile);
            var firstChunk = true;

            rs.addListener("data", function(chunk) {
                if(firstChunk) {
                    self.response.writeHead(self.status, self.headers);
                    firstChunk = false;
                }
                self.response.write(chunk, 'binary');
            });

            rs.addListener("close",function() {
                self.response.end();
            });

            rs.addListener("error", function (err) {
                self.handleError(err);
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
            template.fill(viewFile, error, self.encoding, function(err, content) {
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

RequestContext.prototype.beginSession = function(callback) {
    var sessionId = crypto.createHash('sha1').update(uuid.generateUUID()).digest('hex');
    var self = this;
    session.getSessionStore().beginSession(sessionId, function(err) {
        if(!err) {
            this.sessionId = sessionId;
            self.addCookie(new mvc.Cookie('MVCSESSION', sessionId));
        }
        callback(err);
    });
};

RequestContext.prototype.setSessionValue = function(key, value, callback) {
    var store = session.getSessionStore();
    var setter = function (err) {
        if(err) {
            callback(err);
        } else {
            store.setValue(this.sessionId, key, value, callback);
        }
    };
    var self = this;
    store.hasSession(this.sessionId, function(err, has) {
        if(err) {
            callback(err);
        } else {
            if(!has) {
                self.beginSession(setter);
            } else {
                setter();
            }
        }
    });
};

RequestContext.prototype.getSessionValue = function(key, callback) {
    var store = session.getSessionStore();
    store.hasSession(this.sessionId, function(err, has) {
        if(!err && has) {
            store.getValue(this.sessionId, key, callback);
        } else {
            callback(err);
        }
    });
};

RequestContext.prototype.endSession = function(callback) {
    var store = session.getSessionStore();
    store.hasSession(this.sessionId, function(err, has) {
        if(!err && has) {
            store.endSession(this.sessionId, callback);
        } else {
            callback(err)
        }
    });
};

RequestContext.prototype.disableCache = function() {
    this.headers['expires'] = 'Thu, 11 Mar 2010 12:48:43 GMT';
    this.headers['cache-control'] = 'no-store, no-cache, must-revalidate';
    this.headers['pragma'] = 'no-cache';
};

exports.RequestContext = RequestContext;
