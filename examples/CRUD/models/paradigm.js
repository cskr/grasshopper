var gh = require('grasshopper');

function Paradigm() {
}

Paradigm.prototype.validate = function() {
    this.validateRequired('name', false); // Avoid prefix
    this.validateRequired('description', false);
};

exports.Paradigm = gh.initModel(Paradigm, 'id', 'name', 'description');
