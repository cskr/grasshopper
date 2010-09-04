var gh = require('grasshopper'),
    ItemRepo = require('./app/itemRepo').ItemRepo;

gh.configure({
    viewsDir: './views',
    staticsDir: './statics',
    layout: 'layout',
    locales: require('./locales').locales
});

gh.addToContext({
    repo: new ItemRepo()
});

require('./app/controllers');

gh.serve(8080);
