var http = require('http');

exports.invoke = function(method, path, headers, body, cb) {
    if(method == 'POST' && headers['content-type'] === undefined) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
    }
    if(method == 'POST' && headers['content-length'] === undefined) {
        headers['content-length'] = Buffer.byteLength(body);
    }
    if(typeof body == 'function') {
        cb = body;
        body = undefined;
    }

    var req = http.createClient(8080, 'localhost')
                .request(method, path, headers);
    req.on('response', function(res) {
        res.setEncoding('utf8');
        cb(res);
    });

    if(body) {
        req.write(body, 'utf8');
    }
    req.end();
}
