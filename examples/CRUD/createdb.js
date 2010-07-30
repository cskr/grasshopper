var couchdb = require('../support/node-couchdb/lib/couchdb'),
    client = couchdb.createClient();

client.request('put', '/ghcrud');

client.db('ghcrud').saveDesign('paradigm', {
    views: {
        all: {
            map: function(doc) {
                if(doc.Type == 'Paradigm') {
                    emit(null, doc);
                }
            }
        }
    }
});

client.db('ghcrud').saveDesign('execution', {
    views: {
        all: {
            map: function(doc) {
                if(doc.Type == 'Execution') {
                    emit(null, doc);
                }
            }
        }
    }
});

client.db('ghcrud').saveDesign('language', {
    views: {
        all: {
            map: function(doc) {
                if(doc.Type == 'Language') {
                    emit(null, doc);
                }
            }
        }
    }
});
