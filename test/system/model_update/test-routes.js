var gh = require('../../../grasshopper');

gh.configure({
    viewsDir: __dirname + '/views'
});

function Person() {
}

gh.initModel(Person, 'name', 'address');

gh.post('/people', function() {
    var person = new Person().update(this.params['person'])
    this.model['person'] = person;
    this.render('model_values');
});
