var gh = require('grasshopper');

function Language() {
}

Language.prototype.validate = function() {
    this.validateRequired('name', false); // Avoid prefix
    this.validateRequired('executionId', false);
    this.validateRequired('paradigmIds');
    if(!this.static() && !this.dynamic()) {
        this.addError('typing', 'Select at least one type system.', false);
    }
};

exports.Language = gh.initModel(Language, 'id', 'name', 'static',
                                'dynamic', 'executionId', 'paradigmIds');
