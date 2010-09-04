var gh = require('grasshopper'),
    Item = require('./item').Item;

gh.get('/', function() {
    this.render('search');
});

gh.get('/search', function() {
    this.model['items'] = this.repo.search(this.params['tags']);
    this.model['searchTags'] = this.params['tags'];
    this.render('results');
});

gh.post('/watch', function() {
    var self = this;
    this.repo.watch(this.params['tags'], function(item) {
        self.renderText(item.name());
    });
});

gh.get('/items/add', function() {
    this.model['item'] = new Item();
    this.render('add');
});

gh.post('/items', function() {
    var item = new Item().update(this.params['item']);
    if(item.isValid()) {
        this.repo.add(item);
        this.redirect('/');
    } else {
        this.model['item'] = item;
        this.render('add');
    }
});
