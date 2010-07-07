require.paths.unshift('./lib');

var mvc = require('mvc');

mvc.get('/greetings/{name}', function(args) {
    this.model['name'] = args.name;
    this.render('greeting');
});

mvc.serve(8080);
