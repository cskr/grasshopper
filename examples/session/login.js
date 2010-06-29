require.paths.unshift('./lib');

var mvc = require('mvc');

mvc.get('/', function() {
    var self = this;
    this.getSessionValue('user', function(err, user) {
        if(!err && user) {
            self.render('welcome', {user: user});
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

mvc.serve(5555);
