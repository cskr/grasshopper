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
    uuid = require('./uuid'),
    ParamParser = require('./params').ParamParser,
    formidable = require('formidable');

var maxUploadSize = undefined,
    uploadsDir = '/tmp';

exports.configure = function(config) {
    if(config.maxUploadSize)
        maxUploadSize = config.maxUploadSize;
    if(config.uploadsDir)
        uploadsDir = config.uploadsDir;
};

exports.parse = function(context, callback) {
    context.params = {};
    var req = context.request;
    if(Number(req.headers['content-length']) > maxUploadSize) {
        context.renderError(413);
        return;
    }

    var form = new formidable.IncomingForm();
    form.uploadDir = uploadsDir;
    var parser = new ParamParser();

    form.on('field', function(name, value) {
        parser.addParam(name, value);
    });

    form.on('file', function(name, file) {
        parser.addParam(name, file);
    });

    form.on('error', function(err) {
        context._handleError(err);
    });

    form.on('end', function() {
        context.params = parser.getParams();
        callback();
    });

    form.parse(req);
};

