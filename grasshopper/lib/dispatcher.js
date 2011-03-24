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
    querystring = require('querystring'),
    ParamParser = require('./params').ParamParser,
    multipart = require('./multipart');

exports.api = {};

var maxFormSize = 1048576,
    filters = [];

exports.configure = function(config) {
    if(config.maxFormSize)
        maxFormSize = config.maxFormSize;
};

exports.api.addFilters = function(regex) {
    var filtersArray = [];
    for(var i = 1; i < arguments.length; i++) {
        filtersArray.push(arguments[i]);
    }

    filters.push({pattern: regex, filters: filtersArray}); 
};

exports.dispatch = function(ctx, routeMatcher) {
    var req = ctx.request, res = ctx.response;
    var urlData = url.parse(req.url, true);
    var path = stripPath(urlData.pathname);
    var params = urlData.query || {};
    var action = routeMatcher.match(req.method, path);
    
    if(action) {
        if((req.method == 'POST' || req.method == 'PUT')) {
            if(req.headers['content-type'] && req.headers['content-type'].match(/^application\/x-www-form-urlencoded/)) {
                if(Number(req.headers['content-length']) > maxFormSize) {
                    ctx.renderError(413);
                    return;
                }
                req.setEncoding('utf8');
                var dataString = '';
                req.on('data', function(data) {
                    dataString += data;
                });
                req.on('end', function() {
                    try {
                        ctx.params = splitParams(querystring.parse(dataString));
                        action.invokeController(ctx, path);
                    } catch(e) {
                        ctx._handleError(e);
                    }
                });
            } else if(req.headers['content-type'] && req.headers['content-type'].match(/^multipart\/form-data/)) {
                ctx.params = splitParams(params);
                multipart.parse(ctx, function() {
                    action.invokeController(ctx, path);
                });
            } else {
                ctx.params = splitParams(params);
                action.invokeController(ctx, path);
            }
        } else {
            ctx.params = splitParams(params);
            action.invokeController(ctx, path);
        }
    } else {
        ctx.params = splitParams(params);
        applyFilters(ctx, path, function() { 
            ctx._renderStatic();
        });
    }
}

function stripPath(path) {
    if(path.match(/\.[^\/]+$/)) {
        return path.substring(0, path.lastIndexOf('.'));
    } else {
        return path;
    }
}

function splitParams(params) {
    var parser = new ParamParser();

    Object.keys(params).forEach(function(key) {
        parser.addParam(key, params[key]);
    });
    return parser.getParams();
}

// Class: RouteMatcher
function RouteMatcher(routes) {
    this.actions = [];
    
    for(var i in routes) {
        var parts = i.split(':', 2);
        this.actions.push(new Action(parts[0].toUpperCase(), parts[1], routes[i]));
    }
}
exports.RouteMatcher = RouteMatcher;

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
    context._rotateFlash(function() {
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
