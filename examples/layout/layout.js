require.paths.unshift('./lib');

var gh = require('grasshopper');
var renderer = require('renderer');

renderer.configure({
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
