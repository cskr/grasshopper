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
var url = require('url'),
    fs = require('fs'),
    mime = require('./mime'),
    i18n = require('./i18n'),
    base64 = require('./base64');

var defaultViewExtn = 'html',
    defaultEncoding = 'utf8',
    defaultCharset = 'UTF-8',
    viewsDir = '.';

// Class: RequestContext
function RequestContext(request, response) {
    this.request = request;
    this.response = response;
    this.model = {};

    this.status = 200;
    this.extn = this._getExtn();
    this.encoding = defaultEncoding;
    this.headers = {
        'content-type': mime.mimes[this.extn]
                        ? mime.mimes[this.extn]
                        : 'application/octet-stream',
        'date': new Date().toUTCString(),
        'x-powered-by': 'Grasshopper/0.3.3'
    };

    var cookieLine = request.headers['cookie'];
    this.requestCookies = {};
    if(cookieLine) {
        var cookies = cookieLine.split(';');
        for(var i = 0; i < cookies.length; i++) {
            var cookieParts = cookies[i].trim().split('=');
            if(cookieParts[0] == 'GHSESSION') {
                this.sessionId = decodeURIComponent(cookieParts[1]);
            } else {
                this.requestCookies[cookieParts[0]]
                        = decodeURIComponent(cookieParts[1]);
            }
        }
    }

    i18n.init(this);
    this.charset = defaultCharset;
}

RequestContext.prototype._getExtn = function() {
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

RequestContext.prototype.renderText = function(text) {
    this._writeHead();
    if(this.request.method != 'HEAD') {
        this.response.write(text, this.encoding);
    }
    this.response.end();
};

RequestContext.prototype.renderError = function(status, error, cb) {
    this.status = status;
    if(error === undefined) {
        error = {};
    }
    if(typeof error == 'function') {
        cb = error;
        error = {};
    }

    var viewFile = viewsDir + '/' + this.status + '.' + this.extn;

    var self = this;
    fs.stat(viewFile, function(err, stats) {
        if(!err && stats.isFile()) {
            try {
                self._writeHead();
                ghp.fill(viewFile, self.response, {error: error}, self.encoding, viewsDir, self.extn, this.locale);
                cb && cb();
            } catch(e) {
                self._handleError(e);
                cb && cb();
            }
        } else {
            self._writeHead();
            self.response.end();
            cb && cb();
        }
    });
};

RequestContext.prototype._writeHead = function() {
    if(this.charset) {
        this.headers['content-type'] += '; charset=' + this.charset
    }
    this.response.writeHead(this.status, this.headers);
};

RequestContext.prototype.disableCache = function() {
    this.headers['expires'] = 'Thu, 11 Mar 2010 12:48:43 GMT';
    this.headers['cache-control'] = 'no-store, no-cache, must-revalidate';
    this.headers['pragma'] = 'no-cache';
};

exports.RequestContext = RequestContext;
