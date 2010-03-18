require.paths.unshift('./lib');

routes = {}
routes['get:/greetings/{name}'] = function(args) {
    this.render('greeting', {name: args.name});
}

require('mvc').serve(8080, routes);
