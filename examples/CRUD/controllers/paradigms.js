var gh = require('grasshopper'),
    paradigmRepo = require('../repositories/paradigms'),
    Paradigm = require('../models').Paradigm;

gh.get('/paradigms', function() {
    var self = this;
    paradigmRepo.all(function(err, p) {
        self.model['paradigms'] = p;
        self.render('paradigms/index');
    });
});

gh.get('/paradigms/add', function() {
    this.model['paradigm'] = new Paradigm();
    this.render('paradigms/add');
});

gh.get('/paradigms/{id}/edit', function(args) {
    var self = this;
    paradigmRepo.get(args.id, function(err, p) {
        self.model['paradigm'] = p;
        self.render('paradigms/edit');
    });
});

gh.post('/paradigms', function() {
    var p = new Paradigm().update(this.params['paradigm']);
    var self = this;
    if(!p.isValid()) {
        this.model['paradigm'] = p;
        this.render('paradigms/add');
    } else {
        paradigmRepo.save(p, function() {
            self.flash['paradigmSuccess'] = 'Paradigm was saved successfully!';
            self.redirect('/paradigms');
        });
    }
});

gh.post('/paradigms/{id}/update', function(args) {
    var self = this;
    paradigmRepo.get(args.id, function(err, p) {
        p.update(self.params['paradigm']);
        if(!p.isValid()) {
            self.model['paradigm'] = p;
            self.render('paradigms/edit');
        } else {
            paradigmRepo.save(p, function() {
                self.flash['paradigmSuccess'] = 'Paradigm was saved successfully!';
                self.redirect('/paradigms');
            });
        }
    });
});

gh.post('/paradigms/{id}/delete', function(args) {
    var self = this;
    paradigmRepo.get(args.id, function(err, p) {
        paradigmRepo.remove(p, function() {
            self.redirect('/paradigms');
        });
    });
});
