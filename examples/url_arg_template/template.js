require.paths.unshift('./lib');

var gh = require('grasshopper');

gh.get('/greetings/{name}', function(args) {
    this.model['name'] = args.name;
    this.render('greeting');
});

gh.serve(8080);
