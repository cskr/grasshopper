var mvc = require('./lib/mvc');
var renderer = require('./lib/renderer');

function CityDataProvider() {
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
        // Nothing to be done as the service works in-memory.
    }

    this.remove = function(city) {
        delete cities[city.id];
    }
}

var routes = {};
routes['get:/cities'] = function() {
    this.render('index', this.cityService.findAll());
}

routes['get:/cities/{id}'] = function(args) {
    var city = this.cityService.findById(args.id);

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

   this.cityService.save(city);
   this.status = 201;
   this.render('show', city);
}

routes['put:/cities/{id}'] = function(args) {
    var city = this.cityService.findById(args.id);
    if(city) {
        city.name = this.params.name;
        city.population = this.params.population;
        this.cityService.update(city);

        this.status = 204;
        this.render();
    } else {
        this.renderError(404);
    }
}

routes['delete:/cities/{id}'] = function(args) {
    var city = this.cityService.findById(args.id);
    if(city) {
        this.cityService.remove(city);

        this.status = 204;
        this.render();
    } else {
        this.renderError(404);
    }
}

renderer.configure({
    defaultViewExtn: 'xml'
});

mvc.addToContext({cityService: new CityDataProvider()});
mvc.serve(8080, routes);
