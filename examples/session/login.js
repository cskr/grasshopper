var gh = require('./grasshopper');

gh.get('/', function() {
    var self = this;
    this.getSessionValue('user', function(err, user) {
        self.disableCache();
        if(!err && user) {
            self.model['user'] = user;
            self.render('welcome');
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
