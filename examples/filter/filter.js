var gh = require('grasshopper');

gh.addFilters(/\/secure/, function(nextFilter) {
    var self = this;
    this.getSessionValue('user', function(err, user) {
        if(!err && user) {
            nextFilter();
        } else {
            self.renderError(403);
        }
    });
});

gh.get('/secure_welcome', function() {
    this.disableCache();
    var self = this;
    this.getSessionValue('user', function(err, user) {
        self.model['user'] = user;
        self.render('welcome');
    });
});

gh.get('/', function() {
    this.disableCache();
    var self = this;
    this.getSessionValue('user', function(err, user) {
        if(!err && user) {
            self.redirect('/secure_welcome'); 
        } else {
            self.render('login');
        }
    });
});

gh.post('/login', function() {
    var self = this;
    this.setSessionValue('user', this.params['name'], function() {
        self.redirect('/');
    });
});

gh.get('/logout', function() {
    var self = this;
    this.endSession(function() {
        self.redirect('/');
    });
});

gh.serve(8080);
