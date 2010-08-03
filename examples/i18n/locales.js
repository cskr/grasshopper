var gh = require('grasshopper');

var locales = {};
locales['en-us'] = {
    title: 'Color Page',
    msg: 'Color'
};
locales['en-gb'] = {
    title: 'Colour Page',
    msg: 'Colour'
};

gh.configure({
    locales: locales
});

gh.get('/', function() {
    this.render('index');
});

gh.serve(8080);
