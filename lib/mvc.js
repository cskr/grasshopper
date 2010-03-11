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
    querystring = require('querystring'),
    renderer = require('./renderer');

exports.serve = function(port) {
    var rotues = {};
    for(var i = 1; i < arguments.length; i++) {
        for(var route in arguments[i]) {
            routes[route] = arguments[i][route];
        }
    }

    var routeMatcher = new RouteMatcher(routes);
    var server = http.createServer(function(req, res) {
        dispatch(req, res, routeMatcher);
    });
    
    server.listen(port);
}

function dispatch(req, res, routeMatcher) {
    var urlData = url.parse(req.url, true);
    var path = stripPath(urlData.pathname);
    var params = urlData.query;
    var action = routeMatcher.match(req.method, path);
    
    if(action) {
        if((req.method == 'POST' || req.method == 'PUT') &&
            req.headers['content-type'] == 'application/x-www-form-urlencoded') {
            
            req.addListener('data', function(data) {
                params = querystring.parse(data);
                action.invokeController(req, res, params, path);
            });
        } else {
            action.invokeController(req, res, params, path);
        }
    } else {
        ctx = new renderer.RequestContext(req, res, params);
        ctx.status = 404;
        ctx.renderError();
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

Action.prototype.invokeController = function(req, res, params, path) {
    var argValues = {};
    var matches = path.match(this.routeRegExp);
    var matchCount = 0;
    
    if(matches) {
        for(var i in this.args) {
            matchCount++;
            argValues[this.args[i]] = matches[matchCount];
        }
    }
    
    this.controller(new renderer.RequestContext(req, res, params), argValues);
};
