var gh = require('grasshopper');

function Item() {
};

Item.prototype.validate = function() {
    this.validateRequired('name');
    this.validateRequired('tags');
    this.validatePattern('tags', /[^\s,]/);
};

exports.Item = gh.initModel(Item, 'name', 'tags');
