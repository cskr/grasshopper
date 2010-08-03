var gh = require('grasshopper'),
    executionRepo = require('../repositories/executions'),
    Execution = require('../models').Execution;

gh.get('/executions', function() {
    var self = this;
    executionRepo.all(function(err, p) {
        self.model['executions'] = p;
        self.render('executions/index');
    });
});

gh.get('/executions/add', function() {
    this.model['execution'] = new Execution();
    this.render('executions/add');
});

gh.get('/executions/{id}/edit', function(args) {
    var self = this;
    executionRepo.get(args.id, function(err, p) {
        self.model['execution'] = p;
        self.render('executions/edit');
    });
});

gh.post('/executions', function() {
    var p = new Execution().update(this.params['execution']);
    var self = this;
    if(!p.isValid()) {
        this.model['execution'] = p;
        this.render('executions/add');
    } else {
        executionRepo.save(p, function() {
            self.flash['executionSuccess'] = 'Execution was saved successfully!';
            self.redirect('/executions');
        });
    }
});

gh.post('/executions/{id}/update', function(args) {
    var self = this;
    executionRepo.get(args.id, function(err, p) {
        p.update(self.params['execution']);
        if(!p.isValid()) {
            self.model['execution'] = p;
            self.render('executions/edit');
        } else {
            executionRepo.save(p, function() {
                self.flash['executionSuccess'] = 'Execution was saved successfully!';
                self.redirect('/executions');
            });
        }
    });
});

gh.post('/executions/{id}/delete', function(args) {
    var self = this;
    executionRepo.get(args.id, function(err, p) {
        executionRepo.remove(p, function() {
            self.redirect('/executions');
        });
    });
});
