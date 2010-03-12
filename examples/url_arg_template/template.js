routes = {}

routes['get:/greetings/{name}'] = function(args) {
    this.render('greeting', {name: args.name});
}

require('./lib/mvc').serve(8080, routes);
