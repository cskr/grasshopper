var gh = require('grasshopper');

gh.configure({
    viewsDir: './views',
    layout: 'layout',
    locales: require('./locales')
});

[
    './controllers/home',
    './controllers/paradigms',
    './controllers/executions',
    './controllers/languages'

].forEach(function(controller) {
    require(controller);
});

gh.serve(8080);
