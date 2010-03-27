require.paths.unshift('./lib');

var mvc = require('mvc');

var dependencies = {
    dataService: {
        getStock: function() {
            return 100;
        }
    }
};
mvc.addToContext(dependencies);

mvc.get('/', function() {
    this.renderText('There are ' + this.dataService.getStock() + ' units in stock!');
});

mvc.serve(8080);

