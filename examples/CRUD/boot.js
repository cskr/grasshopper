var gh = require('grasshopper');

gh.configure({
    viewsDir: __dirname + '/views',
    staticsDir: __dirname + '/statics',
    layout: __dirname + '/views/layout',
    locales: require('./locales')
});

require('./routes');

gh.serve(8080);
