require.paths.unshift('./lib');

var mvc = require('mvc');

mvc.get('/greetings/{name}', function(args) {
    this.render('greeting', {name: args.name});
});

mvc.serve(8080);
