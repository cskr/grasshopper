var gh = require('grasshopper');

function Execution() {
}

Execution.prototype.validate = function() {
    this.validateRequired('name', false); // Avoid prefix
    this.validateRequired('description', false);
};

exports.Execution = gh.initModel(Execution, 'id', 'name', 'description');
