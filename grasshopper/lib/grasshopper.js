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
var http = require('http'),
    url = require('url'),
    sys = require('sys'),
    querystring = require('querystring'),
    renderer = require('./renderer'),
    multipart = require('./multipart'),
    session = require('./session'),
    model = require('./model'),
    ghp = require('./ghp'),
    i18n = require('./i18n');

process.on('uncaughtException', function(err) {
    console.log(err.stack);
});

var routes = {},
    secureRoutes = {},
    securePort = undefined,
    servers = [],
    filters = [];

var maxFormSize = 1048576;

exports.addToContext = function() {
    for(var i = 0; i < arguments.length; i++) {
        for(var key in arguments[i]) {
            renderer.RequestContext.prototype[key] = arguments[i][key];
        }
    }
}

exports.addFilters = function(regex) {
    var filtersArray = [];
    for(var i = 1; i < arguments.length; i++) {
        filtersArray.push(arguments[i]);
    }

    filters.push({pattern: regex, filters: filtersArray}); 
}

exports.addHelpers = ghp.addHelpers;

exports.configure = function(config) {
    if(config.maxFormSize)
        maxFormSize = config.maxFormSize;

    renderer.configure(config);
    multipart.configure(config);
    session.configure(config);
    i18n.configure(config);
    ghp.configure(config);
};

exports.initModel = model.init;

exports.get = function(path, controller) {
    routes['get:' + path] = controller;
    routes['head:' + path] = controller;
}

exports.post = function(path, controller) {
    routes['post:' + path] = controller;
}

exports.put = function(path, controller) {
    routes['put:' + path] = controller;
}

exports.del = function(path, controller) {
    routes['delete:' + path] = controller;
}

exports.secureGet = function(path, controller) {
    secureRoutes['get:' + path] = controller;
    secureRoutes['head:' + path] = controller;
    exports.get(path, redirectSecure);
}

exports.securePost = function(path, controller) {
    secureRoutes['post:' + path] = controller;
}

exports.securePut = function(path, controller) {
    secureRoutes['put:' + path] = controller;
}

exports.secureDel = function(path, controller) {
    secureRoutes['delete:' + path] = controller;
}

function redirectSecure() {
    var hostHeader = this.request.headers['host'];
    var redirectHost = hostHeader;
    if(hostHeader.indexOf(':') != -1) {
        redirectHost = hostHeader.split(':')[0] + ':' + securePort;
    }
    this.redirect('https://' + redirectHost + this.request.url);
}

exports.getController = function(method, path) {
    return routes[method + ':' + path];
};

exports.getSecureController = function(method, path) {
    return secureRoutes[method + ':' + path];
};

exports.serve = function(port, hostname, callback) {
    if(typeof hostname === 'function') {
        callback = hostname;
        hostname = undefined;
    }
    startServer(routes, port, undefined, hostname, function() {
        console.log('Hopping at http://127.0.0.1:' + port + '/. Use Ctrl+C to stop.');
        if(callback) callback();
    });
};

exports.serveSecure = function(port, credentials, hostname, callback) {
    if(typeof hostname === 'function') {
        callback = hostname;
        hostname = undefined;
    }
    startServer(secureRoutes, port, credentials, hostname, function() {
        console.log('Hopping securely at http://127.0.0.1:' + port + '/. Use Ctrl+C to stop.');
        if(callback) callback();
    });
};

exports.stop = function() {
    servers.forEach(function(server) {
        server.close();
    });
    servers = [];
};

function startServer(routes, port, credentials, hostname, callback) {
    var routeMatcher = new RouteMatcher(routes);
    var server = http.createServer();
    if(credentials) {
    	securePort = port;
        server.setSecure(credentials);
    }
    server.on("request", function(req, res) {
        try {
            dispatch(req, res, routeMatcher);
        } catch(e) {
            renderer.handleError(e, req, res);
        }
    });
    servers.push(server);
    server.listen(port, hostname, callback);
}

// Class: Cookie
exports.Cookie = function(name, value) {
    this.name = name;
    this.value = value;
    this.path = '/';
    this.httpOnly = true;
}

function dispatch(req, res, routeMatcher) {
    var urlData = url.parse(req.url, true);
    var path = stripPath(urlData.pathname);
    var params = urlData.query;
    var action = routeMatcher.match(req.method, path);
    
    if(action) {
        if((req.method == 'POST' || req.method == 'PUT')) {
            if(req.headers['content-type'] && req.headers['content-type'].match(/^application\/x-www-form-urlencoded/)) {
                if(Number(req.headers['content-length']) > maxFormSize) {
                    new renderer.RequestContext(req, res, {}).renderError(413);
                    return;
                }
                req.setEncoding('utf8');
                var dataString = '';
                req.on('data', function(data) {
                    dataString += data;
                });
                req.on('end', function() {
                    try {
                        params = querystring.parse(dataString);
                        action.invokeController(new renderer.RequestContext(req, res, params), path);
                    } catch(e) {
                        renderer.handleError(e, req, res, params);
                    }
                });
            } else if(req.headers['content-type'] && req.headers['content-type'].match(/^multipart\/form-data/)) {
                var context = new renderer.RequestContext(req, res, params);
                multipart.parse(context, function() {
                    action.invokeController(context, path);
                });
            } else {
                action.invokeController(new renderer.RequestContext(req, res, params), path);
            }
        } else {
            action.invokeController(new renderer.RequestContext(req, res, params), path);
        }
    } else {
        var context = new renderer.RequestContext(req, res, params);
        applyFilters(context, path, function() { 
            context.renderStatic();
        });
    }
}

function stripPath(path) {
    if(path != '/' && path.match(/\/$/)) {
        return path.substring(0, path.length - 1);
    } else if(path.match(/\.[^\/]+$/)) {
        return path.substring(0, path.lastIndexOf('.'));
    } else {
        return path;
    }
}

// Class: RouteMatcher
function RouteMatcher(routes) {
    this.actions = [];
    
    for(var i in routes) {
        var parts = i.split(':', 2);
        this.actions.push(new Action(parts[0].toUpperCase(), parts[1], routes[i]));
    }
}

RouteMatcher.prototype.match = function (method, path) {
    for(var i in this.actions) {
        if(this.actions[i].method == method && path.match(this.actions[i].routeRegExp)) {
            return this.actions[i];
        }
    }
};

// Class: Action
function Action(method, route, controller) {
    this.method = method;
    this.routeRegExp = '^' + route.replace(/\{[^\}]+\}?/g, '(.+)') + '$';
    this.controller = controller;
    
    this.args = [];
    
    var argSlots = route.match(/\{[^\}]+\}?/g);
    
    if(argSlots) {
        for(var i = 0; i < argSlots.length; i++) {
            this.args.push(argSlots[i].substring(1, argSlots[i].length - 1));
        }
    }
}

Action.prototype.invokeController = function(context, path) {
    var argValues = {};
    var matches = path.match(this.routeRegExp);
    var matchCount = 0;
    
    if(matches) {
        for(var i in this.args) {
            matchCount++;
            argValues[this.args[i]] = matches[matchCount];
        }
    }

    var self = this; 
    context.rotateFlash(function() {
        applyFilters(context, path, function() { 
            self.controller.apply(context, [argValues]);
        });
    });
};

function applyFilters(context, path, actionCallback) {
    var matchingFilters = [];
    for(var i = 0; i < filters.length; i++) {
        if(path.match(filters[i].pattern)) {
           matchingFilters = matchingFilters.concat(filters[i].filters); 
        }
    }
    
    var nextFilter = 0;
    var invokeFilter = function() {
        if(matchingFilters.length > 0 && nextFilter < matchingFilters.length) {
            matchingFilters[nextFilter++].apply(context, [invokeFilter]);
        } else {
            actionCallback();
        }
    };
    invokeFilter();
};
