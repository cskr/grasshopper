routes = {}

routes['get:/'] = function() {
    this.renderText('Hello World!');
}

require('./lib/mvc').serve(8080, routes);
