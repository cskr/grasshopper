var gh = require('grasshopper');

gh.get('/', function() {
    this.render('index');
});
