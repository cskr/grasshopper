var gh = require('./grasshopper');

gh.configure({
    viewsDir: 'views',
    layout: 'layout'
});

gh.get('/', function() {
    this.render('home');
});

gh.get('/about', function() {
    this.render('about');
});

gh.serve(8080);
