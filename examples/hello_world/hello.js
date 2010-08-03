var gh = require('grasshopper');

gh.get('/', function() {
    this.renderText('Hello World!');
});

gh.serve(8080);
