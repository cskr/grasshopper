require.paths.unshift('./lib');

var mvc = require('mvc');
var renderer = require('renderer');

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

mvc.get('/', function() {
    this.redirect('/cities');
});

mvc.get('/cities',  function() {
    this.renderText(JSON.stringify({cities: this.cityProvider.findAll()}));
});

mvc.get('/cities/{id}',  function(args) {
    var city = this.cityProvider.findById(args.id);

    if(city) {
        this.renderText(JSON.stringify(city));
    } else {
        this.renderError(404);
    }
});

mvc.post('/cities', function() {
   var city = {
       name: this.params.name,
       population: this.params.population
   };

   this.cityProvider.save(city);
   this.status = 201;
   this.renderText(JSON.stringify(city));
});

mvc.put('/cities/{id}', function(args) {
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

mvc.del('/cities/{id}', function(args) {
    var city = this.cityProvider.findById(args.id);
    if(city) {
        this.cityProvider.remove(city);

        this.status = 204;
        this.render();
    } else {
        this.renderError(404);
    }
});

mvc.addToContext({cityProvider: new InMemoryCityProvider()});
mvc.serve(8080);
