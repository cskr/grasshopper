require.paths.unshift('./lib');

routes = {}
routes['get:/'] = function() {
    this.renderText('Hello World!');
}

require('mvc').serve(8080, routes);
