require.paths.unshift('./lib');

var mvc = require('mvc');

mvc.get('/', function() {
    this.model['cookies'] = this.requestCookies;
    this.render('index');
});

mvc.post('/set_cookie', function() {
    this.addCookie(new mvc.Cookie(this.params['name'], this.params['value']));
    this.redirect('/');
});

mvc.serve(8080);
