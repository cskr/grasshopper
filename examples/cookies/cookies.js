require.paths.unshift('./lib');

var gh = require('grasshopper');

gh.get('/', function() {
    this.model['cookies'] = this.requestCookies;
    this.render('index');
});

gh.post('/set_cookie', function() {
    this.addCookie(new gh.Cookie(this.params['name'], this.params['value']));
    this.redirect('/');
});

gh.serve(8080);
