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

var configurables = [];

require('fs').readdirSync(__dirname).forEach(function(file) {
    if(file == 'grasshopper.js')
        return;

    var mod = require('./' + file.substring(0, file.length - 3));
    if(typeof mod.configure == 'function') { // Configurable sub-module.
        configurables.push(mod);
    }

    if(typeof mod.api == 'object') { // Sub-module exposes a public API.
        Object.keys(mod.api).forEach(function(key) {
            exports[key] = mod.api[key];
        });
    }
});

// Configure configurable sub-modules.
exports.configure = function(config) {
    configurables.forEach(function(configurable) {
        configurable.configure(config);
    });
};

// Safety net
process.on('uncaughtException', function(err) {
    console.log(err.stack);
});
