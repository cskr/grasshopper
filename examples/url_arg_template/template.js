routes = {}

routes['get:/greetings/{name}'] = function(ctx, args) {
    ctx.render('greeting', {name: args.name});
}

require('./lib/mvc').serve(8080, routes);
