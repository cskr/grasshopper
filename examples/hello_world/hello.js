require.paths.unshift('./lib');

var mvc = require('mvc');

mvc.get('/', function() {
    this.renderText('Hello World!');
});

mvc.serve(8080);
