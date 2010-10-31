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

function ParamParser() {
    this.params = {};
}

ParamParser.prototype.addParam = function(name, value) {
    if(name.indexOf('.') < 0) {
        includeValue(this.params, name, value);
    } else {
        includeObject(this.params, name, value);
    }
};

ParamParser.prototype.getParams = function() {
    return this.params;
};

exports.ParamParser = ParamParser;

function includeObject(parent, name, value) {
    var objName = name.substring(0, name.indexOf('.')); 
    if(parent[objName] === undefined) {
        parent[objName] = {};
    }
    var fieldName = name.substring(name.indexOf('.') + 1);
    if(fieldName.indexOf('.') < 0) {
        includeValue(parent[objName], fieldName, value);
    } else {
        includeObject(parent[objName], fieldName, value);
    }
}

function includeValue(paramObj, name, value) {
    if(paramObj[name] === undefined) {
        paramObj[name] = value;
    } else {
        if(Array.isArray(paramObj[name])) {
            paramObj[name].push(value);
        } else {
            paramObj[name] = [paramObj[name], value];
        }
    }
}
