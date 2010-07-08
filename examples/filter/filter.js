require.paths.unshift('./lib');

var mvc = require('mvc');

mvc.addFilters(/\/secure/, function(nextFilter) {
    var self = this;
    this.getSessionValue('user', function(err, user) {
        if(!err && user) {
            nextFilter();
        } else {
            self.renderError(403);
        }
    });
});

mvc.get('/secure_welcome', function() {
    this.disableCache();
    var self = this;
    this.getSessionValue('user', function(err, user) {
        self.model['user'] = user;
        self.render('welcome');
    });
});

mvc.get('/', function() {
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

mvc.post('/login', function() {
    var self = this;
    this.setSessionValue('user', this.params['name'], function() {
        self.redirect('/');
    });
});

mvc.get('/logout', function() {
    var self = this;
    this.endSession(function() {
        self.redirect('/');
    });
});

mvc.serve(8080);
