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
var sessionStore = new DefaultSessionStore();

exports.getSessionStore = function() {
    return sessionStore;
};

exports.configure = function(config) {
    if(config.sessionStore)
        sessionStore = config.sessionStore;
};

// Class: DefaultSessionStore
function DefaultSessionStore() {
    this.sessions = {};
}

DefaultSessionStore.prototype.beginSession = function(sessionId, callback) {
    this.sessions[sessionId] = {};
    callback(null);
};

DefaultSessionStore.prototype.hasSession = function(sessionId, callback) {
    callback(null, !!this.sessions[sessionId]);
}

DefaultSessionStore.prototype.setValue = function(sessionId, key, value, callback) {
    this.sessions[sessionId][key] = value;
    callback(null);
};

DefaultSessionStore.prototype.unsetValue = function(sessionId, key, callback) {
    delete this.sessions[sessionId][key];
    callback(null);
};

DefaultSessionStore.prototype.getValue = function(sessionId, key, callback) {
    callback(null, this.sessions[sessionId][key]);
};

DefaultSessionStore.prototype.endSession = function(sessionId, callback) {
    delete this.sessions[sessionId];
    callback(null);
};
