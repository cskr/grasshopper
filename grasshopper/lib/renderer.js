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
var fs = require('fs'),
    url = require('url'),
    sys = require('sys'),
    crypto = require('crypto'),
    Buffer = require('buffer').Buffer,
    mime = require('./mime'),
    uuid = require('./uuid'),
    session = require('./session'),
    ghp = require('./ghp'),
    gh = require('./grasshopper'),
    i18n = require('./i18n'),
    base64 = require('./base64');

var viewsDir = '.',
    defaultViewExtn = 'html',
    staticsDir = '.',
    defaultEncoding = 'utf8',
    defaultCharset = 'UTF-8',
    flashEnabled = true,
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
    if(config.defaultCharset)
        defaultCharset = config.defaultCharset;
    if(config.defaultEncoding)
        defaultEncoding = config.defaultEncoding;
    if(config.layout)
        layout = config.layout;
    if(config.flashEnabled !== undefined)
        flashEnabled = config.flashEnabled;
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
        'x-powered-by': 'Grasshopper/0.2.4'
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

    i18n.init(this);
    this.charset = defaultCharset;
}

RequestContext.prototype.getExtn = function() {
    var extn = defaultViewExtn;
    var path = url.parse(this.request.url).pathname;
    if(path.match(/\.[^\/]+$/)) {
        extn = path.substring(path.lastIndexOf('.') + 1);
        this.requestExtn = extn;
    }

    return extn;
};

RequestContext.prototype.challengeAuth = function(type, options) {
    var challengeHeader = type + ' ';
    Object.keys(options).forEach(function(key) {
        challengeHeader += key + '="' + options[key] + '",';
    });
    challengeHeader = challengeHeader.substring(0, challengeHeader.length - 1);
    this.headers['www-authenticate'] = challengeHeader;
    this.renderError(401);
};

RequestContext.prototype.getAuth = function() {
	var authHeader = this.request.headers['authorization'];
	if(authHeader && authHeader.substring(0, 6) == "Basic ") {
		var credentials = base64.decode(authHeader.substring(6), this.encoding);
		var userPass = credentials.split(":", 2);
		return {
			username: userPass[0],
			password: userPass[1]
		};
	} else if(authHeader && authHeader.substring(0, 7) == "Digest ") {
		var credentials = authHeader.substring(7);
        var auth = {};
        credentials.split(',').forEach(function(part) {
            var subParts = part.trim().split('=');
            var value = subParts[1];
            if(value.charAt(0) == '"'
                   && value.charAt(0) == value.charAt(value.length - 1)) {
                value = value.substring(1, value.length - 1);
            }
            auth[subParts[0]] = value;
        });
        return auth;
    }
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

RequestContext.prototype.rotateFlash = function(cb) {
    var self = this;
    this.flash = {};
    if(flashEnabled) {
        this.getSessionValue('flash', function(err, flash) {
            if(flash) {
                self.flash = flash;
                self.unsetSessionValue('flash', function() {
                    cb();
                });
            } else {
                cb();
            }
        });
    } else {
		cb();
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
        this.model['flash'] = this.flash;
        if(useLayout === undefined) {
            useLayout = true;
        }
        var viewFile = viewsDir + '/' + view + '.' + this.extn;
        if(layout && useLayout) {
            this.model.view = view;
            viewFile = layout + '.' + this.extn;
        }

        try {
            this.writeHead();
            ghp.fill(viewFile, this.response, this.model, this.encoding, viewsDir, this.extn, this.locale);
        } catch(e) {
            this.handleError(e);
        }
    }
};

RequestContext.prototype.renderText = function(text) {
    this.send(text);
};

RequestContext.prototype.send = function(text) {
    this.writeHead();
    if(this.request.method != 'HEAD') {
        this.response.write(text, this.encoding);
    }
    this.response.end();
};

RequestContext.prototype.writeHead = function() {
    this.headers['content-type'] += '; charset=' + this.charset
    this.response.writeHead(this.status, this.headers);
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

RequestContext.prototype.sendFile = function(file, fileName) {
    var self = this;
    fs.stat(file, function(err, stats) {
        if(err) {
            self.handleError(err);
        } else {
            if(!fileName) {
                fileName = file.substring(file.lastIndexOf('/') + 1);
            }
            var extn = fileName.substring(fileName.lastIndexOf('.') + 1);
            self.headers['content-type'] = mime.mimes[extn] 
                            ? mime.mimes[extn] 
                            : 'application/octet-stream';

            self.headers['content-disposition'] = 'attachment; filename=' + fileName;
            sendStatic(file, stats, self);
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
                self.writeHead();
                ghp.fill(viewFile, self.response, {error: error}, self.encoding, viewsDir, self.extn, this.locale);
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
    var self = this;
    function proceed() {
        self.headers['location'] = location;
        self.renderError(302, {location: location});
    }
    if(flashEnabled && this.flash && Object.keys(this.flash).length > 0) {
        this.setSessionValue('flash', this.flash, function(err) {
            proceed();
        });
    } else {
        proceed();
    }
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

RequestContext.prototype.unsetSessionValue = function(key, callback) {
    var store = session.getSessionStore();
    var self = this;
    store.hasSession(this.sessionId, function(err, has) {
        if(err) {
            callback(err);
        } else {
            if(has) {
                store.unsetValue(self.sessionId, key, callback);
            } else {
                callback();
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
    function sendBytes() {
		if(satisfiesConditions(stats, ctx)) {
		    ctx.headers['last-modified'] = stats.mtime.toUTCString();
		    ctx.headers['etag'] = stats.mtime.getTime();
		    var range;
		    if(ctx.request.headers['range'] && (range = parseRange(ctx, stats))) {;
		        ctx.status = 206;
		        ctx.headers['content-length'] = range[1] - range[0] + 1;
		        ctx.headers['content-range'] = 'bytes ' + range[0] + '-' + range[1] + '/' + stats.size;
		        var stream = fs.createReadStream(staticFile, {start: range[0], end: range[1]});
		    } else {
		        ctx.headers['content-length'] = stats.size;
		        var stream = fs.createReadStream(staticFile);
		    }

		    ctx.response.writeHead(ctx.status, ctx.headers);
		    if(ctx.request.method == 'GET') {
		        sys.pump(stream, ctx.response);
		    } else {
		        ctx.response.end();
		    }
		}
	}

    var acceptHeader = ctx.request.headers['accept-encoding'];
    if(acceptHeader && acceptHeader.indexOf('gzip') >= 0) {
        fs.stat(staticFile + '.gz', function(err, gzipStats) {
            if(!err) {
                ctx.headers['content-encoding'] = 'gzip';
                staticFile = staticFile + '.gz';
                stats = gzipStats;
                sendBytes();
            } else {
                sendBytes();
            }
        });
    } else {
        sendBytes();
    }
}

function parseRange(ctx, stats) {
    var range = ctx.request.headers['range'],
        ifRange = ctx.request.headers['if-range'],
        fileSize = stats.size,
        ranges = range.substring(6).split(',');
    if(ifRange) {
        if(ifRange.match(/^\d{3}/) && ifRange != stats.mtime.getTime()) {
            return;
        } else if(!ifRange.match(/^\d{3}/) && ifRange != stats.mtime.toUTCString()) {
            return;
        }
    }
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

function satisfiesConditions(stats, ctx) {
    var mtime = stats.mtime,
        modifiedSince = new Date(ctx.request.headers['if-modified-since']),
        noneMatch = Number(ctx.request.headers['if-none-match']);

    if(modifiedSince && modifiedSince >= mtime) {
        var status = 304;
    } else if(noneMatch && noneMatch == mtime.getTime()) {
        var status = 304;
    }

    if(status) {
        ctx.extn = defaultViewExtn;
        ctx.headers['content-type'] = mime.mimes[defaultViewExtn];
        delete ctx.headers['last-modified'];
        delete ctx.headers['content-disposition'];
        ctx.response.writeHead(status, ctx.headers);
        ctx.response.end();
        return false;
    } else {
        return true;
    }
}
