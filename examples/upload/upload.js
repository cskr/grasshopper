var gh = require('grasshopper'),
    fs = require('fs');

gh.get('/', function() {
    this.render('index');
});

gh.post('/upload', function() {
    var upload = this.params['file'];
    this.model.name = this.params['name'];

    var self = this;
    fs.rename(upload.path, './uploads/' + upload.filename, function() {
        self.render('upload');
    });
});

gh.serve(8080);
