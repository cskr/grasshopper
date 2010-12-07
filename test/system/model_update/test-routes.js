var gh = require('../../../grasshopper');

gh.configure({
    viewsDir: __dirname + '/views'
});

function Person() {
}

gh.initModel(Person, 'name', 'address');

function Country() {
}

gh.initModel(Country, 'name', 'cities');

gh.post('/people', function() {
    var person = new Person().update(this.params['person'])
    this.model['person'] = person;
    this.render('person_view');
});

gh.post('/countries', function() {
    var country = new Country().update(this.params['country']);
    this.model['country'] = country;
    this.render('country_view');
});
