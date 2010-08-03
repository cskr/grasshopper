var gh = require('grasshopper');

function InMemoryCityProvider() {
    var cities = {};
    var nextCityId = 1;

    this.findAll = function() {
        var cityList = [];
        for(var i in cities) {
            cityList.push(cities[i]);
        }

        return cityList;
    }

    this.findById = function(cityId) {
        return cities[cityId];
    }

    this.save = function(city) {
        city.id = nextCityId++;
        cities[city.id] = city;
    }

    this.update = function(city) {
        // Nothing to be done in an in-memory provider.
    }

    this.remove = function(city) {
        delete cities[city.id];
    }
}

gh.get('/', function() {
    this.redirect('/cities');
});

gh.get('/cities',  function() {
    this.renderText(JSON.stringify({cities: this.cityProvider.findAll()}));
});

gh.get('/cities/{id}',  function(args) {
    var city = this.cityProvider.findById(args.id);

    if(city) {
        this.renderText(JSON.stringify(city));
    } else {
        this.renderError(404);
    }
});

gh.post('/cities', function() {
   var city = {
       name: this.params.name,
       population: this.params.population
   };

   this.cityProvider.save(city);
   this.status = 201;
   this.renderText(JSON.stringify(city));
});

gh.put('/cities/{id}', function(args) {
    var city = this.cityProvider.findById(args.id);
    if(city) {
        city.name = this.params.name;
        city.population = this.params.population;
        this.cityProvider.update(city);

        this.status = 204;
        this.render();
    } else {
        this.renderError(404);
    }
});

gh.del('/cities/{id}', function(args) {
    var city = this.cityProvider.findById(args.id);
    if(city) {
        this.cityProvider.remove(city);

        this.status = 204;
        this.render();
    } else {
        this.renderError(404);
    }
});

gh.configure({
    defaultViewExtn: 'json'
});

gh.addToContext({cityProvider: new InMemoryCityProvider()});
gh.serve(8080);
