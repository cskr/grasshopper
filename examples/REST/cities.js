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

var routes = {};
routes['get:/'] = function() {
    this.redirect('/cities');
}


routes['get:/cities'] = function() {
    this.render('index', {cities: this.cityProvider.findAll()});
}

routes['get:/cities/{id}'] = function(args) {
    var city = this.cityProvider.findById(args.id);

    if(city) {
        this.render('show', city);
    } else {
        this.renderError(404);
    }
}

routes['post:/cities'] = function() {
   var city = {
       name: this.params.name,
       population: this.params.population
   };

   this.cityProvider.save(city);
   this.status = 201;
   this.render('show', city);
}

routes['put:/cities/{id}'] = function(args) {
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
}

routes['delete:/cities/{id}'] = function(args) {
    var city = this.cityProvider.findById(args.id);
    if(city) {
        this.cityProvider.remove(city);

        this.status = 204;
        this.render();
    } else {
        this.renderError(404);
    }
}

renderer.configure({
    defaultViewExtn: 'xml'
});

mvc.addToContext({cityProvider: new InMemoryCityProvider()});
mvc.serve(8080, routes);
