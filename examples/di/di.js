var gh = require('./grasshopper');

var dependencies = {
    dataService: {
        getStock: function() {
            return 100;
        }
    }
};
gh.addToContext(dependencies);

gh.get('/', function() {
    this.renderText('There are ' + this.dataService.getStock() + ' units in stock!');
});

gh.serve(8080);

