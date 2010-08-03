var gh = require('grasshopper'),
    languageRepo = require('../repositories/languages'),
    executionRepo = require('../repositories/executions'),
    paradigmRepo = require('../repositories/paradigms'),
    Language = require('../models').Language;

gh.get('/languages', function() {
    var self = this;
    languageRepo.all(function(err, p) {
        self.model['languages'] = p;
        self.render('languages/index');
    });
});

gh.get('/languages/add', function() {
    this.model['language'] = new Language();
    var self  = this;
    loadDeps(this.model, function() {
        self.render('languages/add');
    });
});

gh.get('/languages/{id}/edit', function(args) {
    var self = this;
    languageRepo.get(args.id, function(err, p) {
        self.model['language'] = p;
        loadDeps(self.model, function() {
            self.render('languages/edit');
        });
    });
});

gh.post('/languages', function() {
    var p = new Language().update(this.params['language']);
    var self = this;
    if(!p.isValid()) {
        this.model['language'] = p;
        loadDeps(this.model, function() {
            self.render('languages/add');
        });
    } else {
        languageRepo.save(p, function() {
            self.flash['languageSuccess'] = 'Language was saved successfully!';
            self.redirect('/languages');
        });
    }
});

gh.post('/languages/{id}/update', function(args) {
    var self = this;
    languageRepo.get(args.id, function(err, p) {
        p.update(self.params['language']);
        if(!p.isValid()) {
            self.model['language'] = p;
            loadDeps(self.model, function() {
                self.render('languages/edit');
            });
        } else {
            languageRepo.save(p, function() {
                self.flash['languageSuccess'] = 'Language was saved successfully!';
                self.redirect('/languages');
            });
        }
    });
});

gh.post('/languages/{id}/delete', function(args) {
    var self = this;
    languageRepo.get(args.id, function(err, p) {
        languageRepo.remove(p, function() {
            self.redirect('/languages');
        });
    });
});

function loadDeps(model, cb) {
    paradigmRepo.all(function(err, p) {
        model['paradigms'] = p;
        executionRepo.all(function(err, e) {
            model['executions'] = e;
            cb();
        });
    });
}
