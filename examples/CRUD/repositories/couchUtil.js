exports.getValues = function(rows, map) {
    var values = [];
    rows.forEach(function(row) {
        var val = map(row);
        val._id = row.value._id;
        val._rev = row.value._rev;
        values.push(val);
    });

    return values;
};

exports.getDoc = function(value, map) {
    var doc = {}
    if(value._id) {
        doc._id = value._id;
    }
    if(value._rev) {
        doc._rev = value._rev;
    }
    doc.Type = value.constructor.name;
    map(value, doc);
    return doc;
};
