var gh = require('../../../grasshopper');

gh.configure({
    viewsDir: __dirname + '/views',
    staticsDir: __dirname + '/statics'
});

gh.addFilters(/\/filtered/, function(next) {
    this.renderText('Filtered');
});

gh.get('/', function() {
    this.renderText(this.params['name']);
});

gh.get('/args_supported/{name}', function(args) {
    this.renderText(args['name']);
});

gh.get('/templated/{name}', function(args) {
    this.model['name'] = args['name'];
    this.render('simple_template');
});

gh.post('/', function() {
    this.renderText(this.params['name']);
});

gh.get('/filtered', function(args) {
    this.renderText('Filter missed.');
});

gh.post('/upload', function() {
    this.renderText('Received: ' + this.params['name'] + ', '
                        + this.params['file'].filename + ' - '
                        + this.params['file'].length);
});

gh.get('/send_file', function(args) {
    this.sendFile(__dirname + '/statics/test.pdf');
});
