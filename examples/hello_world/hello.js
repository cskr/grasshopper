routes = {}

routes['get:/'] = function(ctx) {
    ctx.renderText('Hello World!');
}

require('./lib/mvc').serve(8080, routes);
