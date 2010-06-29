var sessionStore = new DefaultSessionStore();

exports.getSessionStore = function() {
    return sessionStore;
};

exports.setSessionStore = function(store) {
    sessionStore = store;
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

DefaultSessionStore.prototype.getValue = function(sessionId, key, callback) {
    callback(null, this.sessions[sessionId][key]);
};

DefaultSessionStore.prototype.endSession = function(sessionId, callback) {
    delete this.sessions[sessionId];
    callback(null);
};
