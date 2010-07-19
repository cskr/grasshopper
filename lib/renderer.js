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
var ghp = require('./ghp'),
    mime = require('./mime'),
    uuid = require('./uuid'),
    session = require('./session'),
    gh = require('./grasshopper'),
    fs = require('fs'),
    url = require('url'),
    sys = require('sys'),
    crypto = require('crypto'),
    Buffer = require('buffer').Buffer;

var viewsDir = '.',
    defaultViewExtn = 'html',
    staticsDir = '.',
    defaultEncoding = 'utf8',
    layout = undefined;

exports.handleError = function(err, req, res, params) {
    if(params === undefined) {
        params={};
    }

    new RequestContext(req, res, params).handleError(err);
};

exports.configure = function(config) {
    if(config.viewsDir)
        viewsDir = config.viewsDir;
    if(config.defaultViewExtn)
        defaultViewExtn = config.defaultViewExtn;
    if(config.staticsDir)
        staticsDir = config.staticsDir;
    if(config.defaultEncoding)
        defaultEncoding = config.defaultEncoding;
    if(config.layout)
        layout = config.layout;
};

// Class: RequestContext
function RequestContext(request, response, params) {
    this.request = request;
    this.response = response;
    this.params = params;
    this.model = {};

    this.status = 200;
    this.extn = this.getExtn();
    this.encoding = defaultEncoding;
    this.headers = {
        'content-type': mime.mimes[this.extn] 
                        ? mime.mimes[this.extn] 
                        : 'application/octet-stream',
        'date': new Date().toUTCString(),
        'x-powered-by': 'Grasshopper/0.1-dev'
    };

    var cookieLine = request.headers['cookie'];
    if(cookieLine) {
        this.requestCookies = {};
        var cookies = cookieLine.split('; ');
        for(var i = 0; i < cookies.length; i++) {
            var cookieParts = cookies[i].split('=');
            if(cookieParts[0] == 'GHSESSION') {
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

RequestContext.prototype.render = function(view, useLayout) {
    if(view === undefined) {
        this.response.writeHead(this.status, this.headers);
        this.response.end();
    } else if(typeof view == 'function') {
        this.response.writeHead(this.status, this.headers);
        if(this.request.method != 'HEAD') {
            view();
        }
        this.response.end();
    } else {
        if(useLayout === undefined) {
            useLayout = true;
        }
        var viewFile = viewsDir + '/' + view + '.' + this.extn;
        if(layout && useLayout) {
            this.model.view = view;
            viewFile = layout + '.' + this.extn;
        }

        try {
            var content = ghp.fill(viewFile, this.model, this.encoding, viewsDir, this.extn);
            this.send(content);
        } catch(e) {
            this.handleError(e);
        }
    }
};

RequestContext.prototype.renderText = function(text) {
    for(var i in this.model) {
        var hasModel = true;
		break;
    }
    if(!hasModel) {
        this.send(text);
    } else {
        this.send(ghp.fillText(text, this.model));
    }
};

RequestContext.prototype.send = function(text) {
    this.response.writeHead(this.status, this.headers);
    if(this.request.method != 'HEAD') {
        this.response.write(text, this.encoding);
    }
    this.response.end();
};

RequestContext.prototype.renderStatic = function() {
    if(this.request.method != 'GET' && this.request.method != 'HEAD') {
        this.extn = defaultViewExtn;
        this.headers['content-type'] = mime.mimes[defaultViewExtn];
        this.renderError(404);
        return;
    }

    var staticFile = staticsDir + decodeURIComponent(url.parse(this.request.url).pathname);
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
            sendStatic(staticFile, stats, self);
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
            try {
                var content = ghp.fill(viewFile, {error: error}, self.encoding, viewsDir, self.extn);
                self.send(content);
            } catch(e) {
                self.handleError(e);
            }
        } else {
            self.response.writeHead(self.status, self.headers);
            self.response.end();
        }
    });
};

RequestContext.prototype.handleError = function(err) {
    if(err) {
        console.log(err.stack);
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
            self.addCookie(new gh.Cookie('GHSESSION', sessionId));
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

function sendStatic(staticFile, stats, ctx) {
    var range;
    if(ctx.request.headers['range'] && (range = parseRange(ctx.request.headers['range'], stats.size))) {;
        ctx.status = 206;
        ctx.headers['content-length'] = range[1] - range[0] + 1;
        ctx.headers['content-range'] = 'bytes ' + range[0] + '-' + range[1] + '/' + stats.size;
    } else {
        ctx.headers['content-length'] = stats.size;
    }

    ctx.response.writeHead(ctx.status, ctx.headers);
    if(ctx.request.method == 'GET') {
        if(ctx.status == 206) {
            streamRange(staticFile, range[0], range[1], ctx);
        } else {
            streamRange(staticFile, 0, stats.size - 1, ctx);
        }
    } else {
        ctx.response.end();
    }
}

function parseRange(range, fileSize) {
    var ranges = range.substring(6).split(',');
    if(range.length > 5 && ranges.length == 1) {
        var range = ranges[0].split('-');
        if(range[1].length == 0) {
            range[1] = fileSize;
        }
        range[0] = Number(range[0]), range[1] = Number(range[1]);
        if(range[1] > range[0]) {
            range[0] = Math.max(range[0], 0);
            range[1] = Math.min(range[1], fileSize - 1);
            return range;
        }
    }
}

function streamRange(staticFile, start, end, ctx) {
    fs.open(staticFile, 'r', 0666, function(err, fd) {
        if(!err) {
            var currentPosition = start;
            var bufferSize = 4 * 1024;
            function reader() {
                if(currentPosition < end) {
                    var readLength = Math.min(end - currentPosition + 1, bufferSize);
                    var buf = new Buffer(readLength);
                    fs.read(fd, buf, 0, readLength, currentPosition, function(err, bytesRead) {
                        if(!err) {
                            ctx.response.write(buf, 'binary');
                            currentPosition += bytesRead;
                            reader();
                        }
                    });
                } else {
                    ctx.response.end();
                }
            }
            reader();
        }
    });
}
