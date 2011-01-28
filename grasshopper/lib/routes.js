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

exports.api = {};

var http = require('http'),
    context = require('./context'),
    dispatcher = require('./dispatcher'),
    RouteMatcher = dispatcher.RouteMatcher;

// Module variables.
var routes = {},
    secureRoutes = {},
    securePort = undefined,
    servers = [];

exports.api.get = function(path, controller) {
    routes['get:' + path] = controller;
    routes['head:' + path] = controller;
}

exports.api.post = function(path, controller) {
    routes['post:' + path] = controller;
}

exports.api.put = function(path, controller) {
    routes['put:' + path] = controller;
}

exports.api.del = function(path, controller) {
    routes['delete:' + path] = controller;
}

exports.api.secureGet = function(path, controller) {
    secureRoutes['get:' + path] = controller;
    secureRoutes['head:' + path] = controller;
    exports.api.get(path, redirectSecure);
}

exports.api.securePost = function(path, controller) {
    secureRoutes['post:' + path] = controller;
}

exports.api.securePut = function(path, controller) {
    secureRoutes['put:' + path] = controller;
}

exports.api.secureDel = function(path, controller) {
    secureRoutes['delete:' + path] = controller;
}

exports.api.serve = function(port, hostname, callback) {
    return startServer(routes, port, undefined, hostname, callback);
};

exports.api.serveSecure = function(port, credentials, hostname, callback) {
    return startServer(secureRoutes, port, credentials, hostname, callback);
};

exports.api.stop = function() {
    servers.forEach(function(server) {
        server.close();
    });
    servers = [];
};

exports.api.getController = function(method, path) {
    return routes[method + ':' + path];
};

exports.api.getSecureController = function(method, path) {
    return secureRoutes[method + ':' + path];
};

function redirectSecure() {
    var hostHeader = this.request.headers['host'];
    var redirectHost = hostHeader;
    if(hostHeader.indexOf(':') != -1) {
        redirectHost = hostHeader.split(':')[0] + ':' + securePort;
    }
    this.redirect('https://' + redirectHost + this.request.url);
}

function startServer(routes, port, credentials, hostname, callback) {
    if(typeof hostname === 'function') {
        callback = hostname;
        hostname = undefined;
    }

    var routeMatcher = new RouteMatcher(routes);
    var server = http.createServer();

    if(credentials) {
    	securePort = port;
        server.setSecure(credentials);
    }

    server.on("request", function(req, res) {
        var ctx = new context.RequestContext(req, res, !!credentials);
        try {
            dispatcher.dispatch(ctx, routeMatcher);
        } catch(e) {
            ctx._handleError(e);
        }
    });
    servers.push(server);

    if(typeof port == 'number') {
        server.listen(port, hostname, function() {
            var url = (credentials ? 'https://' : 'http://')
                            + (hostname || 'localhost') + ':'
                            + port;
            console.log('Hopping at ' + url + '. Use Ctrl+C to stop.');
            if(callback) callback();
        });
    }

    return server;
}
